// Multi-Source Market Data Fetchers for BASED NUT Liquidity Portal
// Each fetcher is independent — if one pool fails, return null for that pool (never throw)

// Pool configuration — ALL tracked pools in the Based Nut ecosystem
// Types: 'dex' (GeckoTerminal/DexScreener), 'mintclub' (bonding curve), 'sudoswap' (NFT LP)
const POOL_CONFIG = [
  // === Main Token DEX Pools (9) ===
  { id: 'nut-weth-uniswap-v3', pairAddress: '0xe3ce00e2ed742b142c15eedc208657dd22aa987e', type: 'dex' },
  { id: 'nut-weth-uniswap-v2', pairAddress: '0x997bad8e9f5c34d5e9784caaa8a554a5e6192f53', type: 'dex' },
  { id: 'snut-nut-aerodrome', pairAddress: '0x893faaa7baf7a8247fc7142afb28e13d51a5aae8', type: 'dex' },
  { id: 'pnut-balancer', pairAddress: '0x2a5757b60987ff10385de1d4d923792f6fdcfff1', type: 'dex' },
  { id: 'nut-aero-aerodrome', pairAddress: '0x38630fede5e2032652640d98b2d3f9c6296eea5d', type: 'dex' },
  { id: 'nut-cbbtc-aerodrome', pairAddress: '0x15385c9281bc12d2e9bf5c081621944b0ee2acca', type: 'dex' },
  { id: 'snut-weth-uniswap-v2', pairAddress: '0xb22895d2ee6e29395f30ec47c8d9fe0d55355ae1', type: 'dex', dexScreenerTokenAddress: '0xAC130701aa31c284c36809E2489f150F419AD7AD' },
  { id: 'nutino-cbbtc-uniswap-v2', pairAddress: '0xeafde67d470480d14139e3d91164c158b82b38e2', type: 'dex', dexScreenerTokenAddress: '0x30421e2d18dFF60B298eEF427cF868cA65f1476B' },
  { id: 'salt-usdc-aerodrome', pairAddress: '0x64ca0b147f625007b6f082abbb3ba217930eccb2', type: 'dex' },
  { id: 'pips-nut-aerodrome-slipstream-cl', pairAddress: '0x7f8e532cf1be9ed688adb9e6585bc69f017201b5', type: 'dex' },
  { id: 'pips-usdc-balancer-reclamm', pairAddress: '0xb19e3af68bb307369e8772a9e157431fcfe9dd44', type: 'dex' },
  // === Sunflower Grove Batch I — Balancer v3 Twin Grafts (5) ===
  // ids MUST equal slugify(name)-slugify(platform) from fetchPools.js (live-data merge contract)
  { id: 'gtinf-wnut-vvv-diem-balancer-v3', pairAddress: '0x6a0a1B7428d543524592eD22023A09BdE05aA466', type: 'dex' },
  { id: 'gtagt-wnut-virtual-mor-balancer-v3', pairAddress: '0x5dA95cC31C840Fd33180e4C7f879e3F3d8Eca200', type: 'dex' },
  { id: 'gteth-wnut-cbeth-wsteth-balancer-v3', pairAddress: '0xd156d51219B3a7A590670d655E8740Ad404e8835', type: 'dex' },
  { id: 'gtbtc-wnut-cbbtc-tbtc-balancer-v3', pairAddress: '0xb2a63935e1391Ee49E5cfB6cc4f184C285fE29b4', type: 'dex' },
  { id: 'gtfx-wnut-usdc-eurc-balancer-v3', pairAddress: '0x1cCB8c61b62b9c7a9d4e66C9c824C1539B8b1f2E', type: 'dex' },
  { id: 'gtsil-wnut-nvdac-aaplc-balancer-v3', pairAddress: '0xA669275f92e49aff80aBA7AaD86E5AFDDe3540B0', type: 'dex' },
  // === MintClub Bonding Curve Pools (2 main) ===
  { id: 'nutino-nut-mintclub', tokenAddress: '0x30421e2d18dFF60B298eEF427cF868cA65f1476B', type: 'mintclub', label: 'NUTINO/NUT' },
  { id: 'nut-salt-mintclub', tokenAddress: '0x1ede2afc985f6d7aeb3f4c84b95a103c00d5de81', type: 'mintclub', label: 'NUT/SALT' },
  // === MintClub NFT Pools (4) ===
  { id: 'pnuts-nut-mintclub', tokenAddress: '0x794fcD89357C1CcF04a1a9A441ad4dB2Cd5EE387', type: 'mintclub_nft', label: 'PNUTS/NUT' },
  { id: 'almd-nut-mintclub', tokenAddress: '0x1A160456005AED47994E1c13C9bc31F274413927', type: 'mintclub_nft', label: 'ALMD/NUT' },
  { id: 'salmd-nut-mintclub', tokenAddress: '0x1E0f80529593185C021043ffcbfDcB8f4279C649', type: 'mintclub_nft', label: 'SALMD/NUT' },
  { id: 'pnutrmy-nut-mintclub', tokenAddress: '0xF075300b8C2EF500d8Ce4f783F910C500B9A3512', type: 'mintclub_nft', label: 'PNUTRMY/NUT' },
  // === Sudoswap NFT Pools (3) ===
  { id: 'pnuts-usdc-sudoswap', tokenAddress: '0x262bEaa785a0eF65f5D9C1b8BA5c41980D087ff3', type: 'sudoswap', label: 'PNUTS/USDC' },
  { id: 'salmd-cbeth-sudoswap', tokenAddress: '0xeE7243F0E02e5890c6415B5CbAe58e0D0fb758a5', type: 'sudoswap', label: 'SALMD/cbETH' },
  { id: 'almd-cbeth-sudoswap', tokenAddress: '0x308C9BC0546723d6e4905c971cd34feBF1f94031', type: 'sudoswap', label: 'ALMD/cbETH' },
];

