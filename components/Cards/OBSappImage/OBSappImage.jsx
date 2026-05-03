'use client';

import obsAppImage from '@/public/img/obs_app_image.webp';
import Image from 'next/image';
import styles from './OBSappImage.module.css';

export default function OBSappImage() {
  return (
    <div className={styles.obsImage}>
      {<Image src={obsAppImage} alt={'OBS app'} fill />}
    </div>
  );
}
