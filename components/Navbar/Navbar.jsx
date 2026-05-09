'use client';

import osulogo from '@/public/img/osu-logo.png';
import logo from '@/public/img/otmdLOGO.webp';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';
import { useClickOutside } from 'react-haiku';
import NavbarProfileDropdown from '../NavbarProfileDropdown/NavbarProfileDropdown';
import styles from './Navbar.module.css';

function Navbar() {
  const { data: session, status } = useSession();

  let pathname = usePathname();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className={styles.navbar} id="navbarContainer">
      <div className={styles.logo} id="logonav">
        <Image
          src={logo}
          alt="navbar logo"
          placeholder="blur"
          blurDataURL="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="
          fill
        />
      </div>
      <nav>
        <ul className={styles.navLinks}>
          <li>
            <Link
              className={clsx(
                styles.navLinks_link,
                pathname === '/' && styles.active
              )}
              aria-current="page"
              href={'/'}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              className={clsx(
                styles.navLinks_link,
                pathname === '/tournaments' && styles.active
              )}
              aria-current="page"
              href={'/tournaments'}
            >
              Tournaments
            </Link>
          </li>
          <li>
            <Link
              className={clsx(
                styles.navLinks_link,
                pathname === '/documentation' && styles.active
              )}
              aria-current="page"
              href={'/documentation'}
            >
              Documentation
            </Link>
          </li>
        </ul>
      </nav>
      {status === 'loading' ? (
        <button className={styles.login}>
          <span>Login with osu!</span>
          <Image src={osulogo} alt="osu! logo" width={25} height={25} />
        </button>
      ) : status === 'authenticated' ? (
        <div
          className={styles.logged}
          onClick={() => setIsDropdownOpen((isDropdownOpen) => !isDropdownOpen)}
        >
          {session.username}
          <Image
            src={session.avatar_url}
            alt={`${session.username}'s propic`}
            height={45}
            width={45}
          />
          <NavbarProfileDropdown
            signOut={signOut}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
          />
        </div>
      ) : (
        <button className={styles.login} onClick={() => signIn('osu', { callbackUrl: '/' })}>
          <span>Login with osu!</span>
          <Image src={osulogo} alt="osu! logo" width={25} height={25} />
        </button>
      )}
      {/* <div className={styles.burgerButton}>
        <FontAwesomeIcon
          icon={faBars}
          size="lg"
          color="var(--navbar-text-color)"
        />
      </div> */}
    </header>
  );
}

export default Navbar;
