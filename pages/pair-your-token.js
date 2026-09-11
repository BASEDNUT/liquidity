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

// ── Full verified pair registry (on-chain truth, July 29 2026) ──
const PAIR_TABLE = [
  { sym: "wETH", icon: "💎", addr: "0x4200000000000000000000000000000000000006", name: "Wrapped Ether", venues: "Uniswap V3 + V2 + CL", tvl: "$11.0k", largest: "UniV3 $9.1k" },
  { sym: "AERO", icon: "🛫", addr: "0x940181a94a35a4569e4529a3cdfb74e38fd98631", name: "Aerodrome", venues: "Aerodrome", tvl: "$481", largest: "—" },
  { sym: "cbBTC", icon: "🟠", addr: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf", name: "Coinbase BTC", venues: "Aerodrome", tvl: "$174", largest: "—" },
  { sym: "cbETH", icon: "🔵", addr: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22", name: "Coinbase Staked ETH", venues: "Aerodrome", tvl: "$120", largest: "—" },
  { sym: "NULL", icon: "⚫", addr: "0x0a14ef61afb32e5ca672e021784f71705ac14908", name: "NULL", venues: "Uniswap V3", tvl: "$297", largest: "—" },
  { sym: "CHAD", icon: "💪", addr: "0xecaf81eb42cd30014eb44130b89bcd6d4ad98b92", name: "CHAD", venues: "Aerodrome", tvl: "$38", largest: "—" },
  { sym: "USD+", icon: "➕", addr: "0xb79dd08ea68a908a97220c76d19a6aa9cbde4376", name: "USD+ (Native USD)", venues: "Aerodrome", tvl: "$87", largest: "—" },
  { sym: "sFRAX", icon: "🌾", addr: "0xe4796ccb6bb5de2290c417ac337f2b66ca2e770e", name: "Staked FRAX", venues: "Aerodrome", tvl: "$85", largest: "—" },
];

const INNER_PAIRS = [
  { sym: "SNUT", note: "rewards branch — Aerodrome $1.1k" },
  { sym: "PIPS", note: "agent economy — Slipstream $571" },
  { sym: "SALT", note: "bonding curve — Mint Club" },
  { sym: "NUTINO", note: "bonding curve — Mint Club" },
];

const NFT_CURVES = ["PNUTS 251 Generals", "ALMD 424 Almond Generals", "SALMD 6,238 Soldiers", "PNUTRMY 5,013 Soldiers"];

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

        {/* ══ FULL PAIR TABLE — every token already paired with NUT (on-chain truth) ══ */}
        <Box sx={{ maxWidth: "md", mx: "auto", mt: 6 }}>
          <Typography variant="h5" sx={{ color: "#5B3A29", fontWeight: 900, mb: 0.5, textAlign: "center" }}>
            📜 Already paired with NUT
          </Typography>
          <Typography sx={{ color: "#7D5A50", fontSize: "0.85rem", textAlign: "center", mb: 2 }}>
            Eight external tokens, ten live pools. Your token joins this table — and this topology.
          </Typography>
          <Paper elevation={3} sx={{ borderRadius: "18px", overflow: "hidden", border: "1px solid #E8DCC8" }}>
            {PAIR_TABLE.map((row) => (
              <Box
                key={row.sym}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1.1fr 1.3fr 0.8fr", sm: "1.2fr 1.6fr 0.8fr 0.7fr" },
                  alignItems: "center",
                  gap: 1,
                  px: { xs: 1.5, sm: 2.5 },
                  py: 1.4,
                  borderBottom: "1px solid #F0E4D4",
                  "&:hover": { background: "#FFF3DD" },
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                  <Box component="span" aria-hidden="true" sx={{ fontSize: "1.15rem" }}>{row.icon}</Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography component="a" href={"https://basescan.org/token/" + row.addr} target="_blank" rel="noopener noreferrer" sx={{ color: "#5B3A29", fontWeight: 800, fontSize: "0.95rem", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                      {row.sym}
                    </Typography>
                    <Typography sx={{ color: "#9B7B6E", fontSize: "0.65rem", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.name}</Typography>
                  </Box>
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: "#7D5A50", fontSize: "0.75rem", fontWeight: 700 }}>{row.venues}</Typography>
                  <Typography sx={{ color: "#A08B7E", fontSize: "0.62rem", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.addr}</Typography>
                </Box>
                <Typography sx={{ color: "#5B3A29", fontWeight: 800, fontSize: "0.85rem", textAlign: "right" }}>{row.tvl}</Typography>
                <Typography sx={{ color: "#9B7B6E", fontSize: "0.65rem", textAlign: "right", display: { xs: "none", sm: "block" } }}>{row.largest}</Typography>
              </Box>
            ))}
          </Paper>
          <Typography variant="caption" sx={{ color: "rgba(93,64,55,0.55)", display: "block", textAlign: "center", mt: 1 }}>
            TVL as verified on-chain July 29, 2026. Live values on the <Link href="/" style={{ color: "#8B4513", fontWeight: 700 }}>home board</Link>.
          </Typography>

          {/* Ecosystem pairings — inner tokens, separate from external soil */}
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography sx={{ color: "#5B3A29", fontWeight: 900, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: 1, mb: 1 }}>
              Ecosystem pairings (inner tokens)
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center", mb: 1 }}>
              {INNER_PAIRS.map((t) => (
                <Tooltip key={t.sym} title={t.note}>
                  <Chip label={t.sym} size="small" sx={{ bgcolor: "#FFF7EA", color: "#5B3A29", border: "1px solid #E8DCC8", fontWeight: 700 }} />
                </Tooltip>
              ))}
            </Box>
            <Typography variant="caption" sx={{ color: "rgba(93,64,55,0.6)", display: "block" }}>
              + NFT bonding curves on Mint Club: {NFT_CURVES.join(" · ")}
            </Typography>
          </Box>
        </Box>

        {/* ══ TOPOLOGY GRAPHIC — what pairing changes ══ */}
        <Box sx={{ maxWidth: "md", mx: "auto", mt: 6 }}>
          <Typography variant="h5" sx={{ color: "#5B3A29", fontWeight: 900, mb: 0.5, textAlign: "center" }}>
            🔺 What pairing does to the topology
          </Typography>
          <Typography sx={{ color: "#7D5A50", fontSize: "0.85rem", textAlign: "center", mb: 2 }}>
            Your token does not join a family. It gains a route. New edge → new ring → everything reachable from NUT becomes reachable from you.
          </Typography>
          <Paper elevation={3} sx={{ borderRadius: "18px", border: "1px solid #E8DCC8", p: { xs: 1.5, sm: 3 }, background: "#FFFDF5" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: { xs: 1, sm: 2 }, alignItems: "center" }}>
              {/* BEFORE — XYZ isolated */}
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ color: "#9B7B6E", fontSize: "0.65rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.2, mb: 1 }}>before — isolated</Typography>
                <svg viewBox="0 0 220 170" role="img" aria-label="XYZ token isolated, no route to the Orchard" style={{ width: "100%", maxWidth: 220 }}>
                  <circle cx="110" cy="40" r="24" fill="#FFF7EA" stroke="#C8A27A" strokeWidth="2" />
                  <text x="110" y="45" textAnchor="middle" fontSize="12" fontWeight="900" fill="#5B3A29">XYZ</text>
                  <g opacity="0.85">
                    <circle cx="110" cy="135" r="30" fill="#E8DCC8" stroke="#B89B7E" strokeWidth="2" />
                    <text x="110" y="132" textAnchor="middle" fontSize="11" fontWeight="900" fill="#5B3A29">🌰 NUT</text>
                    <text x="110" y="146" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#7D5A50">the root</text>
                    <circle cx="38" cy="110" r="13" fill="#FFF7EA" stroke="#C8A27A" strokeWidth="1.5" />
                    <text x="38" y="113" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#7D5A50">wETH</text>
                    <circle cx="182" cy="110" r="13" fill="#FFF7EA" stroke="#C8A27A" strokeWidth="1.5" />
                    <text x="182" y="113" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#7D5A50">AERO</text>
                    <circle cx="30" cy="152" r="11" fill="#FFF7EA" stroke="#C8A27A" strokeWidth="1.5" />
                    <text x="30" y="155" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#7D5A50">cbBTC</text>
                    <circle cx="190" cy="152" r="11" fill="#FFF7EA" stroke="#C8A27A" strokeWidth="1.5" />
                    <text x="190" y="155" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#7D5A50">SNUT</text>
                    <line x1="110" y1="108" x2="48" y2="102" stroke="#B89B7E" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="138" y1="112" x2="171" y2="110" stroke="#B89B7E" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="86" y1="126" x2="40" y2="144" stroke="#B89B7E" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                    <line x1="136" y1="126" x2="181" y2="144" stroke="#B89B7E" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                  </g>
                  <line x1="110" y1="65" x2="110" y2="104" stroke="#D4A676" strokeWidth="2" strokeDasharray="4 5" opacity="0.7" />
                  <text x="110" y="88" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#A08B7E">no route</text>
                </svg>
              </Box>

              <Box sx={{ textAlign: "center", px: 1 }}>
                <Typography sx={{ color: "#8B5A2B", fontWeight: 900, fontSize: "0.8rem", lineHeight: 1.3 }}>
                  pair<br />XYZ/🌰<br />↓
                </Typography>
              </Box>

              {/* AFTER — XYZ connected, rings close */}
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ color: "#5B3A29", fontSize: "0.65rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.2, mb: 1 }}>after — connected</Typography>
                <svg viewBox="0 0 220 170" role="img" aria-label="XYZ token connected to NUT, new ring routes through the Orchard" style={{ width: "100%", maxWidth: 220 }}>
                  <g opacity="0.9">
                    <circle cx="110" cy="38" r="26" fill="#FFF3DD" stroke="#8B5A2B" strokeWidth="2.5" />
                    <text x="110" y="43" textAnchor="middle" fontSize="12" fontWeight="900" fill="#5B3A29">XYZ</text>
                    <circle cx="110" cy="130" r="30" fill="#E8DCC8" stroke="#B89B7E" strokeWidth="2" />
                    <text x="110" y="127" textAnchor="middle" fontSize="11" fontWeight="900" fill="#5B3A29">🌰 NUT</text>
                    <text x="110" y="141" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#7D5A50">the root</text>
                    <circle cx="36" cy="106" r="13" fill="#FFF7EA" stroke="#C8A27A" strokeWidth="1.5" />
                    <text x="36" y="109" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#7D5A50">wETH</text>
                    <circle cx="184" cy="106" r="13" fill="#FFF7EA" stroke="#C8A27A" strokeWidth="1.5" />
                    <text x="184" y="109" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#7D5A50">AERO</text>
                    <circle cx="28" cy="150" r="11" fill="#FFF7EA" stroke="#C8A27A" strokeWidth="1.5" />
                    <text x="28" y="153" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#7D5A50">cbBTC</text>
                    <circle cx="192" cy="150" r="11" fill="#FFF7EA" stroke="#C8A27A" strokeWidth="1.5" />
                    <text x="192" y="153" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#7D5A50">SNUT</text>
                    <line x1="110" y1="64" x2="110" y2="100" stroke="#8B5A2B" strokeWidth="3" strokeLinecap="round" />
                    <text x="126" y="84" fontSize="7" fontWeight="900" fill="#8B5A2B">new edge</text>
                    <line x1="110" y1="108" x2="46" y2="99" stroke="#B89B7E" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="139" y1="108" x2="173" y2="101" stroke="#B89B7E" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="85" y1="124" x2="37" y2="142" stroke="#B89B7E" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                    <line x1="136" y1="124" x2="183" y2="142" stroke="#B89B7E" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                    <path d="M110 66 C70 70 44 80 40 96 C36 112 60 130 84 128 C104 126 108 118 110 108" fill="none" stroke="#D4A676" strokeWidth="1.8" strokeDasharray="5 5" opacity="0.85" />
                    <path d="M110 66 C150 70 176 80 180 96 C184 112 160 130 136 128 C116 126 112 118 110 108" fill="none" stroke="#D4A676" strokeWidth="1.8" strokeDasharray="5 5" opacity="0.85" />
                  </g>
                  <text x="110" y="164" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#8B5A2B">ring routes open — arb keeps them honest</text>
                </svg>
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: "rgba(93,64,55,0.6)", display: "block", textAlign: "center", mt: 2 }}>
              See the live topology: <Link href="/atlas" style={{ color: "#8B4513", fontWeight: 700 }}>Orchard Atlas</Link> · <Link href="/atlas/data" style={{ color: "#8B4513", fontWeight: 700 }}>Atlas Data</Link> · deeper reading in the{" "}<Link href="https://docs.basednut.com/liquidity/the-orchard-framework" style={{ color: "#8B4513", fontWeight: 700 }}>Orchard Framework docs</Link>
            </Typography>
          </Paper>
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
