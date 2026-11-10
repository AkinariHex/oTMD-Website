import assert from 'node:assert/strict';
import test from 'node:test';
import { summarizeRecent, summarizeStats, withBanners } from './matchStats.js';

const PAGE = 20;

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

const recent = (rows) => summarizeRecent(rows, OWNER, PAGE).matches;

test('counts wins from the side the owner played on and puts the owner first', () => {
  const stats = summarizeStats([duel(1, 0, 1), duel(2, 1, 1), duel(3, 1, 2)], OWNER);
  assert.deepEqual(stats.oneVsOne, { wins: 2, losses: 1 });
  assert.equal(stats.totals.oneVsOne, 3);

  const [match] = recent([duel(3, 1, 2)]);
  assert.deepEqual(match.sides, [
    { name: 'me', score: 3, players: [] },
    { name: 'them', score: 5, players: [] },
  ]);
  assert.equal(match.winner, 0);
  assert.equal(match.won, true);
});

test('rows of other accounts are never counted or listed', () => {
  const rows = [duel(1, 0, 1), duel(2, 0, 1, { owner: 99 })];
  assert.equal(summarizeStats(rows, OWNER).totals.all, 1);
  assert.deepEqual(recent(rows).map((match) => match.matchID), [1]);
});

test('team rosters are split by side, with the owner team first', () => {
  const players = JSON.stringify([
    { id: OWNER, username: 'me', side: 'blue', cost: 1.2 },
    { id: 8, username: 'mate', side: 'blue', cost: 0.9 },
    { id: 9, username: 'them', side: 'red', cost: 1.4 },
  ]);
  const [match] = recent([team({ players })]);
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
  const [match] = recent([team()]);
  assert.equal(match.sides[0].name, 'Reds');
  assert.equal(match.won, null);
  assert.equal(match.winner, 0);
});

test('qualifiers and team matches do not affect the 1vs1 record', () => {
  const qualifier = { owner: OWNER, matchID: 5, matchType: '1vs1', stage: 'Qualifiers', tournament: tournament('TC'), startTime: 'y', scores: '{}' };
  const stats = summarizeStats([team(), qualifier], OWNER);
  assert.deepEqual(stats.oneVsOne, { wins: 0, losses: 0 });
  assert.deepEqual([stats.totals.teamVS, stats.totals.qualifiers], [1, 1]);
  assert.deepEqual(stats.topTournaments, [{ acronym: 'TC', name: 'TC Cup', count: 2 }]);
});

test('malformed rows keep their place in the page so offsets stay correct', () => {
  const broken = { owner: OWNER, matchID: 6, matchType: '1vs1', stage: 'Finals', tournament: 'not json', players: '""', scores: '{', startTime: null };
  const badScores = duel(1, 0, 1, { scores: JSON.stringify({ player1: 'x', player2: 3, winner: 1 }) });
  assert.equal(summarizeStats([broken, badScores], OWNER).totals.all, 2);
  assert.deepEqual(recent([broken, badScores]).map((match) => match.sides), [null, null]);
});

test('the extra row only signals that another page exists', () => {
  const rows = Array.from({ length: PAGE + 1 }, (_, index) => duel(1, 0, 1, { matchID: index }));
  const page = summarizeRecent(rows, OWNER, PAGE);
  assert.equal(page.matches.length, PAGE);
  assert.equal(page.hasMore, true);
  assert.equal(summarizeRecent(rows.slice(0, PAGE), OWNER, PAGE).hasMore, false);
});

test('banners prefer the tournament with the same name and tolerate missing ones', () => {
  const result = withBanners(recent([duel(1, 0, 1), team()]), [
    { acronym: 'MC', name: 'Older', banner: 'https://img.test/old.png' },
    { acronym: 'MC', name: 'MC Cup', banner: 'https://img.test/new.png' },
    { acronym: 'TC', name: 'TC Cup', banner: null },
  ]);
  const banners = Object.fromEntries(result.map((match) => [match.tournament.acronym, match.banner]));
  assert.deepEqual(banners, { MC: 'https://img.test/new.png', TC: null });
});
