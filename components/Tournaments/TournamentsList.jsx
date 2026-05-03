'use client';
import styles from '@/app/tournaments/tournaments.module.css';
import { motion } from 'framer-motion';
import TournamentItem from './TournamentItem';

function TournamentsList({ setSelected, tournaments }) {
  const boxVariant = {
    hidden: {
      opacity: 1,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0,
        delay: 0,
        when: 'beforeChildren',
        staggerChildren: 0.08,
      },
    },
  };

  return (
    <>
      <motion.div
        variants={boxVariant}
        animate="visible"
        initial="hidden"
        className={styles.list}
      >
        {tournaments.map((tournament) => {
          return (
            <TournamentItem
              key={tournament.UUID}
              tournament={tournament}
              setSelected={setSelected}
            />
          );
        })}
      </motion.div>
    </>
  );
}

export default TournamentsList;
