import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Donations from '@/components/Admin/Donations/Donations';
import { supabaseAdmin } from '@/config/supabaseClient';
import ProposalWebhook from '@/components/Admin/ProposalWebhook/ProposalWebhook';
import { PROPOSAL_WEBHOOK, getAdminSetting, isAdmin } from '@/lib/admin';
import { getServerSession } from 'next-auth/next';
import { notFound } from 'next/navigation';
import styles from '../settings/settings.module.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin | o!TMD', description: 'Site administration', robots: { index: false } };

// Anyone who is not an admin gets a plain 404, so the page does not reveal it exists.
export default async function Admin() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.id)) notFound();

  const [webhook, supporters, donations] = await Promise.all([
    getAdminSetting(PROPOSAL_WEBHOOK),
    supabaseAdmin.from('supporters').select('*').order('total', { ascending: false }),
    supabaseAdmin.from('donations').select('id, osu_user_id, amount, donated_at, note').order('donated_at', { ascending: false }).order('id', { ascending: false }).limit(50),
  ]);

  return (
    <main className={styles.pageContainer}>
      <div className={styles.settingsContainer}>
        <div className={styles.title}>Administration</div>
        <ProposalWebhook initialWebhook={webhook} />
        <Donations supporters={supporters.data ?? []} donations={donations.data ?? []} />
      </div>
    </main>
  );
}
