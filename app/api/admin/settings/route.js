import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PROPOSAL_WEBHOOK, isAdmin, isDiscordWebhook, notifyProposal, setAdminSetting } from '@/lib/admin';
import { readJsonBody } from '@/lib/osuOAuthBroker';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const reply = (status, body) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

async function adminId() {
  const session = await getServerSession(authOptions);
  return isAdmin(session?.id) ? session.id : null;
}

// readJsonBody only accepts application/json, which a cross-site form cannot send without a refused preflight.
export async function PUT(request) {
  if (!(await adminId())) return reply(404, { error: 'not_found' });

  const body = await readJsonBody(request);
  const webhook = typeof body?.proposalWebhook === 'string' ? body.proposalWebhook.trim() : null;
  if (webhook === null || (webhook && !isDiscordWebhook(webhook))) return reply(400, { error: 'invalid_webhook' });

  try {
    await setAdminSetting(PROPOSAL_WEBHOOK, webhook);
    return reply(200, { message: 'saved' });
  } catch {
    console.error('Admin settings write failed');
    return reply(500, { error: 'Internal server error' });
  }
}

export async function POST(request) {
  const id = await adminId();
  if (!id) return reply(404, { error: 'not_found' });
  if ((await readJsonBody(request))?.action !== 'test') return reply(400, { error: 'invalid_action' });

  try {
    const sent = await notifyProposal({ acronym: 'TEST', name: 'Test Tournament', link: 'https://otmd.app' }, id, true);
    return sent ? reply(200, { message: 'sent' }) : reply(502, { error: 'webhook_failed' });
  } catch {
    return reply(500, { error: 'Internal server error' });
  }
}
