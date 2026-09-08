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
  { note: 'NUT total supply is exactly 1 whole token (fixed at deployment — no mint, no burn, no admin on the root contract). Whole-token price equals fully-diluted valuation by construction; standard market-cap APIs are not meaningful for it.', severity: 'high' },
  { note: 'The primary NUT venue (NUT/WETH Uniswap V3) is not indexed by DEX Screener. Price it on-chain via slot0() against Base RPC.', severity: 'high' },
  { note: 'pNUT pool contracts and their ERC-20 are the same address — the Balancer Pool Token (BPT) pattern. This applies to pNUT Quad (V2) and pNUT Whorl (V3).', severity: 'info' },
  { note: 'Decimals vary across the ecosystem: SNUT 9, cbBTC 8, USDC 6, EURC 6, NVDAc and AAPLc 8 — all others 18. Always read decimals() before pricing. Wrong decimals = wrong prices.', severity: 'high' },
  { note: 'Mint Club curves price mint (buy) and burn (sell) separately; the buy/sell spread is protocol revenue by design and varies with curve position.', severity: 'info' },
  { note: 'Always verify token0()/token1() ordering before deriving prices from reserves — orderings differ per pool. Wrong ordering = inverted price.', severity: 'high' },
  { note: 'Balancer V2 uses a singleton vault: pNUT Quad constituents sit in the Vault (0xBA122…F2C8), not in the pool contract. balanceOf(pNUT) is not the basket — use getPoolTokens(poolId) or balanceOf(VAULT).', severity: 'high' },
  { note: 'The NUT/WETH Uniswap V3 pool is a 1% fee tier (fee=10000). Include it in any profitability model. Read via fee().', severity: 'info' },
  { note: 'Aerodrome pools use a proxy pattern that does not implement token1() — the selector reverts. Use token0() plus the pair listing here to resolve ordering.', severity: 'high' },
  { note: 'Base public RPCs rate-limit aggressively. Rotate endpoints (mainnet.base.org, base.publicnode.com, 1rpc.io/base) with backoff.', severity: 'medium' },
  { note: 'wNUT is a 1:1 wrapped NUT (ERC-20 wrapper, audited, no admin key). Wrapping does not change NUT supply — wNUT represents NUT already held by the wrapper.', severity: 'info' },
];

