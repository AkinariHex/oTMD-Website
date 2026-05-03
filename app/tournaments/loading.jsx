import SkeletonLoading from '@/components/SkeletonLoading/SkeletonLoading';
import styles from './tournaments.module.css';

export default function Loading() {
  return (
    <>
      <h1>Tournaments</h1>
      <div className={styles.list}>
        <SkeletonLoading styles={styles} number={15} />
      </div>
    </>
  );
}
