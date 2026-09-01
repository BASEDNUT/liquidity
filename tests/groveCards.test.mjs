import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Sunflower Grove Batch I front-page card coverage (2026-09-01)
// Truth source: agent-core/config.py (verified on-chain 2026-08-27, Session 69)
// Missing before fix: 8 token cards + 5 pool cards on the front page.

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const fetchTokensSrc = read('../utils/fetchTokens.js');
const fetchPoolsSrc = read('../utils/fetchPools.js');
const tokenSourcesSrc = read('../utils/tokenDataSources.js');
const marketSourcesSrc = read('../utils/marketDataSources.js');
const filterTabsSrc = read('../components/FilterTabs.js');
const tokenIdSrc = read('../pages/token/[id].js');
const sitemapSrc = read('../public/sitemap.xml');

const ADDR = {
  wNUT: '0xBA5ED46e31F80dafF307cbf60bd422a6f62E3dd3',
  VVV: '0xacfE6019Ed1A7Dc6f7B508C02d1b04ec88cC21bf',
  DIEM: '0xF4d97F2da56e8c3098f3a8D538DB630A2606a024',
  VIRTUAL: '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b',
  MOR: '0x7431aDa8a591C955a994a21710752EF9b882b8e3',
  wstETH: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
  tBTC: '0x236aa50979D5f3De3Bd1Eeb40E81137F22ab794b',
  EURC: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42',
};

// Replicate fetchPools.js slugify exactly — id contract between fetchPools and POOL_CONFIG
function slugify(str) {
  return String(str).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}
const GRAFTS = [
  { name: 'gtINF wNUT/VVV/DIEM', addr: '0x6a0a1B7428d543524592eD22023A09BdE05aA466' },
  { name: 'gtAGT wNUT/VIRTUAL/MOR', addr: '0x5dA95cC31C840Fd33180e4C7f879e3F3d8Eca200' },
  { name: 'gtETH wNUT/cbETH/wstETH', addr: '0xd156d51219B3a7A590670d655E8740Ad404e8835' },
  { name: 'gtBTC wNUT/cbBTC/tBTC', addr: '0xb2a63935e1391Ee49E5cfB6cc4f184C285fE29b4' },
  { name: 'gtFX wNUT/USDC/EURC', addr: '0x1cCB8c61b62b9c7a9d4e66C9c824C1539B8b1f2E' },
];
for (const g of GRAFTS) g.id = `${slugify(g.name)}-${slugify('Balancer v3')}`;

let passed = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); passed += 1; };

// 1. Token cards — wNUT branch + 7 scion soil entries
ok(fetchTokensSrc.includes('name: "wNUT"'), 'wNUT branch card missing');
ok(fetchTokensSrc.includes(ADDR.wNUT), 'wNUT address missing in fetchTokens.js');
for (const n of ['VVV', 'DIEM', 'VIRTUAL', 'MOR', 'wstETH', 'tBTC', 'EURC']) {
  ok(fetchTokensSrc.includes(`name: "${n}"`), `${n} soil card missing`);
}

// 2. TOKEN_ADDRESSES — live-data merge keys (RPC supply + GT/DS prices when indexed)
for (const [k, a] of Object.entries(ADDR)) {
  ok(tokenSourcesSrc.includes(`${k}:`), `TOKEN_ADDRESSES missing key ${k}`);
  ok(tokenSourcesSrc.includes(a), `TOKEN_ADDRESSES missing address for ${k}`);
}

// 3. Graft pool cards — 5 Balancer v3 Twin Grafts
for (const g of GRAFTS) {
  ok(fetchPoolsSrc.includes(`name: "${g.name}"`), `pool card missing: ${g.name}`);
  ok(fetchPoolsSrc.includes(g.addr), `pool address missing: ${g.name}`);
}
ok((fetchPoolsSrc.match(/platform: "Balancer v3"/g) || []).length === 5, 'exactly 5 Balancer v3 platform entries expected');
ok((fetchPoolsSrc.match(/category: \["TKNs", "wNUT"\]/g) || []).length === 5, 'grafts must carry [TKNs, wNUT] category');

// 4. POOL_CONFIG id contract — live-data merge requires exact id match with fetchPools
for (const g of GRAFTS) {
  ok(marketSourcesSrc.includes(`{ id: '${g.id}'`), `POOL_CONFIG missing id ${g.id}`);
}

// 5. Filter tabs — wNUT category + PIPS (pre-existing gap: PIPS pools carry the tag but no filter)
ok(filterTabsSrc.includes('"wNUT"'), 'FilterTabs missing wNUT filter');
ok(filterTabsSrc.includes('"PIPS"'), 'FilterTabs missing PIPS filter (pre-existing gap)');

// 6. Dynamic token route — wnut excluded (static /token/wnut wins), descriptions for all 8
ok(tokenIdSrc.includes("t.id !== 'wnut'"), 'getStaticPaths must exclude wnut (static page wins)');
for (const n of ['wNUT', 'VVV', 'DIEM', 'VIRTUAL', 'MOR', 'wstETH', 'tBTC', 'EURC']) {
  ok(tokenIdSrc.includes(`${n}: '`), `TOKEN_DESCRIPTIONS missing ${n}`);
}

// 7. Sitemap — pre-existing gaps (pages exist but not listed)
ok(sitemapSrc.includes('/token/pips'), 'sitemap missing /token/pips');
ok(sitemapSrc.includes('/token/pnutrmy'), 'sitemap missing /token/pnutrmy');

console.log(`grove cards: ${passed} requirements passed`);
