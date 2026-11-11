'use client';

import { useState } from 'react';
import styles from './ProposalWebhook.module.css';

const MESSAGES = {
  saved: 'Saved.',
  sent: 'Test message sent.',
  invalid_webhook: 'That is not a Discord webhook URL.',
  webhook_failed: 'Discord refused the message. Check the webhook URL is saved and still exists.',
};

async function call(method, body) {
  try {
    const response = await fetch('/api/admin/settings', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json();
    return MESSAGES[result.message ?? result.error] ?? 'Something went wrong.';
  } catch {
    return 'Could not reach the server.';
  }
}

export default function ProposalWebhook({ initialWebhook }) {
  const [webhook, setWebhook] = useState(initialWebhook);
  const [saved, setSaved] = useState(initialWebhook);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (method, body) => {
    setBusy(true);
    const message = await call(method, body);
    if (message === MESSAGES.saved) setSaved(webhook.trim());
    setStatus(message);
    setBusy(false);
  };

  return (
    <form
      className={styles.section}
      onSubmit={(event) => {
        event.preventDefault();
        run('PUT', { proposalWebhook: webhook });
      }}
    >
      <div className={styles.subtitle}>Tournament proposals</div>
      <p className={styles.description}>Discord webhook that receives an embed for each tournament proposed from the app. Leave empty to turn it off.</p>
      <input
        className={styles.input}
        type="url"
        value={webhook}
        onChange={(event) => setWebhook(event.target.value)}
        placeholder="https://discord.com/api/webhooks/..."
        spellCheck={false}
        aria-label="Proposal webhook URL"
      />
      <div className={styles.actions}>
        <button className={styles.button} type="submit" disabled={busy}>
          Save
        </button>
        <button className={styles.button} type="button" disabled={busy || !saved} onClick={() => run('POST', { action: 'test' })}>
          Send test
        </button>
        <span className={styles.status} role="status">
          {status}
        </span>
      </div>
    </form>
  );
}
