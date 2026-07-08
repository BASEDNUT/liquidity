// API Route: /api/token-data
// Fetches per-token market data from multiple sources (GeckoTerminal, DexScreener, Base RPC, Balancer)
// Redis cache (5 min TTL) + per-source stale fallback — never show null if we ever had data

import { fetchTokenData, TOKEN_ADDRESSES } from '../../utils/tokenDataSources';
import { getJSON, setJSON } from '../../src/utils/cache.js';

const CACHE_KEY = 'token-data:v2';
const CACHE_TTL_SECONDS = 300; // 5 minutes

// Merge fresh data with stale cache per-source per-token
// If a fresh source is null but stale has data, use stale with stale:true flag
function mergeWithStale(freshData, staleData) {
  if (!staleData || !staleData.tokens) return freshData;
  const mergedTokens = {};
  for (const symbol of Object.keys(freshData.tokens || {})) {
    const freshToken = freshData.tokens[symbol] || {};
    const staleToken = staleData.tokens[symbol] || {};
    const mergedToken = {};
    // Merge each source independently
    for (const src of ['geckoTerminal', 'dexScreener', 'rpc', 'balancer', 'mintClub']) {
      if (freshToken[src] != null) {
        mergedToken[src] = freshToken[src];
      } else if (staleToken[src] != null) {
        // Serve stale data with stale flag
        mergedToken[src] = { ...staleToken[src], stale: true };
      } else {
        mergedToken[src] = null;
      }
    }
    mergedTokens[symbol] = mergedToken;
  }
  return { tokens: mergedTokens };
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

    // 2) No fresh cache — fetch all token data
    const tokenData = await fetchTokenData(TOKEN_ADDRESSES);
    let responseData = { tokens: tokenData };

    // 3) Per-source stale merge — if any source returned null, try filling from stale cache
    const staleCache = await getJSON(CACHE_KEY).catch(() => null);
    if (staleCache) {
      responseData = mergeWithStale(responseData, staleCache);
    }

    // 4) Store in Redis cache (best-effort)
    try {
      await setJSON(CACHE_KEY, responseData, CACHE_TTL_SECONDS);
    } catch (cacheErr) {
      console.warn('[api/token-data] Cache write failed:', cacheErr?.message);
    }

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ source: 'aggregated', ...responseData });
  } catch (err) {
    console.error('[api/token-data] Error:', err);
    // Try stale cache as last resort
    const stale = await getJSON(CACHE_KEY).catch(() => null);
    if (stale) {
      res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
      return res.status(200).json({ source: 'stale-cache', ...stale });
    }
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
    return res.status(200).json({ tokens: {}, error: 'fetch_failed' });
  }
}
