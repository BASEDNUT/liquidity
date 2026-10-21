// Presentation labels for Field Guide cards (adapted from Boss's Repair 02).
export const SPECIMEN_LABELS = Object.freeze({
  concentrated: 'BRANCH', pair: 'BRANCH', index: 'WHORL', bonding: 'SCION', collectible: 'COLLECTIBLE', graft: 'GRAFT'
});
export const STRUCTURE_LABELS = Object.freeze({
  concentrated: '2-token pair', pair: '2-token pair', index: '4-asset index', bonding: 'Bonding curve', collectible: 'NFT collection', graft: 'wNUT-rooted trio'
});
export const ART_LABELS = Object.freeze({
  concentrated: 'CONCENTRATED · V3', pair: 'VOLATILE · AMM', index: 'FOUR-ASSET INDEX',
  bonding: 'BONDING CURVE', collectible: 'COLLECTIBLE · BONDING', graft: 'TWIN GRAFT · 20/40/40'
});
export const STATUS_TONES = Object.freeze({
  Concentrated: 'focus', Volatile: 'volatile', Bonding: 'bonding', Stable: 'stable', Experimental: 'experimental', Grafted: 'grafted'
});
export function formatTVL(tvl, liveTvl) {
  // Live TVL (from /api/market-data) wins; catalog tvl is the static fallback.
  const v = (typeof liveTvl === 'number' && Number.isFinite(liveTvl)) ? liveTvl : tvl;
  return typeof v === 'number' && Number.isFinite(v)
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
    : '—';
}
