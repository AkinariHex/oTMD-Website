'use client';
import styles from '@/app/tournaments/tournaments.module.css';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import Image from 'next/image';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="200" viewBox="0 0 600 200"%3E%3Crect fill="%23333" width="600" height="200"/%3E%3Ctext fill="%23666" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Banner Available%3C/text%3E%3C/svg%3E';

function TournamentItem({ setSelected, tournament }) {
  const listVariant = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  const hasBanner = tournament?.banner && tournament.banner.length > 0;

  return (
    <motion.div
      variants={listVariant}
      className={styles.item}
      onClick={() => setSelected(tournament)}
    >
      <div className={styles.banner}>
        <Image
          src={hasBanner ? tournament.banner : PLACEHOLDER_IMAGE}
          alt={tournament.name}
          fill
        />
      </div>
      <div className={clsx(styles.status, styles[tournament.statusClass])}>
        {tournament.statusText}
      </div>
      <div className={styles.name}>{tournament.name}</div>
      {tournament.host && (
        <div className={styles.host}>
          hosted by <span>{tournament.host.username}</span>
        </div>
      )}
    </motion.div>
  );
}

export default TournamentItem;
