const QUALIFIERS = 'Qualifiers';
const MATCH_TYPES = new Set(['1vs1', 'teamVS']);
const MAX_LIST_ITEMS = 64;
const MAX_DISCORD_CHANNELS = 10;
const DISCORD_TIMEOUT_MS = 5_000;
const DISCORD_HOSTS = new Set(['discord.com', 'ptb.discord.com', 'canary.discord.com', 'discordapp.com']);
const DISCORD_WEBHOOK_PATH = /^\/api(\/v\d+)?\/webhooks\/\d+\/[\w-]+$/;
const BLANK_FIELD_NAME = '​';
const COLOR_RED = 16731212;
const COLOR_BLUE = 4748982;
const MEDALS = [':first_place:', ':second_place:', ':third_place:'];
const MOD_EMOJI = {
  NM: '<:nomod:868095234217750558>',
  NF: '<:nofail:868095234230353960>',
  EZ: '<:easy:868095234108710922>',
  HD: '<:hidden:868095234150658079>',
  HR: '<:hardrock:868095234129690664>',
  DT: '<:doubletime:868095234079350844>',
  HT: '<:halftime:943890234330972160>',
  FL: '<:flashlight:868095233932533781>',
};

const isText = (value, max) => typeof value === 'string' && value.length <= max;
const isFilledText = (value, max) => isText(value, max) && value.trim().length > 0;
const isList = (value, length) => Array.isArray(value) && value.length <= length;
const isDisplayScore = (value) => Number.isFinite(value) || isFilledText(value, 24);

function toCount(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  return /^\d{1,12}$/.test(String(value)) ? Number(value) : null;
}

function parsePlayer(value) {
  const userid = toCount(value?.userid);
  if (userid === null || !isFilledText(value?.username, 32)) return null;
  return { userid, username: value.username };
}

function parseMatchCost(value) {
  if (value === undefined) return [];
  if (!isList(value, MAX_LIST_ITEMS)) return null;

  const rows = value.map((row) => {
    const id = toCount(row?.id);
    if (id === null || !isFilledText(row?.username, 32)) return null;
    if ((row.side !== 'red' && row.side !== 'blue') || !Number.isFinite(row.cost) || row.cost < 0) return null;
    return { id, username: row.username, side: row.side, cost: row.cost };
  });

  return rows.includes(null) ? null : rows;
}

function parseQualifier(body) {
  const player = parsePlayer(body.player);
  const totalMaps = toCount(body.totalMaps);
  const { list, average } = body.scores ?? {};
  if (!player || totalMaps === null || !isList(list, MAX_LIST_ITEMS) || !isDisplayScore(average)) return null;

  const scores = [];
  for (const entry of list) {
    if (!isDisplayScore(entry?.score) || !isList(entry?.mods, 10)) return null;
    if (!entry.mods.every((mod) => isFilledText(mod, 4))) return null;
    scores.push({ score: entry.score, mods: entry.mods });
  }

  return { player, totalMaps, scores: { list: scores, average } };
}

function parseVersus(body) {
  const bestOF = toCount(body.bestOF);
  const warmups = toCount(body.warmups);
  const winner = body.scores?.winner;
  if (bestOF === null || warmups === null || (winner !== 1 && winner !== 2)) return null;

  if (body.matchType === '1vs1') {
    const players = isList(body.players, 2) ? body.players.map(parsePlayer) : [];
    const player1 = toCount(body.scores.player1);
    const player2 = toCount(body.scores.player2);
    if (players.length !== 2 || players.includes(null) || player1 === null || player2 === null) return null;
    return { bestOF, warmups, players, scores: { player1, player2, winner } };
  }

  const team1 = toCount(body.scores.team1);
  const team2 = toCount(body.scores.team2);
  if (!isList(body.teams, 2) || body.teams.length !== 2 || team1 === null || team2 === null) return null;
  if (!body.teams.every((team) => isFilledText(team, 64))) return null;
  return { bestOF, warmups, teams: body.teams, scores: { team1, team2, winner } };
}

// Returns only known fields, so nothing unvalidated reaches the database or Discord.
export function parseMatchExport(body) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return null;

  const matchID = toCount(body.matchID);
  const matchCost = parseMatchCost(body.matchCost);
  const { acronym, name } = body.tournament ?? {};
  const validStart = isFilledText(body.matchStart, 40) && !Number.isNaN(Date.parse(body.matchStart));

  if (
    matchID === null ||
    matchCost === null ||
    !validStart ||
    !MATCH_TYPES.has(body.matchType) ||
    !isFilledText(body.stage, 64) ||
    !isText(acronym, 32) ||
    !isText(name, 128)
  ) {
    return null;
  }

  const details = body.stage === QUALIFIERS ? parseQualifier(body) : parseVersus(body);
  if (!details) return null;

  return {
    matchID: String(matchID),
    matchType: body.matchType,
    stage: body.stage,
    tournament: { name, acronym },
    matchStart: body.matchStart,
    matchCost,
    ...details,
  };
}

export function toMatchRow(match, ownerId) {
  const shared = {
    owner: ownerId,
    matchID: match.matchID,
    matchType: match.matchType,
    stage: match.stage,
    tournament: JSON.stringify(match.tournament),
    scores: JSON.stringify(match.scores),
    startTime: match.matchStart,
  };

  if (match.stage === QUALIFIERS) {
    return { ...shared, player: JSON.stringify(match.player), totalMaps: match.totalMaps };
  }

  return {
    ...shared,
    bestOF: match.bestOF,
    warmups: match.warmups,
    // Team matches have no player pair, so this column holds their roster and match costs.
    players: JSON.stringify(match.matchType === '1vs1' ? match.players : match.matchCost),
    teams: JSON.stringify(match.teams ?? ''),
  };
}

