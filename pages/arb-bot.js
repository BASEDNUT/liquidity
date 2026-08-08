import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { Box, Typography, Grid, IconButton, Collapse } from '@mui/material';
import { ExpandMore, ExpandLess, ContentCopy } from '@mui/icons-material';

// ═══════════════════════════════════════════════════════════════
// STEALTH ARCHITECTURE — CRITICAL CONTEXT FOR AGENTS
// ═══════════════════════════════════════════════════════════════
const STEALTH_NOTES = [
  { warn: 'NUT Supply = 1 (UNITY TOKEN). Standard APIs cannot calculate price or MCAP correctly. TRUE Price = TRUE MCAP.', severity: 'critical' },
  { warn: 'DEX Screener is BLIND to the Uniswap V3 Genesis pool. Must query ON-CHAIN via Base RPC for accurate NUT price.', severity: 'critical' },
  { warn: 'pNUT IS the Balancer Pool Token (BPT). The pool contract address and the token address are the SAME: 0x2a5757b60987ff10385de1d4d923792f6fdcfff1', severity: 'critical' },
  { warn: 'Token decimals reference — ALL tokens: NUT=18, SNUT=9, pNUT=18, SALT=18, NUTINO=18, WETH=18, AERO=18, cbBTC=8, cbETH=18, USDC=6. Wrong decimals = wrong prices. The 3 traps: SNUT (9, NOT 18), cbBTC (8, NOT 18), USDC (6, NOT 18).', severity: 'high' },
  { warn: 'Mint Club bonding curves have a massive BUY/SELL spread. BUY price is ALWAYS higher than SELL price. This is protocol revenue, not a bug.', severity: 'high' },
  { warn: 'Always verify token0/token1 ordering before deriving prices from reserves. Wrong ordering = inverted price.', severity: 'high' },
  { warn: 'Balancer V2 uses a SINGLETON VAULT architecture. All pool tokens (cbETH, cbBTC, NUT, SNUT) are held in the Balancer Vault (0xBA12222222228d8Ba445958a75a0704d566BF2C8), NOT in the pNUT pool contract. Querying balanceOf(pNUT_address) returns ALL ZEROS. Use balanceOf(BALANCER_VAULT) or getPoolTokens(poolId) instead.', severity: 'critical' },
  { warn: 'Uniswap V3 NUT/WETH pool has a 1% fee tier (fee=10000). Every swap costs 1%. This MUST be factored into profitability calculations. Query fee() with selector 0xddca3f43.', severity: 'high' },
  { warn: 'Aerodrome pools (proxy pattern, code_len=92) do NOT implement token1() selector (0xd21220a7) — it REVERTS. Use token0() + pool name semantics to infer token1. Do NOT call token1() on Aerodrome pools.', severity: 'high' },
  { warn: 'Base RPC (mainnet.base.org) rate-limits aggressively after ~5 requests. Always use fallback RPCs: base.publicnode.com, 1rpc.io/base. Implement retry logic with exponential backoff.', severity: 'medium' },
];

