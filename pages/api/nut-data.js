// API Route: /api/nut-data
// Fetches deep NUT ecosystem data: state distribution, pool balances, bonding curve locks
// Redis cache (5 min TTL) + stale fallback — never show null if we ever had data

import { fetchNutData } from '../../utils/nutDataSources';
import { getJSON, setJSON } from '../../src/utils/cache.js';

const CACHE_KEY = 'nut-data:v1';
const CACHE_TTL_SECONDS = 300; // 5 minutes

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

    // 2) No fresh cache — fetch live on-chain data
    const nutData = await fetchNutData();
    const responseData = { nut: nutData };

    // 3) Store in Redis cache (best-effort)
    try {
      await setJSON(CACHE_KEY, responseData, CACHE_TTL_SECONDS);
    } catch (cacheErr) {
      console.warn('[api/nut-data] Cache write failed:', cacheErr?.message);
    }

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ source: 'live', ...responseData });
  } catch (err) {
    console.error('[api/nut-data] Error:', err);
    // Try stale cache as last resort
    const stale = await getJSON(CACHE_KEY).catch(() => null);
    if (stale) {
      res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
      return res.status(200).json({ source: 'stale-cache', ...stale });
    }
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
    return res.status(200).json({ nut: null, error: 'fetch_failed' });
  }
}
