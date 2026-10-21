// Catalog adapter over the LIVE site pool records (utils/fetchPools.js, 28 pools).
// Boundary between data and presentation: same view-model contract as Boss's
// Field Guide Repair 02 catalog, extended for the live ecosystem:
// - Grafted status -> graft kind (Sunflower Grove 3-asset trios)
// - 'Grafted' + Experimental statuses accepted
// - tvl stays null in static records; live TVL merges at render time via marketData
import { fetchPools } from '../../utils/fetchPools.js';

export const INDEX_CONTENTS = Object.freeze({ pNUT: ['NUT', 'sNUT', 'cbETH', 'cbBTC'] });
const STATUS = new Set(['Volatile', 'Stable', 'Concentrated', 'Bonding', 'Experimental', 'Grafted']);
const HTTPS = /^https:\/\//i;

// Graft names: 'gtINF wNUT/VVV/DIEM' -> kind graft, assets ['wNUT','VVV','DIEM']
function graftAssets(name) {
  const m = /^(gt[A-Z]+)\s+(.+)$/.exec(name);
  if (!m) return null;
  return m[2].split('/').map((s) => s.trim()).filter(Boolean);
}

export function normalizePool(raw) {
  if (!raw || !raw.name || !raw.platform || !STATUS.has(raw.status))
    throw new Error(`Invalid pool record: ${raw && raw.name ? raw.name : '(unnamed)'}`);
  const categories = Array.isArray(raw.category) ? [...raw.category] : [raw.category].filter(Boolean);
  const isCollectible = categories.includes('NFTs');
  const graft = graftAssets(raw.name);
  const kind = Object.hasOwn(INDEX_CONTENTS, raw.name) ? 'index'
    : isCollectible ? 'collectible'
    : raw.status === 'Bonding' ? 'bonding'
    : raw.status === 'Grafted' && graft ? 'graft'
    : raw.status === 'Concentrated' ? 'concentrated'
    : 'pair';
  const assets = kind === 'index' ? [...INDEX_CONTENTS[raw.name]]
    : kind === 'graft' ? graft
    : raw.name.split('/');
  if ((kind === 'index' && assets.length < 3) || (kind === 'graft' && assets.length !== 3)
      || (['pair', 'concentrated', 'bonding'].includes(kind) && assets.length !== 2)
      || (kind === 'collectible' && assets.length !== 2))
    throw new Error(`Invalid constituents for ${raw.name}`);
  for (const link of [raw.url, raw.checkPoolUrl, raw.dexscreenerUrl]) {
    if (typeof link !== 'string' || !HTTPS.test(link)) throw new Error(`Invalid link for ${raw.name}`);
  }
  const tvl = typeof raw.tvl === 'number' && Number.isFinite(raw.tvl) ? raw.tvl : null;
  return Object.freeze({
    id: `${raw.platform.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}:${raw.url.toLowerCase()}`,
    siteId: raw.id,
    name: raw.name, flavor: raw.flavor, platform: raw.platform, status: raw.status,
    categories: Object.freeze(categories), assets: Object.freeze(assets), kind, tvl,
    hrefs: Object.freeze({ pool: raw.checkPoolUrl, contract: raw.url, explore: raw.dexscreenerUrl })
  });
}

export function getPoolCatalog() {
  const records = fetchPools().map(normalizePool);
  if (new Set(records.map((r) => r.id)).size !== records.length) throw new Error('Duplicate pool identifiers');
  return records;
}
