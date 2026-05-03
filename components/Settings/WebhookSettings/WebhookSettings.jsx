'use client';

import clsx from 'clsx';
import { useState } from 'react';
import styles from './WebhookSettings.module.css';

function WebhookSettings({ sendMatchesDiscord, discordChannelsMatch }) {
  const [discordWebhook, setDiscordWebhook] = useState(sendMatchesDiscord);

  async function saveSendMatches(value) {
    await fetch(`/api/match/webhook?v=${value}`).then((res) => res.json());
  }

  return (
    <div className={styles.section}>
      <div className={styles.subtitle}>Discord Webhooks</div>
      <div className={styles.field}>
        <label className={styles.switch}>
          <input
            type="checkbox"
            id="discordWebhook"
            name="discordWebhook"
            checked={discordWebhook}
            onChange={(e) => {
              setDiscordWebhook(e.target.checked);
              saveSendMatches(e.target.checked);
            }}
          />
          <span className={clsx(styles.slider, styles.round)}></span>
        </label>
        <span>Send match stats to your Discord Channels</span>
      </div>
      <div
        className={styles.inviteBot}
        onClick={() => {
          window.open(
            'https://discord.com/api/oauth2/authorize?client_id=802887045638651974&permissions=8&scope=bot%20applications.commands',
            '_blank'
          );
        }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
          <path d="M9.593 10.971c-.542 0-.969.475-.969 1.055 0 .578.437 1.055.969 1.055.541 0 .968-.477.968-1.055.011-.581-.427-1.055-.968-1.055zm3.468 0c-.542 0-.969.475-.969 1.055 0 .578.437 1.055.969 1.055.541 0 .968-.477.968-1.055-.001-.581-.427-1.055-.968-1.055z" />
          <path d="M17.678 3H4.947A1.952 1.952 0 003 4.957v12.844c0 1.083.874 1.957 1.947 1.957H15.72l-.505-1.759 1.217 1.131 1.149 1.064L19.625 22V4.957A1.952 1.952 0 0017.678 3zM14.01 15.407s-.342-.408-.626-.771c1.244-.352 1.719-1.13 1.719-1.13-.39.256-.76.438-1.093.562a6.679 6.679 0 01-3.838.398 7.944 7.944 0 01-1.396-.41 5.402 5.402 0 01-.693-.321c-.029-.021-.057-.029-.085-.048a.117.117 0 01-.039-.03c-.171-.094-.266-.16-.266-.16s.456.76 1.663 1.121c-.285.36-.637.789-.637.789-2.099-.067-2.896-1.444-2.896-1.444 0-3.059 1.368-5.538 1.368-5.538 1.368-1.027 2.669-.998 2.669-.998l.095.114c-1.71.495-2.499 1.245-2.499 1.245s.21-.114.561-.275c1.016-.446 1.823-.57 2.156-.599.057-.009.105-.019.162-.019a7.756 7.756 0 014.778.893s-.751-.712-2.366-1.206l.133-.152s1.302-.029 2.669.998c0 0 1.368 2.479 1.368 5.538 0-.001-.807 1.376-2.907 1.443z" />
        </svg>
        Invite o!TMD Bot
      </div>
      <div className={styles.description}>
        <div>
          Make sure to have <strong>o!TMD Bot</strong> inside your Discord
          Server to perform the following commands:
        </div>
        <div>
          <span className={styles.command}>/channelmatch add</span>: Enable the
          current channel to receive your matches
        </div>
        <div>
          <span className={styles.command}>/channelmatch remove</span>: Remove
          the current channel from receiving your matches
        </div>
      </div>
      <div className={styles.mintitle}>Discord Channels</div>
      <div className={styles.list}>
        {discordChannelsMatch
          ? JSON.parse(discordChannelsMatch).map((channel, index) => (
              <div
                className={styles.item}
                key={index}
                onClick={() =>
                  window.open(
                    `discord://discord.com/channels/${channel.ServerID}/${channel.ChannelID}`,
                    '_blank'
                  )
                }
              >
                <div className={styles.server}>{channel.ServerName}</div>
                <span>|</span>
                <div className={styles.channel}>#{channel.ChannelName}</div>
              </div>
            ))
          : null}
      </div>
    </div>
  );
}

export default WebhookSettings;