// Helper: fetch with timeout using AbortController
async function fetchWithTimeout(url, options = {}, timeoutMs = 2500) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}
// Helper: batched parallel map — processes items in batches of batchSize concurrently
// Uses Promise.allSettled to ensure one failure doesn't break the batch
// Prevents rate-limiting with delayMs between batches (not between individual items)
async function batchedMap(items, fn, batchSize = 3, delayMs = 200) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map((item, j) => fn(item, i + j))
    );
    for (const r of batchResults) {
      results.push(r.status === 'fulfilled' ? r.value : undefined);
    }
    if (i + batchSize < items.length) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return results;
}


// Module-level stale cache — stores last successful results per pool+source
// When a fresh fetch fails, serve stale data with stale:true flag instead of null
const sourceCache = {};

function saveToCache(key, data) {
  sourceCache[key] = { data, timestamp: Date.now() };
}

function getStaleFromCache(key) {
  if (sourceCache[key]) {
    return { ...sourceCache[key].data, stale: true };
  }
  return null;
}

// 1. GeckoTerminal API fetcher (no key needed)
// Endpoint: https://api.geckoterminal.com/api/v2/networks/base/pools/{address}
// Returns per pool: { tvl, volume24h, price, priceChange24h, txns24h }
export async function fetchGeckoTerminal(poolConfigs = POOL_CONFIG) {
  const results = {};
  const dexPools = poolConfigs.filter((p) => p.type === 'dex');
  await batchedMap(dexPools, async (pool) => {
    try {
      const url = `https://api.geckoterminal.com/api/v2/networks/base/pools/${pool.pairAddress}`;
      const res = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) {
        const stale = getStaleFromCache(`geckoTerminal_${pool.id}`);
        if (stale) { results[pool.id] = stale; return; }
        results[pool.id] = null;
        return;
      }
      const json = await res.json();
      const attr = json?.data?.attributes;
      if (!attr) {
        const stale2 = getStaleFromCache(`geckoTerminal_${pool.id}`);
        if (stale2) { results[pool.id] = stale2; return; }
        results[pool.id] = null;
        return;
      }
      const buys = attr?.transactions?.h24?.buys || 0;
      const sells = attr?.transactions?.h24?.sells || 0;
      results[pool.id] = {
        tvl: attr?.reserve_in_usd != null ? parseFloat(attr.reserve_in_usd) : null,
        volume24h: attr?.volume_usd?.h24 != null ? parseFloat(attr.volume_usd.h24) : null,
        price: attr?.base_token_price_usd != null ? parseFloat(attr.base_token_price_usd) : null,
        priceChange24h: attr?.price_change_percentage?.h24 != null ? parseFloat(attr.price_change_percentage.h24) : null,
        txns24h: buys + sells,
        lastCheckedAt: new Date().toISOString(),
      };
      saveToCache(`geckoTerminal_${pool.id}`, results[pool.id]);
    } catch {
      const stale = getStaleFromCache(`geckoTerminal_${pool.id}`);
      results[pool.id] = stale || null;
    }
  }, 3, 200); // batch of 3, 200ms between batches — GeckoTerminal free tier
  return results;
}

