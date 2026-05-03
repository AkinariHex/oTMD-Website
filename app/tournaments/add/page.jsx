'use client';
import Form from '@/components/FormNewTournament/form';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './addtournaments.module.css';

// T-6 User session integration and user grant level integration

export default function TournamentAdd() {
  const { data: session, status } = useSession();
  const { push } = useRouter();

  {
    status === 'unauthenticated' && push('/');
  }

  return (
    <div className={styles.formContainer}>
      {status === 'loading' && <></>}
      {status === 'authenticated' && (
        <>
          <h2>Add new tournament</h2>
          <Form session={session} />
        </>
      )}
    </div>
  );
}
