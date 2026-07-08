// NUT On-Chain Data Fetcher
// Fetches deep NUT ecosystem data: state distribution, pool balances, bonding curve locks
// All data is live from Base RPC — no hard-coded numbers

const RPC_URLS = [
  'https://mainnet.base.org',
  'https://base.publicnode.com',
];

// Key addresses
const NUT = '0xb8de15fb529d98c93c749de63c749d48d25a30df';
const SNUT = '0xac130701aa31c284c36609e2489f150f419ad7ad';
const DEAD = '0x000000000000000000000000000000000000dEaD';
const NUT_WETH_V3 = '0xe3ce00e2ed742b142c15eedc208657dd22aa987e';
const NUT_WETH_V2 = '0x997bad8e9f5c34d5e9784caaa8a554a5e6192f53';
const SNUT_NUT_AERO = '0x893faaa7baf7a8247fc7142afb28e13d51a5aae8';
const NUT_AERO_AERO = '0x38630fede5e2032652640d98b2d3f9c6296eea5d';
const NUT_CBTC_AERO = '0x15385c9281bc12d2e9bf5c081621944b0ee2acca';
const BALANCER_POOL = '0x2a5757b60987ff10385de1d4d923792f6fdcfff1';
const BALANCER_VAULT = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';
const BALANCER_POOL_ID = '0x2a5757b60987ff10385de1d4d923792f6fdcfff100010000000000000000019e';
const NUTINO = '0x30421e2d18dFF60B298eEF427cF868cA65f1476B';
const SALT = '0x1EDe2AFC985F6D7aEb3F4c84B95A103c00D5dE81';
const WETH = '0x4200000000000000000000000000000000000006';
const AERO = '0x940181a94A35A4569E4529A3CDfB74e38FD98631';
const CBTC = '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf';
const CBETH = '0x2Ae3F1Ec7F1F5012CfEab0185bFc7Aa3cf0cDc22';

// Function selectors
const BALANCE_OF = '0x70a08231';
const TOTAL_SUPPLY = '0x18160ddd';
const GET_RESERVES = '0x0902f1ac';
const DECIMALS = '0x313ce567';
const GET_POOL_TOKENS = '0xf94d4668';

// Decimals
const NUT_DECIMALS = 1e18;
const SNUT_DECIMALS = 1e9;
const ETH_DECIMALS = 1e18;
const CBTC_DECIMALS = 1e8;

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

