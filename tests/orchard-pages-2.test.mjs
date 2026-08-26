import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

// ── Source ports exist ──────────────────────────────────────────
const nutStocks = JSON.parse(read('../src/data/nutStocks.json'));
const mycelium = JSON.parse(read('../src/data/myceliumTaproot.json'));
const nutAtlas = JSON.parse(read('../src/data/nutAtlas.json'));
const nutStocksRaw = read('../src/data/nutStocks.json');
const myceliumRaw = read('../src/data/myceliumTaproot.json');
const nutAtlasRaw = read('../src/data/nutAtlas.json');
const nutStocksAll = nutStocks.css + nutStocks.html + (nutStocks.script || '');
const myceliumAll = mycelium.css + mycelium.html;
const nutAtlasAll = nutAtlas.css + nutAtlas.html + (nutAtlas.script || '');

for (const [name, parsed] of [['nutStocks', nutStocks], ['myceliumTaproot', mycelium], ['nutAtlas', nutAtlas]]) {
  for (const key of ['css', 'html']) {
    assert.ok(typeof parsed[key] === 'string' && parsed[key].length > 500, `${name} missing ${key}`);
  }
}

// ── Nut Stocks: verbatim Boss content ───────────────────────────
assert.ok(nutStocksAll.includes('Nuts, Publicly Traded'), 'equities hero lost');
assert.ok(nutStocksAll.includes('ASX: SHV'), 'Select Harvests ticker lost');
assert.ok(nutStocksAll.includes('The Nut Market'), 'nut market section lost');
assert.ok(nutStocksAll.includes('From Orchard to Ticker'), 'orchard-to-ticker section lost');
assert.ok(nutStocksAll.includes('Filings & Market Sources'), 'sources section lost');
assert.ok(nutStocksAll.includes('data-filter="all"'), 'filter control lost');
assert.ok(nutStocksAll.includes('data-cat="grower"') && nutStocksAll.includes('data-cat="processor"'), 'card categories lost');
assert.ok(nutStocksAll.includes('nass.usda.gov') || nutStocksAll.includes('selectharvests.com.au'), 'citation links lost');

// ── Mycelium + Taproot: verbatim Boss content ───────────────────
assert.ok(myceliumAll.includes('Sovereignty without isolation'), 'mycelium headline lost');
assert.ok(myceliumAll.includes('The network beneath the network'), 'network section lost');
assert.ok(myceliumAll.includes('The first root into Mycelium'), 'first-root section lost');
assert.ok(myceliumAll.includes('Agents get interfaces, not screen scraping'), 'agents-interfaces section lost');
assert.ok(myceliumAll.includes('github.com/BASEDNUT/mycelium') && myceliumAll.includes('github.com/BASEDNUT/taproot'), 'repo links lost');
assert.ok(myceliumAll.includes('taproot.basednut.com'), 'live node link lost');

// ── Nut Atlas: verbatim Boss content + data ─────────────────────
assert.ok(nutAtlasAll.includes('SHOW ME THE NUTS'), 'atlas hero lost');
assert.ok(nutAtlasAll.includes('harvest'), 'harvest data lost');
assert.ok(nutAtlasAll.includes('Territories'), 'territories section lost');
assert.ok(nutAtlasAll.includes('Wild mast density'), 'mast density section lost');
assert.ok(nutAtlasAll.includes('nass.usda.gov'), 'USDA NASS sources lost');
assert.ok(nutAtlasAll.includes('data.fs.usda.gov'), 'FIA source lost');
// module script with CDN imports must be preserved for d3/topojson rendering
assert.ok(nutAtlasAll.includes('cdn.jsdelivr.net/npm/d3'), 'd3 CDN import lost');
assert.ok(nutAtlasAll.includes('us-atlas'), 'us-atlas import lost');
assert.ok(nutAtlasAll.includes('Map layer unavailable'), 'graceful fallback lost');

// ── CSS scoping: no bare :root (styled-jsx trap from agent-economy) ──
for (const [name, parsed] of [['nutStocks', nutStocks], ['myceliumTaproot', mycelium], ['nutAtlas', nutAtlas]]) {
  assert.ok(!/:root\s*\{/.test(parsed.css), `${name} CSS still uses :root — vars would never apply`);
}

// ── Page components ─────────────────────────────────────────────
const stocksPage = read('../pages/rwa/nut-stocks.js');
assert.ok(stocksPage.includes('nutStocks.json'), 'stocks page must load its data');
assert.ok(stocksPage.includes('dangerouslySetInnerHTML'), 'stocks page must inject Boss markup');

const myceliumPage = read('../pages/infra/mycelium-taproot.js');
assert.ok(myceliumPage.includes('myceliumTaproot.json'), 'mycelium page must load its data');
assert.ok(myceliumPage.includes('dangerouslySetInnerHTML'), 'mycelium page must inject Boss markup');

const atlasPage = read('../pages/rwa/nut-atlas.js');
assert.ok(atlasPage.includes('nutAtlas.json'), 'atlas page must load its data');
assert.ok(atlasPage.includes("createElement('script')"), 'atlas page must inject a real module script (CDN imports)');
assert.ok(atlasPage.includes("type = 'module'"), 'atlas script must be type=module');

// ── Nav wiring ──────────────────────────────────────────────────
const header = read('../components/Header.js');
assert.ok(header.includes('{ label: "Nut Stocks", href: "/rwa/nut-stocks" }'), 'RWA nav missing Nut Stocks');
assert.ok(header.includes('{ label: "Nut Atlas", href: "/rwa/nut-atlas" }'), 'RWA nav missing Nut Atlas');
assert.ok(header.includes('{ label: "Mycelium + Taproot", href: "/infra/mycelium-taproot" }'), 'nav missing Mycelium + Taproot');

// ── llms.txt + sitemap ─────────────────────────────────────────
const llms = read('../public/llms.txt');
for (const [path, marker] of [
  ['/rwa/nut-stocks', 'nut-stocks'],
  ['/infra/mycelium-taproot', 'mycelium-taproot'],
  ['/rwa/nut-atlas', 'nut-atlas'],
]) {
  assert.ok(llms.includes(`(${path})`), `llms.txt missing ${path}`);
}
const sitemap = read('../public/sitemap.xml');
for (const path of ['/rwa/nut-stocks', '/infra/mycelium-taproot', '/rwa/nut-atlas']) {
  assert.ok(sitemap.includes(`https://orchard.basednut.com${path}</loc>`), `sitemap missing ${path}`);
}

console.log('orchard-pages-2: all assertions passed');
