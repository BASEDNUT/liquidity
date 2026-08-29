import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

// ── Ecosystem graphs merged into FAQ (2026-08-28) ────────────────
// Contract: /ecosystem page removed; graphs render at top of /faq
// via shared component; old URL redirects; nav entry gone.

// 1. standalone page is gone
assert.ok(
  !existsSync(new URL('../pages/ecosystem.js', import.meta.url)),
  'pages/ecosystem.js must be removed — graphs live on /faq'
);

// 2. shared chart viewer component carries the full behavior
const charts = read('../components/EcosystemCharts.js');
assert.ok(charts.includes('ecosystem-charts.json'), 'component must load chart data');
assert.ok(charts.includes('loadMermaid'), 'component must keep the mermaid loader');
assert.ok(charts.includes('IMAGE_FILES'), 'component must keep image chart support');
assert.ok(!charts.includes('components/Layout'), 'component must not embed Layout (page-level)');
assert.ok(!charts.includes('next/head'), 'component must not embed Head (page-level)');

// 3. FAQ renders graphs on top, above the FAQ header
const faq = read('../pages/faq.js');
assert.ok(faq.includes("EcosystemCharts"), 'FAQ must import the charts component');
const graphsIdx = faq.indexOf('<EcosystemCharts');
const faqHeaderIdx = faq.indexOf('Based NUT FAQ');
assert.ok(graphsIdx > -1, 'FAQ must render <EcosystemCharts />');
assert.ok(
  faqHeaderIdx > -1 && graphsIdx < faqHeaderIdx,
  'graphs must render above the FAQ header'
);

// 4. nav: Graphs entry removed
const header = read('../components/Header.js');
assert.ok(!header.includes('href: "/ecosystem"'), 'nav must not link /ecosystem anymore');

// 5. old URL redirects to FAQ
const config = read('../next.config.js');
assert.ok(
  config.includes("source: '/ecosystem'") && config.includes("destination: '/faq'"),
  'next.config must redirect /ecosystem to /faq'
);

// 6. llms.txt reflects the merged page
const llms = read('../public/llms.txt');
const faqLine = llms.split('\n').find((l) => l.startsWith('- [FAQ]'));
assert.ok(faqLine, 'llms.txt must keep a FAQ entry');
assert.ok(/graph/i.test(faqLine), 'llms.txt FAQ entry must mention graphs');

console.log('orchard-faq-graphs: ecosystem page merged into FAQ — ALL PASS');
