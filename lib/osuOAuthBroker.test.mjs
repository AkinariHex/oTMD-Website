// Run: node --test lib/osuOAuthBroker.test.mjs
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { beforeEach, test } from 'node:test';
import {
  exchangeAuthorizationCode,
  finishDesktopLogin,
  refreshAccessToken,
  startDesktopLogin,
} from './osuOAuthBroker.js';

const SITE_CALLBACK = 'https://otmd.app/api/auth/desktop/callback';
const SECRET = 'test-client-secret';
const TOKENS = { access_token: 'AT', refresh_token: 'RT', expires_in: 86400, token_type: 'Bearer' };
const STATE = 'S'.repeat(43);
const VERIFIER = 'v'.repeat(43);
const CHALLENGE = createHash('sha256').update(VERIFIER).digest('base64url');

let calls;
let upstream;
let nextIp = 0;

globalThis.fetch = async (url, init) => {
  calls.push({ url, init });
  return upstream();
};

const osuJson = (status, body) => () => new Response(JSON.stringify(body), { status });
const get = (path) => new Request(`https://otmd.app${path}`);

function post(body, { contentType = 'application/json', ip } = {}) {
  return new Request('https://otmd.test/api', {
    method: 'POST',
    headers: {
      'content-type': contentType,
      'x-forwarded-for': ip ?? `10.0.0.${(nextIp += 1)}`,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function loginCallback(query) {
  return new URL(finishDesktopLogin(get(`/api/auth/desktop/callback?${query}`)).headers.get('location'));
}

function validCode() {
  const url = loginCallback(`code=C&state=${STATE}.${CHALLENGE}`);
  return { code: 'C', code_binding: url.searchParams.get('code_binding'), code_verifier: VERIFIER };
}

const validRefresh = { refresh_token: 'OLD' };

async function expectError(response, status, error) {
  assert.equal(response.status, status);
  assert.deepEqual(await response.json(), { error });
  assert.equal(response.headers.get('cache-control'), 'no-store');
}

beforeEach(() => {
  calls = [];
  upstream = osuJson(200, TOKENS);
  process.env.OSU_CLIENT_ID = '123';
  process.env.OSU_CLIENT_SECRET = SECRET;
});

test('login redirects to osu! with the site callback and no secret', () => {
  const response = startDesktopLogin(
    get(`/api/auth/desktop/login?state=${STATE}&code_challenge=${CHALLENGE}&redirect_uri=https://evil.test`)
  );
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('cache-control'), 'no-store');

  const location = response.headers.get('location');
  assert.ok(!location.includes(SECRET));
  const url = new URL(location);
  assert.equal(url.origin + url.pathname, 'https://osu.ppy.sh/oauth/authorize');
  assert.deepEqual(Object.fromEntries(url.searchParams), {
    client_id: '123',
    redirect_uri: SITE_CALLBACK,
    response_type: 'code',
    scope: 'public identify',
    state: `${STATE}.${CHALLENGE}`,
  });
});

test('login and callback reject malformed state', () => {
  const badLogins = ['', `state=short&code_challenge=${CHALLENGE}`, `state=${STATE}`];
  for (const query of badLogins) {
    assert.equal(startDesktopLogin(get(`/api/auth/desktop/login?${query}`)).status, 400);
  }

  const badStates = ['', 'x', STATE, `${STATE}.${CHALLENGE}.extra`, `${STATE}.short`];
  for (const state of badStates) {
    const response = finishDesktopLogin(get(`/api/auth/desktop/callback?code=C&state=${state}`));
    assert.equal(response.status, 400);
    assert.equal(response.headers.get('location'), null);
  }
});

test('callback only ever redirects to the local app and hides the challenge', () => {
  const url = loginCallback(`code=C&state=${STATE}.${CHALLENGE}&redirect_uri=https://evil.test`);
  assert.equal(url.origin + url.pathname, 'http://127.0.0.1:21086/oauth/callback');
  assert.equal(url.searchParams.get('state'), STATE);
  assert.equal(url.searchParams.get('code'), 'C');
  assert.ok(!url.href.includes(CHALLENGE));
  assert.ok(!url.href.includes(SECRET));
});

test('callback forwards only known osu! errors', () => {
  const denied = loginCallback(`error=access_denied&state=${STATE}.${CHALLENGE}`);
  assert.equal(denied.searchParams.get('error'), 'access_denied');
  assert.equal(denied.searchParams.get('code'), null);

  const other = loginCallback(`error=%3Cscript%3E&state=${STATE}.${CHALLENGE}`);
  assert.equal(other.searchParams.get('error'), 'server_error');
});

test('code exchange forwards a hardcoded grant and returns only token fields', async () => {
  upstream = osuJson(200, { ...TOKENS, leaked: 'nope' });
  const response = await exchangeAuthorizationCode(
    post({
      ...validCode(),
      grant_type: 'client_credentials',
      client_secret: 'attacker',
      redirect_uri: 'https://evil.test/cb',
    })
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), TOKENS);

  const { url, init } = calls[0];
  assert.equal(url, 'https://osu.ppy.sh/oauth/token');
  assert.equal(init.redirect, 'error');
  assert.equal(init.cache, 'no-store');
  assert.deepEqual(Object.fromEntries(init.body), {
    client_id: '123',
    client_secret: SECRET,
    grant_type: 'authorization_code',
    code: 'C',
    redirect_uri: SITE_CALLBACK,
  });
});

test('a code cannot be redeemed without its verifier and binding', async () => {
  const good = validCode();
  const attempts = [
    { ...good, code_verifier: 'w'.repeat(43) },
    { ...good, code_binding: 'x'.repeat(43) },
    { ...good, code: 'OTHER' },
    { code: good.code, code_binding: good.code_binding },
    { ...good, code_verifier: ['v'.repeat(43)] },
  ];

  for (const attempt of attempts) {
    await expectError(await exchangeAuthorizationCode(post(attempt)), 400, 'invalid_request');
  }
  assert.equal(calls.length, 0);
});

test('refresh forwards a hardcoded grant', async () => {
  const response = await refreshAccessToken(post({ ...validRefresh, grant_type: 'password' }));
  assert.equal(response.status, 200);
  assert.deepEqual(Object.fromEntries(calls[0].init.body), {
    client_id: '123',
    client_secret: SECRET,
    grant_type: 'refresh_token',
    refresh_token: 'OLD',
  });
});

test('bad requests never reach osu!', async () => {
  const bad = [
    [refreshAccessToken, post({})],
    [refreshAccessToken, post('not json')],
    [refreshAccessToken, post('null')],
    [refreshAccessToken, post('"text"')],
    [refreshAccessToken, post(validRefresh, { contentType: 'text/plain' })],
    [refreshAccessToken, post({ refresh_token: 'x'.repeat(9000) })],
  ];

  for (const [handler, request] of bad) {
    await expectError(await handler(request), 400, 'invalid_request');
  }
  assert.equal(calls.length, 0);
});

test('osu! rejections map to invalid_grant only when unambiguous', async () => {
  upstream = osuJson(400, { error: 'invalid_grant', hint: 'secret detail' });
  await expectError(await refreshAccessToken(post(validRefresh)), 400, 'invalid_grant');
  await expectError(await exchangeAuthorizationCode(post(validCode())), 400, 'invalid_grant');

  upstream = osuJson(400, { error: 'invalid_request' });
  await expectError(await exchangeAuthorizationCode(post(validCode())), 400, 'invalid_grant');
  await expectError(await refreshAccessToken(post(validRefresh)), 502, 'upstream_unavailable');
});

test('temporary and server-side failures never look like invalid_grant', async () => {
  const failures = [
    osuJson(401, { error: 'invalid_client' }),
    osuJson(429, { error: 'too_many_requests' }),
    osuJson(500, { error: 'invalid_grant' }),
    osuJson(200, { access_token: 'AT' }),
    osuJson(200, null),
    () => new Response('<html>down</html>', { status: 503 }),
    () => {
      throw new Error('network down');
    },
  ];

  for (const failure of failures) {
    upstream = failure;
    await expectError(await refreshAccessToken(post(validRefresh)), 502, 'upstream_unavailable');
  }
});

test('missing server credentials are retryable and do not call osu!', async () => {
  const body = validCode();
  delete process.env.OSU_CLIENT_SECRET;
  await expectError(await refreshAccessToken(post(validRefresh)), 502, 'upstream_unavailable');
  await expectError(await exchangeAuthorizationCode(post(body)), 502, 'upstream_unavailable');
  assert.equal(calls.length, 0);
});

test('rate limit applies per real peer and ignores spoofed entries', async () => {
  const peer = '198.51.100.7';
  for (let i = 0; i < 30; i += 1) {
    const response = await refreshAccessToken(post(validRefresh, { ip: `1.1.1.${i}, ${peer}` }));
    assert.equal(response.status, 200);
  }

  const limited = await refreshAccessToken(post(validRefresh, { ip: `9.9.9.9, ${peer}` }));
  await expectError(limited, 429, 'rate_limited');
  assert.ok(Number(limited.headers.get('retry-after')) > 0);
  assert.equal(calls.length, 30);

  const other = await refreshAccessToken(post(validRefresh, { ip: '198.51.100.8' }));
  assert.equal(other.status, 200);
});

test('failures log no credentials or tokens', async () => {
  const logged = [];
  const original = console.error;
  console.error = (...args) => logged.push(args.join(' '));

  try {
    upstream = osuJson(500, { echoed: SECRET });
    await refreshAccessToken(post({ refresh_token: 'SENSITIVE' }));
    upstream = () => {
      throw new Error(`failed with ${SECRET}`);
    };
    await refreshAccessToken(post({ refresh_token: 'SENSITIVE' }));
  } finally {
    console.error = original;
  }

  assert.equal(logged.length, 2);
  assert.ok(logged.every((line) => !line.includes(SECRET) && !line.includes('SENSITIVE')));
});
