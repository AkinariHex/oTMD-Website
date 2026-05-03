'use client';
import {
  faGear,
  faPlus,
  faRightFromBracket,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import { useClickOutside, useEventListener } from 'react-haiku';
import styles from './NavbarProfileDropdown.module.css';

export default function NavbarProfileDropdown({
  signOut,
  isDropdownOpen,
  setIsDropdownOpen,
}) {
  const variants = {
    open: { opacity: 1, y: 0, display: 'block' },
    closed: { opacity: 0, y: -10, display: 'none' },
  };

  const dropdownRef = useRef(null);
  const linksRef = useRef(null);
  useClickOutside(dropdownRef, () => {
    setTimeout(() => {
      if (isDropdownOpen) setIsDropdownOpen(false);
    }, 100);
  });
  useEventListener(
    'click',
    () => {
      if (isDropdownOpen) setIsDropdownOpen(false);
    },
    linksRef
  );

  return (
    <motion.div
      className={styles.profileActions}
      animate={isDropdownOpen ? 'open' : 'closed'}
      variants={variants}
      transition={{ duration: 0.2 }}
      ref={dropdownRef}
    >
      <Link href="/profile" ref={linksRef}>
        <FontAwesomeIcon icon={faUser} size="sm" color="#d9e3f0" />
        Profile
      </Link>
      <Link href="/tournaments/add" ref={linksRef}>
        <FontAwesomeIcon icon={faPlus} size="sm" color="#d9e3f0" />
        Add Tournament
      </Link>
      <Link href="/settings" ref={linksRef}>
        <FontAwesomeIcon icon={faGear} size="sm" color="#d9e3f0" />
        Settings
      </Link>
      <div
        onClick={() => {
          signOut(), setIsDropdownOpen(false);
        }}
      >
        <FontAwesomeIcon icon={faRightFromBracket} size="sm" color="#F47373" />
        Logout
      </div>
    </motion.div>
  );
}
