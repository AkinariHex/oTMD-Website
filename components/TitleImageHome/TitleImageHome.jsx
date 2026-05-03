'use client';
import appImage from '@/public/img/appv2.0.png';
import logo from '@/public/img/otmdLOGO.webp';
import {
  faDiscord,
  faUbuntu,
  faWindows,
} from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect } from 'react';
import Balancer from 'react-wrap-balancer';
import { parallax } from '../Parallax/Parallax';
import styles from './TitleImageHome.module.css';

function TitleImageHome({ appimage64, appRelease }) {
  useEffect(() => {
    if (document) {
      parallax();
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: '-20px' }}
      animate={{ opacity: 1, y: '0px' }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className={styles.container}
      id="homeTitleContainer"
    >
      <div className={styles.title}>
        <div className={styles.appLogo}>
          <Image src={logo} alt="app logo" fill />
        </div>
        <h2>
          <Balancer>
            Enrich your livestreams with your osu! Tournament match info
            directly on stream.
          </Balancer>
        </h2>
        {appRelease.length > 0 && (
          <div className={styles.buttons}>
            <Link
              className={styles.button}
              id={styles.windows}
              href={`https://github.com/AkinariHex/oTMD/releases/download/${appRelease[0]?.tag_name}/otmd_${appRelease[0]?.tag_name}_x64_installer.exe`}
            >
              <FontAwesomeIcon icon={faWindows} size={'xl'} /> Download
            </Link>
            <Link
              className={styles.button}
              id={styles.ubuntu}
              href={`https://github.com/AkinariHex/oTMD/releases/download/${appRelease[0].tag_name}/otmd_${appRelease[0].tag_name}_amd64.deb`}
            >
              <FontAwesomeIcon icon={faUbuntu} size={'xl'} /> Download
            </Link>
            <Link
              className={styles.button}
              id={styles.discord}
              href="https://discord.com/invite/gf7rWj942q"
            >
              <FontAwesomeIcon icon={faDiscord} size={'xl'} /> Discord Server
            </Link>
          </div>
        )}
      </div>
      <div className={styles.image} id="appImage">
        <Suspense fallback={'ciao'}>
          <Image
            src={appImage}
            alt="app image"
            quality={100}
            fill
            placeholder="blur"
            blurDataURL={appimage64}
          />
        </Suspense>
      </div>
    </motion.div>
  );
}

export default TitleImageHome;
