import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('field guide system files present in site', () => {
  for (const f of [
    '../components/pools/PoolCard.jsx',
    '../components/pools/PoolArtwork.jsx',
    '../components/pools/artwork/Repair02SpecimenSvg.js',
    '../components/pools/Repair02.module.css',
    '../lib/pools/catalog.js',
    '../lib/pools/presentation.js',
    '../lib/pools/selectors.js',
  ]) {
    assert.ok(read(f).length > 0, `missing ${f}`);
  }
});

test('catalog covers the live 28-pool ecosystem incl grafts', async () => {
  const { getPoolCatalog } = await import('../lib/pools/catalog.js');
  const pools = getPoolCatalog();
  assert.equal(pools.length, 28, 'must cover all 28 live pools');
  assert.equal(new Set(pools.map(p => p.id)).size, 28, 'unique catalog ids');
  const grafts = pools.filter(p => p.kind === 'graft');
  assert.equal(grafts.length, 6, 'six Sunflower Grove grafts');
  for (const g of grafts) {
    assert.equal(g.assets.length, 3, `graft ${g.name} must be a trio`);
    assert.equal(g.assets[0], 'wNUT', `graft ${g.name} must be wNUT-rooted`);
  }
  const pnut = pools.find(p => p.name === 'pNUT');
  assert.equal(pnut.kind, 'index');
  assert.deepEqual(pnut.assets, ['NUT', 'sNUT', 'cbETH', 'cbBTC']);
});

test('homepage pools view renders Field Guide cards with live TVL wiring', () => {
  const page = read('../pages/index.js');
  assert.ok(page.includes('import FGPoolCard from "../components/pools/PoolCard"'), 'FGPoolCard import missing');
  assert.ok(page.includes('<FGPoolCard'), 'FGPoolCard render missing');
  assert.ok(page.includes('marketData ? marketData.pools[pool.id]'), 'live marketData must flow to cards');
  assert.ok(page.includes('normalizePool'), 'pools must be catalog-normalized');
  assert.ok(!page.includes('import PoolCard from "../components/PoolCard"'), 'old PoolCard import must be gone from homepage');
  assert.ok(page.includes('import FGTokenCard'), 'tokens view now renders Field Guide specimen cards (S126e Boss order: new cards for tokens)');
});

test('pool card uses live TVL preference over static', () => {
  const card = read('../components/pools/PoolCard.jsx');
  assert.ok(card.includes('marketData?.geckoTerminal?.tvl ?? marketData?.dexScreener?.tvl ?? marketData?.mintClub?.tvl'),
    'live TVL preference GT > DS > MC must be wired');
  assert.ok(card.includes('formatTVL(pool.tvl, liveTvl)'), 'live TVL must win over static');
  assert.ok(card.includes("graft:'GRAFT'"), 'graft type label missing');
});

test('specimen artwork is data-driven (no hardcoded constituent labels)', () => {
  const svg = read('../components/pools/artwork/Repair02SpecimenSvg.js');
  assert.ok(svg.includes("type==='graft'"), 'graft scene missing');
  assert.ok(svg.includes('medal(a[1],365,70,.75)'), 'collectible second medal must be data-driven (a[1])');
  assert.ok(!svg.includes("medal('NUT',365,70,.75)"), 'hardcoded NUT medal forbidden');
  assert.ok(svg.includes('TWIN GRAFT'), 'graft caption missing');
});

test('explorer grid styled via module css', () => {
  const css = read('../components/pools/Repair02.module.css');
  assert.ok(css.includes('.fgGrid'), 'fgGrid class missing');
  assert.ok(css.includes('.r02-graft'), 'graft card styling missing');
  assert.ok(css.includes('.grafted'), 'grafted status tone missing');
  const page = read('../pages/index.js');
  assert.ok(page.includes('fgStyles.fgGrid'), 'grid must use module class');
  assert.ok(page.includes('fgStyles.theme'), 'grid wrapper must carry theme class - all card CSS is .theme-scoped (S126 visual bug)');
  // S126c: whimsy layer - cards must animate (meme project law)
  assert.ok(css.includes('r02Float'), 'ambient float animation missing');
  assert.ok(css.includes('r02Sway'), 'hover sway animation missing');
  assert.ok(css.includes('r02Rise'), 'staggered entrance animation missing');
  assert.ok(css.includes('prefers-reduced-motion'), 'reduced-motion respect missing');
});
