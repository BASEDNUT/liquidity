import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = (p) => readFileSync(p, 'utf8');

// Orchard marketing layer — Boss-supplied based-nut-orchard-v15 index.html.
// Ported site-native per S84: appended AFTER our cards (trees first), v15 chrome stripped
// (topbar/hero/explorer/footer/JS), OUR live OrchardBoard embedded at the ledger position
// inside the new code, plant CTA repointed to /pair-your-token, docs references wired.

// Group 1: component + page wiring
assert.ok(existsSync('components/OrchardMarketing.js'), 'components/OrchardMarketing.js missing');
const comp = read('components/OrchardMarketing.js');
const idx = read('pages/index.js');
assert.ok(idx.includes('import OrchardMarketing from "../components/OrchardMarketing"'), 'index.js missing OrchardMarketing import');
assert.ok(idx.includes('<OrchardMarketing'), 'index.js missing OrchardMarketing render');
assert.ok(idx.includes('/img/hero-logo.png'), 'hero must stay untouched');
assert.ok(idx.includes('PoolCard'), 'PoolCard cards must stay');
assert.ok(idx.includes('TokenCard'), 'TokenCard cards must stay');
assert.ok(!idx.includes('<OrchardBoard'), 'standalone board must move inside marketing layer');

// Group 2: all v15 marketing sections ported
for (const cls of ['advanced-intro','metadex-section','scale-section','factor-section','soil-section','structure-section','physics-section','ecology-section','projection-section','microclimate','whorl-family','credit-section','claim-section','machine-section','canopy-forms','canopy-reveal','boundary-section','boardwrap','plant']) {
  assert.ok(comp.includes(`"${cls}"`), `missing section: ${cls}`);
}

// Group 3: copy anchors (S84 de-slop — positive definitions; v15 content preserved)
for (const h of [
  'Five layers, one Orchard.',
  'The market between markets has no pool.',
  'Foreign assets enter as soil.',
  'Arity changes the object.',
  'Every venue has its own math.',
  'Markets grow, dry out, cross-pollinate, and get pruned.',
  'The Whorl family: one shape, three uses.',
  'nutUSD — credit machinery.',
  'Sometimes the pool grows a token. Then the token gets a pool.',
  'A trade does not pass through the Orchard. It rewrites the Orchard it passes through.',
  'Topology is the view from above.',
  'The Orchard is the graph of graphs.',
  'Some systems feed the Orchard without joining it.',
  'Under the bark',
  'Got a token?',
  'ROOT IT INTO THE ORCHARD',
]) assert.ok(comp.includes(h), `missing copy anchor: ${h}`);

// Group 4: stripped chrome — v15 nav/explorer/footer/JS must not leak (markup + CSS patterns, not prose)
for (const bad of ['class="topbar"', 'className="topbar"', '.topbar{', '.topbar ', 'class="brand"', 'class="nav"', '<nav', 'class="explorer"', 'className="explorer"', 'token-grid', 'pool-grid', '<footer', '>footer', 'getElementById', '<script']) {
  assert.ok(!comp.includes(bad), `stripped chrome leaked: ${bad}`);
}

// Group 4b: v15 tree-canopy hero WANTED (Boss request) — opens the marketing layer after our cards
for (const want of ['class="hero"', 'hero-inner', 'skygrain', 'class="canopy"', 'class="tree ', 'Every forest starts with one nut.', 'THE ORCHARD']) {
  assert.ok(comp.includes(want), `v15 hero missing: ${want}`);
}
assert.ok(comp.includes('@keyframes orchardFloat'), 'hero float keyframes must be renamed to orchardFloat (global namespace)');
assert.ok(!comp.includes('@keyframes float'), 'bare float keyframes name must not leak');

