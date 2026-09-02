/* Orchard Atlas dataset — Base mainnet (chain 8453)
 * Single source of truth for both surfaces (index.html concept / data.html instrument).
 * Sources:
 *   - agent-core/config.py — canonical token & pool addresses (config is canonical, per AGENTS.md)
 *   - nut_cache.db · pool_market_producer snapshot (multi-source reconciled TVL)
 *   - Base RPC verification 2026-08-27 (token0/token1/symbol/decimals via publicnode)
 *   - Balancer v3 pool verification 2026-08-27 (weights, seeding)
 * Adapter pattern: swap this file for a live endpoint later. Static snapshot, honestly labeled.
 */
const ORCHARD = {
  meta: {
    chain: "Base",
    chainId: 8453,
    snapshot: "2026-09-01",
    sources: [
      "config.py (canonical addresses)",
      "nut_cache.db — pool_market_producer",
      "Base RPC (verified 2026-08-27)",
      "Balancer v3 pool state (verified 2026-08-27)",
      "gtSIL B20 scions + pool state (verified 2026-09-01)"
    ],
    note: "Static snapshot. No live feed is claimed. Adapter-ready: replace this file with an endpoint."
  },

  tokens: {
    NUT:     { addr: "0xb8de15fb529d98c93c749de63c749d48d25a30df", decimals: 18, kind: "core",       label: "Root Asset" },
    WNUT:    { addr: "0xBA5ED46e31F80dafF307cbf60bd422a6f62E3dd3", decimals: 18, kind: "core",       label: "Rootstock" },
    SNUT:    { addr: "0xAC130701aa31c284c36609E2489f150F419AD7AD", decimals: 9,  kind: "family",     label: "Staked NUT" },
    NUTINO:  { addr: "0x30421e2d18dFF60B298eEF427cF868cA65f1476B", decimals: 18, kind: "family",     label: "Nested NUT" },
    SALT:    { addr: "0x1EDe2AFC985F6D7aEb3F4c84B95A103c00D5dE81", decimals: 18, kind: "family",     label: "Seasoning token" },
    WETH:    { addr: "0x4200000000000000000000000000000000000006", decimals: 18, kind: "reserve",    label: "Wrapped Ether" },
    CBBTC:   { addr: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf", decimals: 8,  kind: "reserve",    label: "Coinbase BTC" },
    CBETH:   { addr: "0x2Ae3F1Ec7F1f5012CFEab0185bFc7Aa3cf0DEc22", decimals: 18, kind: "reserve",    label: "Coinbase ETH" },
    WSTETH:  { addr: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452", decimals: 18, kind: "reserve",    label: "Lido staked ETH" },
    TBTC:    { addr: "0x236aa50979D5f3De3Bd1Eeb40E81137F22ab794b", decimals: 18, kind: "reserve",    label: "Threshold tBTC" },
    USDC:    { addr: "0x833589fCD6eDb6E08f4c7C32D4F71b54bdA02913", decimals: 6,  kind: "settlement", label: "USD Coin" },
    EURC:    { addr: "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42", decimals: 6,  kind: "settlement", label: "Circle EURC" },
    PIPS:    { addr: "0x3f2327221dd4f0bae660172606d6b288a1cf8ad9", decimals: 18, kind: "compute",    label: "Pipshell by Virtuals" },
    VVV:     { addr: "0xacfE6019Ed1A7Dc6f7B508C02d1b04ec88cC21bf", decimals: 18, kind: "compute",    label: "Venice Token" },
    DIEM:    { addr: "0xF4d97F2da56e8c3098f3a8D538DB630A2606a024", decimals: 18, kind: "compute",    label: "Diem (Venice compute)" },
    VIRTUAL: { addr: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b", decimals: 18, kind: "compute",    label: "Virtuals Protocol" },
    MOR:     { addr: "0x7431aDa8a591C955a994a21710752EF9b882b8e3", decimals: 18, kind: "compute",    label: "Morpheus AI" },
    NVDAC:   { addr: "0xb20000000000000000000078ee7ce2fE4908108C", decimals: 8,  kind: "rwa",        label: "NVIDIA tokenized stock (Coinbase B20)" },
    AAPLC:   { addr: "0xb200000000000000000000C2e324d24d7eEcd1fb", decimals: 8,  kind: "rwa",        label: "Apple tokenized stock (Coinbase B20)" },
    AERO:    { addr: "0x940181a94A35A4569E4529A3CDfB74e38FD98631", decimals: 18, kind: "infra",      label: "Aerodrome" },
    SNUTLP:  { addr: "0x82bbadb9d6b2c0a59ed01809e30323f89f6faa1c", decimals: 18, kind: "meta",       label: "SNUT/WETH LP token" }
  },

  structures: [
    /* ── Branches (2-token edges) ── */
    { id: "nut-weth-v3",  type: "branch", assets: ["NUT","WETH"],   name: "NUT/WETH",   venue: "Uniswap V3",        mechanism: "concentrated",   feeBps: 100, tvl: 9061, address: "0xe3ce00e2ed742b142c15eedc208657dd22aa987e", status: "live", groves: ["reserve","heirloom"] },
    { id: "nut-weth-v2",  type: "branch", assets: ["NUT","WETH"],   name: "NUT/WETH",   venue: "Uniswap V2",        mechanism: "constant-product", feeBps: 30, tvl: 90,   address: "0x997bad8e9f5c34d5e9784caaa8a554a5e6192f53", status: "live", groves: ["reserve","heirloom"] },
    { id: "nut-weth-cl",  type: "branch", assets: ["NUT","WETH"],   name: "NUT/WETH",   venue: "Custom CL",         mechanism: "concentrated",   feeBps: 100, tvl: 1877, address: "0x0416a0d0ce17f23daa9d3f852470fe91f0a69c71", status: "live", groves: ["reserve","heirloom"] },
    { id: "nut-aero",     type: "branch", assets: ["NUT","AERO"],   name: "NUT/AERO",   venue: "Aerodrome",        mechanism: "vAMM",           feeBps: 30, tvl: 481,  address: "0x38630fede5e2032652640d98b2d3f9c6296eea5d", status: "live", groves: ["infra","heirloom"] },
    { id: "nut-cbbtc",    type: "branch", assets: ["NUT","CBBTC"],  name: "NUT/cbBTC",  venue: "Aerodrome",        mechanism: "vAMM",           feeBps: 30, tvl: 174,  address: "0x15385c9281bc12d2e9bf5c081621944b0ee2acca", status: "live", groves: ["reserve","heirloom"] },
    { id: "nut-cbeth",    type: "branch", assets: ["NUT","CBETH"],  name: "NUT/cbETH",  venue: "Aerodrome",        mechanism: "vAMM",           feeBps: 30, tvl: 120,  address: "0xbab487d81758cef736e876b24774dccbd1b32707", status: "live", groves: ["reserve","heirloom"] },
    { id: "snut-nut",     type: "branch", assets: ["SNUT","NUT"],   name: "SNUT/NUT",   venue: "Aerodrome",        mechanism: "vAMM",           feeBps: 30, tvl: 1091, address: "0x893faaa7baf7a8247fc7142afb28e13d51a5aae8", status: "live", groves: ["heirloom","nut-lineage"] },
    { id: "snut-weth",    type: "branch", assets: ["SNUT","WETH"],  name: "SNUT/WETH",  venue: "Uniswap V2",        mechanism: "constant-product", feeBps: 30, tvl: 1118, address: "0xb22895d2ee6e29395f30ec47c8d9fe0d55355ae1", status: "live", groves: ["heirloom","nut-lineage"] },
    { id: "snutlp-weth",  type: "branch", assets: ["SNUTLP","WETH"], name: "SNUT-LP/WETH", venue: "Uniswap V2",      mechanism: "constant-product", feeBps: 30, tvl: 89,   address: "0x82bbadb9d6b2c0a59ed01809e30323f89f6faa1c", status: "live", groves: ["heirloom","nut-lineage","nested"] },
    { id: "nutino-cbbtc", type: "branch", assets: ["NUTINO","CBBTC"], name: "NUTINO/cbBTC", venue: "Uniswap V2",    mechanism: "constant-product", feeBps: 30, tvl: 1451, address: "0xeafde67d470480d14139e3d91164c158b82b38e2", status: "live", groves: ["heirloom","nut-lineage"] },
    { id: "salt-usdc",    type: "branch", assets: ["SALT","USDC"],  name: "SALT/USDC",  venue: "Aerodrome",        mechanism: "vAMM",           feeBps: 30, tvl: 349,  address: "0x64ca0b147f625007b6f082abbb3ba217930eccb2", status: "live", groves: ["settlement","polyforest"] },
    { id: "pips-nut",     type: "branch", assets: ["PIPS","NUT"],   name: "PIPS/NUT",   venue: "Aerodrome Slipstream", mechanism: "concentrated", feeBps: 100, tvl: 571,  address: "0x7f8e532cf1be9ed688adb9e6585bc69f017201b5", status: "live", groves: ["compute","polyforest"] },
    { id: "nut-salt-rc",  type: "branch", assets: ["NUT","SALT"],   name: "NUT/SALT reCLAMM", venue: "Balancer v3",  mechanism: "reclamm",        feeBps: 30, tvl: 5,    address: "0x4f924d20773D21a80E58ba929613BeB74f51BeD6", status: "live", groves: ["heirloom","nut-lineage"] },
    { id: "pips-usdc-rc", type: "branch", assets: ["PIPS","USDC"],  name: "PIPS/USDC reCLAMM", venue: "Balancer v3", mechanism: "reclamm",      feeBps: 100, tvl: 96,   address: "0xb19e3af68BB307369e8772A9E157431FcFE9Dd44", status: "live", groves: ["compute","settlement","polyforest"] },
    { id: "wrapper",      type: "wrapper", assets: ["NUT","WNUT"],  name: "NUT ↔ wNUT wrapper", venue: "wNUT wrapper", mechanism: "wrapper", feeBps: null, tvl: null, address: "0xBA5ED46e31F80dafF307cbf60bd422a6f62E3dd3", status: "live", groves: ["infra","polyforest"] },

    /* ── Grafts (rooted ternary hyperedges: wNUT + Scion A + Scion B) ── */
    { id: "gt-inf", type: "graft", assets: ["WNUT","VVV","DIEM"],        weights: [20,40,40], name: "gtINF Inference Twin Graft", venue: "Balancer v3", mechanism: "weighted", feeBps: null, tvl: 2.50, address: "0x6a0a1B7428d543524592eD22023A09BdE05aA466", status: "live", groves: ["sunflower","compute"] },
    { id: "gt-agt", type: "graft", assets: ["WNUT","VIRTUAL","MOR"],    weights: [20,40,40], name: "gtAGT Agent Twin Graft",      venue: "Balancer v3", mechanism: "weighted", feeBps: null, tvl: 2.47, address: "0x5dA95cC31C840Fd33180e4C7f879e3F3d8Eca200", status: "live", groves: ["sunflower","compute"] },
    { id: "gt-eth", type: "graft", assets: ["WNUT","CBETH","WSTETH"],   weights: [20,40,40], name: "gtETH Ether Twin Graft",      venue: "Balancer v3", mechanism: "weighted", feeBps: null, tvl: 2.49, address: "0xd156d51219B3a7A590670d655E8740Ad404e8835", status: "live", groves: ["sunflower","reserve","infra"] },
    { id: "gt-btc", type: "graft", assets: ["WNUT","CBBTC","TBTC"],     weights: [20,40,40], name: "gtBTC Bitcoin Twin Graft",    venue: "Balancer v3", mechanism: "weighted", feeBps: null, tvl: 2.49, address: "0xb2a63935e1391Ee49E5cfB6cc4f184C285fE29b4", status: "live", groves: ["sunflower","reserve","infra"] },
    { id: "gt-fx",  type: "graft", assets: ["WNUT","USDC","EURC"],      weights: [20,40,40], name: "gtFX FX Twin Graft",          venue: "Balancer v3", mechanism: "weighted", feeBps: null, tvl: 2.50, address: "0x1cCB8c61b62b9c7a9d4e66C9c824C1539B8b1f2E", status: "live", groves: ["sunflower","settlement","infra"] },
    { id: "gt-sil", type: "graft", assets: ["WNUT","NVDAC","AAPLC"],   weights: [20,40,40], name: "gtSIL Silicon Twin Graft",   venue: "Balancer v3", mechanism: "weighted", feeBps: null, tvl: null, address: "0xA669275f92e49aff80aBA7AaD86E5AFDDe3540B0", status: "live", groves: ["sunflower","rwa"] },

    /* ── Whorls (unrooted multi-asset hyperedges, n>=3) ── */
    { id: "pnut", type: "whorl", assets: ["NUT","SNUT","CBETH","CBBTC"], weights: [25,25,25,25], name: "pNUT (heirloom Whorl)", venue: "Balancer V2", mechanism: "weighted", feeBps: 100, tvl: 4180, address: "0x2a5757b60987ff10385de1d4d923792f6fdcfff1", status: "live", groves: ["heirloom","reserve","nut-lineage"] },

    /* ── Bonding-curve structures (Mint Club) ── */
    { id: "salt-curve",   type: "curve", assets: ["SALT","NUT"],   name: "SALT bonding curve",   venue: "Mint Club", mechanism: "bonding-curve", curve: "flat",        feeBps: null, tvl: null, address: "0xc5A076CAD94176C2996B32d8466bE1cE757fAA27", bondToken: "0x1EDe2AFC985F6D7aEb3F4c84B95A103c00D5dE81", status: "live", groves: ["heirloom","nut-lineage","polyforest"] },
    { id: "nutino-curve", type: "curve", assets: ["NUTINO","NUT"], name: "NUTINO bonding curve", venue: "Mint Club", mechanism: "bonding-curve", curve: "exponential", feeBps: null, tvl: null, address: "0xc5A076CAD94176C2996B32d8466bE1cE757fAA27", bondToken: "0x30421e2d18dFF60B298eEF427cF868cA65f1476B", status: "live", groves: ["heirloom","nut-lineage"] },

    /* ── Exited / dormant (Heritage registry — kept for lineage, not drawn) ── */
    { id: "x-pnuts-sudo",  type: "branch", assets: ["PNUTS","USDC"],  name: "PNUTS/USDC",  venue: "Sudoswap", mechanism: "nft-amm", feeBps: null, tvl: 0, address: "0x262beaa785a0ef65f5d9c1b8ba5c41980d087ff3", status: "exited", groves: ["heirloom"] },
    { id: "x-almd-sudo",   type: "branch", assets: ["ALMD","CBETH"],  name: "ALMD/cbETH",  venue: "Sudoswap", mechanism: "nft-amm", feeBps: null, tvl: 0, address: "0x308c9bc0546723d6e4905c971cd34febf1f94031", status: "exited", groves: ["heirloom"] },
    { id: "x-salmd-sudo",  type: "branch", assets: ["SALMD","CBETH"], name: "SALMD/cbETH", venue: "Sudoswap", mechanism: "nft-amm", feeBps: null, tvl: 0, address: "0xee7243f0e02e5890c6415b5cbae58e0d0fb758a5", status: "exited", groves: ["heirloom"] },
    { id: "x-spnut-sudo",  type: "branch", assets: ["SPNUT","USDC"], name: "SPNUT/USDC",  venue: "Sudoswap", mechanism: "nft-amm", feeBps: null, tvl: 0, address: "0x04dbbc85e27df12970dd62973e83a01fcd6aa8fd", status: "exited", groves: ["heirloom"] },
    { id: "x-pnuts-curve",  type: "curve", assets: ["PNUTS","NUT"],  name: "PNUTS curve",  venue: "Mint Club", mechanism: "bonding-curve", curve: "flat", feeBps: null, tvl: 0, address: "0xc5A076CAD94176C2996B32d8466bE1cE757fAA27", bondToken: "0x794fcD89357C1CcF04a1a9A441ad4dB2Cd5EE387", status: "exited", groves: ["heirloom"] },
    { id: "x-almd-curve",   type: "curve", assets: ["ALMD","NUT"],   name: "ALMD curve",   venue: "Mint Club", mechanism: "bonding-curve", curve: "flat", feeBps: null, tvl: 0, address: "0xc5A076CAD94176C2996B32d8466bE1cE757fAA27", bondToken: "0x1A160456005AED47994E1c13C9bc31F274413927", status: "exited", groves: ["heirloom"] },
    { id: "x-salmd-curve",  type: "curve", assets: ["SALMD","NUT"],  name: "SALMD curve",  venue: "Mint Club", mechanism: "bonding-curve", curve: "flat", feeBps: null, tvl: 0, address: "0x1E0f80529593185C021043ffcbfDcB8F4279C649", status: "exited", groves: ["heirloom"] },
    { id: "x-pnutrmy-curve", type: "curve", assets: ["PNUTRMY","NUT"], name: "PNUTRMY curve", venue: "Mint Club", mechanism: "bonding-curve", curve: "flat", feeBps: null, tvl: 0, address: "0xF075300b8C2EF500d8Ce4f783F910C500b9A3512", status: "exited", groves: ["heirloom"] }
  ],

  /* Live cross-mechanism cycles (Polyforest evidence) */
  rings: [
    {
      id: "ring-1",
      name: "Ring I — The First Polyforest Ring (canonized)",
      steps: [
        { from: "NUT",  to: "SALT", via: "salt-curve",    mechanism: "bonding curve" },
        { from: "SALT", to: "USDC", via: "salt-usdc",     mechanism: "vAMM (Aerodrome)" },
        { from: "USDC", to: "PIPS", via: "pips-usdc-rc",  mechanism: "reCLAMM" },
        { from: "PIPS", to: "NUT",  via: "pips-nut",      mechanism: "concentrated liquidity" }
      ]
    },
    {
      id: "ring-2",
      name: "Ring II — curve → pair → pair (detected, not yet canonized in docs)",
      steps: [
        { from: "NUT",    to: "NUTINO", via: "nutino-curve",  mechanism: "bonding curve" },
        { from: "NUTINO", to: "CBBTC",  via: "nutino-cbbtc",  mechanism: "constant-product" },
        { from: "CBBTC",  to: "NUT",    via: "nut-cbbtc",     mechanism: "vAMM (Aerodrome)" }
      ]
    },
    {
      id: "ring-3",
      name: "Ring III — wrapper cross-ring (detected, not yet canonized in docs)",
      steps: [
        { from: "NUT",  to: "PIPS", via: "pips-nut",     mechanism: "concentrated liquidity" },
        { from: "PIPS", to: "USDC", via: "pips-usdc-rc", mechanism: "reCLAMM" },
        { from: "USDC", to: "WNUT", via: "gt-fx",        mechanism: "weighted (Balancer v3)" },
        { from: "WNUT", to: "NUT",  via: "wrapper",      mechanism: "wrapper (1:1)" }
      ]
    },
    {
      id: "ring-4",
      name: "Ring IV — settlement wrapper cross-ring (detected, not yet canonized in docs)",
      steps: [
        { from: "NUT",  to: "SALT", via: "nut-salt-rc",  mechanism: "reCLAMM" },
        { from: "SALT", to: "USDC", via: "salt-usdc",    mechanism: "vAMM (Aerodrome)" },
        { from: "USDC", to: "WNUT", via: "gt-fx",        mechanism: "weighted (Balancer v3)" },
        { from: "WNUT", to: "NUT",  via: "wrapper",      mechanism: "wrapper (1:1)" }
      ]
    }
  ],

  /* Ring census — computed 2026-09-01 by full vertex-simple cycle enumeration
     over the live structure graph (pools treated as all-pairs routes).
     Structural existence ≠ executability: bottlenecks gate real flow. */
  census: {
    method: "vertex-simple + pool-simple cycle enumeration over live structures (pools as all-pairs routes, parallel venues counted separately; wrapper-cross = rings impossible without the NUT↔wNUT edge)",
    computed: "2026-09-01",
    recompute: "full-graph recount over all 24 live structures (incl. the five Aerodrome vAMM venues). Session-70 census (44/19/7) undercounted: its enumerator mechanism regex silently skipped vAMM pools. True counts: 180 market / 32 wrapper-cross / 7 parallel. gtSIL adds zero rings — B20 scions (NVDAC, AAPLC) are leaf vertices.",
    marketRings: 180,            /* multi-vertex rings without the wrapper edge */
    wrapperCrossRings: 32,      /* rings that exist only because NUT↔wNUT connects the two scales */
    parallelVenueLoops: 7,      /* two-way loops between the same asset pair on distinct venues */
    total: 219,                  /* market + wrapper-cross + parallel-venue */
    canonical: 1,               /* documented in docs v21 */
    documentedHere: 4,          /* ring-1..ring-4 above */
    fattestBottleneck: { ring: "Ring II", minTvl: 1451, via: "NUTINO/cbBTC" },
    note: "Every ring is traversable both directions. Bottleneck TVL = thinnest edge on the cycle — the state that decides whether a direction pays."
  },

  groves: {
    sunflower:   { label: "Sunflower Grove",   desc: "Six rooted Twin Grafts on wNUT rootstock — Batch I live 2026-08-27 · gtSIL RWA graft live 2026-09-01" },
    heirloom:    { label: "Heirloom Grove",    desc: "Foundational Branches, Whorls and curves accumulated since genesis" },
    polyforest:  { label: "Polyforest Grove",  desc: "The heterogeneous liquidity region — where different assets, protocols, pricing mechanisms and structures grow together. Membership is economic interconnection, not origin: cross-protocol routing, multi-mechanism arbitrage, settlement paths, cross-Crop liquidity, price propagation" },
    reserve:     { label: "Reserve Grove",     desc: "BTC/ETH-class reserve exposure" },
    settlement:  { label: "Settlement Grove",  desc: "Stable denomination and FX liquidity" },
    compute:     { label: "Compute Grove",     desc: "AI, inference and agent-economy exposure" },
    rwa:         { label: "RWA Grove",         desc: "Real-world asset exposure — tokenized equities grafted onto wNUT rootstock via the Coinbase B20 standard (NVDAc · AAPLc)" },
    infra:       { label: "Infrastructure Grove", desc: "The support species — rails and utilities that let the crop grow: the wNUT wrapper, canonical LST/BTC/FX rails (cbETH · wstETH · cbBTC · tBTC · USDC · EURC) and the venue-native AERO rail. Members overlap other groves by design" },
    "nut-lineage": { label: "NUT Lineage",   desc: "SNUT · NUTINO · SALT — the derivative family" },
    nested:      { label: "Nested Lineage",    desc: "Markets on LP tokens — second-order liquidity" }
  },

  docs: {
    treeGroves:   "https://docs.basednut.com/~/changes/21/liquidity/tree-groves",
    canopyForms:  "https://docs.basednut.com/~/changes/21/liquidity/tree-groves/canopy-forms",
    sunflowerDoc: "https://docs.basednut.com/~/changes/21/liquidity/tree-groves/sunflower-grove",
    heirloomDoc:  "https://docs.basednut.com/~/changes/21/liquidity/tree-groves/heirloom-grove",
    polyforestDoc:"https://docs.basednut.com/~/changes/21/liquidity/tree-groves/polyforest-grove",
    topologyDoc:  "https://docs.basednut.com/~/changes/21/liquidity/tree-groves/topology-graphs",
    stateMachine: "https://docs.basednut.com/~/changes/21/liquidity/tree-groves/state-machine"
  }
};

/* Link helpers */
ORCHARD.link = {
  basescan: (addr) => "https://basescan.org/address/" + addr,
  dexscreener: (addr) => "https://dexscreener.com/base/" + addr,
  balancer: (addr) => "https://balancer.fi/pools/base/v3/" + addr
};
