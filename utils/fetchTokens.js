const nutTreeData = {
  trunk: {
    name: "NUT",
    role: "The Root of All Liquidity",
    utility: "Base currency of the orchard; paired across pools and used as the core routing asset.",
    color: "#8B5A2B",
    icon: "🌰",
    address: "0xb8de15fb529d98c93c749de63c749d48d25a30df",
    link: "https://basescan.org/token/0xb8de15fb529d98c93c749de63c749d48d25a30df",
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
      tradeLinks: [
        { label: "Uniswap NUTINO/cbBTC", url: "https://app.uniswap.org/explore/tokens/base/0x30421e2d18dff60b298eef427cf868ca65f1476b" },
        { label: "Defined pair", url: "https://www.defined.fi/base/0x64b1a06ff455fa08f68d0641eae18b0391be3311f89b20458d02c5b24647a65c?quoteToken=token0&cache=18a28" },
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
    },
    {
      name: "cbBTC",
      role: "Base Liquidity (BTC)",
      utility: "Canonical BTC representation on Base.",
      color: "#4A4A4A",
      icon: "🌾", // Wheat fields, base farm element
      link: "https://basescan.org/token/cbBTC",
    },
  ],
};

export default nutTreeData;

export const fetchTokens = () => {
  // Return the mock data synchronously
  return nutTreeData;
};
