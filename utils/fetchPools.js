function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function fetchPools() {
  const base = [
    {
      name: "NUT/wETH",
      tvl: "TBD",
      flavor: "Extra Crunchy Delight",
      platform: "Uniswap V3",
      category: ["TKNs", "NUT"],
      url: "https://basescan.org/address/0xe3Ce00E2Ed742B142C15eEdC208657dd22aa987e",
      checkPoolUrl:
        "https://app.uniswap.org/explore/tokens/base/0xb8de15fb529d98c93c749de63c749d48d25a30df",
      dexscreenerUrl:
        "https://dexscreener.com/base/0xe3ce00e2ed742b142c15eedc208657dd22aa987e",
      status: "Concentrated",
      icon: "🌰🌱",
    },
    {
      name: "NUT/wETH",
      tvl: "TBD",
      flavor: "Mega Crunchy Madness",
      platform: "Uniswap V2",
      category: ["TKNs", "NUT"],
      url: "https://basescan.org/address/0x997bad8e9f5c34d5e9784caaa8a554a5e6192f53",
      checkPoolUrl:
        "https://app.uniswap.org/explore/tokens/base/0xb8de15fb529d98c93c749de63c749d48d25a30d",
      dexscreenerUrl:
        "https://dexscreener.com/base/0x997bad8e9f5c34d5e9784caaa8a554a5e6192f53",
      status: "Volatile",
      icon: "🌰🌱",
    },
    {
      name: "sNUT/NUT",
      tvl: "TBD",
      flavor: "Cloud-Salted Breeze",
      platform: "Aerodrome", // Airplanes => "Cloud-Salted" theme
      category: ["TKNs", "NUT", "SNUT"],
      url: "https://basescan.org/address/0x893faaa7baf7a8247fc7142afb28e13d51a5aae8",
      checkPoolUrl:
        "https://aerodrome.finance/pools?token0=0xAC130701aa31c284c36609E2489f150F419AD7AD&token1=0xb8DE15Fb529d98C93C749De63c749D48D25A30DF&type=-1&factory=0x420DD381b31aEf6683db6B902084cB0FFECe40Da&chain=8453",
      dexscreenerUrl:
        "https://dexscreener.com/base/0x893faaa7baf7a8247fc7142afb28e13d51a5aae8",
      status: "Volatile",
      icon: "🥥🌰",
    },
    {
      name: "pNUT",
      tvl: "TBD",
      flavor: "Caramelized Equilibrium",
      platform: "Balancer",
      category: ["TKNs", "pNUT"],
      url: "https://basescan.org/address/0x2a5757b60987ff10385de1d4d923792f6fdcfff1",
      checkPoolUrl:
        "https://balancer.fi/pools/base/v2/0x2a5757b60987ff10385de1d4d923792f6fdcfff100010000000000000000019e",
      dexscreenerUrl:
        "https://dexscreener.com/base/0x2a5757b60987ff10385de1d4d923792f6fdcfff1-0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22-0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
      status: "Volatile",
      icon: "🥜",
    },
    {
      name: "NUT/AERO",
      tvl: "TBD",
      flavor: "Sky-Seasoned Crisp",
      platform: "Aerodrome",
      category: ["TKNs", "NUT"],
      url: "https://basescan.org/address/0x38630fede5e2032652640d98b2d3f9c6296eea5d",
      checkPoolUrl:
        "https://aerodrome.finance/pools?token0=0x940181a94A35A4569E4529A3CDfB74e38FD98631&token1=0xb8DE15Fb529d98C93C749De63c749D48D25A30DF&type=-1&factory=0x420DD381b31aEf6683db6B902084cB0FFECe40Da&chain=8453",
      dexscreenerUrl:
        "https://dexscreener.com/base/0x38630fede5e2032652640d98b2d3f9c6296eea5d",
      status: "Volatile",
      icon: "🌰✈️",
    },
    {
      name: "NUT/cbBTC",
      tvl: "TBD",
      flavor: "Golden Butter Drizzle",
      platform: "Aerodrome", // cbBTC => "golden," "butter"
      category: ["TKNs", "NUT"],
      url: "https://basescan.org/address/0x15385c9281bc12d2e9bf5c081621944b0ee2acca",
      checkPoolUrl:
        "https://aerodrome.finance/pools?token0=0xb8DE15Fb529d98C93C749De63c749D48D25A30DF&token1=0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf&type=-1&factory=0x420DD381b31aEf6683db6B902084cB0FFECe40Da&chain=8453",
      dexscreenerUrl:
        "https://dexscreener.com/base/0x15385c9281bc12d2e9bf5c081621944b0ee2acca",
      status: "Volatile",
      icon: "🌰🌾",
    },
    {
      name: "sNUT/wETH",
      tvl: "TBD",
      flavor: "Honey-Roasted Frenzy",
      platform: "Uniswap V2",
      category: ["TKNs", "SNUT"],
      url: "https://basescan.org/address/0xB22895d2ee6e29395F30Ec47c8D9FE0d55355AE1",
      checkPoolUrl:
        "https://app.uniswap.org/explore/tokens/base/0xac130701aa31c284c36609e2489f150f419ad7ad",
      dexscreenerUrl:
        "https://dexscreener.com/base/0xAC130701aa31c284c36609E2489f150F419AD7AD",
      status: "Volatile",
      icon: "🥥🌱",
    },
    {
      name: "NUTINO/NUT",
      tvl: "TBD",
      flavor: "Minty Chocolate-Coated Bliss",
      platform: "MintClub", // "Mint" => chocolate mint vibe
      category: ["TKNs", "NUTcoins"],
      url: "https://basescan.org/token/0x30421e2d18dFF60B298eEF427cF868cA65f1476B",
      checkPoolUrl: "https://mint.club/token/base/NUTINO",
      dexscreenerUrl:
        "https://www.defined.fi/base/0x64b1a06ff455fa08f68d0641eae18b0391be3311f89b20458d02c5b24647a65c?quoteToken=token0&cache=18a28",
      status: "Bonding",
      icon: "🌰🍫🌰",
    },
    {
      name: "NUTINO/cbBTC",
      tvl: "TBD",
      flavor: "Buttery Mint Explosion",
      platform: "Uniswap V2", // bridging Mint + BTC gold-butter
      category: ["TKNs", "NUTcoins"],
      url: "https://basescan.org/address/0xeafde67d470480d14139e3d91164c158b82b38e2",
      checkPoolUrl:
        "https://app.uniswap.org/explore/tokens/base/0x30421e2d18dff60b298eef427cf868ca65f1476b",
      dexscreenerUrl:
        "https://dexscreener.com/base/0x30421e2d18dFF60B298eEF427cF868cA65f1476B",
      status: "Volatile",
      icon: "🌰🍫🌾",
    },
    {
      name: "PNUTS/NUT",
      tvl: "TBD",
      flavor: "Peanutty Dream Crunch",
      platform: "MintClub",
      category: "NFTs",
      url: "https://basescan.org/token/0x794fcD89357C1CcF04a1a9A441ad4dB2Cd5EE387",
      checkPoolUrl: "https://mint.club/nft/base/PNUTS",
      dexscreenerUrl:
        "https://opensea.io/assets/base/0x794fcD89357C1CcF04a1a9A441ad4dB2Cd5EE387/0",
      status: "Bonding",
      icon: "🥜⚔️🌰",
    },
    {
      name: "ALMD/NUT",
      tvl: "TBD",
      flavor: "Wasabi-Infused Kick",
      platform: "MintClub",
      category: "NFTs",
      url: "https://basescan.org/token/0x1A160456005AED47994E1c13C9bc31F274413927",
      checkPoolUrl: "https://mint.club/nft/base/ALMD",
      dexscreenerUrl:
        "https://opensea.io/assets/base/0x1A160456005AED47994E1c13C9bc31F274413927/0",
      status: "Bonding",
      icon: "🌰⚔️🌰",
    },
    {
      name: "SALMD/NUT",
      tvl: "TBD",
      flavor: "Subtly Almond-Kissed",
      platform: "MintClub",
      category: "NFTs",
      url: "https://basescan.org/token/0x1E0f80529593185C021043ffcbfDcB8f4279C649",
      checkPoolUrl: "https://mint.club/nft/base/SALMD",
      dexscreenerUrl:
        "https://opensea.io/item/base/0x1E0f80529593185C021043ffcbfDcB8f4279C649/0",
      status: "Bonding",
      icon: "🥜🪖🌰",
    },
    {
      name: "PNUTRMY/NUT",
      tvl: "TBD",
      flavor: "Sun-Kissed Soldiers",
      platform: "MintClub",
      category: "NFTs",
      url: "https://basescan.org/token/0xF075300b8C2EF500d8Ce4f783F910C500B9A3512",
      checkPoolUrl: "https://mint.club/nft/base/PNUTRMY",
      dexscreenerUrl:
        "https://opensea.io/item/base/0xF075300b8C2EF500d8Ce4f783F910C500B9A3512/0",
      status: "Bonding",
      icon: "🌰🪖🌰",
    },
    {
      name: "SPNUT/USDC",
      tvl: "TBD",
      flavor: "Battle-Hardened Peanut Warriors",
      platform: "Sudoswap",
      category: "NFTs",
      url: "https://basescan.org/token/0x04dbBc85E27DF12970dD62973e83a01FCd6aa8FD",
      checkPoolUrl:
        "https://sudoswap.xyz/#/manage/base/0x04dbBc85E27DF12970dD62973e83a01FCd6aa8FD",
      dexscreenerUrl:
        "https://opensea.io/item/base/0x04dbBc85E27DF12970dD62973e83a01FCd6aa8FD/0",
      status: "Bonding",
      icon: "🥥💵",
    },
    {
      name: "PNUTS/USDC",
      tvl: "TBD",
      flavor: "Elite Peanut Commanders",
      platform: "Sudoswap",
      category: "NFTs",
      url: "https://basescan.org/token/0x262bEaa785a0eF65f5D9C1b8BA5c41980D087ff3",
      checkPoolUrl:
        "https://sudoswap.xyz/#/manage/base/0x262bEaa785a0eF65f5D9C1b8BA5c41980D087ff3",
      dexscreenerUrl:
        "https://opensea.io/item/base/0x262bEaa785a0eF65f5D9C1b8BA5c41980D087ff3/0",
      status: "Bonding",
      icon: "🥜⚔️💵",
    },
    {
      name: "SALMD/cbETH",
      tvl: "TBD",
      flavor: "Battle-Hardened Almond Warriors",
      platform: "Sudoswap",
      category: "NFTs",
      url: "https://basescan.org/token/0xeE7243F0E02e5890c6415B5CbAe58e0D0fb758a5",
      checkPoolUrl:
        "https://sudoswap.xyz/#/manage/base/0xeE7243F0E02e5890c6415B5CbAe58e0D0fb758a5",
      dexscreenerUrl:
        "https://opensea.io/item/base/0xeE7243F0E02e5890c6415B5CbAe58e0D0fb758a5/0",
      status: "Bonding",
      icon: "🥜🪖🌱",
    },
    {
      name: "ALMD/cbETH",
      tvl: "TBD",
      flavor: "Elite Almond Commanders",
      platform: "Sudoswap",
      category: "NFTs",
      url: "https://basescan.org/token/0x308C9BC0546723d6e4905c971cd34feBF1f94031",
      checkPoolUrl:
        "https://sudoswap.xyz/#/manage/base/0x308C9BC0546723d6e4905c971cd34feBF1f94031",
      dexscreenerUrl:
        "https://opensea.io/item/base/0x308C9BC0546723d6e4905c971cd34feBF1f94031/0",
      status: "Bonding",
      icon: "🌰⚔️🌱",
    },
  ];

  // Add a stable id by slugifying name + platform
  return base.map((p) => ({
    id: `${slugify(p.name)}-${slugify(p.platform)}`,
    ...p,
  }));
}
