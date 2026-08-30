import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

// ── Source port exists ──────────────────────────────────────────
const wnut = JSON.parse(read('../src/data/wnut.json'));
const all = wnut.css + wnut.html + wnut.script;
for (const key of ['css', 'html', 'script']) {
  assert.ok(typeof wnut[key] === 'string' && wnut[key].length > 500, `missing ${key}`);
}

// ── Verbatim Boss scaffold content ──────────────────────────────
test('scaffold content preserved', () => {
  assert.ok(all.includes('BASED'), 'brand lost');
  assert.ok(all.includes('Orchard'), 'way-home nav lost');
  assert.ok(all.includes('/token/nut'), 'NUT link lost');
  assert.ok(all.includes('/api/wnut-data'), 'live API fetch lost');
  assert.ok(all.includes('totalSupply'), 'supply metric lost');
  assert.ok(all.includes('state'), 'state section lost');
  assert.ok(all.includes('gauge'), 'backing gauge lost');
  assert.ok(all.includes('holders'), 'holders section lost');
  assert.ok(all.includes('flows'), 'flows section lost');
  assert.ok(all.includes('distribution'), 'distribution section lost');
  assert.ok(all.includes('markets'), 'markets section lost');
});

// ── CSS scoping: no bare :root (styled-jsx trap) ────────────────
test('CSS scoped under .wnut, no global leaks', () => {
  assert.ok(!/:root\s*\{/.test(wnut.css), 'CSS still uses :root — vars would never apply');
  assert.ok(!/^body\s*\{/m.test(wnut.css), 'CSS still styles global body');
  assert.ok(!/^html\s*\{/m.test(wnut.css), 'CSS still styles global html');
  assert.ok(wnut.css.includes('.wnut'), 'wrapper scoping missing');
  assert.ok((wnut.css.match(/\.wnut/g) || []).length > 50, 'insufficient .wnut scoping');
});

// ── Data contract: script reads what the data layer emits ───────
test('script fetches /api/wnut-data and reads wnut shape', () => {
  assert.ok(wnut.script.includes("j?.wnut||j"), 'script must tolerate {wnut:{...}} or bare shape');
});

// ── Page component ─────────────────────────────────────────────
test('page component loads json + executes client-side', () => {
  const page = read('../pages/wnut.js');
  assert.ok(page.includes('wnut.json'), 'page must load its data');
  assert.ok(page.includes('new Function'), 'IIFE script must be executed client-side');
  assert.ok(page.includes('className="wnut"'), 'wnut wrapper div missing');
});

// ── Header nav wiring ─────────────────────────────────────────
test('Header nav includes wNUT', () => {
  const header = read('../components/Header.js');
  assert.ok(header.includes('label: "wNUT"'), 'wNUT nav label missing');
  assert.ok(header.includes('href: "/wnut"'), 'wNUT nav href missing');
});

// ── llms.txt + sitemap.xml wiring ──────────────────────────────
test('llms.txt and sitemap.xml include wNUT', () => {
  const llms = read('../public/llms.txt');
  const sitemap = read('../public/sitemap.xml');
  assert.ok(llms.includes('[wNUT](/wnut)'), 'llms.txt wNUT entry missing');
  assert.ok(sitemap.includes('orchard.basednut.com/wnut'), 'sitemap.xml wNUT URL missing');
});

// ── Data layer: canonical addresses + event classification ─────
test('data layer has canonical addresses and zero-fabrication markets', () => {
  const src = read('../utils/wnutDataSources.js');
  assert.ok(src.includes('0xBA5ED46e31F80dafF307cbf60bd422a6f62E3dd3'), 'wNUT address missing');
  assert.ok(src.includes('0xb8de15fb529d98c93c749de63c749d48d25a30df'), 'NUT address missing');
  assert.ok(src.includes('VERIFIED_MARKETS'), 'verified markets const missing');
  assert.ok((src.match(/poolAddress/g) || []).length === 5, 'must be exactly 5 graft markets');
  assert.ok(src.includes('moralis'), 'Moralis event source missing');
  assert.ok(src.includes('order=ASC'), 'chronological event ordering missing');
});
