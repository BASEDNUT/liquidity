import assert from 'node:assert/strict';
import { deriveCarbonMetrics } from '../src/utils/carbonMetrics.mjs';

const issuer = Object.freeze({
  scope1T: 100,
  scope2T: 25,
  revenueUsd: 1_000,
  marketCapUsd: 2_500,
});

const result = deriveCarbonMetrics(issuer, 88);
assert.deepEqual(result, {
  scope12T: 125,
  annualBurdenUsd: 11_000,
  burdenToRevenue: 11,
  burdenToMarketCap: 4.4,
});
assert.equal(issuer.scope2T, 25, 'must not mutate source issuer');

assert.deepEqual(
  deriveCarbonMetrics({ scope1T: 100, scope2T: null, revenueUsd: 0, marketCapUsd: undefined }, 88),
  { scope12T: 100, annualBurdenUsd: 8_800, burdenToRevenue: null, burdenToMarketCap: null },
  'missing Scope 2 normalizes to zero; absent financial denominators remain unavailable',
);

assert.deepEqual(
  deriveCarbonMetrics({ scope1T: undefined, scope2T: 50, revenueUsd: 1, marketCapUsd: 1 }, 88),
  { scope12T: null, annualBurdenUsd: null, burdenToRevenue: null, burdenToMarketCap: null },
  'missing Scope 1 invalidates the operational-emissions model',
);

assert.deepEqual(
  deriveCarbonMetrics({ scope1T: 10, scope2T: 5, revenueUsd: -1, marketCapUsd: NaN }, 0),
  { scope12T: 15, annualBurdenUsd: null, burdenToRevenue: null, burdenToMarketCap: null },
  'zero benchmark and invalid denominators do not emit misleading ratios',
);

console.log('carbonMetrics: 4 tests passed');
