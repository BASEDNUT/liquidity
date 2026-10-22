import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

// S126e: Tokens view gets Field Guide specimen cards (Boss grammar, replace not augment).
test('token specimen card exists in Boss Repair02 grammar', () => {
  const c = read('../components/pools/TokenSpecimenCard.jsx');
  // uses Boss's glyph primitives, not emoji/MUI
  assert.ok(c.includes("from './artwork/SpecimenGlyphs'"), 'must compose from Boss SpecimenGlyphs');
  assert.ok(c.includes('TokenMedal'), 'TokenMedal glyph missing');
  assert.ok(c.includes('NameRibbon'), 'NameRibbon glyph missing');
  assert.ok(c.includes("from './Repair02.module.css'"), 'must use Repair02 CSS family');
  assert.ok(!c.includes("from '@mui/material'"), 'MUI forbidden in specimen grammar');
  // kicker + serial like pool cards
  assert.ok(c.includes('ORCHARD SPECIMEN'), 'kicker missing');
  assert.ok(c.includes('No. '), 'serial missing');
  // botanical taxonomy
  for (const t of ['ROOT', 'BRANCH', 'SCION', 'COLLECTIBLE', 'GRAFT', 'SOIL']) {
    assert.ok(c.includes(`'${t}'`), `specimen type ${t} missing`);
  }
  // facts row: Class/Standard/Price/Market
  for (const f of ['Class', 'Standard', 'Price', 'Market']) {
    assert.ok(c.includes(`<small>${f}</small>`), `fact ${f} missing`);
  }
  // actions: internal profile link + external trade/contract
  assert.ok(c.includes('`/token/${token.id}`'), 'internal profile link missing');
  assert.ok(c.includes('basescan.org/token/'), 'explorer link missing');
  // price source order mirrors ledger doctrine GT > DS > CG > BAL
  const gt = c.indexOf('geckoTerminal?.price_usd');
  const ds = c.indexOf('dexScreener?.priceUsd');
  const cg = c.indexOf('coinGecko?.price_usd');
  const bal = c.indexOf('balancer?.bptPrice');
  assert.ok(gt >= 0 && ds > gt && cg > ds && bal > cg, 'price source order must be GT>DS>CG>BAL');
  // market-data fallbacks preserved from old card doctrine
  assert.ok(c.includes('Index (Balancer)'), 'index fallback missing');
  assert.ok(c.includes('Bonding (MintClub)'), 'bonding fallback missing');
  assert.ok(c.includes('NFT (Mint Club)'), 'NFT fallback missing');
  assert.ok(c.includes('External asset'), 'external fallback missing');
  // whimsy: float + sway via CSS classes
  assert.ok(c.includes("r02-card"), 'r02-card class missing');
  assert.ok(c.includes("r02-art"), 'r02-art class missing');
  assert.ok(c.includes('animationDelay'), 'stagger/float delay missing');
});

test('index.js wires token specimen cards into the fgGrid theme', () => {
  const idx = read('../pages/index.js');
  assert.ok(idx.includes('TokenSpecimenCard'), 'FGTokenCard import missing');
  // tokens view uses the same fgGrid+theme grid as pools view
  const fgIdx = idx.indexOf('FGTokenCard key=');
  assert.ok(fgIdx > 0, 'FGTokenCard render missing');
  const before = idx.slice(Math.max(0, fgIdx - 400), fgIdx);
  assert.ok(before.includes('fgGrid') && before.includes('theme'), 'tokens view must render in fgGrid theme wrapper');
  assert.ok(!idx.includes('components/TokenCard"'), 'old TokenCard import must be gone');
  assert.ok(!idx.includes('<TokenCard'), 'old TokenCard render must be gone');
});

test('old MUI TokenCard replaced (replace, not augment)', () => {
  assert.ok(!existsSync('../components/TokenCard.js'), 'old TokenCard.js must be deleted');
  // TokensTable comment must not reference the deleted file
  const tt = read('../components/TokensTable.js');
  assert.ok(!tt.includes('TokenCard.js'), 'TokensTable must not reference deleted TokenCard.js');
});

test('test chained into npm test', () => {
  const pkg = JSON.parse(read('../package.json'));
  assert.ok(pkg.scripts.test.includes('orchard-token-specimen-cards.test.mjs'), 'test not in npm chain');
});
