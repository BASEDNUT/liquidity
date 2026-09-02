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
assert.ok(/census\s*:\s*\{/.test(ds) && /marketRings:\s*180/.test(ds), "dataset: ring census missing");
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

/* ── site nav cohesion — ONE nav per page, site links merged inline ── */
for (const [name, html] of [["index", idx], ["data", data]]) {
  assert.equal((html.match(/<nav[ >]/g) || []).length, 1, name + ": must have exactly one nav element");
  assert.ok(!html.includes("sitenav"), name + ": sitenav residue must be gone");
  assert.ok(html.includes(`href="/"`), name + ": home link missing");
  assert.ok(!html.includes(`href="/tree"`), name + ": tree link must not be in nav (home covers it)");
  assert.ok(!html.includes(`href="/ecosystem"`), name + ": graphs link must not be in nav (home covers it)");
  assert.ok(html.includes(`href="/faq"`), name + ": faq link missing");
  assert.ok(html.includes("docs.basednut.com"), name + ": docs link missing");
  assert.ok(html.includes(`aria-label="Based Nut home"`), name + ": brand home aria-label missing");
}
assert.ok(idx.includes(`href="/atlas/data.html"`), "index: atlas-data link missing in nav");
assert.ok(data.includes(`href="/atlas/index.html"`), "data: concept link missing in nav");

/* ── nav label renames ── */
assert.ok(header.includes(`label: "File a Complaint"`), "Header: File a Complaint rename missing");
assert.ok(header.includes(`label: "Carbon Ledger"`), "Header: Carbon Ledger rename missing");
assert.ok(!header.includes("Department of Complaints"), "Header: old complaints label still present");
assert.ok(!header.includes("Carbon Pricing Exposure"), "Header: old carbon label still present");

/* ── site integration ── */
assert.ok(header.includes('href: "/atlas"'), "Header: /atlas nav entry missing");
assert.ok(llms.includes("[Orchard Atlas](/atlas)"), "llms.txt: Atlas entry missing");
assert.ok(sitemap.includes("https://orchard.basednut.com/atlas"), "sitemap: /atlas URL missing");
assert.ok(sitemap.includes("https://orchard.basednut.com/atlas/data"), "sitemap: /atlas/data URL missing");
assert.ok(cfg.includes("source: '/atlas'"), "next.config: /atlas rewrite missing");
assert.ok(cfg.includes("source: '/atlas/data'"), "next.config: /atlas/data rewrite missing");


/* ── gtSIL RWA graft + census truth repair (2026-09-01) ── */
assert.ok(ds.includes('id: "gt-sil"'), "dataset: gtSIL structure missing");
assert.ok(ds.includes("0xA669275f92e49aff80aBA7AaD86E5AFDDe3540B0"), "dataset: gtSIL pool address missing");
assert.ok(ds.includes("0xb20000000000000000000078ee7ce2fE4908108C"), "dataset: NVDAc B20 address missing");
assert.ok(ds.includes("0xb200000000000000000000C2e324d24d7eEcd1fb"), "dataset: AAPLc B20 address missing");
assert.ok(/NVDAC:\s*\{[^}]*decimals: 8/.test(ds) && /AAPLC:\s*\{[^}]*decimals: 8/.test(ds), "dataset: B20 scion decimals wrong");
assert.ok(/rwa:\s*\{ label: "RWA Grove"/.test(ds), "dataset: RWA grove missing");
assert.ok(/total:\s*219/.test(ds), "dataset: census total 219 missing");
assert.ok(/wrapperCrossRings:\s*32/.test(ds), "dataset: wrapper-cross 32 missing");
assert.ok(/recompute:/.test(ds), "dataset: census recompute provenance missing");
assert.ok(data.includes("all six Twin Grafts"), "data: sunflower hub tooltip still says five");
assert.ok(data.includes("six Twin Grafts on one wNUT rootstock"), "data: sunflower caption not updated to six");
assert.ok(data.includes("219 rings enumerated: 180 market \u00b7 32 wrapper-cross \u00b7 7 parallel-venue"), "data: polyforest census caption stale");
assert.ok(data.includes("rwa:'#b8c0cc'"), "data: rwa kind color missing");
assert.ok(data.includes("['rwa',"), "data: rwa grove chip missing");
assert.ok(idx.includes("Six rooted Twin Grafts"), "index: sunflower card still says Five");
assert.ok(idx.includes("gtSIL Silicon Twin Graft (RWA \u2014 NVIDIA \u00b7 Apple) live 2026-09-01"), "index: gtSIL sunflower card mention missing");
assert.ok(idx.includes("all six pools"), "index: rootstock anatomy note still says five");
assert.ok(idx.includes("219 rings total"), "index: polyforest ring count stale");
assert.ok(idx.includes("v=live2") && data.includes("v=live2"), "atlas: dataset cache-bust not bumped");

console.log("orchard-atlas.test: all assertions passed");
