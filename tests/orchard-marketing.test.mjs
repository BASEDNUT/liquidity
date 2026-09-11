import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = (p) => readFileSync(p, 'utf8');

// Orchard marketing layer — Boss-supplied based-nut-orchard-v15 index.html, S84 evolution:
// v1 port (chrome stripped, board embedded) -> de-slop -> pedagogy -> bottom-up architecture.
// Final shape: intro (two forms first) -> structures -> soil/scions -> groves -> market types
// -> MetaDEX (arb mechanism, pollination named after) -> living markets -> NUT allocation
// -> ecosystem examples -> boundaries. Machine/canopy-forms/canopy-reveal moved OUT of homepage.

// Group 1: component + page wiring
assert.ok(existsSync('components/OrchardMarketing.js'), 'component missing');
const comp = read('components/OrchardMarketing.js');
const idx = read('pages/index.js');
assert.ok(idx.includes('import OrchardMarketing from "../components/OrchardMarketing"'), 'index import missing');
assert.ok(idx.includes('<OrchardMarketing'), 'index render missing');
assert.ok(idx.includes('/img/hero-logo.png'), 'hero must stay untouched');
assert.ok(idx.includes('PoolCard') && idx.includes('TokenCard'), 'cards must stay');
assert.ok(!idx.includes('<OrchardBoard'), 'standalone board must stay inside marketing layer');

// Group 2: bottom-up section order — position-asserted
const POS = ['advanced-intro', 'scale-section', 'structure-section', 'soil-section',
  'projection-section', 'physics-section', 'metadex-section', 'ecology-section',
  'factor-section', 'microclimate', 'whorl-family', 'credit-section',
  'claim-section', 'boundary-section', 'boardwrap', 'plant'];
let last = -1;
for (const sec of POS) {
  const i = comp.indexOf(`"${sec}"`);
  assert.ok(i >= 0, `section missing: ${sec}`);
  assert.ok(i > last, `order broken: ${sec} before ${POS[POS.indexOf(sec) - 1]}`);
  last = i;
}

// Group 3: advanced sections REMOVED from homepage
for (const gone of ['machine-section', 'canopy-forms', 'canopy-reveal']) {
  assert.ok(!comp.includes(`"${gone}"`), `advanced section must be gone from homepage: ${gone}`);
}

// Group 4: homepage copy anchors — bottom-up plain language
for (const h of [
  'Five layers, one Orchard.',
  'The root token. Supply = 1, forever.',
  'NUT comes in two forms.',
  'Some pools use NUT directly',
  'use wNUT. We call these the NUT scale and the wNUT scale.',
  'Shape changes the object.',
  'Two assets, one pool.',
  'Groves group the pools.',
  'The Orchard uses several kinds of markets.',
  'The market between markets has no pool.',
  'Arbitrage is the mechanism. Pollination is our name for the price transmission it causes.',
  'If NUT is cheaper on Uniswap than Aerodrome, an arbitrageur buys on Uniswap and sells on Aerodrome',
  'There is exactly 1 NUT. At any moment, slices of it sit in wallets',
  'What SNUT does.',
  'Liquidity on liquidity.',
  'Some systems feed the Orchard without joining it.',
  'Under the bark',
  'ROOT IT INTO THE ORCHARD',
]) assert.ok(comp.includes(h), `missing copy anchor: ${h}`);

// Group 5: field notes renumbered in presentation order, MetaDEX after market types
for (const fn of ['Field note · 001 / two forms', 'Field note · 002 / structures',
  'Field note · 003 / soil &amp; scions', 'Field note · 004 / groves',
  'Field note · 005 / market types', 'Field note · 006 / MetaDEX',
  'Field note · 007 / living markets', 'Field note · 008 / NUT allocation',
  'Field note · 009 / SNUT', 'Field note · 010 / whorl family',
  'Field note · 011 / nutUSD', 'Field note · 012 / recursive liquidity',
  'Field note · 013 / boundaries']) {
  assert.ok(comp.includes(fn), `field note missing: ${fn}`);
}
assert.ok(comp.indexOf('Field note · 005 / market types') < comp.indexOf('Field note · 006 / MetaDEX'), 'MetaDEX must come after market types');

// Group 6: no equations, no private notation, no forward-ref jargon
for (const bad of ['𝒪', 'Ω', 'Tₐ(', 'Bᵢⱼ', 'Gᵢⱼ', 'W = {aᵢ', 'xᴬ = xᴮ',
  'machine-under', 'rewrite-chain', 'observatory', 'graphbox', 'state-machine-v9',
  'arity', 'Arity', 'ROOTSTOCK</text>', 'rootstock state', 'wNUT rootstock',
  'parity arbitrage', 'communication</small>', 'not merely receipts',
  'multiplex liquidity hypergraph', '4-merous']) {
  assert.ok(!comp.includes(bad), `jargon/notation residual: ${bad}`);
}
assert.ok(comp.includes('x · y = k'), 'canonical x·y=k may stay');

// Group 7: OUR live board embedded after boundaries, before plant CTA
const aRender = comp.indexOf('dangerouslySetInnerHTML={{ __html: PART_A }}');
const boardRender = comp.indexOf('<OrchardBoard');
const cRender = comp.indexOf('dangerouslySetInnerHTML={{ __html: PART_C }}');
assert.ok(aRender >= 0 && boardRender >= 0 && cRender >= 0, 'render markers missing');
assert.ok(aRender < boardRender && boardRender < cRender, 'board position broken');
assert.ok(comp.includes('Data sources:'), 'data sources caption missing');
assert.ok(comp.includes('All NUTs — live board'), 'live board heading missing');

// Group 8: links + CTA + docs
assert.ok(comp.includes('href="/pair-your-token"'), 'CTA must point at /pair-your-token');
assert.ok(comp.includes('href="/atlas"') && comp.includes('href="/atlas/data"'), 'atlas links missing');
for (const l of ['/token/nut"', '/token/wnut"', '/token/snut"', '/token/pnut"',
  '/pool/nut-weth-uniswap-v3"', '/sunflower-grove', 'docs.basednut.com/technical/glossary']) {
  assert.ok(comp.includes(l), `link missing: ${l}`);
}

// Group 9: CSS scoped + dark explanatory text
assert.ok(comp.includes('.orchard-marketing{--soil'), 'CSS vars must scope to .orchard-marketing');
for (const leak of [':root{', 'body{', 'html{', '>footer', '<footer']) {
  assert.ok(!comp.includes(leak), `global CSS leak: ${leak}`);
}
assert.ok(comp.includes('color:#453325'), 'explanatory text must be darkest brown');
assert.ok(!comp.includes('color:#5f4a3e') && !comp.includes('color:#6a5245'), 'mid browns must be darkened');

// Group 10: hero (Boss request) + stripped v15 chrome
for (const want of ['class="hero"', 'class="canopy"', 'class="tree ', 'THE ORCHARD']) {
  assert.ok(comp.includes(want), `hero missing: ${want}`);
}
assert.ok(comp.includes('@keyframes orchardFloat'), 'hero keyframes renamed');
for (const bad of ['class="topbar"', 'class="explorer"', 'token-grid', 'getElementById', '<script']) {
  assert.ok(!comp.includes(bad), `stripped chrome leaked: ${bad}`);
}

// Group 11: test chained
const pkg = read('package.json');
assert.ok(pkg.includes('orchard-marketing.test.mjs'), 'test must be chained');

console.log('orchard-marketing: all groups passed');
