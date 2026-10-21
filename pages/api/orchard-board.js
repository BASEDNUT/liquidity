// API route: /api/orchard-board
// Aggregates orchard TVL metrics (reuse orchard-tvl aggregation) + live NSI
// from the container IRIS MCP server (/mcp/nsi). Serves the OrchardBoardBanner.
// Cache: 60s via Upstash/in-memory (src/utils/cache.js).

import { aggregateOrchardTVL } from './orchard-tvl.js';
import { nsiScoreToStateKey } from '../../src/utils/nsiBands.js';
import { getJSON, setJSON } from '../../src/utils/cache.js';

const CACHE_KEY = 'orchard:board:v1';
const CACHE_TTL_SECONDS = 60;
const IRIS_BASE = process.env.IRIS_BASE_URL || 'http://localhost:9000';
const IRIS_KEY = process.env.IRIS_API_KEY || 'nut-analysis-key';

async function fetchNsiFromIris() {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(IRIS_BASE + '/mcp/nsi', {
      headers: { 'X-API-Key': IRIS_KEY },
      signal: ctrl.signal,
    });
    if (!res.ok) return { nsi: null, error: 'IRIS HTTP ' + res.status };
    const body = await res.json();
    return { nsi: body && body.nsi ? body.nsi : null, error: null };
  } catch (e) {
    return { nsi: null, error: String(e && e.message ? e.message : e) };
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const cached = await getJSON(CACHE_KEY);
  if (cached) {
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json({ source: 'cache', ...cached });
  }

  try {
    const [tvlData, nsiData] = await Promise.all([
      aggregateOrchardTVL(),
      fetchNsiFromIris(),
    ]);

    const nsi = nsiData.nsi;
    const record = {
      tvl: tvlData.tvl,
      assets: tvlData.assets,
      pools: tvlData.pools,
      volume24hTotal: tvlData.volume24hTotal,
      priceChange24hAvg: tvlData.priceChange24hAvg,
      nsi,
      boardState: nsiScoreToStateKey(nsi ? nsi.score : null),
      nsiError: nsiData.error,
      checkedAt: Date.now(),
    };

    try {
      await setJSON(CACHE_KEY, record, CACHE_TTL_SECONDS);
    } catch (cacheErr) {
      console.warn('[api/orchard-board] Cache write failed:', cacheErr && cacheErr.message);
    }

    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return res.status(200).json({ source: 'aggregated', ...record });
  } catch (err) {
    console.error('[api/orchard-board] Error:', err);
    const stale = await getJSON(CACHE_KEY);
    if (stale) {
      return res.status(200).json({ source: 'stale-cache', ...stale });
    }
    return res.status(200).json({
      error: 'Upstream unavailable',
      tvl: 0,
      assets: 0,
      pools: 0,
      volume24hTotal: 0,
      priceChange24hAvg: 0,
      nsi: null,
      boardState: null,
      checkedAt: Date.now(),
    });
  }
}
