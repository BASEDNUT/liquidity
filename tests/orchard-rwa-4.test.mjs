import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = (p) => readFileSync(p, 'utf8');

// ─── New pages: data + route + verbatim port ───
const NEW_PAGES = [
  { route: 'orchard-economics', wrapper: 'orchec', data: 'orchardEconomics.json', title: 'Orchard Economics', h1: 'An orchard is a capital project that grows', sections: ['Capital comes before yield', 'What one modeled acre costs', 'The orchard as an economic object', 'Insurance belongs inside the orchard model', 'Data registry'] },
  { route: 'nut-inventory-infrastructure', wrapper: 'nutinv', data: 'nutInventory.json', title: 'Nut Inventory & Infrastructure', h1: 'Inventory is the collateral layer', sections: ['What is actually reported', 'From orchard to custody', 'The public-data boundary', 'Data registry'] },
  { route: 'nut-demand', wrapper: 'nutdem', data: 'nutDemand.json', title: 'Nut Demand', h1: 'Where the crop disappears into use', sections: ['The demand equation', 'Almond demand, MY2024/25', 'Consumption moved materially higher', 'Data registry'] },
];

for (const P of NEW_PAGES) {
  describe(`new page /rwa/${P.route}`, () => {
    it(`route file exists`, () => assert.ok(existsSync(`pages/rwa/${P.route}.js`), 'missing page'));
    it(`data JSON exists with css+html`, () => {
      const d = JSON.parse(read(`src/data/${P.data}`));
      assert.ok(d.css && d.css.length > 500, 'css thin');
      assert.ok(d.html && d.html.length > 500, 'html thin');
      assert.equal(d.script ?? '', '', 'should have no script (static page)');
      assert.ok(!d.css.includes(':root'), ':root must be rescoped to wrapper');
      assert.ok(d.css.includes(`.${P.wrapper}`), 'css not scoped to wrapper');
    });
    it(`page uses wrapper + Layout + no fabricated fetch`, () => {
      const js = read(`pages/rwa/${P.route}.js`);
      assert.ok(js.includes(P.wrapper), 'wrapper missing');
      assert.ok(js.includes('Layout'), 'no Layout');
      assert.ok(!/fetch\(/.test(js), 'page must not fetch');
    });
    it(`html preserves all sections verbatim`, () => {
      const d = JSON.parse(read(`src/data/${P.data}`));
      for (const s of P.sections) assert.ok(d.html.includes(s), `section missing: ${s}`);
      assert.ok(d.html.includes(P.h1), 'h1 missing');
    });
  });
}

// ─── /rwa landing with Nut RWA Stack ───
describe('/rwa landing page', () => {
  it('exists', () => assert.ok(existsSync('pages/rwa/index.js'), 'no /rwa index'));
  it('contains stack diagram + links to all 9 RWA pages', () => {
    const js = read('pages/rwa/index.js');
    for (const href of ['/rwa/nuts-production', '/rwa/nut-atlas', '/rwa/orchard-economics', '/rwa/nut-inventory-infrastructure', '/rwa/nut-trade-flows', '/rwa/nut-demand', '/rwa/nut-inflation', '/rwa/nut-stocks', '/rwa/carbon-debt']) {
      assert.ok(js.includes(href), `landing missing link ${href}`);
    }
  });
});

// ─── Existing page patches (from existing-rwa-page-additions.md) ───
describe('/rwa/nut-inflation additions', () => {
  it('has The Price Stack + hedging sections', () => {
    const d = JSON.parse(read('src/data/nutStandard.json'));
    assert.ok(d.html.includes('The Price Stack'), 'Price Stack missing');
    assert.ok(d.html.includes('Can You Hedge a Nut?'), 'hedge section missing');
    assert.ok(d.html.includes('$4.92/kg'), 'I1 figure missing');
    assert.ok(d.html.includes('$7.20/kg'), 'I2 figure missing');
    assert.ok(d.html.includes('$2.25/lb'), 'I3 missing');
    assert.ok(d.html.includes('120,000 kg'), 'I4 missing');
    assert.ok(d.html.includes('20250328-51'), 'I5 notice missing');
    assert.ok(d.html.includes('wits.worldbank.org/trade/comtrade/en/country/USA/year/2024/tradeflow/Exports/partner/ALL/product/080212'), 'I1 link missing');
  });
});

describe('/rwa/nut-trade-flows additions', () => {
  it('has Trade Is Not Demand + physical chain + demand bridge', () => {
    const d = JSON.parse(read('src/data/nutTradeFlows.json'));
    assert.ok(d.html.includes('Trade Is Not Demand'), 'section missing');
    assert.ok(d.html.includes('410,000'), 'EU consumption missing');
    assert.ok(d.html.includes('1,615,830'), 'global consumption missing');
    assert.ok(d.html.includes('TreeNuts.pdf'), 'T1 citation missing');
    assert.ok(d.html.includes('orchard \u2192 handler'), 'physical chain missing');
    assert.ok(/nut-demand/.test(d.html), 'Nut Demand bridge link missing');
    assert.ok(/nut-inventory-infrastructure/.test(d.html), 'Inventory bridge link missing');
  });
});

describe('/rwa/nuts-production addition', () => {
  it('has Production \u2260 Use bridge', () => {
    const js = read('pages/rwa/nuts-production.js');
    assert.ok(js.includes('Production \u2260 Use') || js.includes('Production ≠ Use'), 'bridge heading missing');
    assert.ok(js.includes('1,646,710'), 'production figure missing');
    assert.ok(js.includes('1,615,830'), 'consumption figure missing');
    assert.ok(js.includes('256,877'), 'ending stocks missing');
    assert.ok(js.includes('TreeNuts.pdf'), 'P1 citation missing');
  });
});

describe('/rwa/carbon-debt cross-link', () => {
  it('has Orchard Economics cross-link blockquote', () => {
    const js = read('pages/rwa/carbon-debt.js');
    assert.ok(js.includes('Orchard Economics'), 'cross-link missing');
    assert.ok(js.includes('/rwa/orchard-economics'), 'link missing');
  });
});

// ─── Citation registry shipped ───
describe('citation registry', () => {
  it('copied into src/data', () => {
    const d = JSON.parse(read('src/data/rwaCitationRegistry.json'));
    assert.ok(d.sources.length >= 10, 'registry thin');
    assert.ok(d.sources.some((s) => s.id.includes('I3') || s.id === 'I3'), 'I3 missing');
  });
});

// ─── Nav + sitemap + llms ───
describe('nav + sitemap + llms wiring', () => {
  it('header has 3 new pages + /rwa landing', () => {
    const h = read('components/Header.js');
    assert.ok(h.includes('/rwa/orchard-economics'), 'economics nav missing');
    assert.ok(h.includes('/rwa/nut-inventory-infrastructure'), 'inventory nav missing');
    assert.ok(h.includes('/rwa/nut-demand'), 'demand nav missing');
    assert.ok(h.includes('/rwa"'), '/rwa landing nav missing');
  });
  it('sitemap has all new routes', () => {
    const s = read('public/sitemap.xml');
    for (const r of ['/rwa', '/rwa/orchard-economics', '/rwa/nut-inventory-infrastructure', '/rwa/nut-demand']) {
      assert.ok(s.includes(r + '<'), `sitemap missing ${r}`);
    }
  });
  it('llms.txt describes all new pages', () => {
    const l = read('public/llms.txt');
    assert.ok(l.includes('orchard-economics'), 'llms economics missing');
    assert.ok(l.includes('nut-inventory-infrastructure'), 'llms inventory missing');
    assert.ok(l.includes('nut-demand'), 'llms demand missing');
  });
});
