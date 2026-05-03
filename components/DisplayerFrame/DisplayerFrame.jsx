'use client';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Odometer } from '../Odometer/Odometer';
import styles from './DisplayerFrame.module.css';

export default function DisplayerFrame({ type }) {
  const [height, setHeight] = useState(null);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);

  useEffect(() => {
    setHeight('60px');

    if (type === 'realtime') {
      const score1Interval = setInterval(() => {
        setScore1(Math.floor(Math.random() * 9 + 1));
      }, 4000);
      const score2Interval = setInterval(
        () => setScore2(Math.floor(Math.random() * 9 + 1)),
        7000
      );

      window.addEventListener('beforeunload', () => {
        clearInterval(score1Interval);
        clearInterval(score2Interval);
      });
    }
  }, []);

  useEffect(() => {
    if (type === 'customizable') {
      setTimeout(
        () => {
          setHeight((prev) => (prev === '60px' ? '100px' : '60px'));
        },
        height === '60px' ? 3500 : 5000
      );
    }

    return () => {};
  }, [height]);

  const variations = {
    initial: {
      height: '60px',
    },
    customizable: {
      height: height,
      transition: {
        duration: 1,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div variants={variations} animate={type} className={styles.frame}>
      <div className={clsx(styles.framePropic, styles.lside)} />
      <div className={clsx(styles.frameName, styles.lside)} />
      <div className={styles.frameScore}>
        {type !== 'customizable' ? (
          <>
            <Odometer value={score1} />
            <span>-</span>
            <Odometer value={score2} />
          </>
        ) : (
          <div className={styles.framePoint} />
        )}
      </div>
      <div className={clsx(styles.frameName, styles.rside)} />
      <div className={clsx(styles.framePropic, styles.rside)} />
    </motion.div>
  );
}
