'use client';

import { useState, useEffect } from 'react';
import {
  faGear,
  faPlus,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'framer-motion';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import styles from './hub.module.css';

export default function Hub() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const variants = {
    initial: {
      opacity: 0,
    },
    show: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  if (!mounted) return null;

  /* if device width is less than 1025 the page will load - otherwise redirected to home / */
  return window.innerWidth > 1024 ? (
    redirect('/')
  ) : (
    <AnimatePresence>
      <motion.div
        variants={variants}
        initial={'initial'}
        animate={'show'}
        exit={'exit'}
        className={styles.container}
      >
        <Link href="/tournaments/add">
          <FontAwesomeIcon
            icon={faPlus}
            style={{ height: 20 }}
            color="#d9e3f0"
          />
          Add Tournament
        </Link>
        <Link href="/settings">
          <FontAwesomeIcon
            icon={faGear}
            style={{ height: 20 }}
            color="#d9e3f0"
          />
          Settings
        </Link>
        <div className={styles.logout} onClick={() => signOut()}>
          <FontAwesomeIcon
            icon={faRightFromBracket}
            style={{ height: 20 }}
            color="#F47373"
          />
          Logout
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
