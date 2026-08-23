# MintClub NFT Bonding Curve Research — Base Chain

> Research date: 2026-07-06
> Target tokens: PNUTS, ALMD, SALMD, PNUTRMY (all ERC-1155 on Base, chainId 8453)

---

## 1. Working API Endpoints

**IMPORTANT**: The `api.mint.club` subdomain may be unreachable from some network environments. MintClub's internal API lives at `mint.club/api/` (same domain as the main site) and is fully accessible.

### Confirmed Working Endpoints

| Endpoint | Description | Example |
|---|---|---|
| `GET /api/tokens/bySymbol/{type}/{chainId}/{symbol}` | Token info by symbol | `/api/tokens/bySymbol/ERC1155/8453/PNUTS` |
| `GET /api/tokens/byAddress/{chainId}/{address}` | Token info by contract address | `/api/tokens/byAddress/8453/0x794f...5EE387` |
| `GET /api/metadata?tokenAddress={addr}&chainId={id}` | Token metadata (logo, website, etc.) | `/api/metadata?tokenAddress=0x794f...&chainId=8453` |
| `GET /api/distribution/nft/{chainId}/{symbol}` | NFT distribution data | `/api/distribution/nft/8453/PNUTS` |
| `GET /api/tokens/list?chainId={id}&page=0&itemsPerPage=5&orderBy=reserveBalance&orderByDirection=desc` | Token list with pagination | See URL |
| `GET /api/tokens/list?chainId={id}&reserveToken={addr}&...` | Tokens filtered by reserve token | `/api/tokens/list?chainId=8453&reserveToken=0xb8DE...` |
| `GET /api/version` | API version info | Returns `{"version":"2.957.6885"}` |

### Base URL
```
https://mint.club/api/
```

### Sample API Responses

**byAddress (PNUTS)**:
```json
{
  "token": {
    "createdAt": "2024-11-07T19:04:31.308Z",
    "chainId": 8453,
    "name": "BASED PEANUT WAR GENERALS",
    "symbol": "PNUTS",
    "tokenAddress": "0x794fcD89357C1CcF04a1a9A441ad4dB2Cd5EE387",
    "tokenType": "V2_ERC1155",
    "isDelisted": false
  },
  "isBondedToken": true,
  "isReserveToken": false
}
```

**metadata (PNUTS)**:
```json
{
  "logo": null,
  "backgroundImage": "https://mint-club-v2.s3.us-west-2.amazonaws.com/8453/0x794f.../background-image.png",
  "website": "https://basednut.com",
  "creatorComment": "The BASED PEANUT WAR GENERALS. GET READY FOR THE NUT WAR!"
}
```

### API Limitations

The `mint.club/api/` endpoints return **basic token metadata only** (name, symbol, type, creation date, delisted status). They do **NOT** return price, supply, volume, or bonding curve data. The frontend fetches that data via **direct on-chain RPC calls** (see Section 3 below).

### Additional Frontend Network Calls

The MintClub frontend also calls these external APIs:
- `https://coins.llama.fi/block/base/{timestamp}` — DeFiLlama block data
- `https://coins.llama.fi/percentage/base:{tokenAddress}` — DeFiLlama token price percentage
- `https://base-rpc.publicnode.com/` — Base RPC (primary RPC used by frontend)
- `https://fc.hunt.town/tokens/logo/{chainId}/{address}/image` — Token logos

---

## 2. Contract Addresses (Base Chain)

All MintClub V2 contracts share the **same address across all supported chains** (Ethereum, Base, BNB Chain, Polygon, Arbitrum, Optimism).

| Contract | Address | Purpose |
|---|---|---|
| **MCV2_Bond** | `0xc5a076cad94176c2996B32d8466Be1cE757FAa27` | Bonding curve logic (buy/sell/price/supply) |
| **MCV2_MultiToken** | `0x6c61918eECcC306D35247338FDcf025af0f6120A` | ERC-1155 NFT implementation (proxy clone source) |
| MCV2_Token | `0xAa70bC79fD1cB4a6FBA717018351F0C3c64B79Df` | ERC-20 token implementation |
| MCV2_ZapV1 | `0x91523b39813F3F4E406ECe406D0bEAaA9dE251fa` | Zap (swap + bond in single tx) |
| Locker | `0xA3dCf3Ca587D9929d540868c924f208726DC9aB6` | Lock-up schedules |
| MerkleDistributor | `0x1349A9DdEe26Fe16D0D44E35B3CB9B0CA18213a4` | Airdrop distribution |

