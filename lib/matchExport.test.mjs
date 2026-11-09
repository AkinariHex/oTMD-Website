// Run: node --test lib/matchExport.test.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildDiscordMessage,
  parseDiscordChannels,
  parseMatchExport,
  sendToDiscordChannels,
  toDiscordWebhookUrl,
  toMatchRow,
} from './matchExport.js';

const WEBHOOK = 'https://discord.com/api/webhooks/123/abc-DEF_1';

const base = {
  matchID: '111',
  tournament: { name: 'Cup', acronym: 'TC' },
  matchStart: '2026-11-09T10:00:00Z',
};

const solo = {
  ...base,
  matchType: '1vs1',
  stage: 'Finals',
  bestOF: 13,
  warmups: 2,
  players: [
    { userid: '1', username: 'alice', isMe: true },
    { userid: 2, username: 'bob' },
  ],
  scores: { player1: 7, player2: 3, winner: 1 },
  matchCost: [
    { id: 1, username: 'alice', side: 'red', cost: 1.25 },
    { id: 2, username: 'bob', side: 'blue', cost: 0.75 },
  ],
};

const team = {
  ...base,
  matchType: 'teamVS',
  stage: 'Semifinals',
  bestOF: 9,
  warmups: 0,
  teams: ['Red Team', 'Blue Team'],
  scores: { team1: 2, team2: 5, winner: 2 },
};

const qualifier = {
  ...base,
  matchType: '1vs1',
  stage: 'Qualifiers',
  player: { userid: 9, username: 'carol' },
  totalMaps: 8,
  scores: { list: [{ score: '1,000,000', mods: ['HD', 'XX'] }], average: '1,000,000' },
};

test('valid payloads keep only known fields', () => {
  const parsed = parseMatchExport({ ...solo, owner: 999, me: 999, webapikey: 'k', extra: 'x' });
  assert.equal(parsed.owner, undefined);
  assert.equal(parsed.extra, undefined);
  assert.equal(parsed.webapikey, undefined);
  assert.deepEqual(parsed.players[0], { userid: 1, username: 'alice' });
  assert.equal(parsed.matchID, '111');
  assert.ok(parseMatchExport(team));
  assert.ok(parseMatchExport(qualifier));
  assert.deepEqual(parseMatchExport(team).matchCost, []);
});

test('invalid payloads are rejected', () => {
  const invalid = [
    null,
    [],
    'text',
    { ...solo, matchID: '1; drop' },
    { ...solo, matchID: { $ne: 1 } },
    { ...solo, matchType: 'other' },
    { ...solo, stage: '' },
    { ...solo, matchStart: 'never' },
    { ...solo, tournament: undefined },
    { ...solo, tournament: { name: 'x'.repeat(129), acronym: 'A' } },
    { ...solo, players: [solo.players[0]] },
    { ...solo, players: [solo.players[0], { userid: 'evil', username: 'x' }] },
    { ...solo, scores: { player1: 1, player2: 2, winner: null } },
    { ...solo, scores: { player1: -1, player2: 2, winner: 1 } },
    { ...solo, matchCost: [{ id: 'x', username: 'a', side: 'red', cost: 1 }] },
    { ...solo, matchCost: [{ id: 1, username: 'a', side: 'green', cost: 1 }] },
    { ...solo, matchCost: [{ id: 1, username: 'a', side: 'red', cost: -1 }] },
    { ...team, teams: ['one'] },
    { ...team, teams: ['one', 7] },
    { ...qualifier, scores: { list: 'x', average: 1 } },
    { ...qualifier, player: { username: 'no id' } },
  ];

  for (const body of invalid) {
    assert.equal(parseMatchExport(body), null, JSON.stringify(body));
  }
});

test('database row owner comes from the authenticated user', () => {
  const row = toMatchRow(parseMatchExport({ ...solo, owner: 999 }), 42);
  assert.equal(row.owner, 42);
  assert.equal(row.startTime, solo.matchStart);
  assert.equal(row.teams, '""');
  assert.deepEqual(JSON.parse(row.scores), solo.scores);

  const qualifierRow = toMatchRow(parseMatchExport(qualifier), 42);
  assert.equal(qualifierRow.totalMaps, 8);
  assert.equal(qualifierRow.players, undefined);
});

