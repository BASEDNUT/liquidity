import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Box, Button, Card, CardContent, Chip, Container, Typography } from "@mui/material";
import Layout from "../components/Layout";

// ── Verified constants (sources: config truth chain + nut.js page) ──
const NUT = {
  name: "NUT",
  address: "0xb8de15fb529d98c93c749de63c749d48d25a30df",
  decimals: 18,
  supply: "exactly 1 NUT (10^18 atomic units), no mint, no burn",
  basescan: "https://basescan.org/token/0xb8de15fb529d98c93c749de63c749d48d25a30df",
};

const ROOT_ASSETS = [
  {
    symbol: "NUT",
    icon: "🌰",
    label: "The Root",
    why: "The conserved monetary root of the whole ecosystem. Supply is exactly 1 - no more can ever be minted. Pairing here connects your token to the reference coordinate every child asset uses as collateral, reward asset, or constituent.",
    address: NUT.address,
    link: NUT.basescan,
  },
  {
    symbol: "SNUT",
    icon: "🥥",
    label: "The Reward Branch",
    why: "Liquid non-escrow reward-position token. Pairs here connect to the rewards layer of the orchard.",
    address: "0xac130701aa31c284c36609e2489f150f419ad7ad",
    link: "https://basescan.org/token/0xac130701aa31c284c36609e2489f150f419ad7ad",
  },
  {
    symbol: "SALT",
    icon: "🧂",
    label: "The Bonding Seasoning",
    why: "Bonding-curve asset on Mint Club. Pairs here live on the mint/redemption curve.",
    address: "0x1EDe2AFC985F6D7aEb3F4c84B95A103c00D5dE81",
    link: "https://basescan.org/token/0x1EDe2AFC985F6D7aEb3F4c84B95A103c00D5dE81",
  },
];

const VENUES = [
  {
    name: "Aerodrome",
    icon: "🛫",
    createUrl: "https://aerodrome.finance/liquidity",
    swapUrl: "https://aerodrome.finance/swap",
    note: "Base's central liquidity hub. Volatile and stable pool types. Weekly AERO emissions can reward LPs in whitelisted pools - incentive direction is governance-decided, never guaranteed.",
  },
  {
    name: "Uniswap",
    icon: "🦄",
    createUrl: "https://app.uniswap.org/positions/create/v3",
    createUrl2: "https://app.uniswap.org/positions/create/v2",
    createLabel2: "New V2 position",
    swapUrl: "https://app.uniswap.org/swap?chain=base",
    note: "V3 gives concentrated liquidity (you pick the price range). V2 is the simpler full-range option. Use the official app domain only.",
  },
  {
    name: "Balancer",
    icon: "⚖️",
    createUrl: "https://balancer.fi/create",
    swapUrl: "https://balancer.fi/swap",
    note: "Weighted and custom pool types on Base. The Orchard's pNUT index and reCLAMM pools live here.",
  },
];

const CHECKS = [
  {
    title: "Check the domain, character by character",
    body: "Scammers register look-alike domains (aerodrome-finace, uniswap-app, balancer-fi). Type the URL yourself or use the links on this page. Front-end DNS hacks have hit even major DEXs - the interface you load matters as much as the contract you interact with.",
  },
  {
    title: "Verify the NUT contract address",
    body: "Before pairing, paste the pool's token address into Basescan and confirm it matches the canonical NUT address on this page exactly. Same name is not enough - fakes copy names and icons.",
  },
  {
    title: "Cross-check on a second source",
    body: "Look up the pool on DexScreener or GeckoTerminal and confirm the pair, liquidity, and transaction history look real and match what the venue shows you.",
  },
  {
    title: "Check pool fee and settings before you commit",
    body: "Pool fee tiers, price ranges, and initial ratio all matter. A wrong initial price on a new pool can be arbitraged against you instantly. Start small if unsure.",
  },
  {
    title: "Bookmark the verified URLs",
    body: "After verifying once, bookmark the real sites. Future you should never arrive via search ads or DM links.",
  },
];

const cardSx = {
  background: "linear-gradient(135deg, #FFF7EA 0%, #FFEED6 100%)",
  border: "1px solid #E8DCC8",
  borderRadius: "24px",
  boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
};

