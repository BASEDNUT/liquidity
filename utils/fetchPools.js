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
      tvl: null,
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
      tvl: null,
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
      name: "SNUT/NUT",
      tvl: null,
      flavor: "Cloud-Salted Breeze",
      platform: "Aerodrome", // Airplanes => "Cloud-Salted" theme
      role: "Keeper-Arb Reactor",
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
      tvl: null,
      flavor: "Caramelized Equilibrium",
      platform: "Balancer",
      role: "Multi-Asset Arb Reactor",
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
      tvl: null,
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
      tvl: null,
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
      name: "SNUT/wETH",
      tvl: null,
      flavor: "Honey-Roasted Frenzy",
      platform: "Uniswap V2",
      role: "Main Spot Liquidity",
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
      name: "SNUT-LP/wETH",
      tvl: null,
      flavor: "Palm Grove Graft Market",
      platform: "Uniswap V2",
      role: "Meta-Market (Liquidity Rights)",
      category: ["TKNs", "SNUT"],
      url: "https://basescan.org/address/0x82bbadb9d6b2c0a59ed01809e30323f89f6faa1c",
      checkPoolUrl:
        "https://app.uniswap.org/explore/tokens/base/0x82bbadb9d6b2c0a59ed01809e30323f89f6faa1c",
      dexscreenerUrl:
        "https://dexscreener.com/base/0x82bbadb9d6b2c0a59ed01809e30323f89f6faa1c",
      status: "Volatile",
      icon: "🥥🌴",
    },
    {
      name: "NUTINO/NUT",
      tvl: null,
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
      tvl: null,
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
      name: "SALT/USDC",
      tvl: null,
      flavor: "Savory Stable Seasoning",
      platform: "Aerodrome",
      category: ["TKNs", "NUTcoins"],
      url: "https://basescan.org/address/0x64ca0b147f625007b6f082abbb3ba217930eccb2",
      checkPoolUrl:
        "https://aerodrome.finance/pools?token0=0x833589fcd6edb6e08f4c7c32d4f71b54bda02913&chain0=8453&token1=0x1ede2afc985f6d7aeb3f4c84b95a103c00d5de81&chain1=8453",
      dexscreenerUrl:
        "https://dexscreener.com/base/0x64ca0b147f625007b6f082abbb3ba217930eccb2",
  status: "Volatile",
      icon: "🧂💵",
    },
    {
      name: "NUT/SALT",
      tvl: null,
      flavor: "Perfectly Salted Crunch",
  platform: "MintClub",
  category: ["TKNs", "NUTcoins"],
  url: "https://basescan.org/token/0x1EDe2AFC985F6D7aEb3F4c84B95A103c00D5dE81",
      checkPoolUrl:
        "https://www.defined.fi/base/0xe4d2da0ff50d98d1cf065f3c9b41279aa7aa0d467fb30c14876086b8df89bdee?quoteToken=token0&utm_campaign=embed&utm_source=https://mint.club&cache=afd85",
      dexscreenerUrl:
        "https://www.defined.fi/base/0xe4d2da0ff50d98d1cf065f3c9b41279aa7aa0d467fb30c14876086b8df89bdee?quoteToken=token0",
      status: "Volatile",
      icon: "🌰🧂",
    },
    {
      name: "PNUTS/NUT",
      tvl: null,
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
      tvl: null,
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
      tvl: null,
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
      tvl: null,
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
      tvl: null,
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
      tvl: null,
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
      tvl: null,
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
      tvl: null,
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
    {
      name: "PIPS/NUT",
      tvl: null,
      flavor: "Machine Meets Kernel",
      platform: "Aerodrome Slipstream CL",
      category: ["TKNs", "PIPS"],
      url: "https://basescan.org/address/0x7f8e532cf1be9ed688adb9e6585bc69f017201b5",
      checkPoolUrl: "https://www.geckoterminal.com/base/pools/0x7f8e532cf1be9ed688adb9e6585bc69f017201b5",
      dexscreenerUrl: "https://dexscreener.com/base/0x7f8e532cf1be9ed688adb9e6585bc69f017201b5",
      status: "Concentrated",
      icon: "💻🥜🌰",
    },
    {
      name: "PIPS/USDC",
      tvl: null,
      flavor: "Stable Machine Fuel",
      platform: "Balancer reCLAMM",
      category: ["TKNs", "PIPS"],
      url: "https://basescan.org/address/0xb19e3af68bb307369e8772a9e157431fcfe9dd44",
      checkPoolUrl: "https://balancer.fi/",
      dexscreenerUrl: "https://dexscreener.com/base/0xb19e3af68bb307369e8772a9e157431fcfe9dd44",
      status: "Experimental",
      icon: "💻🥜💵",
      note: "Partial LP — needs ~$120 USDC to complete the PIPS side",
    },
    // === Sunflower Grove Batch I — Balancer v3 Twin Grafts (5), live 2026-08-27 ===
    // Each graft: 20% wNUT rootstock + two 40% scions. Zero swaps observed yet —
    // no fabricated numbers; live sources return null until pools are indexed.
    {
      name: "gtINF wNUT/VVV/DIEM",
      tvl: null,
      flavor: "Inference Twin Graft",
      platform: "Balancer v3",
      role: "Sunflower Grove Batch I — 20/40/40",
      category: ["TKNs", "wNUT"],
      url: "https://basescan.org/address/0x6a0a1B7428d543524592eD22023A09BdE05aA466",
      checkPoolUrl:
        "https://balancer.fi/pools/base/v3/0x6a0a1B7428d543524592eD22023A09BdE05aA466",
      dexscreenerUrl:
        "https://dexscreener.com/base/0x6a0a1B7428d543524592eD22023A09BdE05aA466",
      status: "Grafted",
      icon: "🌻🧠",
    },
    {
      name: "gtAGT wNUT/VIRTUAL/MOR",
      tvl: null,
      flavor: "Agent Twin Graft",
      platform: "Balancer v3",
      role: "Sunflower Grove Batch I — 20/40/40",
      category: ["TKNs", "wNUT"],
      url: "https://basescan.org/address/0x5dA95cC31C840Fd33180e4C7f879e3F3d8Eca200",
      checkPoolUrl:
        "https://balancer.fi/pools/base/v3/0x5dA95cC31C840Fd33180e4C7f879e3F3d8Eca200",
      dexscreenerUrl:
        "https://dexscreener.com/base/0x5dA95cC31C840Fd33180e4C7f879e3F3d8Eca200",
      status: "Grafted",
      icon: "🌻🤖",
    },
    {
      name: "gtETH wNUT/cbETH/wstETH",
      tvl: null,
      flavor: "Ether Twin Graft",
      platform: "Balancer v3",
      role: "Sunflower Grove Batch I — 20/40/40",
      category: ["TKNs", "wNUT"],
      url: "https://basescan.org/address/0xd156d51219B3a7A590670d655E8740Ad404e8835",
      checkPoolUrl:
        "https://balancer.fi/pools/base/v3/0xd156d51219B3a7A590670d655E8740Ad404e8835",
      dexscreenerUrl:
        "https://dexscreener.com/base/0xd156d51219B3a7A590670d655E8740Ad404e8835",
      status: "Grafted",
      icon: "🌻💧",
    },
    {
      name: "gtBTC wNUT/cbBTC/tBTC",
      tvl: null,
      flavor: "Bitcoin Twin Graft",
      platform: "Balancer v3",
      role: "Sunflower Grove Batch I — 20/40/40",
      category: ["TKNs", "wNUT"],
      url: "https://basescan.org/address/0xb2a63935e1391Ee49E5cfB6cc4f184C285fE29b4",
      checkPoolUrl:
        "https://balancer.fi/pools/base/v3/0xb2a63935e1391Ee49E5cfB6cc4f184C285fE29b4",
      dexscreenerUrl:
        "https://dexscreener.com/base/0xb2a63935e1391Ee49E5cfB6cc4f184C285fE29b4",
      status: "Grafted",
      icon: "🌻₿",
    },
    {
      name: "gtFX wNUT/USDC/EURC",
      tvl: null,
      flavor: "FX Twin Graft",
      platform: "Balancer v3",
      role: "Sunflower Grove Batch I — 20/40/40",
      category: ["TKNs", "wNUT"],
      url: "https://basescan.org/address/0x1cCB8c61b62b9c7a9d4e66C9c824C1539B8b1f2E",
      checkPoolUrl:
        "https://balancer.fi/pools/base/v3/0x1cCB8c61b62b9c7a9d4e66C9c824C1539B8b1f2E",
      dexscreenerUrl:
        "https://dexscreener.com/base/0x1cCB8c61b62b9c7a9d4e66C9c824C1539B8b1f2E",
      status: "Grafted",
      icon: "🌻€",
    },
  ];

  // Add a stable id by slugifying name + platform
  return base.map((p) => ({
    id: `${slugify(p.name)}-${slugify(p.platform)}`,
    ...p,
  }));
}

export function getStaticPools() {
  return fetchPools();
}
