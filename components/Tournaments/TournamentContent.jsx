'use client';
import { useState } from 'react';
import TournamentModal from './TournamentModal';
import TournamentsList from './TournamentsList';

export default function TournamentContent({ tournaments }) {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <TournamentsList setSelected={setSelected} tournaments={tournaments} />
      <TournamentModal selected={selected} setSelected={setSelected} />
    </>
  );
}
