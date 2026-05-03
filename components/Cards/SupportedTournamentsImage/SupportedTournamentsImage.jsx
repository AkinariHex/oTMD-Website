'use client';
import clsx from 'clsx';
import Image from 'next/image';
import styles from './SupportedTournamentsImage.module.css';

export default function SupportedTournamentsImage() {
  return (
    <div className={styles.container}>
      <div className={clsx(styles.item, styles.first)}>
        <div className={styles.banner}>
          <Image
            src={
              'https://i.ppy.sh/da50aaa1579ae67127909ef8e3cc561831662e63/68747470733a2f2f63646e2e646973636f72646170702e636f6d2f6174746163686d656e74732f3836333132363833303531373435323833312f313130313739323735303634343439383434322f42616e6e65722e706e67'
            }
            alt={'Maple Cup 2023 banner'}
            fill
          />
        </div>
        <div className={styles.name}>Maple Cup 2023</div>
      </div>
      <div className={clsx(styles.item, styles.second)}>
        <div className={styles.banner}>
          <Image
            src={
              'https://i.ppy.sh/4ad8da8731aba69cb05780397434699971c0cb0c/68747470733a2f2f63646e2e646973636f72646170702e636f6d2f6174746163686d656e74732f313034313934303131353939373539333637302f313036393131363433373334393831343338322f42616e6e65722e706e67'
            }
            alt={'Battle of the Box 2023: Trouble in Boxville banner'}
            fill
          />
        </div>
        <div className={styles.name}>
          Battle of the Box 2023: Trouble in Boxville
        </div>
      </div>
      <div className={clsx(styles.item, styles.third)}>
        <div className={styles.banner}>
          <Image
            src={
              'https://i.ppy.sh/616f7a092baa1407cf051ca873fed64d82fdd316/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f3536383231363035313233383833303039302f313131363433373534333636383431363634332f666f72756d5f706f73745f6e6967676572732e706e673f77696474683d31343430266865696768743d353230'
            }
            alt={'Italian Draft Cup 2: Summer Edition banner'}
            fill
          />
        </div>
        <div className={styles.name}>Italian Draft Cup 2: Summer Edition</div>
      </div>
    </div>
  );
}
