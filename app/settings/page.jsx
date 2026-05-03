import ApikeySettings from '@/components/Settings/ApikeySettings/ApikeySettings';
import WebhookSettings from '@/components/Settings/WebhookSettings/WebhookSettings';
import { supabaseAdmin } from '@/config/supabaseClient';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from 'pages/api/auth/[...nextauth]';
import styles from './settings.module.css';

async function getSettings(sessionID) {
  var { data, error } = await supabaseAdmin
    .from('users')
    .select('UUID,api_key,sendMatchesDiscord,discordChannelsMatch')
    .eq('ID', sessionID);

  if (error) {
    return error;
  }

  return data[0];
}

export default async function Settings() {
  const session = await getServerSession(authOptions);

  session === null && redirect('/');

  const settings = await getSettings(session.id);

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.title}>Account Settings</div>
      <ApikeySettings
        sessionID={session.id}
        api_key={settings.api_key}
        UUID={settings.UUID}
      />
      <WebhookSettings
        sendMatchesDiscord={settings.sendMatchesDiscord}
        discordChannelsMatch={settings.discordChannelsMatch}
      />
    </div>
  );
}
