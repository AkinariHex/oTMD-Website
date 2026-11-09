import { createHash, createHmac, timingSafeEqual } from 'crypto';

const OSU_AUTHORIZE_URL = 'https://osu.ppy.sh/oauth/authorize';
const OSU_TOKEN_URL = 'https://osu.ppy.sh/oauth/token';
const SITE_CALLBACK_URI = 'https://otmd.app/api/auth/desktop/callback';
// A literal loopback IP cannot be redirected elsewhere through DNS or a hosts file (RFC 8252).
const DESKTOP_CALLBACK_URL = 'http://127.0.0.1:21086/oauth/callback';
const BASE64URL_32_BYTES = /^[A-Za-z0-9_-]{43}$/;
const MAX_BODY_BYTES = 8 * 1024;
const UPSTREAM_TIMEOUT_MS = 10_000;
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;
const MAX_TRACKED_IPS = 10_000;

// ponytail: per-instance fixed window, so limits are per serverless instance. Add a WAF rule or shared store if the routes get abused.
const buckets = new Map();

export function consumeRateLimit(ip, now) {
  // Entries are inserted with a constant window, so Map order is expiry order.
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt > now && buckets.size < MAX_TRACKED_IPS) break;
    buckets.delete(key);
  }

  let bucket = buckets.get(ip);
  if (!bucket) {
    bucket = { count: 0, resetAt: now + RATE_WINDOW_MS };
    buckets.set(ip, bucket);
  }

  bucket.count += 1;
  return bucket.count > RATE_LIMIT ? Math.ceil((bucket.resetAt - now) / 1000) : 0;
}

// The platform proxy appends the real peer last. Earlier entries are caller-controlled.
export function clientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',').pop().trim() || 'unknown';
}

function reply(status, body, headers = {}) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

const upstreamUnavailable = () => reply(502, { error: 'upstream_unavailable' });

export async function readJsonBody(request, maxBytes = MAX_BODY_BYTES) {
  // Browsers cannot send this content type cross-origin without a preflight, which has no CORS approval here.
  const contentType = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json' || !request.body) return null;

  try {
    const reader = request.body.getReader();
    const chunks = [];
    let size = 0;

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }

    const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    return typeof body === 'object' ? body : null;
  } catch {
    return null;
  }
}

const isNonEmptyString = (value) => typeof value === 'string' && value.length > 0;

const isBase64Url32 = (value) => isNonEmptyString(value) && BASE64URL_32_BYTES.test(value);

// osu! has no PKCE, so the site binds each code to the app's challenge. Whoever catches the
// loopback redirect still cannot redeem the code without the verifier held by the app.
function bindCode(secret, code, challenge) {
  return createHmac('sha256', secret)
    .update(`otmd-desktop-code-binding\0${challenge}\0${code}`)
    .digest('base64url');
}

