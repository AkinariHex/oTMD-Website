'use client';
import DisplayerFrame from '../DisplayerFrame/DisplayerFrame';
import Card from './Card';
import styles from './CardsGrid.module.css';
import OBSappImage from './OBSappImage/OBSappImage';
import OpenSourceImage from './OpenSourceImage/OpenSourceImage';
import SupportedTournamentsImage from './SupportedTournamentsImage/SupportedTournamentsImage';

export default function CardsGrid() {
  return (
    <div className={styles.container}>
      <Card
        title={'Real-time Match Stats'}
        description={
          'Show the stats of an ongoing osu! multiplayer match in real-time.'
        }
        image={<DisplayerFrame type={'realtime'} />}
      />
      <Card
        title={'Customizable'}
        description={
          'Change the size of the displayer and decide to enable or disable the background following your needs.'
        }
        image={<DisplayerFrame type={'customizable'} />}
      />
      <Card
        title={'Easy to Use'}
        description={
          'Can be set up quickly to be used as a browser source on your preferred streaming software with just a few clicks.'
        }
        image={<OBSappImage />}
      />
      <Card
        title={'Supporting Tournaments'}
        description={
          'Precise score calculation for supported tournaments with their custom rules and values such as mod modifiers.'
        }
        image={<SupportedTournamentsImage />}
      />
      <Card
        title={'Free and Open-source'}
        description={
          'The app is free and open-source on GitHub, where you can check the development status and contribute to its development.'
        }
        image={<OpenSourceImage />}
      />
    </div>
  );
}
