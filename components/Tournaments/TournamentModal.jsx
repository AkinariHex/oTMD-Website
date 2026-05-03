'use client';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import TournamentDescription from '../TournamentDescription/TournamentDescription';
import TournamentLinksBar from '../TournamentLinksBar/TournamentLinksBar';
import TournamentStagesBar from '../TournamentStagesBar/TournamentStagesBar';
import TournamentStatusBar from '../TournamentStatusBar/TournamentStatusBar';
import styles from './TournamentModal.module.css';

function TournamentModal({ selected, setSelected }) {
  const modalContainerVariant = {
    hidden: {
      opacity: 0,
    },
    show: {
      opacity: 1,
      transition: {
        duration: 0.2,
        /* when: 'beforeChildren', */
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.15,
        when: 'beforeChildren',
      },
    },
  };

  const modalVariant = {
    hidden: {
      opacity: 1,
    },
    show: {
      opacity: 1,
      transition: {
        delay: 0,
        staggerChildren: 0.3,
      },
    },
  };

  const imageVariant = {
    hidden: {
      /* y: -20, */
      scale: 0.5,
      opacity: 0,
    },
    show: {
      /* y: 0, */
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
        animation: 'stagger',
      },
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        animation: 'stagger',
      },
    },
  };

  const contentVariant = {
    hidden: {
      height: 0,
    },
    show: {
      height: 'auto',
      transition: {
        duration: 0.5,
        animation: 'stagger',
        ease: 'easeOut',
        staggerChildren: 0.2,
      },
    },
  };

  const contentChildrensVariant = {
    hidden: {
      opacity: 0,
    },
    show: {
      opacity: 1,
      transition: {
        duration: 0.4,
        animation: 'stagger',
      },
    },
  };

  return (
    <AnimatePresence>
      {selected && (
        <motion.div
          variants={modalContainerVariant}
          initial="hidden"
          animate="show"
          exit="exit"
          className={styles.modalContainer}
          onClick={() => setSelected(null)}
        >
          <motion.div
            variants={modalVariant}
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              variants={imageVariant}
              className={styles.banner}
              style={{
                backgroundImage: `url("${selected.banner}")`,
              }}
              /* layoutId={`tournament_layout_${selected.name}`} */
            />
            <motion.div variants={contentVariant} className={styles.body}>
              {/* Modal Close Button */}
              <motion.button
                variants={contentChildrensVariant}
                className={styles.close}
                onClick={() => setSelected(null)}
              >
                <FontAwesomeIcon icon={faX} size="lg" />
              </motion.button>
              {/* Modal Header */}
              <motion.div
                variants={contentChildrensVariant}
                className={styles.header}
              >
                <div className={styles.title}>{selected.name}</div>
                {selected.host && (
                  <div className={styles.host}>
                    hosted by{' '}
                    <a
                      href={`https://osu.ppy.sh/users/${selected.host.id}`}
                      target={'_blank'}
                      rel={'noreferrer'}
                    >
                      {selected.host.username}
                    </a>
                  </div>
                )}
              </motion.div>
              {/* Modal Content */}
              <motion.div
                variants={contentChildrensVariant}
                className={styles.content}
              >
                {/* Modal Description */}
                {selected.description && (
                  <TournamentDescription description={selected.description} />
                )}
                {/* Modal Status Bar */}
                <TournamentStatusBar
                  start={selected.tourney_start}
                  end={selected.tourney_end}
                  status={{
                    class: selected.statusClass,
                    text: selected.statusText,
                  }}
                />
                {/* Modal Stages Progress Bar */}
                {selected.stages.stages.length > 0 && (
                  <TournamentStagesBar stages={selected.stages} />
                )}
                {/* Modal Links Bar */}
                {(selected.forumID || selected.website || selected.pickem) && (
                  <TournamentLinksBar
                    forumID={selected.forumID}
                    website={selected.website}
                    pickem={selected.pickem}
                  />
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TournamentModal;
