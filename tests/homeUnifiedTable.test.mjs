import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const board = readFileSync(new URL('../components/OrchardBoard.js', import.meta.url), 'utf8');
const home = readFileSync(new URL('../pages/index.js', import.meta.url), 'utf8');

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

// Home page: ONE unified table replaces the two separate tables
assert.ok(home.includes('OrchardBoard'), 'index.js must render OrchardBoard');
assert.ok(!home.includes('<PoolsTable'), 'index.js must not render PoolsTable anymore');
assert.ok(!home.includes('<TokensTable'), 'index.js must not render TokensTable anymore');
assert.ok(!home.includes('import PoolsTable'), 'PoolsTable import must be removed');
assert.ok(!home.includes('import TokensTable'), 'TokensTable import must be removed');
assert.ok(home.includes('All NUTs — live board'), 'unified table heading present');

// Board must consume both live data sources
assert.ok(home.includes('/api/token-data'), 'token-data fetch must remain');
assert.ok(home.includes('/api/market-data'), 'market-data fetch must remain');

console.log('home unified table: 17 requirements passed');
