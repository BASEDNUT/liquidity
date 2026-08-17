import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../pages/rwa/carbon-debt.js', import.meta.url), 'utf8');

for (const required of [
  'What these numbers mean',
  "Scope 1+2 means emissions from a company&apos;s own operations and the energy it buys.",
  'reported tonnes × a fixed $',
  'not environmental damage, a legal debt, a forecast, or investment advice',
  'Example: ExxonMobil',
  'aria-label={`Definition: ${label}`}',
  'Operational emissions (Scope 1 + 2)',
  'Modeled burden / revenue',
  'Modeled burden / market cap',
  'Response capital — disclosure only',
  'fixed $${PRICE_PER_T}/t benchmark',
  'Swipe the table sideways to view every metric',
]) {
  assert.ok(page.includes(required), `missing clarity requirement: ${required}`);
}

for (const forbidden of ['Modeled YTD burden', 'Annualized rate', 'Modeled YTD emissions']) {
  assert.ok(!page.includes(forbidden), `misleading historical-data label remains: ${forbidden}`);
}

console.log('carbon clarity: 13 requirements passed');
