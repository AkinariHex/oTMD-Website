'use client';

import {
  faBars,
  faFileLines,
  faHome,
  faRightToBracket,
  faTrophy,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from './MobileNavbar.module.css';

function MobileNavbar() {
  let pathname = usePathname();

  const { data: session, status } = useSession();

  const [isMoreActive, setIsMoreActive] = useState(false);

  return (
    <>
      <div
        className={clsx(
          styles.mobileNavbar,
          status === 'authenticated' && styles.authenticated
        )}
      >
        <Link
          href={'/'}
          className={clsx(styles.button, pathname === '/' && styles.active)}
        >
          <FontAwesomeIcon icon={faHome} />
          <span>Home</span>
          {pathname === '/' && (
            <motion.div
              className={styles.selected}
              transition={{
                stiffness: 200,
                ease: 'easeOut',
              }}
              layoutId={'mobile_nav_active'}
            />
          )}
        </Link>
        <Link
          href={'/tournaments'}
          className={clsx(
            styles.button,
            pathname === '/tournaments' && styles.active
          )}
        >
          <FontAwesomeIcon icon={faTrophy} /> <span>Tournaments</span>
          {pathname === '/tournaments' && (
            <motion.div
              className={styles.selected}
              transition={{
                stiffness: 200,
                ease: 'easeOut',
              }}
              layoutId={'mobile_nav_active'}
            />
          )}
        </Link>
        {status === 'authenticated' && (
          <div className={styles.button}>
            <div className={styles.navImage}>
              <Image
                src={session.avatar_url}
                alt={`Navbar ${session.username}'s image`}
                fill
              />
            </div>
          </div>
        )}
        <Link
          href={'/documentation'}
          className={clsx(
            styles.button,
            pathname === '/documentation' && styles.active
          )}
        >
          <FontAwesomeIcon icon={faFileLines} /> <span>Documentation</span>
          {pathname === '/documentation' && (
            <motion.div
              className={styles.selected}
              transition={{
                stiffness: 200,
                ease: 'easeOut',
              }}
              layoutId={'mobile_nav_active'}
            />
          )}
        </Link>
        {status === 'loading' ? (
          <button className={styles.button}>
            <FontAwesomeIcon icon={faRightToBracket} />
            <span>Login</span>
          </button>
        ) : status === 'authenticated' ? (
          <Link
            href={'/hub'}
            className={clsx(
              styles.button,
              pathname === '/hub' && styles.active
            )}
          >
            <FontAwesomeIcon icon={faBars} />
            <span>More</span>
            {pathname === '/hub' && (
              <motion.div
                className={styles.selected}
                transition={{
                  stiffness: 200,
                  ease: 'easeOut',
                }}
                layoutId={'mobile_nav_active'}
              />
            )}
          </Link>
        ) : (
          <button className={styles.button} onClick={() => signIn('osu')}>
            <FontAwesomeIcon icon={faRightToBracket} />
            <span>Login</span>
          </button>
        )}
      </div>
    </>
  );
}

export default MobileNavbar;
