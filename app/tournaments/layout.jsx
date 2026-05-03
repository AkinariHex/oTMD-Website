import { Suspense } from 'react';
import Loading from './loading';
import styles from './tournaments.module.css';

export const metadata = {
  title: 'Tournaments',
  description: '',
};

export default async function RootLayout({ children }) {
  return (
    <main className={styles.pageContainer}>
      <Suspense fallback={<Loading />}>
        <div>{children}</div>
      </Suspense>
    </main>
  );
}
