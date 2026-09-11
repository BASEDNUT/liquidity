import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const board = readFileSync(new URL('../components/OrchardBoard.js', import.meta.url), 'utf8');
const home = readFileSync(new URL('../pages/index.js', import.meta.url), 'utf8');
const marketing = readFileSync(new URL('../components/OrchardMarketing.js', import.meta.url), 'utf8');

// Component: unified asset board (tokens + pools in one live table)
for (const required of [
  'mergeTokenLive',            // token merge: GT -> DS -> CG -> BAL
  'mergePoolLive',             // pool merge: GT -> DS -> MC
  'The Orchard Board',         // accessible label
  'All NUTs and pools priced live', // caption/heading
  'stale',                     // stale badge handling
  'GT', 'DS', 'CG', 'BAL', 'MC', // per-row source codes
  'fmtUsd', 'fmtPrice',        // shared formatters
  '#FFF7EA', '#5B3A29',        // peanut-warm palette
  'type: "token"', 'type: "pool"', // row typing
  '/token/', '/pool/',         // internal links per row type
]) {
  assert.ok(board.includes(required), `OrchardBoard missing: ${required}`);
}

// S84: board moved inside the OrchardMarketing layer at the v15 ledger slot
assert.ok(home.includes('OrchardMarketing'), 'index.js must render OrchardMarketing layer');
assert.ok(marketing.includes('import OrchardBoard'), 'marketing layer must import the live board');
assert.ok(marketing.includes('<OrchardBoard'), 'marketing layer must embed the live board');
assert.ok(marketing.includes('All NUTs — live board'), 'live board heading present in marketing layer');
assert.ok(!home.includes('<PoolsTable'), 'index.js must not render PoolsTable anymore');
assert.ok(!home.includes('<TokensTable'), 'index.js must not render TokensTable anymore');
assert.ok(!home.includes('import PoolsTable'), 'PoolsTable import must be removed');
assert.ok(!home.includes('import TokensTable'), 'TokensTable import must be removed');

// Board must consume both live data sources (fetches stay in index.js, props flow through)
assert.ok(home.includes('/api/token-data'), 'token-data fetch must remain');
assert.ok(home.includes('/api/market-data'), 'market-data fetch must remain');

console.log('home unified table: 17 requirements passed');
