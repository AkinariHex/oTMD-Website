const QUALIFIERS = 'Qualifiers';
const TOP_TOURNAMENTS = 5;
const RECENT_MATCHES = 8;
const RECENT_ROOMS = 5;

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

function summarizeVersus(row, ownerId) {
  const scores = parseJson(row.scores) ?? {};
  const players = parseJson(row.players);
  const teams = parseJson(row.teams);

  if (row.matchType === '1vs1' && Array.isArray(players) && players.length === 2) {
    const side = players.findIndex((player) => sameUser(player?.userid, ownerId));
    const opponent = side === -1 ? null : players[side === 0 ? 1 : 0]?.username ?? null;
    const own = side === 0 ? scores.player1 : scores.player2;
    const other = side === 0 ? scores.player2 : scores.player1;
    return {
      opponent,
      score: side === -1 ? null : `${own} - ${other}`,
      won: side === -1 || !scores.winner ? null : scores.winner === side + 1,
    };
  }

  if (Array.isArray(teams) && teams.length === 2) {
    return { opponent: `${teams[0]} vs ${teams[1]}`, score: `${scores.team1} - ${scores.team2}`, won: null };
  }

  return { opponent: null, score: null, won: null };
}

function typeOf(row) {
  if (row.stage === QUALIFIERS) return 'qualifiers';
  return row.matchType === '1vs1' ? 'oneVsOne' : 'teamVS';
}

function topTournaments(counts) {
  return [...counts.values()].sort((first, second) => second.count - first.count).slice(0, TOP_TOURNAMENTS);
}

function summarizeRoom(row, ownerId) {
  const players = parseJson(row.players);
  const list = Array.isArray(players) ? players : [];
  const own = list.find((player) => sameUser(player?.id, ownerId));
  const other = list.find((player) => player && !sameUser(player.id, ownerId));
  return {
    roomId: row.room_id,
    endedAt: row.ended_at,
    rounds: row.total_rounds,
    won: own ? Boolean(own.won) : null,
    opponent: other?.username ?? null,
  };
}

// The owner is re-checked here so a query mistake cannot mix another account into the result.
export function summarizeStats(matchRows, roomRows, ownerId) {
  const matches = matchRows.filter((row) => sameUser(row.owner, ownerId));
  const totals = { all: matches.length, oneVsOne: 0, teamVS: 0, qualifiers: 0 };
  const oneVsOne = { wins: 0, losses: 0 };
  const tournaments = new Map();

  const summarized = matches.map((row) => {
    const type = typeOf(row);
    totals[type] += 1;

    const tournament = parseJson(row.tournament);
    const acronym = typeof tournament?.acronym === 'string' ? tournament.acronym : '';
    if (acronym) {
      const entry = tournaments.get(acronym) ?? { acronym, name: tournament.name ?? '', count: 0 };
      entry.count += 1;
      tournaments.set(acronym, entry);
    }

    const details = type === 'qualifiers' ? { opponent: null, score: null, won: null } : summarizeVersus(row, ownerId);
    if (type === 'oneVsOne' && details.won !== null) oneVsOne[details.won ? 'wins' : 'losses'] += 1;

    return { matchID: row.matchID, type, stage: row.stage, tournament: acronym, startTime: row.startTime, ...details };
  });

  const newestFirst = (first, second) => String(second.startTime).localeCompare(String(first.startTime));
  const rooms = roomRows.filter((row) => sameUser(row.created_by, ownerId));

  return {
    totals,
    oneVsOne,
    topTournaments: topTournaments(tournaments),
    recentMatches: summarized.sort(newestFirst).slice(0, RECENT_MATCHES),
    recentRooms: rooms.slice(0, RECENT_ROOMS).map((row) => summarizeRoom(row, ownerId)),
  };
}
