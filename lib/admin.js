import { supabaseAdmin } from '@/config/supabaseClient';

export const PROPOSAL_WEBHOOK = 'proposal_webhook';
const DISCORD_WEBHOOK = /^https:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/;
const WEBHOOK_TIMEOUT_MS = 5000;

// Admins are listed by osu! ID in ADMIN_OSU_IDS (comma-separated), so access never depends on the database.
export function isAdmin(osuId) {
  const admins = (process.env.ADMIN_OSU_IDS ?? '').split(',').map((id) => id.trim()).filter(Boolean);
  return osuId != null && admins.includes(String(osuId));
}

export const isDiscordWebhook = (url) => DISCORD_WEBHOOK.test(url);

export async function getAdminSetting(key) {
  const { data, error } = await supabaseAdmin.from('admin_settings').select('value').eq('key', key).maybeSingle();
  if (error) throw error;
  return data?.value ?? '';
}

export async function setAdminSetting(key, value) {
  const { error } = value
    ? await supabaseAdmin.from('admin_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    : await supabaseAdmin.from('admin_settings').delete().eq('key', key);
  if (error) throw error;
}

// Returns false when no webhook is set or Discord refuses it; a proposal is saved either way.
export async function notifyProposal({ acronym, name, link }, osuId, test = false) {
  const webhook = await getAdminSetting(PROPOSAL_WEBHOOK);
  if (!isDiscordWebhook(webhook)) return false;

  const fields = [
    { name: 'Acronym', value: acronym, inline: true },
    { name: 'Name', value: name, inline: true },
  ];
  if (link) fields.push({ name: 'Link', value: link });

  const response = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    body: JSON.stringify({
      allowed_mentions: { parse: [] },
      embeds: [
        {
          title: test ? 'Test: tournament proposal' : 'New tournament proposal',
          description: `Proposed from the o!TMD app by [osu! user ${osuId}](https://osu.ppy.sh/users/${osuId}).`,
          color: 0x00ffff,
          fields,
          thumbnail: { url: `https://a.ppy.sh/${osuId}` },
          footer: { text: 'Review it in tournament_proposals, then add it from /tournaments/add' },
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  }).catch(() => null);
  return Boolean(response?.ok);
}
