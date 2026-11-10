import { supabaseAdmin } from '@/config/supabaseClient';
import { validateApiKey } from '@/lib/auth';
import { summarizeStats } from '@/lib/matchStats';
import { clientIp, consumeRateLimit } from '@/lib/osuOAuthBroker';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ponytail: reads up to this many rows per request, move the totals into SQL if accounts ever exceed it.
const MAX_MATCHES = 5000;
const RECENT_ROOMS = 5;
const NO_STORE = { 'Cache-Control': 'no-store' };

function tooManyRequests(retryAfter) {
  return NextResponse.json({ error: 'rate_limited' }, { status: 429, headers: { ...NO_STORE, 'Retry-After': String(retryAfter) } });
}

export async function GET(request) {
  const now = Date.now();
  const ipRetryAfter = consumeRateLimit(`stats-ip:${clientIp(request)}`, now);
  if (ipRetryAfter) return tooManyRequests(ipRetryAfter);

  try {
    const auth = await validateApiKey(request);
    if (auth.error) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401, headers: NO_STORE });
    }

    // The account comes only from the key: no parameter can select another user.
    const ownerId = auth.user.ID;
    const userRetryAfter = consumeRateLimit(`stats-user:${ownerId}`, now);
    if (userRetryAfter) return tooManyRequests(userRetryAfter);

    const [matches, rooms] = await Promise.all([
      supabaseAdmin
        .from('matches')
        .select('owner,matchID,matchType,stage,tournament,scores,players,teams,startTime')
        .eq('owner', ownerId)
        .order('startTime', { ascending: false })
        .limit(MAX_MATCHES),
      supabaseAdmin
        .from('ranked_rooms')
        .select('created_by,room_id,ended_at,total_rounds,players')
        .eq('created_by', ownerId)
        .order('ended_at', { ascending: false })
        .limit(RECENT_ROOMS),
    ]);

    if (matches.error) throw matches.error;
    if (rooms.error) throw rooms.error;

    return NextResponse.json(summarizeStats(matches.data, rooms.data, ownerId), { headers: NO_STORE });
  } catch {
    console.error('Match stats failed');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: NO_STORE });
  }
}
