const nutTreeData = {
  trunk: {
    name: "NUT",
    role: "The Root of All Liquidity",
    utility: "Base currency of the orchard; paired across pools and used as the core routing asset.",
    color: "#8B5A2B",
    icon: "🌰",
    address: "0xb8de15fb529d98c93c749de63c749d48d25a30df",
    link: "https://basescan.org/token/0xb8de15fb529d98c93c749de63c749d48d25a30df",
  tags: ["ERC-20", "Core", "Router", "Base"],
    tradeLinks: [
      { label: "Uniswap V3 NUT/wETH", url: "https://app.uniswap.org/explore/tokens/base/0xb8de15fb529d98c93c749de63c749d48d25a30df" },
      { label: "Aerodrome NUT/AERO", url: "https://aerodrome.finance/pools?token0=0x940181a94A35A4569E4529A3CDfB74e38FD98631&token1=0xb8DE15Fb529d98C93C749De63c749D48D25A30DF&type=-1&factory=0x420DD381b31aEf6683db6B902084cB0FFECe40Da&chain=8453" },
    ],
    arb: [
      { route: "NUT ↔ wETH (V2 vs V3)", url: "https://dexscreener.com/base/0xe3ce00e2ed742b142c15eedc208657dd22aa987e" },
      { route: "NUT ↔ AERO ↔ wETH", url: "https://aerodrome.finance/pools" },
    ],
  },
  branches: [
    {
      name: "SNUT",
      role: "Super Nut (Non-Escrow Rewards)",
      utility: "Liquid non-escrow NUT reward-position token with recursive burn mechanics. Hold to earn NUT automatically.",
      color: "#5BA150",
      icon: "🥥", // Lush branch full of leaves
      address: "0xac130701aa31c284c36609e2489f150f419ad7ad",
      link: "https://basescan.org/token/0xac130701aa31c284c36609e2489f150f419ad7ad",
  tags: ["ERC-20", "Rewards", "Reward-Position"],
      tradeLinks: [
        { label: "Uniswap V2 SNUT/wETH", url: "https://app.uniswap.org/explore/tokens/base/0xac130701aa31c284c36609e2489f150f419ad7ad" },
      ],
    },
    {
      name: "pNUT",
      role: "Peanut (Index Token)",
      utility: "Index-style exposure to nut ecosystem components.",
      color: "#D5A100",
      icon: "🥜", // Classic peanut
      address: "0x2a5757b60987ff10385de1d4d923792f6fdcfff1",
      link: "https://basescan.org/token/0x2a5757b60987ff10385de1d4d923792f6fdcfff1",
  tags: ["ERC-20", "Index", "Balancer"],
      tradeLinks: [
        { label: "Balancer pNUT pool", url: "https://balancer.fi/pools/base/v2/0x2a5757b60987ff10385de1d4d923792f6fdcfff100010000000000000000019e" },
      ],
    },
    {
      name: "PIPS",
      role: "Compute token for Pipshell — the Orchard's DevOps agent",
      utility: "PIPS is the fuel for Pipshell, the agent that guards, monitors, and backs up the Orchard. Trading fees pay for its compute so the front desk never goes dark. An infrastructure coin — buy it to keep the machine alive, not as a consumer token.",
      color: "#B8860B",
      icon: "💻🥜",
      address: "0x3f2327221dd4f0bae660172606d6b288a1cf8ad9",
      link: "https://basescan.org/token/0x3f2327221dd4f0bae660172606d6b288a1cf8ad9",
      tags: ["ERC-20", "Agent", "Survival"],
      tradeLinks: [
        { label: "PIPS/NUT Slipstream", url: "https://www.geckoterminal.com/base/pools/0x7f8e532cf1be9ed688adb9e6585bc69f017201b5" },
        { label: "PIPS/USDC reCLAMM", url: "https://balancer.fi/" },
      ],
    },
    {
      name: "wNUT",
      role: "Wrapped NUT (ERC20Wrapper 1:1)",
      utility: "Canonical NUT wrapper. Deposit 1 NUT, mint 1 wNUT — withdraw anytime. Rootstock of the Sunflower Grove: every graft pool holds 20% wNUT with two 40% scions.",
      color: "#6B8E4E",
      icon: "🎁",
      address: "0xBA5ED46e31F80dafF307cbf60bd422a6f62E3dd3",
      link: "https://basescan.org/token/0xBA5ED46e31F80dafF307cbf60bd422a6f62E3dd3",
  tags: ["ERC-20", "Wrapper", "Grove"],
      tradeLinks: [
        { label: "gtINF Inference Twin Graft", url: "https://basescan.org/address/0x6a0a1B7428d543524592eD22023A09BdE05aA466" },
        { label: "gtFX FX Twin Graft", url: "https://basescan.org/address/0x1cCB8c61b62b9c7a9d4e66C9c824C1539B8b1f2E" },
      ],
    },
  ],
  nestedTokens: [
    {
      name: "NUTINO",
      role: "Minty Chocolate-Coated Bliss",
      utility: "Bonding curve token on Mint Club.",
      color: "#8A5A5A",
      icon: "🌰🍫", // Chocolate-covered nut
      address: "0x30421e2d18dFF60B298eEF427cF868cA65f1476B",
      link: "https://basescan.org/token/0x30421e2d18dFF60B298eEF427cF868cA65f1476B",
      mintUrl: "https://mint.club/token/base/NUTINO",
  tags: ["ERC-20", "Bonding Curve", "MintClub"],
      tradeLinks: [
        { label: "Uniswap NUTINO/cbBTC", url: "https://app.uniswap.org/explore/tokens/base/0x30421e2d18dff60b298eef427cf868ca65f1476b" },
        { label: "Defined pair", url: "https://www.defined.fi/base/0x64b1a06ff455fa08f68d0641eae18b0391be3311f89b20458d02c5b24647a65c?quoteToken=token0&cache=18a28" },
      ],
    },
    {
      name: "SALT",
      role: "Savory Seasoning",
      utility: "Bonding curve token on Mint Club.",
      color: "#CFCFCF",
      icon: "🧂",
      address: "0x1EDe2AFC985F6D7aEb3F4c84B95A103c00D5dE81",
      link: "https://basescan.org/token/0x1EDe2AFC985F6D7aEb3F4c84B95A103c00D5dE81",
      mintUrl: "https://mint.club/token/base/SALT",
  tags: ["ERC-20", "Bonding Curve", "MintClub"],
      tradeLinks: [
        { label: "Aerodrome SALT/USDC", url: "https://aerodrome.finance/pools?token0=0x833589fcd6edb6e08f4c7c32d4f71b54bda02913&chain0=8453&token1=0x1ede2afc985f6d7aeb3f4c84b95a103c00d5de81&chain1=8453" },
        { label: "Dexscreener SALT/USDC", url: "https://dexscreener.com/base/0x64ca0b147f625007b6f082abbb3ba217930eccb2" },
        { label: "Defined NUT/SALT", url: "https://www.defined.fi/base/0xe4d2da0ff50d98d1cf065f3c9b41279aa7aa0d467fb30c14876086b8df89bdee?quoteToken=token0&utm_campaign=embed&utm_source=https://mint.club&cache=afd85" },
      ],
    },
    {
      name: "PNUTS",
      role: "Peanutty Dream Crunch",
      utility: "Nested NFT collection; ranks define spoils.",
      color: "#E1B382",
      icon: "🥜⚔️", // Double peanuts in shell
      address: "0x794fcD89357C1CcF04a1a9A441ad4dB2Cd5EE387",
      link: "https://basescan.org/token/0x794fcD89357C1CcF04a1a9A441ad4dB2Cd5EE387",
      mintUrl: "https://mint.club/nft/base/PNUTS",
  tags: ["NFT", "MintClub", "Nested"],
      nftTradeLinks: [
        { label: "OpenSea", url: "https://opensea.io/assets/base/0x794fcD89357C1CcF04a1a9A441ad4dB2Cd5EE387/0" },
        { label: "Sudoswap", url: "https://sudoswap.xyz/#/manage/base/0x262bEaa785a0eF65f5D9C1b8BA5c41980D087ff3" },
      ],
    },
    {
      name: "ALMD",
      role: "Wasabi-Infused Kick",
      utility: "Nested NFT collection.",
      color: "#5D3A1A",
      icon: "🌰⚔️", // Almond representation
      address: "0x1A160456005AED47994E1c13C9bc31F274413927",
      link: "https://basescan.org/token/0x1A160456005AED47994E1c13C9bc31F274413927",
      mintUrl: "https://mint.club/nft/base/ALMD",
  tags: ["NFT", "MintClub", "Nested"],
      nftTradeLinks: [
        { label: "OpenSea", url: "https://opensea.io/assets/base/0x1A160456005AED47994E1c13C9bc31F274413927/0" },
        { label: "Sudoswap", url: "https://sudoswap.xyz/#/manage/base/0x308C9BC0546723d6e4905c971cd34feBF1f94031" },
      ],
    },
    {
      name: "SALMD",
      role: "Subtly Almond-Kissed",
      utility: "Nested NFT collection.",
      color: "#F5D6A3",
      icon: "🥜🪖", // Light-shelled nut, best emoji fit for subtle almond
      address: "0x1E0f80529593185C021043ffcbfDcB8f4279C649",
      link: "https://basescan.org/token/0x1E0f80529593185C021043ffcbfDcB8f4279C649",
      mintUrl: "https://mint.club/nft/base/SALMD",
  tags: ["NFT", "MintClub", "Nested"],
      nftTradeLinks: [
        { label: "OpenSea", url: "https://opensea.io/item/base/0x1E0f80529593185C021043ffcbfDcB8f4279C649/0" },
        { label: "Sudoswap", url: "https://sudoswap.xyz/#/manage/base/0xeE7243F0E02e5890c6415B5CbAe58e0D0fb758a5" },
      ],
    },
    {
      name: "PNUTRMY",
      role: "Sun-Kissed Soldiers",
      utility: "Nested NFT collection.",
      color: "#D7A45F",
      icon: "🌰🪖", // Sun, symbolizing "Sun-Kissed"
      address: "0xF075300b8C2EF500d8Ce4f783F910C500B9A3512",
      link: "https://basescan.org/token/0xF075300b8C2EF500d8Ce4f783F910C500B9A3512",
      mintUrl: "https://mint.club/nft/base/PNUTRMY",
  tags: ["NFT", "MintClub", "Nested"],
      nftTradeLinks: [
        { label: "OpenSea", url: "https://opensea.io/item/base/0xF075300b8C2EF500d8Ce4f783F910C500B9A3512/0" },
        { label: "Sudoswap", url: "https://sudoswap.xyz/#/manage/base/0x04dbBc85E27DF12970dD62973e83a01FCd6aa8FD" },
      ],
    },
    {
      name: "gtINF",
      role: "Inference Twin Graft BPT",
      utility: "Balancer v3 weighted pool token — 20% wNUT rootstock / 40% VVV / 40% DIEM. Sunflower Grove Batch I.",
      color: "#A78BFA",
      icon: "🌻🧠",
      address: "0x6a0a1B7428d543524592eD22023A09BdE05aA466",
      link: "https://basescan.org/address/0x6a0a1B7428d543524592eD22023A09BdE05aA466",
      tags: ["Graft", "Balancer v3", "BPT", "wNUT"],
    },
    {
      name: "gtAGT",
      role: "Agent Twin Graft BPT",
      utility: "Balancer v3 weighted pool token — 20% wNUT rootstock / 40% VIRTUAL / 40% MOR. Sunflower Grove Batch I.",
      color: "#6EE7B7",
      icon: "🌻🤖",
      address: "0x5dA95cC31C840Fd33180e4C7f879e3F3d8Eca200",
      link: "https://basescan.org/address/0x5dA95cC31C840Fd33180e4C7f879e3F3d8Eca200",
      tags: ["Graft", "Balancer v3", "BPT", "wNUT"],
    },
    {
      name: "gtETH",
      role: "Ether Twin Graft BPT",
      utility: "Balancer v3 weighted pool token — 20% wNUT rootstock / 40% cbETH / 40% wstETH. Sunflower Grove Batch I.",
      color: "#8FBF6B",
      icon: "🌻💧",
      address: "0xd156d51219B3a7A590670d655E8740Ad404e8835",
      link: "https://basescan.org/address/0xd156d51219B3a7A590670d655E8740Ad404e8835",
      tags: ["Graft", "Balancer v3", "BPT", "wNUT"],
    },
    {
      name: "gtBTC",
      role: "Bitcoin Twin Graft BPT",
      utility: "Balancer v3 weighted pool token — 20% wNUT rootstock / 40% cbBTC / 40% tBTC. Sunflower Grove Batch I.",
      color: "#F0B35B",
      icon: "🌻₿",
      address: "0xb2a63935e1391Ee49E5cfB6cc4f184C285fE29b4",
      link: "https://basescan.org/address/0xb2a63935e1391Ee49E5cfB6cc4f184C285fE29b4",
      tags: ["Graft", "Balancer v3", "BPT", "wNUT"],
    },
    {
      name: "gtFX",
      role: "FX Twin Graft BPT",
      utility: "Balancer v3 weighted pool token — 20% wNUT rootstock / 40% USDC / 40% EURC. Sunflower Grove Batch I.",
      color: "#7FB3E8",
      icon: "🌻€",
      address: "0x1cCB8c61b62b9c7a9d4e66C9c824C1539B8b1f2E",
      link: "https://basescan.org/address/0x1cCB8c61b62b9c7a9d4e66C9c824C1539B8b1f2E",
      tags: ["Graft", "Balancer v3", "BPT", "wNUT"],
    },
  ],
  soil: [
    {
      name: "cbETH",
      role: "Base Liquidity (ETH)",
      utility: "Canonical ETH representation on Base.",
      color: "#555555",
      icon: "🌱", // Soil sprouting new growth
      link: "https://basescan.org/token/cbETH",
  tags: ["ERC-20", "ETH", "Base"],
    },
    {
      name: "cbBTC",
      role: "Base Liquidity (BTC)",
      utility: "Canonical BTC representation on Base.",
      color: "#4A4A4A",
      icon: "🌾", // Wheat fields, base farm element
      link: "https://basescan.org/token/cbBTC",
  tags: ["ERC-20", "BTC", "Base"],
    },
    {
      name: "USDC",
  role: "Base Stablecoin (USDC)",
      utility: "Fiat-backed stablecoin on Base.",
      color: "#9C7B5A",
      icon: "💵",
      address: "0x833589fCD6EDb6E08f4c7c32D4f71B54bDA02913",
      link: "https://basescan.org/token/0x833589fCD6EDb6E08f4c7c32D4f71B54bDA02913",
  tags: ["ERC-20", "Stablecoin", "Base"],
    },
    {
      name: "AERO",
      role: "Aerodrome Governance",
      utility: "DEX governance and incentives on Base.",
      color: "#A67C52",
      icon: "✈️",
      address: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
      link: "https://basescan.org/token/0x940181a94A35A4569E4529A3CDfB74e38FD98631",
  tags: ["ERC-20", "DEX", "Base"],
    },
    {
      name: "wETH",
      role: "Wrapped ETH (Base)",
      utility: "Wrapped ETH used in pools and routing.",
      color: "#8B5A2B",
      icon: "🪙",
      address: "0x4200000000000000000000000000000000000006",
      link: "https://basescan.org/token/0x4200000000000000000000000000000000000006",
  tags: ["ERC-20", "ETH", "Base"],
    },
    {
      name: "VVV",
      role: "Venice Token (AI Inference)",
      utility: "Venice.ai token. Inference scion grafted with wNUT in the gtINF pool.",
      color: "#7B68EE",
      icon: "🧠",
      address: "0xacfE6019Ed1A7Dc6f7B508C02d1b04ec88cC21bf",
      link: "https://basescan.org/token/0xacfE6019Ed1A7Dc6f7B508C02d1b04ec88cC21bf",
  tags: ["ERC-20", "AI", "Grove Scion"],
    },
    {
      name: "DIEM",
      role: "Diem — Venice Compute Credit",
      utility: "Venice compute token. Inference scion grafted with wNUT in the gtINF pool.",
      color: "#4682B4",
      icon: "💠",
      address: "0xF4d97F2da56e8c3098f3a8D538DB630A2606a024",
      link: "https://basescan.org/token/0xF4d97F2da56e8c3098f3a8D538DB630A2606a024",
  tags: ["ERC-20", "AI", "Grove Scion"],
    },
    {
      name: "VIRTUAL",
      role: "Virtuals Protocol",
      utility: "Agent launchpad token for Virtuals. Agent scion grafted with wNUT in the gtAGT pool.",
      color: "#9370DB",
      icon: "🤖",
      address: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b",
      link: "https://basescan.org/token/0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b",
  tags: ["ERC-20", "Agents", "Grove Scion"],
    },
    {
      name: "MOR",
      role: "Morpheus AI",
      utility: "Morpheus network token. Agent scion grafted with wNUT in the gtAGT pool.",
      color: "#708090",
      icon: "🕶️",
      address: "0x7431aDa8a591C955a994a21710752EF9b882b8e3",
      link: "https://basescan.org/token/0x7431aDa8a591C955a994a21710752EF9b882b8e3",
  tags: ["ERC-20", "AI", "Grove Scion"],
    },
    {
      name: "wstETH",
      role: "Lido Wrapped Staked ETH",
      utility: "Staked-ETH with rebasing baked in. Ether scion grafted with wNUT in the gtETH pool.",
      color: "#00CED1",
      icon: "💧",
      address: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452",
      link: "https://basescan.org/token/0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452",
  tags: ["ERC-20", "ETH", "Grove Scion"],
    },
    {
      name: "tBTC",
      role: "Threshold Bitcoin",
      utility: "Decentralized wrapped BTC. Bitcoin scion grafted with wNUT in the gtBTC pool.",
      color: "#F7931A",
      icon: "₿",
      address: "0x236aa50979D5f3De3Bd1Eeb40E81137F22ab794b",
      link: "https://basescan.org/token/0x236aa50979D5f3De3Bd1Eeb40E81137F22ab794b",
  tags: ["ERC-20", "BTC", "Grove Scion"],
    },
    {
      name: "EURC",
      role: "Circle EURC",
      utility: "Euro stablecoin by Circle. FX scion grafted with wNUT in the gtFX pool.",
      color: "#4169E1",
      icon: "€",
      address: "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42",
      link: "https://basescan.org/token/0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42",
  tags: ["ERC-20", "Stablecoin", "Grove Scion"],
    },
  ],
};

