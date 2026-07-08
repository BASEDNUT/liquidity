// API route: Per-pool TVL breakdown with full source attribution
// Returns ledger-style data for the /tvl transparency page

import { getAllData, POOL_CONFIG } from '../../utils/dataLayer.js';
import { getJSON, setJSON } from '../../src/utils/cache.js';

const CACHE_KEY = 'tvl:breakdown:v1';
const CACHE_TTL_SECONDS = 300; // 5 minutes

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const cached = await getJSON(CACHE_KEY);
 if (cached) {
   return res.status(200).json({ source: 'cache', ...cached });
 }

    const result = await buildTvlBreakdown();
    const record = { ...result, generatedAt: new Date().toISOString() };

    try { await setJSON(CACHE_KEY, record, CACHE_TTL_SECONDS); } catch (e) { /* best-effort */ }

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ source: 'live', ...record });
  } catch (err) {
    console.error('[api/tvl-breakdown] Error:', err);
    const stale = await getJSON(CACHE_KEY);
    if (stale) return res.status(200).json({ source: 'stale-cache', ...stale });
    return res.status(502).json({ error: 'Breakdown unavailable', detail: String(err?.message || err) });
  }
}

async function buildTvlBreakdown() {
  // Fetch all data from the unified data layer (throttled, cached, stale-while-revalidate)
  const data = await getAllData();
  const geckoResult = data.geckoTerminal;
  const dexResult = data.dexScreener;
  const mintClubResult = data.mintClub;

  const pools = [];
  let totalTvl = 0;
  let totalVolume24h = 0;
  const priceChanges = [];

  for (const pool of POOL_CONFIG) {
   const gecko = geckoResult?.[pool.id];
   const dex = dexResult?.[pool.id];
   const mc = mintClubResult?.[pool.id];

   // Determine which source provided TVL
   let tvlSource = null;
   let tvl = null;
   let tvlFormula = '';
   let volume24h = null;
   let volSource = null;
   let priceChange24h = null;
   let pcSource = null;
   let extraData = {};

   // TVL: prefer GeckoTerminal → DexScreener → MintClub
   if (gecko?.tvl != null && Number.isFinite(gecko.tvl) && gecko.tvl > 0) {
     tvl = Number(gecko.tvl);
    tvlSource = 'GeckoTerminal';
    tvlFormula = 'reserve_in_usd (both sides of LP)';
  } else if (dex?.tvl != null && Number.isFinite(dex.tvl) && dex.tvl > 0) {
    tvl = Number(dex.tvl);
    tvlSource = 'DexScreener';
    tvlFormula = 'liquidity.usd (both sides of LP)';
  } else if (mc?.tvl != null && Number.isFinite(mc.tvl) && mc.tvl > 0) {
    tvl = Number(mc.tvl);
    tvlSource = 'MintClub (on-chain RPC)';
    tvlFormula = `priceUsd (${mc.priceInNUT?.toFixed(6)} NUT × $${mc.nutUsdPrice?.toFixed(6)}) × currentSupply (${mc.currentSupply?.toFixed(2)})`;
    extraData = {
      priceInNUT: mc.priceInNUT,
      nutUsdPrice: mc.nutUsdPrice,
      currentSupply: mc.currentSupply,
      maxSupply: mc.maxSupply,
      reserveBalanceNUT: mc.reserveBalanceNUT,
    };
  }

  // Volume: GeckoTerminal → DexScreener
  if (gecko?.volume24h != null && Number.isFinite(gecko.volume24h)) {
    volume24h = Number(gecko.volume24h);
    volSource = 'GeckoTerminal';
  } else if (dex?.volume24h != null && Number.isFinite(dex.volume24h)) {
    volume24h = Number(dex.volume24h);
    volSource = 'DexScreener';
  }

  // Price change: GeckoTerminal → MintClub
  if (gecko?.priceChange24h != null && Number.isFinite(gecko.priceChange24h)) {
    priceChange24h = Number(gecko.priceChange24h);
    pcSource = 'GeckoTerminal';
  } else if (mc?.priceChange24h != null && Number.isFinite(mc.priceChange24h)) {
    priceChange24h = Number(mc.priceChange24h);
    pcSource = 'MintClub';
  }

  if (tvl != null && Number.isFinite(tvl)) totalTvl += tvl;
  if (volume24h != null && Number.isFinite(volume24h)) totalVolume24h += volume24h;
  if (priceChange24h != null && Number.isFinite(priceChange24h)) priceChanges.push(priceChange24h);

  // Determine platform from pool type/id
  let platform = 'Unknown';
  if (pool.type === 'dex') {
    if (pool.id.includes('uniswap-v3')) platform = 'Uniswap V3';
    else if (pool.id.includes('uniswap-v2')) platform = 'Uniswap V2';
    else if (pool.id.includes('aerodrome')) platform = 'Aerodrome';
    else if (pool.id.includes('balancer')) platform = 'Balancer';
    else platform = 'DEX';
  } else if (pool.type === 'mintclub') platform = 'MintClub (Bonding Curve)';
  else if (pool.type === 'mintclub_nft') platform = 'MintClub NFT (Bonding Curve)';
  else if (pool.type === 'sudoswap') platform = 'Sudoswap (NFT AMM)';

  // Label from pool config or derive from id
  const label = pool.label || pool.id.split('-').filter(p => !['uniswap','v2','v3','aerodrome','balancer','dex','mintclub','sudoswap'].includes(p)).join('/').toUpperCase();

  pools.push({
    id: pool.id,
    label,
    platform,
    type: pool.type,
    address: pool.pairAddress || pool.tokenAddress || null,
    tvl,
    tvlSource,
    tvlFormula,
    volume24h,
    volSource,
    priceChange24h,
    pcSource,
    hasData: tvl != null,
    ...extraData,
  });
  }

  const avgPriceChange = priceChanges.length
    ? priceChanges.reduce((a, b) => a + b, 0) / priceChanges.length
    : 0;

  // Count data coverage
  const poolsWithData = pools.filter(p => p.hasData).length;
  const poolsWithoutData = pools.length - poolsWithData;

  // Source breakdown
  const sourceBreakdown = {};
  for (const p of pools) {
    if (p.tvlSource) {
      if (!sourceBreakdown[p.tvlSource]) sourceBreakdown[p.tvlSource] = { count: 0, tvl: 0 };
      sourceBreakdown[p.tvlSource].count++;
      sourceBreakdown[p.tvlSource].tvl += p.tvl || 0;
    }
  }

  return {
    summary: {
      totalTvl,
      totalVolume24h,
      avgPriceChange,
      poolCount: pools.length,
      poolsWithData,
      poolsWithoutData,
      sourcesUsed: Object.keys(sourceBreakdown),
      generatedAt: new Date().toISOString(),
    },
    sourceBreakdown,
    pools,
    methodology: {
      dexTvl: 'reserve_in_usd from GeckoTerminal API — total USD value of both token sides in the liquidity pool',
      dexTvlFallback: 'liquidity.usd from DexScreener API — same concept, used when GeckoTerminal fails',
      mintClubTvl: 'priceUsd × currentSupply — on-chain RPC reads from MCV2_Bond contract. priceUsd = priceForNextMint (in NUT) × NUT/USD market price. currentSupply = totalSupply() of the token contract, divided by 1e18.',
      sudoswapTvl: 'No TVL data available — Sudoswap NFT AMM pools do not expose TVL via standard APIs',
      volume: '24h volume from GeckoTerminal or DexScreener where available. MintClub bonding curve tokens do not have 24h volume data.',
      priceChange: '24h price change percentage from GeckoTerminal or MintClub where available',
      cache: '5-minute server-side cache (Upstash Redis or in-memory fallback). Data fetched on-demand from upstream APIs.',
      aggregation: 'Total TVL = sum of all per-pool TVL values. Pools without data are excluded from the sum (not counted as zero).',
    },
  };
}
