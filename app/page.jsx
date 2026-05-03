import CardsGrid from '@/components/Cards/CardsGrid';
import TitleImageHome from '@/components/TitleImageHome/TitleImageHome';
import styles from './page.module.css';

export const metadata = {
  title: 'osu! Tourney Match Displayer',
};

export default async function Home() {
  let release = await fetch(
    'https://api.github.com/repos/AkinariHex/oTMD/releases'
  );
  release = await release.json();

  return (
    <main className={styles.main}>
      <TitleImageHome appRelease={release} />
      <CardsGrid />
    </main>
  );
}