// ═══════════════════════════════════════════════════════════════
// VERIFIED ADDRESS REGISTRY — ALL VERIFIED ON-CHAIN
// ═══════════════════════════════════════════════════════════════
const TOKENS = [
  { emoji: '🥜', name: 'NUT', address: '0xb8de15fb529d98c93c749de63c749d48d25a30df', decimals: 18, supply: '1 (unity)', role: 'Root token. Anchor for all Mint Club curves. MCAP = price.', href: '/token/nut' },
  { emoji: '🥥', name: 'SNUT', address: '0xAC130701aa31c284c36609E2489f150F419AD7AD', decimals: 9, supply: '100,000', role: 'Liquid non-escrow NUT reward-position token. 1% tax (4-way split: liquidity, manager, buyback/burn, NUT rewards). Recursive burn flywheel.', href: '/token/snut' },
  { emoji: '🧺', name: 'pNUT', address: '0x2a5757b60987ff10385de1d4d923792f6fdcfff1', decimals: 18, supply: '~6.97 BPT', role: 'Balancer V2 WeightedPool BPT. 25% each: cbETH, cbBTC, NUT, SNUT. IS the pool itself.', href: '/token/pnut' },
  { emoji: '🧂', name: 'SALT', address: '0x1EDe2AFC985F6D7aEb3F4c84B95A103c00D5dE81', decimals: 18, supply: '~18.1B', role: 'Mint Club bonding curve token backed by NUT. SALT/USDC on Aerodrome.', href: '/token/salt' },
  { emoji: '🥜🍫', name: 'NUTINO', address: '0x30421e2d18dFF60B298eEF427cF868cA65f1476B', decimals: 18, supply: '~9.79B', role: 'Mint Club bonding curve token backed by NUT. NUTINO/cbBTC on Uniswap V2.', href: '/token/nutino' },
  { emoji: '⚡', name: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18, supply: 'variable', role: 'Wrapped ETH. Quote token for NUT/WETH and SNUT/WETH pools.', href: null },
  { emoji: '🛡️', name: 'AERO', address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', decimals: 18, supply: '~1.93B', role: 'Aerodrome token. Quote for NUT/AERO pool.', href: null },
  { emoji: '₿', name: 'cbBTC', address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', decimals: 8, supply: '~42,511', role: 'Coinbase Wrapped BTC. Quote for NUT/cbBTC and NUTINO/cbBTC.', href: null },
  { emoji: '⟠', name: 'cbETH', address: '0x2Ae3F1Ec7F1f5012CFEab0185bfc7aa3cf0DEc22', decimals: 18, supply: '~55,554', role: 'Coinbase Wrapped Staked ETH. 25% of pNUT basket.', href: null },
  { emoji: '💵', name: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, supply: '~4.28B', role: 'USD stablecoin. Quote for SALT/USDC on Aerodrome.', href: null },
  { emoji: '💻🥜', name: 'PIPS', address: '0x3f2327221dd4f0bae660172606d6b288a1cf8ad9', decimals: 18, supply: '1,000,000,000', role: 'Compute token for Pipshell — the Orchard\'s DevOps agent. Trading fees fund its servers. 1%/1% transfer tax configured (official Virtuals pair only; external venues untaxed today).', href: '/token/pips' },
];

const POOLS = [
  { name: 'NUT/WETH', platform: 'Uniswap V3', address: '0xe3ce00e2ed742b142c15eedc208657dd22aa987e', type: 'V3', token0: 'WETH', token1: 'NUT', flavor: 'Extra Crunchy Delight', notes: 'Primary NUT venue. Use slot0() for price. DEX Screener CANNOT see this pool.' },
  { name: 'NUT/WETH', platform: 'Uniswap V2', address: '0x997bad8e9f5c34d5e9784caaa8a554a5e6192f53', type: 'V2', token0: 'WETH', token1: 'NUT', flavor: 'Mega Crunchy Madness', notes: 'Secondary NUT venue. Use getReserves().' },
  { name: 'NUT/AERO', platform: 'Aerodrome', address: '0x38630fede5e2032652640d98b2d3f9c6296eea5d', type: 'V2', token0: 'AERO', token1: 'NUT', flavor: 'Sky-Seasoned Crisp', notes: 'AERO-denominated NUT price. token0=AERO, token1=NUT.' },
  { name: 'NUT/cbBTC', platform: 'Aerodrome', address: '0x15385c9281bc12d2e9bf5c081621944b0ee2acca', type: 'V2', token0: 'NUT', token1: 'cbBTC', flavor: 'Golden Butter Drizzle', notes: 'BTC-denominated NUT price. token0=NUT, token1=cbBTC (8 decimals!).' },
  { name: 'SNUT/NUT', platform: 'Aerodrome', address: '0x893faaa7baf7a8247fc7142afb28e13d51a5aae8', type: 'V2', token0: 'SNUT', token1: 'NUT', flavor: 'Cloud-Salted Breeze', notes: 'Primary SNUT venue. SNUT has 9 decimals!' },
  { name: 'SNUT/WETH', platform: 'Uniswap V2', address: '0xB22895d2ee6e29395F30Ec47c8D9FE0d55355AE1', type: 'V2', token0: 'WETH', token1: 'SNUT', flavor: 'Honey-Roasted Frenzy', notes: 'Secondary SNUT venue.' },
  { name: 'NUTINO/cbBTC', platform: 'Uniswap V2', address: '0xeafde67d470480d14139e3d91164c158b82b38e2', type: 'V2', token0: 'NUTINO', token1: 'cbBTC', flavor: 'Buttery Mint Explosion', notes: 'Primary NUTINO DEX venue. cbBTC has 8 decimals.' },
  { name: 'SALT/USDC', platform: 'Aerodrome', address: '0x64ca0b147f625007b6f082abbb3ba217930eccb2', type: 'V2', token0: 'SALT', token1: 'USDC', flavor: 'Savory Stable Seasoning', notes: 'Primary SALT DEX venue. USDC has 6 decimals.' },
  { name: 'PIPS/NUT', platform: 'Aerodrome Slipstream CL', address: '0x7f8e532cf1be9ed688adb9e6585bc69f017201b5', type: 'CL', token0: 'PIPS', token1: 'NUT', flavor: 'Shell-Spice Crossbreed', notes: 'PIPS/NUT concentrated liquidity. token0=PIPS, token1=NUT, 1% fee. Use slot0(). Token tax NOT registered here — untaxed today; owner registration would break CL invariant.' },
  { name: 'PIPS/USDC', platform: 'Balancer reCLAMM', address: '0xb19e3af68BB307369e8772A9E157431FcFE9Dd44', type: 'reCLAMM', token0: 'PIPS', token1: 'USDC', flavor: 'Stable Shell Reservoir', notes: 'PIPS/USDC reCLAMM on Balancer V3. 1% fee. LP build-out in progress (~$120 USDC needed).' },
  { name: 'SNUT/ETH-LP/ETH', platform: 'Uniswap V2', address: '0x82bbadb9d6b2c0a59ed01809e30323f89f6faa1c', type: 'V2', token0: 'SNUT/ETH-LP', token1: 'WETH', flavor: 'Palm Grove Graft Market', notes: 'Meta-pool: trade SNUT/ETH LP tokens against ETH. Secondary market for liquidity rights. Derivative-like.' },
  { name: 'cbETH/SNUT/NUT/cbBTC', platform: 'Balancer V2', address: '0x2a5757b60987ff10385de1d4d923792f6fdcfff1', type: 'Balancer', token0: 'cbETH', token1: 'SNUT/NUT/cbBTC', flavor: 'Quad-Core Reactor', notes: '25% each weighted pool. Multi-asset arb reactor. Dividend-exempt. Use getPoolTokens(poolId).' },
];

const VAULTS = [
  { name: 'NUT Token', address: '0xb8de15fb529d98c93c749de63c749d48d25a30df', purpose: 'Base ecosystem token. Reserve asset for Mint Club bonding curves (SALT, NUTINO). 18 decimals.' },
  { name: 'SNUT Token', address: '0xAC130701aa31c284c36609E2489f150F419AD7AD', purpose: 'Liquid non-escrow NUT reward-position token. 1% tax, 9 decimals. Houses buyback fuel ETH, swapback engine, distributor.' },
  { name: 'pNUT (Balancer BPT)', address: '0x2a5757b60987ff10385de1d4d923792f6fdcfff1', purpose: 'Index token = Balancer WeightedPool. 25% each cbETH/SNUT/NUT/cbBTC. Mint by depositing basket, redeem to withdraw.' },
  { name: 'Dead Address (Burn Sink)', address: '0x000000000000000000000000000000000000dEaD', purpose: 'Recursive burn sink. Dead-held SNUT earns NUT rewards. NUT sent to dead = burned. LP burned here cannot be removed.' },
  { name: 'Mint Club Lock', address: '0xc5a076cad94176c2996b32d8466be1ce757faa27', purpose: 'Holds NUT reserves backing all Mint Club bonding curves (SALT, NUTINO).' },
  { name: 'Balancer Vault', address: '0xBA12222222228d8Ba445958a75a0704d566BF2C8', purpose: 'Global vault for all Balancer V2 pools. Use getPoolTokens(poolId) for basket composition.' },
];

const NFTS = [
  { emoji: '🌰', name: 'PNUTS', label: 'Peanut War Generals', address: '0x794fcD89357C1CcF04a1a9A441ad4dB2Cd5EE387', supply: '251', sudoswap: '0x262bEaa785a0eF65f5D9C1b8BA5c41980D087ff3' },
  { emoji: '🌰', name: 'ALMD', label: 'Almond War Generals', address: '0x1A160456005AED47994E1c13C9bc31F274413927', supply: '424', sudoswap: '0x308C9BC0546723d6e4905c971cd34feBF1f94031' },
  { emoji: '🧂', name: 'SALMD', label: 'Almond Soldiers', address: '0x1E0f80529593185C021043ffcbfDcB8f4279C649', supply: '6,238', sudoswap: '0xeE7243F0E02e5890c6415B5CbAe58e0D0fb758a5' },
  { emoji: '⚔️', name: 'PNUTRMY', label: 'Peanut Soldiers', address: '0xF075300b8C2EF500d8Ce4f783F910C500B9A3512', supply: '5,013', sudoswap: null },
];

const pNUT_POOL_ID = '0x2a5757b60987ff10385de1d4d923792f6fdcfff100010000000000000000019e';

// ═══════════════════════════════════════════════════════════════
// FUNCTION SIGNATURES — HEX SELECTORS
// ═══════════════════════════════════════════════════════════════
const FUNCTION_SIGS = [
  { sig: '0x3850c7bd', name: 'slot0()', desc: 'Uniswap V3 — Returns sqrtPriceX96, tick, protocolFee. Use for V3 price derivation.', returns: 'uint160 sqrtPriceX96, int24 tick, ...' },
  { sig: '0x0902f1ac', name: 'getReserves()', desc: 'Uniswap V2 / Aerodrome — Returns reserve0, reserve1. Use for V2 price derivation.', returns: 'uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast' },
  { sig: '0x0dfe1681', name: 'token0()', desc: 'Pool — Returns token0 address. CRITICAL for price direction. Always verify before calculating.', returns: 'address' },
  { sig: '0xd21220a7', name: 'token1()', desc: 'Pool — Returns token1 address. CRITICAL for price direction.', returns: 'address' },
  { sig: '0x70a08231', name: 'balanceOf(address)', desc: 'ERC20/ERC721 — Token balance of an address. Used for pool TVL and basket composition.', returns: 'uint256', args: '32-byte padded address' },
  { sig: '0x18160ddd', name: 'totalSupply()', desc: 'ERC20/ERC721 — Total token supply. Used for MCAP, NAV per share, NFT minted count.', returns: 'uint256' },
  { sig: '0x313ce567', name: 'decimals()', desc: 'ERC20 — Token decimals. CRITICAL: SNUT=9, cbBTC=8, USDC=6, others=18.', returns: 'uint8' },
  { sig: '0x06fdde03', name: 'name()', desc: 'ERC20 — Token name string. Useful for verification.', returns: 'string' },
  { sig: '0x1a686502', name: 'liquidity()', desc: 'Uniswap V3 — Current liquidity. Do NOT use getReserves() for V3 pools.', returns: 'uint128' },
  { sig: '0xddca3f43', name: 'fee()', desc: 'Uniswap V3 — Pool fee tier in hundredths of a bip. NUT/WETH V3 = 10000 (1%). MUST factor into profitability.', returns: 'uint24' },
  { sig: '0x9cb8a26a', name: 'getPoolTokens(bytes32)', desc: 'Balancer V2 Vault — Returns tokens[], balances[], lastChangeBlock. Use poolId to get pNUT basket composition from the Vault.', returns: 'address[], uint256[], uint256' },
  { sig: '0x4fbebba3', name: 'liquidity()', desc: 'Uniswap V3 — Alternative selector for current liquidity. Same as 0x1a686502 on some deployments.', returns: 'uint128' },
];

// ═══════════════════════════════════════════════════════════════
// RPC IMPLEMENTATION CODE — COPY-PASTEABLE PYTHON
// ═══════════════════════════════════════════════════════════════
const CODE_BLOCKS = [
  {
    title: 'Base RPC Helper',
    desc: 'Core eth_call function for all on-chain queries. No Web3 library needed.',
    code: `import requests, time

# Base RPC endpoints — mainnet.base.org rate-limits after ~5 requests
RPC_ENDPOINTS = [
    "https://mainnet.base.org",
    "https://base.publicnode.com",
    "https://1rpc.io/base",
]
_rpc_index = 0

def eth_call(to, data, retries=3):
    """Make a JSON-RPC eth_call to Base mainnet with fallback + retry."""
    global _rpc_index
    for attempt in range(retries):
        rpc = RPC_ENDPOINTS[(_rpc_index + attempt) % len(RPC_ENDPOINTS)]
        try:
            resp = requests.post(rpc, json={
                "jsonrpc": "2.0", "id": 1,
                "method": "eth_call",
                "params": [{"to": to, "data": data}, "latest"]
            }, timeout=10)
            result = resp.json().get("result", "0x")
            if result and result != "0x":
                _rpc_index = (_rpc_index + attempt) % len(RPC_ENDPOINTS)
                return result
            # Some calls legitimately return 0x (e.g. balanceOf=0), return as-is
            if result == "0x":
                return "0x"
        except Exception:
            time.sleep(0.5 * (attempt + 1))
            continue
    _rpc_index = (_rpc_index + 1) % len(RPC_ENDPOINTS)  # rotate on failure
    return "0x"

def has_code(addr):
    """Check if a contract exists at address."""
    for rpc in RPC_ENDPOINTS:
        try:
            code = requests.post(rpc, json={
                "jsonrpc": "2.0", "id": 1,
                "method": "eth_getCode",
                "params": [addr, "latest"]
            }, timeout=10).json().get("result", "0x")
            return len(code) > 2
        except Exception:
            continue
    return False`,
  },
  {
    title: 'Uniswap V3 Price (NUT/WETH)',
    desc: 'Extract price from sqrtPriceX96. CRITICAL: Check token0 to determine if ratio needs inversion. token0=WETH, token1=NUT for this pool.',
    code: `# NUT/WETH Uniswap V3 Pool
NUT_WETH_V3 = "0xe3ce00e2ed742b142c15eedc208657dd22aa987e"
WETH = "0x4200000000000000000000000000000000000006"
NUT = "0xb8de15fb529d98c93c749de63c749d48d25a30df"

def get_v3_fee(pool_addr):
    """Get V3 pool fee tier. NUT/WETH V3 = 10000 (1%)."""
    fee_hex = eth_call(pool_addr, "0xddca3f43")
    return int(fee_hex, 16) if fee_hex and fee_hex != "0x" else 0

def get_v3_price(pool_addr):
    """Get price ratio from UniV3 slot0(). Includes fee tier check."""
    slot0 = eth_call(pool_addr, "0x3850c7bd")
    sqrt_px = int(slot0[2:66], 16)
    ratio = (sqrt_px / 2**96) ** 2

    # Get fee tier (1% = 10000 for NUT/WETH V3)
    fee = get_v3_fee(pool_addr)
    fee_pct = fee / 1_000_000  # fee is in hundredths of a bip

    # Verify token0 to determine direction
    t0_raw = eth_call(pool_addr, "0x0dfe1681")
    token0 = "0x" + t0_raw[26:66]

    if token0.lower() == WETH.lower():
        # ratio = NUT_per_ETH (price of NUT in ETH, inverted)
        nut_per_eth = ratio
        eth_per_nut = 1 / ratio
    else:
        # ratio = ETH_per_NUT
        eth_per_nut = ratio
        nut_per_eth = 1 / ratio

    # Apply fee: effective price after 1% swap cost
    eth_per_nut_effective = eth_per_nut * (1 - fee_pct)

    return eth_per_nut_effective  # NUT price in ETH (after fee)

# Get USD price
import requests as r
eth_usd = r.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd").json()["ethereum"]["usd"]
nut_usd = get_v3_price(NUT_WETH_V3) * eth_usd
print(f"NUT price: \${nut_usd:,.2f}")`,
  },
  {
    title: 'Uniswap V2 / Aerodrome Reserves',
    desc: 'Extract reserves and derive price. CRITICAL: Verify token0/token1 ordering before dividing. Different pools have different orderings.',
    code: `def get_reserves(pool_addr):
    """Get V2/Aerodrome reserves."""
    result = eth_call(pool_addr, "0x0902f1ac")
    if len(result) >= 130:
        reserve0 = int(result[2:66], 16)
        reserve1 = int(result[66:130], 16)
        return reserve0, reserve1
    return None, None

def get_token0(pool_addr):
    """Get token0 address."""
    t0 = eth_call(pool_addr, "0x0dfe1681")
    return "0x" + t0[26:66] if len(t0) >= 66 else None

def get_token1(pool_addr):
    """Get token1 address."""
    t1 = eth_call(pool_addr, "0xd21220a7")
    return "0x" + t1[26:66] if len(t1) >= 66 else None

# Example: NUT/AERO Aerodrome pool
# token0=AERO (18 decimals), token1=NUT (18 decimals)
NUT_AERO = "0x38630fede5e2032652640d98b2d3f9c6296eea5d"
AERO = "0x940181a94A35A4569E4529A3CDfB74e38FD98631"

r0, r1 = get_reserves(NUT_AERO)
t0 = get_token0(NUT_AERO)

if t0.lower() == AERO.lower():
    # token0=AERO, token1=NUT
    aero_res = r0 / 1e18
    nut_res = r1 / 1e18
    nut_per_aero = nut_res / aero_res
else:
    # token0=NUT, token1=AERO (inverted)
    nut_res = r0 / 1e18
    aero_res = r1 / 1e18
    nut_per_aero = aero_res / nut_res

print(f"NUT/AERO: {nut_per_aero:.6f} NUT per AERO")`,
  },
  {
    title: 'pNUT Basket Composition & NAV',
    desc: 'Query Balancer V2 pool basket composition. CRITICAL: Balancer V2 uses a singleton vault — tokens are held in the Balancer Vault (0xBA12...), NOT in the pNUT pool contract. Querying balanceOf(pNUT) returns ALL ZEROS. Use balanceOf(BALANCER_VAULT) or getPoolTokens(poolId) instead.',
    code: `# pNUT = Balancer V2 WeightedPool BPT
# CRITICAL: Balancer V2 uses a SINGLETON VAULT architecture
# All pool tokens are held in the Balancer Vault, NOT the pool contract!
# Querying balanceOf(pNUT_address) returns ALL ZEROS — this is a common bug!
pNUT = "0x2a5757b60987ff10385de1d4d923792f6fdcfff1"
BALANCER_VAULT = "0xBA12222222228d8Ba445958a75a0704d566BF2C8"
cbETH = "0x2Ae3F1Ec7F1f5012CFEab0185bfc7aa3cf0DEc22"
cbBTC = "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf"
NUT = "0xb8de15fb529d98c93c749de63c749d48d25a30df"
SNUT = "0xAC130701aa31c284c36609E2489f150F419AD7AD"

def balance_of(token, holder):
    """Get ERC20 balance of holder."""
    data = "0x70a08231" + "000000000000000000000000" + holder[2:].lower()
    result = eth_call(token, data)
    return int(result, 16) if result and result != "0x" else 0

# METHOD 1: balanceOf on Balancer Vault (simple, one token at a time)
def get_pnut_basket():
    """Get pNUT basket composition from Balancer Vault balances."""
    # Query the VAULT, not the pool contract!
    cbeth_bal = balance_of(cbETH, BALANCER_VAULT) / 10**18
    cbbtc_bal = balance_of(cbBTC, BALANCER_VAULT) / 10**8   # cbBTC = 8 decimals!
    nut_bal = balance_of(NUT, BALANCER_VAULT) / 10**18
    snut_bal = balance_of(SNUT, BALANCER_VAULT) / 10**9     # SNUT = 9 decimals!

    pnut_supply = int(eth_call(pNUT, "0x18160ddd"), 16) / 10**18

    return {
        "cbETH": cbeth_bal,
        "cbBTC": cbbtc_bal,
        "NUT": nut_bal,
        "SNUT": snut_bal,
        "pNUT_supply": pnut_supply
    }

def calculate_nav(basket, prices):
    """Calculate NAV per pNUT token.
    prices = {"cbETH": usd_price, "cbBTC": usd_price, "NUT": usd_price, "SNUT": usd_price}
    """
    total_value = (
        basket["cbETH"] * prices["cbETH"] +
        basket["cbBTC"] * prices["cbBTC"] +
        basket["NUT"] * prices["NUT"] +
        basket["SNUT"] * prices["SNUT"]
    )
    return total_value / basket["pNUT_supply"]

# Fetch USD prices from CoinGecko
cg = requests.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum,wrapped-bitcoin,coinbase-wrapped-staked-eth&vs_currencies=usd").json()
prices = {
    "cbETH": cg["coinbase-wrapped-staked-eth"]["usd"],
    "cbBTC": cg["wrapped-bitcoin"]["usd"],
    "NUT": nut_usd,   # from V3 price above
    "SNUT": snut_usd,  # from SNUT/NUT Aerodrome pool
}

basket = get_pnut_basket()
nav = calculate_nav(basket, prices)
print(f"pNUT NAV: \${nav:,.2f}")`,
  },
  {
    title: 'Cross-Venue Spread Scanner',
    desc: 'Compare NUT price across all 4 venues. Normalize to USD. Find highest spread. This is the core cross-venue arb logic.',
    code: `# All NUT pools with verified token ordering
NUT_POOLS = {
    "UniV3":  {"addr": "0xe3ce00e2ed742b142c15eedc208657dd22aa987e", "type": "V3", "quote": "WETH"},
    "UniV2":  {"addr": "0x997bad8e9f5c34d5e9784caaa8a554a5e6192f53", "type": "V2", "quote": "WETH"},
    "Aero_AERO": {"addr": "0x38630fede5e2032652640d98b2d3f9c6296eea5d", "type": "V2", "quote": "AERO"},
    "Aero_cbBTC": {"addr": "0x15385c9281bc12d2e9bf5c081621944b0ee2acca", "type": "V2", "quote": "cbBTC"},
}

DECIMALS = {"NUT": 18, "WETH": 18, "AERO": 18, "cbBTC": 8}

def get_nut_price_usd(pool_info, eth_usd, btc_usd, aero_usd):
    """Get NUT price in USD for a given pool."""
    addr = pool_info["addr"]

    if pool_info["type"] == "V3":
        slot0 = eth_call(addr, "0x3850c7bd")
        sqrt_px = int(slot0[2:66], 16)
        ratio = (sqrt_px / 2**96) ** 2
        t0 = "0x" + eth_call(addr, "0x0dfe1681")[26:66]
        # token0=WETH -> ratio = NUT_per_ETH
        if t0.lower() == "0x4200000000000000000000000000000000000006":
            eth_per_nut = 1 / ratio
        else:
            eth_per_nut = ratio
        return eth_per_nut * eth_usd

    elif pool_info["type"] == "V2":
        r0, r1 = get_reserves(addr)
        t0 = get_token0(addr)
        quote = pool_info["quote"]
        dec = DECIMALS[quote]

        if t0.lower() == NUT.lower():
            # token0=NUT, token1=quote
            nut_raw, quote_raw = r0, r1
            nut_per_quote = (quote_raw / 10**dec) / (nut_raw / 10**18)
            usd_per_nut = nut_per_quote * {"WETH": eth_usd, "AERO": aero_usd, "cbBTC": btc_usd}[quote]
        else:
            # token0=quote, token1=NUT
            quote_raw, nut_raw = r0, r1
            nut_per_quote = (nut_raw / 10**18) / (quote_raw / 10**dec)
            usd_per_nut = 1 / nut_per_quote * {"WETH": eth_usd, "AERO": aero_usd, "cbBTC": btc_usd}[quote]

        return usd_per_nut

# Scan all venues
prices = {}
for name, info in NUT_POOLS.items():
    prices[name] = get_nut_price_usd(info, eth_usd, btc_usd, aero_usd)

# Find spread
venues = list(prices.keys())
best = max(venues, key=lambda v: prices[v])
worst = min(venues, key=lambda v: prices[v])
spread = (prices[best] - prices[worst]) / prices[worst] * 100

print(f"Best: {best} @ \${prices[best]:,.2f}")
print(f"Worst: {worst} @ \${prices[worst]:,.2f}")
print(f"Spread: {spread:.2f}%")
print(f"Arb viable: {spread > 0.5}")  # gas threshold ~0.5%`,
  },
  {
    title: 'Mint Club Price Discovery',
    desc: 'Mint Club bonding curve tokens (SALT, NUTINO) are minimal proxy contracts. Direct RPC price queries are unreliable. Use browser automation or SDK.',
    code: `# Mint Club bonding curve price = NUT_locked / token_supply
# The displayed UI price is the BUY (mint) price.
# The SELL (burn) price is ALWAYS lower — this is protocol revenue.

# Method 1: Browser scraping (recommended)
# Use playwright or similar to browse:
#   https://mint.club/token/base/SALT
#   https://mint.club/token/base/NUTINO
# Extract from Statistics section:
#   - "Current supply / Max supply"
#   - "Total locked parent token: X NUT"
#   - "Market cap: $XXX"

# Method 2: Mint Club V2 SDK
# npm i mint.club-v2-sdk
# Docs: https://sdk.mint.club/

# Method 3: RPC estimation (APPROXIMATE only)
# Check NUT balance in Mint Club Lock contract
MINT_CLUB_LOCK = "0xc5a076cad94176c2996b32d8466be1ce757faa27"
NUT = "0xb8de15fb529d98c93c749de63c749d48d25a30df"

nut_in_lock = balance_of(NUT, MINT_CLUB_LOCK) / 10**18
# This is TOTAL NUT locked across ALL bonding curves, not per-token
# Per-token locked requires browsing the UI or SDK calls

# CRITICAL WARNING:
# BUY price (mint) != SELL price (burn)
# The spread can be 10-100x or more
# Example: NUTINO buy = 0.084788 NUT/NUTINO
#          NUTINO sell = 0.0000000047 NUT/NUTINO
#          Spread: ~18,000,000x
# This spread IS the protocol revenue model.`,
  },
];

// ═══════════════════════════════════════════════════════════════
// ARB LOOPS — HONEST ASSESSMENT
// ═══════════════════════════════════════════════════════════════
const ARB_LOOPS = [
  {
    id: 1,
    emoji: '🔄',
    name: 'Cross-Venue NUT Arbitrage',
    routeIds: ['NUT-UNI3-UNI2', 'NUT-UNI3-AERO-AERO', 'NUT-UNI3-AERO-CBBTC'],
    venues: 'Uniswap V3 ↔ Uniswap V2 ↔ Aerodrome (NUT/AERO) ↔ Aerodrome (NUT/cbBTC)',
    formula: 'profit = NUT_price_venueB - NUT_price_venueA - 2 × gas - slippage',
    steps: [
      'Monitor NUT price across all 4 venues via Base RPC',
      'Normalize all prices to USD (WETH→ETH price, AERO→AERO price, cbBTC→BTC price)',
      'Buy NUT on lowest-price venue',
      'Sell NUT on highest-price venue',
      'Account for gas (~$0.10-0.20 per tx on Base) and slippage',
    ],
    profitCondition: 'Spread between any 2 venues > 2 × gas + slippage + quote token conversion cost',
    risks: 'Different quote tokens complicate comparison. Price moves during cross-venue execution. Liquidity depth varies. V3 pool has deepest liquidity.',
    verdict: 'VIABLE — This is the most realistic arb. Spreads of 0.5-2% have been observed. Requires fast execution and USD normalization across quote tokens.',
    verdictColor: 'success',
    whatIsIt: 'Classic cross-venue price arbitrage. NUT trades on 4 different DEXs with different quote tokens. When the same token has different prices on different venues, you buy low and sell high.',
    howToUse: '1. Poll all 4 venues every block (Base block time ~2s). 2. Normalize all prices to USD using CoinGecko for quote tokens. 3. Calculate spread between every pair. 4. If spread > threshold, execute buy on cheap venue + sell on expensive venue in same block or next. 5. Use multicall or flashbots to atomic-execute both legs.',
    whenToUse: 'After large directional trades on one venue. During volatility spikes. When new liquidity is added/removed from one pool. When AERO or cbBTC prices move sharply vs ETH.',
    difficulty: 'Intermediate',
    frequency: 'Multiple times per day during active markets. Spreads of 0.5-2% observed historically.',
    capitalNeeded: '$500+ recommended. Gas is cheap on Base (~$0.10-0.20 per tx) but slippage on small sizes eats profit.',
    prerequisites: 'Base RPC access, USD price feeds for ETH/AERO/cbBTC, understanding of Uniswap V3 slot0 vs V2 getReserves, wallet funded with ETH for gas.',
        tokens: ['NUT', 'WETH', 'AERO', 'cbBTC'],
  },
  {
    id: 2,
    emoji: '🧺',
    name: 'pNUT NAV Drift Arbitrage',
    routeIds: ['PNUT-NAV-MINT', 'PNUT-NAV-REDEEM'],
    venues: 'Balancer V2 (mint/redeem BPT) ↔ DEX (buy/sell pNUT)',
    formula: 'profit = |market_price - NAV| × pNUT_amount - gas - slippage - exit fees',
    steps: [
      'Calculate NAV = (cbETH_bal × cbETH_price + cbBTC_bal × cbBTC_price + NUT_bal × NUT_price + SNUT_bal × SNUT_price) / pNUT_supply',
      'If market_price > NAV: Mint BPT on Balancer (deposit basket), sell pNUT on DEX',
      'If market_price < NAV: Buy pNUT on DEX, redeem BPT on Balancer (withdraw basket)',
      'Sell withdrawn basket components (cbETH, cbBTC, NUT, SNUT) for profit',
    ],
    profitCondition: '|market_price - NAV| > gas + slippage + basket liquidation cost + Balancer exit fee',
    risks: 'NAV changes as basket components move. Redeeming requires selling 4 tokens. Balancer join/exit fees. Low pNUT trading volume.',
    verdict: 'THEORETICALLY VIABLE — Most complex arb. Requires monitoring 4 component prices + pNUT market price. Best executed when NUT or SNUT makes a sharp move vs ETH/BTC, causing basket weight drift.',
    verdictColor: 'warning',
    whatIsIt: 'pNUT is a Balancer WeightedPool token (BPT) holding 4 assets at 25% each. Its market price can drift from its Net Asset Value (NAV) when component prices move. You mint or redeem BPT against the basket to capture the premium/discount.',
    howToUse: '1. Monitor pNUT BPT price on Balancer vs calculated NAV. 2. NAV = sum(component_balance × component_price) / totalSupply. 3. If BPT trades ABOVE NAV: deposit the 4-asset basket into Balancer to mint BPT, then sell BPT on secondary market. 4. If BPT trades BELOW NAV: buy BPT cheap, redeem for basket components, sell components. 5. Account for Balancer swap fees on join/exit.',
    whenToUse: 'When NUT or SNUT makes a sharp move (they are the volatile components). When cbETH/cbBTC drift changes basket weights. After large pNUT mints or redeems that shift the pool. Low frequency but high value when triggered.',
    difficulty: 'Advanced',
    frequency: 'Rare — maybe a few times per week during volatile periods. Requires 4-component price divergence of >2%.',
    capitalNeeded: '$2,000+ recommended. Must hold or source all 4 basket components (cbETH, cbBTC, NUT, SNUT). Balancer join/exit has gas + fee overhead.',
    prerequisites: 'Balancer V2 SDK or API access, real-time price feeds for all 4 components, understanding of weighted pool math, ability to source and liquidate basket components.',
        tokens: ['pNUT', 'cbETH', 'cbBTC', 'NUT', 'SNUT'],
  },
  {
    id: 3,
    emoji: '🧂',
    name: 'SALT Loop (Mint Club → Aerodrome)',
    routeIds: ['SALT-MC-AERO-USDC'],
    venues: 'Mint Club (NUT→SALT) → Aerodrome (SALT→USDC)',
    formula: 'forward: profit = SALT_dex_price_USDC - SALT_mint_cost_NUT × NUT_price_USDC - gas - 1% royalty\nreverse: profit = SALT_burn_value_NUT × NUT_price_USDC - SALT_dex_price_USDC - gas - 1% royalty',
    steps: [
      'Forward: Buy NUT → Mint SALT on Mint Club → Sell SALT on Aerodrome (SALT/USDC)',
      'Reverse: Buy SALT on Aerodrome → Burn SALT on Mint Club for NUT → Sell NUT',
      'Mint Club BUY price = NUT_locked / supply (from UI)',
      'Mint Club SELL price is ALWAYS lower than BUY price (bonding curve spread)',
      '1% royalty on both mint and burn',
    ],
    profitCondition: 'Forward: SALT DEX price > MC buy price + 1% royalty + gas. Reverse: MC sell price > DEX price + 1% royalty + gas.',
    risks: 'Bonding curve spread captures most value. Supply changes with each trade (price moves against you). DEX liquidity may be thin.',
    verdict: 'CHALLENGING — The Mint Club bonding curve buy/sell spread is designed as protocol revenue and captures significant value from both directions. Forward loop is squeezed because DEX price tends to be below MC buy price. Reverse loop is squeezed because MC sell price tends to be below DEX price. However, during periods of external liquidity events, sudden DEX price dislocations, or high volatility, the spread can be overcome. Monitor for DEX price divergence from the bonding curve of more than 5-10%.',
    verdictColor: 'warning',
    whatIsIt: 'SALT is a Mint Club bonding curve token backed by NUT. It also trades on Aerodrome against USDC. The bonding curve price and DEX price can diverge, creating a loop: mint SALT cheap on Mint Club, sell on Aerodrome — or reverse.',
    howToUse: '1. Get SALT mint price from Mint Club (NUT_locked / supply). 2. Get SALT DEX price from Aerodrome (SALT/USDC reserves). 3. Forward: buy NUT → mint SALT on MC → sell SALT on Aerodrome for USDC. 4. Reverse: buy SALT on Aerodrome → burn on MC for NUT → sell NUT. 5. Subtract 1% royalty on both MC directions. 6. The bonding curve BUY price is ALWAYS higher than SELL price — the spread is protocol revenue.',
    whenToUse: 'When DEX price diverges >5-10% from the bonding curve fair value. During SALT liquidity events, market dumps, or when NUT price moves but SALT DEX lags. Most viable during high volatility windows.',
    difficulty: 'Advanced',
    frequency: 'Sporadic — the bonding curve spread captures most value. Windows open during volatility but close fast as arbitrageurs correct the divergence.',
    capitalNeeded: '$200+ for gas coverage, but profit margins are thin. Larger sizes get worse slippage on both MC curve and DEX.',
    prerequisites: 'Mint Club V2 SDK or browser automation for bonding curve prices, Aerodrome pool monitoring, understanding of bonding curve mechanics (buy ≠ sell), NUT price feed.',
        tokens: ['NUT', 'SALT', 'USDC'],
  },
  {
    id: 4,
    emoji: '🌰🍫',
    name: 'NUTINO Loop (Mint Club → Uniswap V2)',
    routeIds: ['NUTINO-MC-UNI2-CBBTC'],
    venues: 'Mint Club (NUT→NUTINO) → Uniswap V2 (NUTINO→cbBTC)',
    formula: 'forward: profit = cbBTC_received × BTC_price - NUT_cost_USD - gas - 1% royalty\nreverse: profit = NUT_received × NUT_price - cbBTC_cost_USD - gas - 1% royalty',
    steps: [
      'Forward: Buy NUT → Mint NUTINO on Mint Club → Sell NUTINO on UniV2 (NUTINO/cbBTC)',
      'Reverse: Buy NUTINO on UniV2 → Burn NUTINO on Mint Club for NUT → Sell NUT',
      'Same bonding curve spread applies — BUY price always > SELL price',
      'cbBTC denominated (8 decimals) — additional BTC/USD conversion needed',
    ],
    profitCondition: 'Forward: NUTINO DEX price in cbBTC > MC buy price + 1% royalty + gas. Reverse: MC sell price > DEX price + 1% royalty + gas.',
    risks: 'cbBTC price volatility. Bonding curve spread. UniV2 slippage. Same fundamental issue as SALT loop.',
    verdict: 'CHALLENGING — Same bonding curve dynamics as SALT. The buy/sell spread on Mint Club captures significant value from both directions. However, NUTINO is cbBTC-denominated, adding a BTC volatility dimension that can create wider price dislocations. During periods of high BTC volatility or thin DEX liquidity, the spread can narrow enough for profitable loops. Monitor DEX price vs bonding curve divergence and BTC price momentum.',
    verdictColor: 'warning',
    whatIsIt: 'NUTINO is a Mint Club bonding curve token backed by NUT, trading on Uniswap V2 against cbBTC. Same loop concept as SALT but with BTC-denominated pricing adding a BTC volatility dimension that can create wider dislocations.',
    howToUse: '1. Get NUTINO mint price from Mint Club (NUT_locked / supply). 2. Get NUTINO DEX price from UniV2 (NUTINO/cbBTC reserves). 3. Forward: buy NUT → mint NUTINO on MC → sell NUTINO on UniV2 for cbBTC. 4. Reverse: buy NUTINO on UniV2 → burn on MC for NUT → sell NUT. 5. Subtract 1% royalty. 6. Convert cbBTC to USD for profit calc.',
    whenToUse: 'During high BTC volatility (cbBTC price moves but NUTINO DEX lags). When NUT makes a sharp move and NUTINO bonding curve has not caught up. Same 5-10% divergence threshold as SALT.',
    difficulty: 'Advanced',
    frequency: 'Sporadic — similar to SALT but BTC volatility can create wider windows. Still squeezed by bonding curve spread on most attempts.',
    capitalNeeded: '$200+ for gas. cbBTC denomination means position sizes are effectively in BTC terms. Thin UniV2 liquidity limits size.',
    prerequisites: 'Mint Club V2 SDK, UniV2 pool monitoring, BTC price feed for cbBTC, understanding of bonding curve mechanics, NUT price feed.',
        tokens: ['NUT', 'NUTINO', 'cbBTC'],
  },
  {
    id: 5,
    emoji: '🔥',
    name: 'SNUT Deflationary Pressure',
    routeIds: ['SNUT-BUYBACK-BURN'],
    venues: 'Aerodrome (SNUT/NUT, SNUT/WETH) ← Buyback contract → Dead address (burn)',
    formula: 'price_support = burn_rate / circulating_supply (continuous, non-directional)',
    steps: [
      '1% tax on every trade → swapback → ETH routing → NUT rewards + buyback fuel + liquidity injection',
      'Buybacks send SNUT to dead address — dead-held SNUT keeps earning NUT rewards',
      'NUT sent to dead is burned → recursive burn flywheel: burn feeds burn',
      '100,000 initial supply, supply decreases monotonically — no new SNUT minted',
      'Tax breakdown: 1% total split 4 ways — liquidity, manager, buyback/burn, NUT rewards (live per-stream via RPC)',
      'Monitor: dead SNUT balance, dead NUT balance, dead LP balance via Base RPC',
    ],
    profitCondition: 'Not a tradeable loop — structural price support. Hold SNUT to benefit from deflation.',
    risks: 'Tax reduces liquidity. Burn rate depends on volume. No arbitrage exit — long-term hold mechanic.',
    verdict: 'NOT AN ARB — This is a structural deflation mechanism. Cannot be arbitraged directly. Relevant for bots that monitor burn rate as a price floor indicator and hold signal.',
    verdictColor: 'neutral',
    whatIsIt: 'This is NOT an arbitrage loop. SNUT has a built-in deflationary mechanism: 1% tax on every trade routes through a swapback engine that buys back and burns SNUT. Dead-held SNUT keeps earning NUT rewards. This creates continuous price support and a recursive burn flywheel.',
    howToUse: 'You cannot arbitrage this directly. Instead: 1. Monitor burn rate (dead address SNUT balance growth). 2. Monitor buyback fuel (SNUT contract ETH balance). 3. Use burn rate as a price floor indicator — higher burn = stronger floor. 4. Hold SNUT to benefit from deflationary pressure. 5. Track NUT sent to dead (burned NUT) as a measure of flywheel intensity.',
    whenToUse: 'Use as a HOLD signal, not a trade. When burn rate accelerates (high volume = more tax = more burns), the deflationary pressure increases. When dead-held LP percentage rises, the uncollapsable liquidity floor strengthens.',
    difficulty: 'Beginner (monitoring only)',
    frequency: 'Continuous — every SNUT trade contributes to the burn. Monitor daily/weekly burn rates for trend analysis.',
    capitalNeeded: 'N/A for monitoring. For holding: any amount of SNUT. No gas required to benefit from burns.',
    prerequisites: 'Base RPC for dead address balance queries, SNUT contract read for tax configuration, understanding of deflationary tokenomics.',
        tokens: ['SNUT', 'NUT'],
  },
  {
    id: 6,
    emoji: '🖼️',
    name: 'NFT Fractionalization Arb',
    routeIds: ['NFT-SUDOSWAP-FRAC'],
    venues: 'Sudoswap AMM (fractional pools) ↔ OpenSea / NFT marketplaces',
    formula: 'profit = (fraction_price × total_fractions) - NFT_floor_price - gas',
    steps: [
      'Identify NFT collections with Sudoswap fractional pools (PNUTS, ALMD, SALMD)',
      'Compare: sum of fraction prices vs NFT floor price on marketplaces',
      'If fractions cheap: buy fractions, assemble NFT, sell on marketplace',
      'If NFT cheap: buy NFT on marketplace, fractionalize on Sudoswap, sell fractions',
    ],
    profitCondition: '|fraction_sum - floor_price| > gas + Sudoswap fees + marketplace fees (2.5%)',
    risks: 'Illiquid NFT markets. Fractionalization may not be available for all collections. Marketplace fees. Slow execution.',
    verdict: 'OPPORTUNISTIC — Low liquidity makes this sporadic. Monitor floor prices vs Sudoswap pool values. Best for bots with NFT marketplace integration.',
    verdictColor: 'warning',
    whatIsIt: 'NFT fractionalization arbitrage using Sudoswap AMM. Some BASED NUT NFT collections (PNUTS, ALMD, SALMD) have fractional pools on Sudoswap. When the sum of fraction prices diverges from the NFT floor price on marketplaces, you can arbitrage the gap.',
    howToUse: '1. Identify collections with Sudoswap fractional pools. 2. Get fraction price from Sudoswap pool contract. 3. Get NFT floor price from OpenSea/marketplace. 4. If fractions cheap: buy fractions, assemble full NFT, sell on marketplace. 5. If NFT cheap: buy NFT, fractionalize on Sudoswap, sell fractions. 6. Account for 2.5% marketplace fee.',
    whenToUse: 'When NFT floor prices move sharply (market dumps/hypes). When Sudoswap pool has stale pricing. After collection launches or events. Very opportunistic.',
    difficulty: 'Expert',
    frequency: 'Very rare — NFT markets are illiquid and slow. Maybe once a week or less during active NFT periods.',
    capitalNeeded: '$500+ per NFT. NFT floor prices vary. Fractionalization and assembly have gas costs. Marketplace fees (2.5%) eat into profits.',
    prerequisites: 'Sudoswap SDK, NFT marketplace API (OpenSea), understanding of ERC721/ERC1155, fractionalization mechanics, NFT floor price tracking.',
        tokens: ['PNUTS', 'ALMD', 'SALMD'],
  },
  {
    id: 7,
    emoji: '🥥',
    name: 'SNUT Cross-Venue Arbitrage',
    routeIds: ['SNUT-WETH-UNI2', 'SNUT-NUT-AERO', 'SNUT-BALANCER-BASKET'],
    venues: 'Uniswap V2 (SNUT/WETH) ↔ Aerodrome (SNUT/NUT) ↔ Balancer V2 (pNUT basket)',
    formula: 'profit = SNUT_price_venueB - SNUT_price_venueA - 2 × gas - slippage - 1% tax (if applicable)',
    steps: [
      'Get SNUT price in WETH from UniV2 pool (0xB228...): reserves → SNUT_per_WETH, convert via ETH_USD',
      'Get SNUT price in NUT from Aerodrome pool (0x893f...): reserves → SNUT_per_NUT, convert via NUT_USD',
      'Get SNUT implied price from pNUT Balancer basket: NAV component weight × basket value',
      'Compare all three prices in USD — identify highest vs lowest',
      'Buy SNUT on lowest-price venue, sell on highest-price venue',
      'Account for 1% SNUT transfer tax on non-exempt transactions',
      'Note: DEX-to-DEX transfers may incur the 1% tax. Verify tax-exempt addresses before executing.',
    ],
    profitCondition: 'Spread between any 2 venues > 2 × gas + slippage + 1% tax (if applicable). Tax-exempt routes (pool-to-pool) only need spread > gas + slippage.',
    risks: 'SNUT 1% transfer tax erodes profits on taxable transfers. SNUT uses 9 decimals (NOT 18). Thin liquidity on SNUT/WETH UniV2. pNUT basket price is implied, not directly tradeable. Tax-exempt status of pool addresses must be verified.',
    verdict: 'VIABLE WITH CAUTION — SNUT has multiple venues creating real cross-venue spread opportunities. The 1% transfer tax is one cost factor — verify which addresses are tax-exempt before executing. Spreads between SNUT/WETH and SNUT/NUT can exceed 2% during volatility. The pNUT basket provides an additional price reference and indirect arb via basket composition. Monitor all three venues simultaneously.',
    verdictColor: 'success',
    whatIsIt: 'SNUT trades on 3 venues: Uniswap V2 (SNUT/WETH), Aerodrome (SNUT/NUT), and indirectly via the Balancer pNUT basket. When SNUT prices diverge across these venues, you buy on the cheapest and sell on the most expensive.',
    howToUse: '1. Get SNUT/WETH price from UniV2 (getReserves). 2. Get SNUT/NUT price from Aerodrome (getReserves). 3. Get SNUT implied price from pNUT basket (NAV component). 4. Normalize all to USD. 5. Buy low, sell high across venues. 6. CRITICAL: account for 1% SNUT transfer tax on non-exempt addresses. 7. Verify which addresses are tax-exempt (pool-to-pool may be exempt).',
    whenToUse: 'During SNUT volatility, after large buys/sells on one venue, when NUT price moves but SNUT lags on one venue. The 1% tax matters only on taxable routes.',
    difficulty: 'Advanced',
    frequency: 'Multiple times per day during active SNUT trading. Spreads of 2%+ observed during volatility. Tax-exempt routes are the key to profitability.',
    capitalNeeded: '$1,000+ recommended. Tax-exempt routes need less capital but require verification.',
    prerequisites: 'Base RPC for 3-venue price monitoring, SNUT tax-exempt address list, understanding of 9 decimals (NOT 18), NUT price feed for USD normalization, Balancer API for pNUT component.',
        tokens: ['SNUT', 'NUT', 'WETH', 'pNUT'],
  },
  {
    id: 8,
    emoji: '⚛️',
    name: 'SNUT/NUT Reactor Keeper Game',
    routeIds: ['SNUT-NUT-REACTOR'],
    venues: 'Aerodrome V2 (SNUT/NUT) — dividend-eligible pair',
    formula: 'profit = excess_NUT_balance - gas (skim or sync + swap)',
    steps: [
      'SNUT/NUT pair is dividend-eligible BY DESIGN — NUT rewards sent to pair create excess balance above recorded reserves',
      'Monitor: actual NUT balance vs getReserves() NUT reserve. Excess = actual - recorded',
      'When excess > gas cost: call skim() to extract excess NUT to yourself, OR call sync() to absorb excess into reserves then swap',
      'Alternatively: burn LP tokens to claim pro-rata share of actual balances (including excess NUT)',
      'This is a keeper game — fastest bot wins the excess. Low float + thin liquidity = forced arb surface',
    ],
    profitCondition: 'excess_NUT_value > gas + slippage. Must be faster than competing keepers.',
    risks: 'Competition from other keepers. Gas wars during high excess events. NUT is low-float, thin liquidity — exit may be difficult. Must understand skim/sync mechanics. Not a passive yield position — active keeper role only.',
    verdict: 'ADVANCED KEEPER ARB — This is an intentional reactor surface, not a bug. The SNUT/NUT pair is dividend-eligible by design. NUT reward inflows create excess-balance opportunities. Keepers who monitor and act fastest extract value. Best for sophisticated bots with mempool monitoring and gas optimization.',
    verdictColor: 'warning',
    whatIsIt: 'The SNUT/NUT Aerodrome pool is dividend-eligible by design. NUT rewards flow into the pair, creating excess balance above recorded reserves. Keepers monitor this excess and extract it via skim() or sync()+swap(). This is an intentional reactor surface — a keeper competition game.',
    howToUse: '1. Monitor actual NUT balance of the SNUT/NUT pair vs getReserves() NUT value. 2. Excess = actual_balance - recorded_reserve. 3. When excess > gas cost: call skim() to pull excess NUT to your address, OR call sync() to reset reserves to actual balances then swap the imbalance. 4. Alternatively: hold LP tokens and burn them to claim pro-rata share of actual balances (including excess). 5. This is a SPEED game — fastest keeper wins.',
    whenToUse: 'Continuously monitor. NUT rewards flow on a schedule — excess accumulates predictably. Best executed right after reward distributions. Gas wars during high-excess events.',
    difficulty: 'Expert',
    frequency: 'Regular — depends on NUT reward distribution schedule. Excess accumulates every reward cycle. Competition is the main barrier, not opportunity.',
    capitalNeeded: '$50+ for gas. No capital needed for skim() — you extract value directly. For LP burn strategy, you need LP tokens (requires providing liquidity first).',
    prerequisites: 'Mempool monitoring for competing keepers, gas optimization (priority fee bidding), understanding of skim/sync mechanics, Aerodrome dividend system knowledge, fast RPC endpoint.',
        tokens: ['SNUT', 'NUT'],
  },
  {
    id: 9,
    emoji: '🧬',
    name: 'SNUT/ETH-LP Meta-Pool Arbitrage',
    routeIds: ['SNUT-ETHLP-META'],
    venues: 'Uniswap V2 (SNUT/ETH-LP/ETH meta-pool) ↔ Uniswap V2 (SNUT/WETH main pool)',
    formula: 'profit = LP_NAV_premium - gas - slippage',
    steps: [
      'Path 1 — LP Premium: Acquire SNUT + ETH → add liquidity to SNUT/ETH main pool → receive LP tokens → sell LP tokens on meta-pool for ETH. Profit when meta-pool LP price > fair NAV.',
      'Path 2 — LP Discount: Buy LP tokens on meta-pool for ETH → remove liquidity from SNUT/ETH main pool (unwrap LP) → receive SNUT + ETH → sell SNUT for ETH. Profit when meta-pool LP price < fair NAV.',
      'Path 3 — Synthetic Short: If SNUT price dropping on main pool but LP tokens lag on meta-pool → buy LP on meta-pool, unwrap, dump SNUT. LP price is sticky to NAV but reacts slower than spot.',
      'Calculate LP fair NAV: LP_NAV = (SNUT_reserve × SNUT_price + ETH_reserve × ETH_price) / LP_total_supply',
      'Compare meta-pool LP token price vs fair NAV — identify discount or premium',
      'Monitor both pools simultaneously — meta-pool price should track NAV but may drift during volatility',
    ],
    profitCondition: '|meta_pool_LP_price - LP_fair_NAV| > gas + slippage + LP removal/addition fees',
    risks: 'LP token liquidity on meta-pool may be thin. Removing liquidity from SNUT/ETH main pool affects SNUT price. SNUT 1% tax may apply on LP token transfers. Complex multi-step execution. Must account for pending fees accrued in LP position.',
    verdict: 'OPPORTUNISTIC — Unique meta-market arb. The LP-token/ETH pool creates a secondary market for SNUT/ETH liquidity claims. Best executed when meta-pool LP price diverges significantly from fair NAV. Requires monitoring both pools and calculating LP NAV in real-time. Low frequency but high potential when triggered.',
    verdictColor: 'warning',
    whatIsIt: 'The SNUT/ETH-LP meta-pool is a Uniswap V2 pool where LP tokens of the main SNUT/ETH pool are traded against ETH. This creates a secondary market for LP token claims. When the meta-pool LP price diverges from the fair Net Asset Value (NAV) of the underlying LP position, you can arbitrage the gap.',
    howToUse: 'Path 1 (LP Premium): When meta-pool LP price > fair NAV: 1. Acquire SNUT + ETH. 2. Add liquidity to SNUT/ETH main pool → receive LP tokens. 3. Sell LP tokens on meta-pool for ETH. Profit = meta-pool price - NAV - gas - slippage. Path 2 (LP Discount): When meta-pool LP price < fair NAV: 1. Buy LP tokens on meta-pool with ETH. 2. Remove liquidity from SNUT/ETH main pool (unwrap LP). 3. Receive SNUT + ETH. 4. Sell SNUT for ETH. Profit = NAV - meta-pool price - gas - slippage. Path 3 (Synthetic Short): When SNUT price is dropping on main pool but LP tokens lag on meta-pool: 1. Buy LP on meta-pool. 2. Unwrap LP. 3. Dump SNUT component. LP price is sticky to NAV but reacts slower than spot.',
    whenToUse: 'When meta-pool LP price diverges >1% from fair NAV. During SNUT volatility (LP price is sticky, spot moves fast). After large liquidity adds/removes on the main pool. When SNUT tax events create imbalances.',
    difficulty: 'Expert',
    frequency: 'Low frequency but high potential. Opportunities arise during SNUT price volatility. LP token prices are inherently sticky, creating predictable lag-based windows.',
    capitalNeeded: '$500+ recommended. LP addition/removal requires both SNUT and ETH. Meta-pool liquidity may be thin — slippage on large sizes.',
    prerequisites: 'Real-time LP NAV calculation (SNUT_reserve × price + ETH_reserve × price) / LP_supply, monitoring both pools simultaneously, understanding of LP token mechanics, SNUT 1% tax awareness on LP transfers.',
        tokens: ['SNUT', 'WETH', 'SNUT/ETH-LP'],
  },
];

// ═══════════════════════════════════════════════════════════════
// MINT CLUB BONDING CURVE MECHANICS
// ═══════════════════════════════════════════════════════════════
const MINT_CLUB_FACTS = [
  { label: 'Mechanism', value: 'Mint/burn (NOT AMM swap). New tokens are minted when buying, burned when selling. No LP deposits needed — the curve IS the liquidity.' },
  { label: 'Price Formula', value: 'Bonding curve price = NUT_locked / token_supply. Price increases as supply mints, decreases as supply burns.' },
  { label: 'Buy ≠ Sell', value: 'BUY (mint) price is ALWAYS higher than SELL (burn) price. The spread is protocol revenue. Can be 10x to 18,000,000x depending on curve position.' },
  { label: 'Royalty', value: '1% creator royalty on BOTH mint and burn transactions. Deducted from the base asset (NUT).' },
  { label: 'Curve Types', value: 'Exponential (most common, price increases at constant rate), Linear, Logarithmic, Flat. Mint Club uses a Discrete Bonding Curve (DBC) with step arrays.' },
  { label: 'Token Specs', value: 'Max Minting Supply, Initial Minting Price, Final Minting Price, Price Intervals (steps). More steps = smoother price curve.' },
  { label: 'Base Asset', value: 'NUT is the base/reserve asset for all BASED NUT bonding curves. SALT and NUTINO are both backed by NUT.' },
  { label: 'SDK', value: 'npm i mint.club-v2-sdk — Official SDK for programmatic interaction. Docs: https://sdk.mint.club/' },
  { label: 'Price Retrieval', value: 'Mint Club tokens are minimal proxy contracts (45 bytes). Direct RPC price queries are unreliable. Use browser automation (Playwright) or the V2 SDK for accurate prices.' },
  { label: 'Why Loops Are Challenging', value: 'Forward: DEX price tends to be below MC buy price → squeezed. Reverse: MC sell price tends to be below DEX price → squeezed. The spread captures significant value from BOTH directions. However, during volatile market conditions or external liquidity events, DEX price can diverge enough from the bonding curve to create profitable windows. Monitor for 5-10%+ divergence.' },
];

// ═══════════════════════════════════════════════════════════════
// VENUE INTEL — WITH API ENDPOINTS
// ═══════════════════════════════════════════════════════════════
const VENUES = [
  { name: 'Uniswap V3', type: 'Concentrated AMM', pairs: 'NUT/WETH', fee: '0.3%', notes: 'Primary NUT venue. Use slot0() for price. DEX Screener CANNOT see this pool — must use Base RPC.', api: 'Base RPC: eth_call slot0() → 0x3850c7bd' },
  { name: 'Uniswap V2', type: 'XYK AMM', pairs: 'NUT/WETH, SNUT/WETH, NUTINO/cbBTC', fee: '0.3%', notes: 'Secondary venues. Use getReserves() for price.', api: 'Base RPC: eth_call getReserves() → 0x0902f1ac' },
  { name: 'Aerodrome', type: 've(3,3) AMM', pairs: 'NUT/AERO, NUT/cbBTC, SALT/USDC, SNUT/NUT', fee: 'Variable', notes: 'Base native DEX. SALT primary venue. SNUT primary venue. Same interface as UniV2.', api: 'Base RPC: getReserves() + token0() for ordering' },
  { name: 'Mint Club', type: 'Bonding Curve', pairs: 'SALT (backed by NUT), NUTINO (backed by NUT)', fee: '1% royalty', notes: 'Mint/burn only. Buy ≠ Sell. Price = NUT_locked / supply. Use SDK or browser for prices.', api: 'SDK: npm i mint.club-v2-sdk | UI: https://mint.club/token/base/{TOKEN}' },
  { name: 'Balancer V2', type: 'Weighted Pool', pairs: 'pNUT (25% each: cbETH, cbBTC, NUT, SNUT)', fee: 'Variable', notes: 'pNUT IS the BPT. NAV = totalLiquidity / totalShares. Mint by depositing basket, redeem to withdraw.', api: 'REST: https://api.balancer.fi/v1/pools/base/{pool_addr} | GraphQL: https://api.thegraph.com/subgraphs/name/balancer-base-v2' },
  { name: 'Sudoswap', type: 'NFT AMM', pairs: 'PNUTS, ALMD, SALMD fractional pools', fee: 'Variable', notes: 'NFT fractionalization. Buy/sell fractions without splitting NFTs.', api: 'Base RPC: balanceOf() on pool contracts' },
  { name: 'DexScreener', type: 'Price API', pairs: 'All DEX pairs (fallback)', fee: 'Free', notes: 'Good for V2 pools. CANNOT correctly handle UniV3 NUT/WETH pool. Use as secondary source only.', api: 'GET https://api.dexscreener.com/latest/dex/tokens/{token_addr}' },
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
// MACHINE-READABLE SPEC
// ═══════════════════════════════════════════════════════════════
const MACHINE_SPEC = {
  chain: 'base',
  chainId: 8453,
  rpc: 'https://mainnet.base.org',
  tokens: {
    NUT: '0xb8de15fb529d98c93c749de63c749d48d25a30df',
    SNUT: '0xAC130701aa31c284c36609E2489f150F419AD7AD',
    pNUT: '0x2a5757b60987ff10385de1d4d923792f6fdcfff1',
    SALT: '0x1EDe2AFC985F6D7aEb3F4c84B95A103c00D5dE81',
    NUTINO: '0x30421e2d18dFF60B298eEF427cF868cA65f1476B',
    WETH: '0x4200000000000000000000000000000000000006',
    AERO: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
    cbBTC: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
    cbETH: '0x2Ae3F1Ec7F1f5012CFEab0185bfc7aa3cf0DEc22',
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    PIPS: '0x3f2327221dd4f0bae660172606d6b288a1cf8ad9',
  },
  decimals: { NUT: 18, SNUT: 9, pNUT: 18, SALT: 18, NUTINO: 18, WETH: 18, AERO: 18, cbBTC: 8, cbETH: 18, USDC: 6, PIPS: 18 },
  pools: {
    NUT_WETH_V3: { addr: '0xe3ce00e2ed742b142c15eedc208657dd22aa987e', type: 'V3', token0: 'WETH', token1: 'NUT' },
    NUT_WETH_V2: { addr: '0x997bad8e9f5c34d5e9784caaa8a554a5e6192f53', type: 'V2', token0: 'WETH', token1: 'NUT' },
    NUT_AERO: { addr: '0x38630fede5e2032652640d98b2d3f9c6296eea5d', type: 'V2', token0: 'AERO', token1: 'NUT' },
    NUT_cbBTC: { addr: '0x15385c9281bc12d2e9bf5c081621944b0ee2acca', type: 'V2', token0: 'NUT', token1: 'cbBTC' },
    SNUT_NUT: { addr: '0x893faaa7baf7a8247fc7142afb28e13d51a5aae8', type: 'V2', token0: 'SNUT', token1: 'NUT' },
    SNUT_WETH: { addr: '0xB22895d2ee6e29395F30Ec47c8D9FE0d55355AE1', type: 'V2', token0: 'WETH', token1: 'SNUT' },
    NUTINO_cbBTC: { addr: '0xeafde67d470480d14139e3d91164c158b82b38e2', type: 'V2', token0: 'NUTINO', token1: 'cbBTC' },
    SALT_USDC: { addr: '0x64ca0b147f625007b6f082abbb3ba217930eccb2', type: 'V2', token0: 'SALT', token1: 'USDC' },
    PIPS_NUT_SLIPSTREAM: { addr: '0x7f8e532cf1be9ed688adb9e6585bc69f017201b5', type: 'CL', token0: 'PIPS', token1: 'NUT' },
    PIPS_USDC_RECLAMM: { addr: '0xb19e3af68BB307369e8772A9E157431FcFE9Dd44', type: 'reCLAMM', token0: 'PIPS', token1: 'USDC' },
    pNUT_BALANCER: { addr: '0x2a5757b60987ff10385de1d4d923792f6fdcfff1', poolId: '0x2a5757b60987ff10385de1d4d923792f6fdcfff100010000000000000000019e', type: 'WeightedPool', weights: [25, 25, 25, 25], basket: ['cbETH', 'cbBTC', 'NUT', 'SNUT'] },
  },
  vaults: {
    mint_club_lock: '0xc5a076cad94176c2996b32d8466be1ce757faa27',
    balancer_vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    snut_lp_meta_pool: '0x82bbadb9d6b2c0a59ed01809e30323f89f6faa1c',
  },
  nfts: {
    PNUTS: { addr: '0x794fcD89357C1CcF04a1a9A441ad4dB2Cd5EE387', label: 'Peanut War Generals', supply: 251 },
    ALMD: { addr: '0x1A160456005AED47994E1c13C9bc31F274413927', label: 'Almond War Generals', supply: 424 },
    SALMD: { addr: '0x1E0f80529593185C021043ffcbfDcB8f4279C649', label: 'Almond Soldiers', supply: 6238 },
    PNUTRMY: { addr: '0xF075300b8C2EF500d8Ce4f783F910C500B9A3512', label: 'Peanut Soldiers', supply: 5013 },
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
    liquidity: '0x1a686502',
  },
  routes: [
    'NUT-UNI3-UNI2',
    'NUT-UNI3-AERO-AERO',
    'NUT-UNI3-AERO-CBBTC',
    'PNUT-NAV-MINT',
    'PNUT-NAV-REDEEM',
    'SALT-MC-AERO-USDC',
    'NUTINO-MC-UNI2-CBBTC',
    'SNUT-WETH-UNI2',
    'SNUT-NUT-AERO',
    'SNUT-BALANCER-BASKET',
    'SNUT-BUYBACK-BURN',
    'NFT-SUDOSWAP-FRAC',
    'PIPS-NUT-SLIPSTREAM',
    'PIPS-USDC-RECLAMM',
  ],
  apis: {
    dexscreener: 'https://api.dexscreener.com/latest/dex/tokens/{token_addr}',
    coingecko: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,wrapped-bitcoin,coinbase-wrapped-staked-eth&vs_currencies=usd',
    balancer: 'https://api.balancer.fi/v1/pools/base/{pool_addr}',
    balancer_graphql: 'https://api.thegraph.com/subgraphs/name/balancer-base-v2',
    mint_club_sdk: 'npm i mint.club-v2-sdk',
    mint_club_docs: 'https://sdk.mint.club/',
  },
};

// ═══════════════════════════════════════════════════════════════
// BOT COMMANDS — DIRECT WIRING REFERENCE FOR AGENTS
// ═══════════════════════════════════════════════════════════════
const COMMANDS = [
  {
    trigger: '/arb-scan',
    name: 'Arbitrage Scanner',
    emoji: '⚔️',
    args: '[NUT|SNUT|pNUT|SALT|NUTINO|all]',
    desc: 'Full arbitrage scanner — cross-venue, pNUT index, and Mint Club loops.',
    scanTypes: ['Cross-Venue (NUT/SNUT)', 'pNUT Index (Volatility)', 'Mint Club Loop (SALT/NUTINO)'],
    impl: [
      'Fetch component prices via CoinGecko: ethereum, bitcoin, coinbase-wrapped-staked-eth',
      'Query UniV3 via slot0() → sqrtPriceX96 → (sqrt/2^96)^2 → price ratio',
      'Query UniV2/Aerodrome via getReserves() → reserve0/reserve1',
      'Always verify token0() to determine price direction (invert if needed)',
      'pNUT basket: balanceOf() for cbETH, cbBTC, NUT, SNUT on pNUT contract',
      'NAV = (cbETH_bal × cbETH_price + cbBTC_bal × cbBTC_price + NUT_bal × NUT_price + SNUT_bal × SNUT_price) / pNUT_supply',
      'Mint Club prices: browse https://mint.club/token/base/SALT or /NUTINO for UI prices',
    ],
    keyData: 'NUT_POOLS: 4 venues (V3, V2, AERO, cbBTC). SNUT_POOLS: 2 venues (NUT, WETH). pNUT: Balancer V2 WeightedPool. MINT_CLUB: SALT/USDC, NUTINO/cbBTC.',
    verdict: 'MOST COMPREHENSIVE — Covers all 3 arb types in one scan. Use as the primary monitoring command.',
  },
  {
    trigger: '/loop-scan',
    name: 'Loop Arbitrage Scanner',
    emoji: '🔄',
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
    verdict: 'SPECIALIZED — Deeper analysis of Mint Club loops than /arb-scan. Use for focused SALT/NUTINO monitoring.',
  },
  {
    trigger: '/token-info',
    name: 'Token Info',
    emoji: '📊',
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
    verdict: 'ESSENTIAL — First command to run for any token. Use before executing arb trades to verify current state.',
  },
  {
    trigger: '/nut-status',
    name: 'NUT Ecosystem Status',
    emoji: '🌰',
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
    keyData: 'NUT supply=1 (unity). TRUE MCAP = price. Mint Club Lock: 0xc5a076... holds NUT reserves. SNUT supply=100,000, deflationary.',
    verdict: 'OVERVIEW — Use for dashboard-style ecosystem monitoring. Best for periodic health checks.',
  },
  {
    trigger: '/pools',
    name: 'Pool Status',
    emoji: '💧',
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
    keyData: '10 pools total: 4 NUT, 3 SNUT, 1 NUTINO, 1 SALT, 1 pNUT. Plus 3 NFT Sudoswap pools. SNUT/ETH-LP meta-pool: 0x82bbadb9...',
    verdict: 'STRUCTURAL — Use to identify which pools have deepest liquidity before executing arb routes.',
  },
  {
    trigger: '/nft-status',
    name: 'NFT Status',
    emoji: '🖼️',
    args: '[none]',
    desc: 'NFT collection status — minted counts, Sudoswap pools, and fractionalization opportunities.',
    scanTypes: ['Supply Query', 'Sudoswap Pool Prices', 'Floor Price Comparison'],
    impl: [
      'Query totalSupply() (0x18160ddd) for each NFT contract',
      'Check Sudoswap pool balances for fraction prices',
      'Compare fraction sums vs NFT floor prices on marketplaces',
      'Collections: PNUTS (251), ALMD (424), SALMD (6238), PNUTRMY (5013)',
    ],
    keyData: 'PNUTS: 0x794fcD... (251 minted). ALMD: 0x1A1604... (424). SALMD: 0x1E0f80... (6238). PNUTRMY: 0xF07530... (5013). Sudoswap pools for 3 of 4.',
    verdict: 'OPPORTUNISTIC — Use for NFT fractionalization arb research. Low liquidity, sporadic opportunities.',
  },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function ArbBotPage() {
  const [activeSection, setActiveSection] = useState('stealth');
  const [expandedLoop, setExpandedLoop] = useState(null);
  const [expandedCode, setExpandedCode] = useState(null);
  const [specCopied, setSpecCopied] = useState(false);

  const navItems = [
    { id: 'stealth', label: '⚠️ Stealth' },
    { id: 'addresses', label: '📍 Addresses' },
    { id: 'functions', label: '🔧 Sigs' },
    { id: 'rpc', label: '🐍 RPC Code' },
    { id: 'loops', label: '⚔️ Arb Loops' },
    { id: 'mintclub', label: '🏭 Mint Club' },
    { id: 'pnut', label: '🧺 pNUT Index' },
    { id: 'venues', label: '🏠 Venues' },
    { id: 'nft', label: '🖼️ NFT' },
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
    error: { bg: 'rgba(220,20,60,0.08)', border: 'rgba(220,20,60,0.2)', text: '#c62828' },
    neutral: { bg: 'rgba(100,100,100,0.06)', border: 'rgba(100,100,100,0.15)', text: '#555' },
  };

  return (
    <Layout>
      <Head>
        <title>Arb Bot Builder | BASED NUT</title>
        <meta name="description" content="Static reference for building arbitrage bots in the BASED NUT ecosystem. Verified addresses, RPC code, function signatures, arb loops, and machine-readable spec." />
      </Head>

      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
        {/* ══ HEADER ══ */}
        <Box sx={{ mb: 2, p: { xs: 2, md: 3 }, borderRadius: 3, background: 'linear-gradient(135deg, #4A2F1A 0%, #6B3D20 50%, #8B5A2B 100%)', color: '#FAF3E6' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>⚔️ Arb Bot Builder</Typography>
          <Typography sx={{ opacity: 0.85, fontSize: '0.95rem' }}>Static reference for AI agents building arbitrage bots across the BASED NUT ecosystem on Base. All addresses verified on-chain. All code is copy-pasteable Python.</Typography>
        </Box>

        {/* ══ RISK DISCLAIMER ══ */}
        <Box sx={{
          mb: 3, p: { xs: 2, md: 3 }, borderRadius: 3,
          background: 'repeating-linear-gradient(45deg, rgba(220,20,60,0.04), rgba(220,20,60,0.04) 10px, rgba(220,20,60,0.08) 10px, rgba(220,20,60,0.08) 20px)',
          border: '3px solid rgba(220,20,60,0.35)',
        }}>
          <Typography variant="h5" sx={{ color: '#c62828', fontWeight: 'bold', mb: 1, fontSize: { xs: '1.1rem', md: '1.3rem' } }}>⚠️ RISK DISCLOSURE — READ THIS FIRST</Typography>
          <Box sx={{ color: 'rgba(120,20,20,0.85)', fontSize: '0.88rem', lineHeight: 1.6 }}>
            <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#c62828', mb: 0.5 }}>This is NOT financial advice. BASED NUT is an experimental memefi project.</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: 'rgba(120,20,20,0.8)', mb: 0.5 }}>- Arbitrage is a RISKY business. You CAN and WILL lose money. Markets move instantly — a profitable spread can vanish in milliseconds.</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: 'rgba(120,20,20,0.8)', mb: 0.5 }}>- Smart contract risk: bugs, exploits, and rug pulls exist. Token taxes can change. Pool configurations can shift. Nothing is guaranteed.</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: 'rgba(120,20,20,0.8)', mb: 0.5 }}>- Liquidity risk: low-liquidity pools mean slippage will eat profits. Exit liquidity is never guaranteed. You may get stuck holding bags.</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: 'rgba(120,20,20,0.8)', mb: 0.5 }}>- Competition risk: other bots are faster than you. Gas wars are real. MEV extractors WILL front-run your transactions.</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: 'rgba(120,20,20,0.8)', mb: 0.5 }}>- Technical risk: incorrect decimals, wrong token ordering, misconfigured tax — a single mistake can drain your wallet.</Typography>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#c62828', mt: 1 }}>TRADE AT YOUR OWN RISK. USE AT YOUR OWN RISK. This page is a technical reference, not a solicitation to trade. Nothing here constitutes financial, investment, or trading advice. Always do your own research and never risk more than you can afford to lose.</Typography>
          </Box>
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
          '&::-webkit-scrollbar-thumb': { background: 'rgba(139,69,19,0.2)', borderRadius: 2 },
        }}>
          {navItems.map((item) => (
            <Box
              key={item.id}
              onClick={() => scrollTo(item.id)}
              sx={{
                px: 1.5, py: 0.5, borderRadius: 999,
                fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer',
                flexShrink: 0,
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

        {/* ══ STEALTH ARCHITECTURE ══ */}
        <Box id="stealth" sx={{ mb: 4, scrollMarginTop: 60 }}>
          <Typography variant="h5" sx={{ mb: 2, color: '#5B3A29', fontWeight: 'bold' }}>⚠️ Stealth Architecture — Critical Context</Typography>
          <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(220,20,60,0.04)', border: '1px solid rgba(220,20,60,0.12)' }}>
            {STEALTH_NOTES.map((n, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'flex-start' }}>
                <Box sx={{
                  minWidth: 20, height: 20, borderRadius: '50%',
                  background: n.severity === 'critical' ? 'rgba(220,20,60,0.15)' : 'rgba(255,165,0,0.15)',
                  color: n.severity === 'critical' ? '#c62828' : '#e65100',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, mt: 0.15,
                }}>{n.severity === 'critical' ? '!' : '⚠'}</Box>
                <Typography sx={{ fontSize: '0.85rem', color: 'rgba(40,40,60,0.85)', lineHeight: 1.5, wordBreak: 'break-word', overflowWrap: 'break-word' }}>{n.warn}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ══ VERIFIED ADDRESSES ══ */}
        <Box id="addresses" sx={{ mb: 4, scrollMarginTop: 60 }}>
          <Typography variant="h5" sx={{ mb: 2, color: '#5B3A29', fontWeight: 'bold' }}>📍 Verified Address Registry</Typography>
          <Typography sx={{ fontSize: '0.8rem', color: 'rgba(40,40,60,0.5)', mb: 2 }}>All addresses verified on-chain via Base RPC on 2026-07-03. Every contract has been confirmed to exist and return expected data.</Typography>

          {/* Tokens */}
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#8B5A2B', mb: 1 }}>Tokens</Typography>
          <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, mb: 2, '&::-webkit-scrollbar': { height: 4 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(139,69,19,0.2)', borderRadius: 2 } }}>
            {TOKENS.map((t) => (
              <Box key={t.name} sx={{
                minWidth: 240, maxWidth: 260, flexShrink: 0,
                p: 1.5, borderRadius: 2,
                background: 'rgba(255,252,245,0.95)',
                border: '1px solid rgba(139,90,43,0.12)',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(90,60,30,0.1)' },
              }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#5B3A29', mb: 0.25 }}>{t.emoji} {t.name} <Box component="span" sx={{ fontSize: '0.7rem', color: 'rgba(40,40,60,0.4)' }}>({t.decimals}d)</Box></Typography>
                <Typography sx={{ fontSize: '0.76rem', color: 'rgba(40,40,60,0.65)', lineHeight: 1.35, mb: 0.5 }}>{t.role}</Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'rgba(40,40,60,0.4)', fontFamily: 'monospace', mb: 0.25, wordBreak: 'break-all' }}>{t.address}</Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'rgba(40,40,60,0.4)', mb: 0.5 }}>Supply: {t.supply}</Typography>
                {t.href ? (
                  <Link href={t.href} style={{ textDecoration: 'none' }}>
                    <Box sx={{ display: 'inline-block', px: 1, py: 0.25, borderRadius: 1, fontSize: '0.72rem', fontWeight: 600, color: '#8B5A2B', cursor: 'pointer', background: 'rgba(139,90,43,0.06)', border: '1px solid rgba(139,90,43,0.15)', '&:hover': { background: 'rgba(139,90,43,0.12)' } }}>Profile →</Box>
                  </Link>
                ) : (
                  <Box sx={{ display: 'inline-block', px: 1, py: 0.25, borderRadius: 1, fontSize: '0.72rem', fontWeight: 600, color: 'rgba(40,40,60,0.3)', background: 'rgba(0,0,0,0.02)' }}>Quote Token</Box>
                )}
              </Box>
            ))}
          </Box>

          {/* Vaults */}
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#8B5A2B', mb: 1, mt: 2 }}>Vaults & Infrastructure</Typography>
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {VAULTS.map((v) => (
              <Grid key={v.name} size={{ xs: 12, sm: 6, md: 4 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,252,245,0.9)', border: '1px solid rgba(139,90,43,0.12)' }}>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#5B3A29', mb: 0.25 }}>{v.name}</Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: 'rgba(40,40,60,0.4)', fontFamily: 'monospace', mb: 0.5, wordBreak: 'break-all' }}>{v.address}</Typography>
                  <Typography sx={{ fontSize: '0.76rem', color: 'rgba(40,40,60,0.65)', lineHeight: 1.35 }}>{v.purpose}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Liquidity Pools */}
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#8B5A2B', mb: 1, mt: 2 }}>💧 Liquidity Pools</Typography>
          <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(139,90,43,0.12)', mb: 2 }}>
            {POOLS.map((p, i) => (
              <Box key={i} sx={{
                p: 1.25, display: 'flex', alignItems: 'flex-start', gap: 1.5,
                background: i % 2 === 0 ? 'rgba(255,252,245,0.9)' : 'rgba(255,252,245,0.6)',
                borderBottom: i < POOLS.length - 1 ? '1px solid rgba(139,90,43,0.08)' : 'none',
              }}>
                <Box sx={{ minWidth: 130, flexShrink: 0 }}>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#5B3A29' }}>{p.name}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: 'rgba(40,40,60,0.5)' }}>{p.platform} · {p.type}</Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: '#8B6914', fontStyle: 'italic', mt: 0.25 }}>“{p.flavor}”</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.68rem', color: 'rgba(40,40,60,0.4)', fontFamily: 'monospace', mb: 0.25, wordBreak: 'break-all' }}>{p.address}</Typography>
                  <Typography sx={{ fontSize: '0.74rem', color: 'rgba(40,40,60,0.65)', mb: 0.25 }}><strong>token0:</strong> {p.token0} · <strong>token1:</strong> {p.token1}</Typography>
                  <Typography sx={{ fontSize: '0.74rem', color: 'rgba(40,40,60,0.55)' }}>{p.notes}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ══ FUNCTION SIGNATURES ══ */}
        <Box id="functions" sx={{ mb: 4, scrollMarginTop: 60 }}>
          <Typography variant="h5" sx={{ mb: 2, color: '#5B3A29', fontWeight: 'bold' }}>🔧 Function Signatures (Hex Selectors)</Typography>
          <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(139,90,43,0.12)' }}>
            {FUNCTION_SIGS.map((f, i) => (
              <Box key={f.sig} sx={{
                p: 1.25, display: 'flex', alignItems: 'flex-start', gap: 1.5,
                background: i % 2 === 0 ? 'rgba(255,252,245,0.9)' : 'rgba(255,252,245,0.6)',
                borderBottom: i < FUNCTION_SIGS.length - 1 ? '1px solid rgba(139,90,43,0.08)' : 'none',
              }}>
                <Box sx={{ minWidth: 100, flexShrink: 0 }}>
                  <Box sx={{ px: 0.75, py: 0.15, borderRadius: 1, background: 'rgba(2,6,23,0.06)', display: 'inline-block' }}>
                    <code style={{ fontSize: '0.72rem', color: '#8B5A2B', fontFamily: 'monospace' }}>{f.sig}</code>
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#5B3A29' }}>{f.name}</Typography>
                  <Typography sx={{ fontSize: '0.76rem', color: 'rgba(40,40,60,0.65)', lineHeight: 1.4, mb: 0.25 }}>{f.desc}</Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: 'rgba(40,40,60,0.4)', fontFamily: 'monospace' }}>Returns: {f.returns}</Typography>
                  {f.args && <Typography sx={{ fontSize: '0.68rem', color: 'rgba(40,40,60,0.4)', fontFamily: 'monospace' }}>Args: {f.args}</Typography>}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ══ RPC IMPLEMENTATION CODE ══ */}
        <Box id="rpc" sx={{ mb: 4, scrollMarginTop: 60 }}>
          <Typography variant="h5" sx={{ mb: 2, color: '#5B3A29', fontWeight: 'bold' }}>🐍 RPC Implementation (Python)</Typography>
          <Typography sx={{ fontSize: '0.8rem', color: 'rgba(40,40,60,0.5)', mb: 2 }}>Copy-pasteable Python code. No Web3 library required. Uses requests + Base JSON-RPC only.</Typography>
          <Grid container spacing={2}>
            {CODE_BLOCKS.map((block, i) => (
              <Grid key={i} size={{ xs: 12 }}>
                <Box sx={{
                  p: 1.5, borderRadius: 2,
                  background: 'rgba(255,252,245,0.95)',
                  border: '1px solid rgba(139,90,43,0.12)',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#5B3A29' }}>{block.title}</Typography>
                    <IconButton size="small" onClick={() => setExpandedCode(expandedCode === i ? null : i)}>
                      {expandedCode === i ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                    </IconButton>
                  </Box>
                  <Typography sx={{ fontSize: '0.76rem', color: 'rgba(40,40,60,0.6)', lineHeight: 1.4, mb: 1 }}>{block.desc}</Typography>
                  <Collapse in={expandedCode === i}>
                    <Box sx={{ p: 1, borderRadius: 1, background: 'rgba(2,6,23,0.03)', border: '1px solid rgba(2,6,23,0.06)', overflowX: 'auto' }}>
                      <pre style={{ fontSize: '0.7rem', lineHeight: 1.5, margin: 0, color: 'rgba(40,40,60,0.85)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{block.code}</pre>
                    </Box>
                  </Collapse>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ══ ARB LOOPS ══ */}
        <Box id="loops" sx={{ mb: 4, scrollMarginTop: 60 }}>
          <Typography variant="h5" sx={{ mb: 1, color: '#5B3A29', fontWeight: 'bold' }}>⚔️ Arbitrage Loops — Honest Assessment</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: 'rgba(40,40,60,0.65)', mb: 1 }}>Each loop is a self-contained arbitrage strategy with a full breakdown: what it is, how to execute it, when to deploy it, difficulty level, expected frequency, capital requirements, and prerequisites.</Typography>
          <Typography sx={{ fontSize: '0.82rem', color: 'rgba(40,40,60,0.55)', mb: 2 }}><strong>How to use this page:</strong> Pick a loop that matches your skill level and capital. Read the What / How / When sections. Expand the card for step-by-step execution, profit conditions, and risks. Start with beginner-friendly loops (5, 1) before attempting advanced (2, 7, 8, 9).</Typography>
          <Grid container spacing={2}>
            {ARB_LOOPS.map((loop) => {
              const vc = verdictColors[loop.verdictColor] || verdictColors.neutral;
              return (
                <Grid key={loop.id} size={{ xs: 12, md: 6 }}>
                  <Box sx={{
                    p: 2, borderRadius: 3,
                    background: 'rgba(255,252,245,0.95)',
                    border: '1px solid rgba(139,90,43,0.12)',
                    boxShadow: '0 2px 8px rgba(90,60,30,0.06)',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#5B3A29' }}>{loop.emoji} {loop.name}</Typography>
                      <IconButton size="small" onClick={() => setExpandedLoop(expandedLoop === loop.id ? null : loop.id)}>
                        {expandedLoop === loop.id ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1, alignItems: 'center' }}>
                      <Box sx={{ px: 0.75, py: 0.2, borderRadius: 999, fontSize: '0.65rem', fontWeight: 700, color: loop.difficulty === 'Beginner' ? '#2e7d32' : loop.difficulty === 'Intermediate' ? '#1565c0' : loop.difficulty === 'Advanced' ? '#e65100' : '#c62828', background: loop.difficulty === 'Beginner' ? 'rgba(34,139,34,0.08)' : loop.difficulty === 'Intermediate' ? 'rgba(21,101,192,0.08)' : loop.difficulty === 'Advanced' ? 'rgba(230,81,0,0.08)' : 'rgba(198,40,40,0.08)', border: `1px solid ${loop.difficulty === 'Beginner' ? 'rgba(34,139,34,0.2)' : loop.difficulty === 'Intermediate' ? 'rgba(21,101,192,0.2)' : loop.difficulty === 'Advanced' ? 'rgba(230,81,0,0.2)' : 'rgba(198,40,40,0.2)'}` }}>{loop.difficulty}</Box>
                      {loop.routeIds.map((r) => (
                        <Box key={r} sx={{ px: 0.75, py: 0.15, borderRadius: 1, background: 'rgba(2,6,23,0.04)', fontSize: '0.68rem', fontFamily: 'monospace', color: 'rgba(40,40,60,0.7)' }}>{r}</Box>
                      ))}
                    </Box>
                    <Box sx={{ p: 0.75, borderRadius: 1, background: vc.bg, border: `1px solid ${vc.border}`, mb: 1 }}>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: vc.text }}>VERDICT: {loop.verdict}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.78rem', color: 'rgba(40,40,60,0.75)', mb: 0.5 }}><strong>What:</strong> {loop.whatIsIt}</Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: 'rgba(40,40,60,0.75)', mb: 0.5 }}><strong>When:</strong> {loop.whenToUse}</Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(40,40,60,0.55)', mb: 1 }}><strong>Freq:</strong> {loop.frequency} · <strong>Capital:</strong> {loop.capitalNeeded}</Typography>
                    <Box sx={{ p: 0.75, borderRadius: 1, background: 'rgba(2,6,23,0.03)', mb: 1, overflowX: 'auto' }}>
                      <code style={{ fontSize: '0.68rem', color: 'rgba(40,40,60,0.8)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{loop.formula}</code>
                    </Box>
                    <Collapse in={expandedLoop === loop.id}>
                      <Box sx={{ pt: 1, borderTop: '1px solid rgba(139,90,43,0.08)' }}>
                        <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#8B6914', mb: 0.25 }}>How to Execute</Typography>
                        <Typography sx={{ fontSize: '0.74rem', color: 'rgba(40,40,60,0.7)', mb: 1, lineHeight: 1.45 }}>{loop.howToUse}</Typography>
                        <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#8B6914', mb: 0.5 }}>Steps</Typography>
                        {loop.steps.map((s, j) => (
                          <Box key={j} sx={{ display: 'flex', gap: 0.5, mb: 0.25 }}>
                            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#CD7F32', minWidth: 16 }}>{j + 1}.</Typography>
                            <Typography sx={{ fontSize: '0.74rem', color: 'rgba(40,40,60,0.75)', lineHeight: 1.35 }}>{s}</Typography>
                          </Box>
                        ))}
                        <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#8B6914', mt: 1, mb: 0.25 }}>Profit Condition</Typography>
                        <Typography sx={{ fontSize: '0.74rem', color: 'rgba(40,40,60,0.7)', mb: 1 }}>{loop.profitCondition}</Typography>
                        <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#8B6914', mb: 0.25 }}>Risks</Typography>
                        <Typography sx={{ fontSize: '0.74rem', color: 'rgba(40,40,60,0.7)', mb: 1 }}>{loop.risks}</Typography>
                        <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#8B6914', mb: 0.25 }}>Prerequisites</Typography>
                        <Typography sx={{ fontSize: '0.74rem', color: 'rgba(40,40,60,0.7)', mb: 1 }}>{loop.prerequisites}</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {loop.tokens.map((t) => (
                            <Link key={t} href={`/token/${t.toLowerCase()}`} style={{ textDecoration: 'none' }}>
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

        {/* ══ MINT CLUB MECHANICS ══ */}
        <Box id="mintclub" sx={{ mb: 4, scrollMarginTop: 60 }}>
          <Typography variant="h5" sx={{ mb: 2, color: '#5B3A29', fontWeight: 'bold' }}>🏭 Mint Club Bonding Curve Mechanics</Typography>
          <Typography sx={{ fontSize: '0.8rem', color: 'rgba(40,40,60,0.5)', mb: 2 }}>Critical for understanding Mint Club bonding curve dynamics and why loop arbitrage is challenging but not impossible. SALT and NUTINO are Mint Club tokens backed by NUT.</Typography>
          <Grid container spacing={1.5}>
            {MINT_CLUB_FACTS.map((f, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,252,245,0.9)', border: '1px solid rgba(139,90,43,0.12)' }}>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#5B3A29', mb: 0.25 }}>{f.label}</Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: 'rgba(40,40,60,0.7)', lineHeight: 1.45 }}>{f.value}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ══ pNUT INDEX ══ */}
        <Box id="pnut" sx={{ mb: 4, scrollMarginTop: 60 }}>
          <Typography variant="h5" sx={{ mb: 2, color: '#5B3A29', fontWeight: 'bold' }}>🧺 pNUT Index Arbitrage</Typography>
          <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255,252,245,0.9)', border: '1px solid rgba(139,90,43,0.12)' }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#5B3A29', mb: 1 }}>Balancer V2 WeightedPool — 25% each: cbETH, cbBTC, NUT, SNUT</Typography>
            <Box sx={{ p: 1, borderRadius: 1, background: 'rgba(2,6,23,0.03)', mb: 1.5, overflowX: 'auto' }}>
              <pre style={{ fontSize: '0.72rem', lineHeight: 1.5, margin: 0, color: 'rgba(40,40,60,0.8)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{`pNUT address:  0x2a5757b60987ff10385de1d4d923792f6fdcfff1
Pool ID:        0x2a5757b60987ff10385de1d4d923792f6fdcfff100010000000000000000019e
Balancer URL:   https://balancer.fi/pools/base/v2/0x2a5757b60987ff10385de1d4d923792f6fdcfff100010000000000000000019e

NAV = (cbETH_balance × cbETH_price +
       cbBTC_balance × cbBTC_price +
       NUT_balance   × NUT_price   +
       SNUT_balance  × SNUT_price) / pNUT_totalSupply

Arbitrage:
  If market > NAV → Mint BPT (deposit basket), sell pNUT on DEX
  If market < NAV → Buy pNUT on DEX, redeem BPT (withdraw basket)

Volatility Play:
  NUT/SNUT move vs cbETH/cbBTC → basket weights drift → NAV diverges
  Track: NUT/ETH correlation, SNUT/NUT spread, component drift %`}</pre>
            </Box>
            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(40,40,60,0.65)', lineHeight: 1.45 }}>
              pNUT is NOT traded on standard DEXs. It is minted by depositing the basket into Balancer and redeemed by withdrawing. The "market price" is the BPT price on Balancer. NAV divergence {'>'} 2% indicates potential arbitrage. This is the most complex arb in the ecosystem — requires monitoring 4 component prices simultaneously.
            </Typography>
          </Box>
        </Box>

        {/* ══ VENUE INTEL ══ */}
        <Box id="venues" sx={{ mb: 4, scrollMarginTop: 60 }}>
          <Typography variant="h5" sx={{ mb: 2, color: '#5B3A29', fontWeight: 'bold' }}>🏠 Venue Intel & API Endpoints</Typography>
          <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(139,90,43,0.12)' }}>
            {VENUES.map((v, i) => (
              <Box key={v.name} sx={{
                p: 1.25, display: 'flex', alignItems: 'flex-start', gap: 1.5,
                background: i % 2 === 0 ? 'rgba(255,252,245,0.9)' : 'rgba(255,252,245,0.6)',
                borderBottom: i < VENUES.length - 1 ? '1px solid rgba(139,90,43,0.08)' : 'none',
              }}>
                <Box sx={{ minWidth: 120, flexShrink: 0 }}>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#5B3A29' }}>{v.name}</Typography>
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

          {/* Data Source Hierarchy */}
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#8B5A2B', mt: 2, mb: 1 }}>Data Source Hierarchy</Typography>
          <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(139,90,43,0.12)' }}>
            {DATA_SOURCES.map((d, i) => (
              <Box key={d.source} sx={{
                p: 1.25, display: 'flex', alignItems: 'flex-start', gap: 1.5,
                background: i % 2 === 0 ? 'rgba(255,252,245,0.9)' : 'rgba(255,252,245,0.6)',
                borderBottom: i < DATA_SOURCES.length - 1 ? '1px solid rgba(139,90,43,0.08)' : 'none',
              }}>
                <Box sx={{ minWidth: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #8B4513, #A0522D)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{d.priority}</Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#5B3A29' }}>{d.source}</Typography>
                  <Typography sx={{ fontSize: '0.76rem', color: 'rgba(40,40,60,0.65)', lineHeight: 1.4 }}>{d.use}</Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: 'rgba(40,40,60,0.4)' }}>Cost: {d.cost}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ══ NFT & SUDOSWAP ══ */}
        <Box id="nft" sx={{ mb: 4, scrollMarginTop: 60 }}>
          <Typography variant="h5" sx={{ mb: 2, color: '#5B3A29', fontWeight: 'bold' }}>🖼️ NFT Collections & Sudoswap Pools</Typography>
          <Grid container spacing={2}>
            {NFTS.map((nft) => (
              <Grid key={nft.name} size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,252,245,0.9)', border: '1px solid rgba(139,90,43,0.12)' }}>
                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#5B3A29', mb: 0.25 }}>{nft.emoji} {nft.name} — {nft.label}</Typography>
                  <Typography sx={{ fontSize: '0.76rem', color: 'rgba(40,40,60,0.65)', mb: 0.5 }}>Minted supply: {nft.supply}</Typography>
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: '#8B5A2B', mb: 0.25 }}>Contract:</Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: 'rgba(40,40,60,0.4)', fontFamily: 'monospace', mb: 0.5, wordBreak: 'break-all' }}>{nft.address}</Typography>
                  {nft.sudoswap ? (
                    <>
                      <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: '#8B5A2B', mb: 0.25 }}>Sudoswap Pool:</Typography>
                      <Typography sx={{ fontSize: '0.68rem', color: 'rgba(40,40,60,0.4)', fontFamily: 'monospace', wordBreak: 'break-all' }}>{nft.sudoswap}</Typography>
                    </>
                  ) : (
                    <Typography sx={{ fontSize: '0.68rem', color: 'rgba(40,40,60,0.35)' }}>No Sudoswap pool</Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ══ BOT COMMANDS ══ */}
        <Box id="commands" sx={{ mb: 4, scrollMarginTop: 60 }}>
          <Typography variant="h5" sx={{ mb: 1, color: '#5B3A29', fontWeight: 'bold' }}>🤖 Bot Commands — Direct Wiring Reference</Typography>
          <Typography sx={{ fontSize: '0.8rem', color: 'rgba(40,40,60,0.5)', mb: 2 }}>6 arb bot commands for scanning and monitoring the BASED NUT ecosystem. Each card shows trigger, arguments, implementation steps, and key data for direct bot wiring.</Typography>
          <Grid container spacing={2}>
            {COMMANDS.map((cmd) => (
              <Grid key={cmd.trigger} size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255,252,245,0.9)', border: '1px solid rgba(139,90,43,0.12)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography sx={{ fontSize: '1.1rem' }}>{cmd.emoji}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#5B3A29' }}>{cmd.name}</Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: 'rgba(40,40,60,0.5)' }}>{cmd.desc}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ p: 0.75, borderRadius: 1, background: 'rgba(2,6,23,0.04)', mb: 1 }}>
                    <code style={{ fontSize: '0.75rem', color: '#8B5A2B', fontWeight: 600 }}>{cmd.trigger} {cmd.args}</code>
                  </Box>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#8B5A2B', mb: 0.5 }}>Scan Types</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {cmd.scanTypes.map((s) => (
                      <Box key={s} sx={{ px: 0.75, py: 0.25, borderRadius: 1, background: 'rgba(139,90,43,0.08)', fontSize: '0.68rem', color: 'rgba(40,40,60,0.65)' }}>{s}</Box>
                    ))}
                  </Box>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#8B5A2B', mb: 0.5 }}>Implementation Steps</Typography>
                  <Box sx={{ mb: 1 }}>
                    {cmd.impl.map((step, i) => (
                      <Typography key={i} sx={{ fontSize: '0.72rem', color: 'rgba(40,40,60,0.65)', lineHeight: 1.5, pl: 1.5, position: 'relative' }}>
                        <Box component="span" sx={{ position: 'absolute', left: 0, color: '#8B5A2B', fontWeight: 700 }}>{i+1}.</Box> {step}
                      </Typography>
                    ))}
                  </Box>
                  <Box sx={{ p: 1, borderRadius: 1, background: 'rgba(2,6,23,0.03)', mb: 1 }}>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#8B5A2B', mb: 0.25 }}>Key Data</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: 'rgba(40,40,60,0.6)', lineHeight: 1.45 }}>{cmd.keyData}</Typography>
                  </Box>
                  <Box sx={{ p: 0.75, borderRadius: 1, background: cmd.verdict.startsWith('MOST') || cmd.verdict.startsWith('ESSENTIAL') || cmd.verdict.startsWith('OVERVIEW') ? 'rgba(34,197,94,0.06)' : cmd.verdict.startsWith('SPECIALIZED') || cmd.verdict.startsWith('STRUCTURAL') || cmd.verdict.startsWith('OPPORTUNISTIC') ? 'rgba(234,179,8,0.06)' : 'rgba(100,116,139,0.06)' }}>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#8B5A2B' }}>Verdict</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: 'rgba(40,40,60,0.65)', lineHeight: 1.4 }}>{cmd.verdict}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ══ MACHINE SPEC ══ */}
        <Box id="spec" sx={{ mb: 4, scrollMarginTop: 60 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" sx={{ color: '#5B3A29', fontWeight: 'bold' }}>⚙️ Machine-Readable Spec</Typography>
            <Box onClick={copySpec} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: 1, background: 'rgba(139,90,43,0.08)', border: '1px solid rgba(139,90,43,0.15)', '&:hover': { background: 'rgba(139,90,43,0.12)' } }}>
              <ContentCopy sx={{ fontSize: '0.9rem', color: '#8B5A2B' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#8B5A2B' }}>{specCopied ? 'Copied!' : 'Copy JSON'}</Typography>
            </Box>
          </Box>
          <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(2,6,23,0.03)', border: '1px solid rgba(2,6,23,0.08)', overflowX: 'auto' }}>
            <pre style={{ fontSize: '0.7rem', lineHeight: 1.5, margin: 0, color: 'rgba(40,40,60,0.8)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(MACHINE_SPEC, null, 2)}</pre>
          </Box>
        </Box>

        {/* ══ GETTING STARTED ══ */}
        <Box id="start" sx={{ mb: 4, scrollMarginTop: 60 }}>
          <Typography variant="h5" sx={{ mb: 2, color: '#5B3A29', fontWeight: 'bold' }}>🚀 Getting Started</Typography>
          <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255,252,245,0.9)', border: '1px solid rgba(139,90,43,0.12)' }}>
            {[
              { title: 'Install dependencies', code: 'pip install requests' },
              { title: 'Connect to Base RPC', code: 'https://mainnet.base.org (chainId: 8453)' },
              { title: 'Copy the Base RPC Helper from RPC Code section above', code: null },
              { title: 'Fetch NUT price from UniV3 slot0() — remember to check token0 for inversion', code: null },
              { title: 'Fetch all pool reserves via getReserves() — verify token0/token1 ordering', code: null },
              { title: 'Normalize all prices to USD using CoinGecko (ETH, BTC, cbETH only)', code: null },
              { title: 'Calculate spreads across venues — flag when spread > 0.5%', code: null },
              { title: 'For Mint Club prices, use browser automation or V2 SDK — RPC is unreliable', code: 'npm i mint.club-v2-sdk' },
              { title: 'For pNUT NAV, use getPoolTokens(poolId) or balanceOf(BALANCER_VAULT) — NOT balanceOf(pNUT contract) which returns ALL ZEROS', code: null },
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
