import { supabaseAdmin } from '@/config/supabaseClient';
import { extractFonts, parseAppSettings } from '@/lib/appSettings';
import { clientIp, consumeRateLimit, readJsonBody } from '@/lib/osuOAuthBroker';
import { bearerToken, osuUserId } from '@/lib/osuIdentity';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 32 * 1024;
const NO_STORE = { 'Cache-Control': 'no-store' };
const reply = (status, body, headers = {}) => NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } });

// Returns the account, or the response to send instead.
async function authenticate(request) {
  const now = Date.now();
  const ipRetryAfter = consumeRateLimit(`settings-ip:${clientIp(request)}`, now);
  if (ipRetryAfter) return { failure: reply(429, { error: 'rate_limited' }, { 'Retry-After': String(ipRetryAfter) }) };

  let userId;
  try {
    userId = await osuUserId(bearerToken(request), now);
  } catch {
    return { failure: reply(502, { error: 'upstream_unavailable' }) };
  }
  if (!userId) return { failure: reply(401, { error: 'invalid_token' }) };

  const userRetryAfter = consumeRateLimit(`settings-user:${userId}`, now);
  if (userRetryAfter) return { failure: reply(429, { error: 'rate_limited' }, { 'Retry-After': String(userRetryAfter) }) };
  return { userId };
}

export async function GET(request) {
  const { userId, failure } = await authenticate(request);
  if (failure) return failure;

  try {
    const { data, error } = await supabaseAdmin.from('app_settings').select('settings').eq('osu_user_id', userId).maybeSingle();
    if (error) throw error;
    return reply(200, { settings: data?.settings ?? null });
  } catch {
    console.error('App settings read failed');
    return reply(500, { error: 'Internal server error' });
  }
}

export async function PUT(request) {
  const { userId, failure } = await authenticate(request);
  if (failure) return failure;

  try {
    const settings = parseAppSettings(await readJsonBody(request, MAX_BODY_BYTES));
    if (!settings) return reply(400, { error: 'invalid_settings' });

    const { error } = await supabaseAdmin
      .from('app_settings')
      .upsert({ osu_user_id: userId, settings, fonts: extractFonts(settings), updated_at: new Date().toISOString() }, { onConflict: 'osu_user_id' });
    if (error) throw error;
    return reply(200, { message: 'saved' });
  } catch {
    console.error('App settings write failed');
    return reply(500, { error: 'Internal server error' });
  }
}
