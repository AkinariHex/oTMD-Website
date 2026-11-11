import { supabaseAdmin } from '@/config/supabaseClient';
import { notifyProposal } from '@/lib/admin';
import { clientIp, consumeRateLimit, readJsonBody } from '@/lib/osuOAuthBroker';
import { bearerToken, osuUserId } from '@/lib/osuIdentity';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 4 * 1024;
const ACRONYM = /^[A-Za-z0-9][A-Za-z0-9 _.-]{0,15}$/;
const MAX_NAME_LENGTH = 80;
const MAX_LINK_LENGTH = 300;
const reply = (status, body, headers = {}) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });

function parseProposal(body) {
  const acronym = typeof body?.acronym === 'string' ? body.acronym.trim() : '';
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const link = typeof body?.link === 'string' ? body.link.trim() : '';
  if (!ACRONYM.test(acronym) || !name || name.length > MAX_NAME_LENGTH || link.length > MAX_LINK_LENGTH) return null;
  if (link) {
    try {
      if (new URL(link).protocol !== 'https:') return null;
    } catch {
      return null;
    }
  }
  return { acronym, name, link: link || null };
}

// Proposals land in their own table and never reach the live lookup until a moderator adds the tournament.
export async function POST(request) {
  const now = Date.now();
  const ipRetryAfter = consumeRateLimit(`proposal-ip:${clientIp(request)}`, now);
  if (ipRetryAfter) return reply(429, { error: 'rate_limited' }, { 'Retry-After': String(ipRetryAfter) });

  let userId;
  try {
    userId = await osuUserId(bearerToken(request), now);
  } catch {
    return reply(502, { error: 'upstream_unavailable' });
  }
  if (!userId) return reply(401, { error: 'invalid_token' });

  const proposal = parseProposal(await readJsonBody(request, MAX_BODY_BYTES));
  if (!proposal) return reply(400, { error: 'invalid_proposal' });

  try {
    const { data: listed, error: lookupError } = await supabaseAdmin
      .from(process.env.NEXT_PUBLIC_DB_TOURNAMENTS)
      .select('acronym')
      .eq('isActive', true)
      .ilike('acronym', proposal.acronym.replace(/[\\%_]/g, '\\$&'))
      .limit(1);
    if (lookupError) throw lookupError;
    if (listed.length) return reply(409, { error: 'already_listed' });

    const { error } = await supabaseAdmin
      .from('tournament_proposals')
      .upsert({ osu_user_id: userId, ...proposal, created_at: new Date().toISOString() }, { onConflict: 'osu_user_id,acronym' });
    if (error) throw error;
    // The proposal is already saved, so a missing or broken webhook never fails the request.
    await notifyProposal(proposal, userId).catch(() => console.error('Proposal webhook failed'));
    return reply(200, { message: 'proposed' });
  } catch {
    console.error('Tournament proposal failed');
    return reply(500, { error: 'Internal server error' });
  }
}
