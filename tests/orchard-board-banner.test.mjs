import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

// Board component exists and is a site-native React port of Boss v35.
test('component file exists with verbatim port markers', () => {
  const c = read('../components/OrchardBoardBanner.js');
  assert.ok(c.includes('WELCOME TO THE NUT FARM'), 'headline copy missing');
  assert.ok(c.includes('ORCHARD MARKET SNAPSHOT'), 'subtitle copy missing');
  assert.ok(c.includes('TOTAL VALUE LOCKED (USD)'), 'tvl label missing');
  assert.ok(c.includes("api/orchard-board"), 'live data fetch missing');
  assert.ok(c.includes("/img/orchard-emblem.png"), 'emblem asset ref missing');
  // v35 weather engine: all five states + modes preserved
  for (const key of ['xfear', 'fear', 'neutral', 'greed', 'xgreed']) {
    assert.ok(c.includes(`key: '${key}'`), `board state ${key} missing`);
  }
  for (const mode of ['sunny', 'hot', 'stormy', 'neutral', 'rainy']) {
    assert.ok(c.includes(mode), `weather mode ${mode} missing`);
  }
  // no placeholder-copout text (Boss ban: see live board below)
  assert.ok(!c.includes('see live board below'), 'placeholder cop-out forbidden');
  // a11y: wrapper exposes label via role=img (svg is aria-hidden)
  assert.ok(c.includes('role="img" aria-label={ariaLabel}'), 'board must be a11y-exposed via wrapper role');
  // S126b: weather auto-drives from live NSI - no manual toggle allowed
  assert.ok(!c.includes('nsi-weather-control'), 'manual weather control must be gone (S126b)');
  assert.ok(!c.includes('manualIdx'), 'manual weather state must be gone (S126b)');
  assert.ok(c.includes("data && data.boardState ? data.boardState : 'neutral'"), 'weather must resolve from live boardState');
});

// CSS scoped: no html/body/global selectors leak.
test('component CSS scoped under .obb-root', () => {
  const c = read('../components/OrchardBoardBanner.js');
  const cssMatch = c.match(/CSS_TEXT = `([\s\S]*?)`/);
  assert.ok(cssMatch, 'CSS_TEXT block missing');
  const css = cssMatch[1];
  const lines = css.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  for (const line of lines) {
    assert.ok(line.startsWith('.obb-root'), `CSS line not scoped: ${line.slice(0, 40)}`);
  }
});

// API route shape.
test('api route: methods, nsi wiring, cache', () => {
  const api = read('../pages/api/orchard-board.js');
  assert.ok(api.includes('aggregateOrchardTVL'), 'must reuse TVL aggregation');
  assert.ok(api.includes('/mcp/nsi'), 'must fetch NSI from IRIS');
  assert.ok(api.includes('nsiScoreToStateKey'), 'must map NSI to board state');
  assert.ok(api.includes("405"), 'method guard missing');
  assert.ok(api.includes("orchard:board:v1"), 'cache key missing');
  assert.ok(api.includes('stale-cache'), 'stale fallback missing');
});

// Band mapping: documented NSI bands extended to 5 board states.
test('nsiBands mapping matches documented bands', async () => {
  const { nsiScoreToStateKey } = await import('../src/utils/nsiBands.js');
  assert.equal(nsiScoreToStateKey(95), 'xgreed');
  assert.equal(nsiScoreToStateKey(72), 'greed');
  assert.equal(nsiScoreToStateKey(50), 'neutral');
  assert.equal(nsiScoreToStateKey(20), 'fear');
  assert.equal(nsiScoreToStateKey(5), 'xfear');
  assert.equal(nsiScoreToStateKey(null), null);
  assert.equal(nsiScoreToStateKey('NaN'), null);
});

// Wiring: homepage renders board below hero logo, hero kept.
test('v35 board is the sole element above cards (replaces hero + old notice)', () => {
  const page = read('../pages/index.js');
  assert.ok(page.includes('import OrchardBoardBanner'), 'board import missing');
  assert.ok(page.includes('<OrchardBoardBanner />'), 'board render missing');
  assert.ok(!page.includes('/img/hero-logo.png'), 'hero-logo image must be gone (S126 replacement)');
  assert.ok(!page.includes('OrchardTVLNotice'), 'old OrchardTVLNotice must be gone (S126 replacement)');
});

// Emblem asset exists.
test('orchard emblem asset extracted', () => {
  assert.ok(existsSync(new URL('../public/img/orchard-emblem.png', import.meta.url)), 'emblem PNG missing');
});
