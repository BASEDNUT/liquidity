import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const src = readFileSync('components/Header.js', 'utf8');

// 1. exactly 5 sections, expected titles
const titles = [...src.matchAll(/title: "([^"]+)"/g)].map((m) => m[1]);
assert.equal(titles.length, 5, `expected 5 sections, got ${titles.length}: ${titles.join(' | ')}`);
for (const t of ['🌳 The Orchard', '🏦 RWA', '⚔️ Nut Wars', '🤖 Agents', '🌰 Explore']) {
  assert.ok(titles.includes(t), `missing section ${t}`);
}

// 2. all routes preserved (flat href scan)
const routes = ['/', '/token/nut', '/token/snut', '/token/pnut', '/tokens',
  '/pool/nut-weth-uniswap-v3', '/pool/nut-salt-mintclub', '/pool/snut-nut-aerodrome',
  '/pool/salt-usdc-aerodrome', '/pool/pips-usdc-balancer-reclamm', '/pair-your-token',
  '/tvl', '/staking', '/rwa', '/rwa/nuts-production', '/rwa/nut-atlas', '/rwa/orchard-economics',
  '/rwa/nut-inventory-infrastructure', '/rwa/nut-trade-flows', '/rwa/nut-demand',
  '/rwa/nut-inflation', '/rwa/nut-stocks', '/rwa/carbon-debt', '/great-nut-war',
  '/warmachine', '/nut-catcher', '/agent-economy', '/agents', '/arb-bot', '/chat',
  '/images', '/infra/mycelium-taproot', '/tree', '/complaints', '/faq',
  '/atlas', 'https://docs.basednut.com/'];
for (const r of routes) assert.ok(src.includes(`href: "${r}"`), `route lost: ${r}`);

// 3. RWA phases: Grown / Traded / Priced groups exist with correct members
const grown = src.indexOf('label: "Grown');
const traded = src.indexOf('label: "Traded');
const priced = src.indexOf('label: "Priced');
assert.ok(grown > -1 && traded > grown && priced > traded, 'Grown/Traded/Priced groups missing or out of order');
assert.ok(src.slice(grown, traded).includes('/rwa/nuts-production'), 'Grown missing production');
assert.ok(src.slice(grown, traded).includes('/rwa/nut-atlas'), 'Grown missing atlas');
assert.ok(src.slice(grown, traded).includes('/rwa/orchard-economics'), 'Grown missing economics');
assert.ok(src.slice(traded, priced).includes('/rwa/nut-inventory-infrastructure'), 'Traded missing inventory');
assert.ok(src.slice(traded, priced).includes('/rwa/nut-trade-flows'), 'Traded missing trade flows');
assert.ok(src.slice(priced, src.indexOf('title: "⚔️')).includes('/rwa/nut-demand'), 'Priced missing demand');
assert.ok(src.slice(priced, src.indexOf('title: "⚔️')).includes('/rwa/nut-inflation'), 'Priced missing standard');
assert.ok(src.slice(priced, src.indexOf('title: "⚔️')).includes('/rwa/nut-stocks'), 'Priced missing stocks');

// 4. Orchard holds the visualizers: Tree / Orchard Atlas — flat, after Staking (Graphs merged into FAQ)
const orchard = src.indexOf('title: "🌳 The Orchard');
const rwa = src.indexOf('title: "🏦 RWA');
const orchardBlock = src.slice(orchard, rwa);
for (const r of ['/tree', '/atlas']) {
  assert.ok(orchardBlock.includes(`href: "${r}"`), `Orchard section missing ${r}`);
}
assert.ok(!orchardBlock.includes('href: "/ecosystem"'), 'Orchard must not link /ecosystem (merged into FAQ)');
const stakingIdx = orchardBlock.indexOf('/staking');
assert.ok(orchardBlock.indexOf('/tree', stakingIdx) > -1, 'Tree must come after Staking in Orchard');
assert.ok(orchardBlock.indexOf('/atlas', stakingIdx) > -1, 'Orchard Atlas must come after Staking in Orchard');

// 5. Agents: Playground group kept; Infra submenu REMOVED — Mycelium + Taproot promoted flat
const agents = src.indexOf('title: "🤖 Agents');
const exploreIdx = src.indexOf('title: "🌰 Explore');
const agentsBlock = src.slice(agents, exploreIdx);
assert.ok(agentsBlock.includes('label: "Playground'), 'Playground group missing');
assert.ok(!agentsBlock.includes('label: "Infra'), 'Infra submenu must be removed (single-item nesting)');
assert.ok(agentsBlock.includes('href: "/infra/mycelium-taproot"'), 'Mycelium + Taproot link missing from Agents');

// 6. Explore: Complaints / FAQ / Docs only — visualizers moved out
const exploreBlock = src.slice(exploreIdx);
for (const r of ['/complaints', '/faq', 'https://docs.basednut.com/']) {
  assert.ok(exploreBlock.includes(r), `Explore missing ${r}`);
}
for (const r of ['/tree', '/ecosystem', '/atlas']) {
  assert.ok(!exploreBlock.includes(`href: "${r}"`), `Explore must not hold ${r} anymore`);
}

console.log('orchard-menu-elegant: 5 sections — Orchard visualizers flat, infra promoted — ALL PASS');