function isSameString(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function authorizationCodeGrant(body) {
  const { code, code_binding: binding, code_verifier: verifier } = body;
  if (!isNonEmptyString(code) || !isNonEmptyString(binding) || !isBase64Url32(verifier)) return null;

  // Without a secret forwardToOsu answers 502, so a misconfiguration stays retryable.
  const secret = process.env.OSU_CLIENT_SECRET;
  if (secret) {
    const challenge = createHash('sha256').update(verifier).digest('base64url');
    if (!isSameString(binding, bindCode(secret, code, challenge))) return null;
  }

  return { grant_type: 'authorization_code', code, redirect_uri: SITE_CALLBACK_URI };
}

function refreshTokenGrant(body) {
  if (!isNonEmptyString(body.refresh_token)) return null;
  return { grant_type: 'refresh_token', refresh_token: body.refresh_token };
}

// osu! answers a garbage or foreign code with invalid_request, and a garbage refresh token with
// invalid_grant. Anything else on refresh is ambiguous and must never end a streamer's session.
function isRejectedGrant(status, error, grantType) {
  if (status !== 400) return false;
  return error === 'invalid_grant' || (grantType === 'authorization_code' && error === 'invalid_request');
}

function isTokenResponse(data) {
  return (
    isNonEmptyString(data?.access_token) &&
    isNonEmptyString(data?.refresh_token) &&
    Number.isFinite(data?.expires_in) &&
    data.expires_in > 0 &&
    isNonEmptyString(data?.token_type)
  );
}

async function forwardToOsu(grant) {
  const clientId = process.env.OSU_CLIENT_ID;
  const clientSecret = process.env.OSU_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('osu! OAuth broker: credentials are not configured');
    return upstreamUnavailable();
  }

  let status;
  let data;

  try {
    const upstream = await fetch(OSU_TOKEN_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, ...grant }),
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    status = upstream.status;
    data = await upstream.json();
  } catch {
    console.error(`osu! OAuth broker: upstream failure, status ${status ?? 'none'}`);
    return upstreamUnavailable();
  }

  if (status === 200 && isTokenResponse(data)) {
    const { access_token, refresh_token, expires_in, token_type } = data;
    return reply(200, { access_token, refresh_token, expires_in, token_type });
  }

  if (isRejectedGrant(status, data?.error, grant.grant_type)) {
    return reply(400, { error: 'invalid_grant' });
  }

  console.error(`osu! OAuth broker: unexpected upstream status ${status}`);
  return upstreamUnavailable();
}

async function handle(request, toGrant) {
  const retryAfter = consumeRateLimit(clientIp(request), Date.now());
  if (retryAfter) {
    return reply(429, { error: 'rate_limited' }, { 'Retry-After': String(retryAfter) });
  }

  const body = await readJsonBody(request);
  const grant = body && toGrant(body);
  if (!grant) return reply(400, { error: 'invalid_request' });

  return forwardToOsu(grant);
}

function redirectBrowser(location) {
  return new Response(null, {
    status: 302,
    headers: { Location: String(location), 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
  });
}

function plainError(status, message) {
  return new Response(message, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export function startDesktopLogin(request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');
  const challenge = searchParams.get('code_challenge');

  if (!isBase64Url32(state) || !isBase64Url32(challenge)) {
    return plainError(400, 'Invalid login request. Start again from the oTMD app.');
  }

  const clientId = process.env.OSU_CLIENT_ID;
  if (!clientId) {
    console.error('osu! OAuth broker: credentials are not configured');
    return plainError(503, 'Login is temporarily unavailable.');
  }

  const authorizeUrl = new URL(OSU_AUTHORIZE_URL);
  authorizeUrl.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: SITE_CALLBACK_URI,
    response_type: 'code',
    scope: 'public identify',
    state: `${state}.${challenge}`,
  }).toString();

  return redirectBrowser(authorizeUrl);
}

export function finishDesktopLogin(request) {
  const { searchParams } = new URL(request.url);
  const [state, challenge, extra] = (searchParams.get('state') ?? '').split('.');

  if (extra !== undefined || !isBase64Url32(state) || !isBase64Url32(challenge)) {
    return plainError(400, 'Invalid login request. Start again from the oTMD app.');
  }

  const code = searchParams.get('code');
  const secret = process.env.OSU_CLIENT_SECRET;
  const desktopUrl = new URL(DESKTOP_CALLBACK_URL);
  desktopUrl.searchParams.set('state', state);

  if (code && secret) {
    desktopUrl.searchParams.set('code', code);
    desktopUrl.searchParams.set('code_binding', bindCode(secret, code, challenge));
  } else {
    desktopUrl.searchParams.set(
      'error',
      searchParams.get('error') === 'access_denied' ? 'access_denied' : 'server_error'
    );
  }

  return redirectBrowser(desktopUrl);
}

export const exchangeAuthorizationCode = (request) => handle(request, authorizationCodeGrant);
export const refreshAccessToken = (request) => handle(request, refreshTokenGrant);
