import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

// ── Source port exists ──────────────────────────────────────────
const tradeFlows = JSON.parse(read('../src/data/nutTradeFlows.json'));
const all = tradeFlows.css + tradeFlows.html + tradeFlows.script;
for (const key of ['css', 'html', 'script']) {
  assert.ok(typeof tradeFlows[key] === 'string' && tradeFlows[key].length > 500, `missing ${key}`);
}

// ── Verbatim Boss content ───────────────────────────────────────
assert.ok(all.includes('Nut trade is the circulation layer'), 'hero lost');
assert.ok(all.includes('Where U.S. nuts go'), 'corridors section lost');
assert.ok(all.includes('Who ships the marketable crop'), 'exporters section lost');
assert.ok(all.includes('Where the market pulls inventory'), 'demand section lost');
assert.ok(all.includes('Exact bilateral records'), 'ledger section lost');
assert.ok(all.includes('Primary data & definitions'), 'sources section lost');
assert.ok(all.includes('ROUTES=Object.freeze'), 'route data lost');
assert.ok(all.includes('EXPORTERS=Object.freeze'), 'exporter data lost');
assert.ok(all.includes('82638.5'), 'Spain almond tonnage lost');
assert.ok(all.includes('wits.worldbank.org'), 'WITS sources lost');
assert.ok(all.includes('data-filter="almond"'), 'filter tabs lost');
assert.ok(all.includes('flow-ribbon'), 'corridor chart code lost');
assert.ok(all.includes('id="almondFlowChart"') && all.includes('id="pistachioFlowChart"'), 'flow chart svg lost');
assert.ok(all.includes('id="barChart"') && all.includes('id="scatterChart"'), 'bar/scatter svg lost');
assert.ok(all.includes('id="exporterRows"') && all.includes('id="routeRows"'), 'table bodies lost');
assert.ok(all.includes('id="tooltip"'), 'tooltip lost');

// ── CSS scoping: no bare :root (styled-jsx trap) ──
assert.ok(!/:root\s*\{/.test(tradeFlows.css), 'CSS still uses :root — vars would never apply');
assert.ok(tradeFlows.css.includes('.nutflows{'), 'wrapper scoping missing');

// ── Page component ─────────────────────────────────────────────
const page = read('../pages/rwa/nut-trade-flows.js');
assert.ok(page.includes('nutTradeFlows.json'), 'page must load its data');
assert.ok(page.includes('Layout'), 'page must use Layout');
assert.ok(page.includes('new Function'), 'IIFE script must be executed client-side');

// ── Nav reorganization ─────────────────────────────────────────
const header = read('../components/Header.js');
assert.ok(!/title:\s*"🖼️ Explore"/.test(header), 'Explore section should fold into Orchard');
assert.ok(!/title:\s*"🌐 Infra"/.test(header), 'Infra section should fold into AI Agents');
const sectionCount = (header.match(/title: "/g) || []).length;
assert.ok(sectionCount === 5, `expected 5 nav sections, got ${sectionCount}`);
// every route survives the reorg
const routes = ['/', '/token/nut', '/token/snut', '/token/pnut', '/tokens',
  '/pool/nut-weth-uniswap-v3', '/pool/nut-salt-mintclub', '/pool/snut-nut-aerodrome',
  '/pool/salt-usdc-aerodrome', '/pool/pips-usdc-balancer-reclamm', '/pair-your-token',
  '/tvl', '/staking', '/tree', '/ecosystem', '/great-nut-war', '/warmachine',
  '/nut-catcher', '/agents', '/agent-economy', '/arb-bot', '/chat', '/images',
  '/infra/mycelium-taproot', '/rwa/carbon-debt', '/rwa/nuts-production',
  '/rwa/nut-inflation', '/rwa/nut-stocks', '/rwa/nut-atlas', '/rwa/nut-trade-flows',
  '/faq', '/complaints'];
for (const r of routes) assert.ok(header.includes(`"${r}"`), `nav lost route ${r}`);
// RWA narrative order: production -> capital -> trade
const atlasIdx = header.indexOf('"/rwa/nut-atlas"');
const stocksIdx = header.indexOf('"/rwa/nut-stocks"');
const tradeIdx = header.indexOf('"/rwa/nut-trade-flows"');
assert.ok(atlasIdx > -1 && stocksIdx > atlasIdx && tradeIdx > stocksIdx, 'RWA must follow production->capital->trade order');

// ── llms.txt + sitemap ─────────────────────────────────────────
const llms = read('../public/llms.txt');
assert.ok(llms.includes('/rwa/nut-trade-flows'), 'llms.txt missing route');
const sitemap = read('../public/sitemap.xml');
assert.ok(sitemap.includes('orchard.basednut.com/rwa/nut-trade-flows'), 'sitemap missing route');

console.log('orchard-pages-3: trade flows + nav reorg — ALL PASS');