const matchLink = (matchID) => `https://osu.ppy.sh/community/matches/${matchID}`;

function matchDuration(matchStart, now) {
  const minutes = Math.max(0, Math.round((now - Date.parse(matchStart)) / 60_000));
  return `Match duration: ${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function embedAuthor(match) {
  const { acronym, name } = match.tournament;
  return {
    name: `${acronym}${name ? ` - ${name}` : ''}`,
    url: matchLink(match.matchID),
    icon_url: 'https://akinariosu.s-ul.eu/f72xTlsv',
  };
}

function matchCostLines(match, side) {
  const ranked = [...match.matchCost].sort((a, b) => b.cost - a.cost);
  return match.matchCost
    .filter((row) => row.side === side)
    .map((row) => {
      const medal = MEDALS[ranked.indexOf(row)];
      const cost = row.cost.toFixed(2);
      return `[${row.username}](https://osu.ppy.sh/users/${row.id}): ${medal ? `**${cost}** ${medal}` : cost}`;
    });
}

function versusEmbed(match, now) {
  const isSolo = match.matchType === '1vs1';
  const names = isSolo ? match.players.map((player) => player.username) : match.teams;
  const redScore = isSolo ? match.scores.player1 : match.scores.team1;
  const blueScore = isSolo ? match.scores.player2 : match.scores.team2;
  const { winner } = match.scores;

  const redLabel = `${names[0]} | ${redScore}`;
  const blueLabel = `${blueScore} | ${names[1]}`;
  const redHeader = `${winner === 1 ? ':medal: ' : ''}:red_circle: ${winner === 1 ? `**${redLabel}**` : redLabel}`;
  const blueHeader = `${winner === 2 ? `**${blueLabel}**` : blueLabel} :blue_circle:${winner === 2 ? ' :medal:' : ''}`;

  return {
    author: embedAuthor(match),
    title: `${match.tournament.acronym}: (${names[0]}) vs (${names[1]})`.slice(0, 256),
    url: matchLink(match.matchID),
    fields: [
      {
        name: match.matchCost.length ? 'Match Cost' : 'Result',
        value: [redHeader, ...matchCostLines(match, 'red')].join('\n').slice(0, 1024),
        inline: true,
      },
      {
        name: BLANK_FIELD_NAME,
        value: [blueHeader, ...matchCostLines(match, 'blue')].join('\n').slice(0, 1024),
        inline: true,
      },
      {
        name: BLANK_FIELD_NAME,
        value: `${match.matchType} - ${match.stage} - BO${match.bestOF} - ${match.warmups} warmups - [MP Link](${matchLink(match.matchID)})`,
        inline: false,
      },
    ],
    color: winner === 1 ? COLOR_RED : COLOR_BLUE,
    footer: { text: matchDuration(match.matchStart, now) },
  };
}

function qualifierEmbed(match, ownerId, now) {
  const lines = match.scores.list.map(
    ({ mods, score }) => `${mods.map((mod) => MOD_EMOJI[mod] ?? mod).join('')} ${score}`
  );
  const summary = `**Average: ${match.scores.average}** - Played Maps: ${match.scores.list.length} - Total maps: ${match.totalMaps} - [MP Link](${matchLink(match.matchID)})`;

  return {
    author: embedAuthor(match),
    title: `${match.player.username}'s Qualifier`,
    url: matchLink(match.matchID),
    description: `${lines.join('\n')}\n${summary}`.slice(0, 4096),
    color: COLOR_BLUE,
    thumbnail: { url: `https://a.ppy.sh/${ownerId}` },
    footer: { text: matchDuration(match.matchStart, now) },
  };
}

export function buildDiscordMessage(match, ownerId, now = Date.now()) {
  return {
    embeds: [match.stage === QUALIFIERS ? qualifierEmbed(match, ownerId, now) : versusEmbed(match, now)],
    allowed_mentions: { parse: [] },
  };
}

// Stored URLs are server-side fetch targets, so anything but a Discord webhook is an SSRF risk.
export function toDiscordWebhookUrl(value) {
  if (typeof value !== 'string') return null;

  try {
    const url = new URL(value);
    const isDiscord =
      url.protocol === 'https:' &&
      DISCORD_HOSTS.has(url.hostname) &&
      url.port === '' &&
      url.username === '' &&
      url.password === '' &&
      DISCORD_WEBHOOK_PATH.test(url.pathname);
    return isDiscord ? `${url.origin}${url.pathname}` : null;
  } catch {
    return null;
  }
}

export function parseDiscordChannels(stored) {
  try {
    const channels = typeof stored === 'string' ? JSON.parse(stored) : stored;
    return Array.isArray(channels) ? channels : [];
  } catch {
    return [];
  }
}

export async function sendToDiscordChannels(channels, message) {
  const urls = [...new Set(channels.map((channel) => toDiscordWebhookUrl(channel?.WebhookURL)))]
    .filter(Boolean)
    .slice(0, MAX_DISCORD_CHANNELS);

  if (urls.length === 0) return 'skipped';

  const results = await Promise.allSettled(
    urls.map((url) =>
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
        cache: 'no-store',
        redirect: 'error',
        signal: AbortSignal.timeout(DISCORD_TIMEOUT_MS),
      })
    )
  );

  const delivered = results.filter((result) => result.status === 'fulfilled' && result.value.ok).length;
  if (delivered === urls.length) return 'sent';

  console.error(`Match export: delivered to ${delivered} of ${urls.length} Discord channels`);
  return 'failed';
}