// 2. DexScreener API fetcher (no key needed)
// For pair addresses: https://api.dexscreener.com/latest/dex/pairs/base/{address}
// For token addresses: https://api.dexscreener.com/latest/dex/tokens/{tokenAddress} (pick first pair)
// Returns per pool: { tvl, volume24h, price, txns24h }
export async function fetchDexScreener(poolConfigs = POOL_CONFIG) {
  const results = {};
  const dexPools = poolConfigs.filter((p) => p.type === 'dex');
  await batchedMap(dexPools, async (pool) => {
    try {
      let url;
      if (pool.dexScreenerTokenAddress) {
        url = `https://api.dexscreener.com/latest/dex/tokens/${pool.dexScreenerTokenAddress}`;
      } else {
        url = `https://api.dexscreener.com/latest/dex/pairs/base/${pool.pairAddress}`;
      }
      const res = await fetchWithTimeout(url);
      if (!res.ok) {
        const stale = getStaleFromCache(`dexScreener_${pool.id}`);
        if (stale) { results[pool.id] = stale; return; }
        results[pool.id] = null;
        return;
      }
      const json = await res.json();
      const pair = json?.pairs?.[0];
      if (!pair) {
        const stale2 = getStaleFromCache(`dexScreener_${pool.id}`);
        if (stale2) { results[pool.id] = stale2; return; }
        results[pool.id] = null;
        return;
      }
      const buys = pair?.txns?.h24?.buys || 0;
      const sells = pair?.txns?.h24?.sells || 0;
      results[pool.id] = {
        tvl: pair?.liquidity?.usd != null ? parseFloat(pair.liquidity.usd) : null,
        volume24h: pair?.volume?.h24 != null ? parseFloat(pair.volume.h24) : null,
        price: pair?.priceUsd != null ? parseFloat(pair.priceUsd) : null,
        txns24h: buys + sells,
        lastCheckedAt: new Date().toISOString(),
      };
      saveToCache(`dexScreener_${pool.id}`, results[pool.id]);
    } catch {
      const stale = getStaleFromCache(`dexScreener_${pool.id}`);
      results[pool.id] = stale || null;
    }
  }, 3, 150); // batch of 3, 150ms between batches — DexScreener rate limit safe
  return results;
}

// 2b. MintClub on-chain fetcher — reads bonding curve data from MCV2_Bond contract on Base
// Contract: 0xc5a076cad94176c2996B32d8466Be1cE757FAa27
// Returns per pool: { tvl, volume24h, price, priceChange24h, currentSupply, maxSupply, reserveBalanceNUT, priceInNUT }
const MCV2_BOND = '0xc5a076cad94176c2996B32d8466Be1cE757FAa27';
const NUT_ADDR = '0xb8de15fb529d98c93c749de63c749d48d25a30df';

function padAddr(a) { return a.toLowerCase().replace('0x', '').padStart(64, '0'); }

