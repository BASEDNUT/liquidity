import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const agentEconomy = read('../pages/agent-economy.js');
const runway = read('../src/utils/runway.mjs');
const complaints = read('../pages/complaints.js');
const header = read('../components/Header.js');
const sitemap = read('../public/sitemap.xml');

for (const required of [
  'Can the agents pay for themselves?',
  'Pipshell',
  'Peanutoshi',
  'Shared runway',
  'Treasury composition',
  'Benefactor policy',
  'DATA PENDING',
]) {
  assert.ok(agentEconomy.includes(required), `agent economy missing: ${required}`);
}
assert.ok(!agentEconomy.match(/(?:treasury|burn|income|balance|USD)\s*[:=]\s*['\"]?\$?\d+/i), 'agent economy must not hardcode asserted financial values');
assert.ok(runway.includes('∞ operating runway at current ACP income'), 'runway utility missing self-funding state');

for (const required of [
  'NUT Department of Complaints & Emotional Liquidity',
  'Submit Formal Grievance',
  'Peanutoshi has ruled.',
  'Grow Your NUTS',
  '/img/peanut.webp',
]) {
  assert.ok(complaints.includes(required), `complaints missing: ${required}`);
}
for (const forbidden of [
  'KAREN N. TITLEMENT',
  'fetch(',
  'XMLHttpRequest',
  'localStorage',
  'sessionStorage',
  'data:image/',
]) {
  assert.ok(!complaints.includes(forbidden), `complaints must remain local-only: ${forbidden}`);
}

for (const href of ['/agent-economy', '/complaints']) {
  assert.ok(header.includes(`href: "${href}"`), `navbar missing: ${href}`);
  assert.ok(sitemap.includes(`https://orchard.basednut.com${href}`), `sitemap missing: ${href}`);
}
assert.ok(existsSync(new URL('../public/img/peanut.webp', import.meta.url)), 'peanut image must be a static public asset');

console.log('orchard pages: 24 requirements passed');
