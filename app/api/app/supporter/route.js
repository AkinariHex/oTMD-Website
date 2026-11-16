import { supabaseAdmin } from '@/config/supabaseClient';
import { clientIp, consumeRateLimit } from '@/lib/osuOAuthBroker';
import { bearerToken, osuUserId } from '@/lib/osuIdentity';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const reply = (status, body, headers = {}) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });

// The desktop app's own donation summary; null when the account never donated.
export async function GET(request) {
  const now = Date.now();
  const ipRetryAfter = consumeRateLimit(`supporter-ip:${clientIp(request)}`, now);
  if (ipRetryAfter) return reply(429, { error: 'rate_limited' }, { 'Retry-After': String(ipRetryAfter) });

  let userId;
  try {
    userId = await osuUserId(bearerToken(request), now);
  } catch {
    return reply(502, { error: 'upstream_unavailable' });
  }
  if (!userId) return reply(401, { error: 'invalid_token' });

  try {
    const { data, error } = await supabaseAdmin
      .from('supporters')
      .select('donations, total, last_donated_at')
      .eq('osu_user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return reply(200, {
      supporter: data ? { donations: data.donations, total: Number(data.total), lastDonatedAt: data.last_donated_at } : null,
    });
  } catch {
    console.error('Supporter read failed');
    return reply(500, { error: 'Internal server error' });
  }
}