let _nutUsd = null, _nutUsdTime = 0;
async function _getNutUsd() {
  if (_nutUsd && Date.now() - _nutUsdTime < 60000) return _nutUsd;
  try {
    const r = await fetchWithTimeout(`https://api.geckoterminal.com/api/v2/networks/base/tokens/${NUT_ADDR}`, { headers: { Accept: 'application/json' } });
    if (r.ok) { const j = await r.json(); const p = j?.data?.attributes?.price_usd ? parseFloat(j.data.attributes.price_usd) : null; if (p != null) { _nutUsd = p; _nutUsdTime = Date.now(); return p; } }
  } catch {}
  try {
    const key = `base:${NUT_ADDR}`;
    const r = await fetchWithTimeout(`https://coins.llama.fi/prices/current/${key}`);
    if (r.ok) { const j = await r.json(); const p = j?.coins?.[key]?.price ?? null; if (p != null) { _nutUsd = p; _nutUsdTime = Date.now(); return p; } }
  } catch {}
  return null;
}

export async function fetchMintClub(poolConfigs = POOL_CONFIG) {
  const results = {};
  const pools = poolConfigs.filter((p) => p.type === 'mintclub' || p.type === 'mintclub_nft');
  const nutUsd = await _getNutUsd().catch(() => null);

  await batchedMap(pools, async (pool) => {
    try {
      const addr = pool.tokenAddress || pool.pairAddress;
      if (!addr) { results[pool.id] = null; return; }
      const ap = padAddr(addr);

      // Parallel RPC calls to MCV2_Bond + token contract (within a single pool, parallel is OK)
      const [priceRes, maxRes, bondRes, supplyRes] = await Promise.all([
        rpcCall('eth_call', [{ to: MCV2_BOND, data: '0x840d885d' + ap }, 'latest']).catch(() => null),  // priceForNextMint
        rpcCall('eth_call', [{ to: MCV2_BOND, data: '0x9cc7becf' + ap }, 'latest']).catch(() => null),  // maxSupply
        rpcCall('eth_call', [{ to: MCV2_BOND, data: '0xd9fe0eae' + ap }, 'latest']).catch(() => null),  // tokenBond
        rpcCall('eth_call', [{ to: addr, data: '0x18160ddd' }, 'latest']).catch(() => null),              // totalSupply
      ]);

      const priceInNUT = priceRes && priceRes !== '0x' ? Number(BigInt(priceRes)) / 1e18 : null;
      const maxSupply = maxRes && maxRes !== '0x' ? Number(BigInt(maxRes)) / 1e18 : null;
      const currentSupply = supplyRes && supplyRes !== '0x' ? Number(BigInt(supplyRes)) / 1e18 : null;
      let reserveBalanceNUT = null;
      let mintRoyalty = null;
      let burnRoyalty = null;
      if (bondRes && bondRes !== '0x' && bondRes.length >= 194) {
        const hex = bondRes.slice(2);
        // tokenBond returns: (address creator, uint16 mintRoyalty, uint16 burnRoyalty, uint40 createdAt, address reserveToken, uint256 reserveBalance)
        // Word 0: creator (address), Word 1: mintRoyalty (uint16), Word 2: burnRoyalty (uint16)
        mintRoyalty = parseInt(hex.slice(64, 128), 16) || 0;
        burnRoyalty = parseInt(hex.slice(128, 192), 16) || 0;
        // Word 5: reserveBalance (uint256) — NUT has 18 decimals
        reserveBalanceNUT = Number(BigInt('0x' + hex.slice(320, 384))) / 1e18;
      }

      if (priceInNUT == null && maxSupply == null && currentSupply == null) {
        const stale = getStaleFromCache(`mintClub_${pool.id}`);
        results[pool.id] = stale || null;
        return;
      }

      const priceUsd = (priceInNUT != null && nutUsd != null) ? priceInNUT * nutUsd : null;
      const tvl = (priceUsd != null && currentSupply != null) ? priceUsd * currentSupply : null;
      const marketCapUsd = (priceUsd != null && maxSupply != null) ? priceUsd * maxSupply : null;

      results[pool.id] = {
        tvl,
        volume24h: null,
        price: priceUsd,
        priceInNUT,
        priceChange24h: null,
        currentSupply,
        maxSupply,
        reserveBalanceNUT,
        mintRoyalty: mintRoyalty != null ? mintRoyalty / 100 : null, // basis points to percent
        burnRoyalty: burnRoyalty != null ? burnRoyalty / 100 : null, // basis points to percent
        marketCapUsd,
        nutUsdPrice: nutUsd,
        lastCheckedAt: new Date().toISOString(),
      };
      saveToCache(`mintClub_${pool.id}`, results[pool.id]);
    } catch {
      const stale = getStaleFromCache(`mintClub_${pool.id}`);
      results[pool.id] = stale || null;
    }
  }, 3, 100); // batch of 3, 100ms between batches — RPC calls within each pool still run in parallel
  return results;
}

