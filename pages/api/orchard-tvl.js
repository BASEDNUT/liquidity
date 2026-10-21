// API route: aggregates TVL from GeckoTerminal/DexScreener data sources
// Replaces dead n8n webhook — uses same fetchers as /api/market-data
// Keeps Upstash Redis caching (via src/utils/cache.js) with in-memory fallback

import { getAllData, POOL_CONFIG } from '../../utils/dataLayer.js';
import { getJSON, setJSON } from '../../src/utils/cache.js';

const CACHE_KEY = 'orchard:tvl:v2';
const CACHE_TTL_SECONDS = 300; // 300 seconds (5 minutes)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1) Try cache first
    const cached = await getJSON(CACHE_KEY);
    const now = Date.now();
    if (cached) {
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
      return res.status(200).json({ source: 'cache', ...cached });
    }

    // 2) No cache -> fetch from all data sources in parallel
    const result = await aggregateOrchardTVL();
    const record = { ...result, checkedAt: now };

    // Store in cache (best-effort)
    try {
      await setJSON(CACHE_KEY, record, CACHE_TTL_SECONDS);
    } catch (cacheErr) {
      console.warn('[api/orchard-tvl] Cache write failed:', cacheErr?.message);
    }

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ source: 'aggregated', ...record });
  } catch (err) {
    console.error('[api/orchard-tvl] Error:', err);
    // Try stale cache as fallback
    const stale = await getJSON(CACHE_KEY);
    if (stale) {
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
      return res.status(200).json({ source: 'stale-cache', ...stale });
    }
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600');
    return res.status(200).json({
      error: 'Upstream TVL unavailable',
      note: String(err?.message || err),
      tvl: 0,
      assetCount: 0,
      poolCount: 0,
      volume24h: 0,
      avgPriceChange: 0,
      lastUpdated: new Date().toISOString(),
    });
  }
}

/**
 * Aggregates TVL from GeckoTerminal / DexScreener / BaseRPC pool data.
 * Returns the same response shape as the old n8n webhook:
 *   { tvl, assetCount, poolCount, volume24h, avgPriceChange, lastUpdated }
 * Plus compatibility aliases (consumed by /api/orchard-board):
 *   { assets, pools, volume24hTotal, priceChange24hAvg, checkedAt }
 */
export async function aggregateOrchardTVL() {
  // Fetch all data from the unified data layer (throttled, cached, stale-while-revalidate)
  const data = await getAllData();
  const geckoResult = data.geckoTerminal;
  const dexResult = data.dexScreener;
  const mintClubResult = data.mintClub;

  // Count ALL tracked pools from POOL_CONFIG (not just those with DEX data)
  const allPoolIds = POOL_CONFIG.map(p => p.id);
  const poolCount = allPoolIds.length;

  // Collect unique NUT ECOSYSTEM assets from pool labels
  // Exclude liquidity pair tokens: wETH, USDC, AERO, cbBTC, cbETH (not ecosystem tokens)
  const PAIR_TOKENS = new Set(['WETH', 'USDC', 'AERO', 'CBBTC', 'CBETH', 'CBBC', 'ETH']);
  const assetSet = new Set();
  for (const pool of POOL_CONFIG) {
    if (pool.label) {
      const parts = pool.label.split('/');
      for (const part of parts) {
        const clean = part.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        if (clean && !PAIR_TOKENS.has(clean)) assetSet.add(clean);
      }
    } else {
      // For DEX pools without labels, parse from ID
      const parts = pool.id.split('-');
      for (const part of parts) {
        if (part && !['uniswap', 'v2', 'v3', 'aerodrome', 'balancer', 'dex', 'mintclub', 'sudoswap'].includes(part)) {
          const upper = part.toUpperCase();
          if (!PAIR_TOKENS.has(upper)) assetSet.add(upper);
        }
      }
    }
  }

  let tvl = 0;
  let volume24h = 0;
  const priceChanges = [];

  // Sum TVL/volume from all pools that have data
  for (const poolId of allPoolIds) {
    const gecko = geckoResult?.[poolId];
    const dex = dexResult?.[poolId];
    const mc = mintClubResult?.[poolId];

    // Extract TVL — prefer GeckoTerminal, then DexScreener, then MintClub
    const poolTvl = Number(gecko?.tvl ?? dex?.tvl ?? mc?.tvl ?? 0);
    if (Number.isFinite(poolTvl)) tvl += poolTvl;

    // Extract volume 24h — prefer GeckoTerminal, then DexScreener, then MintClub
    const poolVol = Number(gecko?.volume24h ?? dex?.volume24h ?? mc?.volume24h ?? 0);
    if (Number.isFinite(poolVol)) volume24h += poolVol;

    // Extract price change 24h — GeckoTerminal or MintClub
    const priceChange = Number(gecko?.priceChange24h ?? mc?.priceChange24h ?? 0);
    if (Number.isFinite(priceChange)) priceChanges.push(priceChange);
  }

  const avgPriceChange = priceChanges.length
    ? priceChanges.reduce((a, b) => a + b, 0) / priceChanges.length
    : 0;

  const lastUpdated = new Date().toISOString();

  return {
    // Primary shape
    tvl,
    assetCount: assetSet.size,
    poolCount,
    volume24h,
    avgPriceChange,
    lastUpdated,
    // Compatibility aliases (consumed by /api/orchard-board)
    assets: assetSet.size,
    pools: poolCount,
    volume24hTotal: volume24h,
    priceChange24hAvg: avgPriceChange,
  };
}
