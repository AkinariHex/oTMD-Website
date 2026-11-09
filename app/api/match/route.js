import { supabaseAdmin } from '@/config/supabaseClient';
import { validateApiKey } from '@/lib/auth';
import {
  buildDiscordMessage,
  parseDiscordChannels,
  parseMatchExport,
  sendToDiscordChannels,
  toMatchRow,
} from '@/lib/matchExport';
import { clientIp, consumeRateLimit, readJsonBody } from '@/lib/osuOAuthBroker';
import { NextResponse } from 'next/server';

const MAX_BODY_BYTES = 64 * 1024;

function tooManyRequests(retryAfter) {
  return NextResponse.json(
    { error: 'rate_limited' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}

async function deliverToDiscord(match, ownerId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('sendMatchesDiscord,discordChannelsMatch')
      .eq('ID', ownerId)
      .single();

    if (error) throw error;
    if (String(data.sendMatchesDiscord) !== 'true') return 'skipped';

    return await sendToDiscordChannels(
      parseDiscordChannels(data.discordChannelsMatch),
      buildDiscordMessage(match, ownerId)
    );
  } catch {
    console.error('Match export: Discord delivery failed');
    return 'failed';
  }
}

export async function POST(request) {
  const now = Date.now();
  const ipRetryAfter = consumeRateLimit(`match-ip:${clientIp(request)}`, now);
  if (ipRetryAfter) return tooManyRequests(ipRetryAfter);

  try {
    const auth = await validateApiKey(request);
    if (auth.error) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const ownerId = auth.user.ID;
    const userRetryAfter = consumeRateLimit(`match-user:${ownerId}`, now);
    if (userRetryAfter) return tooManyRequests(userRetryAfter);

    const match = parseMatchExport(await readJsonBody(request, MAX_BODY_BYTES));
    if (!match) {
      return NextResponse.json({ error: 'Invalid match data' }, { status: 400 });
    }

    // ponytail: check-then-insert, two simultaneous exports can both pass. Add a unique (owner, matchID) index if that happens.
    const existing = await supabaseAdmin
      .from('matches')
      .select('matchID')
      .eq('owner', ownerId)
      .eq('matchID', match.matchID)
      .limit(1);

    if (existing.error) throw existing.error;
    if (existing.data.length > 0) {
      return NextResponse.json({ message: 'already saved' });
    }

    const { error } = await supabaseAdmin.from('matches').insert([toMatchRow(match, ownerId)]);
    if (error) throw error;

    const discord = await deliverToDiscord(match, ownerId);
    return NextResponse.json({ message: 'saved', discord }, { status: 201 });
  } catch {
    console.error('Match export failed');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
