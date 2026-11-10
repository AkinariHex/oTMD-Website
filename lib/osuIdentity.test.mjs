import assert from 'node:assert/strict';
import test from 'node:test';
import { osuUserId } from './osuIdentity.js';

const answering = (status, body) => {
  const fetcher = async () => {
    fetcher.calls += 1;
    return { status, ok: status >= 200 && status < 300, json: async () => body };
  };
  fetcher.calls = 0;
  return fetcher;
};

test('the account comes from osu! and is cached by token', async () => {
  const fetcher = answering(200, { id: 7 });
  assert.equal(await osuUserId('token-a', 1000, fetcher), 7);
  assert.equal(await osuUserId('token-a', 2000, fetcher), 7);
  assert.equal(fetcher.calls, 1);
});

test('different tokens are different accounts', async () => {
  assert.equal(await osuUserId('token-b', 1000, answering(200, { id: 8 })), 8);
  assert.equal(await osuUserId('token-c', 1000, answering(200, { id: 9 })), 9);
});

test('the cache expires', async () => {
  const fetcher = answering(200, { id: 7 });
  await osuUserId('token-d', 1000, fetcher);
  await osuUserId('token-d', 1000 + 6 * 60_000, fetcher);
  assert.equal(fetcher.calls, 2);
});

test('rejected tokens have no account', async () => {
  assert.equal(await osuUserId('token-e', 1000, answering(401, {})), null);
  assert.equal(await osuUserId('', 1000, answering(200, { id: 7 })), null);
  assert.equal(await osuUserId('token-f', 1000, answering(200, { id: 'x' })), null);
});

test('an osu! outage is an error, not a logged-out user', async () => {
  await assert.rejects(osuUserId('token-g', 1000, answering(503, {})));
});
