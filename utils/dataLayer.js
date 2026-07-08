// Unified Data Layer for BASED NUT Liquidity Portal
// Single source of truth — ALL API endpoints call getAllData() instead of fetchers directly.
// Provides throttled, cached, stale-while-revalidate access to all market data sources.

import {
  fetchGeckoTerminal,
  fetchDexScreener,
  fetchMintClub,
  fetchBaseRPC,
  fetchCoinGeckoReference,
  POOL_CONFIG,
} from './marketDataSources.js';

// Global in-memory store — shared across ALL API endpoints in the same Node.js process
let _store = {
  geckoTerminal: {},      // keyed by pool.id
  dexScreener: {},        // keyed by pool.id
  mintClub: {},           // keyed by pool.id
  baseRPC: {},            // keyed by pool.id
  coinGeckoReference: null, // { ethereum, bitcoin, 'usd-coin', 'aerodrome-finance' }
  nutUsd: null,           // NUT price in USD
  lastRefresh: 0,         // timestamp of last successful full refresh
  refreshing: false,      // mutex to prevent concurrent refreshes
};

const REFRESH_INTERVAL = 5 * 60 * 1000;   // 5 minutes — data is "fresh" within this window
const STALE_INTERVAL = 15 * 60 * 1000;    // 15 minutes — serve stale data up to this point

/**
 * Main consumer function. All API endpoints call this instead of fetchers directly.
 *
 * - If lastRefresh is recent (< 5 min), return cached data immediately (source: 'cache')
 * - If stale (> 5 min but < 15 min), return cached data + trigger background refresh (source: 'stale')
 * - If very stale (> 15 min) or never fetched, do a blocking refresh (source: 'live')
 * - If a refresh is already in progress, return current cache (source: 'cache' or 'stale')
 *
 * @returns {Promise<{geckoTerminal, dexScreener, mintClub, baseRPC, coinGeckoReference, nutUsd, lastRefresh, source}>}
 */
export async function getAllData() {
  const now = Date.now();
  const age = now - _store.lastRefresh;

  // If a refresh is already in progress, return current cache immediately
  if (_store.refreshing) {
    const source = _store.lastRefresh > 0 ? 'stale' : 'cache';
    return _buildResponse(source);
  }

  // Fresh cache — return immediately
  if (age < REFRESH_INTERVAL) {
    return _buildResponse('cache');
  }

  // Stale but acceptable — return cached data + trigger background refresh (don't await)
  if (age < STALE_INTERVAL) {
    refreshAllData().catch((err) => {
      console.error('[dataLayer] Background refresh failed:', err?.message || err);
    });
    return _buildResponse('stale');
  }

  // Very stale or never fetched — do a blocking refresh
  await refreshAllData();
  return _buildResponse('live');
}

/**
 * Convenience function for single-pool lookups.
 * @param {string} poolId — pool ID from POOL_CONFIG
 * @returns {Promise<{geckoTerminal, dexScreener, mintClub, baseRPC, source, lastRefresh}>}
 */
export async function getDataByPool(poolId) {
  const data = await getAllData();
  return {
    geckoTerminal: data.geckoTerminal?.[poolId] ?? null,
    dexScreener: data.dexScreener?.[poolId] ?? null,
    mintClub: data.mintClub?.[poolId] ?? null,
    baseRPC: data.baseRPC?.[poolId] ?? null,
    source: data.source,
    lastRefresh: data.lastRefresh,
  };
}

/**
 * Internal function that fetches all sources with throttling.
 * Uses a mutex (_store.refreshing) to prevent concurrent refreshes.
 * Updates _store atomically after all fetches complete.
 */
export async function refreshAllData() {
  // Mutex check — if already refreshing, return immediately
  if (_store.refreshing) return;
  _store.refreshing = true;

  try {
    // Run GeckoTerminal and DexScreener SEQUENTIALLY (not simultaneously)
    // to stay under combined rate limits. Each has internal throttling:
    //   GeckoTerminal: 500ms delay (2 req/sec)
    //   DexScreener:   333ms delay (3 req/sec)
    const geckoTerminal = await fetchGeckoTerminal().catch(() => ({}));
    const dexScreener = await fetchDexScreener().catch(() => ({}));

    // MintClub and BaseRPC can run in parallel — they use different endpoints
    // and each has internal staggering (200ms and 300ms respectively)
    const [mintClub, baseRPC] = await Promise.all([
      fetchMintClub().catch(() => ({})),
      fetchBaseRPC().catch(() => ({})),
    ]);

    // Fetch CoinGecko reference prices (lightweight, single request)
    const coinGeckoReference = await fetchCoinGeckoReference().catch(() => null);

    // Extract nutUsd from mintClub data (stored in each pool's nutUsdPrice)
    let nutUsd = null;
    for (const poolId of Object.keys(mintClub)) {
      if (mintClub[poolId]?.nutUsdPrice != null) {
        nutUsd = mintClub[poolId].nutUsdPrice;
        break;
      }
    }

    // Update store atomically
    _store = {
      geckoTerminal,
      dexScreener,
      mintClub,
      baseRPC,
      coinGeckoReference,
      nutUsd,
      lastRefresh: Date.now(),
      refreshing: false,
    };
  } catch (err) {
    console.error('[dataLayer] refreshAllData error:', err?.message || err);
    _store.refreshing = false;
  }
}

/**
 * Build the response object from the current store state.
 * @param {'cache'|'live'|'stale'} source
 * @returns {object}
 */
function _buildResponse(source) {
  return {
    geckoTerminal: _store.geckoTerminal,
    dexScreener: _store.dexScreener,
    mintClub: _store.mintClub,
    baseRPC: _store.baseRPC,
    coinGeckoReference: _store.coinGeckoReference,
    nutUsd: _store.nutUsd,
    lastRefresh: _store.lastRefresh,
    source,
  };
}

export { POOL_CONFIG };