export default nutTreeData;

export const fetchTokens = () => {
  // Return the mock data synchronously
  return nutTreeData;
};

// Async version that enriches each token with multi-source marketData
// Calls fetchTokenData directly instead of self-referencing HTTP /api/token-data
// (self-referencing HTTP calls fail on Vercel serverless — each function runs in its own container)
// Falls back to no marketData if fetch fails — never throws
import { fetchTokenData, TOKEN_ADDRESSES } from './tokenDataSources.js';

export async function fetchTokensWithMarketData() {
  // Deep clone the static data so we do not mutate the original
  const data = JSON.parse(JSON.stringify(nutTreeData));

  // Fetch market data directly (no HTTP self-call — works on Vercel serverless)
  let tokenMarketData = {};
  try {
    const tokenData = await fetchTokenData(TOKEN_ADDRESSES);
    tokenMarketData = tokenData || {};
  } catch {
    // Fetch failed — proceed without marketData
  }

  // Helper: attach marketData to a single token object by matching its name
  const attachMarketData = (token) => {
    if (!token || !token.name) return token;
    const md = tokenMarketData[token.name];
    if (md) {
      token.marketData = md;
    }
    return token;
  };

  // Attach to trunk
  if (data.trunk) {
    attachMarketData(data.trunk);
  }
  // Attach to branches
  if (Array.isArray(data.branches)) {
    data.branches.forEach(attachMarketData);
  }
  // Attach to nestedTokens
  if (Array.isArray(data.nestedTokens)) {
    data.nestedTokens.forEach(attachMarketData);
  }
  // Attach to soil
  if (Array.isArray(data.soil)) {
    data.soil.forEach(attachMarketData);
  }

  return data;
}