// 3. CoinGecko Demo API (no key needed) — global reference prices, NOT per-pool
// Returns: { ethereum, bitcoin, 'usd-coin', 'aerodrome-finance' }
export async function fetchCoinGeckoReference() {
  try {
    const url =
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,usd-coin,aerodrome-finance&vs_currencies=usd';
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const json = await res.json();
    return {
      ethereum: json?.ethereum?.usd ?? null,
      bitcoin: json?.bitcoin?.usd ?? null,
      'usd-coin': json?.['usd-coin']?.usd ?? null,
      'aerodrome-finance': json?.['aerodrome-finance']?.usd ?? null,
      lastCheckedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// 4. Base RPC fetcher (no key needed)
// RPC URL: https://mainnet.base.org
// For V2 pairs: getReserves() (selector: 0x0902f1ac)
// For token supply: totalSupply() (selector: 0x18160ddd)
// Returns per pool: { reserves0, reserves1, totalSupply }
const BASE_RPC_URL = 'https://mainnet.base.org';

async function rpcCall(method, params) {
  const res = await fetchWithTimeout(BASE_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
  });
  if (!res.ok) throw new Error(`RPC HTTP error: ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(`RPC error: ${json.error.message}`);
  return json.result;
}

function hexToBigInt(hex) {
  if (!hex || hex === '0x') return BigInt(0);
  return BigInt(hex);
}

export async function fetchBaseRPC(poolConfigs = POOL_CONFIG) {
  const results = {};
  const dexPools = poolConfigs.filter((p) => p.type === 'dex');
  // Process pools in batches of 3 with 200ms delay between batches to avoid RPC 429 rate limiting
  await batchedMap(dexPools, async (pool) => {
    try {
      // Fetch getReserves() and totalSupply() in parallel (different selectors, same contract)
      const [reservesResult, supplyResult] = await Promise.all([
        rpcCall('eth_call', [{ to: pool.pairAddress, data: '0x0902f1ac' }, 'latest']).catch(() => null),
        rpcCall('eth_call', [{ to: pool.pairAddress, data: '0x18160ddd' }, 'latest']).catch(() => null),
      ]);

      // Parse getReserves — V3/Balancer pools don't support it, leave as null
      let reserves0 = null;
      let reserves1 = null;
      if (reservesResult && reservesResult.length >= 130) {
        reserves0 = hexToBigInt('0x' + reservesResult.slice(2, 66)).toString();
        reserves1 = hexToBigInt('0x' + reservesResult.slice(66, 130)).toString();
      }

      // Parse totalSupply — some pool types don't support it, leave as null
      let totalSupply = null;
      if (supplyResult && supplyResult !== '0x') {
        totalSupply = hexToBigInt(supplyResult).toString();
      }

      results[pool.id] = { reserves0, reserves1, totalSupply, lastCheckedAt: new Date().toISOString() };
      saveToCache(`rpc_${pool.id}`, results[pool.id]);
    } catch {
      const stale = getStaleFromCache(`rpc_${pool.id}`);
      results[pool.id] = stale || null;
    }
  }, 3, 200); // batch of 3, 200ms between batches — Base RPC rate limit safe
  return results;
}

export { POOL_CONFIG };
