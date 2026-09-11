import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = (p) => readFileSync(p, 'utf8');

// /pair-your-token massive update (S84, Boss order):
// full NUT-pair table (external 8 + inner strip), topology-change graphic,
// verified addresses + working links. Interactive pairing tool stays.

assert.ok(existsSync('pages/pair-your-token.js'), 'page missing');
const src = read('pages/pair-your-token.js');

// Group 1: page chrome + tool preserved
assert.ok(src.includes('import Layout from "../components/Layout"'), 'must use site Layout');
assert.ok(src.includes('Pair With NUT | BASED NUT'), 'title missing');
assert.ok(src.includes('PAIR_TOKENS'), 'interactive pairing tool must stay');
assert.ok(src.includes('aerodrome.finance/liquidity'), 'Aerodrome venue CTA must stay');
assert.ok(src.includes('app.uniswap.org/positions'), 'Uniswap venue CTA must stay');
assert.ok(src.includes('balancer.fi/create'), 'Balancer venue CTA must stay');
assert.ok(src.includes('paste your token address'), 'custom token input must stay');

// Group 2: external pair table — all 8 verified tokens (registry, on-chain July 29)
const EXTERNAL = [
  ['wETH', '0x4200000000000000000000000000000000000006'],
  ['AERO', '0x940181a94a35a4569e4529a3cdfb74e38fd98631'],
  ['cbBTC', '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf'],
  ['cbETH', '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22'],
  ['NULL', '0x0a14ef61afb32e5ca672e021784f71705ac14908'],
  ['CHAD', '0xecaf81eb42cd30014eb44130b89bcd6d4ad98b92'],
  ['USD+', '0xb79dd08ea68a908a97220c76d19a6aa9cbde4376'],
  ['sFRAX', '0xe4796ccb6bb5de2290c417ac337f2b66ca2e770e'],
];
for (const [sym, addr] of EXTERNAL) {
  assert.ok(src.includes(`"${sym}"`), `external pair missing: ${sym}`);
  assert.ok(src.toLowerCase().includes(addr.toLowerCase()), `address missing for ${sym}`);
  assert.ok(src.includes(`https://basescan.org/token/${addr}`) || src.includes('basescan.org/token/" + row.addr') || src.includes('basescan.org/token/${t.addr}') || src.includes('scanUrl'), `basescan link pattern missing for ${sym}`);
}
assert.ok(src.includes('Already paired'), 'pair table section heading missing');
assert.ok(src.includes('Uniswap V3'), 'venue column must name Uniswap V3');
assert.ok(src.includes('Aerodrome'), 'venue column must name Aerodrome');
assert.ok(src.includes('July 29'), 'TVL verification date must be stated');

// Group 3: inner/ecosystem pairings separated from external
assert.ok(src.includes('Ecosystem pairings'), 'inner strip heading missing');
for (const inner of ['SNUT', 'PIPS', 'SALT', 'NUTINO']) {
  assert.ok(src.includes(`"${inner}"`) || src.includes(`>${inner}<`), `inner pair missing: ${inner}`);
}
assert.ok(src.includes('PNUTS') && src.includes('ALMD') && src.includes('SALMD') && src.includes('PNUTRMY'), 'NFT bonding curves must be listed');

// Group 4: topology-change graphic — before/after pairing
assert.ok(src.includes('topology'), 'topology graphic heading missing');
assert.ok(src.toLowerCase().includes('isolated'), 'before-state (isolated) missing');
assert.ok(src.toLowerCase().includes('connected'), 'after-state (connected) missing');
assert.ok(src.includes('before'), 'before panel missing');
assert.ok(src.includes('after'), 'after panel missing');
assert.ok(/ring|route/i.test(src), 'new-route/ring indication missing');
assert.ok(src.includes('<svg'), 'SVG graphic required (homepage-style)');

// Group 5: working links + references
assert.ok(src.includes('/token/nut'), 'NUT token page link missing');
assert.ok(src.includes('docs.basednut.com'), 'docs reference missing');
assert.ok(src.includes('/atlas'), 'atlas reference missing');

// Group 6: test chained
const pkg = read('package.json');
assert.ok(pkg.includes('pair-page.test.mjs'), 'test must be chained into npm test');

console.log('pair-page: all groups passed');
