import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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

  const webhook = await getAdminSetting(PROPOSAL_WEBHOOK);

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.title}>Administration</div>
      <ProposalWebhook initialWebhook={webhook} />
    </div>
  );
}
