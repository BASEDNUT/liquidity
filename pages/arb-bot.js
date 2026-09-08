import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { Box, Typography, Grid, IconButton, Collapse } from '@mui/material';
import { ExpandMore, ExpandLess, ContentCopy } from '@mui/icons-material';

// ═══════════════════════════════════════════════════════════════
// ECOSYSTEM MODEL — TECHNICAL FACTS FOR PRICING AGENTS
// ═══════════════════════════════════════════════════════════════
const MODEL_NOTES = [
  { note: 'NUT total supply is exactly 1 whole token (fixed at deployment — no mint, no burn, no admin on the root contract). Whole-token price equals fully-diluted valuation by construction; standard market-cap APIs are not meaningful for it.', severity: 'info' },
  { note: 'The primary NUT venue (NUT/WETH Uniswap V3) is not indexed by DEX Screener. Price it on-chain via slot0() against Base RPC.', severity: 'high' },
  { note: 'pNUT pool contracts and their ERC-20 are the same address — the Balancer Pool Token (BPT) pattern. This applies to pNUT Quad (V2) and pNUT Whorl (V3).', severity: 'info' },
  { note: 'Decimals vary across the ecosystem: SNUT 9, cbBTC 8, USDC 6, EURC 6, NVDAc and AAPLc 8 — all others 18. Always read decimals() before pricing.', severity: 'high' },
  { note: 'Mint Club curves price mint (buy) and burn (sell) separately; the buy/sell spread is protocol revenue by design and varies with curve position.', severity: 'info' },
  { note: 'Always verify token0()/token1() ordering before deriving prices from reserves — orderings differ per pool.', severity: 'high' },
  { note: 'Balancer V2 uses a singleton vault: pNUT Quad constituents sit in the Vault (0xBA122…F2C8), not in the pool contract. balanceOf(pNUT) is not the basket — use getPoolTokens(poolId).', severity: 'high' },
  { note: 'The NUT/WETH Uniswap V3 pool is a 1% fee tier (fee=10000). Include it in any profitability model. Read via fee().', severity: 'info' },
  { note: 'Aerodrome pools use a proxy pattern that does not implement token1() — the selector reverts. Use token0() plus the pair listing here to resolve ordering.', severity: 'high' },
  { note: 'Base public RPCs rate-limit aggressively. Rotate endpoints (mainnet.base.org, base.publicnode.com, 1rpc.io/base) with backoff.', severity: 'medium' },
  { note: 'wNUT is a 1:1 wrapped NUT (ERC-20 wrapper, audited, no admin key). Wrapping does not change NUT supply — wNUT represents NUT already held by the wrapper.', severity: 'info' },
];

