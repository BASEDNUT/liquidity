import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Session 73 revisions (2026-09-01):
// 1. NUT = Roots (not Trunk) — trunk/rootstock kept graphically
// 2. wstETH droplet rainwater icon
// 3. Grafts are tokens AND pools — 5 BPT token cards (pNUT dual pinned)
// 4. wNUT observatory: keyless RPC event-tape fallback + est market cap
// 5. Etherscan evaluated-NOT-integrated row in TOOLS.md

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const fetchTokensSrc = read('../utils/fetchTokens.js');
const fetchPoolsSrc = read('../utils/fetchPools.js');
const tokenSourcesSrc = read('../utils/tokenDataSources.js');
const tokenIdSrc = read('../pages/token/[id].js');
const indexSrc = read('../pages/index.js');
const filterTokensSrc = read('../components/FilterTokens.js');
const nutSrc = read('../pages/token/nut.js');
const treeSrc = read('../pages/tree.js');
const wnutSourcesSrc = read('../utils/wnutDataSources.js');
const wnutPageSrc = read('../pages/token/wnut.js');
const sitemapSrc = read('../public/sitemap.xml');
const llmsSrc = read('../public/llms.txt');
const pkgSrc = read('../package.json');
const toolsSrc = read('../../TOOLS.md');

const GRAFTS = [
  { name: 'gtINF', addr: '0x6a0a1B7428d543524592eD22023A09BdE05aA466' },
  { name: 'gtAGT', addr: '0x5dA95cC31C840Fd33180e4C7f879e3F3d8Eca200' },
  { name: 'gtETH', addr: '0xd156d51219B3a7A590670d655E8740Ad404e8835' },
  { name: 'gtBTC', addr: '0xb2a63935e1391Ee49E5cfB6cc4f184C285fE29b4' },
  { name: 'gtFX', addr: '0x1cCB8c61b62b9c7a9d4e66C9c824C1539B8b1f2E' },
];

let passed = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); passed += 1; };

// 1. Roots label — NUT is roots; trunk/rootstock kept as graphic position
ok(filterTokensSrc.includes('"Roots"'), 'FilterTokens missing Roots');
ok(!filterTokensSrc.includes('"Trunk"'), 'FilterTokens still has Trunk');
ok(indexSrc.includes('category: "Roots"'), 'index.js trunk category not Roots');
ok(!indexSrc.includes('category: "Trunk"'), 'index.js still has Trunk category');
ok(tokenIdSrc.includes("case 'Roots':"), '[id].js hero theme missing Roots case');
ok(!tokenIdSrc.includes("case 'Trunk':"), '[id].js still has Trunk hero case');
ok(!/category: 'Trunk'/.test(tokenIdSrc), '[id].js still has Trunk category');
ok(nutSrc.includes('label="Roots"'), 'nut.js chip not Roots');
ok(treeSrc.includes('Roots = NUT anchor'), 'tree.js legend not Roots');
ok(!treeSrc.includes('Trunk / roots = NUT anchor'), 'tree.js old legend remains');

// 2. wstETH droplet rainwater icon
ok(/name: "wstETH",[\s\S]*?icon: "💧"/.test(fetchTokensSrc), 'wstETH token card not droplet');
ok(fetchPoolsSrc.includes('icon: "🌻💧"'), 'gtETH pool icon not droplet');
ok(!fetchPoolsSrc.includes('🌀'), 'old swirl icon remains in pools');

// 3. Grafts are tokens AND pools — Balancer v3 BPT token cards
for (const g of GRAFTS) {
  ok(fetchTokensSrc.includes(`name: "${g.name}"`), `graft token card missing: ${g.name}`);
  ok(fetchTokensSrc.includes(g.addr), `graft token address missing: ${g.name}`);
  ok(tokenSourcesSrc.includes(`${g.name}:`), `TOKEN_ADDRESSES missing ${g.name}`);
  ok(tokenIdSrc.includes(`${g.name}: '`), `TOKEN_DESCRIPTIONS missing ${g.name}`);
  ok(sitemapSrc.includes(`/token/${g.name.toLowerCase()}`), `sitemap missing /token/${g.name.toLowerCase()}`);
  ok(llmsSrc.includes(`/token/${g.name.toLowerCase()}`), `llms.txt missing ${g.name}`);
}
// pNUT dual (token + pool) — pin the requirement
ok(fetchTokensSrc.includes('name: "pNUT"'), 'pNUT token card missing');
ok(fetchPoolsSrc.includes('name: "pNUT"'), 'pNUT pool card missing');

// 4. wNUT observatory — keyless RPC event tape + est market cap
ok(wnutSourcesSrc.includes('TRANSFER_TOPIC'), 'wnut sources missing TRANSFER_TOPIC');
ok(wnutSourcesSrc.includes('WNUT_DEPLOY_BLOCK'), 'wnut sources missing deploy block');
ok(wnutSourcesSrc.includes('fetchEventsRpc'), 'wnut sources missing RPC tape fallback');
ok(wnutSourcesSrc.includes('rpc_tape_failed'), 'wnut sources missing failure honesty guard');
ok(wnutSourcesSrc.includes('eth_getLogs'), 'wnut sources missing eth_getLogs');
ok(wnutSourcesSrc.includes('base.drpc.org'), 'wnut sources missing keyless drpc fallback RPC');
ok(wnutPageSrc.includes('Est. market cap'), 'wnut page missing est market cap row');

// 5. Etherscan evaluated-not-integrated row
ok(toolsSrc.includes('Etherscan'), 'TOOLS.md missing Etherscan row');
ok(toolsSrc.includes('NOT integrated'), 'TOOLS.md Etherscan row must say NOT integrated');

// 6. test wired into npm test
ok(pkgSrc.includes('groveRevisions.test.mjs'), 'package.json missing groveRevisions test');

console.log(`grove revisions: ${passed} requirements passed`);
