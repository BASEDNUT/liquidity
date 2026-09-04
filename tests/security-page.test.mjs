import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = (p) => readFileSync(p, 'utf8');

// Security page port — Boss-supplied based-nut-security.html, rebuilt site-native.

// Group 1: page exists + site chrome
assert.ok(existsSync('pages/security.js'), 'pages/security.js missing');
const src = read('pages/security.js');
assert.ok(src.includes("import Layout from '../components/Layout'"), 'page must use site Layout chrome');
assert.ok(src.includes('Security | BASED NUT'), 'missing <title> Security | BASED NUT');
assert.ok(src.includes('BASED NUT security model, operational controls, incident response, monitoring, multisig, and agent-security principles.'), 'missing meta description');

// Group 2: hero + disclaimer verbatim
assert.ok(src.includes('Security is an operating system.'), 'missing hero h1');
assert.ok(src.includes('Experimental memefi means experimental risk.'), 'missing experimental-risk warning');
for (const chip of ['Evidence first', 'Least authority', 'Human control of critical actions', 'Continuous monitoring']) {
  assert.ok(src.includes(chip), `missing hero chip: ${chip}`);
}

// Group 3: all seven sections present with ids
for (const id of ['model', 'incident', 'operations', 'agents', 'intel', 'disclosure', 'sources']) {
  assert.ok(src.includes(`id="${id}"`), `missing section id: ${id}`);
}
for (const h of [
  'Defense in layers.',
  'When something is live.',
  'Operational security.',
  'AI may advise. Execution is gated.',
  'Threat intelligence is structured evidence.',
  'Report vulnerabilities privately.',
  'Security doctrine we reference.',
]) {
  assert.ok(src.includes(h), `missing section headline: ${h}`);
}

// Group 4: incident path — 4 steps + SEAL 911 escalation
for (const step of ['Step 1', 'Step 2', 'Step 3', 'Step 4']) {
  assert.ok(src.includes(`>${step}<`), `missing ${step} marker`);
}
for (const name of ['Confirm', 'Coordinate', 'Contain', 'Recover']) {
  assert.ok(src.includes(`>${name}<`), `missing incident step: ${name}`);
}
assert.ok(src.includes('SEAL 911'), 'missing SEAL 911 escalation card');
assert.ok(src.includes('https://securityalliance.org/our-work/seal-911'), 'missing SEAL 911 link');

// Group 5: intel state table
for (const state of ['unknown', 'blocked', 'trusted']) {
  assert.ok(src.includes(`<code>${state}</code>`), `missing intel state: ${state}`);
}

// Group 6: seven doctrine sources
const sources = [
  'https://securityalliance.org/our-work/seal-911',
  'https://github.com/security-alliance/seal-911',
  'https://frameworks.securityalliance.org/intro/introduction/',
  'https://frameworks.securityalliance.org/llms.txt',
  'https://github.com/security-alliance/frameworks',
  'https://github.com/security-alliance/frameworks-mcp',
  'https://github.com/security-alliance/seal-intel-sdk',
];
for (const u of sources) {
  assert.ok(src.includes(u), `missing source: ${u}`);
}

// Group 7: in-page anchor nav + CTA
assert.ok(src.includes('aria-label="Primary"'), 'missing in-page anchor nav');
for (const a of ['href="#model"', 'href="#incident"', 'href="#operations"', 'href="#agents"', 'href="#disclosure"', 'href="#sources"']) {
  assert.ok(src.includes(a), `missing anchor: ${a}`);
}
assert.ok(src.includes('Different systems. One security boundary.'), 'missing CTA headline');
assert.ok(src.includes('https://docs.basednut.com/'), 'missing CTA docs link');

// Group 8: CSS scoped to .secPage — no scaffold globals
assert.ok(src.includes('.secPage'), 'missing .secPage scope wrapper');
assert.ok(!src.includes(':root'), 'CSS must not define :root (rescope vars to .secPage)');
assert.ok(!/\bbody\s*\{/.test(src), 'CSS must not style body');
assert.ok(!/\bhtml\s*\{/.test(src), 'CSS must not style html');
assert.ok(!src.includes('footer-row'), 'scaffold footer must be dropped (site Footer owns chrome)');
assert.ok(!src.includes('className="brand"'), 'scaffold brand bar must be dropped (site Header owns brand)');

// Group 9: wiring — Header nav (Explore section), llms.txt, sitemap
const header = read('components/Header.js');
assert.ok(header.includes('href: "/security"'), 'Header nav missing /security');
const exploreIdx = header.indexOf('Explore');
assert.ok(exploreIdx > -1, 'Explore section not found in Header');
assert.ok(header.slice(exploreIdx).includes('href: "/security"'), '/security must live in Explore section');
const llms = read('public/llms.txt');
assert.ok(llms.includes('[Security](/security)'), 'llms.txt missing Security entry');
const sitemap = read('public/sitemap.xml');
assert.ok(sitemap.includes('https://orchard.basednut.com/security'), 'sitemap missing /security');

console.log('security-page: 9 groups — Boss security doctrine ported site-native (7 sections, SEAL sources, scoped CSS, nav/llms/sitemap wired) — ALL PASS');
