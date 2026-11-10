import { createHash } from 'node:crypto';

const ME_URL = 'https://osu.ppy.sh/api/v2/me';
const CACHE_MS = 5 * 60_000;
const MAX_CACHED = 2000;
const TIMEOUT_MS = 5000;
const cache = new Map();

const hashOf = (token) => createHash('sha256').update(token).digest('hex');

export function bearerToken(request) {
  const header = request.headers.get('authorization') ?? '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

// Only a hash of the token is kept, and the account always comes from osu!, never from the client.
export async function osuUserId(token, now = Date.now(), fetcher = fetch) {
  if (!token) return null;
  const key = hashOf(token);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) return cached.id;

  const response = await fetcher(ME_URL, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw new Error('osu! is unavailable');

  const id = (await response.json())?.id;
  if (!Number.isSafeInteger(id) || id <= 0) return null;

  if (cache.size >= MAX_CACHED) cache.clear();
  cache.set(key, { id, expiresAt: now + CACHE_MS });
  return id;
}
