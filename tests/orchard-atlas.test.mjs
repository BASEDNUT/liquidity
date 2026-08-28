/**
 * Orchard Atlas deployment test — static trio under public/atlas/
 * Verifies: file presence, absolute internal links, key content markers,
 * dataset parse, scale system wiring, nav/llms/sitemap/rewrites integration.
 */
import { readFileSync, existsSync } from "fs";
import assert from "assert";

const idx = readFileSync("public/atlas/index.html", "utf8");
const data = readFileSync("public/atlas/data.html", "utf8");
const ds = readFileSync("public/atlas/orchard-data.js", "utf8");
const header = readFileSync("components/Header.js", "utf8");
const llms = readFileSync("public/llms.txt", "utf8");
const sitemap = readFileSync("public/sitemap.xml", "utf8");
const cfg = readFileSync("next.config.js", "utf8");

/* ── files exist ── */
assert.ok(existsSync("public/atlas/index.html"), "concept surface missing");
assert.ok(existsSync("public/atlas/data.html"), "instrument surface missing");
assert.ok(existsSync("public/atlas/orchard-data.js"), "dataset missing");

/* ── absolute internal links (clean-URL safe) ── */
assert.ok(!idx.includes('src="orchard-data.js'), "index.html: relative dataset src");
assert.ok(!data.includes('src="orchard-data.js'), "data.html: relative dataset src");
assert.ok(idx.includes('src="/atlas/orchard-data.js'), "index.html: absolute dataset src missing");
assert.ok(data.includes('src="/atlas/orchard-data.js'), "data.html: absolute dataset src missing");
assert.ok(idx.includes('href="/atlas/data.html"'), "index.html: absolute atlas-data link missing");
assert.ok(data.includes('href="/atlas/index.html"'), "data.html: absolute concept link missing");

/* ── dataset parses and carries the live census ── */
new Function(ds);
assert.ok(ds.includes('"sunflower"'), "dataset: sunflower grove missing");
assert.ok(/census\s*:\s*\{/.test(ds) && /marketRings:\s*44/.test(ds), "dataset: ring census missing");
assert.ok(ds.includes("0xBA5ED46e31F80dafF307cbf60bd422a6f62E3dd3"), "dataset: wNUT wrapper address missing");

/* ── concept surface markers ── */
assert.ok(idx.includes("rooted, multiplex liquidity hypergraph"), "index: framework thesis missing");
assert.ok(idx.includes("Two scales, two graphs"), "index: scale doctrine note missing");
assert.ok(idx.includes("scale-note"), "index: scale note class missing");

/* ── instrument surface markers ── */
assert.ok(data.includes("scaleOf"), "data: scale classification missing");
assert.ok(data.includes("NUT-rooted"), "data: NUT-rooted filter chip missing");
assert.ok(data.includes("wNUT-rooted"), "data: wNUT-rooted filter chip missing");
assert.ok(data.includes("ROOT ASSET"), "data: NUT sub-label missing");
assert.ok(data.includes("ROOTSTOCK"), "data: wNUT sub-label missing");
assert.ok(data.includes("aria-pressed"), "data: chip aria state missing");
assert.ok(data.includes("data-fkey"), "data: chip data attrs missing");

/* ── site integration ── */
assert.ok(header.includes('href: "/atlas"'), "Header: /atlas nav entry missing");
assert.ok(llms.includes("[Orchard Atlas](/atlas)"), "llms.txt: Atlas entry missing");
assert.ok(sitemap.includes("https://orchard.basednut.com/atlas"), "sitemap: /atlas URL missing");
assert.ok(sitemap.includes("https://orchard.basednut.com/atlas/data"), "sitemap: /atlas/data URL missing");
assert.ok(cfg.includes("source: '/atlas'"), "next.config: /atlas rewrite missing");
assert.ok(cfg.includes("source: '/atlas/data'"), "next.config: /atlas/data rewrite missing");

console.log("orchard-atlas.test: all assertions passed");
