import styles from './settings.module.css';

export const metadata = {
  title: 'Settings',
  description: '',
};

export default async function RootLayout({ children }) {
  return (
    <main className={styles.pageContainer}>
      <div>{children}</div>
    </main>
  );
}
