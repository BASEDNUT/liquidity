// SNUT On-Chain Data Fetcher
// Fetches deep SNUT ecosystem data: burn tracking, LP stats, buyback fuel
// All data is live from Base RPC — no hard-coded numbers

const RPC_URLS = [
  'https://mainnet.base.org',
  'https://base.publicnode.com',
];

// Key addresses
const SNUT = '0xac130701aa31c284c36609e2489f150f419ad7ad';
const NUT = '0xb8de15fb529d98c93c749de63c749d48d25a30df';
const DEAD = '0x000000000000000000000000000000000000dEaD';
const SNUT_ETH_POOL = '0xB22895d2ee6e29395F30Ec47c8D9FE0d55355AE1';
const SNUT_NUT_POOL = '0x893faaa7baf7a8247fc7142afb28e13d51a5aae8';
const META_POOL = '0x82bbadb9d6b2c0a59ed01809e30323f89f6faa1c';

// Function selectors
const BALANCE_OF = '0x70a08231';
const TOTAL_SUPPLY = '0x18160ddd';
const GET_RESERVES = '0x0902f1ac';

// SNUT decimals = 9, NUT decimals = 18, ETH decimals = 18
const SNUT_DECIMALS = 1e9;
const NUT_DECIMALS = 1e18;
const ETH_DECIMALS = 1e18;

let sourceCache = null;
let sourceCacheTime = 0;
const CACHE_TTL_MS = 4 * 60 * 1000; // 4 minutes

async function rpcCall(method, params, retryCount = 0) {
  const rpc = RPC_URLS[retryCount % RPC_URLS.length];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.status === 429 && retryCount < 3) {
      await new Promise(r => setTimeout(r, 500 * (retryCount + 1)));
      return rpcCall(method, params, retryCount + 1);
    }
    const data = await res.json();
    return data.result;
  } catch (e) {
    if (retryCount < 3) {
      await new Promise(r => setTimeout(r, 500 * (retryCount + 1)));
      return rpcCall(method, params, retryCount + 1);
    }
    return null;
  }
}

function hexToBigInt(hex) {
  if (!hex || hex === '0x') return 0n;
  try { return BigInt(hex); } catch { return 0n; }
}

function balanceOfData(token, holder) {
  return BALANCE_OF + holder.toLowerCase().slice(2).padStart(64, '0');
}

async function withStaleCache(fetchFn) {
  const now = Date.now();
  if (sourceCache && (now - sourceCacheTime) < CACHE_TTL_MS) {
    return { ...sourceCache, cached: true };
  }
  try {
    const fresh = await fetchFn();
    sourceCache = fresh;
    sourceCacheTime = now;
    return { ...fresh, cached: false };
  } catch (e) {
    if (sourceCache) {
      return { ...sourceCache, cached: true, stale: true };
    }
    throw e;
  }
}