// ═══════════════════════════════════════════════════════════════
// VERIFIED TOKEN REGISTRY — ADDRESSES SNAPSHOT-VERIFIED ON BASE
// ═══════════════════════════════════════════════════════════════
const TOKEN_GROUPS = [
  {
    group: 'Core Ecosystem Tokens',
    tokens: [
      { emoji: '🥜', name: 'NUT', address: '0xb8de15fb529d98c93c749de63c749d48d25a30df', decimals: 18, supply: '1 (unity)', role: 'Root token. Fixed supply of exactly 1 whole token — no mint, no burn, no admin. Price = FDV by construction. Base asset for all Mint Club curves.', href: '/token/nut' },
      { emoji: '📦', name: 'wNUT', address: '0xBA5ED46e31F80dafF307cbf60bd422a6f62E3dd3', decimals: 18, supply: '1:1 with wrapped NUT', role: 'ERC-20 wrapper for NUT — every wNUT is a receipt for exactly one NUT locked in the wrapper. Audited, no admin key. Opens NUT to Balancer v3 composability via Sunflower Grove.', href: '/token/wnut' },
      { emoji: '🥥', name: 'SNUT', address: '0xAC130701aa31c284c36609E2489f150F419AD7AD', decimals: 9, supply: '100,000 initial, decreasing', role: 'Liquid non-escrow NUT reward-position token — hold SNUT to earn NUT. 1% fee per transfer, split four ways (liquidity, manager, buyback/burn, NUT rewards). Supply decreases monotonically.', href: '/token/snut' },
      { emoji: '🧺', name: 'pNUT (Quad)', address: '0x2a5757b60987ff10385de1d4d923792f6fdcfff1', decimals: 18, supply: '~6.66 BPT', role: 'Balancer V2 WeightedPool BPT — 25% each cbETH, cbBTC, NUT, SNUT. Pool and token share one address. Mint by depositing the basket, redeem to withdraw.', href: '/token/pnut' },
      { emoji: '🌸', name: 'pNUT (Whorl)', address: '0x252b1E49D1d1E42657d028703e8c37fe5B5cACF5', decimals: 18, supply: 'early-stage', role: 'Balancer V3 WeightedPool BPT — 25% each cbETH, SNUT, wNUT, cbBTC. Immutable deployment (all roles renounced). Based Peanut Whorl.', href: '/sunflower-grove' },
      { emoji: '🧂', name: 'SALT', address: '0x1EDe2AFC985F6D7aEb3F4c84B95A103c00D5dE81', decimals: 18, supply: '~18.2B', role: 'Mint Club bonding-curve token backed by NUT. Trades on Aerodrome vs USDC and on a Balancer v3 reCLAMM pool vs NUT.', href: '/token/salt' },
      { emoji: '🍫', name: 'NUTINO', address: '0x30421e2d18dFF60B298eEF427cF868cA65f1476B', decimals: 18, supply: '~9.4B', role: 'Mint Club bonding-curve token backed by NUT. Trades on Uniswap V2 vs cbBTC.', href: '/token/nutino' },
      { emoji: '💻', name: 'PIPS', address: '0x3f2327221dd4f0bae660172606d6b288a1cf8ad9', decimals: 18, supply: '1,000,000,000', role: 'Compute token for Pipshell — the ecosystem DevOps agent. Trading fees fund its servers. 1%/1% transfer tax on the official Virtuals pair only; external venues untaxed today.', href: '/token/pips' },
      { emoji: '🌰', name: 'DEEZ', address: '0x477B096A5f3321B3a1a300a025104be5f82f0092', decimals: 18, supply: '10,000 (70% burned)', role: 'Retired memorabilia — the first nested-token experiment. Not used in current products; listed for completeness.', href: null },
    ],
  },
  {
    group: 'Quote & Reserve Assets',
    tokens: [
      { emoji: '⚡', name: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18, supply: 'variable', role: 'Wrapped ETH. Quote token for the NUT and SNUT pools.', href: null },
      { emoji: '🛡️', name: 'AERO', address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', decimals: 18, supply: '~1.93B', role: 'Aerodrome token. Quote for the NUT/AERO pool.', href: null },
      { emoji: '₿', name: 'cbBTC', address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', decimals: 8, supply: '~42.5K', role: 'Coinbase Wrapped BTC. Quote for NUT/cbBTC and NUTINO/cbBTC; gtBTC scion.', href: null },
      { emoji: '⟠', name: 'cbETH', address: '0x2Ae3F1Ec7F1f5012CFEab0185bfc7aa3cf0DEc22', decimals: 18, supply: '~55.5K', role: 'Coinbase Wrapped Staked ETH. pNUT basket constituent; gtETH scion.', href: null },
      { emoji: '💵', name: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, supply: '~4.28B', role: 'USD stablecoin. Quote for SALT/USDC and PIPS/USDC; gtFX scion.', href: null },
      { emoji: '💧', name: 'wstETH', address: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452', decimals: 18, supply: '~28.2K', role: 'Lido wrapped staked ETH (Base). gtETH scion.', href: null },
      { emoji: '🪙', name: 'tBTC', address: '0x236aa50979D5f3De3Bd1Eeb40E81137F22ab794b', decimals: 18, supply: '~46.7', role: 'Threshold tBTC (Base). gtBTC scion.', href: null },
      { emoji: '💶', name: 'EURC', address: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42', decimals: 6, supply: '~50.5M', role: 'Circle euro stablecoin. gtFX scion.', href: null },
      { emoji: '📈', name: 'NVDAc', address: '0xb20000000000000000000078ee7ce2fE4908108C', decimals: 8, supply: '~13.7K', role: 'Tokenized NVIDIA stock (Coinbase B20). gtSIL scion.', href: null },
      { emoji: '🍎', name: 'AAPLc', address: '0xb200000000000000000000C2e324d24d7eEcd1fb', decimals: 8, supply: '~6.2K', role: 'Tokenized Apple stock (Coinbase B20). gtSIL scion.', href: null },
      { emoji: '🧠', name: 'VVV', address: '0xacfE6019Ed1A7Dc6f7B508C02d1b04ec88cC21bf', decimals: 18, supply: '~114.8M', role: 'Venice Token. gtINF scion.', href: null },
      { emoji: '🔮', name: 'DIEM', address: '0xF4d97F2da56e8c3098f3a8D538DB630A2606a024', decimals: 18, supply: '~37K', role: 'Venice compute asset. gtINF scion.', href: null },
      { emoji: '🤖', name: 'VIRTUAL', address: '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b', decimals: 18, supply: '~497M', role: 'Virtuals Protocol token. gtAGT scion.', href: null },
      { emoji: '⚙️', name: 'MOR', address: '0x7431aDa8a591C955a994a21710752EF9b882b8e3', decimals: 18, supply: '~5.88M', role: 'Morpheus AI token. gtAGT scion.', href: null },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// VERIFIED POOL REGISTRY — GROUPED BY ROLE
// ═══════════════════════════════════════════════════════════════
const POOL_GROUPS = [
  {
    group: 'NUT Venues',
    pools: [
      { name: 'NUT/WETH', platform: 'Uniswap V3', address: '0xe3ce00e2ed742b142c15eedc208657dd22aa987e', type: 'V3', pair: 'WETH/NUT', flavor: 'Extra Crunchy Delight', notes: 'Primary NUT venue. 1% fee tier. Read via slot0(); not indexed by DEX Screener.' },
      { name: 'NUT/WETH', platform: 'Uniswap V2', address: '0x997bad8e9f5c34d5e9784caaa8a554a5e6192f53', type: 'V2', pair: 'WETH/NUT', flavor: 'Mega Crunchy Madness', notes: 'Secondary NUT venue. Read via getReserves().' },
      { name: 'NUT/WETH', platform: 'Custom CL', address: '0x0416a0d0Ce17F23DAA9D3f852470fe91f0a69c71', type: 'CL', pair: 'WETH/NUT', flavor: 'Genesis Concentrate', notes: 'Concentrated pool from the custom CL factory (0xade6…716a). Read via slot0().' },
      { name: 'NUT/AERO', platform: 'Aerodrome', address: '0x38630fede5e2032652640d98b2d3f9c6296eea5d', type: 'V2', pair: 'AERO/NUT', flavor: 'Sky-Seasoned Crisp', notes: 'AERO-denominated NUT price. token0=AERO, token1=NUT.' },
      { name: 'NUT/cbBTC', platform: 'Aerodrome', address: '0x15385c9281bc12d2e9bf5c081621944b0ee2acca', type: 'V2', pair: 'NUT/cbBTC', flavor: 'Golden Butter Drizzle', notes: 'BTC-denominated NUT price. cbBTC has 8 decimals.' },
    ],
  },
  {
    group: 'SNUT Venues',
    pools: [
      { name: 'SNUT/NUT', platform: 'Aerodrome', address: '0x893faaa7baf7a8247fc7142afb28e13d51a5aae8', type: 'V2', pair: 'SNUT/NUT', flavor: 'Cloud-Salted Breeze', notes: 'Primary SNUT venue. Pairs the reward-position token directly against the root token. SNUT has 9 decimals.' },
      { name: 'SNUT/WETH', platform: 'Uniswap V2', address: '0xB22895d2ee6e29395F30Ec47c8D9FE0d55355AE1', type: 'V2', pair: 'WETH/SNUT', flavor: 'Honey-Roasted Frenzy', notes: 'Secondary SNUT venue.' },
      { name: 'SNUT/ETH-LP', platform: 'Uniswap V2 (meta)', address: '0x82bbadb9d6b2c0a59ed01809e30323f89f6faa1c', type: 'V2', pair: 'SNUT/ETH-LP/WETH', flavor: 'Palm Grove Graft Market', notes: 'Meta-pool — SNUT/WETH LP tokens traded against WETH. Secondary market for liquidity claims.' },
    ],
  },
  {
    group: 'Nested-Token Venues',
    pools: [
      { name: 'NUTINO/cbBTC', platform: 'Uniswap V2', address: '0xeafde67d470480d14139e3d91164c158b82b38e2', type: 'V2', pair: 'NUTINO/cbBTC', flavor: 'Buttery Mint Explosion', notes: 'Primary NUTINO DEX venue. cbBTC has 8 decimals.' },
      { name: 'SALT/USDC', platform: 'Aerodrome', address: '0x64ca0b147f625007b6f082abbb3ba217930eccb2', type: 'V2', pair: 'SALT/USDC', flavor: 'Savory Stable Seasoning', notes: 'Primary SALT DEX venue. USDC has 6 decimals.' },
      { name: 'NUT/SALT', platform: 'Balancer v3 reCLAMM', address: '0x4f924d20773D21a80E58ba929613BeB74f51BeD6', type: 'reCLAMM', pair: 'NUT/SALT', flavor: 'Curve-to-AMM Bridge', notes: 'reCLAMM — recently-liquidity-concentrated AMM. SALT build-out venue.' },
      { name: 'PIPS/NUT', platform: 'Aerodrome Slipstream CL', address: '0x7f8e532cf1be9ed688adb9e6585bc69f017201b5', type: 'CL', pair: 'PIPS/NUT', flavor: 'Shell-Spice Crossbreed', notes: 'Concentrated liquidity, 1% fee. Read via slot0(). PIPS transfer tax is not registered here — untaxed on this venue.' },
      { name: 'PIPS/USDC', platform: 'Balancer v3 reCLAMM', address: '0xb19e3af68BB307369e8772A9E157431FcFE9Dd44', type: 'reCLAMM', pair: 'PIPS/USDC', flavor: 'Stable Shell Reservoir', notes: 'reCLAMM on Balancer v3, 1% fee.' },
    ],
  },
  {
    group: 'Index Baskets (Balancer)',
    pools: [
      { name: 'pNUT Quad', platform: 'Balancer V2 WeightedPool', address: '0x2a5757b60987ff10385de1d4d923792f6fdcfff1', type: 'Balancer', pair: 'cbETH/cbBTC/NUT/SNUT', flavor: 'Quad-Core Basket', notes: '25% each. Pool = BPT address. Read basket via getPoolTokens(poolId) on the V2 Vault.' },
      { name: 'pNUT Whorl', platform: 'Balancer V3 WeightedPool', address: '0x252b1E49D1d1E42657d028703e8c37fe5B5cACF5', type: 'Balancer', pair: 'cbETH/SNUT/wNUT/cbBTC', flavor: 'Based Peanut Whorl', notes: '25% each. Immutable — all roles renounced. Live in the V3 Vault; composition via Balancer API.' },
    ],
  },
  {
    group: 'Sunflower Grove Grafts — Balancer v3, 20% wNUT rootstock + 40/40 scions',
    pools: [
      { name: 'gtINF', platform: 'Balancer v3 WeightedPool', address: '0x6a0a1B7428d543524592eD22023A09BdE05aA466', type: 'Balancer', pair: 'wNUT/VVV/DIEM', flavor: 'Inference Twin Graft', notes: 'AI-inference economics on NUT rootstock. Batch I · 2026-08-27.' },
      { name: 'gtAGT', platform: 'Balancer v3 WeightedPool', address: '0x5dA95cC31C840Fd33180e4C7f879e3F3d8Eca200', type: 'Balancer', pair: 'wNUT/VIRTUAL/MOR', flavor: 'Agent Twin Graft', notes: 'Agent-launchpad rails on NUT rootstock. Batch I.' },
      { name: 'gtETH', platform: 'Balancer v3 WeightedPool', address: '0xd156d51219B3a7A590670d655E8740Ad404e8835', type: 'Balancer', pair: 'wNUT/cbETH/wstETH', flavor: 'Ether Twin Graft', notes: 'Staked and liquid ether scions on NUT rootstock. Batch I.' },
      { name: 'gtBTC', platform: 'Balancer v3 WeightedPool', address: '0xb2a63935e1391Ee49E5cfB6cc4f184C285fE29b4', type: 'Balancer', pair: 'wNUT/cbBTC/tBTC', flavor: 'Bitcoin Twin Graft', notes: 'Bitcoin scions on NUT rootstock. Batch I.' },
      { name: 'gtFX', platform: 'Balancer v3 WeightedPool', address: '0x1cCB8c61b62b9c7a9d4e66C9c824C1539B8b1f2E', type: 'Balancer', pair: 'wNUT/USDC/EURC', flavor: 'FX Twin Graft', notes: 'Dollar/euro scions on NUT rootstock. Batch I.' },
      { name: 'gtSIL', platform: 'Balancer v3 WeightedPool', address: '0xA669275f92e49aff80aBA7AaD86E5AFDDe3540B0', type: 'Balancer', pair: 'wNUT/NVDAc/AAPLc', flavor: 'Silicon Twin Graft', notes: 'Tokenized-equity scions on NUT rootstock. Batch I.' },
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
const BALANCER_URL = 'https://balancer.fi/pools/base/v2/0x2a5757b60987ff10385de1d4d923792f6fdcfff100010000000000000000019e';

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
// RPC IMPLEMENTATION — COPY-PASTEABLE PYTHON (no Web3 lib required)
// ═══════════════════════════════════════════════════════════════
const CODE_BLOCKS = [
  {
    title: 'Base RPC Helper',
    desc: 'Core eth_call with endpoint rotation and backoff. Every other block builds on this.',
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
      '            result = resp.json().get("result", "0x")',
      '            if result and result != "0x":',
      '                _rpc_index = (_rpc_index + attempt) % len(RPC_ENDPOINTS)',
      '                return result',
      '            if result == "0x":',
      '                return "0x"  # some calls legitimately return 0x',
      '        except Exception:',
      '            time.sleep(0.5 * (attempt + 1))',
      '    _rpc_index = (_rpc_index + 1) % len(RPC_ENDPOINTS)',
      '    return "0x"',
      '',
      'def has_code(addr):',
      '    """Check if a contract exists at address."""',
      '    for rpc in RPC_ENDPOINTS:',
      '        try:',
      '            code = requests.post(rpc, json={',
      '                "jsonrpc": "2.0", "id": 1,',
      '                "method": "eth_getCode",',
      '                "params": [addr, "latest"],',
      '            }, timeout=10).json().get("result", "0x")',
      '            return len(code) > 2',
      '        except Exception:',
      '            continue',
      '    return False',
    ].join('\n'),
  },
  {
    title: 'Uniswap V3 Price (NUT/WETH)',
    desc: 'Extract price from sqrtPriceX96. Verify token0 to resolve direction; include the fee tier in the effective price.',
    code: [
      'NUT_WETH_V3 = "0xe3ce00e2ed742b142c15eedc208657dd22aa987e"',
      'WETH = "0x4200000000000000000000000000000000000006"',
      'NUT = "0xb8de15fb529d98c93c749de63c749d48d25a30df"',
      '',
      'def get_v3_fee(pool_addr):',
      '    """Get V3 pool fee tier. NUT/WETH V3 = 10000 (1%)."""',
      '    fee_hex = eth_call(pool_addr, "0xddca3f43")',
      '    return int(fee_hex, 16) if fee_hex and fee_hex != "0x" else 0',
      '',
      'def get_v3_price(pool_addr):',
      '    """Get price ratio from UniV3 slot0(). Includes fee tier check."""',
      '    slot0 = eth_call(pool_addr, "0x3850c7bd")',
      '    sqrt_px = int(slot0[2:66], 16)',
      '    ratio = (sqrt_px / 2**96) ** 2',
      '    fee = get_v3_fee(pool_addr)',
      '    fee_pct = fee / 1_000_000  # hundredths of a bip',
      '    t0_raw = eth_call(pool_addr, "0x0dfe1681")',
      '    token0 = "0x" + t0_raw[26:66]',
      '    if token0.lower() == WETH.lower():',
      '        # ratio = NUT_per_ETH',
      '        eth_per_nut = 1 / ratio',
      '    else:',
      '        # ratio = ETH_per_NUT',
      '        eth_per_nut = ratio',
      '    eth_per_nut_effective = eth_per_nut * (1 - fee_pct)',
      '    return eth_per_nut_effective  # NUT price in ETH (after fee)',
      '',
      '# Get USD price',
      'import requests as r',
      'eth_usd = r.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd").json()["ethereum"]["usd"]',
      'nut_usd = get_v3_price(NUT_WETH_V3) * eth_usd',
      'print(f"NUT price: ${nut_usd:,.2f}")',
    ].join('\n'),
  },
  {
    title: 'Uniswap V2 / Aerodrome Reserves',
    desc: 'Reserve-based pricing with token0 verification and correct decimals. Orderings differ per pool.',
    code: [
      'def get_reserves(pool_addr):',
      '    """Get V2/Aerodrome reserves."""',
      '    result = eth_call(pool_addr, "0x0902f1ac")',
      '    if len(result) >= 130:',
      '        reserve0 = int(result[2:66], 16)',
      '        reserve1 = int(result[66:130], 16)',
      '        return reserve0, reserve1',
      '    return None, None',
      '',
      'def get_token0(pool_addr):',
      '    t0 = eth_call(pool_addr, "0x0dfe1681")',
      '    return "0x" + t0[26:66] if len(t0) >= 66 else None',
      '',
      '# Example: NUT/AERO Aerodrome pool — token0=AERO (18d), token1=NUT (18d)',
      'NUT_AERO = "0x38630fede5e2032652640d98b2d3f9c6296eea5d"',
      'AERO = "0x940181a94a35a4569e4529a3cdfb74e38fd98631"',
      '',
      'r0, r1 = get_reserves(NUT_AERO)',
      't0 = get_token0(NUT_AERO)',
      '',
      'if t0.lower() == AERO.lower():',
      '    aero_res = r0 / 1e18',
      '    nut_res = r1 / 1e18',
      '    nut_per_aero = nut_res / aero_res',
      'else:',
      '    nut_res = r0 / 1e18',
      '    aero_res = r1 / 1e18',
      '    nut_per_aero = aero_res / nut_res',
      '',
      'print(f"NUT/AERO: {nut_per_aero:.6f} NUT per AERO")',
    ].join('\n'),
  },
  {
    title: 'pNUT Quad Basket & NAV (Balancer V2)',
    desc: 'Basket composition from the singleton Vault — balanceOf(pNUT) is NOT the basket. Query the Vault or use getPoolTokens(poolId).',
    code: [
      'pNUT = "0x2a5757b60987ff10385de1d4d923792f6fdcfff1"',
      'BALANCER_VAULT = "0xBA12222222228d8Ba445958a75a0704d566BF2C8"',
      'cbETH = "0x2Ae3F1Ec7F1f5012CFEab0185bfc7aa3cf0DEc22"',
      'cbBTC = "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf"',
      'NUT = "0xb8de15fb529d98c93c749de63c749d48d25a30df"',
      'SNUT = "0xAC130701aa31c284c36609E2489f150F419AD7AD"',
      '',
      'def balance_of(token, holder):',
      '    data = "0x70a08231" + "0" * 24 + holder[2:].lower()',
      '    result = eth_call(token, data)',
      '    return int(result, 16) if result and result != "0x" else 0',
      '',
      'def get_pnut_basket():',
      '    """Get pNUT basket from Vault balances — query the VAULT, not the pool!"""',
      '    return {',
      '        "cbETH": balance_of(cbETH, BALANCER_VAULT) / 1e18,',
      '        "cbBTC": balance_of(cbBTC, BALANCER_VAULT) / 1e8,   # 8 decimals',
      '        "NUT":   balance_of(NUT,   BALANCER_VAULT) / 1e18,',
      '        "SNUT":  balance_of(SNUT,  BALANCER_VAULT) / 1e9,   # 9 decimals',
      '        "pNUT_supply": int(eth_call(pNUT, "0x18160ddd"), 16) / 1e18,',
      '    }',
      '',
      'def calculate_nav(basket, prices):',
      '    """NAV per pNUT. prices = USD per component."""',
      '    total = (basket["cbETH"] * prices["cbETH"] +',
      '             basket["cbBTC"] * prices["cbBTC"] +',
      '             basket["NUT"]   * prices["NUT"] +',
      '             basket["SNUT"]  * prices["SNUT"])',
      '    return total / basket["pNUT_supply"]',
      '',
      'cg = requests.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum,wrapped-bitcoin,coinbase-wrapped-staked-eth&vs_currencies=usd").json()',
      'prices = {',
      '    "cbETH": cg["coinbase-wrapped-staked-eth"]["usd"],',
      '    "cbBTC": cg["wrapped-bitcoin"]["usd"],',
      '    "NUT": nut_usd,    # from V3 price above',
      '    "SNUT": snut_usd,  # from SNUT/NUT Aerodrome pool',
      '}',
      'nav = calculate_nav(get_pnut_basket(), prices)',
      'print(f"pNUT NAV: ${nav:,.2f}")',
    ].join('\n'),
  },
  {
    title: 'Cross-Venue Spread Scanner',
    desc: 'Compare NUT price across all venues, normalize to USD, find the spread. The core cross-venue arb logic.',
    code: [
      'NUT_POOLS = {',
      '    "UniV3":      {"addr": "0xe3ce00e2ed742b142c15eedc208657dd22aa987e", "type": "V3",  "quote": "WETH"},',
      '    "UniV2":      {"addr": "0x997bad8e9f5c34d5e9784caaa8a554a5e6192f53", "type": "V2",  "quote": "WETH"},',
      '    "Aero_AERO":  {"addr": "0x38630fede5e2032652640d98b2d3f9c6296eea5d", "type": "V2",  "quote": "AERO"},',
      '    "Aero_cbBTC": {"addr": "0x15385c9281bc12d2e9bf5c081621944b0ee2acca", "type": "V2",  "quote": "cbBTC"},',
      '}',
      'DECIMALS = {"NUT": 18, "WETH": 18, "AERO": 18, "cbBTC": 8}',
      '',
      'def get_nut_price_usd(pool_info, eth_usd, btc_usd, aero_usd):',
      '    addr = pool_info["addr"]',
      '    if pool_info["type"] == "V3":',
      '        slot0 = eth_call(addr, "0x3850c7bd")',
      '        sqrt_px = int(slot0[2:66], 16)',
      '        ratio = (sqrt_px / 2**96) ** 2',
      '        t0 = "0x" + eth_call(addr, "0x0dfe1681")[26:66]',
      '        if t0.lower() == "0x4200000000000000000000000000000000000006":',
      '            eth_per_nut = 1 / ratio',
      '        else:',
      '            eth_per_nut = ratio',
      '        return eth_per_nut * eth_usd',
      '    else:',
      '        r0, r1 = get_reserves(addr)',
      '        t0 = get_token0(addr)',
      '        quote = pool_info["quote"]',
      '        dec = DECIMALS[quote]',
      '        if t0.lower() == NUT.lower():',
      '            nut_raw, quote_raw = r0, r1',
      '            nut_per_quote = (quote_raw / 10**dec) / (nut_raw / 1e18)',
      '            return nut_per_quote * {"WETH": eth_usd, "AERO": aero_usd, "cbBTC": btc_usd}[quote]',
      '        else:',
      '            quote_raw, nut_raw = r0, r1',
      '            nut_per_quote = (nut_raw / 1e18) / (quote_raw / 10**dec)',
      '            return nut_per_quote * {"WETH": eth_usd, "AERO": aero_usd, "cbBTC": btc_usd}[quote]',
      '',
      'prices = {name: get_nut_price_usd(info, eth_usd, btc_usd, aero_usd) for name, info in NUT_POOLS.items()}',
      'best = max(prices, key=prices.get)',
      'worst = min(prices, key=prices.get)',
      'spread = (prices[best] - prices[worst]) / prices[worst] * 100',
      'print(f"Best: {best} @ ${prices[best]:,.2f}")',
      'print(f"Worst: {worst} @ ${prices[worst]:,.2f}")',
      'print(f"Spread: {spread:.2f}%")',
      'print(f"Worth checking: {spread > 0.5}")  # gas threshold ~0.5%',
    ].join('\n'),
  },
  {
    title: 'Mint Club Price Discovery',
    desc: 'Mint Club bonding-curve tokens are minimal proxy contracts — direct RPC price queries are unreliable. Use the SDK or browser automation.',
    code: [
      '# Bonding curve price = NUT_locked / token_supply',
      '# The displayed UI price is the BUY (mint) price.',
      '# The SELL (burn) price is always lower — this is protocol revenue.',
      '',
      '# Method 1: Browser scraping (recommended)',
      '#   https://mint.club/token/base/SALT',
      '#   https://mint.club/token/base/NUTINO',
      '# Extract from the Statistics section:',
      '#   current supply / max supply, total locked parent token, market cap',
      '',
      '# Method 2: Mint Club V2 SDK',
      '#   npm i mint.club-v2-sdk — docs: https://sdk.mint.club/',
      '',
      '# Method 3: RPC estimation (APPROXIMATE only)',
      'MINT_CLUB_LOCK = "0xc5a076cad94176c2996b32d8466be1ce757faa27"',
      'nut_in_lock = balance_of(NUT, MINT_CLUB_LOCK) / 1e18',
      '# NOTE: this is TOTAL NUT locked across ALL bonding curves, not per-token.',
      '# Per-token locked requires the UI or SDK.',
      '',
      '# BUY price (mint) != SELL price (burn).',
      '# The spread varies with curve position and is the protocol revenue model.',
      '# Snapshot example: NUTINO buy 0.084788 NUT, sell 0.0000000047 NUT.',
      '# Always verify current prices via the SDK before modeling any loop.',
    ].join('\n'),
  },
  {
    title: 'wNUT Wrap Ratio (1:1 check)',
    desc: 'The wrapper holds NUT 1:1 against every wNUT. This ratio should always read exactly 1.00 — a core conservation invariant.',
    code: [
      'WNUT = "0xBA5ED46e31F80dafF307cbf60bd422a6f62E3dd3"',
      'NUT = "0xb8de15fb529d98c93c749de63c749d48d25a30df"',
      '',
      'wnut_supply = int(eth_call(WNUT, "0x18160ddd"), 16) / 1e18',
      'nut_backing = balance_of(NUT, WNUT) / 1e18',
      'print(f"wNUT supply: {wnut_supply}")',
      'print(f"NUT backing: {nut_backing}")',
      'ratio = nut_backing / wnut_supply if wnut_supply else None',
      'print(f"Backing ratio: {ratio:,.4f}" if ratio else "no wNUT in circulation")',
    ].join('\n'),
  },
];

// ═══════════════════════════════════════════════════════════════
// STRATEGY CATALOG — HONEST ASSESSMENTS, FULL DETAIL
// ═══════════════════════════════════════════════════════════════
const STRATEGY_GROUPS = [
  {
    group: 'Cross-Venue',
    strategies: [
      {
        id: 1, emoji: '🔄', name: 'Cross-Venue NUT Arbitrage',
        routeIds: ['NUT-UNI3-UNI2', 'NUT-UNI3-AERO-AERO', 'NUT-UNI3-AERO-CBBTC'],
        venues: 'Uniswap V3 ↔ Uniswap V2 ↔ Aerodrome (NUT/AERO) ↔ Aerodrome (NUT/cbBTC)',
        formula: 'profit = NUT_price_venueB - NUT_price_venueA - 2 × gas - slippage',
        verdict: 'VIABLE in principle — profitability depends on the LIVE spread clearing fees + gas. Past spreads are not guarantees; measure the current spread and execute only when positive after all costs.',
        verdictColor: 'success',
        whatIsIt: 'Classic cross-venue price arbitrage. NUT trades on 4 different DEXs with different quote tokens. When the same token has different prices on different venues, you buy low and sell high.',
        howToUse: '1. Poll all 4 venues every block (Base block time ~2s). 2. Normalize all prices to USD using CoinGecko for quote tokens. 3. Calculate spread between every pair. 4. If spread > threshold, execute buy on cheap venue + sell on expensive venue in same block or next. 5. Use multicall to atomic-execute both legs.',
        whenToUse: 'After large directional trades on one venue. During volatility spikes. When new liquidity is added/removed from one pool. When AERO or cbBTC prices move sharply vs ETH.',
        difficulty: 'Intermediate',
        frequency: 'Event-driven — no fixed cadence. Poll venues, measure the live spread, execute only when positive after all costs.',
        capitalNeeded: '$500+ recommended. Gas is cheap on Base (~$0.10-0.20 per tx) but slippage on small sizes eats profit.',
        prerequisites: 'Base RPC access, USD price feeds for ETH/AERO/cbBTC, understanding of Uniswap V3 slot0 vs V2 getReserves, wallet funded with ETH for gas.',
        profitCondition: 'Spread between any 2 venues > 2 × gas + slippage + quote token conversion cost.',
        risks: 'Different quote tokens complicate comparison. Price moves during cross-venue execution. Liquidity depth varies. V3 pool has deepest liquidity.',
        steps: [
          'Monitor NUT price across all 4 venues via Base RPC',
          'Normalize all prices to USD (WETH→ETH, AERO→AERO, cbBTC→BTC)',
          'Buy NUT on the lowest-price venue',
          'Sell NUT on the highest-price venue',
          'Account for gas (~$0.10-0.20 per tx on Base) and slippage',
        ],
        tokens: ['NUT', 'WETH', 'AERO', 'cbBTC'],
      },
      {
        id: 2, emoji: '🥥', name: 'SNUT Cross-Venue Arbitrage',
        routeIds: ['SNUT-WETH-UNI2', 'SNUT-NUT-AERO', 'SNUT-BALANCER-BASKET'],
        venues: 'Uniswap V2 (SNUT/WETH) ↔ Aerodrome (SNUT/NUT) ↔ Balancer V2 (pNUT basket)',
        formula: 'profit = SNUT_price_venueB - SNUT_price_venueA - 2 × gas - slippage - 1% tax (if applicable)',
        verdict: 'VIABLE WITH CAUTION — SNUT has multiple venues creating real cross-venue spread opportunities. The 1% transfer tax is one cost factor — verify which addresses are tax-exempt before executing. Spreads can exceed 2% during volatility. The pNUT basket provides an additional price reference.',
        verdictColor: 'success',
        whatIsIt: 'SNUT trades on 2 direct venues plus the pNUT basket as an implied reference. When SNUT prices diverge across venues, you buy on the cheapest and sell on the most expensive.',
        howToUse: '1. Get SNUT/WETH price from UniV2 (getReserves). 2. Get SNUT/NUT price from Aerodrome (getReserves). 3. Get SNUT implied price from pNUT basket (NAV component). 4. Normalize all to USD. 5. Buy low, sell high across venues. 6. Account for the 1% SNUT transfer tax on non-exempt addresses.',
        whenToUse: 'During SNUT volatility, after large buys/sells on one venue, when NUT price moves but SNUT lags on one venue.',
        difficulty: 'Advanced',
        frequency: 'Event-driven — occurs when SNUT diverges across venues enough to clear fees + gas + tax.',
        capitalNeeded: '$1,000+ recommended. Tax-exempt routes need less capital but require verification.',
        prerequisites: 'Base RPC for multi-venue price monitoring, SNUT tax-exempt address list, understanding of 9 decimals (NOT 18), NUT price feed, Balancer API for pNUT component.',
        profitCondition: 'Spread between any 2 venues > 2 × gas + slippage + 1% tax (if applicable). Tax-exempt routes only need spread > gas + slippage.',
        risks: 'SNUT 1% transfer tax erodes profits on taxable transfers. SNUT uses 9 decimals (NOT 18). Thin liquidity on SNUT/WETH UniV2. pNUT basket price is implied, not directly tradeable.',
        steps: [
          'Get SNUT/WETH price from UniV2 pool — reserves → SNUT_per_WETH, convert via ETH_USD',
          'Get SNUT/NUT price from Aerodrome pool — reserves → SNUT_per_NUT, convert via NUT_USD',
          'Get SNUT implied price from pNUT basket — NAV component weight × basket value',
          'Compare all three prices in USD — identify highest vs lowest',
          'Buy SNUT on the lowest-price venue, sell on the highest-price venue',
          'Account for the 1% SNUT transfer tax on non-exempt transactions',
        ],
        tokens: ['SNUT', 'NUT', 'WETH', 'pNUT'],
      },
    ],
  },
  {
    group: 'Wrapper Parity',
    strategies: [
      {
        id: 3, emoji: '📦', name: 'wNUT Parity Loop',
        routeIds: ['WNUT-WRAP-UNWRAP'],
        venues: 'NUT ↔ wNUT wrapper (1:1) ↔ Balancer v3 venues (Whorl, grafts)',
        formula: 'profit = |venue_wNUT_price - NUT_price| - gas - venue fee',
        verdict: 'VIABLE — the cleanest loop in the ecosystem. Wrap/unwrap enforces 1:1 parity mechanically; the wrapper has no admin key, so venue price deviations are self-correcting.',
        verdictColor: 'success',
        whatIsIt: 'wNUT is a 1:1 ERC-20 wrapper for NUT with no admin key (audit passed). Any wNUT venue price that deviates from NUT can be corrected by wrapping or unwrapping at exactly 1:1.',
        howToUse: '1. Compare wNUT venue price (Whorl, grafts) vs NUT price. 2. If wNUT trades below NUT: buy wNUT, unwrap for NUT, sell NUT. 3. If wNUT trades above NUT: buy NUT, wrap, sell wNUT. 4. The wrap ratio is a conservation invariant — it should always read exactly 1.00.',
        whenToUse: 'Whenever a wNUT venue price deviates from NUT by more than gas + venue fee. Early-stage graft liquidity makes windows more frequent.',
        difficulty: 'Beginner',
        frequency: 'Event-driven — watch graft and Whorl BPT prices vs NUT.',
        capitalNeeded: 'Small — gas + enough to move the thin venue liquidity.',
        prerequisites: 'Base RPC for the wrap-ratio check (see code block), a wNUT venue to execute against.',
        profitCondition: 'Deviation > gas + venue swap fee.',
        risks: 'Thin early-stage liquidity on graft venues limits size. Venue fees vary. The wrapper itself carries no admin risk (roles renounced, audit passed).',
        steps: [
          'Check the wrap ratio on-chain — NUT backing / wNUT supply should be exactly 1.00',
          'Compare wNUT venue price vs NUT price',
          'If wNUT < NUT: buy wNUT → unwrap → sell NUT',
          'If wNUT > NUT: buy NUT → wrap → sell wNUT',
          'Parity is mechanical — no admin key can break it',
        ],
        tokens: ['NUT', 'wNUT'],
      },
    ],
  },
  {
    group: 'Basket / NAV',
    strategies: [
      {
        id: 4, emoji: '🧺', name: 'pNUT Quad NAV Drift',
        routeIds: ['PNUT-NAV-MINT', 'PNUT-NAV-REDEEM'],
        venues: 'Balancer V2 (mint/redeem BPT) ↔ market',
        formula: 'profit = |market_price - NAV| × pNUT_amount - gas - slippage - exit fees',
        verdict: 'THEORETICALLY VIABLE — most complex arb. Requires monitoring 4 component prices plus the BPT price. Best executed when NUT or SNUT makes a sharp move vs ETH/BTC, causing basket weight drift.',
        verdictColor: 'warning',
        whatIsIt: 'pNUT is a Balancer WeightedPool token (BPT) holding 4 assets at 25% each. Its market price can drift from its Net Asset Value (NAV) when component prices move. You mint or redeem BPT against the basket to capture the premium/discount.',
        howToUse: '1. Monitor pNUT BPT price on Balancer vs calculated NAV. 2. NAV = sum(component_balance × price) / totalSupply — read balances from the V2 Vault. 3. If BPT trades ABOVE NAV: deposit the 4-asset basket to mint BPT, then sell BPT. 4. If BPT trades BELOW NAV: buy BPT, redeem for components, sell components. 5. Account for Balancer swap fees on join/exit.',
        whenToUse: 'When NUT or SNUT makes a sharp move (the volatile components). When cbETH/cbBTC drift changes basket weights. After large pNUT mints or redeems. Low frequency but high value when triggered.',
        difficulty: 'Advanced',
        frequency: 'Rare — a few times per week during volatile periods. Requires 4-component price divergence > 2%.',
        capitalNeeded: '$2,000+ recommended. Must hold or source all 4 basket components (cbETH, cbBTC, NUT, SNUT).',
        prerequisites: 'Balancer V2 SDK or API access, real-time price feeds for all 4 components, understanding of weighted pool math, ability to source and liquidate basket components.',
        profitCondition: '|market_price - NAV| > gas + slippage + basket liquidation cost + Balancer exit fee.',
        risks: 'NAV changes as components move. Redeeming requires selling 4 tokens. Balancer join/exit fees. Low pNUT trading volume.',
        steps: [
          'Calculate NAV from Vault balances (not balanceOf(pNUT) — that is not the basket)',
          'If market > NAV: mint BPT by depositing the basket, sell BPT',
          'If market < NAV: buy BPT, redeem for the basket, sell components',
          'NAV divergence > 2% indicates potential arbitrage',
        ],
        tokens: ['pNUT', 'cbETH', 'cbBTC', 'NUT', 'SNUT'],
      },
      {
        id: 5, emoji: '🌸', name: 'pNUT Whorl NAV',
        routeIds: ['PNUT-WHORL-NAV'],
        venues: 'Balancer V3 (add/remove liquidity) ↔ market',
        formula: 'profit = |BPT_price - NAV| × amount - gas - fees',
        verdict: 'EARLY-STAGE — same NAV mechanics as the Quad on the wNUT-based basket. Immutable deployment (all roles renounced). Monitor as liquidity builds.',
        verdictColor: 'warning',
        whatIsIt: 'The Based Peanut Whorl is the Balancer v3 successor basket: 25% each cbETH, SNUT, wNUT, cbBTC. BPT price vs NAV drift creates the same mint/redeem arb pattern as the Quad.',
        howToUse: '1. Read composition via the Balancer API (V3 Vault). 2. Compute NAV per BPT. 3. Add liquidity proportionally when BPT trades over NAV; remove when under. 4. No admin parameters exist — the deployment is immutable.',
        whenToUse: 'Same pattern as the Quad — when basket components diverge. Early liquidity means wider windows but smaller capacity.',
        difficulty: 'Advanced',
        frequency: 'Event-driven, early-stage.',
        capitalNeeded: 'Component sourcing for proportional adds.',
        prerequisites: 'Balancer v3 router familiarity, component price feeds.',
        profitCondition: 'BPT deviation from NAV > gas + V3 fees.',
        risks: 'Early-stage liquidity. Component sourcing for 4 assets. No admin recourse by design.',
        steps: [
          'Read Whorl composition via the Balancer API',
          'Compute NAV per BPT',
          'Add liquidity proportionally when BPT > NAV; remove when BPT < NAV',
          'Immutable — no admin parameters to change',
        ],
        tokens: ['pNUT', 'wNUT', 'SNUT', 'cbETH', 'cbBTC'],
      },
      {
        id: 6, emoji: '🌻', name: 'Grove Graft NAV',
        routeIds: ['GRAFT-NAV'],
        venues: 'Six Balancer v3 grafts — 20% wNUT rootstock + 40/40 scions',
        formula: 'profit = |graft_BPT_price - NAV| × amount - gas - fees',
        verdict: 'EARLY-STAGE — the same NAV mechanics on each graft. Grafts link NUT (via wNUT rootstock) to each scion market: inference (VVV/DIEM), agents (VIRTUAL/MOR), ether, bitcoin, FX, and tokenized equity. Monitor first; size accordingly.',
        verdictColor: 'warning',
        whatIsIt: 'Sunflower Grove grafts are Balancer v3 weighted pools binding wNUT at 20% rootstock with two 40% scions each. Each graft BPT can drift from NAV — same add/remove pattern as the baskets, on smaller venues.',
        howToUse: '1. Track each graft BPT price vs computed NAV. 2. Divergence beyond fees + gas marks an add/remove window. 3. See /sunflower-grove for the live registry and graft pages.',
        whenToUse: 'When scion markets move but graft BPT prices lag. Early liquidity = wider windows, smaller capacity.',
        difficulty: 'Advanced',
        frequency: 'Event-driven, early-stage.',
        capitalNeeded: 'Scion sourcing for proportional adds.',
        prerequisites: 'Balancer v3 router, scion market price feeds (varies per graft).',
        profitCondition: 'Graft BPT deviation from NAV > gas + fees.',
        risks: 'Early-stage liquidity on all grafts. Scion sourcing varies (tokenized equities have their own market hours).',
        steps: [
          'Track each graft BPT price vs computed NAV',
          'Grafts link NUT (via wNUT rootstock) to each scion market',
          'Divergence beyond fees + gas marks an add/remove window',
          'See /sunflower-grove for the live registry',
        ],
        tokens: ['wNUT', 'VVV', 'DIEM', 'VIRTUAL', 'MOR', 'cbETH', 'wstETH', 'cbBTC', 'tBTC', 'USDC', 'EURC', 'NVDAc', 'AAPLc'],
      },
    ],
  },
  {
    group: 'Bonding-Curve Loops',
    strategies: [
      {
        id: 7, emoji: '🧂', name: 'SALT Loop (Mint Club → Aerodrome)',
        routeIds: ['SALT-MC-AERO-USDC'],
        venues: 'Mint Club (NUT→SALT) → Aerodrome (SALT→USDC)',
        formula: 'forward: profit = SALT_dex_price_USDC - SALT_mint_cost_NUT × NUT_price_USD - gas - 1% royalty\\nreverse: profit = SALT_burn_value_NUT × NUT_price_USD - SALT_dex_price_USDC - gas - 1% royalty',
        verdict: 'CHALLENGING — the bonding curve buy/sell spread is designed as protocol revenue and captures significant value from both directions. Forward is squeezed because DEX price tends below MC buy price; reverse because MC sell price tends below DEX price. Windows open during volatility or liquidity events — monitor for 5-10% divergence.',
        verdictColor: 'warning',
        whatIsIt: 'SALT is a Mint Club bonding curve token backed by NUT. It also trades on Aerodrome against USDC. The curve price and DEX price can diverge, creating a loop: mint SALT on the curve, sell on Aerodrome — or reverse.',
        howToUse: '1. Get SALT mint price from Mint Club (NUT_locked / supply). 2. Get SALT DEX price from Aerodrome (SALT/USDC reserves). 3. Forward: buy NUT → mint SALT on MC → sell SALT on Aerodrome for USDC. 4. Reverse: buy SALT on Aerodrome → burn on MC for NUT → sell NUT. 5. Subtract the 1% royalty on both MC directions.',
        whenToUse: 'When DEX price diverges >5-10% from the bonding curve fair value. During SALT liquidity events, market moves, or when NUT price moves but SALT DEX lags. Most viable during high volatility windows.',
        difficulty: 'Advanced',
        frequency: 'Sporadic — the curve spread captures most value. Windows open during volatility but close fast as arbitrageurs correct the divergence.',
        capitalNeeded: '$200+ for gas coverage, but margins are thin. Larger sizes get worse slippage on both curve and DEX.',
        prerequisites: 'Mint Club V2 SDK or browser automation for curve prices, Aerodrome pool monitoring, understanding of bonding curve mechanics (buy ≠ sell), NUT price feed.',
        profitCondition: 'Forward: SALT DEX price > MC buy price + 1% royalty + gas. Reverse: MC sell price > DEX price + 1% royalty + gas.',
        risks: 'Bonding curve spread captures most value. Supply changes with each trade (price moves against you). DEX liquidity may be thin.',
        steps: [
          'Forward: Buy NUT → Mint SALT on Mint Club → Sell SALT on Aerodrome (SALT/USDC)',
          'Reverse: Buy SALT on Aerodrome → Burn SALT on Mint Club for NUT → Sell NUT',
          'Mint Club BUY price = NUT_locked / supply (from UI or SDK)',
          'Mint Club SELL price is always lower than BUY — protocol revenue',
          '1% royalty on both mint and burn',
        ],
        tokens: ['NUT', 'SALT', 'USDC'],
      },
      {
        id: 8, emoji: '🍫', name: 'NUTINO Loop (Mint Club → Uniswap V2)',
        routeIds: ['NUTINO-MC-UNI2-CBBTC'],
        venues: 'Mint Club (NUT→NUTINO) → Uniswap V2 (NUTINO→cbBTC)',
        formula: 'forward: profit = cbBTC_received × BTC_price - NUT_cost_USD - gas - 1% royalty\\nreverse: profit = NUT_received × NUT_price - cbBTC_cost_USD - gas - 1% royalty',
        verdict: 'CHALLENGING — same curve dynamics as SALT. NUTINO is cbBTC-denominated, adding a BTC volatility dimension that can create wider dislocations. Monitor DEX price vs curve divergence and BTC momentum.',
        verdictColor: 'warning',
        whatIsIt: 'NUTINO is a Mint Club bonding curve token backed by NUT, trading on Uniswap V2 against cbBTC. Same loop concept as SALT but with BTC-denominated pricing.',
        howToUse: '1. Get NUTINO mint price from Mint Club (NUT_locked / supply). 2. Get NUTINO DEX price from UniV2 (NUTINO/cbBTC reserves). 3. Forward: buy NUT → mint NUTINO → sell for cbBTC. 4. Reverse: buy NUTINO → burn for NUT → sell NUT. 5. Subtract 1% royalty. 6. Convert cbBTC to USD for the profit calc.',
        whenToUse: 'During high BTC volatility (cbBTC moves but NUTINO DEX lags). When NUT makes a sharp move and the curve has not caught up. Same 5-10% divergence threshold as SALT.',
        difficulty: 'Advanced',
        frequency: 'Sporadic — similar to SALT but BTC volatility can create wider windows. Still squeezed by the curve spread on most attempts.',
        capitalNeeded: '$200+ for gas. cbBTC denomination means position sizes are effectively in BTC terms. Thin UniV2 liquidity limits size.',
        prerequisites: 'Mint Club V2 SDK, UniV2 pool monitoring, BTC price feed for cbBTC, understanding of bonding curve mechanics, NUT price feed.',
        profitCondition: 'Forward: NUTINO DEX price in cbBTC > MC buy price + 1% royalty + gas. Reverse: MC sell price > DEX price + 1% royalty + gas.',
        risks: 'cbBTC price volatility. Bonding curve spread. UniV2 slippage. Same fundamental issue as the SALT loop.',
        steps: [
          'Forward: Buy NUT → Mint NUTINO on Mint Club → Sell NUTINO on UniV2 (NUTINO/cbBTC)',
          'Reverse: Buy NUTINO on UniV2 → Burn on Mint Club for NUT → Sell NUT',
          'Same curve spread applies — BUY price always > SELL price',
          'cbBTC denominated (8 decimals) — additional BTC/USD conversion needed',
        ],
        tokens: ['NUT', 'NUTINO', 'cbBTC'],
      },
    ],
  },
  {
    group: 'Structural (Monitoring)',
    strategies: [
      {
        id: 9, emoji: '🔥', name: 'SNUT Burn Flywheel',
        routeIds: ['SNUT-BUYBACK-BURN'],
        venues: 'SNUT activity → 1% fee → swapback → buyback/burn + NUT rewards',
        formula: 'price_support = burn_rate / circulating_supply (continuous, non-directional)',
        verdict: 'NOT AN ARB — a structural deflation mechanism. Cannot be arbitraged directly. Relevant for bots that monitor burn rate as a supply-and-flow signal and hold signal.',
        verdictColor: 'neutral',
        whatIsIt: 'SNUT has a built-in deflationary mechanism: the 1% fee on every trade routes through a swapback engine that buys back and burns SNUT. Dead-held SNUT keeps earning NUT rewards. Supply decreases monotonically — no new SNUT is ever minted.',
        howToUse: 'You cannot arbitrage this directly. Instead: 1. Monitor burn rate (dead address SNUT balance growth). 2. Monitor buyback fuel (SNUT contract ETH balance). 3. Use burn rate as a structural support indicator — higher burn = stronger floor. 4. Hold SNUT to participate passively. 5. Track NUT sent to dead (burned NUT) as flywheel intensity.',
        whenToUse: 'Use as a monitoring signal, not a trade. When burn rate accelerates (high volume = more fee = more burns), deflationary pressure increases. When dead-held LP percentage rises, the liquidity floor strengthens.',
        difficulty: 'Beginner (monitoring only)',
        frequency: 'Continuous — every SNUT trade contributes to the burn. Monitor daily/weekly burn rates for trend analysis.',
        capitalNeeded: 'N/A for monitoring. For holding: any amount of SNUT. No gas required to benefit from burns.',
        prerequisites: 'Base RPC for dead address balance queries, SNUT contract read for tax configuration, understanding of deflationary tokenomics.',
        profitCondition: 'Not a tradeable loop — structural support. Hold SNUT to benefit from deflation.',
        risks: 'Fee reduces net transfer size. Burn rate depends on volume. Long-term hold mechanic, not an arbitrage exit.',
        steps: [
          '1% fee on every trade → swapback → ETH routing → NUT rewards + buyback fuel + liquidity',
          'Buybacks send SNUT to the dead address — dead-held SNUT keeps earning NUT rewards',
          'NUT sent to dead is burned → recursive burn flywheel: burn feeds burn',
          '100,000 initial supply, supply decreases monotonically — no new SNUT minted',
          'Fee breakdown: 1% total split 4 ways — liquidity, manager, buyback/burn, NUT rewards (live per-stream via RPC)',
          'Monitor: dead SNUT balance, dead NUT balance, dead LP balance via Base RPC',
        ],
        tokens: ['SNUT', 'NUT'],
      },
    ],
  },
  {
    group: 'Derivatives',
    strategies: [
      {
        id: 10, emoji: '🧬', name: 'SNUT/ETH-LP Meta-Pool Arbitrage',
        routeIds: ['SNUT-ETHLP-META'],
        venues: 'Uniswap V2 (SNUT/ETH-LP/ETH meta-pool) ↔ Uniswap V2 (SNUT/WETH main pool)',
        formula: 'profit = LP_NAV_premium - gas - slippage',
        verdict: 'OPPORTUNISTIC — unique meta-market arb. The LP-token/ETH pool creates a secondary market for SNUT/ETH liquidity claims. Best executed when meta-pool LP price diverges significantly from fair NAV. Low frequency but high potential when triggered.',
        verdictColor: 'warning',
        whatIsIt: 'The SNUT/ETH-LP meta-pool is a Uniswap V2 pool where LP tokens of the main SNUT/ETH pool are traded against ETH. When the meta-pool LP price diverges from the fair NAV of the underlying LP position, you can arbitrage the gap.',
        howToUse: 'Path 1 (LP Premium): when meta-pool LP price > fair NAV — acquire SNUT + ETH, add liquidity to the main pool, sell the LP tokens on the meta-pool. Path 2 (LP Discount): when meta-pool LP price < fair NAV — buy LP tokens on the meta-pool, remove liquidity, sell the components. Path 3 (lag play): LP prices are sticky vs spot — if SNUT drops on the main pool but LP tokens lag on the meta-pool, buy LP, unwrap, sell the SNUT component.',
        whenToUse: 'When meta-pool LP price diverges >1% from fair NAV. During SNUT volatility (LP price is sticky, spot moves fast). After large liquidity adds/removes on the main pool.',
        difficulty: 'Expert',
        frequency: 'Low frequency but high potential. LP token prices are inherently sticky, creating predictable lag-based windows.',
        capitalNeeded: '$500+ recommended. LP addition/removal requires both SNUT and ETH. Meta-pool liquidity may be thin — slippage on large sizes.',
        prerequisites: 'Real-time LP NAV calculation, monitoring both pools simultaneously, understanding of LP token mechanics, SNUT fee awareness on LP transfers.',
        profitCondition: '|meta_pool_LP_price - LP_fair_NAV| > gas + slippage + LP removal/addition fees.',
        risks: 'LP token liquidity on the meta-pool may be thin. Removing liquidity from the main pool affects SNUT price. SNUT fee may apply on LP token transfers. Complex multi-step execution. Must account for pending fees accrued in the LP position.',
        steps: [
          'Path 1 — LP Premium: acquire SNUT + ETH → add liquidity to main pool → receive LP tokens → sell LP on meta-pool for ETH',
          'Path 2 — LP Discount: buy LP tokens on meta-pool → remove liquidity → receive SNUT + ETH → sell SNUT',
          'Path 3 — lag play: if SNUT drops on main pool but LP tokens lag → buy LP, unwrap, sell SNUT component',
          'Calculate LP fair NAV: (SNUT_reserve × SNUT_price + ETH_reserve × ETH_price) / LP_total_supply',
          'Compare meta-pool LP price vs fair NAV — identify discount or premium',
        ],
        tokens: ['SNUT', 'WETH', 'SNUT/ETH-LP'],
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// MINT CLUB BONDING CURVE MECHANICS
// ═══════════════════════════════════════════════════════════════
const MINT_CLUB_FACTS = [
  { label: 'Mechanism', value: 'Mint/burn (NOT AMM swap). New tokens are minted when buying, burned when selling. No LP deposits needed — the curve IS the liquidity.' },
  { label: 'Price Formula', value: 'Bonding curve price = NUT_locked / token_supply. Price increases as supply mints, decreases as supply burns.' },
  { label: 'Buy ≠ Sell', value: 'BUY (mint) price is always higher than SELL (burn) price. The spread is protocol revenue and varies with curve position.' },
  { label: 'Royalty', value: '1% creator royalty on BOTH mint and burn transactions. Deducted from the base asset (NUT).' },
  { label: 'Curve Types', value: 'Exponential (most common), Linear, Logarithmic, Flat. Mint Club uses a Discrete Bonding Curve (DBC) with step arrays.' },
  { label: 'Token Specs', value: 'Max Minting Supply, Initial Minting Price, Final Minting Price, Price Intervals (steps). More steps = smoother price curve.' },
  { label: 'Base Asset', value: 'NUT is the base/reserve asset for all BASED NUT bonding curves. SALT and NUTINO are both backed by NUT.' },
  { label: 'SDK', value: 'npm i mint.club-v2-sdk — official SDK for programmatic interaction. Docs: https://sdk.mint.club/' },
  { label: 'Price Retrieval', value: 'Mint Club tokens are minimal proxy contracts. Direct RPC price queries are unreliable. Use browser automation or the V2 SDK for accurate prices.' },
  { label: 'Why Loops Are Challenging', value: 'Forward: DEX price tends below MC buy price → squeezed. Reverse: MC sell price tends below DEX price → squeezed. The spread captures value from BOTH directions. Windows open during volatility or external liquidity events — monitor for 5-10%+ divergence.' },
];

// ═══════════════════════════════════════════════════════════════
// VENUE INTEL — WITH API ENDPOINTS
// ═══════════════════════════════════════════════════════════════
const VENUES = [
  { name: 'Uniswap V3', type: 'Concentrated AMM', pairs: 'NUT/WETH', fee: '1.0%', notes: 'Primary NUT venue. Use slot0() for price. DEX Screener cannot see this pool — must use Base RPC.', api: 'Base RPC: eth_call slot0() → 0x3850c7bd' },
  { name: 'Uniswap V2', type: 'XYK AMM', pairs: 'NUT/WETH, SNUT/WETH, NUTINO/cbBTC', fee: '0.3%', notes: 'Secondary venues. Use getReserves() for price.', api: 'Base RPC: eth_call getReserves() → 0x0902f1ac' },
  { name: 'Aerodrome', type: 've(3,3) AMM', pairs: 'NUT/AERO, NUT/cbBTC, SALT/USDC, SNUT/NUT', fee: 'Variable', notes: 'Base native DEX. SALT primary venue. SNUT primary venue. Same interface as UniV2.', api: 'Base RPC: getReserves() + token0() for ordering' },
  { name: 'Mint Club', type: 'Bonding Curve', pairs: 'SALT (backed by NUT), NUTINO (backed by NUT)', fee: '1% royalty', notes: 'Mint/burn only. Buy ≠ Sell. Price = NUT_locked / supply. Use SDK or browser for prices.', api: 'SDK: npm i mint.club-v2-sdk | UI: https://mint.club/token/base/{TOKEN}' },
  { name: 'Balancer V2', type: 'Weighted Pool', pairs: 'pNUT Quad (25% each: cbETH, cbBTC, NUT, SNUT)', fee: 'Variable', notes: 'pNUT IS the BPT. NAV = totalLiquidity / totalShares. Mint by depositing basket, redeem to withdraw.', api: 'REST: https://api.balancer.fi/v1/pools/base/{pool_addr} | GraphQL: https://api.thegraph.com/subgraphs/name/balancer-base-v2' },
  { name: 'Balancer V3', type: 'Weighted Pool / reCLAMM', pairs: 'pNUT Whorl, 6 grafts, NUT/SALT reCLAMM, PIPS/USDC reCLAMM', fee: 'Variable', notes: 'v3 venues — immutable weighted pools and reCLAMM. Composition via Balancer API.', api: 'Balancer API + V3 Router: 0x3f170631ed9821Ca51A59D996aB095162438DC10' },
  { name: 'Sudoswap', type: 'NFT AMM', pairs: 'PNUTS, ALMD, SALMD NFT pools', fee: 'Variable', notes: 'Whole-NFT AMM via bonding curves.', api: 'Base RPC: balanceOf() on pool contracts' },
  { name: 'DexScreener', type: 'Price API', pairs: 'All DEX pairs (fallback)', fee: 'Free', notes: 'Good for V2 pools. CANNOT correctly handle the UniV3 NUT/WETH pool. Use as secondary source only.', api: 'GET https://api.dexscreener.com/latest/dex/tokens/{token_addr}' },
  { name: 'CoinGecko', type: 'Price API', pairs: 'ETH, BTC, cbETH (quote tokens only)', fee: 'Free (rate-limited)', notes: 'Use for USD normalization of quote tokens. Do NOT use for NUT ecosystem token prices directly.', api: 'GET https://api.coingecko.com/api/v3/simple/price?ids=ethereum,wrapped-bitcoin,coinbase-wrapped-staked-eth&vs_currencies=usd' },
];

// ═══════════════════════════════════════════════════════════════
// DATA SOURCE HIERARCHY
// ═══════════════════════════════════════════════════════════════
const DATA_SOURCES = [
  { priority: 1, source: 'Base RPC (https://mainnet.base.org)', use: 'Primary for ALL on-chain prices. V3 slot0(), V2 getReserves(), balanceOf(), totalSupply(). The ONLY reliable source for NUT/WETH V3 price.', cost: 'Free' },
  { priority: 2, source: 'DexScreener API', use: 'Secondary for V2/Aerodrome prices and TVL. Handles UniV2 math. CANNOT handle UniV3 NUT/WETH — returns NULL or wrong data.', cost: 'Free' },
  { priority: 3, source: 'Balancer API', use: 'pNUT total liquidity, pool metadata. REST: https://api.balancer.fi/v1/pools/base/{addr}. GraphQL for deeper queries.', cost: 'Free' },
  { priority: 4, source: 'CoinGecko API', use: 'USD prices for quote tokens only (ETH, BTC, cbETH, AERO). Do NOT use for NUT/SNUT/pNUT directly.', cost: 'Free (rate-limited)' },
  { priority: 5, source: 'Mint Club UI / SDK', use: 'Bonding curve prices for SALT and NUTINO. Browser automation or V2 SDK. RPC unreliable for minimal proxy contracts.', cost: 'Free' },
  { priority: 6, source: 'GeckoTerminal API', use: 'Alternative to DexScreener for pool data. Useful for cross-verification.', cost: 'Free' },
];

// ═══════════════════════════════════════════════════════════════
// BOT COMMANDS — DIRECT WIRING REFERENCE FOR AGENTS
// ═══════════════════════════════════════════════════════════════
const BOT_COMMANDS = [
  {
    trigger: '/arb-scan', name: 'Arbitrage Scanner', emoji: '⚔️',
    args: '[NUT|SNUT|pNUT|SALT|NUTINO|all]',
    desc: 'Full arbitrage scanner — cross-venue, pNUT index, and Mint Club loops.',
    scanTypes: ['Cross-Venue (NUT/SNUT)', 'pNUT Index (Volatility)', 'Mint Club Loop (SALT/NUTINO)'],
    impl: [
      'Fetch component prices via CoinGecko: ethereum, bitcoin, coinbase-wrapped-staked-eth',
      'Query UniV3 via slot0() → sqrtPriceX96 → (sqrt/2^96)^2 → price ratio',
      'Query UniV2/Aerodrome via getReserves() → reserve0/reserve1',
      'Always verify token0() to determine price direction (invert if needed)',
      'pNUT basket: balanceOf() for cbETH, cbBTC, NUT, SNUT on the Balancer VAULT',
      'NAV = (cbETH_bal × cbETH_price + cbBTC_bal × cbBTC_price + NUT_bal × NUT_price + SNUT_bal × SNUT_price) / pNUT_supply',
      'Mint Club prices: browse https://mint.club/token/base/SALT or /NUTINO for UI prices',
    ],
    keyData: 'NUT_POOLS: 4 venues (V3, V2, AERO, cbBTC). SNUT_POOLS: 2 venues (NUT, WETH). pNUT: Balancer V2 WeightedPool. MINT_CLUB: SALT/USDC, NUTINO/cbBTC.',
    verdict: 'MOST COMPREHENSIVE — covers all 3 arb types in one scan. Use as the primary monitoring command.',
  },
  {
    trigger: '/loop-scan', name: 'Loop Arbitrage Scanner', emoji: '🔄',
    args: '[SALT|NUTINO|all]',
    desc: 'Detailed loop arbitrage analysis for Mint Club bonding curve tokens (SALT, NUTINO).',
    scanTypes: ['Forward Loop (Mint → DEX)', 'Reverse Loop (DEX → Burn)', 'Cross-DEX Spread'],
    impl: [
      'Get Mint Club buy/sell prices via UI or SDK (npm i mint.club-v2-sdk)',
      'Get DEX pool prices via Base RPC',
      'Forward: Buy NUT → Mint token on Mint Club → Sell on DEX',
      'Reverse: Buy token on DEX → Burn on Mint Club for NUT → Sell NUT',
      'Account for 1% royalty on both mint and burn directions',
      'Bonding curve: BUY price > SELL price always (protocol revenue)',
      'Supply changes with each trade (price moves against you)',
    ],
    keyData: 'SALT: Mint Club (NUT→SALT) → Aerodrome (SALT→USDC). NUTINO: Mint Club (NUT→NUTINO) → UniV2 (NUTINO→cbBTC). 1% royalty both ways.',
    verdict: 'SPECIALIZED — deeper analysis of Mint Club loops than /arb-scan. Use for focused SALT/NUTINO monitoring.',
  },
  {
    trigger: '/token-info', name: 'Token Info', emoji: '📊',
    args: '<TOKEN> (NUT/SNUT/pNUT/NUTINO/SALT)',
    desc: 'Comprehensive token info — prices, TVL, distribution, and pool data.',
    scanTypes: ['Price (DexScreener primary, RPC fallback)', 'TVL (sum of pools)', 'Pool Identification'],
    impl: [
      'Primary: DexScreener API — GET https://api.dexscreener.com/latest/dex/tokens/{addr}',
      'Select highest-liquidity pair from response',
      'Fallback: Base RPC with strict token0 verification',
      'V3 fallback: slot0() → sqrtPriceX96, verify token0 via 0x0dfe1681',
      'V2 fallback: getReserves(), verify token0, apply correct decimals',
      'pNUT: Balancer API — GET https://api.balancer.fi/v1/pools/base/{addr}',
      'Quote prices: CoinGecko for ETH, BTC, AERO in USD',
    ],
    keyData: 'DexScreener CANNOT handle UniV3 — returns NULL or wrong data. Use RPC slot0() for UniV3. pNUT uses Balancer API, not DEX. SNUT=9 decimals, cbBTC=8, USDC=6.',
    verdict: 'ESSENTIAL — first command to run for any token. Use before executing arb trades to verify current state.',
  },
  {
    trigger: '/nut-status', name: 'NUT Ecosystem Status', emoji: '🌰',
    args: '[none]',
    desc: 'Full ecosystem status — market data, price, MCAP, TVL, and NUT distribution.',
    scanTypes: ['Market Overview', 'Price Aggregation', 'Distribution Analysis'],
    impl: [
      'Aggregate prices across all venues for each token',
      'Calculate combined TVL across all pools',
      'Fetch NUT distribution: balanceOf() on key addresses (Mint Club Lock, Balancer, pools)',
      'Display MCAP = NUT price × 1 (unity token — TRUE MCAP = price)',
      'Show SNUT burn rate and deflationary status',
      'Cross-reference with DexScreener for accuracy',
    ],
    keyData: 'NUT supply=1 (unity). TRUE MCAP = price. Mint Club Lock: 0xc5a076… holds NUT reserves. SNUT supply=100,000, deflationary.',
    verdict: 'OVERVIEW — use for dashboard-style ecosystem monitoring. Best for periodic health checks.',
  },
  {
    trigger: '/pools', name: 'Pool Status', emoji: '💧',
    args: '[NUT|SNUT|SALT|NUTINO|pNUT|NFT]',
    desc: 'All liquidity pools with addresses, flavors, and live reserve status.',
    scanTypes: ['Reserve Query', 'Pool Identification', 'Liquidity Depth'],
    impl: [
      'Query getReserves() (0x0902f1ac) for each V2 pool',
      'Query slot0() (0x3850c7bd) for V3 pool',
      'Apply correct decimals per token (SNUT=9, cbBTC=8, USDC=6)',
      'Calculate TVL = reserve × token_price for both sides',
      'Display pool flavors (Extra Crunchy Delight, Golden Butter Drizzle, etc.)',
      'NFT pools: totalSupply() for minted count',
    ],
    keyData: 'Full registry on this page — 21 pools across 5 groups. Plus 3 NFT Sudoswap pools.',
    verdict: 'STRUCTURAL — use to identify which pools have deepest liquidity before executing arb routes.',
  },
  {
    trigger: '/nft-status', name: 'NFT Status', emoji: '🖼️',
    args: '[none]',
    desc: 'NFT collection status — minted counts and Sudoswap pools.',
    scanTypes: ['Supply Query', 'Sudoswap Pool Balances'],
    impl: [
      'Query totalSupply() (0x18160ddd) for each NFT contract',
      'Check Sudoswap pool balances for whole-NFT inventory',
      'Collections: PNUTS (251), ALMD (424), SALMD (6,238), PNUTRMY (5,013)',
    ],
    keyData: 'PNUTS: 0x794fcD… (251 minted). ALMD: 0x1A1604… (424). SALMD: 0x1E0f80… (6,238). PNUTRMY: 0xF07530… (5,013). Sudoswap pools for 3 of 4.',
    verdict: 'MONITORING — collection status tool. Low-liquidity NFT venue.',
  },
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
    SNUT_NUT: { addr: '0x893faaa7baf7a8247fc7142afb28e13d51a5aae8', type: 'V2', token0: 'SNUT', token1: 'NUT' },
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
// COMPONENT — MUI v7 Grid API (size prop)
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
    { id: 'mintclub', label: '🏭 Mint Club' },
    { id: 'strategies', label: '⚔️ Strategies' },
    { id: 'venues', label: '🏠 Venues' },
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

  const difficultyColors = {
    'Beginner': { bg: 'rgba(34,139,34,0.08)', border: 'rgba(34,139,34,0.2)', text: '#2e7d32' },
    'Beginner (monitoring only)': { bg: 'rgba(34,139,34,0.08)', border: 'rgba(34,139,34,0.2)', text: '#2e7d32' },
    'Intermediate': { bg: 'rgba(21,101,192,0.08)', border: 'rgba(21,101,192,0.2)', text: '#1565c0' },
    'Advanced': { bg: 'rgba(230,81,0,0.08)', border: 'rgba(230,81,0,0.2)', text: '#e65100' },
    'Expert': { bg: 'rgba(198,40,40,0.08)', border: 'rgba(198,40,40,0.2)', text: '#c62828' },
  };

  const severityStyles = {
    high: { border: '1px solid rgba(139,90,43,0.3)', bg: 'rgba(255,244,224,0.75)' },
    medium: { border: '1px solid rgba(139,90,43,0.15)', bg: 'rgba(255,252,245,0.85)' },
    info: { border: '1px solid rgba(139,90,43,0.1)', bg: 'rgba(255,252,245,0.7)' },
  };

  const SectionTitle = ({ icon, children }) => (
    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4A2F1A', mb: 0.5, mt: 1 }}>
      {icon} {children}
    </Typography>
  );

  const SectionDesc = ({ children }) => (
    <Typography sx={{ fontSize: '0.85rem', color: 'rgba(40,40,60,0.65)', mb: 2 }}>
      {children}
    </Typography>
  );

  const GroupLabel = ({ children }) => (
    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#6B3D20', mb: 1.5, borderBottom: '2px solid rgba(139,90,43,0.15)', pb: 0.5 }}>
      {children}
    </Typography>
  );

  return (
    <Layout>
      <Head>
        <title>Arb Bot Builder | BASED NUT</title>
        <meta name="description" content="On-chain reference for the BASED NUT ecosystem on Base: verified token and pool addresses, read patterns, strategy catalog, and a machine-readable spec for trading and monitoring agents." />
      </Head>

      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
        {/* ══ HEADER ══ */}
        <Box sx={{ mb: 2, p: { xs: 2, md: 3 }, borderRadius: 3, background: 'linear-gradient(135deg, #4A2F1A 0%, #6B3D20 50%, #8B5A2B 100%)', color: '#FAF3E6' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>⚔️ Arb Bot Builder</Typography>
          <Typography sx={{ opacity: 0.85, fontSize: '0.9rem', mb: 1 }}>
            On-chain reference for agents and developers working with BASED NUT on Base — verified addresses, read patterns, strategy catalog, and one machine-readable spec. Addresses are snapshot-verified; re-verify live state before executing.
          </Typography>
          <Box sx={{ mt: 1, p: 1.5, borderRadius: 2, background: 'rgba(255,252,245,0.12)', border: '1px solid rgba(255,252,245,0.2)' }}>
            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(250,243,230,0.9)', lineHeight: 1.5 }}>
              🧭 Model = facts that change how you price · 🥜 Tokens + 💧 Pools = the verified registry · 🏭 Infra = vaults, factories, NFTs · 🔧 Reads = selectors + Python · 🏭 Mint Club = curve mechanics · ⚔️ Strategies = the full catalog with honest verdicts · 🏠 Venues = where everything trades · ⚙️ Spec = one JSON · 🚀 Start = build order.
            </Typography>
          </Box>
        </Box>

        {/* ══ NOTE ══ */}
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
          bgcolor: 'rgba(255,252,245,0.9)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(139,90,43,0.1)',
          '&::-webkit-scrollbar': { height: 3 },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(139,69,19,0.2)', borderRadius: 2 },
        }}>
          {navItems.map((item) => (
            <Box
              key={item.id}
              onClick={() => scrollTo(item.id)}
              sx={{
                px: 1.5, py: 0.5, borderRadius: 999, flexShrink: 0,
                fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer',
                color: activeSection === item.id ? '#fff' : '#5D4037',
                background: activeSection === item.id ? 'linear-gradient(135deg, #8B4513, #A0522D)' : 'transparent',
                border: '1px solid',
                borderColor: activeSection === item.id ? '#6B3D20' : 'rgba(139,69,19,0.1)',
                transition: 'all 0.2s ease',
                '&:hover': { background: activeSection === item.id ? 'linear-gradient(135deg, #A0522D, #B87333)' : 'rgba(139,69,19,0.06)' },
              }}
            >{item.label}</Box>
          ))}
        </Box>

        {/* ══ MODEL ══ */}
        <Box id="model" sx={{ mb: 4, scrollMarginTop: 60 }}>
          <SectionTitle icon="🧭">Ecosystem Model</SectionTitle>
          <SectionDesc>The structural facts that change how an agent prices these markets. Everything else on this page assumes these.</SectionDesc>
          <Grid container spacing={1.5}>
            {MODEL_NOTES.map((n, i) => (
              <Grid key={i} size={{ xs: 12, md: 6 }}>
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
        <Box id="tokens" sx={{ mb: 4, scrollMarginTop: 60 }}>
          <SectionTitle icon="🥜">Token Registry</SectionTitle>
          <SectionDesc>All ecosystem tokens and reserve assets. Addresses snapshot-verified on Base. Supplies shown at snapshot; live metrics on each token page.</SectionDesc>
          {TOKEN_GROUPS.map((g) => (
            <Box key={g.group} sx={{ mb: 3 }}>
              <GroupLabel>{g.group}</GroupLabel>
              <Grid container spacing={1.5}>
                {g.tokens.map((t) => (
                  <Grid key={t.name} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box sx={{
                      p: 1.5, borderRadius: 2, height: '100%',
                      border: '1px solid rgba(139,90,43,0.15)',
                      background: 'rgba(255,252,245,0.85)',
                      transition: 'all 0.2s ease',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(90,60,30,0.1)' },
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#4A2F1A' }}>{t.emoji} {t.name}</Typography>
                        <Box sx={{ px: 0.75, py: 0.15, borderRadius: 1, background: 'rgba(139,90,43,0.1)', fontSize: '0.68rem', fontWeight: 700, color: '#6B3D20' }}>{t.decimals}d</Box>
                        {t.href ? (
                          <Link href={t.href} style={{ fontSize: '0.68rem', color: '#8B5A2B', fontWeight: 600, textDecoration: 'none' }}>Profile →</Link>
                        ) : (
                          <Box sx={{ px: 0.75, py: 0.15, borderRadius: 1, background: 'rgba(0,0,0,0.03)', fontSize: '0.68rem', fontWeight: 600, color: 'rgba(40,40,60,0.4)' }}>Quote</Box>
                        )}
                      </Box>
                      <Box component="code" sx={{ display: 'block', fontSize: '0.7rem', color: 'rgba(40,40,60,0.6)', mb: 0.5, fontFamily: 'monospace', wordBreak: 'break-all' }}>{t.address}</Box>
                      <Typography sx={{ fontSize: '0.68rem', color: 'rgba(40,40,60,0.45)', mb: 0.5 }}>Supply: {t.supply}</Typography>
                      <Typography sx={{ fontSize: '0.76rem', color: 'rgba(40,40,60,0.7)', lineHeight: 1.5 }}>{t.role}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>

        {/* ══ POOLS ══ */}
        <Box id="pools" sx={{ mb: 4, scrollMarginTop: 60 }}>
          <SectionTitle icon="💧">Pool Registry</SectionTitle>
          <SectionDesc>Every venue, grouped by role. token0/token1 orderings are as listed — verify on-chain before dividing reserves.</SectionDesc>
          {POOL_GROUPS.map((g) => (
            <Box key={g.group} sx={{ mb: 3 }}>
              <GroupLabel>{g.group}</GroupLabel>
              <Grid container spacing={1.5}>
                {g.pools.map((p) => (
                  <Grid key={p.address} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box sx={{
                      p: 1.5, borderRadius: 2, height: '100%',
                      border: '1px solid rgba(139,90,43,0.15)',
                      background: 'rgba(255,252,245,0.85)',
                      transition: 'all 0.2s ease',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(90,60,30,0.1)' },
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#4A2F1A' }}>{p.name}</Typography>
                        <Box sx={{ px: 0.75, py: 0.15, borderRadius: 1, background: 'rgba(139,90,43,0.1)', fontSize: '0.68rem', fontWeight: 700, color: '#6B3D20' }}>{p.platform}</Box>
                      </Box>
                      <Typography sx={{ fontSize: '0.72rem', color: '#8B6914', fontStyle: 'italic', mb: 0.5 }}>“{p.flavor}”</Typography>
                      <Box component="code" sx={{ display: 'block', fontSize: '0.7rem', color: 'rgba(40,40,60,0.6)', mb: 0.5, fontFamily: 'monospace', wordBreak: 'break-all' }}>{p.address}</Box>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(40,40,60,0.55)', mb: 0.5 }}>pair: {p.pair}</Typography>
                      <Typography sx={{ fontSize: '0.76rem', color: 'rgba(40,40,60,0.7)', lineHeight: 1.5 }}>{p.notes}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>

        {/* ══ INFRA & NFT ══ */}
        <Box id="infra" sx={{ mb: 4, scrollMarginTop: 60 }}>
          <SectionTitle icon="🏭">Infrastructure & NFTs</SectionTitle>
          <SectionDesc>Vaults, factories, and burn sinks that hold or route ecosystem assets — plus the NFT collections.</SectionDesc>
          <Grid container spacing={1.5} sx={{ mb: 3 }}>
            {INFRA.map((v) => (
              <Grid key={v.address} size={{ xs: 12, sm: 6, md: 4 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, height: '100%', border: '1px solid rgba(139,90,43,0.15)', background: 'rgba(255,252,245,0.85)' }}>
                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#4A2F1A', mb: 0.5 }}>{v.name}</Typography>
                  <Box component="code" sx={{ display: 'block', fontSize: '0.7rem', color: 'rgba(40,40,60,0.6)', mb: 0.75, fontFamily: 'monospace', wordBreak: 'break-all' }}>{v.address}</Box>
                  <Typography sx={{ fontSize: '0.76rem', color: 'rgba(40,40,60,0.7)', lineHeight: 1.5 }}>{v.purpose}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <GroupLabel>🖼️ NFT Collections</GroupLabel>
          <Grid container spacing={1.5}>
            {NFTS.map((nft) => (
              <Grid key={nft.name} size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, height: '100%', border: '1px solid rgba(139,90,43,0.15)', background: 'rgba(255,252,245,0.85)' }}>
                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#4A2F1A' }}>{nft.emoji} {nft.name} — {nft.label}</Typography>
                  <Box component="code" sx={{ display: 'block', fontSize: '0.7rem', color: 'rgba(40,40,60,0.6)', my: 0.5, fontFamily: 'monospace', wordBreak: 'break-all' }}>{nft.address}</Box>
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
        <Box id="reads" sx={{ mb: 4, scrollMarginTop: 60 }}>
          <SectionTitle icon="🔧">Read Reference</SectionTitle>
          <SectionDesc>The pricing subset of the read ABI — enough to price every market on this page. Execution (approve, swap, join/exit) needs each contract's full ABI.</SectionDesc>

          <Box sx={{ mb: 3, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
              <thead>
                <tr style={{ background: 'rgba(139,90,43,0.08)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', borderRadius: '6px 0 0 6px' }}>Selector</th>
                  <th style={{ padding: '8px 10px' }}>Function</th>
                  <th style={{ padding: '8px 10px' }}>Use</th>
                  <th style={{ padding: '8px 10px', borderRadius: '0 6px 6px 0' }}>Returns</th>
                </tr>
              </thead>
              <tbody>
                {FUNCTION_SIGS.map((f) => (
                  <tr key={f.sig} style={{ borderBottom: '1px solid rgba(139,90,43,0.08)' }}>
                    <td style={{ padding: '7px 10px', fontFamily: 'monospace', color: '#6B3D20', fontWeight: 700 }}>{f.sig}</td>
                    <td style={{ padding: '7px 10px', fontFamily: 'monospace' }}>{f.name}</td>
                    <td style={{ padding: '7px 10px', color: 'rgba(40,40,60,0.75)' }}>{f.desc}</td>
                    <td style={{ padding: '7px 10px', fontFamily: 'monospace', color: 'rgba(40,40,60,0.55)', fontSize: '0.7rem' }}>{f.returns}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          <GroupLabel>🐍 Copy-pasteable Python — no Web3 library required</GroupLabel>
          <Grid container spacing={1.5}>
            {CODE_BLOCKS.map((block, i) => (
              <Grid key={block.title} size={{ xs: 12 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid rgba(139,90,43,0.15)', background: 'rgba(255,252,245,0.85)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setExpandedCode(expandedCode === i ? null : i)}>
                    <Box sx={{ pr: 1 }}>
                      <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#4A2F1A' }}>{block.title}</Typography>
                      <Typography sx={{ fontSize: '0.76rem', color: 'rgba(40,40,60,0.6)' }}>{block.desc}</Typography>
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

        {/* ══ MINT CLUB ══ */}
        <Box id="mintclub" sx={{ mb: 4, scrollMarginTop: 60 }}>
          <SectionTitle icon="🏭">Mint Club Bonding Curve Mechanics</SectionTitle>
          <SectionDesc>Critical for understanding curve dynamics and why loop arbitrage is challenging but not impossible. SALT and NUTINO are Mint Club tokens backed by NUT.</SectionDesc>
          <Grid container spacing={1.5}>
            {MINT_CLUB_FACTS.map((f, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, height: '100%', border: '1px solid rgba(139,90,43,0.15)', background: 'rgba(255,252,245,0.85)' }}>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#4A2F1A', mb: 0.25 }}>{f.label}</Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: 'rgba(40,40,60,0.7)', lineHeight: 1.45 }}>{f.value}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* pNUT Index explainer */}
          <Box sx={{ mt: 3, p: 2, borderRadius: 2, background: 'rgba(255,252,245,0.85)', border: '1px solid rgba(139,90,43,0.15)' }}>
            <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#4A2F1A', mb: 1 }}>🧺 pNUT Quad Index — NAV & Arbitrage</Typography>
            <Box component="pre" sx={{ p: 1.5, borderRadius: 1.5, background: 'rgba(2,6,23,0.92)', color: '#e2e8f0', fontSize: '0.7rem', lineHeight: 1.5, overflowX: 'auto', whiteSpace: 'pre' }}>
{`pNUT address:  ${pNUT_POOL_ID.slice(0, 42)}
Pool ID:        ${pNUT_POOL_ID}
Balancer URL:   ${BALANCER_URL}

NAV = (cbETH_balance × cbETH_price +
       cbBTC_balance × cbBTC_price +
       NUT_balance   × NUT_price   +
       SNUT_balance  × SNUT_price) / pNUT_totalSupply

Arbitrage:
  If market > NAV → Mint BPT (deposit basket), sell pNUT
  If market < NAV → Buy pNUT, redeem BPT (withdraw basket)

Volatility play:
  NUT/SNUT move vs cbETH/cbBTC → basket weights drift → NAV diverges
  Track: NUT/ETH correlation, SNUT/NUT spread, component drift %`}
            </Box>
            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(40,40,60,0.65)', lineHeight: 1.45, mt: 1 }}>
              pNUT is NOT traded on standard DEXs. It is minted by depositing the basket into Balancer and redeemed by withdrawing. The "market price" is the BPT price on Balancer. NAV divergence {'>'} 2% indicates potential arbitrage. This is the most complex arb in the ecosystem — requires monitoring 4 component prices simultaneously.
            </Typography>
          </Box>
        </Box>

        {/* ══ STRATEGIES ══ */}
        <Box id="strategies" sx={{ mb: 4, scrollMarginTop: 60 }}>
          <SectionTitle icon="⚔️">Strategy Catalog — Honest Assessments</SectionTitle>
          <SectionDesc>
            Each strategy is self-contained: what it is, how to execute, when to deploy, difficulty, frequency, capital, prerequisites, profit condition, risks, and an honest verdict. Verdicts are not upgraded — start with beginner-friendly loops (9, 1, 3) before attempting advanced (4, 6, 7, 8, 10).
          </SectionDesc>
          {STRATEGY_GROUPS.map((g) => (
            <Box key={g.group} sx={{ mb: 3 }}>
              <GroupLabel>{g.group}</GroupLabel>
              <Grid container spacing={2}>
                {g.strategies.map((s) => {
                  const vc = verdictColors[s.verdictColor] || verdictColors.neutral;
                  const dc = difficultyColors[s.difficulty] || difficultyColors.Advanced;
                  return (
                    <Grid key={s.id} size={{ xs: 12, md: 6 }}>
                      <Box sx={{
                        p: 2, borderRadius: 3, height: '100%',
                        background: 'rgba(255,252,245,0.9)',
                        border: '1px solid rgba(139,90,43,0.15)',
                        boxShadow: '0 2px 8px rgba(90,60,30,0.06)',
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#4A2F1A' }}>{s.emoji} {s.name}</Typography>
                          <IconButton size="small" onClick={() => setExpandedStrategy(expandedStrategy === s.id ? null : s.id)}>
                            {expandedStrategy === s.id ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                          </IconButton>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1, alignItems: 'center' }}>
                          <Box sx={{ px: 0.75, py: 0.2, borderRadius: 999, fontSize: '0.65rem', fontWeight: 700, color: dc.text, background: dc.bg, border: `1px solid ${dc.border}` }}>{s.difficulty}</Box>
                          {s.routeIds.map((r) => (
                            <Box key={r} sx={{ px: 0.75, py: 0.15, borderRadius: 1, background: 'rgba(2,6,23,0.04)', fontSize: '0.68rem', fontFamily: 'monospace', color: 'rgba(40,40,60,0.7)' }}>{r}</Box>
                          ))}
                        </Box>
                        <Box sx={{ p: 0.75, borderRadius: 1, background: vc.bg, border: `1px solid ${vc.border}`, mb: 1 }}>
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: vc.text }}>VERDICT: {s.verdict}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.78rem', color: 'rgba(40,40,60,0.75)', mb: 0.5 }}><strong>What:</strong> {s.whatIsIt}</Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: 'rgba(40,40,60,0.75)', mb: 0.5 }}><strong>Venues:</strong> {s.venues}</Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: 'rgba(40,40,60,0.75)', mb: 0.5 }}><strong>When:</strong> {s.whenToUse}</Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: 'rgba(40,40,60,0.55)', mb: 1 }}><strong>Freq:</strong> {s.frequency} · <strong>Capital:</strong> {s.capitalNeeded}</Typography>
                        <Box sx={{ p: 0.75, borderRadius: 1, background: 'rgba(2,6,23,0.03)', mb: 1, overflowX: 'auto' }}>
                          <code style={{ fontSize: '0.68rem', color: 'rgba(40,40,60,0.8)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{s.formula}</code>
                        </Box>
                        <Collapse in={expandedStrategy === s.id} timeout="auto" unmountOnExit>
                          <Box sx={{ pt: 1, borderTop: '1px solid rgba(139,90,43,0.1)' }}>
                            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#8B6914', mb: 0.25 }}>How to Execute</Typography>
                            <Typography sx={{ fontSize: '0.74rem', color: 'rgba(40,40,60,0.7)', mb: 1, lineHeight: 1.45 }}>{s.howToUse}</Typography>
                            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#8B6914', mb: 0.5 }}>Steps</Typography>
                            {s.steps.map((step, j) => (
                              <Box key={j} sx={{ display: 'flex', gap: 0.5, mb: 0.25 }}>
                                <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#CD7F32', minWidth: 16 }}>{j + 1}.</Typography>
                                <Typography sx={{ fontSize: '0.74rem', color: 'rgba(40,40,60,0.75)', lineHeight: 1.35 }}>{step}</Typography>
                              </Box>
                            ))}
                            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#8B6914', mt: 1, mb: 0.25 }}>Profit Condition</Typography>
                            <Typography sx={{ fontSize: '0.74rem', color: 'rgba(40,40,60,0.7)', mb: 1 }}>{s.profitCondition}</Typography>
                            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#8B6914', mb: 0.25 }}>Risks</Typography>
                            <Typography sx={{ fontSize: '0.74rem', color: 'rgba(40,40,60,0.7)', mb: 1 }}>{s.risks}</Typography>
                            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#8B6914', mb: 0.25 }}>Prerequisites</Typography>
                            <Typography sx={{ fontSize: '0.74rem', color: 'rgba(40,40,60,0.7)', mb: 1 }}>{s.prerequisites}</Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {s.tokens.map((t) => (
                                <Link key={t} href={`/token/${t.toLowerCase().replace(/[^a-z0-9]/g, '')}`} style={{ textDecoration: 'none' }}>
                                  <Box sx={{ px: 0.75, py: 0.15, borderRadius: 1, fontSize: '0.68rem', fontWeight: 600, color: '#8B5A2B', cursor: 'pointer', background: 'rgba(139,90,43,0.06)', border: '1px solid rgba(139,90,43,0.1)', '&:hover': { background: 'rgba(139,90,43,0.12)' } }}>{t} →</Box>
                                </Link>
                              ))}
                            </Box>
                          </Box>
                        </Collapse>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          ))}

          {/* Bot commands */}
          <GroupLabel>🤖 Bot Commands — Direct Wiring Reference</GroupLabel>
          <Grid container spacing={2}>
            {BOT_COMMANDS.map((cmd) => (
              <Grid key={cmd.trigger} size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2, borderRadius: 2, height: '100%', background: 'rgba(255,252,245,0.9)', border: '1px solid rgba(139,90,43,0.15)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography sx={{ fontSize: '1.1rem' }}>{cmd.emoji}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#4A2F1A' }}>{cmd.name}</Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: 'rgba(40,40,60,0.5)' }}>{cmd.desc}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ p: 0.75, borderRadius: 1, background: 'rgba(2,6,23,0.04)', mb: 1 }}>
                    <code style={{ fontSize: '0.75rem', color: '#8B5A2B', fontWeight: 600 }}>{cmd.trigger} {cmd.args}</code>
                  </Box>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#8B6914', mb: 0.5 }}>Scan Types</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {cmd.scanTypes.map((st) => (
                      <Box key={st} sx={{ px: 0.75, py: 0.25, borderRadius: 1, background: 'rgba(139,90,43,0.08)', fontSize: '0.68rem', color: 'rgba(40,40,60,0.65)' }}>{st}</Box>
                    ))}
                  </Box>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#8B6914', mb: 0.5 }}>Implementation Steps</Typography>
                  <Box sx={{ mb: 1 }}>
                    {cmd.impl.map((step, i) => (
                      <Typography key={i} sx={{ fontSize: '0.72rem', color: 'rgba(40,40,60,0.65)', lineHeight: 1.5, pl: 1.5, position: 'relative' }}>
                        <Box component="span" sx={{ position: 'absolute', left: 0, color: '#8B5A2B', fontWeight: 700 }}>{i + 1}.</Box> {step}
                      </Typography>
                    ))}
                  </Box>
                  <Box sx={{ p: 1, borderRadius: 1, background: 'rgba(2,6,23,0.03)', mb: 1 }}>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#8B6914', mb: 0.25 }}>Key Data</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: 'rgba(40,40,60,0.6)', lineHeight: 1.45 }}>{cmd.keyData}</Typography>
                  </Box>
                  <Box sx={{ p: 0.75, borderRadius: 1, background: 'rgba(34,139,34,0.05)' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: 'rgba(40,40,60,0.65)', lineHeight: 1.4 }}><strong style={{ color: '#8B5A2B' }}>Verdict:</strong> {cmd.verdict}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ══ VENUES ══ */}
        <Box id="venues" sx={{ mb: 4, scrollMarginTop: 60 }}>
          <SectionTitle icon="🏠">Venue Intel & API Endpoints</SectionTitle>
          <SectionDesc>Where each token trades and which API reads it. Includes the data-source hierarchy for price polling.</SectionDesc>
          <Box sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(139,90,43,0.12)' }}>
            {VENUES.map((v, i) => (
              <Box key={v.name} sx={{
                p: 1.25, display: 'flex', alignItems: 'flex-start', gap: 1.5,
                background: i % 2 === 0 ? 'rgba(255,252,245,0.9)' : 'rgba(255,252,245,0.6)',
                borderBottom: i < VENUES.length - 1 ? '1px solid rgba(139,90,43,0.08)' : 'none',
              }}>
                <Box sx={{ minWidth: 120, flexShrink: 0 }}>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#4A2F1A' }}>{v.name}</Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: 'rgba(40,40,60,0.5)' }}>{v.type} · {v.fee}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: 'rgba(40,40,60,0.65)', mb: 0.25 }}><strong>Pairs:</strong> {v.pairs}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'rgba(40,40,60,0.55)', mb: 0.25 }}>{v.notes}</Typography>
                  <Box sx={{ p: 0.5, borderRadius: 0.5, background: 'rgba(2,6,23,0.03)', display: 'inline-block' }}>
                    <code style={{ fontSize: '0.68rem', color: 'rgba(40,40,60,0.6)' }}>{v.api}</code>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          <GroupLabel>📊 Data Source Hierarchy</GroupLabel>
          <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(139,90,43,0.12)' }}>
            {DATA_SOURCES.map((d, i) => (
              <Box key={d.source} sx={{
                p: 1.25, display: 'flex', alignItems: 'flex-start', gap: 1.5,
                background: i % 2 === 0 ? 'rgba(255,252,245,0.9)' : 'rgba(255,252,245,0.6)',
                borderBottom: i < DATA_SOURCES.length - 1 ? '1px solid rgba(139,90,43,0.08)' : 'none',
              }}>
                <Box sx={{ minWidth: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #8B4513, #A0522D)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{d.priority}</Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#4A2F1A' }}>{d.source}</Typography>
                  <Typography sx={{ fontSize: '0.76rem', color: 'rgba(40,40,60,0.65)', lineHeight: 1.4 }}>{d.use}</Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: 'rgba(40,40,60,0.4)' }}>Cost: {d.cost}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ══ SPEC ══ */}
        <Box id="spec" sx={{ mb: 4, scrollMarginTop: 60 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4A2F1A' }}>⚙️ Machine-Readable Spec</Typography>
            <Box onClick={copySpec} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: 1, background: 'rgba(139,90,43,0.08)', border: '1px solid rgba(139,90,43,0.15)', '&:hover': { background: 'rgba(139,90,43,0.12)' } }}>
              <ContentCopy sx={{ fontSize: '0.9rem', color: '#8B5A2B' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#8B5A2B' }}>{specCopied ? 'Copied!' : 'Copy JSON'}</Typography>
            </Box>
          </Box>
          <Typography sx={{ fontSize: '0.85rem', color: 'rgba(40,40,60,0.65)', mb: 2 }}>
            One JSON with the full registry — tokens, pools, infrastructure, selectors, routes, APIs. Copy it into your bot's context.
          </Typography>
          <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(2,6,23,0.03)', border: '1px solid rgba(2,6,23,0.08)', overflowX: 'auto' }}>
            <Box component="pre" sx={{ fontSize: '0.7rem', lineHeight: 1.5, m: 0, color: 'rgba(40,40,60,0.8)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(MACHINE_SPEC, null, 2)}
            </Box>
          </Box>
        </Box>

        {/* ══ START ══ */}
        <Box id="start" sx={{ mb: 4, scrollMarginTop: 60 }}>
          <SectionTitle icon="🚀">Getting Started</SectionTitle>
          <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255,252,245,0.9)', border: '1px solid rgba(139,90,43,0.12)' }}>
            {[
              { title: 'Install dependencies', code: 'pip install requests' },
              { title: 'Connect to Base RPC', code: 'https://mainnet.base.org (chainId: 8453)' },
              { title: 'Copy the Base RPC Helper from Reads & Code above', code: null },
              { title: 'Fetch NUT price from UniV3 slot0() — check token0 for inversion', code: null },
              { title: 'Fetch all pool reserves via getReserves() — verify token0/token1 ordering', code: null },
              { title: 'Normalize all prices to USD using CoinGecko (ETH, BTC, cbETH only)', code: null },
              { title: 'Calculate spreads across venues — flag when spread > 0.5%', code: null },
              { title: 'For Mint Club prices, use browser automation or the V2 SDK — RPC is unreliable', code: 'npm i mint.club-v2-sdk' },
              { title: 'For pNUT NAV, use getPoolTokens(poolId) or balanceOf(BALANCER_VAULT) — NOT balanceOf(pNUT) which is not the basket', code: null },
              { title: 'Execute when spread > 2 × gas + slippage estimate (~$0.20-0.40 total on Base)', code: null },
            ].map((step, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <Box sx={{ minWidth: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #8B4513, #A0522D)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</Box>
                <Box>
                  <Typography sx={{ fontSize: '0.84rem', color: 'rgba(40,40,60,0.85)', fontWeight: 600 }}>{step.title}</Typography>
                  {step.code && (
                    <Box sx={{ mt: 0.25, p: 0.5, borderRadius: 1, background: 'rgba(2,6,23,0.04)', display: 'inline-block' }}>
                      <code style={{ fontSize: '0.72rem', color: 'rgba(40,40,60,0.7)' }}>{step.code}</code>
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
            <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid rgba(139,90,43,0.08)' }}>
              <Typography sx={{ fontSize: '0.78rem', color: 'rgba(40,40,60,0.6)' }}>
                📖 Mint Club SDK: <a href="https://sdk.mint.club/" target="_blank" rel="noopener noreferrer" style={{ color: '#8B5A2B', fontWeight: 600 }}>https://sdk.mint.club/</a>
                {' · '}Sunflower Grove: <Link href="/sunflower-grove" style={{ color: '#8B5A2B', fontWeight: 600, textDecoration: 'none' }}>graft registry</Link>
                {' · '}Balancer API: <a href="https://api.balancer.fi/v1/pools/base/0x2a5757b60987ff10385de1d4d923792f6fdcfff1" target="_blank" rel="noopener noreferrer" style={{ color: '#8B5A2B', fontWeight: 600 }}>REST endpoint</a>
                {' · '}Base RPC: <a href="https://mainnet.base.org" target="_blank" rel="noopener noreferrer" style={{ color: '#8B5A2B', fontWeight: 600 }}>https://mainnet.base.org</a>
                {' · '}DexScreener: <a href="https://api.dexscreener.com/latest/dex/tokens/0xb8de15fb529d98c93c749de63c749d48d25a30df" target="_blank" rel="noopener noreferrer" style={{ color: '#8B5A2B', fontWeight: 600 }}>NUT pairs</a>
              </Typography>
            </Box>
          </Box>
        </Box>

      </Box>
    </Layout>
  );
}
