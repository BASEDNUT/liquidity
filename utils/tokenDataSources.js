// Multi-Source Token Data Fetchers for BASED NUT Liquidity Portal
// Each fetcher is independent — if one source fails for a token, return null (never throw)

// Token addresses on Base chain
export const TOKEN_ADDRESSES = {
  NUT:    '0xb8de15fb529d98c93c749de63c749d48d25a30df',
  SNUT:   '0xac130701aa31c284c36609e2489f150f419ad7ad',
  pNUT:   '0x2a5757b60987ff10385de1d4d923792f6fdcfff1',
  NUTINO: '0x30421e2d18dff60b298eef427cf868ca65f1476b',
  SALT:   '0x1ede2afc985f6d7aeb3f4c84b95a103c00d5de81',
  PIPS:   '0x3f2327221dd4f0bae660172606d6b288a1cf8ad9',
  USDC:   '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  AERO:   '0x940181a94a35a4569e4529a3cdfb74e38fd98631',
  wETH:   '0x4200000000000000000000000000000000000006',
  cbBTC:  '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
  cbETH:  '0x2Ae3f1Ec7F1f5012cFEab0185bFc7aa3cf0dEc22',
  // NFT bonding curve tokens (MintClub)
  PNUTS:   '0x794fcD89357C1CcF04a1a9A441ad4dB2Cd5EE387',
  ALMD:    '0x1A160456005AED47994E1c13C9bc31F274413927',
  SALMD:   '0x1E0f80529593185C021043ffcbfDcB8f4279C649',
  PNUTRMY: '0xF075300b8C2EF500d8Ce4f783F910C500B9A3512',
  // Sunflower Grove Batch I — wNUT rootstock + scions (verified on-chain 2026-08-27)
  wNUT:    '0xBA5ED46e31F80dafF307cbf60bd422a6f62E3dd3',
  VVV:     '0xacfE6019Ed1A7Dc6f7B508C02d1b04ec88cC21bf',
  DIEM:    '0xF4d97F2da56e8c3098f3a8D538DB630A2606a024',
  VIRTUAL: '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b',
  MOR:     '0x7431aDa8a591C955a994a21710752EF9b882b8e3',
  wstETH:  '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
  tBTC:    '0x236aa50979D5f3De3Bd1Eeb40E81137F22ab794b',
  EURC:    '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42',
  // Sunflower Grove Batch I graft pool tokens (Balancer v3 BPTs — pool contract IS the ERC-20)
  gtINF:   '0x6a0a1B7428d543524592eD22023A09BdE05aA466',
  gtAGT:   '0x5dA95cC31C840Fd33180e4C7f879e3F3d8Eca200',
  gtETH:   '0xd156d51219B3a7A590670d655E8740Ad404e8835',
  gtBTC:   '0xb2a63935e1391Ee49E5cfB6cc4f184C285fE29b4',
  gtFX:    '0x1cCB8c61b62b9c7a9d4e66C9c824C1539B8b1f2E',
};

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
async function batchedMap(items, fn, batchSize = 3, delayMs = 150) {
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


// Module-level stale cache — stores last successful results per source
// When a fresh fetch fails, serve stale data with stale:true flag instead of null
const sourceCache = {};

async function withStaleCache(cacheKey, fetchFn) {
  try {
    const result = await fetchFn();
    if (result != null) {
      sourceCache[cacheKey] = { data: result, timestamp: Date.now() };
      return result;
    }
    // Fetch returned null — check stale cache
    if (sourceCache[cacheKey]) {
      return { ...sourceCache[cacheKey].data, stale: true };
    }
    return null;
  } catch {
    if (sourceCache[cacheKey]) {
      return { ...sourceCache[cacheKey].data, stale: true };
    }
    return null;
  }
}

// 1. GeckoTerminal Token API (no key needed)
// Endpoint: https://api.geckoterminal.com/api/v2/networks/base/tokens/{address}
// Returns: { price_usd, volume_usd_h24, market_cap_usd, total_reserve_in_usd }
async function fetchGeckoTerminalToken(address) {
  return withStaleCache(`${address}_geckoTerminal`, async () => {
  try {
    const url = `https://api.geckoterminal.com/api/v2/networks/base/tokens/${address}`;
    const res = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json();
    const attr = json?.data?.attributes;
    if (!attr) return null;
    return {
      price_usd: attr?.price_usd != null ? parseFloat(attr.price_usd) : null,
      volume_usd_h24: attr?.volume_usd?.h24 != null ? parseFloat(attr.volume_usd.h24) : null,
      market_cap_usd: attr?.market_cap_usd != null ? parseFloat(attr.market_cap_usd) : null,
      total_reserve_in_usd: attr?.total_reserve_in_usd != null ? parseFloat(attr.total_reserve_in_usd) : null,
      lastCheckedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
  });
}

// 2. DexScreener Token API (no key needed)
// Endpoint: https://api.dexscreener.com/latest/dex/tokens/{address}
// Returns first pair: { priceUsd, liquidity_usd, volume_h24, priceChange_h24 }
async function fetchDexScreenerToken(address) {
  return withStaleCache(`${address}_dexScreener`, async () => {
  try {
    const url = `https://api.dexscreener.com/latest/dex/tokens/${address}`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const json = await res.json();
    const pair = json?.pairs?.[0];
    if (!pair) return null;
    return {
      priceUsd: pair?.priceUsd != null ? parseFloat(pair.priceUsd) : null,
      liquidity_usd: pair?.liquidity?.usd != null ? parseFloat(pair.liquidity.usd) : null,
      volume_h24: pair?.volume?.h24 != null ? parseFloat(pair.volume.h24) : null,
      priceChange_h24: pair?.priceChange?.h24 != null ? parseFloat(pair.priceChange.h24) : null,
      lastCheckedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
  });
}

// 3. Base RPC — totalSupply() and decimals() on token contract
// RPC URL: https://mainnet.base.org
// totalSupply selector: 0x18160ddd
// decimals selector: 0x313ce567
const BASE_RPC_URLS = [
  'https://mainnet.base.org',
  'https://base.publicnode.com',
  'https://1rpc.io/base',
];
let rpcEndpointIndex = 0;

async function rpcCall(method, params) {
  const maxRetries = 4;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const url = BASE_RPC_URLS[rpcEndpointIndex % BASE_RPC_URLS.length];
    rpcEndpointIndex++;
    try {
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
      });
      if (res.status === 429 && attempt < maxRetries) {
        const delay = 300 * Math.pow(2, attempt); // 300ms, 600ms, 1.2s, 2.4s
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      if (!res.ok) throw new Error(`RPC HTTP error: ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(`RPC error: ${json.error.message}`);
      return json.result;
    } catch (e) {
      if (attempt < maxRetries) {
        const delay = 300 * Math.pow(2, attempt);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw e;
    }
  }
}


function hexToBigInt(hex) {
  if (!hex || hex === '0x') return BigInt(0);
  return BigInt(hex);
}

// Convert hex totalSupply to human-readable number using decimals
function formatSupply(totalSupplyHex, decimalsHex) {
  try {
    const supply = hexToBigInt(totalSupplyHex);
    const decimals = parseInt(decimalsHex, 16) || 0;
    // Convert to number with proper decimals
    const divisor = BigInt(10) ** BigInt(decimals);
    const whole = supply / divisor;
    const fraction = supply % divisor;
    const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 4);
    const result = parseFloat(`${whole.toString()}.${fractionStr}`);
    return {
      totalSupply: result,
      decimals,
      rawTotalSupply: supply.toString(),
    };
  } catch {
    return { totalSupply: null, decimals: null, rawTotalSupply: null };
  }
}

async function fetchBaseRPCToken(address) {
  return withStaleCache(`${address}_rpc`, async () => {
  try {
    const [supplyResult, decimalsResult] = await Promise.all([
      rpcCall('eth_call', [{ to: address, data: '0x18160ddd' }, 'latest']).catch(() => null),
      rpcCall('eth_call', [{ to: address, data: '0x313ce567' }, 'latest']).catch(() => null),
    ]);

    if (!supplyResult || supplyResult === '0x') {
      return { totalSupply: null, decimals: null, rawTotalSupply: null, lastCheckedAt: new Date().toISOString() };
    }

    const formatted = formatSupply(supplyResult, decimalsResult || '0x0');
    formatted.lastCheckedAt = new Date().toISOString();
    return formatted;
  } catch {
    return { totalSupply: null, decimals: null, rawTotalSupply: null };
  }
  });
}

// 4. Balancer API — GraphQL query for pNUT pool data
// Endpoint: https://api.balancer.fi/graphql
// Query: poolGetPool with chain: BASE and pNUT pool ID
// Extracts: totalLiquidity, APR, token balances, totalShares, BPT price
// Calculates NAV = totalLiquidity / totalShares
const BALANCER_GRAPHQL_URL = 'https://api.balancer.fi/graphql';
const PNUT_POOL_ID = '0x2a5757b60987ff10385de1d4d923792f6fdcfff100010000000000000000019e';

// Module-level cache for Balancer pool data (avoids duplicate RPC calls across concurrent requests)
let balancerPoolCache = null;
let balancerPoolCacheTime = 0;
const BALANCER_CACHE_TTL = 300 * 1000; // 5 minutes

// RPC fallback: compute BPT price from pool composition via Vault getPoolTokens
// Used when Balancer GraphQL API is unreachable (DNS issues in Docker)
async function fetchBalancerPoolRPC() {
  try {
    const PNUT_BPT_ADDRESS = '0x2a5757b60987ff10385de1d4d923792f6fdcfff1';
    const VAULT_ADDRESS = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';

    // Only 2 RPC calls: totalSupply on BPT + getPoolTokens on Vault (using hardcoded correct pool ID)
    const [supplyResult, poolTokensResult] = await Promise.all([
      rpcCall('eth_call', [{ to: PNUT_BPT_ADDRESS, data: '0x18160ddd' }, 'latest']).catch(() => null),
      rpcCall('eth_call', [{ to: VAULT_ADDRESS, data: '0xf94d4668' + PNUT_POOL_ID.slice(2) }, 'latest']).catch(() => null),
    ]);

    if (!poolTokensResult || poolTokensResult === '0x' || poolTokensResult.length < 202) return null;

    // Parse ABI-encoded getPoolTokens result: (address[] tokens, uint256[] balances, uint256 lastChangeBlock)
    const hex = poolTokensResult.slice(2);
    const offsetTokens = parseInt(hex.slice(0, 64), 16);
    const offsetBalances = parseInt(hex.slice(64, 128), 16);

    // Parse tokens array
    const tokensBase = offsetTokens * 2;
    const numTokens = parseInt(hex.slice(tokensBase, tokensBase + 64), 16);
    const tokens = [];
    for (let i = 0; i < numTokens; i++) {
      const addrStart = tokensBase + 64 + i * 64;
      tokens.push('0x' + hex.slice(addrStart + 24, addrStart + 64));
    }

    // Parse balances array
    const balancesBase = offsetBalances * 2;
    const numBalances = parseInt(hex.slice(balancesBase, balancesBase + 64), 16);
    const balances = [];
    for (let i = 0; i < numBalances; i++) {
      const balStart = balancesBase + 64 + i * 64;
      balances.push(BigInt('0x' + hex.slice(balStart, balStart + 64)));
    }

    // Hardcoded decimals for known pool tokens (avoids 4 extra RPC calls)
    // Pool tokens: cbETH(18), SNUT(9), NUT(18), cbBTC(8)
    const tokenDecimals = tokens.map((addr) => {
      const lower = addr.toLowerCase();
      if (lower === '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22') return 18; // cbETH
      if (lower === '0xac130701aa31c284c36609e2489f150f419ad7ad') return 9;  // SNUT
      if (lower === '0xb8de15fb529d98c93c749de63c749d48d25a30df') return 18; // NUT
      if (lower === '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf') return 8;  // cbBTC
      return 18; // default
    });

    // Fetch prices for all pool tokens via external APIs (not RPC)
    let totalValue = 0;
    let allPricesFound = true;

    for (let i = 0; i < tokens.length; i++) {
      const decimals = tokenDecimals[i];
      const humanBalance = Number(balances[i]) / (10 ** decimals);
      const llamaKey = `base:${tokens[i].toLowerCase()}`;
      let price = null;

      // Try DefiLlama prices API first
      try {
        const priceRes = await fetchWithTimeout(`https://coins.llama.fi/prices/current/${llamaKey}`);
        if (priceRes.ok) {
          const priceJson = await priceRes.json();
          price = priceJson?.coins?.[llamaKey]?.price ?? null;
        }
      } catch {}

      // Fallback to GeckoTerminal if DefiLlama doesn't have the price
      if (price == null) {
        try {
          const geckoUrl = `https://api.geckoterminal.com/api/v2/networks/base/tokens/${tokens[i]}`;
          const geckoRes = await fetchWithTimeout(geckoUrl, { headers: { Accept: 'application/json' } });
          if (geckoRes.ok) {
            const geckoJson = await geckoRes.json();
            price = geckoJson?.data?.attributes?.price_usd != null ? parseFloat(geckoJson.data.attributes.price_usd) : null;
          }
        } catch {}
      }

      if (price != null && price > 0) {
        totalValue += humanBalance * price;
      } else {
        allPricesFound = false;
      }
    }

    // Compute BPT price = totalValue / totalSupply
    if (allPricesFound && supplyResult && supplyResult !== '0x') {
      const supplyBigInt = hexToBigInt(supplyResult);
      const totalSupply = Number(supplyBigInt) / 1e18;
      if (totalSupply > 0) {
        return { bptPrice: totalValue / totalSupply, totalLiquidity: totalValue, lastCheckedAt: new Date().toISOString() };
      }
    }

    return null;
  } catch {
    return null;
  }
}

async function fetchBalancerPool() {
  // Try Balancer GraphQL API first
  try {
    const query = `
      query GetPnutPool {
        poolGetPool(
          chain: BASE
          id: "${PNUT_POOL_ID}"
        ) {
          id
          address
          totalLiquidity
          totalShares
          dynamicData {
            apr
            totalLiquidity
            volume24h
          }
          tokens {
            address
            balance
            weight
            symbol
          }
        }
      }
    `;

    const res = await fetchWithTimeout(BALANCER_GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (res.ok) {
      const json = await res.json();
      const pool = json?.data?.poolGetPool;
      if (pool) {
        const totalLiquidity = pool.totalLiquidity != null ? parseFloat(pool.totalLiquidity) : null;
        const totalShares = pool.totalShares != null ? parseFloat(pool.totalShares) : null;
        const nav = totalLiquidity && totalShares && totalShares > 0
          ? totalLiquidity / totalShares
          : null;

        const apr = pool.dynamicData?.apr != null ? parseFloat(pool.dynamicData.apr) : null;
        const volume24h = pool.dynamicData?.volume24h != null ? parseFloat(pool.dynamicData.volume24h) : null;

        // Extract individual token balances and weights
        const tokenBalances = (pool.tokens || []).map(t => ({
          address: t.address,
          symbol: t.symbol,
          balance: t.balance != null ? parseFloat(t.balance) : null,
          weight: t.weight != null ? parseFloat(t.weight) : null,
        }));

        return {
          totalLiquidity,
          totalShares,
          nav,
          apr,
          volume24h,
          tokenBalances,
          bptPrice: nav, // BPT price = NAV for weighted pools
          poolAddress: pool.address,
          poolId: pool.id,
          lastCheckedAt: new Date().toISOString(),
        };
      }
    }
  } catch {}

  // GraphQL failed or returned null — fall back to RPC-based price computation
  // Use module-level cache to avoid repeated RPC calls across concurrent requests
  if (balancerPoolCache && Date.now() - balancerPoolCacheTime < BALANCER_CACHE_TTL) {
    return balancerPoolCache;
  }
  const rpcResult = await fetchBalancerPoolRPC();
  if (rpcResult) {
    balancerPoolCache = rpcResult;
    balancerPoolCacheTime = Date.now();
    return rpcResult;
  }
  // RPC also failed — serve stale module cache if available
  if (balancerPoolCache) {
    return { ...balancerPoolCache, stale: true };
  }
  return null;
}

// MintClub token fetcher — reads bonding curve data on-chain from MCV2_Bond contract
// Contract: 0xc5a076cad94176c2996B32d8466Be1cE757FAa27 on Base
// Uses: priceForNextMint(address), maxSupply(address), tokenBond(address), totalSupply()
// Returns: { priceUsd, priceInNUT, volume_h24, marketCapUsd, currentSupply, maxSupply, reserveBalanceNUT, mintRoyalty, burnRoyalty, lastCheckedAt } | null
const MCV2_BOND_ADDRESS = '0xc5a076cad94176c2996B32d8466Be1cE757FAa27';
const NUT_ADDRESS = '0xb8de15fb529d98c93c749de63c749d48d25a30df';

// Helper: pad address to 32 bytes for ABI encoding
function padAddress(addr) {
  return addr.toLowerCase().replace('0x', '').padStart(64, '0');
}

// Helper: get NUT USD price from GeckoTerminal
let nutPriceCache = null;
let nutPriceCacheTime = 0;
async function getNutUsdPrice() {
  if (nutPriceCache && Date.now() - nutPriceCacheTime < 60000) return nutPriceCache;
  try {
    const res = await fetchWithTimeout(`https://api.geckoterminal.com/api/v2/networks/base/tokens/${NUT_ADDRESS}`, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      const price = json?.data?.attributes?.price_usd ? parseFloat(json.data.attributes.price_usd) : null;
      if (price != null) {
        nutPriceCache = price;
        nutPriceCacheTime = Date.now();
        return price;
      }
    }
  } catch {}
  // Fallback to DefiLlama
  try {
    const key = `base:${NUT_ADDRESS}`;
    const res = await fetchWithTimeout(`https://coins.llama.fi/prices/current/${key}`);
    if (res.ok) {
      const json = await res.json();
      const price = json?.coins?.[key]?.price ?? null;
      if (price != null) {
        nutPriceCache = price;
        nutPriceCacheTime = Date.now();
        return price;
      }
    }
  } catch {}
  return null;
}

export async function fetchMintClubToken(address) {
  if (!address) return null;
  try {
    const addrPadded = padAddress(address);

    // Parallel RPC calls to MCV2_Bond + token contract
    const [priceResult, maxSupplyResult, bondResult, totalSupplyResult] = await Promise.all([
      rpcCall('eth_call', [{ to: MCV2_BOND_ADDRESS, data: '0x840d885d' + addrPadded }, 'latest']).catch(() => null),
      rpcCall('eth_call', [{ to: MCV2_BOND_ADDRESS, data: '0x9cc7becf' + addrPadded }, 'latest']).catch(() => null),
      rpcCall('eth_call', [{ to: MCV2_BOND_ADDRESS, data: '0xd9fe0eae' + addrPadded }, 'latest']).catch(() => null),
      rpcCall('eth_call', [{ to: address, data: '0x18160ddd' }, 'latest']).catch(() => null),
    ]);

    // Parse priceForNextMint (uint128 → returns as 32-byte hex)
    const priceForNextMintRaw = priceResult && priceResult !== '0x' ? BigInt(priceResult) : null;
    // Price is in reserve token (NUT) units, scaled by 10^18
    const priceInNUT = priceForNextMintRaw != null ? Number(priceForNextMintRaw) / 1e18 : null;

    // Parse maxSupply (uint128)
    const maxSupply = maxSupplyResult && maxSupplyResult !== '0x' ? Number(BigInt(maxSupplyResult)) : null;

    // Parse tokenBond: (address creator, uint16 mintRoyalty, uint16 burnRoyalty, uint40 createdAt, address reserveToken, uint256 reserveBalance)
    let reserveBalanceNUT = null;
    let mintRoyalty = null;
    let burnRoyalty = null;
    let reserveToken = null;
    if (bondResult && bondResult !== '0x' && bondResult.length >= 194) {
      const hex = bondResult.slice(2);
      mintRoyalty = parseInt(hex.slice(64, 128), 16) || 0;      // word 1
      burnRoyalty = parseInt(hex.slice(128, 192), 16) || 0;      // word 2
      // createdAt = word 3 (uint40), reserveToken = word 4 (address)
      reserveToken = '0x' + hex.slice(256, 264) + hex.slice(264, 320).slice(0, 40); // extract address from word 4
      reserveBalanceNUT = Number(BigInt('0x' + hex.slice(320, 384))) / 1e18; // word 5 (uint256, NUT has 18 decimals)
    }

    // Parse totalSupply from token contract
    const currentSupply = totalSupplyResult && totalSupplyResult !== '0x' ? Number(BigInt(totalSupplyResult)) : null;

    // If no data at all, return null
    if (priceInNUT == null && maxSupply == null && currentSupply == null) return null;

    // Get NUT USD price for conversion
    const nutUsdPrice = await getNutUsdPrice().catch(() => null);
    const priceUsd = (priceInNUT != null && nutUsdPrice != null) ? priceInNUT * nutUsdPrice : null;
    const marketCapUsd = (priceUsd != null && maxSupply != null) ? priceUsd * maxSupply : null;

    return {
      priceUsd,
      priceInNUT,
      volume_h24: null, // No on-chain volume data available via RPC
      marketCapUsd,
      currentSupply,
      maxSupply,
      reserveBalanceNUT,
      mintRoyalty: mintRoyalty != null ? mintRoyalty / 100 : null, // basis points to percent
      burnRoyalty: burnRoyalty != null ? burnRoyalty / 100 : null,
      nutUsdPrice,
      lastCheckedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// Main export: fetch token data from all sources side-by-side
// tokenList: object mapping symbol -> address (defaults to TOKEN_ADDRESSES)
// Returns: { [symbol]: { geckoTerminal: {...}|null, dexScreener: {...}|null, rpc: {...}|null, balancer: {...}|null, mintClub: {...}|null } }
export async function fetchTokenData(tokenList = TOKEN_ADDRESSES) {
  const symbols = Object.keys(tokenList);
  const results = {};

  // Fetch Balancer pool data once (only for pNUT)
  const balancerData = await fetchBalancerPool().catch(() => null);

  // Process tokens in batches of 3 with 150ms delay between batches to avoid RPC 429 rate limiting
  // Within each token, the different sources (GeckoTerminal, DexScreener, RPC, MintClub) still run in parallel
  await batchedMap(symbols, async (symbol) => {
    const address = tokenList[symbol];
    // Each source has independent error isolation
    const [geckoTerminal, dexScreener, rpc, mintClub] = await Promise.all([
      fetchGeckoTerminalToken(address).catch(() => null),
      fetchDexScreenerToken(address).catch(() => null),
      fetchBaseRPCToken(address).catch(() => null),
      fetchMintClubToken(address).catch(() => null),
    ]);
    // Attach Balancer data only for pNUT
    const balancer = symbol === 'pNUT' ? balancerData : null;
    results[symbol] = { geckoTerminal, dexScreener, rpc, balancer, mintClub };
  }, 3, 150); // batch of 3, 150ms between batches

  return results;
}
