'use client';
import { motion } from 'framer-motion';
import styles from './CardsGrid.module.css';

export default function Card({ image, title, description }) {
  const cardVariants = {
    hover: {
      backgroundImage:
        'linear-gradient(to top, rgb(26, 33, 46),rgb(22, 28, 39) 20%, rgb(18, 23, 33) 30%)',
      borderColor: 'hsl(219, 28%, 24%)',
    },
    transition: {
      type: 'tween',
      duration: 0.4,
      ease: 'easeOut',
    },
  };

  return (
    <motion.div
      className={styles.card}
      variants={cardVariants}
      whileHover={'hover'}
      transition={'transition'}
    >
      <div className={styles.image}>{image}</div>
      <div className={styles.text}>
        <div className={styles.title}>{title}</div>
        <div className={styles.description}>{description}</div>
      </div>
    </motion.div>
  );
}
