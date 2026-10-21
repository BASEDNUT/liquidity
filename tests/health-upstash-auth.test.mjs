import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

// S126: health Redis ping must be authenticated (unauth HEAD 401 = false negative).
test('health endpoint: authenticated Upstash ping', () => {
  const h = read('../pages/api/health.js');
  assert.ok(h.includes("process.env.UPSTASH_REDIS_REST_TOKEN"), 'must send auth token');
  assert.ok(!h.includes("{ method: 'HEAD' }"), 'unauthenticated HEAD ping must be gone');
  assert.ok(h.includes("Authorization: 'Bearer ' + process.env.UPSTASH_REDIS_REST_TOKEN"), 'bearer auth header missing');
});