export default function PairYourToken() {
  const [copied, setCopied] = useState("");

  const copyAddr = async (addr, tag) => {
    try {
      await navigator.clipboard.writeText(addr);
      setCopied(tag);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      // clipboard unavailable - no-op, address stays selectable on screen
    }
  };

  return (
    <Layout>
      <Head>
        <title>Pair Your Token With NUT | BASED NUT</title>
        <meta
          name="description"
          content="Walkthrough: connect your token to the liquidity root of BASED NUT. Create a pool on Aerodrome, Uniswap, or Balancer on Base, then verify every site and address before you commit."
        />
      </Head>
      <Container sx={{ maxWidth: "lg", mt: 4, px: { xs: 2, sm: 4 } }}>
        {/* HERO */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography variant="h3" sx={{ color: "#5B3A29", fontWeight: 800, mb: 1 }}>
            🔗 Pair Your Token With NUT
          </Typography>
          <Typography variant="h6" sx={{ color: "#7D5A50", maxWidth: 720, mx: "auto", fontWeight: 400 }}>
            Connect your token to the liquidity root of BASED NUT.
          </Typography>
          <Typography sx={{ color: "#7D5A50", maxWidth: 760, mx: "auto", mt: 2 }}>
            NUT is the root asset of the BASED NUT ecosystem. It has a fixed supply of exactly{" "}
            <strong>1 token</strong> - no more can ever be minted. Because supply is 1, the whole-token
            price equals the FDV. Every other token in the ecosystem is built on top of NUT: child
            assets use it as collateral, reward asset, constituent, or reference input. One conserved
            root, many local price surfaces - no venue owns the truth, and your pool becomes one of
            them.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap", mt: 3 }}>
            <Button variant="contained" href="#venues" sx={{ bgcolor: "#8B4513", borderRadius: "999px", px: 4, textTransform: "none", fontWeight: 700 }}>
              Start the walkthrough
            </Button>
            <Button variant="outlined" href="#verify" sx={{ borderColor: "#8B4513", color: "#8B4513", borderRadius: "999px", px: 4, textTransform: "none", fontWeight: 700 }}>
              Safety checklist
            </Button>
          </Box>
        </Box>

        {/* STEP 1 - PICK ROOT ASSET */}
        <Box id="roots" sx={{ mb: 6, scrollMarginTop: 90 }}>
          <Typography variant="h5" sx={{ color: "#5B3A29", fontWeight: 700, mb: 1 }}>Step 1 · Pick your root asset</Typography>
          <Typography sx={{ color: "#7D5A50", mb: 3, maxWidth: 720 }}>
            NUT is the main pairing target - the deeper the root, the stronger the connection. SNUT and SALT
            connect you to the rewards and bonding layers instead.
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
            {ROOT_ASSETS.map((r) => (
              <Card key={r.symbol} sx={cardSx}>
                <CardContent>
                  <Box sx={{ fontSize: "2rem", mb: 1 }} aria-hidden="true">{r.icon}</Box>
                  <Typography variant="h6" sx={{ color: "#5B3A29", fontWeight: 700 }}>
                    {r.symbol} <Chip label={r.label} size="small" sx={{ bgcolor: "#EFE3CF", color: "#5B3A29", fontWeight: 600, ml: 1 }} />
                  </Typography>
                  <Typography sx={{ color: "#7D5A50", fontSize: "0.9rem", my: 1.5 }}>{r.why}</Typography>
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#5D4037", wordBreak: "break-all", bgcolor: "#F5E9DA", p: 1, borderRadius: 2 }}>
                    {r.address}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
                    <Button size="small" onClick={() => copyAddr(r.address, r.symbol)} sx={{ color: "#8B4513", textTransform: "none", fontWeight: 600 }}>
                      {copied === r.symbol ? "Copied ✓" : "Copy address"}
                    </Button>
                    <Button size="small" href={r.link} target="_blank" rel="noopener noreferrer" sx={{ color: "#2E4B2E", textTransform: "none", fontWeight: 600 }}>
                      Basescan ↗
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* STEP 2 - PICK VENUE */}
        <Box id="venues" sx={{ mb: 6, scrollMarginTop: 90 }}>
          <Typography variant="h5" sx={{ color: "#5B3A29", fontWeight: 700, mb: 1 }}>Step 2 · Pick a venue and create the pool</Typography>
          <Typography sx={{ color: "#7D5A50", mb: 3, maxWidth: 720 }}>
            All three venues run on Base (chain ID 8453). Connect your wallet, import your token and the root
            asset, fund both sides, and set the initial price. Official pool-creation links only:
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
            {VENUES.map((v) => (
              <Card key={v.name} sx={cardSx}>
                <CardContent>
                  <Box sx={{ fontSize: "2rem", mb: 1 }} aria-hidden="true">{v.icon}</Box>
                  <Typography variant="h6" sx={{ color: "#5B3A29", fontWeight: 700 }}>{v.name}</Typography>
                  <Typography sx={{ color: "#7D5A50", fontSize: "0.9rem", my: 1.5 }}>{v.note}</Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "flex-start" }}>
                    <Button size="small" variant="contained" href={v.createUrl} target="_blank" rel="noopener noreferrer" sx={{ bgcolor: "#8B4513", borderRadius: "999px", textTransform: "none", fontWeight: 600 }}>
                      Create pool ↗
                    </Button>
                    {v.createUrl2 ? (
                      <Button size="small" href={v.createUrl2} target="_blank" rel="noopener noreferrer" sx={{ color: "#8B4513", textTransform: "none", fontWeight: 600 }}>
                        {v.createLabel2} ↗
                      </Button>
                    ) : null}
                    <Button size="small" href={v.swapUrl} target="_blank" rel="noopener noreferrer" sx={{ color: "#8B4513", textTransform: "none", fontWeight: 600 }}>
                      Swap interface ↗
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
          <Typography sx={{ color: "rgba(93,64,55,0.65)", fontSize: "0.8rem", mt: 2 }}>
            Tip: you will need a small amount of ETH on Base for gas, plus both tokens you are pairing.
          </Typography>
        </Box>

        {/* STEP 3 - VERIFY */}
        <Box id="verify" sx={{ mb: 6, scrollMarginTop: 90 }}>
          <Typography variant="h5" sx={{ color: "#5B3A29", fontWeight: 700, mb: 1 }}>Step 3 · Verify before you commit</Typography>
          <Typography sx={{ color: "#7D5A50", mb: 3, maxWidth: 720 }}>
            Every step below takes under a minute and protects your funds. Fake clones and DNS hijacks are
            real - major DEXs have had their front-ends compromised before. The contract you interact with
            and the interface you load both matter.
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
            {CHECKS.map((c, i) => (
              <Card key={c.title} sx={cardSx}>
                <CardContent sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ fontSize: "1.4rem", lineHeight: 1 }} aria-hidden="true">✅</Box>
                  <Box>
                    <Typography sx={{ color: "#5B3A29", fontWeight: 700, mb: 0.5 }}>{i + 1}. {c.title}</Typography>
                    <Typography sx={{ color: "#7D5A50", fontSize: "0.88rem" }}>{c.body}</Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* STEP 4 - SWAP-SIDE */}
        <Box id="swap" sx={{ mb: 6, scrollMarginTop: 90 }}>
          <Typography variant="h5" sx={{ color: "#5B3A29", fontWeight: 700, mb: 1 }}>Step 4 · Give your pool a swap-side</Typography>
          <Typography sx={{ color: "#7D5A50", mb: 3, maxWidth: 720 }}>
            A pool needs traders. Share your pair's swap link so people can route through it - direct venue
            links and aggregators both work. Price is not stored in NUT - it is produced by the state of the
            market observing NUT, and your pool joins that market.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {VENUES.map((v) => (
              <Button key={v.name} href={v.swapUrl} target="_blank" rel="noopener noreferrer" variant="outlined" sx={{ borderColor: "#8B4513", color: "#8B4513", borderRadius: "999px", textTransform: "none", fontWeight: 600 }}>
                {v.icon} Swap on {v.name} ↗
              </Button>
            ))}
          </Box>
        </Box>

        {/* WHY ROOT */}
        <Box id="why" sx={{ mb: 6, scrollMarginTop: 90 }}>
          <Card sx={{ ...cardSx, background: "linear-gradient(135deg, #F7EFE2 0%, #FFEED6 100%)" }}>
            <CardContent>
              <Typography variant="h5" sx={{ color: "#5B3A29", fontWeight: 700, mb: 2 }}>
                🌰 Why connect to the root?
              </Typography>
              <Typography sx={{ color: "#7D5A50", mb: 2 }}>
                Because root quantity cannot adjust, part of economic adjustment migrates into liquidity
                placement and routing. LPs choose where to place NUT liquidity - venue, range, and depth -
                and those choices change price impact, executable routes, and where price discovery lives,
                without changing a single unit of root supply. Your pool is a new job for the same conserved
                whole.
              </Typography>
              <Typography sx={{ color: "#7D5A50", mb: 2 }}>
                NUT does not move through a passive market. It moves through a machine it rewrites by moving:
                scarce root → venues → child minting → index wrapping → price gaps → arbitrage → root
                reprices → repeat. Pairing your token adds a venue to that machine.
              </Typography>
              <Typography sx={{ color: "#7D5A50", fontWeight: 600 }}>
                Read the full doctrine: <Link href="/token/nut" style={{ color: "#8B4513", fontWeight: 700 }}>the NUT page ↗</Link>
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* DISCLAIMER */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="caption" sx={{ color: "rgba(93,64,55,0.6)", display: "block", maxWidth: 700, mx: "auto" }}>
            BASED NUT is an experimental memefi project. Nothing here is financial advice. Providing
            liquidity carries real risk - impermanent loss, smart-contract risk, and mispriced initial
            ranges can lose you money. Verify everything yourself.
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
}
