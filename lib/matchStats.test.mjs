import assert from 'node:assert/strict';
import test from 'node:test';
import { summarizeStats, withBanners } from './matchStats.js';

const OWNER = 7;
const tournament = (acronym) => JSON.stringify({ name: `${acronym} Cup`, acronym });
const duel = (matchID, side, winner, extra = {}) => ({
  owner: OWNER,
  matchID,
  matchType: '1vs1',
  stage: 'Finals',
  tournament: tournament('MC'),
  startTime: `2026-01-0${matchID}T10:00:00Z`,
  players: JSON.stringify(side === 0 ? [{ userid: OWNER, username: 'me' }, { userid: 9, username: 'them' }] : [{ userid: 9, username: 'them' }, { userid: OWNER, username: 'me' }]),
  scores: JSON.stringify({ player1: 5, player2: 3, winner }),
  ...extra,
});
const team = (extra = {}) => ({
  owner: OWNER,
  matchID: 4,
  matchType: 'teamVS',
  stage: 'Finals',
  tournament: tournament('TC'),
  startTime: '2026-01-05T10:00:00Z',
  teams: JSON.stringify(['Reds', 'Blues']),
  players: '""',
  scores: JSON.stringify({ team1: 5, team2: 2, winner: 1 }),
  ...extra,
});

test('counts wins from the side the owner played on and puts the owner first', () => {
  const stats = summarizeStats([duel(1, 0, 1), duel(2, 1, 1), duel(3, 1, 2)], OWNER);
  assert.deepEqual(stats.oneVsOne, { wins: 2, losses: 1 });
  assert.equal(stats.totals.oneVsOne, 3);

  const newest = stats.recentMatches[0];
  assert.equal(newest.matchID, 3);
  assert.deepEqual(newest.sides, [
    { name: 'me', score: 3, players: [] },
    { name: 'them', score: 5, players: [] },
  ]);
  assert.equal(newest.winner, 0);
  assert.equal(newest.won, true);
});

test('rows of other accounts are never counted', () => {
  const stats = summarizeStats([duel(1, 0, 1), duel(2, 0, 1, { owner: 99 })], OWNER);
  assert.equal(stats.totals.all, 1);
  assert.equal(stats.recentMatches.length, 1);
});

test('team rosters are split by side, with the owner team first', () => {
  const players = JSON.stringify([
    { id: OWNER, username: 'me', side: 'blue', cost: 1.2 },
    { id: 8, username: 'mate', side: 'blue', cost: 0.9 },
    { id: 9, username: 'them', side: 'red', cost: 1.4 },
  ]);
  const [match] = summarizeStats([team({ players })], OWNER).recentMatches;
  assert.equal(match.sides[0].name, 'Blues');
  assert.deepEqual(match.sides[0].players, [
    { id: OWNER, username: 'me', cost: 1.2 },
    { id: 8, username: 'mate', cost: 0.9 },
  ]);
  assert.deepEqual(match.sides[1].players, [{ id: 9, username: 'them', cost: 1.4 }]);
  assert.equal(match.won, false);
  assert.equal(match.winner, 1);
});

test('a team match saved without a roster has no outcome for the owner but keeps the winner', () => {
  const [match] = summarizeStats([team()], OWNER).recentMatches;
  assert.equal(match.sides[0].name, 'Reds');
  assert.equal(match.won, null);
  assert.equal(match.winner, 0);
  assert.deepEqual(match.sides[0].players, []);
});

test('qualifiers and team matches do not affect the 1vs1 record, and qualifiers stay out of the feed', () => {
  const qualifier = { owner: OWNER, matchID: 5, matchType: '1vs1', stage: 'Qualifiers', tournament: tournament('TC'), startTime: 'y', scores: '{}' };
  const stats = summarizeStats([team(), qualifier], OWNER);
  assert.deepEqual(stats.oneVsOne, { wins: 0, losses: 0 });
  assert.deepEqual([stats.totals.teamVS, stats.totals.qualifiers], [1, 1]);
  assert.deepEqual(stats.topTournaments, [{ acronym: 'TC', name: 'TC Cup', count: 2 }]);
  assert.deepEqual(stats.recentMatches.map((match) => match.matchID), [4]);
});

test('malformed legacy rows are counted but never reach the feed', () => {
  const broken = { owner: OWNER, matchID: 6, matchType: '1vs1', stage: 'Finals', tournament: 'not json', players: '""', scores: '{', startTime: null };
  const badScores = duel(1, 0, 1, { scores: JSON.stringify({ player1: 'x', player2: 3, winner: 1 }) });
  const stats = summarizeStats([broken, badScores], OWNER);
  assert.equal(stats.totals.all, 2);
  assert.deepEqual(stats.recentMatches, []);
  assert.deepEqual(stats.topTournaments, [{ acronym: 'MC', name: 'MC Cup', count: 1 }]);
});

test('banners prefer the tournament with the same name and tolerate missing ones', () => {
  const stats = summarizeStats([duel(1, 0, 1), team()], OWNER);
  const result = withBanners(stats, [
    { acronym: 'MC', name: 'Older', banner: 'https://img.test/old.png' },
    { acronym: 'MC', name: 'MC Cup', banner: 'https://img.test/new.png' },
    { acronym: 'TC', name: 'TC Cup', banner: null },
  ]);
  const banners = Object.fromEntries(result.recentMatches.map((match) => [match.tournament.acronym, match.banner]));
  assert.deepEqual(banners, { MC: 'https://img.test/new.png', TC: null });
});
