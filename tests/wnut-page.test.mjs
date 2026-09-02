import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

// ── Boss scaffold preserved as source reference ────────────────
const wnut = JSON.parse(read('../src/data/wnut.json'));
for (const key of ['css', 'html', 'script']) {
  assert.ok(typeof wnut[key] === 'string' && wnut[key].length > 500, `missing ${key}`);
}

// ── Page is a site-native page: Layout + TokenNav, no raw scaffold injection ──
test('page uses site chrome (Layout + TokenNav), not scaffold topbar', () => {
  const page = read('../pages/token/wnut.js');
  assert.ok(page.includes("import Layout from '../../components/Layout'"), 'Layout import missing');
  assert.ok(page.includes('<Layout>'), 'page must render inside Layout (site Header/Footer)');
  assert.ok(page.includes('<TokenNav dark />'), 'TokenNav missing — token family navigation broken');
  assert.ok(!page.includes('dangerouslySetInnerHTML'), 'raw HTML injection forbidden — rebuild natively');
  assert.ok(!page.includes('new Function'), 'eval-style script execution forbidden');
  assert.ok(!page.includes('className="wnut"'), 'scaffold wrapper div must be gone');
});

// ── Scaffold data sections preserved in native form ────────────
test('all scaffold observatory sections present natively', () => {
  const page = read('../pages/token/wnut.js');
  for (const s of [
    'How much of NUT is wrapped?',
    'Wrap / unwrap flows',
    'Where is the wNUT?',
    'Verified wNUT markets',
    'Largest holders',
    'Recent events',
    'depositFor',
    'withdrawTo',
  ]) {
    assert.ok(page.includes(s), `section "${s}" lost`);
  }
});

// ── Live data contract ─────────────────────────────────────────
test('page fetches /api/wnut-data and renders live keys', () => {
  const page = read('../pages/token/wnut.js');
  assert.ok(page.includes("'/api/wnut-data'"), 'live API fetch missing');
  for (const k of ['totalSupply', 'underlyingBalance', 'backingRatio', 'wrappedPctOfNut', 'backingValueUsd', 'flows', 'distribution', 'topHolders', 'markets', 'recentEvents', 'eventsError']) {
    assert.ok(page.includes(k), `data key ${k} not consumed`);
  }
});

// ── Zero-fabrication discipline ────────────────────────────────
test('no fabricated stats — unavailability is stated, not invented', () => {
  const page = read('../pages/token/wnut.js');
  assert.ok(page.includes('no fabrication'), 'no-fabrication disclosure missing');
});

// ── Canonical addresses on page ────────────────────────────────
test('canonical contract addresses present', () => {
  const page = read('../pages/token/wnut.js');
  assert.ok(page.includes('0xBA5ED46e31F80dafF307cbf60bd422a6f62E3dd3'), 'wNUT address missing');
  assert.ok(page.includes('0xb8de15fb529d98c93c749de63c749d48d25a30df'), 'NUT address missing');
});

// ── Header nav wiring ─────────────────────────────────────────
test('Header nav includes wNUT', () => {
  const header = read('../components/Header.js');
  assert.ok(header.includes('label: "wNUT"'), 'wNUT nav label missing');
  assert.ok(header.includes('href: "/token/wnut"'), 'wNUT nav href missing');
});

// ── llms.txt + sitemap.xml wiring ──────────────────────────────
test('llms.txt and sitemap.xml include wNUT', () => {
  const llms = read('../public/llms.txt');
  const sitemap = read('../public/sitemap.xml');
  assert.ok(llms.includes('[wNUT](/token/wnut)'), 'llms.txt wNUT entry missing');
  assert.ok(sitemap.includes('orchard.basednut.com/token/wnut'), 'sitemap.xml wNUT URL missing');
});

// ── Data layer: canonical addresses + event classification ─────
test('data layer has canonical addresses and zero-fabrication markets', () => {
  const src = read('../utils/wnutDataSources.js');
  assert.ok(src.includes('0xBA5ED46e31F80dafF307cbf60bd422a6f62E3dd3'), 'wNUT address missing');
  assert.ok(src.includes('0xb8de15fb529d98c93c749de63c749d48d25a30df'), 'NUT address missing');
  assert.ok(src.includes('VERIFIED_MARKETS'), 'verified markets const missing');
  assert.ok((src.match(/poolAddress/g) || []).length === 6, 'must be exactly 6 graft markets');
  assert.ok(src.includes('moralis'), 'Moralis event source missing');
  assert.ok(src.includes('order=ASC'), 'chronological event ordering missing');
});

// ── Test-suite wiring ─────────────────────────────────────────
test('wnut tests run in npm test suite', () => {
  const pkg = read('../package.json');
  assert.ok(pkg.includes('wnut-page.test.mjs'), 'wnut-page.test.mjs not wired into npm test');
});
