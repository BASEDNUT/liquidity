// pNUT Data API — returns Balancer basket composition with live constituent data
// Reuses RPC pattern from tokenDataSources.js fetchBalancerPoolRPC

const PNUT_BPT_ADDRESS = '0x2a5757b60987ff10385de1d4d923792f6fdcfff1';
const VAULT_ADDRESS = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';
const PNUT_POOL_ID = '0x2a5757b60987ff10385de1d4d923792f6fdcfff100010000000000000000019e';

// Token metadata for pool constituents
const TOKEN_META = {
  '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22': { symbol: 'cbETH', decimals: 18, name: 'Coinbase ETH', color: '#4A90D9' },
  '0xac130701aa31c284c36609e2489f150f419ad7ad': { symbol: 'SNUT', decimals: 9, name: 'Staked NUT', color: '#FF6B35' },
  '0xb8de15fb529d98c93c749de63c749d48d25a30df': { symbol: 'NUT', decimals: 18, name: 'Based NUT', color: '#8B5A2B' },
  '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf': { symbol: 'cbBTC', decimals: 8, name: 'Coinbase BTC', color: '#F7931A' },
};

async function rpcCall(method, params, retries = 2) {
  const rpcUrl = process.env.BASE_RPC_URL || process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org';
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.result) return json.result;
        if (json.error) throw new Error(json.error.message);
      }
    } catch (e) {
      if (attempt === retries) throw e;
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  return null;
}

async function fetchTokenPrice(address) {
  const llamaKey = `base:${address.toLowerCase()}`;
  try {
    const res = await fetch(`https://coins.llama.fi/prices/current/${llamaKey}`);
    if (res.ok) {
      const json = await res.json();
      const price = json?.coins?.[llamaKey]?.price;
      if (price != null && price > 0) return price;
    }
  } catch {}
  // Fallback: GeckoTerminal
  try {
    const res = await fetch(`https://api.geckoterminal.com/api/v2/networks/base/tokens/${address}`, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      const price = json?.data?.attributes?.price_usd;
      if (price != null) return parseFloat(price);
    }
  } catch {}
  return null;
}

export default async function handler(req, res) {
  try {
    // Fetch BPT total supply and pool tokens in parallel
    const [supplyResult, poolTokensResult] = await Promise.all([
      rpcCall('eth_call', [{ to: PNUT_BPT_ADDRESS, data: '0x18160ddd' }, 'latest']),
      rpcCall('eth_call', [{ to: VAULT_ADDRESS, data: '0xf94d4668' + PNUT_POOL_ID.slice(2) }, 'latest']),
    ]);

    if (!poolTokensResult || poolTokensResult === '0x') {
      return res.status(500).json({ error: 'Failed to fetch pool data' });
    }

    // Parse total supply
    const totalSupplyRaw = supplyResult ? BigInt(supplyResult) : 0n;
    const totalSupply = Number(totalSupplyRaw) / 1e18;

    // Parse getPoolTokens result
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

    // Fetch constituent prices
    const constituents = [];
    let totalValue = 0;

    for (let i = 0; i < tokens.length; i++) {
      const addr = tokens[i].toLowerCase();
      const meta = TOKEN_META[addr] || { symbol: 'UNKNOWN', decimals: 18, name: addr, color: '#888' };
      const humanBalance = Number(balances[i]) / (10 ** meta.decimals);
      const price = await fetchTokenPrice(addr);
      const value = (price != null && price > 0) ? humanBalance * price : 0;
      totalValue += value;

      constituents.push({
        address: tokens[i],
        symbol: meta.symbol,
        name: meta.name,
        color: meta.color,
        decimals: meta.decimals,
        balance: humanBalance,
        price: price,
        value: value,
        targetWeight: 25, // All 4 tokens target 25%
      });
    }

    // Calculate live weights
    constituents.forEach(c => {
      c.liveWeight = totalValue > 0 ? (c.value / totalValue) * 100 : 0;
      c.weightDrift = c.liveWeight - c.targetWeight;
    });

    const bptPrice = totalSupply > 0 ? totalValue / totalSupply : 0;
    const nav = bptPrice; // For weighted pools, BPT price = NAV

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json({
      source: 'rpc',
      pnut: {
        bptAddress: PNUT_BPT_ADDRESS,
        poolId: PNUT_POOL_ID,
        bptPrice: bptPrice,
        nav: nav,
        totalLiquidity: totalValue,
        totalSupply: totalSupply,
        constituents: constituents,
        lastCheckedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('pNUT data fetch error:', error);
    res.status(500).json({ error: error.message });
  }
}
