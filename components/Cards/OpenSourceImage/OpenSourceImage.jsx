import openSourceImg from '@/public/img/opensource.webp';
import Image from 'next/image';
import styles from './OpenSourceImage.module.css';

export default function OpenSourceImage() {
  return (
    <div className={styles.opensourceImage}>
      {<Image src={openSourceImg} alt={'OpenSource'} fill />}
    </div>
  );
}
