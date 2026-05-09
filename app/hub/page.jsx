'use client';

import { useState, useEffect } from 'react';
import {
  faGear,
  faPlus,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './hub.module.css';

export default function Hub() {
  const [mounted, setMounted] = useState(false);
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // Desktop users don't use the hub (it's a mobile-only nav menu).
    // But after login they land here via callbackUrl — redirect them home.
    // Only redirect once session is resolved to avoid flash-redirecting during loading.
    if (status !== 'loading' && window.innerWidth > 1024) {
      router.replace('/');
    }
  }, [mounted, status, router]);

  const variants = {
    initial: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  if (!mounted || status === 'loading') return null;
  if (typeof window !== 'undefined' && window.innerWidth > 1024) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={variants}
        initial={'initial'}
        animate={'show'}
        exit={'exit'}
        className={styles.container}
      >
        <Link href="/tournaments/add">
          <FontAwesomeIcon icon={faPlus} style={{ height: 20 }} color="#d9e3f0" />
          Add Tournament
        </Link>
        <Link href="/settings">
          <FontAwesomeIcon icon={faGear} style={{ height: 20 }} color="#d9e3f0" />
          Settings
        </Link>
        <div className={styles.logout} onClick={() => signOut()}>
          <FontAwesomeIcon icon={faRightFromBracket} style={{ height: 20 }} color="#F47373" />
          Logout
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
