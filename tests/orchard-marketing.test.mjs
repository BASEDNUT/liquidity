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

// Group 3: verbatim copy anchors (Boss copy, not paraphrased)
for (const h of [
  'A pool is not a grove.',
  'The market between markets has no pool.',
  'Foreign matter is not a branch.',
  'Arity changes the object.',
  'Same Orchard. Different laws of motion.',
  'Markets grow, dry out, cross-pollinate, and get pruned.',
  'One form. Three very different contents.',
  'Credit is another state system.',
  'Sometimes the pool grows a token. Then the token gets a pool.',
  'A trade does not pass through the Orchard. It rewrites the Orchard it passes through.',
  'Topology is the view from above.',
  'The Orchard is not one graph.',
  'Not every graph belongs in the Orchard.',
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

// Group 9: S84 clarity pass — plain-English notes, atlas links, darker browns
const notes = (comp.match(/class="plain-note"/g) || []).length;
assert.ok(notes >= 17, `need >=17 plain-English notes, found ${notes}`);
assert.ok(comp.includes('New here? The cards above are the trees'), 'five-layers welcome note missing');
assert.ok(comp.includes('href="/atlas"'), 'atlas link missing');
assert.ok(comp.includes('href="/atlas/data"'), 'atlas data link missing');
assert.ok(comp.includes('href="/sunflower-grove"'), 'sunflower grove link missing');
assert.ok(comp.includes('href="/token/nut"'), 'NUT token page link missing');
assert.ok(comp.includes('href="/token/pnut"'), 'pNUT token page link missing');
assert.ok(!comp.includes('color:#7a6559'), 'old light brown #7a6559 still present');
assert.ok(!comp.includes('color:#756156'), 'old light brown #756156 still present');
assert.ok(comp.includes('color:#5f4a3e'), 'darker brown #5f4a3e missing');
assert.ok(comp.includes('.plain-note{'), 'plain-note CSS missing');

console.log('orchard-marketing: all groups passed');
