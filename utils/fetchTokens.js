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
      utility: "Reward/multiplier token; used in staking and campaign payouts.",
      color: "#5BA150",
      icon: "🥥", // Lush branch full of leaves
      address: "0xac130701aa31c284c36609e2489f150f419ad7ad",
      link: "https://basescan.org/token/0xac130701aa31c284c36609e2489f150f419ad7ad",
  tags: ["ERC-20", "Rewards", "Staking"],
      tradeLinks: [
        { label: "Uniswap V2 sNUT/wETH", url: "https://app.uniswap.org/explore/tokens/base/0xac130701aa31c284c36609e2489f150f419ad7ad" },
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
      role: "Base Stablecoin",
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
  ],
};

export default nutTreeData;

export const fetchTokens = () => {
  // Return the mock data synchronously
  return nutTreeData;
};