export async function fetchSnutData() {
  return withStaleCache(async () => {
    const now = new Date().toISOString();
    const data = { lastCheckedAt: now };
    
    // 1. SNUT totalSupply (circulating)
    const snutSupplyHex = await rpcCall('eth_call', [{ to: SNUT, data: TOTAL_SUPPLY }, 'latest']);
    const snutSupply = Number(hexToBigInt(snutSupplyHex)) / SNUT_DECIMALS;
    data.snutTotalSupply = snutSupply;
    
    // 2. Dead address SNUT balance (burned)
    const deadSnutHex = await rpcCall('eth_call', [{ to: SNUT, data: balanceOfData(SNUT, DEAD) }, 'latest']);
    const deadSnut = Number(hexToBigInt(deadSnutHex)) / SNUT_DECIMALS;
    data.deadSnutBalance = deadSnut;
    data.burnPercentage = snutSupply > 0 ? (deadSnut / snutSupply) * 100 : 0;
    data.circulatingSupply = snutSupply - deadSnut;
    
    await new Promise(r => setTimeout(r, 200));
    
    // 3. Dead address NUT balance (reward burn)
    const deadNutHex = await rpcCall('eth_call', [{ to: NUT, data: balanceOfData(NUT, DEAD) }, 'latest']);
    const deadNut = Number(hexToBigInt(deadNutHex)) / NUT_DECIMALS;
    data.deadNutBalance = deadNut;
    
    await new Promise(r => setTimeout(r, 200));
    
    // 4. SNUT/ETH LP totalSupply
    const lpSupplyHex = await rpcCall('eth_call', [{ to: SNUT_ETH_POOL, data: TOTAL_SUPPLY }, 'latest']);
    const lpSupply = Number(hexToBigInt(lpSupplyHex));
    data.lpTotalSupply = lpSupply;
    
    // 5. Dead address LP balance
    const deadLpHex = await rpcCall('eth_call', [{ to: SNUT_ETH_POOL, data: balanceOfData(SNUT_ETH_POOL, DEAD) }, 'latest']);
    const deadLp = Number(hexToBigInt(deadLpHex));
    data.deadLpBalance = deadLp;
    data.deadLpPercentage = lpSupply > 0 ? (deadLp / lpSupply) * 100 : 0;
    
    await new Promise(r => setTimeout(r, 200));
    
    // 6. SNUT/ETH pool reserves (token ordering may vary — use balanceOf for accuracy)
    // We already fetch actual balances below (items 12-13), so just store raw reserves for reference
    const snutEthResHex = await rpcCall('eth_call', [{ to: SNUT_ETH_POOL, data: GET_RESERVES }, 'latest']);
    if (snutEthResHex && snutEthResHex.length >= 194) {
      const r0 = Number(hexToBigInt('0x' + snutEthResHex.slice(2, 66)));
      const r1 = Number(hexToBigInt('0x' + snutEthResHex.slice(66, 130)));
      // Determine which is SNUT by comparing with balanceOf (fetched later)
      // For now store both; will be resolved after actualSnut is known
      data._snutEthR0 = r0;
      data._snutEthR1 = r1;
    }
    
    await new Promise(r => setTimeout(r, 200));
    
    // 7. SNUT/NUT pool reserves — token ordering may vary
    const snutNutResHex = await rpcCall('eth_call', [{ to: SNUT_NUT_POOL, data: GET_RESERVES }, 'latest']);
    if (snutNutResHex && snutNutResHex.length >= 194) {
      const r0 = Number(hexToBigInt('0x' + snutNutResHex.slice(2, 66)));
      const r1 = Number(hexToBigInt('0x' + snutNutResHex.slice(66, 130)));
      // Store raw; resolve after we know actual balances (items 8/11)
      data._snutNutR0 = r0;
      data._snutNutR1 = r1;
    }
    
    // 8. Actual NUT balance in SNUT/NUT pool
    const poolNutHex = await rpcCall('eth_call', [{ to: NUT, data: balanceOfData(NUT, SNUT_NUT_POOL) }, 'latest']);
    const poolNutActual = Number(hexToBigInt(poolNutHex)) / NUT_DECIMALS;
    data.snutNutPoolActualNut = poolNutActual;
    // Resolve SNUT/NUT reserves: the NUT raw balance should match one of the two raw reserves
    let resolvedNutReserve = null;
    if (data._snutNutR0 != null && data._snutNutR1 != null) {
      const rawActualNut = Number(hexToBigInt(poolNutHex));
      const diff0 = Math.abs(data._snutNutR0 - rawActualNut);
      const diff1 = Math.abs(data._snutNutR1 - rawActualNut);
      if (diff0 <= diff1) {
        data.snutNutReserveNut = data._snutNutR0 / NUT_DECIMALS;
        data.snutNutReserveSnut = data._snutNutR1 / SNUT_DECIMALS;
        resolvedNutReserve = data.snutNutReserveNut;
      } else {
        data.snutNutReserveNut = data._snutNutR1 / NUT_DECIMALS;
        data.snutNutReserveSnut = data._snutNutR0 / SNUT_DECIMALS;
        resolvedNutReserve = data.snutNutReserveNut;
      }
      delete data._snutNutR0;
      delete data._snutNutR1;
    }
    // For backward compat
    data.snutNutReserve0 = data.snutNutReserveSnut;
    data.snutNutReserve1 = data.snutNutReserveNut;

    
    await new Promise(r => setTimeout(r, 200));
    
    // 9. Meta-pool reserves + totalSupply
    const metaResHex = await rpcCall('eth_call', [{ to: META_POOL, data: GET_RESERVES }, 'latest']);
    if (metaResHex && metaResHex.length >= 194) {
      const r0 = hexToBigInt('0x' + metaResHex.slice(2, 66));
      const r1 = hexToBigInt('0x' + metaResHex.slice(66, 130));
      data.metaPoolReserve0 = Number(r0) / ETH_DECIMALS;
      data.metaPoolReserve1 = Number(r1) / ETH_DECIMALS;
    }
    const metaSupplyHex = await rpcCall('eth_call', [{ to: META_POOL, data: TOTAL_SUPPLY }, 'latest']);
    data.metaPoolTotalSupply = Number(hexToBigInt(metaSupplyHex));
    
    await new Promise(r => setTimeout(r, 200));
    
    // 10. SNUT contract ETH balance (buyback fuel)
    const snutEthBalHex = await rpcCall('eth_getBalance', [SNUT, 'latest']);
    const snutEthBal = Number(hexToBigInt(snutEthBalHex)) / ETH_DECIMALS;
    data.buybackFuelEth = snutEthBal;
    data.buybackFuelUsd = null; // filled by caller if ETH price available
    
    // 11. SNUT in SNUT/NUT pool (actual balance)
    const poolSnutHex = await rpcCall('eth_call', [{ to: SNUT, data: balanceOfData(SNUT, SNUT_NUT_POOL) }, 'latest']);
    data.snutNutPoolActualSnut = Number(hexToBigInt(poolSnutHex)) / SNUT_DECIMALS;
    
    // 12. SNUT in SNUT/ETH pool (actual balance — authoritative)
    const ethPoolSnutHex = await rpcCall('eth_call', [{ to: SNUT, data: balanceOfData(SNUT, SNUT_ETH_POOL) }, 'latest']);
    data.snutEthPoolActualSnut = Number(hexToBigInt(ethPoolSnutHex)) / SNUT_DECIMALS;

    // 12b. Resolve SNUT/ETH reserves: determine which raw reserve is SNUT (9 decimals) vs WETH (18 decimals)
    // SNUT actual balance (raw) should match one of the two raw reserves
    if (data._snutEthR0 != null && data._snutEthR1 != null) {
      const rawActualSnut = Number(hexToBigInt(ethPoolSnutHex));
      // The one closer to rawActualSnut is SNUT
      const diff0 = Math.abs(data._snutEthR0 - rawActualSnut);
      const diff1 = Math.abs(data._snutEthR1 - rawActualSnut);
      if (diff0 <= diff1) {
        data.snutEthReserveSnut = data._snutEthR0 / SNUT_DECIMALS;
        data.snutEthReserveEth = data._snutEthR1 / ETH_DECIMALS;
      } else {
        data.snutEthReserveSnut = data._snutEthR1 / SNUT_DECIMALS;
        data.snutEthReserveEth = data._snutEthR0 / ETH_DECIMALS;
      }
      delete data._snutEthR0;
      delete data._snutEthR1;
    }
    
    // 13. SNUT in meta-pool (actual balance)
    const metaPoolSnutHex = await rpcCall('eth_call', [{ to: SNUT, data: balanceOfData(SNUT, META_POOL) }, 'latest']);
    data.metaPoolActualSnut = Number(hexToBigInt(metaPoolSnutHex)) / SNUT_DECIMALS;
    
    // 14. NUT in SNUT/NUT pool actual (for excess)
    // already fetched above as poolNutActual
    
    await new Promise(r => setTimeout(r, 200));
    
    // 15. Live fee getters from SNUT contract (basis points)
    const BALANCER_POOL = '0x2a5757b60987ff10385de1d4d923792f6fdcfff1';
    const feeSelectors = {
      liquidityFee: '0x98118cb4',
      marketingFee: '0x6b67c4df',
      buybackFee: '0x3b2d081c',
      totalFee: '0x1df4ccfc',
    };
    const fees = {};
    for (const [name, sel] of Object.entries(feeSelectors)) {
      try {
        const hex = await rpcCall('eth_call', [{ to: SNUT, data: sel }, 'latest']);
        if (hex && hex !== '0x') fees[name] = Number(hexToBigInt(hex));
      } catch {}
      await new Promise(r => setTimeout(r, 150));
    }
    // rewardsFee = totalFee - liquidity - marketing - buyback (if not directly readable)
    if (fees.totalFee != null && fees.liquidityFee != null && fees.marketingFee != null && fees.buybackFee != null) {
      fees.rewardsFee = fees.totalFee - fees.liquidityFee - fees.marketingFee - fees.buybackFee;
    }
    data.fees = fees; // values in basis points (e.g. 150 = 1.5%)
    
    // 16. Balancer pool — use getPoolTokens on Vault for per-pool balances
    const BALANCER_VAULT = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';
    const BALANCER_POOL_ID = '0x2a5757b60987ff10385de1d4d923792f6fdcfff100010000000000000000019e';
    const GET_POOL_TOKENS = '0xf94d4668';
    const CBETH_ADDR = '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22'; // cbETH on Base (actual pool token)
    const CBTC_ADDR = '0xcBB7C0000aB88B473b1f5aFd9ef808440eed33bf';
    const balDecimalsMap = {};
    balDecimalsMap[CBETH_ADDR.toLowerCase()] = 1e18;
    balDecimalsMap[SNUT.toLowerCase()] = SNUT_DECIMALS;
    balDecimalsMap[NUT.toLowerCase()] = NUT_DECIMALS;
    balDecimalsMap[CBTC_ADDR.toLowerCase()] = 1e8;
    try {
      const poolTokensHex = await rpcCall('eth_call', [{ to: BALANCER_VAULT, data: GET_POOL_TOKENS + BALANCER_POOL_ID.slice(2) }, 'latest']);
      if (poolTokensHex && poolTokensHex !== '0x' && poolTokensHex.length >= 10) {
        const hex = poolTokensHex.slice(2);
        const tokensOffset = parseInt(hex.slice(0, 64), 16) * 2; // byte offset to hex offset
        const balancesOffset = parseInt(hex.slice(64, 128), 16) * 2;
        const arrLen = parseInt(hex.slice(tokensOffset, tokensOffset + 64), 16);
        const balLen = parseInt(hex.slice(balancesOffset, balancesOffset + 64), 16);
        const balBalances = {};
        for (let i = 0; i < arrLen && i < balLen; i++) {
          // Address is stored right-padded in a 32-byte word — take LAST 40 hex chars of the 64-char slot
          const slotStart = tokensOffset + 64 + i * 64;
          const addr = '0x' + hex.slice(slotStart + 24, slotStart + 64).toLowerCase();
          const balHex = hex.slice(balancesOffset + 64 + i * 64, balancesOffset + 64 + (i + 1) * 64);
          const dec = balDecimalsMap[addr] || 1e18;
          balBalances[addr] = Number(BigInt('0x' + balHex)) / dec;
        }
        data.balancerBalances = {
          cbETH: balBalances[CBETH_ADDR.toLowerCase()] || 0,
          SNUT: balBalances[SNUT.toLowerCase()] || 0,
          NUT: balBalances[NUT.toLowerCase()] || 0,
          cbBTC: balBalances[CBTC_ADDR.toLowerCase()] || 0,
        };
      }
    } catch { data.balancerBalances = { cbETH: 0, SNUT: 0, NUT: 0, cbBTC: 0 }; }
    
    return data;
  });
}

export { SNUT, NUT, DEAD, SNUT_ETH_POOL, SNUT_NUT_POOL, META_POOL };
