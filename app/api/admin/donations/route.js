import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/config/supabaseClient';
import { isAdmin } from '@/lib/admin';
import { readJsonBody } from '@/lib/osuOAuthBroker';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const OSU_ID = /^(?:https:\/\/osu\.ppy\.sh\/users\/)?(\d{1,10})\/?$/;
const AMOUNT = /^\d{1,6}(?:[.,]\d{1,2})?$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_NOTE_LENGTH = 200;
const reply = (status, body) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

async function isAdminSession() {
  const session = await getServerSession(authOptions);
  return isAdmin(session?.id);
}

// Accepts an osu! ID or profile URL, and an amount with a dot or comma.
function parseDonation(body) {
  const osuId = typeof body?.osuUser === 'string' ? body.osuUser.trim().match(OSU_ID)?.[1] : null;
  const amount = typeof body?.amount === 'string' ? body.amount.trim() : '';
  const donatedAt = typeof body?.donatedAt === 'string' ? body.donatedAt : '';
  const note = typeof body?.note === 'string' ? body.note.trim() : '';
  if (!osuId || !AMOUNT.test(amount) || Number(amount.replace(',', '.')) <= 0) return null;
  if (!DATE.test(donatedAt) || Number.isNaN(Date.parse(donatedAt)) || note.length > MAX_NOTE_LENGTH) return null;
  return { osu_user_id: Number(osuId), amount: amount.replace(',', '.'), donated_at: donatedAt, note: note || null };
}

export async function POST(request) {
  if (!(await isAdminSession())) return reply(404, { error: 'not_found' });

  const donation = parseDonation(await readJsonBody(request));
  if (!donation) return reply(400, { error: 'invalid_donation' });

  try {
    const { error } = await supabaseAdmin.from('donations').insert(donation);
    if (error) throw error;
    return reply(200, { message: 'added' });
  } catch {
    console.error('Donation write failed');
    return reply(500, { error: 'Internal server error' });
  }
}

export async function DELETE(request) {
  if (!(await isAdminSession())) return reply(404, { error: 'not_found' });

  const id = (await readJsonBody(request))?.id;
  if (!Number.isSafeInteger(id) || id <= 0) return reply(400, { error: 'invalid_id' });

  try {
    const { error } = await supabaseAdmin.from('donations').delete().eq('id', id);
    if (error) throw error;
    return reply(200, { message: 'deleted' });
  } catch {
    console.error('Donation delete failed');
    return reply(500, { error: 'Internal server error' });
  }
}
