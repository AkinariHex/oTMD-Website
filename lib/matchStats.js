const QUALIFIERS = 'Qualifiers';
const TOP_TOURNAMENTS = 5;
const NOT_VERSUS = { sides: null, won: null, winner: null };

// Older rows store these columns as JSON text, and some of them hold nothing useful.
function parseJson(value) {
  if (typeof value !== 'string') return value ?? null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function sameUser(first, second) {
  return first !== undefined && first !== null && String(first) === String(second);
}

function toScore(value) {
  const score = Number(value);
  return value !== null && value !== '' && Number.isFinite(score) ? score : null;
}

// The owner's side always comes first, so the dashboard can read left as "you".
function buildVersus(names, rawScores, rosters, ownerIndex, winnerNumber) {
  const scores = rawScores.map(toScore);
  if (scores.includes(null)) return NOT_VERSUS;

  const order = ownerIndex === 1 ? [1, 0] : [0, 1];
  const winner = winnerNumber === 1 || winnerNumber === 2 ? order.indexOf(winnerNumber - 1) : null;
  return {
    sides: order.map((index) => ({ name: names[index], score: scores[index], players: rosters[index] })),
    winner,
    won: ownerIndex === -1 || winner === null ? null : winner === 0,
  };
}

function rosterOf(rows, side) {
  return rows.filter((row) => row?.side === side).map(({ id, username, cost }) => ({ id, username, cost }));
}

function summarizeVersus(row, ownerId) {
  const scores = parseJson(row.scores) ?? {};
  const players = parseJson(row.players);
  const teams = parseJson(row.teams);

  if (row.matchType === '1vs1' && Array.isArray(players) && players.length === 2) {
    const ownerIndex = players.findIndex((player) => sameUser(player?.userid, ownerId));
    const names = players.map((player) => player?.username ?? '');
    return buildVersus(names, [scores.player1, scores.player2], [[], []], ownerIndex, scores.winner);
  }

  if (Array.isArray(teams) && teams.length === 2) {
    const rows = Array.isArray(players) ? players : [];
    const ownerSide = rows.find((player) => sameUser(player?.id, ownerId))?.side;
    const ownerIndex = ownerSide === 'red' ? 0 : ownerSide === 'blue' ? 1 : -1;
    const rosters = [rosterOf(rows, 'red'), rosterOf(rows, 'blue')];
    return buildVersus(teams, [scores.team1, scores.team2], rosters, ownerIndex, scores.winner);
  }

  return NOT_VERSUS;
}

function typeOf(row) {
  if (row.stage === QUALIFIERS) return 'qualifiers';
  return row.matchType === '1vs1' ? 'oneVsOne' : 'teamVS';
}

function topTournaments(counts) {
  return [...counts.values()].sort((first, second) => second.count - first.count).slice(0, TOP_TOURNAMENTS);
}

function tournamentOf(row) {
  const tournament = parseJson(row.tournament);
  return {
    acronym: typeof tournament?.acronym === 'string' ? tournament.acronym : '',
    name: typeof tournament?.name === 'string' ? tournament.name : '',
  };
}

// Rows that can't be drawn stay in the page with `sides: null`, so offsets keep matching the table.
export function summarizeRecent(matchRows, ownerId, pageSize) {
  const rows = matchRows.filter((row) => sameUser(row.owner, ownerId));
  const matches = rows.slice(0, pageSize).map((row) => {
    const type = typeOf(row);
    const details = type === 'qualifiers' ? NOT_VERSUS : summarizeVersus(row, ownerId);
    return { matchID: row.matchID, type, stage: row.stage, tournament: tournamentOf(row), banner: null, startTime: row.startTime, ...details };
  });
  return { matches, hasMore: rows.length > pageSize };
}

// The owner is re-checked here so a query mistake cannot mix another account into the result.
export function summarizeStats(matchRows, ownerId) {
  const matches = matchRows.filter((row) => sameUser(row.owner, ownerId));
  const totals = { all: matches.length, oneVsOne: 0, teamVS: 0, qualifiers: 0 };
  const oneVsOne = { wins: 0, losses: 0 };
  const tournaments = new Map();

  for (const row of matches) {
    const type = typeOf(row);
    totals[type] += 1;

    const { acronym, name } = tournamentOf(row);
    if (acronym) {
      const entry = tournaments.get(acronym) ?? { acronym, name, count: 0 };
      entry.count += 1;
      tournaments.set(acronym, entry);
    }

    const details = type === 'qualifiers' ? NOT_VERSUS : summarizeVersus(row, ownerId);
    if (type === 'oneVsOne' && details.won !== null) oneVsOne[details.won ? 'wins' : 'losses'] += 1;
  }

  return { totals, oneVsOne, topTournaments: topTournaments(tournaments) };
}

export function withBanners(matches, tournamentRows) {
  return matches.map((match) => {
    const candidates = tournamentRows.filter((row) => row.acronym === match.tournament.acronym && typeof row.banner === 'string' && row.banner);
    const found = candidates.find((row) => row.name === match.tournament.name) ?? candidates[0];
    return { ...match, banner: found?.banner ?? null };
  });
}