export async function fetchNutData() {
  return withStaleCache(async () => {
    const now = new Date().toISOString();
    const data = { lastCheckedAt: now };

    // 1. NUT totalSupply
    const nutSupplyHex = await rpcCall('eth_call', [{ to: NUT, data: TOTAL_SUPPLY }, 'latest']);
    data.nutTotalSupply = Number(hexToBigInt(nutSupplyHex)) / NUT_DECIMALS;

    // 2. NUT decimals
    const nutDecHex = await rpcCall('eth_call', [{ to: NUT, data: DECIMALS }, 'latest']);
    data.nutDecimals = Number(hexToBigInt(nutDecHex));

    await new Promise(r => setTimeout(r, 200));

    // 3. NUT balance in each DEX pool
    const dexPools = [
      { key: 'nutWethV3', addr: NUT_WETH_V3, label: 'NUT/wETH V3', platform: 'Uniswap V3' },
      { key: 'nutWethV2', addr: NUT_WETH_V2, label: 'NUT/wETH V2', platform: 'Uniswap V2' },
      { key: 'snutNutAero', addr: SNUT_NUT_AERO, label: 'SNUT/NUT', platform: 'Aerodrome' },
      { key: 'nutAeroAero', addr: NUT_AERO_AERO, label: 'NUT/AERO', platform: 'Aerodrome' },
      { key: 'nutCbtcAero', addr: NUT_CBTC_AERO, label: 'NUT/cbBTC', platform: 'Aerodrome' },
    ];
    data.dexPools = [];
    for (const pool of dexPools) {
      const balHex = await rpcCall('eth_call', [{ to: NUT, data: balanceOfData(NUT, pool.addr) }, 'latest']);
      const nutBal = Number(hexToBigInt(balHex)) / NUT_DECIMALS;
      data.dexPools.push({ ...pool, nutBalance: nutBal });
      await new Promise(r => setTimeout(r, 150));
    }

    // 4. Pool reserves for each DEX pool (V2 + Aerodrome — V3 will fail gracefully)
    for (let i = 0; i < data.dexPools.length; i++) {
      const pool = data.dexPools[i];
      try {
        const resHex = await rpcCall('eth_call', [{ to: pool.addr, data: GET_RESERVES }, 'latest']);
        if (resHex && resHex !== '0x' && resHex.length >= 194) {
          const r0 = Number(hexToBigInt('0x' + resHex.slice(2, 66)));
          const r1 = Number(hexToBigInt('0x' + resHex.slice(66, 130)));
          // Resolve which reserve is NUT by comparing raw balance
          const rawNut = Number(hexToBigInt(await rpcCall('eth_call', [{ to: NUT, data: balanceOfData(NUT, pool.addr) }, 'latest'])));
          const diff0 = Math.abs(r0 - rawNut);
          const diff1 = Math.abs(r1 - rawNut);
          if (diff0 <= diff1) {
            data.dexPools[i].reserveNut = r0 / NUT_DECIMALS;
            data.dexPools[i].reserveOther = r1;
            data.dexPools[i].reserveOtherRaw = r1;
          } else {
            data.dexPools[i].reserveNut = r1 / NUT_DECIMALS;
            data.dexPools[i].reserveOther = r0;
            data.dexPools[i].reserveOtherRaw = r0;
          }
        }
      } catch {}
      await new Promise(r => setTimeout(r, 150));
    }

    // 5. Balancer pool — use getPoolTokens on Vault for per-pool balances
    const balDecimalsMap = {};
    balDecimalsMap[CBETH.toLowerCase()] = 1e18;
    balDecimalsMap[SNUT.toLowerCase()] = SNUT_DECIMALS;
    balDecimalsMap[NUT.toLowerCase()] = NUT_DECIMALS;
    balDecimalsMap[CBTC.toLowerCase()] = CBTC_DECIMALS;
    try {
      const poolTokensHex = await rpcCall('eth_call', [{ to: BALANCER_VAULT, data: GET_POOL_TOKENS + BALANCER_POOL_ID.slice(2) }, 'latest']);
      if (poolTokensHex && poolTokensHex !== '0x' && poolTokensHex.length >= 10) {
        const hex = poolTokensHex.slice(2);
        const tokensOffset = parseInt(hex.slice(0, 64), 16) * 2;
        const balancesOffset = parseInt(hex.slice(64, 128), 16) * 2;
        const arrLen = parseInt(hex.slice(tokensOffset, tokensOffset + 64), 16);
        const balLen = parseInt(hex.slice(balancesOffset, balancesOffset + 64), 16);
        const balBalances = {};
        for (let i = 0; i < arrLen && i < balLen; i++) {
          const slotStart = tokensOffset + 64 + i * 64;
          const addr = '0x' + hex.slice(slotStart + 24, slotStart + 64).toLowerCase();
          const balHex = hex.slice(balancesOffset + 64 + i * 64, balancesOffset + 64 + (i + 1) * 64);
          const dec = balDecimalsMap[addr] || 1e18;
          balBalances[addr] = Number(BigInt('0x' + balHex)) / dec;
        }
        data.balancerBalances = {
          cbETH: balBalances[CBETH.toLowerCase()] || 0,
          SNUT: balBalances[SNUT.toLowerCase()] || 0,
          NUT: balBalances[NUT.toLowerCase()] || 0,
          cbBTC: balBalances[CBTC.toLowerCase()] || 0,
        };
      }
    } catch { data.balancerBalances = { cbETH: 0, SNUT: 0, NUT: 0, cbBTC: 0 }; }

    await new Promise(r => setTimeout(r, 200));

    // 6. SNUT totalSupply
    const snutSupplyHex = await rpcCall('eth_call', [{ to: SNUT, data: TOTAL_SUPPLY }, 'latest']);
    data.snutTotalSupply = Number(hexToBigInt(snutSupplyHex)) / SNUT_DECIMALS;

    await new Promise(r => setTimeout(r, 200));

    // 7. NUTINO totalSupply
    const nutinoSupplyHex = await rpcCall('eth_call', [{ to: NUTINO, data: TOTAL_SUPPLY }, 'latest']);
    data.nutinoTotalSupply = Number(hexToBigInt(nutinoSupplyHex)) / NUT_DECIMALS;

    await new Promise(r => setTimeout(r, 200));

    // 8. SALT totalSupply
    const saltSupplyHex = await rpcCall('eth_call', [{ to: SALT, data: TOTAL_SUPPLY }, 'latest']);
    data.saltTotalSupply = Number(hexToBigInt(saltSupplyHex)) / NUT_DECIMALS;

    await new Promise(r => setTimeout(r, 200));

    // 9. NUT balance of NUTINO bonding curve (try token contract itself)
    try {
      const nutinoNutHex = await rpcCall('eth_call', [{ to: NUT, data: balanceOfData(NUT, NUTINO) }, 'latest']);
      data.nutinoLockedNut = Number(hexToBigInt(nutinoNutHex)) / NUT_DECIMALS;
    } catch { data.nutinoLockedNut = null; }

    await new Promise(r => setTimeout(r, 200));

    // 10. NUT balance of SALT bonding curve (try token contract itself)
    try {
      const saltNutHex = await rpcCall('eth_call', [{ to: NUT, data: balanceOfData(NUT, SALT) }, 'latest']);
      data.saltLockedNut = Number(hexToBigInt(saltNutHex)) / NUT_DECIMALS;
    } catch { data.saltLockedNut = null; }

    await new Promise(r => setTimeout(r, 200));

    // 11. Dead address NUT balance
    const deadNutHex = await rpcCall('eth_call', [{ to: NUT, data: balanceOfData(NUT, DEAD) }, 'latest']);
    data.deadNutBalance = Number(hexToBigInt(deadNutHex)) / NUT_DECIMALS;

    return data;
  });
}

export { NUT, SNUT, DEAD, NUT_WETH_V3, NUT_WETH_V2, SNUT_NUT_AERO, NUT_AERO_AERO, NUT_CBTC_AERO, BALANCER_POOL, NUTINO, SALT };
