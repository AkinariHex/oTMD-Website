'use client';
import { faDiamond, faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';
import styles from './TournamentLinksBar.module.css';

export default function TournamentLinksBar({ forumID, website, pickem }) {
  return (
    <div className={styles.linksBar}>
      {website && (
        <div>
          <FontAwesomeIcon icon={faLink} color={'var(--main-accent-color)'} />
          <Link href={website} target="_blank">
            Website
          </Link>
        </div>
      )}
      {forumID && (
        <div>
          <FontAwesomeIcon
            icon={faDiamond}
            color={'var(--main-accent-color)'}
          />
          <Link
            href={`https://osu.ppy.sh/community/forums/topics/${forumID}`}
            target="_blank"
          >
            Forum Thread
          </Link>
        </div>
      )}
      {pickem && (
        <div>
          <Image
            src={'/img/hwr-pickem-logo.png'}
            alt={'pickem logo'}
            height={19}
            width={19}
            style={{
              filter:
                'brightness(0%) invert(78%) sepia(13%) saturate(762%) hue-rotate(182deg) brightness(93%) contrast(96%)',
            }}
          />
          <Link href={pickem} target="_blank">
            Pick&apos;em
          </Link>
        </div>
      )}
    </div>
  );
}
