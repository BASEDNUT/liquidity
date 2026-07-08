// API Route: /api/market-data
// Runs all data source fetchers and returns merged multi-source market data
// Redis cache (5 min TTL) + per-source stale fallback — never show null if we ever had data

import { getAllData, POOL_CONFIG } from '../../utils/dataLayer.js';
import { getJSON, setJSON } from '../../src/utils/cache.js';

const CACHE_KEY = 'market-data:v2';
const CACHE_TTL_SECONDS = 300; // 5 minutes

// Merge fresh data with stale cache per-source per-pool
// If a fresh source is null but stale has data, use stale with stale:true flag
function mergeWithStale(freshData, staleData) {
  if (!staleData || !staleData.pools) return freshData;
  const mergedPools = {};
  for (const poolId of Object.keys(freshData.pools || {})) {
    const freshPool = freshData.pools[poolId] || {};
    const stalePool = staleData.pools[poolId] || {};
    const mergedPool = {};
    // Merge each source independently
    for (const src of ['geckoTerminal', 'dexScreener', 'rpc', 'mintClub']) {
      if (freshPool[src] != null) {
        mergedPool[src] = freshPool[src];
      } else if (stalePool[src] != null) {
        // Serve stale data with stale flag
        mergedPool[src] = { ...stalePool[src], stale: true };
      } else {
        mergedPool[src] = null;
      }
    }
    mergedPools[poolId] = mergedPool;
  }
  return {
    pools: mergedPools,
    reference: freshData.reference || staleData.reference || {},
    sourceErrors: freshData.sourceErrors || [],
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1) Try Redis cache first (fresh)
    const cached = await getJSON(CACHE_KEY);
    if (cached) {
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      return res.status(200).json({ source: 'cache', ...cached });
    }

    // 2) No fresh cache — fetch from the unified data layer
    const data = await getAllData();
    const geckoResult = data.geckoTerminal;
    const dexResult = data.dexScreener;
    const rpcResult = data.baseRPC;
    const mintClubResult = data.mintClub;
    const coingeckoResult = data.coinGeckoReference;

    // Build per-pool merged structure
    const poolIds = new Set(POOL_CONFIG.map(p => p.id));
    const pools = {};
    for (const poolId of poolIds) {
      pools[poolId] = {
        geckoTerminal: geckoResult?.[poolId] ?? null,
        dexScreener: dexResult?.[poolId] ?? null,
        rpc: rpcResult?.[poolId] ?? null,
        mintClub: mintClubResult?.[poolId] ?? null,
      };
    }

    let responseData = {
      pools,
      reference: coingeckoResult || {},
      sourceErrors: [],
    };

    // 3) Per-source stale merge — if any source returned null, try filling from stale cache
    const staleCache = await getJSON(CACHE_KEY).catch(() => null);
    if (staleCache) {
      responseData = mergeWithStale(responseData, staleCache);
    }

    // 4) Store in Redis cache (best-effort)
    try {
      await setJSON(CACHE_KEY, responseData, CACHE_TTL_SECONDS);
    } catch (cacheErr) {
      console.warn('[api/market-data] Cache write failed:', cacheErr?.message);
    }

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ source: 'aggregated', ...responseData });
  } catch (err) {
    console.error('[api/market-data] Error:', err);
    // Try stale cache as last resort
    const stale = await getJSON(CACHE_KEY).catch(() => null);
    if (stale) {
      res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
      return res.status(200).json({ source: 'stale-cache', ...stale });
    }
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
    return res.status(200).json({ pools: {}, reference: {}, sourceErrors: [], error: 'fetch_failed' });
  }
}
