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
  '/images', '/infra/mycelium-taproot', '/tree', '/ecosystem', '/complaints', '/faq',
  'https://docs.basednut.com/'];
for (const r of routes) assert.ok(src.includes(`href: "${r}"`), `route lost: ${r}`);

// 3. RWA phases: Grown / Traded / Priced groups exist with correct members
const grown = src.indexOf('label: "Grown');
const traded = src.indexOf('label: "Traded');
const priced = src.indexOf('label: "Priced');
assert.ok(grown > -1 && traded > grown && priced > traded, 'Grown/Traded/Priced groups missing or out of order');
// Grown members
assert.ok(src.slice(grown, traded).includes('/rwa/nuts-production'), 'Grown missing production');
assert.ok(src.slice(grown, traded).includes('/rwa/nut-atlas'), 'Grown missing atlas');
assert.ok(src.slice(grown, traded).includes('/rwa/orchard-economics'), 'Grown missing economics');
// Traded members
assert.ok(src.slice(traded, priced).includes('/rwa/nut-inventory-infrastructure'), 'Traded missing inventory');
assert.ok(src.slice(traded, priced).includes('/rwa/nut-trade-flows'), 'Traded missing trade flows');
// Priced members
assert.ok(src.slice(priced, src.indexOf('title: "⚔️')).includes('/rwa/nut-demand'), 'Priced missing demand');
assert.ok(src.slice(priced, src.indexOf('title: "⚔️')).includes('/rwa/nut-inflation'), 'Priced missing standard');
assert.ok(src.slice(priced, src.indexOf('title: "⚔️')).includes('/rwa/nut-stocks'), 'Priced missing stocks');

// 4. Playground + Infra groups under Agents
const agents = src.indexOf('title: "🤖 Agents');
const wars = src.indexOf('title: "⚔️');
const exploreIdx = src.indexOf('title: "🌰 Explore"');
const agentsBlock = src.slice(agents, exploreIdx);
assert.ok(agentsBlock.includes('label: "Playground'), 'Playground group missing');
assert.ok(agentsBlock.includes('label: "Infra'), 'Infra group missing');
assert.ok(agentsBlock.includes('/chat') && agentsBlock.includes('/images'), 'Playground members missing');
assert.ok(agentsBlock.includes('/infra/mycelium-taproot'), 'Infra member missing');

// 5. Explore holds Tree/Graphs/Complaints/FAQ/Docs
const explore = src.indexOf('title: "🌰 Explore');
const exploreBlock = src.slice(explore, src.length);
for (const r of ['/tree', '/ecosystem', '/complaints', '/faq', 'https://docs.basednut.com/']) {
  assert.ok(exploreBlock.includes(r), `Explore missing ${r}`);
}

console.log('orchard-menu-elegant: 5-section elegant menu — ALL PASS');