// Group 5: OUR live board embedded at the ledger position — JSX render order: sections → board → plant CTA
const aRender = comp.indexOf('dangerouslySetInnerHTML={{ __html: PART_A }}');
const boardRender = comp.indexOf('<OrchardBoard');
const cRender = comp.indexOf('dangerouslySetInnerHTML={{ __html: PART_C }}');
assert.ok(aRender >= 0, 'PART_A render marker missing');
assert.ok(boardRender >= 0, 'OrchardBoard render missing');
assert.ok(cRender >= 0, 'PART_C render marker missing');
assert.ok(comp.includes('boundary-section'), 'boundary section must exist in PART_A');
assert.ok(aRender < boardRender, 'board must render after marketing sections');
assert.ok(boardRender < cRender, 'board must render before plant CTA');
assert.ok(comp.includes('Data sources:'), 'data sources caption must follow the board');

// Group 6: CTA repointed + docs references wired
assert.ok(comp.includes('href="/pair-your-token"'), 'plant CTA must point at /pair-your-token');
const docHrefs = [...comp.matchAll(/https:\/\/docs\.basednut\.com[^\s"'`)]+/g)].map((m) => m[0]);
assert.ok(docHrefs.length >= 8, `need >=8 docs references, found ${docHrefs.length}`);
for (const doc of ['the-orchard-framework', 'factorizing-nut', 'sunflower-grove', 'snut-mechanics', 'nutusd', 'canopy-forms', 'topology-graphs', 'token-catalog']) {
  assert.ok(comp.includes(doc), `missing docs ref: ${doc}`);
}

// Group 7: CSS scoped under .orchard-marketing — no global leaks
assert.ok(comp.includes('.orchard-marketing{--soil'), 'CSS vars must scope to .orchard-marketing, not :root');
assert.ok(!/(^|[^.\w-]):root\{/.test(comp), ':root must not leak');
assert.ok(!/(^|[^.\w-])body\{/.test(comp), 'body selector must not leak');
assert.ok(!/(^|[^.\w-])html\{/.test(comp), 'html selector must not leak');
assert.ok(!comp.includes('>footer'), 'no footer element');

// Group 8: test chained into npm test
const pkg = read('package.json');
assert.ok(pkg.includes('orchard-marketing.test.mjs'), 'test must be chained into npm test');

// Group 9: S84 de-slop pass — positive definitions, no meta-language, no plain-note device
assert.ok(!comp.includes('plain-note'), 'plain-note device must be gone');
assert.ok(comp.includes('Five layers, one Orchard.'), 'positive intro headline missing');
assert.ok(comp.includes('The cards above are the trees. This part is how they fit together.'), 'promoted onboarding lead missing');
assert.ok(comp.includes('A grove groups related structures.'), 'positive grove definition missing');
assert.ok(comp.includes('Foreign assets enter as soil.'), 'positive soil headline missing');
assert.ok(comp.includes('Every venue has its own math.'), 'positive physics headline missing');
assert.ok(comp.includes('nutUSD — credit machinery.'), 'nutUSD headline missing');
assert.ok(comp.includes('The Orchard is the graph of graphs.'), 'positive reveal headline missing');
assert.ok(comp.includes('Some systems feed the Orchard without joining it.'), 'positive boundaries headline missing');
// anti-slop residuals must stay dead
for (const bad of ['is not a grove', 'not another ontology', 'graph theory first', 'Pollination is not decoration', 'does not make an asset a Based NUT descendant', 'Plain English:', 'pretending every', 'framework separates', 'framework now treats']) {
  assert.ok(!comp.includes(bad), `slop residual: ${bad}`);
}
// kept guards + anchors
assert.ok(comp.includes('nutUSD is not USD'), 'nutUSD stablecoin guard must stay');
assert.ok(comp.includes('href="/atlas"'), 'atlas link missing');
assert.ok(comp.includes('href="/atlas/data"'), 'atlas data link missing');
assert.ok(comp.includes('color:#5f4a3e'), 'darker brown #5f4a3e missing');

console.log('orchard-marketing: all groups passed');
