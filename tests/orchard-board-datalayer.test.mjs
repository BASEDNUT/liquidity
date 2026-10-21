import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

// S126 Phase C: board API reads container-pushed metrics from Upstash first.
test('api route: pushed-metrics read-switch present', () => {
  const api = read('../pages/api/orchard-board.js');
  // pushed key read before anything else
  assert.ok(api.includes("'orchard:metrics:v1'"), 'pushed key constant missing');
  // freshness guard on pushedAt
  assert.ok(api.includes('pushedFresh'), 'pushed freshness guard missing');
  // NSI source priority: pushed -> iris
  assert.ok(api.includes("nsiSource"), 'nsi source tracking missing');
  // pushed tvl/poolCount preferred when fresh
  assert.ok(api.includes('pushed.tvl'), 'pushed tvl preference missing');
  assert.ok(api.includes('pushed.poolCount'), 'pushed poolCount preference missing');
  // fallback layers retained
  assert.ok(api.includes('/mcp/nsi'), 'IRIS fallback missing');
  assert.ok(api.includes('aggregateOrchardTVL'), 'site aggregation fallback missing');
});

test('api route: response keeps banner contract fields', () => {
  const api = read('../pages/api/orchard-board.js');
  for (const f of ['tvl', 'assets', 'pools', 'volume24hTotal', 'priceChange24hAvg', 'nsi', 'boardState', 'nsiError', 'checkedAt']) {
    assert.ok(new RegExp('\\b' + f + '\\b').test(api), 'field missing: ' + f);
  }
  // push age surfaced for the board ts
  assert.ok(api.includes('pushedAt'), 'pushedAt passthrough missing');
});

test('api route: no localhost default leak into production path', () => {
  const api = read('../pages/api/orchard-board.js');
  // IRIS direct fetch must be env-gated: only explicit IRIS_BASE_URL enables it
  assert.ok(api.includes("process.env.IRIS_BASE_URL"), 'IRIS_BASE_URL env gate missing');
  assert.ok(!api.includes("|| 'http://localhost:9000'"), 'localhost default must be gone');
});