test('discord message shows result, medals, and never pings', () => {
  const now = Date.parse('2026-11-09T11:30:00Z');
  const message = buildDiscordMessage(parseMatchExport(solo), 42, now);
  const [embed] = message.embeds;

  assert.deepEqual(message.allowed_mentions, { parse: [] });
  assert.equal(embed.title, 'TC: (alice) vs (bob)');
  assert.equal(embed.color, 16731212);
  assert.equal(embed.footer.text, 'Match duration: 1h 30m');
  assert.match(embed.fields[0].value, /\*\*alice \| 7\*\*/);
  assert.match(embed.fields[0].value, /\[alice\]\(https:\/\/osu\.ppy\.sh\/users\/1\): \*\*1\.25\*\* :first_place:/);
  assert.match(embed.fields[1].value, /\[bob\].*:second_place:/);

  const teamEmbed = buildDiscordMessage(parseMatchExport(team), 42, now).embeds[0];
  assert.equal(teamEmbed.color, 4748982);
  assert.equal(teamEmbed.fields[0].name, 'Result');
  assert.match(teamEmbed.fields[1].value, /\*\*5 \| Blue Team\*\*/);

  const qualifierEmbed = buildDiscordMessage(parseMatchExport(qualifier), 42, now).embeds[0];
  assert.equal(qualifierEmbed.title, "carol's Qualifier");
  assert.match(qualifierEmbed.description, /<:hidden:868095234150658079>XX 1,000,000/);
  assert.ok(qualifierEmbed.description.includes('Total maps: 8'));
});

test('only real Discord webhooks are accepted', () => {
  assert.equal(toDiscordWebhookUrl(WEBHOOK), WEBHOOK);
  assert.equal(toDiscordWebhookUrl(`${WEBHOOK}?wait=true`), WEBHOOK);

  const rejected = [
    'http://discord.com/api/webhooks/123/abc',
    'https://evil.test/api/webhooks/123/abc',
    'https://discord.com.evil.test/api/webhooks/123/abc',
    'https://discord.com@evil.test/api/webhooks/123/abc',
    'https://user:pw@discord.com/api/webhooks/123/abc',
    'https://discord.com:8443/api/webhooks/123/abc',
    'https://discord.com/api/users/@me',
    'https://discord.com/api/webhooks/123/abc/../../users/@me',
    'http://169.254.169.254/latest/meta-data',
    'not a url',
    null,
    42,
  ];

  for (const value of rejected) {
    assert.equal(toDiscordWebhookUrl(value), null, String(value));
  }
});

test('stored channels tolerate bad data', () => {
  assert.deepEqual(parseDiscordChannels('[{"WebhookURL":"x"}]'), [{ WebhookURL: 'x' }]);
  assert.deepEqual(parseDiscordChannels([{ a: 1 }]), [{ a: 1 }]);
  assert.deepEqual(parseDiscordChannels('broken'), []);
  assert.deepEqual(parseDiscordChannels('{}'), []);
  assert.deepEqual(parseDiscordChannels(null), []);
});

test('delivery posts only safely, once per URL, and logs no webhook', async () => {
  const calls = [];
  const logged = [];
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  console.error = (...args) => logged.push(args.join(' '));

  try {
    globalThis.fetch = async (url, init) => {
      calls.push({ url, init });
      return new Response(null, { status: 204 });
    };

    const channels = [{ WebhookURL: WEBHOOK }, { WebhookURL: WEBHOOK }, { WebhookURL: 'http://169.254.169.254/' }, null];
    assert.equal(await sendToDiscordChannels(channels, { embeds: [] }), 'sent');
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, WEBHOOK);
    assert.equal(calls[0].init.redirect, 'error');

    assert.equal(await sendToDiscordChannels([{ WebhookURL: 'https://evil.test/' }], {}), 'skipped');
    assert.equal(calls.length, 1);

    globalThis.fetch = async () => new Response(null, { status: 404 });
    assert.equal(await sendToDiscordChannels([{ WebhookURL: WEBHOOK }], {}), 'failed');

    globalThis.fetch = async () => {
      throw new Error('down');
    };
    assert.equal(await sendToDiscordChannels([{ WebhookURL: WEBHOOK }], {}), 'failed');
    assert.ok(logged.length > 0 && logged.every((line) => !line.includes('abc-DEF')));
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalError;
  }
});
