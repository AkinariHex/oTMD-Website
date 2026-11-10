import assert from 'node:assert/strict';
import test from 'node:test';
import { summarizeStats } from './matchStats.js';

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

test('counts wins from the side the owner played on', () => {
  const stats = summarizeStats([duel(1, 0, 1), duel(2, 1, 1), duel(3, 1, 2)], [], OWNER);
  assert.deepEqual(stats.oneVsOne, { wins: 2, losses: 1 });
  assert.equal(stats.totals.oneVsOne, 3);
  assert.equal(stats.recentMatches[0].matchID, 3);
  assert.equal(stats.recentMatches[0].opponent, 'them');
  assert.equal(stats.recentMatches[0].score, '3 - 5');
});

test('rows of other accounts are never counted', () => {
  const stats = summarizeStats([duel(1, 0, 1), duel(2, 0, 1, { owner: 99 })], [{ created_by: 99, room_id: 1, players: [] }], OWNER);
  assert.equal(stats.totals.all, 1);
  assert.equal(stats.recentMatches.length, 1);
  assert.equal(stats.recentRooms.length, 0);
});

test('team matches and qualifiers do not affect the 1vs1 record', () => {
  const team = { owner: OWNER, matchID: 4, matchType: 'teamVS', stage: 'Finals', tournament: tournament('TC'), startTime: 'x', teams: JSON.stringify(['A', 'B']), scores: JSON.stringify({ team1: 5, team2: 2, winner: 1 }) };
  const qualifier = { owner: OWNER, matchID: 5, matchType: '1vs1', stage: 'Qualifiers', tournament: tournament('TC'), startTime: 'y', scores: '{}' };
  const stats = summarizeStats([team, qualifier], [], OWNER);
  assert.deepEqual(stats.oneVsOne, { wins: 0, losses: 0 });
  assert.deepEqual([stats.totals.teamVS, stats.totals.qualifiers], [1, 1]);
  assert.deepEqual(stats.topTournaments, [{ acronym: 'TC', name: 'TC Cup', count: 2 }]);
});

test('malformed legacy rows are skipped safely', () => {
  const broken = { owner: OWNER, matchID: 6, matchType: '1vs1', stage: 'Finals', tournament: 'not json', players: '""', scores: '{', startTime: null };
  const stats = summarizeStats([broken], [], OWNER);
  assert.equal(stats.totals.all, 1);
  assert.equal(stats.recentMatches[0].won, null);
  assert.deepEqual(stats.topTournaments, []);
});

test('ranked rooms report the outcome for the owner', () => {
  const room = { created_by: OWNER, room_id: 11, ended_at: 'z', total_rounds: 5, players: [{ id: OWNER, username: 'me', won: true }, { id: 9, username: 'them', won: false }] };
  assert.deepEqual(summarizeStats([], [room], OWNER).recentRooms, [{ roomId: 11, endedAt: 'z', rounds: 5, won: true, opponent: 'them' }]);
});
