// API Route: /api/mintclub-data
// Lightweight endpoint that reads MintClub bonding curve data from the unified data layer.
// Used for client-side fetching on token pages to render Bonding Curve section.

import { getAllData, POOL_CONFIG } from '../../utils/dataLayer.js';
import { getJSON, setJSON } from '../../src/utils/cache.js';

const CACHE_KEY = 'mintclub-data:v1';
const CACHE_TTL_SECONDS = 120; // 2 minutes — on-chain data changes slowly

// Map MintClub token symbols to their pool IDs in POOL_CONFIG
const SYMBOL_TO_POOL_ID = {
  NUTINO: 'nutino-nut-mintclub',
  SALT: 'nut-salt-mintclub',
  PNUTS: 'pnuts-nut-mintclub',
  ALMD: 'almd-nut-mintclub',
  SALMD: 'salmd-nut-mintclub',
  PNUTRMY: 'pnutrmy-nut-mintclub',
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1) Try cache first
    const cached = await getJSON(CACHE_KEY);
    if (cached) {
      res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
      return res.status(200).json({ source: 'cache', ...cached });
    }

    // 2) Fetch from the unified data layer
    const data = await getAllData();
    const mintClubData = data.mintClub;

    // Build tokens object keyed by symbol, mapping from pool-id-keyed data
    const tokens = {};
    for (const [symbol, poolId] of Object.entries(SYMBOL_TO_POOL_ID)) {
      const poolData = mintClubData?.[poolId];
      if (poolData) {
        // Map from marketDataSources shape to tokenDataSources shape (frontend compatibility)
        tokens[symbol] = {
          priceUsd: poolData.price,
          priceInNUT: poolData.priceInNUT,
          volume_h24: poolData.volume24h,
          marketCapUsd: poolData.marketCapUsd,
          currentSupply: poolData.currentSupply,
          maxSupply: poolData.maxSupply,
          reserveBalanceNUT: poolData.reserveBalanceNUT,
          mintRoyalty: poolData.mintRoyalty,
          burnRoyalty: poolData.burnRoyalty,
          nutUsdPrice: poolData.nutUsdPrice,
          lastCheckedAt: poolData.lastCheckedAt,
        };
      } else {
        tokens[symbol] = null;
      }
    }

    const responseData = { tokens };

    // 3) Store in cache (best-effort)
    await setJSON(CACHE_KEY, responseData, CACHE_TTL_SECONDS).catch(() => {});

    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    return res.status(200).json({ source: 'fresh', ...responseData });
  } catch (err) {
    console.error('[mintclub-data] Error:', err);
    // Try stale cache as fallback
    const stale = await getJSON(CACHE_KEY).catch(() => null);
    if (stale) {
      res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
      return res.status(200).json({ source: 'stale-cache', ...stale });
    }
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
    return res.status(200).json({ source: 'error', tokens: {}, error: 'fetch_failed' });
  }
}
