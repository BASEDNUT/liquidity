import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// gtSIL Silicon Twin Graft — RWA gap fill (2026-09-01)
// Truth source: on-chain RPC + Balancer API verification this session:
//   Pool 0xA669275f92e49aff80aBA7AaD86E5AFDDe3540B0 "Silicon Twin Graft" gtSIL
//   20% wNUT / 40% NVDAc / 40% AAPLc — Coinbase B20 tokenized stocks (8 decimals each).
// Covers: token cards, pool card, POOL_CONFIG, token pages, wnut markets + copy,
// sitemap, llms.txt, Header nav, dedicated /sunflower-grove page, agent-core config.py.

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const fetchTokensSrc = read('../utils/fetchTokens.js');
const fetchPoolsSrc = read('../utils/fetchPools.js');
const tokenSourcesSrc = read('../utils/tokenDataSources.js');
const marketSourcesSrc = read('../utils/marketDataSources.js');
const wnutSourcesSrc = read('../utils/wnutDataSources.js');
const tokenIdSrc = read('../pages/token/[id].js');
const wnutPageSrc = read('../pages/token/wnut.js');
const sitemapSrc = read('../public/sitemap.xml');
const llmsSrc = read('../public/llms.txt');
const headerSrc = read('../components/Header.js');
const configSrc = read('../../agent-core/config.py');
let grovePageSrc = '';
try { grovePageSrc = read('../pages/sunflower-grove.js'); } catch {}

const ADDR = {
  gtSIL: '0xA669275f92e49aff80aBA7AaD86E5AFDDe3540B0',
  NVDAc: '0xb20000000000000000000078ee7ce2fE4908108C',
  AAPLc: '0xb200000000000000000000C2e324d24d7eEcd1fb',
  wNUT: '0xBA5ED46e31F80dafF307cbf60bd422a6f62E3dd3',
};

function slugify(str) {
  return String(str).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}
const POOL_NAME = 'gtSIL wNUT/NVDAc/AAPLc';
const POOL_ID = `${slugify(POOL_NAME)}-${slugify('Balancer v3')}`;

let passed = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); passed += 1; };

// 1. Token cards — gtSIL BPT (nested) + NVDAc/AAPLc scions (soil)
ok(fetchTokensSrc.includes('name: "gtSIL"'), 'gtSIL BPT card missing');
ok(fetchTokensSrc.includes(ADDR.gtSIL), 'gtSIL address missing in fetchTokens.js');
ok(fetchTokensSrc.includes('name: "NVDAc"'), 'NVDAc soil card missing');
ok(fetchTokensSrc.includes(ADDR.NVDAc), 'NVDAc address missing in fetchTokens.js');
ok(fetchTokensSrc.includes('name: "AAPLc"'), 'AAPLc soil card missing');
ok(fetchTokensSrc.includes(ADDR.AAPLc), 'AAPLc address missing in fetchTokens.js');

// 2. TOKEN_ADDRESSES — live-data merge keys
for (const [k, a] of Object.entries(ADDR)) {
  ok(tokenSourcesSrc.includes(`${k}:`), `TOKEN_ADDRESSES missing key ${k}`);
  ok(tokenSourcesSrc.includes(a), `TOKEN_ADDRESSES missing address for ${k}`);
}

// 3. Pool card — six grafts now
ok(fetchPoolsSrc.includes(`name: "${POOL_NAME}"`), 'gtSIL pool card missing');
ok(fetchPoolsSrc.includes(ADDR.gtSIL), 'gtSIL pool address missing');
ok((fetchPoolsSrc.match(/platform: "Balancer v3"/g) || []).length === 6, 'exactly 6 Balancer v3 platform entries expected');
ok((fetchPoolsSrc.match(/category: \["TKNs", "wNUT"\]/g) || []).length === 6, 'grafts must carry [TKNs, wNUT] category — 6 now');

// 4. POOL_CONFIG id contract — live-data merge requires exact id match
ok(marketSourcesSrc.includes(`{ id: '${POOL_ID}'`), `POOL_CONFIG missing id ${POOL_ID}`);

// 5. wNUT data sources — VERIFIED_MARKETS sixth entry
ok(wnutSourcesSrc.includes("pair: 'wNUT/NVDAc/AAPLc'"), 'wnutDataSources missing gtSIL market pair');
ok(wnutSourcesSrc.includes(ADDR.gtSIL), 'wnutDataSources missing gtSIL pool address');

// 6. Token page descriptions
for (const n of ['gtSIL', 'NVDAc', 'AAPLc']) {
  ok(tokenIdSrc.includes(`${n}: '`), `TOKEN_DESCRIPTIONS missing ${n}`);
}

// 7. wNUT observatory copy — five -> six
ok(wnutPageSrc.includes('six Balancer v3'), 'wnut.js still says five pools');

// 8. Sitemap
for (const u of ['/token/gtsil', '/token/nvdac', '/token/aaplc', '/sunflower-grove']) {
  ok(sitemapSrc.includes(u), `sitemap missing ${u}`);
}

// 9. llms.txt
ok(llmsSrc.includes('[gtSIL](/token/gtsil)'), 'llms.txt missing gtSIL line');
ok(llmsSrc.includes('[NVDAc](/token/nvdac)'), 'llms.txt missing NVDAc line');
ok(llmsSrc.includes('[AAPLc](/token/aaplc)'), 'llms.txt missing AAPLc line');
ok(llmsSrc.includes('[Sunflower Grove](/sunflower-grove)'), 'llms.txt missing Sunflower Grove page line');

// 10. Header nav
ok(headerSrc.includes('"/sunflower-grove"'), 'Header missing Sunflower Grove link');

// 11. Dedicated page — all six grafts + key addresses
for (const a of Object.values(ADDR)) {
  ok(grovePageSrc.includes(a), `sunflower-grove.js missing address ${a}`);
}
for (const n of ['gtINF', 'gtAGT', 'gtETH', 'gtBTC', 'gtFX', 'gtSIL']) {
  ok(grovePageSrc.includes(n), `sunflower-grove.js missing graft ${n}`);
}

// 12. config.py source of truth
ok(configSrc.includes('GRAFT_SIL'), 'config.py missing GRAFT_SIL');
ok(configSrc.includes(ADDR.gtSIL), 'config.py missing gtSIL address');
ok(configSrc.includes(ADDR.NVDAc), 'config.py missing NVDAc address');
ok(configSrc.includes(ADDR.AAPLc), 'config.py missing AAPLc address');
ok(configSrc.includes('NVDAc = 8'), 'config.py Decimals.NVDAc must be 8 (B20 standard)');
ok(configSrc.includes('AAPLc = 8'), 'config.py Decimals.AAPLc must be 8 (B20 standard)');

console.log(`gtsil grove: ${passed} requirements passed`);
