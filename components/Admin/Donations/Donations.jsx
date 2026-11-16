'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from '../ProposalWebhook/ProposalWebhook.module.css';
import own from './Donations.module.css';

const MESSAGES = {
  added: 'Donation added.',
  deleted: 'Donation deleted.',
  invalid_donation: 'Check the osu! ID, amount, date and note.',
};
const euros = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' });
const today = () => new Date().toISOString().slice(0, 10);

async function call(method, body) {
  try {
    const response = await fetch('/api/admin/donations', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json();
    return { ok: response.ok, message: MESSAGES[result.message ?? result.error] ?? 'Something went wrong.' };
  } catch {
    return { ok: false, message: 'Could not reach the server.' };
  }
}

const profile = (id) => (
  <a className={own.link} href={`https://osu.ppy.sh/users/${id}`} target="_blank" rel="noreferrer">
    {id}
  </a>
);

export default function Donations({ supporters, donations }) {
  const router = useRouter();
  const [form, setForm] = useState({ osuUser: '', amount: '', donatedAt: today(), note: '' });
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (method, body) => {
    setBusy(true);
    const { ok, message } = await call(method, body);
    if (ok && method === 'POST') setForm({ osuUser: '', amount: '', donatedAt: today(), note: '' });
    if (ok) router.refresh();
    setStatus(message);
    setBusy(false);
  };
  const field = (key) => ({ value: form[key], onChange: (event) => setForm({ ...form, [key]: event.target.value }) });

  return (
    <div className={styles.section}>
      <div className={styles.subtitle}>Donations</div>
      <p className={styles.description}>Add a Ko-fi donation and assign it to an osu! account. The app shows the total on that user&apos;s dashboard.</p>
      <form
        className={own.form}
        onSubmit={(event) => {
          event.preventDefault();
          run('POST', form);
        }}
      >
        <input className={styles.input} {...field('osuUser')} placeholder="osu! ID or profile URL" required aria-label="osu! user" spellCheck={false} />
        <input className={styles.input} {...field('amount')} placeholder="Amount (EUR)" inputMode="decimal" required aria-label="Amount in EUR" />
        <input className={styles.input} {...field('donatedAt')} type="date" required aria-label="Donation date" />
        <input className={styles.input} {...field('note')} placeholder="Note (optional)" maxLength={200} aria-label="Note" />
        <div className={styles.actions}>
          <button className={styles.button} type="submit" disabled={busy}>
            Add donation
          </button>
          <span className={styles.status} role="status">
            {status}
          </span>
        </div>
      </form>

      <div className={styles.subtitle}>Supporters</div>
      {supporters.length === 0 && <p className={styles.description}>No supporters yet.</p>}
      {supporters.map((supporter) => (
        <div key={supporter.osu_user_id} className={own.row}>
          {profile(supporter.osu_user_id)}
          <span>{supporter.donations === 1 ? '1 donation' : `${supporter.donations} donations`}</span>
          <span className={own.number}>{euros.format(supporter.total)}</span>
          <span className={own.muted}>last {supporter.last_donated_at}</span>
        </div>
      ))}

      <div className={styles.subtitle}>Recent donations</div>
      {donations.length === 0 && <p className={styles.description}>No donations yet.</p>}
      {donations.map((donation) => (
        <div key={donation.id} className={own.row}>
          {profile(donation.osu_user_id)}
          <span className={own.number}>{euros.format(donation.amount)}</span>
          <span className={own.muted}>{donation.donated_at}</span>
          <span className={own.note}>{donation.note}</span>
          <button className={styles.button} type="button" disabled={busy} onClick={() => run('DELETE', { id: donation.id })}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
