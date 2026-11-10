import { supabaseAdmin } from '@/config/supabaseClient';
import { validateApiKey } from '@/lib/auth';
import { summarizeRecent, withBanners } from '@/lib/matchStats';
import { clientIp, consumeRateLimit } from '@/lib/osuOAuthBroker';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;
const OFFSET_PATTERN = /^\d{1,6}$/;
const NO_STORE = { 'Cache-Control': 'no-store' };

function tooManyRequests(retryAfter) {
  return NextResponse.json({ error: 'rate_limited' }, { status: 429, headers: { ...NO_STORE, 'Retry-After': String(retryAfter) } });
}

export async function GET(request) {
  const now = Date.now();
  const ipRetryAfter = consumeRateLimit(`recent-ip:${clientIp(request)}`, now);
  if (ipRetryAfter) return tooManyRequests(ipRetryAfter);

  const offsetParam = new URL(request.url).searchParams.get('offset') ?? '0';
  if (!OFFSET_PATTERN.test(offsetParam)) {
    return NextResponse.json({ error: 'invalid_offset' }, { status: 400, headers: NO_STORE });
  }
  const offset = Number(offsetParam);

  try {
    const auth = await validateApiKey(request);
    if (auth.error) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401, headers: NO_STORE });
    }

    // The account comes only from the key: no parameter can select another user.
    const ownerId = auth.user.ID;
    const userRetryAfter = consumeRateLimit(`recent-user:${ownerId}`, now);
    if (userRetryAfter) return tooManyRequests(userRetryAfter);

    // One row past the page says whether another page exists. matchID keeps the order stable between pages.
    const rows = await supabaseAdmin
      .from('matches')
      .select('owner,matchID,matchType,stage,tournament,scores,players,teams,startTime')
      .eq('owner', ownerId)
      .neq('stage', 'Qualifiers')
      .order('startTime', { ascending: false, nullsFirst: false })
      .order('matchID', { ascending: false })
      .range(offset, offset + PAGE_SIZE);

    if (rows.error) throw rows.error;

    const { matches, hasMore } = summarizeRecent(rows.data, ownerId, PAGE_SIZE);
    const acronyms = [...new Set(matches.map((match) => match.tournament.acronym).filter(Boolean))];
    if (acronyms.length === 0) return NextResponse.json({ matches, hasMore }, { headers: NO_STORE });

    // A banner is decoration: failing to read one must not take the list down with it.
    const tournaments = await supabaseAdmin.from('tournaments').select('acronym,name,banner').in('acronym', acronyms);
    return NextResponse.json({ matches: withBanners(matches, tournaments.error ? [] : tournaments.data), hasMore }, { headers: NO_STORE });
  } catch {
    console.error('Recent matches failed');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: NO_STORE });
  }
}