// ═══════════════════════════════════════════════════════════════
// VERIFIED TOKEN REGISTRY — ALL ADDRESSES SNAPSHOT-VERIFIED ON BASE
// ═══════════════════════════════════════════════════════════════
const TOKEN_GROUPS = [
  {
    group: 'Core Ecosystem Tokens',
    tokens: [
      { emoji: '🥜', name: 'NUT', address: '0xb8de15fb529d98c93c749de63c749d48d25a30df', decimals: 18, role: 'Root token. Fixed supply of exactly 1 whole token — no mint, no burn, no admin. Price = FDV by construction. Base asset for all Mint Club curves.', href: '/token/nut' },
      { emoji: '📦', name: 'wNUT', address: '0xBA5ED46e31F80dafF307cbf60bd422a6f62E3dd3', decimals: 18, role: 'ERC-20 wrapper for NUT, 1:1 backed, no admin key (audit passed). Opens NUT to Balancer v3 composability via Sunflower Grove.', href: '/token/wnut' },
      { emoji: '🥥', name: 'SNUT', address: '0xAC130701aa31c284c36609E2489f150F419AD7AD', decimals: 9, role: 'Reward-position token — holding SNUT earns NUT. 1% fee per transfer, split four ways (liquidity, manager, buyback/burn, NUT rewards). Supply decreases monotonically.', href: '/token/snut' },
      { emoji: '🧺', name: 'pNUT (Quad)', address: '0x2a5757b60987ff10385de1d4d923792f6fdcfff1', decimals: 18, role: 'Balancer V2 WeightedPool BPT — 25% each cbETH, cbBTC, NUT, SNUT. Pool and token share one address. Mint by depositing the basket, redeem to withdraw.', href: '/token/pnut' },
      { emoji: '🌸', name: 'pNUT (Whorl)', address: '0x252b1E49D1d1E42657d028703e8c37fe5B5cACF5', decimals: 18, role: 'Balancer V3 WeightedPool BPT — 25% each cbETH, SNUT, wNUT, cbBTC. Immutable deployment (all roles renounced).', href: '/sunflower-grove' },
      { emoji: '🧂', name: 'SALT', address: '0x1EDe2AFC985F6D7aEb3F4c84B95A103c00D5dE81', decimals: 18, role: 'Mint Club bonding-curve token backed by NUT. Trades on Aerodrome vs USDC and on a Balancer v3 reCLAMM pool vs NUT.', href: '/token/salt' },
      { emoji: '🍫', name: 'NUTINO', address: '0x30421e2d18dFF60B298eEF427cF868cA65f1476B', decimals: 18, role: 'Mint Club bonding-curve token backed by NUT. Trades on Uniswap V2 vs cbBTC.', href: '/token/nutino' },
      { emoji: '💻', name: 'PIPS', address: '0x3f2327221dd4f0bae660172606d6b288a1cf8ad9', decimals: 18, role: 'Compute token for Pipshell, the ecosystem DevOps agent — trading fees fund its servers. 1%/1% transfer tax on the official Virtuals pair only; external venues untaxed.', href: '/token/pips' },
      { emoji: '🌰', name: 'DEEZ', address: '0x477B096A5f3321B3a1a300a025104be5f82f0092', decimals: 18, role: 'Retired memorabilia — the first nested-token experiment. 70% of the 10,000 supply burned; not used in current products. Listed for completeness.', href: null },
    ],
  },
  {
    group: 'Quote & Reserve Assets',
    tokens: [
      { emoji: '⚡', name: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18, role: 'Wrapped ETH. Quote token for the NUT and SNUT pools.', href: null },
      { emoji: '🛡️', name: 'AERO', address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', decimals: 18, role: 'Aerodrome token. Quote for the NUT/AERO pool.', href: null },
      { emoji: '₿', name: 'cbBTC', address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', decimals: 8, role: 'Coinbase Wrapped BTC. Quote for NUT/cbBTC and NUTINO/cbBTC; gtBTC scion.', href: null },
      { emoji: '⟠', name: 'cbETH', address: '0x2Ae3F1Ec7F1f5012CFEab0185bfc7aa3cf0DEc22', decimals: 18, role: 'Coinbase Wrapped Staked ETH. pNUT basket constituent; gtETH scion.', href: null },
      { emoji: '💵', name: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, role: 'USD stablecoin. Quote for SALT/USDC and PIPS/USDC; gtFX scion.', href: null },
      { emoji: '💧', name: 'wstETH', address: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452', decimals: 18, role: 'Lido wrapped staked ETH (Base). gtETH scion.', href: null },
      { emoji: '🪙', name: 'tBTC', address: '0x236aa50979D5f3De3Bd1Eeb40E81137F22ab794b', decimals: 18, role: 'Threshold tBTC (Base). gtBTC scion.', href: null },
      { emoji: '💶', name: 'EURC', address: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42', decimals: 6, role: 'Circle euro stablecoin. gtFX scion.', href: null },
      { emoji: '📈', name: 'NVDAc', address: '0xb20000000000000000000078ee7ce2fE4908108C', decimals: 8, role: 'Tokenized NVIDIA stock (Coinbase B20). gtSIL scion.', href: null },
      { emoji: '🍎', name: 'AAPLc', address: '0xb200000000000000000000C2e324d24d7eEcd1fb', decimals: 8, role: 'Tokenized Apple stock (Coinbase B20). gtSIL scion.', href: null },
      { emoji: '🧠', name: 'VVV', address: '0xacfE6019Ed1A7Dc6f7B508C02d1b04ec88cC21bf', decimals: 18, role: 'Venice Token. gtINF scion.', href: null },
      { emoji: '🔮', name: 'DIEM', address: '0xF4d97F2da56e8c3098f3a8D538DB630A2606a024', decimals: 18, role: 'Venice compute asset. gtINF scion.', href: null },
      { emoji: '🤖', name: 'VIRTUAL', address: '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b', decimals: 18, role: 'Virtuals Protocol token. gtAGT scion.', href: null },
      { emoji: '⚙️', name: 'MOR', address: '0x7431aDa8a591C955a994a21710752EF9b882b8e3', decimals: 18, role: 'Morpheus AI token. gtAGT scion.', href: null },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// VERIFIED POOL REGISTRY — GROUPED BY VENUE
// ═══════════════════════════════════════════════════════════════
const POOL_GROUPS = [
  {
    group: 'NUT Venues',
    pools: [
      { name: 'NUT/WETH', platform: 'Uniswap V3', address: '0xe3ce00e2ed742b142c15eedc208657dd22aa987e', type: 'V3', pair: 'WETH/NUT', notes: 'Primary NUT venue. 1% fee tier. Read via slot0(); not indexed by DEX Screener.' },
      { name: 'NUT/WETH', platform: 'Uniswap V2', address: '0x997bad8e9f5c34d5e9784caaa8a554a5e6192f53', type: 'V2', pair: 'WETH/NUT', notes: 'Secondary NUT venue. Read via getReserves().' },
      { name: 'NUT/WETH', platform: 'Custom CL', address: '0x0416a0d0Ce17F23DAA9D3f852470fe91f0a69c71', type: 'CL', pair: 'WETH/NUT', notes: 'Concentrated pool from the custom CL factory (0xade6…716a). Read via slot0().' },
      { name: 'NUT/AERO', platform: 'Aerodrome', address: '0x38630fede5e2032652640d98b2d3f9c6296eea5d', type: 'V2', pair: 'AERO/NUT', notes: 'AERO-denominated NUT price. token0=AERO, token1=NUT.' },
      { name: 'NUT/cbBTC', platform: 'Aerodrome', address: '0x15385c9281bc12d2e9bf5c081621944b0ee2acca', type: 'V2', pair: 'NUT/cbBTC', notes: 'BTC-denominated NUT price. cbBTC has 8 decimals.' },
    ],
  },
  {
    group: 'SNUT Venues',
    pools: [
      { name: 'SNUT/NUT', platform: 'Aerodrome', address: '0x893faaa7baf7a8247fc7142afb28e13d51a5aae8', type: 'V2', pair: 'SNUT/NUT', notes: 'Primary SNUT venue. Dividend-eligible pair — NUT rewards accrue here (see Keeper strategy).' },
      { name: 'SNUT/WETH', platform: 'Uniswap V2', address: '0xB22895d2ee6e29395F30Ec47c8D9FE0d55355AE1', type: 'V2', pair: 'WETH/SNUT', notes: 'Secondary SNUT venue.' },
      { name: 'SNUT/ETH-LP', platform: 'Uniswap V2 (meta)', address: '0x82bbadb9d6b2c0a59ed01809e30323f89f6faa1c', type: 'V2', pair: 'SNUT/ETH-LP/WETH', notes: 'Meta-pool — SNUT/WETH LP tokens traded against WETH. Secondary market for liquidity claims.' },
    ],
  },
  {
    group: 'Nested-Token Venues',
    pools: [
      { name: 'NUTINO/cbBTC', platform: 'Uniswap V2', address: '0xeafde67d470480d14139e3d91164c158b82b38e2', type: 'V2', pair: 'NUTINO/cbBTC', notes: 'Primary NUTINO DEX venue. cbBTC has 8 decimals.' },
      { name: 'SALT/USDC', platform: 'Aerodrome', address: '0x64ca0b147f625007b6f082abbb3ba217930eccb2', type: 'V2', pair: 'SALT/USDC', notes: 'Primary SALT DEX venue. USDC has 6 decimals.' },
      { name: 'NUT/SALT', platform: 'Balancer v3 reCLAMM', address: '0x4f924d20773D21a80E58ba929613BeB74f51BeD6', type: 'reCLAMM', pair: 'NUT/SALT', notes: 'reCLAMM — recently-liquidity-concentrated AMM. SALT build-out venue.' },
      { name: 'PIPS/NUT', platform: 'Aerodrome Slipstream CL', address: '0x7f8e532cf1be9ed688adb9e6585bc69f017201b5', type: 'CL', pair: 'PIPS/NUT', notes: 'Concentrated liquidity, 1% fee. Read via slot0(). PIPS transfer tax is not registered here — untaxed on this venue.' },
      { name: 'PIPS/USDC', platform: 'Balancer v3 reCLAMM', address: '0xb19e3af68BB307369e8772A9E157431FcFE9Dd44', type: 'reCLAMM', pair: 'PIPS/USDC', notes: 'reCLAMM on Balancer v3, 1% fee.' },
    ],
  },
  {
    group: 'Index Baskets (Balancer)',
    pools: [
      { name: 'pNUT Quad', platform: 'Balancer V2 WeightedPool', address: '0x2a5757b60987ff10385de1d4d923792f6fdcfff1', type: 'Balancer', pair: 'cbETH/cbBTC/NUT/SNUT', notes: '25% each. Pool = BPT address. Read basket via getPoolTokens(poolId) on the V2 Vault. Dividend-exempt.' },
      { name: 'pNUT Whorl', platform: 'Balancer V3 WeightedPool', address: '0x252b1E49D1d1E42657d028703e8c37fe5B5cACF5', type: 'Balancer', pair: 'cbETH/SNUT/wNUT/cbBTC', notes: '25% each. Immutable — all roles renounced. Live in the V3 Vault; composition via Balancer API.' },
    ],
  },
  {
    group: 'Sunflower Grove Grafts (Balancer v3, 20% wNUT rootstock + 40/40 scions)',
    pools: [
      { name: 'gtINF', platform: 'Balancer v3 WeightedPool', address: '0x6a0a1B7428d543524592eD22023A09BdE05aA466', type: 'Balancer', pair: 'wNUT/VVV/DIEM', notes: 'Inference Twin Graft — AI-inference economics on NUT rootstock. Batch I.' },
      { name: 'gtAGT', platform: 'Balancer v3 WeightedPool', address: '0x5dA95cC31C840Fd33180e4C7f879e3F3d8Eca200', type: 'Balancer', pair: 'wNUT/VIRTUAL/MOR', notes: 'Agent Twin Graft — agent-launchpad rails on NUT rootstock. Batch I.' },
      { name: 'gtETH', platform: 'Balancer v3 WeightedPool', address: '0xd156d51219B3a7A590670d655E8740Ad404e8835', type: 'Balancer', pair: 'wNUT/cbETH/wstETH', notes: 'Ether Twin Graft — staked and liquid ether scions. Batch I.' },
      { name: 'gtBTC', platform: 'Balancer v3 WeightedPool', address: '0xb2a63935e1391Ee49E5cfB6cc4f184C285fE29b4', type: 'Balancer', pair: 'wNUT/cbBTC/tBTC', notes: 'Bitcoin Twin Graft. Batch I.' },
      { name: 'gtFX', platform: 'Balancer v3 WeightedPool', address: '0x1cCB8c61b62b9c7a9d4e66C9c824C1539B8b1f2E', type: 'Balancer', pair: 'wNUT/USDC/EURC', notes: 'FX Twin Graft — dollar/euro scions. Batch I.' },
      { name: 'gtSIL', platform: 'Balancer v3 WeightedPool', address: '0xA669275f92e49aff80aBA7AaD86E5AFDDe3540B0', type: 'Balancer', pair: 'wNUT/NVDAc/AAPLc', notes: 'Silicon Twin Graft — tokenized-equity scions. Batch I.' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// INFRASTRUCTURE & NFT COLLECTIONS
// ═══════════════════════════════════════════════════════════════
const INFRA = [
  { name: 'Balancer V2 Vault', address: '0xBA12222222228d8Ba445958a75a0704d566BF2C8', purpose: 'Singleton vault holding all V2 pool tokens. Read basket composition via getPoolTokens(poolId).' },
  { name: 'Balancer V3 Vault', address: '0xBA1333333333a1BA1108E8412F11850A5C319ba9', purpose: 'Singleton vault for V3 pools — grafts, Whorl, and reCLAMM venues.' },
  { name: 'Balancer V3 WeightedPoolFactory', address: '0xBDbADc891BB95DEE80eBC491699228EF0f7D6fF1', purpose: 'Factory that created the grafts and the pNUT Whorl.' },
  { name: 'Balancer V3 Router', address: '0x3f170631ed9821Ca51A59D996aB095162438DC10', purpose: 'Entry point for V3 pool initialization and addLiquidityProportional.' },
  { name: 'Aerodrome Factory', address: '0x420DD381b31aEf6683db6B902084cB0FFECe40Da', purpose: 'Factory for the Aerodrome V2 pairs listed above.' },
  { name: 'Custom CL Factory', address: '0xade65c38cd4849adba595a4323a8c7ddfe89716a', purpose: 'Custom concentrated-liquidity factory — created the NUT/WETH CL pool.' },
  { name: 'Mint Club Bond (Lock)', address: '0xc5a076cad94176c2996b32d8466be1ce757faa27', purpose: 'Holds the NUT reserves backing all Mint Club bonding curves (SALT, NUTINO).' },
  { name: 'Dead Address (Burn Sink)', address: '0x000000000000000000000000000000000000dEaD', purpose: 'Burn sink. SNUT held here keeps earning NUT rewards; NUT sent here is burned; LP burned here cannot be removed.' },
];

const NFTS = [
  { emoji: '🌰', name: 'PNUTS', label: 'Peanut War Generals', address: '0x794fcD89357C1CcF04a1a9A441ad4dB2Cd5EE387', supply: '251', sudoswap: '0x262bEaa785a0eF65f5D9C1b8BA5c41980D087ff3' },
  { emoji: '🌰', name: 'ALMD', label: 'Almond War Generals', address: '0x1A160456005AED47994E1c13C9bc31F274413927', supply: '424', sudoswap: '0x308C9BC0546723d6e4905c971cd34feBF1f94031' },
  { emoji: '🧂', name: 'SALMD', label: 'Almond Soldiers', address: '0x1E0f80529593185C021043ffcbfDcB8f4279C649', supply: '6,238', sudoswap: '0xeE7243F0E02e5890c6415B5CbAe58e0D0fb758a5' },
  { emoji: '⚔️', name: 'PNUTRMY', label: 'Peanut Soldiers', address: '0xF075300b8C2EF500d8Ce4f783F910C500B9A3512', supply: '5,013', sudoswap: null },
];

const pNUT_POOL_ID = '0x2a5757b60987ff10385de1d4d923792f6fdcfff100010000000000000000019e';

// ═══════════════════════════════════════════════════════════════
// READ REFERENCE — FUNCTION SELECTORS (PRICING SUBSET, NOT FULL ABI)
// ═══════════════════════════════════════════════════════════════
const FUNCTION_SIGS = [
  { sig: '0x3850c7bd', name: 'slot0()', desc: 'Uniswap V3 / CL pools — returns sqrtPriceX96 and tick. Price derivation for concentrated pools.', returns: 'uint160 sqrtPriceX96, int24 tick, …' },
  { sig: '0x0902f1ac', name: 'getReserves()', desc: 'Uniswap V2 / Aerodrome — returns reserve0 and reserve1 for price derivation.', returns: 'uint112, uint112, uint32' },
  { sig: '0x0dfe1681', name: 'token0()', desc: 'Pool — returns token0. Resolve price direction before dividing reserves.', returns: 'address' },
  { sig: '0xd21220a7', name: 'token1()', desc: 'Pool — returns token1. Reverts on Aerodrome proxies; use the pair listing above instead.', returns: 'address' },
  { sig: '0x70a08231', name: 'balanceOf(address)', desc: 'ERC20/ERC721 — token balance of an address. Used for pool TVL and basket composition.', returns: 'uint256', args: '32-byte padded address' },
  { sig: '0x18160ddd', name: 'totalSupply()', desc: 'ERC20/ERC721 — total token supply. Used for NAV per share and NFT minted counts.', returns: 'uint256' },
  { sig: '0x313ce567', name: 'decimals()', desc: 'ERC20 — token decimals. SNUT 9, cbBTC 8, USDC/EURC 6, NVDAc/AAPLc 8, others 18.', returns: 'uint8' },
  { sig: '0x95d89b41', name: 'symbol()', desc: 'ERC20 — token symbol. Useful for contract verification.', returns: 'string' },
  { sig: '0x06fdde03', name: 'name()', desc: 'ERC20 — token name string. Useful for verification.', returns: 'string' },
  { sig: '0x1a686502', name: 'liquidity()', desc: 'Uniswap V3 — current concentrated liquidity. Do not use getReserves() on V3 pools.', returns: 'uint128' },
  { sig: '0xddca3f43', name: 'fee()', desc: 'Uniswap V3 — fee tier in hundredths of a bip. NUT/WETH V3 = 10000 (1%).', returns: 'uint24' },
  { sig: '0x9cb8a26a', name: 'getPoolTokens(bytes32)', desc: 'Balancer V2 Vault — returns tokens[], balances[], lastChangeBlock. Use poolId for basket composition.', returns: 'address[], uint256[], uint256' },
];

// ═══════════════════════════════════════════════════════════════
// RPC IMPLEMENTATION — COPY-PASTEABLE PYTHON
// ═══════════════════════════════════════════════════════════════
const CODE_BLOCKS = [
  {
    title: 'Base RPC Helper',
    desc: 'Core eth_call with endpoint rotation and backoff. No Web3 library required.',
    code: [
      'import requests, time',
      '',
      'RPC_ENDPOINTS = [',
      '    "https://mainnet.base.org",',
      '    "https://base.publicnode.com",',
      '    "https://1rpc.io/base",',
      ']',
      '_rpc_index = 0',
      '',
      'def eth_call(to, data, retries=3):',
      '    """JSON-RPC eth_call to Base mainnet with fallback + retry."""',
      '    global _rpc_index',
      '    for attempt in range(retries):',
      '        rpc = RPC_ENDPOINTS[(_rpc_index + attempt) % len(RPC_ENDPOINTS)]',
      '        try:',
      '            resp = requests.post(rpc, json={',
      '                "jsonrpc": "2.0", "id": 1,',
      '                "method": "eth_call",',
      '                "params": [{"to": to, "data": data}, "latest"],',
      '            }, timeout=10)',
      '            return resp.json().get("result", "0x")',
      '        except Exception:',
      '            time.sleep(0.5 * (attempt + 1))',
      '    _rpc_index = (_rpc_index + 1) % len(RPC_ENDPOINTS)',
      '    return "0x"',
    ].join('\n'),
  },
  {
    title: 'Uniswap V3 / CL Price (NUT/WETH)',
    desc: 'Extract price from sqrtPriceX96. Verify token0 to resolve direction; include the fee tier in the effective price.',
    code: [
      'NUT_WETH_V3 = "0xe3ce00e2ed742b142c15eedc208657dd22aa987e"',
      'WETH = "0x4200000000000000000000000000000000000006"',
      '',
      'def get_v3_price(pool):',
      '    slot0 = eth_call(pool, "0x3850c7bd")',
      '    sqrt_px = int(slot0[2:66], 16)',
      '    ratio = (sqrt_px / 2**96) ** 2',
      '    fee = int(eth_call(pool, "0xddca3f43"), 16)',
      '    fee_pct = fee / 1_000_000',
      '    t0 = "0x" + eth_call(pool, "0x0dfe1681")[26:66]',
      '    if t0.lower() == WETH.lower():',
      '        eth_per_nut = 1 / ratio   # token0=WETH -> ratio is NUT per ETH',
      '    else:',
      '        eth_per_nut = ratio',
      '    return eth_per_nut * (1 - fee_pct)  # effective after fee',
      '',
      'eth_usd = requests.get("https://api.coingecko.com/api/v3/simple/price",',
      '    params={"ids": "ethereum", "vs_currencies": "usd"}).json()["ethereum"]["usd"]',
      'print(f"NUT price: ${get_v3_price(NUT_WETH_V3) * eth_usd:,.2f}")',
    ].join('\n'),
  },
  {
    title: 'Uniswap V2 / Aerodrome Reserves',
    desc: 'Reserve-based pricing with token0 verification and correct decimals.',
    code: [
      'def get_reserves(pool):',
      '    r = eth_call(pool, "0x0902f1ac")',
      '    if len(r) >= 130:',
      '        return int(r[2:66], 16), int(r[66:130], 16)',
      '    return None, None',
      '',
      'def get_token0(pool):',
      '    t0 = eth_call(pool, "0x0dfe1681")',
      '    return "0x" + t0[26:66] if len(t0) >= 66 else None',
      '',
      '# Example: NUT/AERO Aerodrome pool — token0=AERO (18d), token1=NUT (18d)',
      'NUT_AERO = "0x38630fede5e2032652640d98b2d3f9c6296eea5d"',
      'AERO = "0x940181a94a35a4569e4529a3cdfb74e38fd98631"',
      'r0, r1 = get_reserves(NUT_AERO)',
      'if get_token0(NUT_AERO).lower() == AERO.lower():',
      '    nut_per_aero = (r1 / 1e18) / (r0 / 1e18)  # token1=NUT over token0=AERO',
      'else:',
      '    nut_per_aero = (r0 / 1e18) / (r1 / 1e18)',
      'print(f"NUT/AERO: {nut_per_aero:.6f} NUT per AERO")',
    ].join('\n'),
  },
  {
    title: 'pNUT Quad Basket & NAV (Balancer V2)',
    desc: 'Basket composition from the singleton Vault. balanceOf(pNUT) is not the basket — query the Vault or use getPoolTokens(poolId).',
    code: [
      'pNUT = "0x2a5757b60987ff10385de1d4d923792f6fdcfff1"',
      'BAL_V2_VAULT = "0xBA12222222228d8Ba445958a75a0704d566BF2C8"',
      'cbETH, cbBTC = "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22", "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf"',
      'NUT, SNUT = "0xb8de15fb529d98c93c749de63c749d48d25a30df", "0xac130701aa31c284c36609e2489f150f419ad7ad"',
      '',
      'def balance_of(token, holder):',
      '    data = "0x70a08231" + "0" * 24 + holder[2:].lower()',
      '    r = eth_call(token, data)',
      '    return int(r, 16) if r and r != "0x" else 0',
      '',
      'def get_pnut_basket():',
      '    return {',
      '        "cbETH": balance_of(cbETH, BAL_V2_VAULT) / 1e18,',
      '        "cbBTC": balance_of(cbBTC, BAL_V2_VAULT) / 1e8,   # 8 decimals',
      '        "NUT":   balance_of(NUT,   BAL_V2_VAULT) / 1e18,',
      '        "SNUT":  balance_of(SNUT,  BAL_V2_VAULT) / 1e9,   # 9 decimals',
      '        "BPT_supply": int(eth_call(pNUT, "0x18160ddd"), 16) / 1e18,',
      '    }',
      '',
      'def calculate_nav(basket, prices):',
      '    total = sum(basket[k] * prices[k] for k in ("cbETH", "cbBTC", "NUT", "SNUT"))',
      '    return total / basket["BPT_supply"]',
    ].join('\n'),
  },
  {
    title: 'wNUT Wrap Ratio (1:1 check)',
    desc: 'The wrapper holds NUT 1:1 against every wNUT. This ratio should always read exactly 1.00 — a core conservation invariant.',
    code: [
      'WNUT = "0xba5ed46e31f80daff307cbf60bd422a6f62e3dd3"',
      'NUT = "0xb8de15fb529d98c93c749de63c749d48d25a30df"',
      '',
      'def balance_of(token, holder):',
      '    data = "0x70a08231" + "0" * 24 + holder[2:].lower()',
      '    r = eth_call(token, data)',
      '    return int(r, 16) if r and r != "0x" else 0',
      '',
      'wnut_supply = balance_of(WNUT, "0x" + "0" * 40)  # placeholder, see below',
      'wnut_supply = int(eth_call(WNUT, "0x18160ddd"), 16) / 1e18',
      'nut_backing = balance_of(NUT, WNUT) / 1e18',
      'print(f"wNUT supply: {wnut_supply}")',
      'print(f"NUT backing: {nut_backing}")',
      'print(f"Backing ratio: {nut_backing / wnut_supply if wnut_supply else float(chr(110) + chr(97) + chr(110)):,.4f}")',
    ].join('\n'),
  },
];

// ═══════════════════════════════════════════════════════════════
// STRATEGY OVERVIEW — HONEST, COMPACT
// ═══════════════════════════════════════════════════════════════
const STRATEGY_GROUPS = [
  {
    group: 'Cross-Venue',
    strategies: [
      {
        id: 1, emoji: '🔄', name: 'NUT Cross-Venue',
        route: 'Uniswap V3 ↔ Uniswap V2 ↔ Aerodrome (NUT/AERO, NUT/cbBTC) ↔ Custom CL',
        verdict: 'Viable — execute only when the measured spread clears fees, gas, and slippage.',
        verdictColor: 'success',
        when: 'After large directional trades on one venue, or sharp quote-token moves (ETH, AERO, BTC).',
        costs: 'V3 1% fee tier, gas, slippage, quote-conversion',
        steps: ['Poll all NUT venues via Base RPC every block (~2s)', 'Normalize to USD via quote-token prices', 'Buy on the cheapest venue, sell on the dearest', 'Verify token0 ordering before dividing reserves'],
        tokens: ['NUT', 'WETH', 'AERO', 'cbBTC'],
      },
      {
        id: 2, emoji: '🥥', name: 'SNUT Cross-Venue',
        route: 'Aerodrome (SNUT/NUT) ↔ Uniswap V2 (SNUT/WETH) ↔ pNUT basket (implied)',
        verdict: 'Viable with caution — include the 1% SNUT fee on non-exempt transfers in the cost model.',
        verdictColor: 'success',
        when: 'SNUT volatility, or one venue lagging after a large trade.',
        costs: '1% SNUT fee (route-dependent), gas, slippage',
        steps: ['Price SNUT on all venues (getReserves)', 'Derive the implied SNUT price from the pNUT basket', 'Compare in USD, execute on the widest positive spread', 'Account for the 1% fee where it applies'],
        tokens: ['SNUT', 'NUT', 'WETH', 'pNUT'],
      },
    ],
  },
  {
    group: 'Wrapper',
    strategies: [
      {
        id: 3, emoji: '📦', name: 'wNUT Parity',
        route: 'NUT ↔ wNUT wrapper (1:1) ↔ Balancer v3 venues (Whorl, grafts)',
        verdict: 'Cleanest loop — wrap/unwrap enforces 1:1 parity; venue price deviations are self-correcting.',
        verdictColor: 'success',
        when: 'Whenever a wNUT venue price deviates from NUT by more than gas + venue fee.',
        costs: 'Gas for wrap/unwrap, venue swap fees',
        steps: ['Compare wNUT venue price vs NUT price', 'If wNUT trades below NUT: buy wNUT, unwrap, sell NUT', 'If wNUT trades above NUT: buy NUT, wrap, sell wNUT', 'The wrapper has no admin key — parity is purely mechanical'],
        tokens: ['NUT', 'wNUT'],
      },
    ],
  },
  {
    group: 'Basket / NAV',
    strategies: [
      {
        id: 4, emoji: '🧺', name: 'pNUT Quad NAV',
        route: 'Balancer V2 (mint/redeem BPT) ↔ market',
        verdict: 'Viable during component divergence — monitor 4 component prices plus the BPT price.',
        verdictColor: 'warning',
        when: 'NUT or SNUT moves sharply against cbETH/cbBTC, drifting basket weights.',
        costs: 'Join/exit fees, sourcing and liquidating 4 components, gas',
        steps: ['Compute NAV = sum(balance × price) / BPT supply (Vault balances)', 'If market > NAV: deposit basket, mint BPT, sell BPT', 'If market < NAV: buy BPT, redeem basket, sell components', 'Read balances from the V2 Vault — not balanceOf(pNUT)'],
        tokens: ['pNUT', 'cbETH', 'cbBTC', 'NUT', 'SNUT'],
      },
      {
        id: 5, emoji: '🌸', name: 'pNUT Whorl NAV',
        route: 'Balancer V3 (add/remove liquidity) ↔ market',
        verdict: 'New immutable venue — monitor BPT price vs NAV as liquidity builds.',
        verdictColor: 'warning',
        when: 'Same pattern as the Quad, on the wNUT-based basket.',
        costs: 'V3 swap fees, gas, component sourcing',
        steps: ['Read composition via the Balancer API (V3 Vault)', 'Compute NAV per BPT', 'Add liquidity proportionional when BPT trades over NAV; remove when under', 'Immutable deployment — no admin parameters to change'],
        tokens: ['pNUT', 'wNUT', 'SNUT', 'cbETH', 'cbBTC'],
      },
      {
        id: 6, emoji: '🌻', name: 'Grove Graft NAV',
        route: 'Six Balancer v3 grafts (20% wNUT + 40/40 scions)',
        verdict: 'Early-stage liquidity — monitor first; size accordingly. Same NAV mechanics as the baskets.',
        verdictColor: 'warning',
        when: 'Scion markets move but graft BPT prices lag.',
        costs: 'V3 fees, gas, scion sourcing',
        steps: ['Track each graft BPT price vs computed NAV', 'Grafts link NUT (via wNUT rootstock) to each scion market', 'Divergence beyond fees + gas marks an add/remove window', 'See /sunflower-grove for the live registry'],
        tokens: ['wNUT', 'VVV', 'DIEM', 'VIRTUAL', 'MOR', 'cbETH', 'wstETH', 'cbBTC', 'tBTC', 'USDC', 'EURC', 'NVDAc', 'AAPLc'],
      },
    ],
  },
  {
    group: 'Bonding-Curve Loops',
    strategies: [
      {
        id: 7, emoji: '🧂', name: 'SALT Loop (Mint Club ↔ Aerodrome)',
        route: 'Mint Club (NUT→SALT) ↔ Aerodrome (SALT→USDC) ↔ reCLAMM (NUT/SALT)',
        verdict: 'Challenging — the curve buy/sell spread captures most attempts; windows open during volatility.',
        verdictColor: 'warning',
        when: 'DEX price diverges from the curve during liquidity events or NUT moves.',
        costs: 'Curve spread, 1% royalty both ways, gas, slippage',
        steps: ['Read curve price via the Mint Club SDK (minimal-proxy contracts — RPC unreliable)', 'Read DEX price via reserves', 'Forward: buy NUT → mint SALT → sell on DEX', 'Reverse: buy SALT on DEX → burn on curve → sell NUT', 'Subtract the 1% royalty in both directions'],
        tokens: ['NUT', 'SALT', 'USDC'],
      },
      {
        id: 8, emoji: '🍫', name: 'NUTINO Loop (Mint Club ↔ Uniswap V2)',
        route: 'Mint Club (NUT→NUTINO) ↔ Uniswap V2 (NUTINO→cbBTC)',
        verdict: 'Challenging — same curve dynamics as SALT; the cbBTC denomination adds a BTC dimension.',
        verdictColor: 'warning',
        when: 'High BTC volatility or NUT moves that the curve has not absorbed.',
        costs: 'Curve spread, 1% royalty, gas, BTC/USD conversion',
        steps: ['Same structure as the SALT loop, priced in cbBTC (8 decimals)', 'Forward: buy NUT → mint NUTINO → sell for cbBTC', 'Reverse: buy NUTINO → burn for NUT → sell NUT', 'Normalize cbBTC to USD for the profit model'],
        tokens: ['NUT', 'NUTINO', 'cbBTC'],
      },
    ],
  },
  {
    group: 'Structural (Monitoring)',
    strategies: [
      {
        id: 9, emoji: '🔥', name: 'SNUT Burn Flywheel',
        route: 'SNUT activity → 1% fee → swapback → buyback/burn + NUT rewards',
        verdict: 'Not a tradeable loop — a structural mechanism. Track it as a supply-and-flow signal.',
        verdictColor: 'neutral',
        when: 'Monitoring: burn rate, buyback fuel, and dead-held balances via RPC.',
        costs: 'N/A — monitoring; holders participate passively',
        steps: ['Watch the dead-address SNUT balance (supply decreases monotonically)', 'Watch the SNUT contract ETH balance (buyback fuel)', 'Fee split is live-readable per stream via RPC', 'Higher burn rate = stronger structural support'],
        tokens: ['SNUT', 'NUT'],
      },
    ],
  },
  {
    group: 'Keeper',
    strategies: [
      {
        id: 10, emoji: '⚛️', name: 'SNUT/NUT Reactor',
        route: 'Aerodrome SNUT/NUT — dividend-eligible pair',
        verdict: 'Expert keeper game — NUT rewards accrue to the pair as excess balance; fastest keeper captures it.',
        verdictColor: 'warning',
        when: 'Continuously — excess accumulates with each reward distribution.',
        costs: 'Gas, competition',
        steps: ['Monitor actual NUT balance of the pair vs recorded reserves', 'Excess = actual − recorded; when excess > gas: skim() or sync()+swap', 'Alternatively hold LP and burn to claim pro-rata actual balances', 'Competition, not opportunity, is the constraint'],
        tokens: ['SNUT', 'NUT'],
      },
    ],
  },
  {
    group: 'Derivatives',
    strategies: [
      {
        id: 11, emoji: '🧬', name: 'SNUT/ETH-LP Meta-Pool',
        route: 'Uniswap V2 meta-pool (LP tokens vs WETH) ↔ underlying SNUT/WETH pool',
        verdict: 'Opportunistic — LP-token price vs fair NAV; thin liquidity, low frequency.',
        verdictColor: 'warning',
        when: 'Meta-pool LP price diverges from fair NAV during SNUT volatility.',
        costs: 'Gas, LP add/remove fees, slippage',
        steps: ['Compute LP fair NAV = (SNUT_res × price + WETH_res × price) / LP supply', 'Premium: add liquidity → sell LP tokens on the meta-pool', 'Discount: buy LP tokens → remove liquidity → sell components', 'LP prices are sticky vs spot — the lag is the window'],
        tokens: ['SNUT', 'WETH', 'SNUT/ETH-LP'],
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// BOT COMMANDS — AGENT WIRING (compact)
// ═══════════════════════════════════════════════════════════════
const BOT_COMMANDS = [
  { trigger: '/arb-scan', args: '[NUT|SNUT|pNUT|SALT|NUTINO|all]', returns: 'Cross-venue, basket-NAV, and bonding-curve scan across all venues.' },
  { trigger: '/loop-scan', args: '[SALT|NUTINO|all]', returns: 'Detailed Mint Club loop analysis — forward/reverse spreads vs DEX.' },
  { trigger: '/token-info', args: '<TOKEN>', returns: 'Price, TVL, distribution, and venue map for one token.' },
  { trigger: '/nut-status', args: '—', returns: 'Ecosystem overview — aggregate prices, TVL, NUT distribution.' },
  { trigger: '/pools', args: '[NUT|SNUT|SALT|NUTINO|pNUT|NFT]', returns: 'All pools with reserves, ordering, and depth.' },
  { trigger: '/nft-status', args: '—', returns: 'NFT collection supplies and Sudoswap pool status.' },
];

// ═══════════════════════════════════════════════════════════════
// MACHINE-READABLE SPEC
// ═══════════════════════════════════════════════════════════════
const MACHINE_SPEC = {
  chain: 'base',
  chainId: 8453,
  rpc: 'https://mainnet.base.org',
  rpcFallbacks: ['https://base.publicnode.com', 'https://1rpc.io/base'],
  tokens: {
    NUT: '0xb8de15fb529d98c93c749de63c749d48d25a30df',
    WNUT: '0xBA5ED46e31F80dafF307cbf60bd422a6f62E3dd3',
    SNUT: '0xAC130701aa31c284c36609E2489f150F419AD7AD',
    PNUT_QUAD: '0x2a5757b60987ff10385de1d4d923792f6fdcfff1',
    PNUT_WHORL: '0x252b1E49D1d1E42657d028703e8c37fe5B5cACF5',
    SALT: '0x1EDe2AFC985F6D7aEb3F4c84B95A103c00D5dE81',
    NUTINO: '0x30421e2d18dFF60B298eEF427cF868cA65f1476B',
    PIPS: '0x3f2327221dd4f0bae660172606d6b288a1cf8ad9',
    DEEZ: '0x477B096A5f3321B3a1a300a025104be5f82f0092',
    WETH: '0x4200000000000000000000000000000000000006',
    AERO: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
    cbBTC: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
    cbETH: '0x2Ae3F1Ec7F1f5012CFEab0185bfc7aa3cf0DEc22',
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    wstETH: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
    tBTC: '0x236aa50979D5f3De3Bd1Eeb40E81137F22ab794b',
    EURC: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42',
    NVDAc: '0xb20000000000000000000078ee7ce2fE4908108C',
    AAPLc: '0xb200000000000000000000C2e324d24d7eEcd1fb',
    VVV: '0xacfE6019Ed1A7Dc6f7B508C02d1b04ec88cC21bf',
    DIEM: '0xF4d97F2da56e8c3098f3a8D538DB630A2606a024',
    VIRTUAL: '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b',
    MOR: '0x7431aDa8a591C955a994a21710752EF9b882b8e3',
  },
  decimals: { NUT: 18, WNUT: 18, SNUT: 9, PNUT_QUAD: 18, PNUT_WHORL: 18, SALT: 18, NUTINO: 18, PIPS: 18, DEEZ: 18, WETH: 18, AERO: 18, cbBTC: 8, cbETH: 18, USDC: 6, wstETH: 18, tBTC: 18, EURC: 6, NVDAc: 8, AAPLc: 8, VVV: 18, DIEM: 18, VIRTUAL: 18, MOR: 18 },
  pools: {
    NUT_WETH_V3: { addr: '0xe3ce00e2ed742b142c15eedc208657dd22aa987e', type: 'V3', token0: 'WETH', token1: 'NUT', feeTier: 10000 },
    NUT_WETH_V2: { addr: '0x997bad8e9f5c34d5e9784caaa8a554a5e6192f53', type: 'V2', token0: 'WETH', token1: 'NUT' },
    NUT_WETH_CL: { addr: '0x0416a0d0Ce17F23DAA9D3f852470fe91f0a69c71', type: 'CL', token0: 'WETH', token1: 'NUT' },
    NUT_AERO: { addr: '0x38630fede5e2032652640d98b2d3f9c6296eea5d', type: 'V2', token0: 'AERO', token1: 'NUT' },
    NUT_cbBTC: { addr: '0x15385c9281bc12d2e9bf5c081621944b0ee2acca', type: 'V2', token0: 'NUT', token1: 'cbBTC' },
    SNUT_NUT: { addr: '0x893faaa7baf7a8247fc7142afb28e13d51a5aae8', type: 'V2', token0: 'SNUT', token1: 'NUT', dividendEligible: true },
    SNUT_WETH: { addr: '0xB22895d2ee6e29395F30Ec47c8D9FE0d55355AE1', type: 'V2', token0: 'WETH', token1: 'SNUT' },
    SNUT_ETHLP_META: { addr: '0x82bbadb9d6b2c0a59ed01809e30323f89f6faa1c', type: 'V2', token0: 'WETH', token1: 'UNI-V2 (SNUT/WETH LP)' },
    NUTINO_cbBTC: { addr: '0xeafde67d470480d14139e3d91164c158b82b38e2', type: 'V2', token0: 'NUTINO', token1: 'cbBTC' },
    SALT_USDC: { addr: '0x64ca0b147f625007b6f082abbb3ba217930eccb2', type: 'V2', token0: 'SALT', token1: 'USDC' },
    NUT_SALT_RECLAMM: { addr: '0x4f924d20773D21a80E58ba929613BeB74f51BeD6', type: 'reCLAMM', platform: 'balancer-v3' },
    PIPS_NUT_SLIPSTREAM: { addr: '0x7f8e532cf1be9ed688adb9e6585bc69f017201b5', type: 'CL', token0: 'PIPS', token1: 'NUT', feeTier: 10000 },
    PIPS_USDC_RECLAMM: { addr: '0xb19e3af68BB307369e8772A9E157431FcFE9Dd44', type: 'reCLAMM', platform: 'balancer-v3' },
    PNUT_QUAD: { addr: '0x2a5757b60987ff10385de1d4d923792f6fdcfff1', poolId: '0x2a5757b60987ff10385de1d4d923792f6fdcfff100010000000000000000019e', type: 'WeightedPool', platform: 'balancer-v2', weights: [25, 25, 25, 25], basket: ['cbETH', 'cbBTC', 'NUT', 'SNUT'] },
    PNUT_WHORL: { addr: '0x252b1E49D1d1E42657d028703e8c37fe5B5cACF5', type: 'WeightedPool', platform: 'balancer-v3', weights: [25, 25, 25, 25], basket: ['cbETH', 'SNUT', 'WNUT', 'cbBTC'], immutable: true },
    GRAFT_INF: { addr: '0x6a0a1B7428d543524592eD22023A09BdE05aA466', type: 'WeightedPool', platform: 'balancer-v3', weights: [20, 40, 40], basket: ['WNUT', 'VVV', 'DIEM'] },
    GRAFT_AGT: { addr: '0x5dA95cC31C840Fd33180e4C7f879e3F3d8Eca200', type: 'WeightedPool', platform: 'balancer-v3', weights: [20, 40, 40], basket: ['WNUT', 'VIRTUAL', 'MOR'] },
    GRAFT_ETH: { addr: '0xd156d51219B3a7A590670d655E8740Ad404e8835', type: 'WeightedPool', platform: 'balancer-v3', weights: [20, 40, 40], basket: ['WNUT', 'cbETH', 'wstETH'] },
    GRAFT_BTC: { addr: '0xb2a63935e1391Ee49E5cfB6cc4f184C285fE29b4', type: 'WeightedPool', platform: 'balancer-v3', weights: [20, 40, 40], basket: ['WNUT', 'cbBTC', 'tBTC'] },
    GRAFT_FX: { addr: '0x1cCB8c61b62b9c7a9d4e66C9c824C1539B8b1f2E', type: 'WeightedPool', platform: 'balancer-v3', weights: [20, 40, 40], basket: ['WNUT', 'USDC', 'EURC'] },
    GRAFT_SIL: { addr: '0xA669275f92e49aff80aBA7AaD86E5AFDDe3540B0', type: 'WeightedPool', platform: 'balancer-v3', weights: [20, 40, 40], basket: ['WNUT', 'NVDAc', 'AAPLc'] },
  },
  infrastructure: {
    balancer_v2_vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    balancer_v3_vault: '0xBA1333333333a1BA1108E8412F11850A5C319ba9',
    balancer_v3_factory: '0xBDbADc891BB95DEE80eBC491699228EF0f7D6fF1',
    balancer_v3_router: '0x3f170631ed9821Ca51A59D996aB095162438DC10',
    aerodrome_factory: '0x420DD381b31aEf6683db6B902084cB0FFECe40Da',
    custom_cl_factory: '0xade65c38cd4849adba595a4323a8c7ddfe89716a',
    mint_club_bond: '0xc5a076cad94176c2996b32d8466be1ce757faa27',
    dead_address: '0x000000000000000000000000000000000000dEaD',
  },
  nfts: {
    PNUTS: { addr: '0x794fcD89357C1CcF04a1a9A441ad4dB2Cd5EE387', label: 'Peanut War Generals' },
    ALMD: { addr: '0x1A160456005AED47994E1c13C9bc31F274413927', label: 'Almond War Generals' },
    SALMD: { addr: '0x1E0f80529593185C021043ffcbfDcB8f4279C649', label: 'Almond Soldiers' },
    PNUTRMY: { addr: '0xF075300b8C2EF500d8Ce4f783F910C500B9A3512', label: 'Peanut Soldiers' },
  },
  sudoswap: {
    PNUTS: '0x262bEaa785a0eF65f5D9C1b8BA5c41980D087ff3',
    SALMD: '0xeE7243F0E02e5890c6415B5CbAe58e0D0fb758a5',
    ALMD: '0x308C9BC0546723d6e4905c971cd34feBF1f94031',
  },
  function_sigs: {
    slot0: '0x3850c7bd',
    getReserves: '0x0902f1ac',
    token0: '0x0dfe1681',
    token1: '0xd21220a7',
    balanceOf: '0x70a08231',
    totalSupply: '0x18160ddd',
    decimals: '0x313ce567',
    symbol: '0x95d89b41',
    liquidity: '0x1a686502',
    fee: '0xddca3f43',
    getPoolTokens: '0x9cb8a26a',
  },
  routes: [
    'NUT-UNI3-UNI2',
    'NUT-UNI3-AERO-AERO',
    'NUT-UNI3-AERO-CBBTC',
    'NUT-UNI3-CL',
    'WNUT-WRAP-UNWRAP',
    'PNUT-NAV-MINT',
    'PNUT-NAV-REDEEM',
    'PNUT-WHORL-NAV',
    'GRAFT-NAV',
    'SALT-MC-AERO-USDC',
    'SALT-RECLAMM',
    'NUTINO-MC-UNI2-CBBTC',
    'SNUT-WETH-UNI2',
    'SNUT-NUT-AERO',
    'SNUT-BASKET',
    'SNUT-BUYBACK-BURN',
    'SNUT-NUT-REACTOR',
    'SNUT-ETHLP-META',
    'PIPS-NUT-SLIPSTREAM',
    'PIPS-USDC-RECLAMM',
  ],
  apis: {
    dexscreener: 'https://api.dexscreener.com/latest/dex/tokens/{token_addr}',
    coingecko: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,wrapped-bitcoin,coinbase-wrapped-staked-eth&vs_currencies=usd',
    balancer_v1: 'https://api.balancer.fi/v1/pools/base/{pool_addr}',
    balancer_graphql: 'https://api.thegraph.com/subgraphs/name/balancer-base-v2',
    mint_club_sdk: 'npm i mint.club-v2-sdk',
    mint_club_docs: 'https://sdk.mint.club/',
  },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function ArbBotPage() {
  const [activeSection, setActiveSection] = useState('model');
  const [expandedStrategy, setExpandedStrategy] = useState(null);
  const [expandedCode, setExpandedCode] = useState(null);
  const [specCopied, setSpecCopied] = useState(false);

  const navItems = [
    { id: 'model', label: '🧭 Model' },
    { id: 'tokens', label: '🥜 Tokens' },
    { id: 'pools', label: '💧 Pools' },
    { id: 'infra', label: '🏭 Infra & NFT' },
    { id: 'reads', label: '🔧 Reads & Code' },
    { id: 'strategies', label: '⚔️ Strategies' },
    { id: 'spec', label: '⚙️ Spec' },
    { id: 'start', label: '🚀 Start' },
  ];

  const scrollTo = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const copySpec = () => {
    navigator.clipboard.writeText(JSON.stringify(MACHINE_SPEC, null, 2));
    setSpecCopied(true);
    setTimeout(() => setSpecCopied(false), 2000);
  };

  const verdictColors = {
    success: { bg: 'rgba(34,139,34,0.08)', border: 'rgba(34,139,34,0.2)', text: '#2e7d32' },
    warning: { bg: 'rgba(255,165,0,0.08)', border: 'rgba(255,165,0,0.2)', text: '#e65100' },
    neutral: { bg: 'rgba(100,100,100,0.06)', border: 'rgba(100,100,100,0.15)', text: '#555' },
  };

  const severityStyles = {
    high: { border: '1px solid rgba(139,90,43,0.35)', bg: 'rgba(255,244,224,0.7)' },
    info: { border: '1px solid rgba(139,90,43,0.18)', bg: 'rgba(255,252,245,0.9)' },
    medium: { border: '1px solid rgba(139,90,43,0.12)', bg: 'rgba(255,252,245,0.7)' },
  };

  const SectionTitle = ({ icon, children }) => (
    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4A2F1A', mb: 0.5, mt: 1 }}>
      {icon} {children}
    </Typography>
  );

  return (
    <Layout>
      <Head>
        <title>Arb Bot Builder | BASED NUT</title>
        <meta name="description" content="On-chain reference for the BASED NUT ecosystem on Base: verified token and pool addresses, read patterns, strategy overview, and a machine-readable spec for trading and monitoring agents." />
      </Head>

      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
        {/* ══ HEADER ══ */}
        <Box sx={{ mb: 2, p: { xs: 2, md: 3 }, borderRadius: 3, background: 'linear-gradient(135deg, #4A2F1A 0%, #6B3D20 50%, #8B5A2B 100%)', color: '#FAF3E6' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>⚔️ Arb Bot Builder</Typography>
          <Typography sx={{ opacity: 0.85, fontSize: '0.9rem', mb: 1 }}>
            On-chain reference for agents and developers working with BASED NUT on Base — verified addresses, read patterns, strategy overview, and one machine-readable spec. Addresses are snapshot-verified; re-verify live state before executing.
          </Typography>
          <Box sx={{ mt: 1, p: 1.5, borderRadius: 2, background: 'rgba(255,252,245,0.12)', border: '1px solid rgba(255,252,245,0.2)' }}>
            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(250,243,230,0.9)', lineHeight: 1.5 }}>
              🧭 Model = the facts that change how you price these tokens · 🥜 Tokens + 💧 Pools = the full verified registry · 🏭 Infra = vaults, factories, NFTs · 🔧 Reads = selectors + copy-pasteable Python · ⚔️ Strategies = what exists and when it works · ⚙️ Spec = one JSON with everything · 🚀 Start = the build order.
            </Typography>
          </Box>
        </Box>

        {/* ══ NOTE (measured) ══ */}
        <Box sx={{ mb: 3, p: { xs: 1.5, md: 2 }, borderRadius: 2, background: 'rgba(255,252,245,0.9)', border: '1px solid rgba(139,90,43,0.15)' }}>
          <Typography sx={{ fontSize: '0.8rem', color: 'rgba(74,47,26,0.75)', lineHeight: 1.6 }}>
            BASED NUT is an experimental memefi project. This page is a technical reference — not financial advice. Standard DeFi execution risks apply: verify live contract state on Basescan before acting, and treat all on-chain parameters (fees, taxes, pool configs) as changeable state to be read, not assumptions to be cached.
          </Typography>
        </Box>

        {/* ══ STICKY NAV ══ */}
        <Box sx={{
          position: 'sticky', top: 0, zIndex: 100,
          display: 'flex', gap: 0.5, overflowX: 'auto',
          pb: 1, mb: 3, pt: 1,
          bgcolor: 'rgba(255,252,245,0.85)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(139,90,43,0.1)',
          '&::-webkit-scrollbar': { height: 3 },
        }}>
          {navItems.map((item) => (
            <Box
              key={item.id}
              onClick={() => scrollTo(item.id)}
              sx={{
                cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.78rem', fontWeight: 600,
                px: 1.5, py: 0.75, borderRadius: 2, border: '1px solid',
                color: activeSection === item.id ? '#fff' : '#5D4037',
                background: activeSection === item.id ? 'linear-gradient(135deg, #8B4513, #A0522D)' : 'transparent',
                borderColor: activeSection === item.id ? '#6B3D20' : 'rgba(139,69,19,0.1)',
                '&:hover': { background: activeSection === item.id ? 'linear-gradient(135deg, #A0522D, #B87333)' : 'rgba(139,69,19,0.06)' },
              }}
            >
              {item.label}
            </Box>
          ))}
        </Box>

        {/* ══ MODEL ══ */}
        <Box id="model" sx={{ mb: 4 }}>
          <SectionTitle icon="🧭">Ecosystem Model</SectionTitle>
          <Typography sx={{ fontSize: '0.85rem', color: 'rgba(40,40,60,0.7)', mb: 2 }}>
            The structural facts that change how an agent prices these markets. Everything else on this page assumes these.
          </Typography>
          <Grid container spacing={1.5}>
            {MODEL_NOTES.map((n, i) => (
              <Grid item xs={12} md={6} key={i}>
                <Box sx={{ p: 1.5, borderRadius: 2, height: '100%', ...(severityStyles[n.severity] || severityStyles.info) }}>
                  <Typography sx={{ fontSize: '0.8rem', color: 'rgba(40,40,60,0.85)', lineHeight: 1.6 }}>
                    <strong>{n.severity === 'high' ? '⚠️ ' : n.severity === 'medium' ? '· ' : 'ℹ️ '}</strong>{n.note}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ══ TOKENS ══ */}
        <Box id="tokens" sx={{ mb: 4 }}>
          <SectionTitle icon="🥜">Token Registry</SectionTitle>
          <Typography sx={{ fontSize: '0.85rem', color: 'rgba(40,40,60,0.7)', mb: 2 }}>
            All ecosystem tokens and reserve assets. Addresses snapshot-verified on Base. Supplies and live metrics are on each token page.
          </Typography>
          {TOKEN_GROUPS.map((g) => (
            <Box key={g.group} sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#6B3D20', mb: 1.5, borderBottom: '2px solid rgba(139,90,43,0.15)', pb: 0.5 }}>{g.group}</Typography>
              <Grid container spacing={1.5}>
                {g.tokens.map((t) => (
                  <Grid item xs={12} sm={6} md={4} key={t.name}>
                    <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid rgba(139,90,43,0.15)', background: 'rgba(255,252,245,0.8)', height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#4A2F1A' }}>{t.emoji} {t.name}</Typography>
                        <Box sx={{ px: 0.75, py: 0.15, borderRadius: 1, background: 'rgba(139,90,43,0.1)', fontSize: '0.68rem', fontWeight: 700, color: '#6B3D20' }}>{t.decimals}d</Box>
                        {t.href && <Link href={t.href} style={{ fontSize: '0.68rem', color: '#8B5A2B', fontWeight: 600, textDecoration: 'none' }}>Profile →</Link>}
                      </Box>
                      <Box component="code" sx={{ display: 'block', fontSize: '0.7rem', color: 'rgba(40,40,60,0.65)', mb: 0.75, fontFamily: 'monospace', wordBreak: 'break-all' }}>{t.address}</Box>
                      <Typography sx={{ fontSize: '0.76rem', color: 'rgba(40,40,60,0.7)', lineHeight: 1.5 }}>{t.role}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>

        {/* ══ POOLS ══ */}
        <Box id="pools" sx={{ mb: 4 }}>
          <SectionTitle icon="💧">Pool Registry</SectionTitle>
          <Typography sx={{ fontSize: '0.85rem', color: 'rgba(40,40,60,0.7)', mb: 2 }}>
            Every venue, grouped by role. token0/token1 orderings are as listed — verify on-chain before dividing reserves.
          </Typography>
          {POOL_GROUPS.map((g) => (
            <Box key={g.group} sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#6B3D20', mb: 1.5, borderBottom: '2px solid rgba(139,90,43,0.15)', pb: 0.5 }}>{g.group}</Typography>
              <Grid container spacing={1.5}>
                {g.pools.map((p) => (
                  <Grid item xs={12} sm={6} md={4} key={p.address}>
                    <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid rgba(139,90,43,0.15)', background: 'rgba(255,252,245,0.8)', height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#4A2F1A' }}>{p.name}</Typography>
                        <Box sx={{ px: 0.75, py: 0.15, borderRadius: 1, background: 'rgba(139,90,43,0.1)', fontSize: '0.68rem', fontWeight: 700, color: '#6B3D20' }}>{p.platform}</Box>
                      </Box>
                      <Box component="code" sx={{ display: 'block', fontSize: '0.7rem', color: 'rgba(40,40,60,0.65)', mb: 0.5, fontFamily: 'monospace', wordBreak: 'break-all' }}>{p.address}</Box>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(40,40,60,0.6)', mb: 0.5 }}>pair: {p.pair}</Typography>
                      <Typography sx={{ fontSize: '0.76rem', color: 'rgba(40,40,60,0.7)', lineHeight: 1.5 }}>{p.notes}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>

        {/* ══ INFRA & NFT ══ */}
        <Box id="infra" sx={{ mb: 4 }}>
          <SectionTitle icon="🏭">Infrastructure & NFTs</SectionTitle>
          <Grid container spacing={1.5} sx={{ mb: 3 }}>
            {INFRA.map((v) => (
              <Grid item xs={12} sm={6} md={4} key={v.address}>
                <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid rgba(139,90,43,0.15)', background: 'rgba(255,252,245,0.8)', height: '100%' }}>
                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#4A2F1A', mb: 0.5 }}>{v.name}</Typography>
                  <Box component="code" sx={{ display: 'block', fontSize: '0.7rem', color: 'rgba(40,40,60,0.65)', mb: 0.75, fontFamily: 'monospace', wordBreak: 'break-all' }}>{v.address}</Box>
                  <Typography sx={{ fontSize: '0.76rem', color: 'rgba(40,40,60,0.7)', lineHeight: 1.5 }}>{v.purpose}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#6B3D20', mb: 1.5, borderBottom: '2px solid rgba(139,90,43,0.15)', pb: 0.5 }}>🖼️ NFT Collections</Typography>
          <Grid container spacing={1.5}>
            {NFTS.map((nft) => (
              <Grid item xs={12} sm={6} md={3} key={nft.name}>
                <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid rgba(139,90,43,0.15)', background: 'rgba(255,252,245,0.8)', height: '100%' }}>
                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#4A2F1A' }}>{nft.emoji} {nft.name} — {nft.label}</Typography>
                  <Box component="code" sx={{ display: 'block', fontSize: '0.7rem', color: 'rgba(40,40,60,0.65)', my: 0.5, fontFamily: 'monospace', wordBreak: 'break-all' }}>{nft.address}</Box>
                  <Typography sx={{ fontSize: '0.74rem', color: 'rgba(40,40,60,0.7)' }}>Minted: {nft.supply}</Typography>
                  {nft.sudoswap ? (
                    <Typography sx={{ fontSize: '0.7rem', color: 'rgba(40,40,60,0.55)', mt: 0.5, fontFamily: 'monospace', wordBreak: 'break-all' }}>Sudoswap: {nft.sudoswap}</Typography>
                  ) : (
                    <Typography sx={{ fontSize: '0.74rem', color: 'rgba(40,40,60,0.5)', mt: 0.5 }}>No Sudoswap pool</Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ══ READS & CODE ══ */}
        <Box id="reads" sx={{ mb: 4 }}>
          <SectionTitle icon="🔧">Read Reference</SectionTitle>
          <Typography sx={{ fontSize: '0.85rem', color: 'rgba(40,40,60,0.7)', mb: 2 }}>
            The pricing subset of the read ABI — enough to price every market on this page. Execution (approve, swap, join/exit) needs each contract's full ABI.
          </Typography>
          <Box sx={{ mb: 3, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
              <thead>
                <tr style={{ background: 'rgba(139,90,43,0.08)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', borderRadius: '6px 0 0 6px' }}>Selector</th>
                  <th style={{ padding: '8px 10px' }}>Function</th>
                  <th style={{ padding: '8px 10px', borderRadius: '0 6px 6px 0' }}>Use</th>
                </tr>
              </thead>
              <tbody>
                {FUNCTION_SIGS.map((f) => (
                  <tr key={f.sig} style={{ borderBottom: '1px solid rgba(139,90,43,0.08)' }}>
                    <td style={{ padding: '7px 10px', fontFamily: 'monospace', color: '#6B3D20', fontWeight: 700 }}>{f.sig}</td>
                    <td style={{ padding: '7px 10px', fontFamily: 'monospace' }}>{f.name}</td>
                    <td style={{ padding: '7px 10px', color: 'rgba(40,40,60,0.75)' }}>{f.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#6B3D20', mb: 1.5 }}>🐍 Copy-pasteable Python</Typography>
          <Grid container spacing={1.5}>
            {CODE_BLOCKS.map((block, i) => (
              <Grid item xs={12} key={block.title}>
                <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid rgba(139,90,43,0.15)', background: 'rgba(255,252,245,0.8)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setExpandedCode(expandedCode === i ? null : i)}>
                    <Box>
                      <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#4A2F1A' }}>{block.title}</Typography>
                      <Typography sx={{ fontSize: '0.76rem', color: 'rgba(40,40,60,0.65)' }}>{block.desc}</Typography>
                    </Box>
                    <IconButton size="small">{expandedCode === i ? <ExpandLess /> : <ExpandMore />}</IconButton>
                  </Box>
                  <Collapse in={expandedCode === i} timeout="auto" unmountOnExit>
                    <Box component="pre" sx={{ mt: 1, p: 1.5, borderRadius: 1.5, background: 'rgba(2,6,23,0.92)', color: '#e2e8f0', fontSize: '0.7rem', lineHeight: 1.55, overflowX: 'auto', whiteSpace: 'pre' }}>
                      {block.code}
                    </Box>
                  </Collapse>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ══ STRATEGIES ══ */}
        <Box id="strategies" sx={{ mb: 4 }}>
          <SectionTitle icon="⚔️">Strategy Overview</SectionTitle>
          <Typography sx={{ fontSize: '0.85rem', color: 'rgba(40,40,60,0.7)', mb: 2 }}>
            What exists, when it works, and what it costs. Verdicts are honest assessments — not every pattern is worth executing at current liquidity. Expand a card for the execution steps.
          </Typography>
          {STRATEGY_GROUPS.map((g) => (
            <Box key={g.group} sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#6B3D20', mb: 1.5, borderBottom: '2px solid rgba(139,90,43,0.15)', pb: 0.5 }}>{g.group}</Typography>
              <Grid container spacing={1.5}>
                {g.strategies.map((s) => (
                  <Grid item xs={12} key={s.id}>
                    <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid rgba(139,90,43,0.15)', background: 'rgba(255,252,245,0.8)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setExpandedStrategy(expandedStrategy === s.id ? null : s.id)}>
                        <Box sx={{ pr: 1 }}>
                          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#4A2F1A', mb: 0.25 }}>{s.emoji} {s.name}</Typography>
                          <Typography sx={{ fontSize: '0.74rem', color: 'rgba(40,40,60,0.6)', mb: 0.5 }}>{s.route}</Typography>
                          <Box sx={{ display: 'inline-block', px: 1, py: 0.25, borderRadius: 1, fontSize: '0.7rem', fontWeight: 700, ...(verdictColors[s.verdictColor] || verdictColors.neutral) }}>{s.verdict}</Box>
                        </Box>
                        <IconButton size="small">{expandedStrategy === s.id ? <ExpandLess /> : <ExpandMore />}</IconButton>
                      </Box>
                      <Collapse in={expandedStrategy === s.id} timeout="auto" unmountOnExit>
                        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(139,90,43,0.1)' }}>
                          <Grid container spacing={1.5}>
                            <Grid item xs={12} sm={4}>
                              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(40,40,60,0.5)', textTransform: 'uppercase' }}>Works when</Typography>
                              <Typography sx={{ fontSize: '0.76rem', color: 'rgba(40,40,60,0.75)', mb: 1 }}>{s.when}</Typography>
                              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(40,40,60,0.5)', textTransform: 'uppercase' }}>Cost factors</Typography>
                              <Typography sx={{ fontSize: '0.76rem', color: 'rgba(40,40,60,0.75)' }}>{s.costs}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={8}>
                              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(40,40,60,0.5)', textTransform: 'uppercase', mb: 0.5 }}>Execution</Typography>
                              {s.steps.map((step, j) => (
                                <Typography key={j} sx={{ fontSize: '0.76rem', color: 'rgba(40,40,60,0.75)', mb: 0.25, lineHeight: 1.5 }}>{j + 1}. {step}</Typography>
                              ))}
                            </Grid>
                          </Grid>
                          <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {s.tokens.map((t) => (
                              <Box key={t} sx={{ px: 0.75, py: 0.15, borderRadius: 1, background: 'rgba(139,90,43,0.08)', fontSize: '0.68rem', fontWeight: 600, color: '#6B3D20' }}>{t}</Box>
                            ))}
                          </Box>
                        </Box>
                      </Collapse>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}

          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#6B3D20', mb: 1.5 }}>🤖 Agent Bot Commands</Typography>
          <Box sx={{ overflowX: 'auto', mb: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
              <thead>
                <tr style={{ background: 'rgba(139,90,43,0.08)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', borderRadius: '6px 0 0 6px' }}>Trigger</th>
                  <th style={{ padding: '8px 10px' }}>Args</th>
                  <th style={{ padding: '8px 10px', borderRadius: '0 6px 6px 0' }}>Returns</th>
                </tr>
              </thead>
              <tbody>
                {BOT_COMMANDS.map((c) => (
                  <tr key={c.trigger} style={{ borderBottom: '1px solid rgba(139,90,43,0.08)' }}>
                    <td style={{ padding: '7px 10px', fontFamily: 'monospace', color: '#6B3D20', fontWeight: 700 }}>{c.trigger}</td>
                    <td style={{ padding: '7px 10px', fontFamily: 'monospace', color: 'rgba(40,40,60,0.65)' }}>{c.args}</td>
                    <td style={{ padding: '7px 10px', color: 'rgba(40,40,60,0.75)' }}>{c.returns}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Box>

        {/* ══ SPEC ══ */}
        <Box id="spec" sx={{ mb: 4 }}>
          <SectionTitle icon="⚙️">Machine-Readable Spec</SectionTitle>
          <Typography sx={{ fontSize: '0.85rem', color: 'rgba(40,40,60,0.7)', mb: 2 }}>
            One JSON with the full registry — tokens, pools, infrastructure, selectors, routes, APIs. Copy it into your bot's context.
          </Typography>
          <Box sx={{ position: 'relative' }}>
            <IconButton
              size="small"
              onClick={copySpec}
              sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, background: 'rgba(255,252,245,0.9)' }}
            >
              <ContentCopy />
            </IconButton>
            {specCopied && (
              <Typography sx={{ position: 'absolute', top: 12, right: 52, fontSize: '0.7rem', color: '#2e7d32', fontWeight: 700 }}>Copied!</Typography>
            )}
            <Box component="pre" sx={{ p: 2, borderRadius: 2, background: 'rgba(2,6,23,0.92)', color: '#e2e8f0', fontSize: '0.7rem', lineHeight: 1.5, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(MACHINE_SPEC, null, 2)}
            </Box>
          </Box>
        </Box>

        {/* ══ START ══ */}
        <Box id="start" sx={{ mb: 4 }}>
          <SectionTitle icon="🚀">Getting Started</SectionTitle>
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {[
              { title: 'Install', code: 'pip install requests' },
              { title: 'Copy the Base RPC Helper', code: null },
              { title: 'Price NUT from the V3 pool', code: 'slot0() → check token0 → apply fee tier' },
              { title: 'Price V2/Aerodrome pairs', code: 'getReserves() → verify token0 → correct decimals' },
              { title: 'Normalize quotes to USD', code: 'CoinGecko: ETH, BTC, cbETH, AERO' },
              { title: 'Load the machine spec', code: 'JSON above — full registry' },
              { title: 'Re-verify contracts', code: 'Basescan before executing' },
            ].map((step, i) => (
              <Grid item xs={12} sm={6} md={3} key={step.title}>
                <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid rgba(139,90,43,0.15)', background: 'rgba(255,252,245,0.8)', height: '100%' }}>
                  <Typography sx={{ fontSize: '0.84rem', color: 'rgba(40,40,60,0.85)', fontWeight: 600 }}>{i + 1}. {step.title}</Typography>
                  {step.code && (
                    <Box sx={{ mt: 0.25, p: 0.5, borderRadius: 1, background: 'rgba(2,6,23,0.04)', display: 'inline-block' }}>
                      <code style={{ fontSize: '0.72rem', color: 'rgba(40,40,60,0.7)' }}>{step.code}</code>
                    </Box>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ pt: 1.5, borderTop: '1px solid rgba(139,90,43,0.08)' }}>
            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(40,40,60,0.6)' }}>
              📖 Mint Club SDK: <a href="https://sdk.mint.club/" target="_blank" rel="noopener noreferrer" style={{ color: '#8B5A2B', fontWeight: 600 }}>https://sdk.mint.club/</a>
              {' · '}Sunflower Grove: <Link href="/sunflower-grove" style={{ color: '#8B5A2B', fontWeight: 600 }}>graft registry</Link>
              {' · '}Balancer API: <a href="https://api.balancer.fi/v1/pools/base/0x2a5757b60987ff10385de1d4d923792f6fdcfff1" target="_blank" rel="noopener noreferrer" style={{ color: '#8B5A2B', fontWeight: 600 }}>REST endpoint</a>
              {' · '}Base RPC: <a href="https://mainnet.base.org" target="_blank" rel="noopener noreferrer" style={{ color: '#8B5A2B', fontWeight: 600 }}>https://mainnet.base.org</a>
            </Typography>
          </Box>
        </Box>

      </Box>
    </Layout>
  );
}
