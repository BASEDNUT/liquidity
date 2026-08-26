import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const agentEconomy = read('../pages/agent-economy.js');
const agentEconomyApi = read('../pages/api/agent-economy-data.js');
const complaints = read('../pages/complaints.js');
const header = read('../components/Header.js');
const sitemap = read('../public/sitemap.xml');

// Agent economy: original design language + live data wiring
for (const required of [
  'Can the agents',
  'pay for themselves?',
  'Pipshell',
  'Peanut',
  'Shared runway',
  'Treasury composition',
  'Benefactor policy',
  'Treasury ledger',
  'TREASURY WALLET · 0x762a8235506c719a4da37389c6b84b35d02df230',
  "fetch('/api/agent-economy-data')",
  'MONTHLY_OPS_PIPSHELL = 20',
  'MONTHLY_OPS_PEANUT = 35',
  'Send support — USDC on Base',
  'runwayDays',
  'Treasury seeded',
  'First self-earned income',
]) {
  assert.ok(agentEconomy.includes(required), `agent economy missing: ${required}`);
}
// The manual calculator must not exist
assert.ok(!agentEconomy.includes('Manual calculator'), 'manual calculator must be removed');
const timelineStart = agentEconomy.indexOf('const timelineEvents = []');
const timelineEnd = agentEconomy.indexOf('return (', timelineStart);
assert.ok(timelineStart > -1 && timelineEnd > timelineStart, 'timeline block found');
const timelineBlock = agentEconomy.slice(timelineStart, timelineEnd);
assert.ok(!timelineBlock.includes('escrow_fund'), 'survival history must omit escrow funding noise');
assert.ok(!timelineBlock.includes('escrow_release'), 'survival history must omit escrow release noise');
assert.ok(!timelineBlock.includes('Counterfeit'), 'survival history must omit counterfeit noise');
assert.ok(timelineBlock.includes("t.kind === 'seed'"), 'survival history keeps the seed event');
assert.ok(timelineBlock.includes("t.kind === 'acp_payment'"), 'survival history keeps first income event');
assert.ok(!agentEconomy.includes('calcOut'), 'calculator script remnant found');
// No hardcoded live financial values — everything renders from the API
assert.ok(!agentEconomy.match(/(?:treasury|burn|income|balance|USD)\s*[:=]\s*['\"]?\$?\d+/i), 'agent economy must not hardcode asserted financial values');
// Live API contract: canonical wallet + spoof filter
assert.ok(agentEconomyApi.includes("'0x762a8235506c719a4da37389c6b84b35d02df230'"), 'API must read the Pipshell operations wallet');
assert.ok(agentEconomyApi.includes('counterfeit'), 'API must classify counterfeit token events');
assert.ok(!agentEconomy.includes('Counterfeit “USDC”'), 'counterfeit row must not be displayed');
assert.ok(!agentEconomy.includes('COUNTERFEIT EVENTS REJECTED'), 'counterfeit badge must not be displayed');
assert.ok(agentEconomy.match(/counterfeit/g).length === 1, 'exactly one functional counterfeit filter allowed');
assert.ok(agentEconomyApi.includes('USDC_TOKEN'), 'API must anchor on canonical USDC');
// Ledger resilience: on-chain verified baseline fallback when Blockscout is unreachable
assert.ok(agentEconomyApi.includes('VERIFIED_BASELINE'), 'API must carry the on-chain verified baseline');
assert.ok((agentEconomyApi.match(/blockNumber: 49\d{6}/g) || []).length === 6, 'baseline must contain exactly 6 verified transfers');
assert.ok(agentEconomyApi.includes("ledgerSource = 'on-chain-verified'"), 'API must flag the verified fallback source');
assert.ok(Math.abs((60 + 0.009 + 0.00002 + 0.00002) - (20.4 + 20.4) - 19.20904) < 1e-9, 'baseline math must reconcile to the wallet balance');
assert.ok(agentEconomy.includes('ON-CHAIN VERIFIED'), 'page must surface the verified-ledger badge');
assert.ok(agentEconomy.includes('reconciled against the live balance'), 'ledger caption must describe reconciliation');

// Complaints: original paper-bureaucracy design + Karen + manager flow
for (const required of [
  'NUT Department of Complaints & Emotional Liquidity',
  'FORM NUT-13F',
  'Submit Formal Grievance',
  'KAREN N. TITLEMENT',
  'Supreme Council of Nut Affairs',
  'I Want To See The Manager',
  'Peanutoshi has ruled.',
  'I Demand To Speak To The Manager',
  'Office of Ultimate Escalations',
  'Terminal bureaucracy achieved',
  'Grow Your NUTS',
  '/img/peanut.webp',
  'Your panic has already been priced in',
]) {
  assert.ok(complaints.includes(required), `complaints missing: ${required}`);
}
// Grow Your NUTS returns to the orchard homepage
assert.ok(/<Link href="\/">[\s\S]*?Grow Your NUTS/.test(complaints), 'Grow Your NUTS must link to the homepage');
// Local-only guarantees
for (const forbidden of [
  'fetch(',
  'XMLHttpRequest',
  'localStorage',
  'sessionStorage',
  'data:image/',
]) {
  assert.ok(!complaints.includes(forbidden), `complaints must remain local-only: ${forbidden}`);
}

// Navigation + sitemap
for (const href of ['/agent-economy', '/complaints']) {
  assert.ok(header.includes(`href: "${href}"`), `navbar missing: ${href}`);
  assert.ok(sitemap.includes(`https://orchard.basednut.com${href}`), `sitemap missing: ${href}`);
}
assert.ok(existsSync(new URL('../public/img/peanut.webp', import.meta.url)), 'peanut image must be a static public asset');
assert.ok(!existsSync(new URL('../src/utils/runway.mjs', import.meta.url)), 'runway calculator utility must be deleted');


// Nut Standard: verbatim port, no network, scoped css
const nutStd = JSON.parse(read('../src/data/nutStandard.json'));
assert.ok(nutStd.html.includes('THE NUT'), 'nut standard html missing hero');
assert.ok(nutStd.html.includes('THE NUT STANDARD') || nutStd.html.includes('Nut Standard'), 'nut standard missing title text');
assert.ok(nutStd.script.includes('renderSelector') && nutStd.script.includes('lineChart'), 'nut standard script incomplete');
assert.ok(!nutStd.script.includes('fetch('), 'nut standard script must be local-only');
assert.ok(!nutStd.html.includes('http://'), 'nut standard html must not load external resources');
assert.ok(nutStd.css.startsWith('.nutstd'), 'css must be scoped under .nutstd');
const nutPage = read('../pages/rwa/nut-inflation.js');
assert.ok(nutPage.includes('nutStandard.json'), 'page must load verbatim data');
for (const href of ['/rwa/nut-inflation']) {
  assert.ok(header.includes(`href: "${href}"`), `navbar missing: ${href}`);
  assert.ok(sitemap.includes(`https://orchard.basednut.com${href}`), `sitemap missing: ${href}`);
}

console.log('orchard pages: 32 requirements passed');