### Reserve Token (NUT on Base)
```
NUT: 0xb8DE15Fb529d98C93C749De63c749D48D25A30DF
```
All 4 NFT tokens use NUT as their bonding curve reserve/collateral token.

### Individual NFT Token Addresses

| Symbol | Name | Address | Created |
|---|---|---|---|
| PNUTS | BASED PEANUT WAR GENERALS | `0x794fcD89357C1CcF04a1a9A441ad4dB2Cd5EE387` | 2024-11-07 |
| ALMD | BASED ALMOND WAR GENERALS | `0x1A160456005AED47994E1c13C9bc31F274413927` | 2024-11-07 |
| SALMD | BASED ALMOND WAR SOLDIERS | `0x1E0f80529593185C021043ffcbfDcB8f4279C649` | 2024-11-07 |
| PNUTRMY | BASED PEANUT WAR SOLDIERS | `0xF075300b8C2EF500d8Ce4f783F910C500B9A3512` | 2025-01-26 |

---

## 3. ABI Read Function Signatures (MCV2_Bond)

Source: [GitHub — Steemhunt/mint.club-v2-contract](https://github.com/Steemhunt/mint.club-v2-contract/blob/main/contracts/MCV2_Bond.sol)

### Key Read Functions for Price/Supply/Volume Data

```solidity
// Get full bond detail (BEST single call — returns everything)
function getDetail(address token) external view returns (BondDetail memory detail)

// Get current price for next mint
function priceForNextMint(address token) public view returns (uint128)

// Get maximum supply
function maxSupply(address token) public view returns (uint128)

// Get bonding curve steps array
function getSteps(address token) external view returns (BondStep[] memory)

// Check if token exists in bond
function exists(address token) public view returns (bool)

// Get total token count on platform
function tokenCount() external view returns (uint256)

// Get raw bond struct (reserveBalance, royalties, etc.)
function tokenBond(address token) public view returns (
    address creator,
    uint16 mintRoyalty,
    uint16 burnRoyalty,
    uint40 createdAt,
    address reserveToken,
    uint256 reserveBalance
)

// Get reserve required to mint N tokens
function getReserveForToken(address token, uint256 tokensToMint) public view returns (uint256)

// Get refund for burning N tokens
function getRefundForTokens(address token, uint256 tokensToBurn) public view returns (uint256)

// Get list of bond info for range of tokens
function getList(uint256 start, uint256 stop) external view returns (BondInfo[] memory)

// Get tokens filtered by reserve token
function getTokensByReserveToken(address reserveToken, uint256 start, uint256 stop) external view returns (address[] memory)

// Contract version
function version() external pure returns (string memory)
```

### Return Struct Definitions

```solidity
struct BondStep {
    uint128 rangeTo;   // supply level at which this step ends
    uint128 price;     // price per token in this step (x 10^18)
}

struct BondInfo {
    address creator;
    address token;
    uint8 decimals;
    string symbol;
    string name;
    uint40 createdAt;
    uint128 currentSupply;
    uint128 maxSupply;
    uint128 priceForNextMint;
    address reserveToken;
    uint8 reserveDecimals;
    string reserveSymbol;
    string reserveName;
    uint256 reserveBalance;
}

struct BondDetail {
    uint16 mintRoyalty;    // in basis points (100 = 1%)
    uint16 burnRoyalty;    // in basis points (100 = 1%)
    BondInfo info;
    BondStep[] steps;
}
```

### MCV2_MultiToken (ERC-1155) Read Functions

```solidity
function name() public view returns (string memory)
function symbol() public view returns (string memory)
function totalSupply() public view returns (uint256)
function decimals() public pure returns (uint8)  // always 18
function contractURI() external view returns (string memory)
function balanceOf(address account, uint256 id) public view returns (uint256)
```

---

## 4. npm SDK Package

### Package Info

- **Package name**: `mint.club-v2-sdk`
- **Version**: `1.5.6`
- **License**: MIT
- **Dependencies**: `abitype`, `cross-fetch`, `dotenv`, `jsdom`, `lodash`, `merkletreejs`, `viem`
- **GitHub**: https://github.com/Steemhunt/mint.club-v2-sdk
- **SDK Docs**: https://sdk.mint.club
- **npm**: https://www.npmjs.com/package/mint.club-v2-sdk

### Install
```bash
npm install mint.club-v2-sdk
```

### Usage Examples

```typescript
import { mintclub } from 'mint.club-v2-sdk';

// Read token details (bonding curve data)
const detail = await mintclub.network('base').token('PNUTS').getDetail();
console.log(detail.priceForNextMint, detail.info.currentSupply);

// Read USD price (with 1inch / DEX fallback)
const usd = await mintclub.network('base').token('NUT').getUsdRate();

// Buy on bonding curve (browser / wagmi)
await mintclub
  .network('base')
  .token('PNUTS')
  .buy({
    amount: 100n,
    slippage: 1,
    onSuccess: (tx) => console.log(tx),
    onError: (e) => console.error(e),
  });

// Sell (burn) on bonding curve
await mintclub
  .network('base')
  .token('PNUTS')
  .sell({
    amount: 50n,
    slippage: 1,
  });

// Server-side with private key
await mintclub
  .withPrivateKey(process.env.PRIVATE_KEY as `0x${string}`)
  .network('base')
  .token('PNUTS')
  .buy({ amount: 100n, slippage: 1 });

// Create a new token
await mintclub.network('base').token('MYTOKEN').create({
  name: 'My Token',
  reserveToken: { address: '0x...', decimals: 18 },
  curveData: {
    curveType: 'EXPONENTIAL',
    stepCount: 100,
    maxSupply: 1_000_000,
    initialMintingPrice: 0.0001,
    finalMintingPrice: 0.1,
  },
});
```

### SDK Features
- Bond contract: Buy, sell, create, read token state
- Airdrops: Merkle-tree airdrops with IPFS
- Stake and lock: Stake pools and lockups
- Zap: Swap + bond in single transaction
- Uniswap routing: V3/V4 swap helpers
- USD pricing: 1inch spot, DefiLlama, 0x fallbacks
- IPFS: Upload metadata via Filebase
- Metadata: Token metadata create/update/read

### Supported Networks
Ethereum, Base, BNB Chain, Polygon, Arbitrum, Optimism, Avalanche, Kaia, Cyber, Degen, Ham, Shibarium, Unichain, Zora, HashKey, Ape Chain, Over (+ testnets)

---

## 5. On-Chain Data (Live RPC Reads)

### Method
- **RPC**: `https://mainnet.base.org` (or `https://base-rpc.publicnode.com` as fallback)
- **Contract**: MCV2_Bond at `0xc5a076cad94176c2996B32d8466Be1cE757FAa27`
- **Call**: `getDetail(address)` for each token
- **Bond version**: `0.1.120`
- **Total platform tokens**: 26,145

### Summary Table

| Token | Current Supply | Max Supply | Price (NUT) | Reserve Balance (NUT) | Mint Royalty | Burn Royalty | Steps |
|---|---|---|---|---|---|---|---|
| PNUTS | 251 | 1,000 | 0.000260 | 0.032760 | 1% | 1% | 100 |
| ALMD | 424 | 1,000 | 0.000071 | 0.012998 | 1% | 1% | 100 |
| SALMD | 6,238 | 10,000 | 0.000008 | 0.010617 | 1% | 1% | 100 |
| PNUTRMY | 5,013 | 10,000 | 0.000005 | 0.012477 | 1% | 1% | 100 |

All prices are per-token in NUT (reserve token, 18 decimals). Price = `rawValue / 10^18`.

### PNUTS Detailed Data (Sample)

```
Name:           BASED PEANUT WAR GENERALS
Symbol:         PNUTS
Address:        0x794fcD89357C1CcF04a1a9A441ad4dB2Cd5EE387
Decimals:       18
Creator:        (on-chain)
CreatedAt:      1731006271 (Unix timestamp)
CurrentSupply:  251
MaxSupply:      1,000
PriceForNextMint: 0.000260 NUT (260000000000000 raw)
ReserveToken:  0xb8DE15Fb529d98C93C749De63c749D48D25A30DF (NUT)
ReserveBalance: 0.032760 NUT (32760000000000 raw)
MintRoyalty:   1% (100 basis points)
BurnRoyalty:   1% (100 basis points)
Steps:         100 total (linear curve)
```

**Bonding Curve Steps (first 5 + last):**
```
Step  0: rangeTo=10,    price=0.000010 NUT
Step  1: rangeTo=20,    price=0.000020 NUT
Step  2: rangeTo=30,    price=0.000030 NUT
Step  3: rangeTo=40,    price=0.000040 NUT
Step  4: rangeTo=50,    price=0.000050 NUT
...
Step 99: rangeTo=1000,  price=0.001000 NUT
```

### Frontend Visible Stats (PNUTS page)

From `mint.club/nft/base/PNUTS` DOM:
```
Current minted NFTs / Max supply: 251 / 1,000
Total locked parent token: 0.033 NUT ($716.05)
Market cap: $1,426.42
Trade Royalties: Buy 1% / Sell 1%
Bonding curve progress: 25.1% (25 out of 100 steps)
Current price: 0.0326 NUT ($5.683)
```

### Raw JSON Data

Full on-chain data saved to: `liquidity/mintclub_onchain_data.json`

---

## 6. Web3.py Read Example (Python)

```python
import json
from web3 import Web3

w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))
BOND_ADDR = Web3.to_checksum_address('0xc5a076cad94176c2996B32d8466Be1cE757FAa27')

BOND_ABI = json.loads(r'''
[
  {
    "inputs": [{"name": "token", "type": "address"}],
    "name": "getDetail",
    "outputs": [{"name": "detail", "type": "tuple", "components": [
      {"name": "mintRoyalty", "type": "uint16"},
      {"name": "burnRoyalty", "type": "uint16"},
      {"name": "info", "type": "tuple", "components": [
        {"name": "creator", "type": "address"},
        {"name": "token", "type": "address"},
        {"name": "decimals", "type": "uint8"},
        {"name": "symbol", "type": "string"},
        {"name": "name", "type": "string"},
        {"name": "createdAt", "type": "uint40"},
        {"name": "currentSupply", "type": "uint128"},
        {"name": "maxSupply", "type": "uint128"},
        {"name": "priceForNextMint", "type": "uint128"},
        {"name": "reserveToken", "type": "address"},
        {"name": "reserveDecimals", "type": "uint8"},
        {"name": "reserveSymbol", "type": "string"},
        {"name": "reserveName", "type": "string"},
        {"name": "reserveBalance", "type": "uint256"}
      ]},
      {"name": "steps", "type": "tuple[]", "components": [
        {"name": "rangeTo", "type": "uint128"},
        {"name": "price", "type": "uint128"}
      ]}
    ]}],
    "stateMutability": "view",
    "type": "function"
  }
]
''')

bond = w3.eth.contract(address=BOND_ADDR, abi=BOND_ABI)

token_addr = Web3.to_checksum_address('0x794fcD89357C1CcF04a1a9A441ad4dB2Cd5EE387')
detail = bond.functions.getDetail(token_addr).call()

mint_royalty, burn_royalty, info, steps = detail
creator, token, decimals, sym, name, created_at, current_supply, max_supply, \
    next_price, reserve_token, reserve_decimals, reserve_symbol, \
    reserve_name, reserve_balance = info

print(f'{sym}: {current_supply}/{max_supply}, price={next_price/1e18} {reserve_symbol}')
print(f'Reserve: {reserve_balance/10**reserve_decimals} {reserve_symbol}')
print(f'Royalties: mint={mint_royalty/100}%, burn={burn_royalty/100}%')
print(f'Steps: {len(steps)}')
```

---

## 7. Key Findings Summary

### How to Get Bonding Curve Data

1. **Best method — On-chain RPC read**: Call `getDetail(address)` on MCV2_Bond (`0xc5a076cad94176c2996B32d8466Be1cE757FAa27`) via any Base RPC. Returns complete bonding curve data: currentSupply, maxSupply, priceForNextMint, reserveBalance, steps array, royalties.

2. **REST API**: `https://mint.club/api/tokens/byAddress/8453/{address}` returns basic token info only (name, symbol, type, dates). Does NOT include price/supply/bonding curve data.

3. **npm SDK**: `mint.club-v2-sdk` (v1.5.6) provides `mintclub.network('base').token('PNUTS').getDetail()` which wraps the on-chain call.

4. **DeFiLlama**: Frontend uses `coins.llama.fi/percentage/base:{tokenAddress}` for USD price data.

### Rate Limiting Notes
- `https://mainnet.base.org` has aggressive rate limits (429 errors). Use `https://base-rpc.publicnode.com` as fallback.
- The MintClub frontend rotates through ~15 different Base RPC providers.

### Bonding Curve Model
- Step-based pricing: supply is divided into N steps (100 for all 4 tokens)
- Each step has a `rangeTo` (supply threshold) and `price` (per-token price in reserve token)
- Price increases linearly or exponentially across steps
- PNUTS: linear 0.00001 → 0.001 NUT across 1000 supply (10 per step)
- SALMD/PNUTRMY: start at near-zero, end at 0.0001/0.00001 NUT across 10,000 supply
- Royalties: 1% mint, 1% burn on all tokens
