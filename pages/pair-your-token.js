import React, { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Container,
  MenuItem,
  Paper,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Layout from "../components/Layout";

// ── Verified addresses (site truth chain: tokenDataSources.js / nutDataSources.js) ──
const NUT = "0xb8de15fb529d98c93c749de63c749d48d25a30df";

const PAIR_TOKENS = [
  { sym: "wETH", icon: "💎", addr: "0x4200000000000000000000000000000000000006", name: "Wrapped Ether" },
  { sym: "USDC", icon: "💵", addr: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", name: "USD Coin" },
  { sym: "AERO", icon: "🛫", addr: "0x940181a94a35a4569e4529a3cdfb74e38fd98631", name: "Aerodrome" },
  { sym: "cbBTC", icon: "🟠", addr: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf", name: "Coinbase BTC" },
  { sym: "cbETH", icon: "🔵", addr: "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22", name: "Coinbase Staked ETH" },
];

const VENUES = {
  aerodrome: {
    label: "Aerodrome",
    icon: "🛫",
    create: "https://aerodrome.finance/liquidity",
    note: "Volatile + stable pool types. AERO emissions possible - governance-decided, never guaranteed.",
  },
  uniswap: {
    label: "Uniswap",
    icon: "🦄",
    create: "https://app.uniswap.org/positions/create/v3?chain=base",
    create2: "https://app.uniswap.org/positions/create/v2",
    create2Label: "V2 position",
    note: "V3: you pick the price range. V2: simpler, full range.",
  },
  balancer: {
    label: "Balancer",
    icon: "⚖️",
    create: "https://balancer.fi/create",
    note: "Weighted pools. Home of the Orchard's pNUT index + reCLAMM.",
  },
};

// Palette from nut.js — same dark root theme
const C = {
  bgDark: "#1A0F08",
  card: "#241409",
  nut: "#8B5A2B",
  nutLight: "#C8A27A",
  gold: "#D4A676",
  rootGlow: "#E8B56E",
  textDim: "rgba(250,243,230,0.65)",
  textFaint: "rgba(250,243,230,0.4)",
};

const short = (a) => a.slice(0, 6) + "…" + a.slice(-4);

export default function PairYourToken() {
  const [pairSym, setPairSym] = useState("");
  const [customAddr, setCustomAddr] = useState("");
  const [venue, setVenue] = useState("aerodrome");
  const [copied, setCopied] = useState("");

  const customValid = /^0x[a-fA-F0-9]{40}$/.test(customAddr.trim());
  const selected = PAIR_TOKENS.find((t) => t.sym === pairSym) || null;
  const pairAddr = selected ? selected.addr : customValid ? customAddr.trim() : null;
  const pairLabel = selected ? selected.sym : customValid ? short(pairAddr) : "your token";
  const v = VENUES[venue];

  const aeroScanUrl = useMemo(() => {
    if (!pairAddr) return null;
    return "https://aerodrome.finance/pools?token0=" + NUT + "&token1=" + pairAddr + "&chain=8453";
  }, [pairAddr]);

  const copy = async (text, tag) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(tag);
      setTimeout(() => setCopied(""), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Layout>
      <Head>
        <title>Pair With NUT | BASED NUT</title>
        <meta
          name="description"
          content="Pick a token, pick a venue, create a NUT pool on Base. Supply = 1, forever - your token becomes a new price surface of the conserved root."
        />
      </Head>
      <Container sx={{ maxWidth: "md", mt: 4, px: { xs: 2, sm: 4 } }}>
        {/* HEADER — two lines, then straight to the tool */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h4" sx={{ color: "#5B3A29", fontWeight: 900, mb: 1 }}>
            🌰 Pair With NUT
          </Typography>
          <Typography sx={{ color: "#7D5A50", fontSize: "1rem" }}>
            Supply = 1, forever. Your token becomes a new price surface of the conserved root.
          </Typography>
        </Box>

        {/* ══ THE TOOL ══ */}
        <Paper
          elevation={8}
          sx={{
            background: C.bgDark,
            border: "1px solid " + C.nut,
            borderRadius: "28px",
            p: { xs: 2.5, sm: 4 },
            boxShadow: "0 20px 50px rgba(26,15,8,0.45)",
          }}
        >
          {/* Row 1: NUT fixed + pair selector */}
          <Typography sx={{ color: C.textFaint, fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", mb: 1.5 }}>
            Your pairing
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
            {/* NUT — locked root side */}
            <Paper
              sx={{
                background: C.card,
                border: "1px solid " + C.nut,
                borderRadius: "18px",
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box sx={{ fontSize: "1.8rem" }} aria-hidden="true">🌰</Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ color: C.rootGlow, fontWeight: 800, display: "flex", alignItems: "center", gap: 0.75, fontSize: "1.05rem" }}>
                  NUT
                  <Tooltip title="NUT is the fixed root side of every pairing">
                    <span aria-hidden="true" style={{ fontSize: "0.8rem" }}>🔒</span>
                  </Tooltip>
                </Typography>
                <Typography sx={{ color: C.textFaint, fontSize: "0.68rem" }}>the root · fixed supply 1</Typography>
              </Box>
              <Tooltip title={copied === "nut" ? "Copied" : "Copy NUT address"}>
                <Button
                  size="small"
                  onClick={() => copy(NUT, "nut")}
                  sx={{ minWidth: 0, color: copied === "nut" ? C.rootGlow : C.nutLight }}
                  aria-label="Copy NUT contract address"
                >
                  <ContentCopyIcon sx={{ fontSize: "1rem" }} />
                </Button>
              </Tooltip>
            </Paper>

            <Typography sx={{ color: C.rootGlow, fontWeight: 800, fontSize: "1.4rem" }} aria-hidden="true">+</Typography>

            {/* Pair side: dropdown or custom */}
            <Paper sx={{ background: C.card, border: "1px solid " + C.nut, borderRadius: "18px", p: 2 }}>
              <Select
                value={pairSym}
                displayEmpty
                onChange={(e) => setPairSym(e.target.value)}
                fullWidth
                renderValue={(val) => {
                  const t = PAIR_TOKENS.find((x) => x.sym === val);
                  if (!t) return <span style={{ color: C.textDim }}>select a token…</span>;
                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <span aria-hidden="true">{t.icon}</span>
                      <span style={{ color: C.rootGlow, fontWeight: 800 }}>{t.sym}</span>
                      <span style={{ color: C.textFaint, fontSize: "0.7rem" }}>{t.name}</span>
                    </Box>
                  );
                }}
                sx={{
                  "& .MuiSelect-select": { py: 0.75 },
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  "& svg": { color: C.nutLight },
                }}
                inputProps={{ "aria-label": "Select token to pair with NUT" }}
                MenuProps={{
                  PaperProps: { sx: { background: C.card, border: "1px solid " + C.nut, "& .MuiMenuItem-root": { color: C.textDim, "&:hover": { background: C.bgDark }, "&.Mui-selected": { background: C.bgDark, color: C.rootGlow } } } },
                }}
              >
                {PAIR_TOKENS.map((t) => (
                  <MenuItem key={t.sym} value={t.sym}>
                    {t.icon} {t.sym} — {t.name}
                  </MenuItem>
                ))}
                <MenuItem value="__custom__">🏷️ Custom — your own token</MenuItem>
              </Select>

              {pairSym === "__custom__" && (
                <TextField
                  fullWidth
                  size="small"
                  placeholder="paste your token address (0x…)"
                  value={customAddr}
                  onChange={(e) => setCustomAddr(e.target.value)}
                  error={customAddr.length > 0 && !customValid}
                  helperText={customAddr.length > 0 && !customValid ? "not a valid address" : " "}
                  sx={{
                    mt: 1,
                    "& .MuiOutlinedInput-root": { background: C.bgDark },
                    "& input": { color: C.textDim, fontFamily: "monospace", fontSize: "0.75rem" },
                    "& .MuiFormHelperText-root": { color: customAddr.length > 0 && !customValid ? "#ef9a9a" : "transparent" },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: C.nut },
                  }}
                />
              )}
            </Paper>
          </Box>

          {/* Row 2: venue */}
          <Typography sx={{ color: C.textFaint, fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", mt: 3, mb: 1.5 }}>
            Venue
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={venue}
            onChange={(e, val) => val && setVenue(val)}
            sx={{ width: "100%", "& .MuiToggleButton-root": { borderColor: C.nut, color: C.textDim, fontWeight: 700, py: 1.2, "&.Mui-selected": { background: C.nut, color: "#FFF7EA", "&:hover": { background: C.nut } }, "&:hover": { background: C.card } } }}
            aria-label="Select venue"
          >
            {Object.entries(VENUES).map(([key, val]) => (
              <ToggleButton key={key} value={key} sx={{ flex: 1 }}>
                {val.icon} {val.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Typography sx={{ color: C.textFaint, fontSize: "0.72rem", mt: 1 }}>{v.note}</Typography>

          {/* Row 3: CTA */}
          <Button
            fullWidth
            variant="contained"
            href={v.create}
            target="_blank"
            rel="noopener noreferrer"
            disabled={!pairAddr}
            sx={{
              mt: 3,
              py: 1.6,
              borderRadius: "999px",
              textTransform: "none",
              fontWeight: 800,
              fontSize: "1rem",
              background: pairAddr ? "linear-gradient(90deg, " + C.rootGlow + " 0%, " + C.gold + " 100%)" : C.nut,
              color: pairAddr ? C.bgDark : C.textFaint,
              "&:hover": { background: "linear-gradient(90deg, " + C.gold + " 0%, " + C.rootGlow + " 100%)", color: C.bgDark },
            }}
          >
            Create NUT / {pairLabel} on {v.label} →
          </Button>

          {venue === "uniswap" && v.create2 && (
            <Button
              fullWidth
              href={v.create2}
              target="_blank"
              rel="noopener noreferrer"
              disabled={!pairAddr}
              sx={{ mt: 1, color: C.nutLight, textTransform: "none", fontWeight: 600, "&:hover": { background: C.card } }}
            >
              or create a {v.create2Label} →
            </Button>
          )}

          {/* Secondary actions */}
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "center", mt: 2.5 }}>
            {pairAddr && (
              <Button size="small" onClick={() => copy(NUT, "nut2")} sx={{ color: copied === "nut2" ? C.rootGlow : C.nutLight, textTransform: "none" }}>
                {copied === "nut2" ? "NUT copied ✓" : "copy NUT address"}
              </Button>
            )}
            {pairAddr && (
              <Button size="small" onClick={() => copy(pairAddr, "pair")} sx={{ color: copied === "pair" ? C.rootGlow : C.nutLight, textTransform: "none" }}>
                {copied === "pair" ? pairLabel + " copied ✓" : "copy " + pairLabel + " address"}
              </Button>
            )}
            {venue === "aerodrome" && aeroScanUrl && (
              <Button size="small" href={aeroScanUrl} target="_blank" rel="noopener noreferrer" sx={{ color: C.nutLight, textTransform: "none" }}>
                scan existing NUT/{pairLabel} pools ↗
              </Button>
            )}
            {pairAddr && (
              <Button size="small" href={"https://basescan.org/token/" + pairAddr} target="_blank" rel="noopener noreferrer" sx={{ color: C.nutLight, textTransform: "none" }}>
                {pairLabel} on Basescan ↗
              </Button>
            )}
          </Box>

          <Typography sx={{ color: C.textFaint, fontSize: "0.7rem", textAlign: "center", mt: 2 }}>
            You fund both sides and set the starting price. Small amounts of ETH on Base needed for gas.
          </Typography>
        </Paper>

        {/* SAFETY — three chips, no essays */}
        <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap", mt: 3 }}>
          <Tooltip title="Type the domain yourself or use the button above. Look-alike domains and DNS hijacks are real.">
            <Chip label="🔍 check the domain" sx={{ bgcolor: "#FFF7EA", color: "#5B3A29", border: "1px solid #E8DCC8", fontWeight: 600 }} />
          </Tooltip>
          <Tooltip title={"Canonical NUT: " + NUT + " — same name is not enough, fakes copy names and icons."}>
            <Chip label="🌰 verify NUT contract" sx={{ bgcolor: "#FFF7EA", color: "#5B3A29", border: "1px solid #E8DCC8", fontWeight: 600 }} />
          </Tooltip>
          <Tooltip title="Confirm the pool pair, liquidity, and history on DexScreener or GeckoTerminal before committing.">
            <Chip label="🛡️ cross-check the pool" sx={{ bgcolor: "#FFF7EA", color: "#5B3A29", border: "1px solid #E8DCC8", fontWeight: 600 }} />
          </Tooltip>
        </Box>

        {/* ONE doctrine line + link */}
        <Box sx={{ textAlign: "center", mt: 4, mb: 2 }}>
          <Typography sx={{ color: "#7D5A50", fontSize: "0.9rem" }}>
            One conserved root, many price surfaces —{" "}
            <Link href="/token/nut" style={{ color: "#8B4513", fontWeight: 700 }}>
              read why →
            </Link>
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(93,64,55,0.55)", display: "block", mt: 2, maxWidth: 640, mx: "auto" }}>
            Experimental memefi. Not financial advice. LP risk is real: impermanent loss, contract risk, mispriced ranges.
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
}
