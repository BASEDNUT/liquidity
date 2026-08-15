import Head from "next/head";
import Link from "next/link";
import Layout from "../../components/Layout";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Divider,
  Grid,
} from "@mui/material";

// Orchard theme tokens
const BARK = "#5D3A1A";
const OAT = "#7D5A50";
const HONEY = "#A67C52";
const CREAM = "#F5E9DA";
const PARCHMENT = "#FFFDF7";
const MOSS = "#496A49";
const OCHRE = "#C68B36";

const PRINCIPLES = [
  {
    emoji: "🌍",
    title: "Emissions are a balance-sheet item",
    body: "Every ton of CO₂e disclosed is a real atmospheric liability. The Carbon Ledger treats reported Scope 1+2 emissions as ecological debt — not an externality, an obligation.",
  },
  {
    emoji: "⚖️",
    title: "Priced, not moralized",
    body: "Debt is denominated in a market reference — the EU ETS carbon benchmark. A ton becomes a dollar figure anyone can audit against a primary source.",
  },
  {
    emoji: "🔎",
    title: "Physical + market in one view",
    body: "Put the disclosed physical liability beside the issuer's live market valuation. The reader sees both what is emitted and how the market prices the emitter.",
  },
  {
    emoji: "🧾",
    title: "Provenance over narrative",
    body: "Every number links to its primary source — regulator filing, exchange quote, or benchmark print. Transparent math, honest caveats.",
  },
];

const LEDGER_LAYERS = [
  { step: "01", label: "Disclosure", desc: "Issuer reports Scope 1+2 emissions in a public filing." },
  { step: "02", label: "Denomination", desc: "Tons are priced against the current carbon benchmark." },
  { step: "03", label: "Clock", desc: "Liability accrues every second — debt is a rate, not a snapshot." },
  { step: "04", label: "Market overlay", desc: "Live equity quote shows how the market prices the emitter." },
  { step: "05", label: "Audit", desc: "Intensity and coverage ratios expose who is cheap or pricey per ton." },
];

const METRICS = [
  { label: "Reference price", value: "EU ETS", detail: "carbon benchmark" },
  { label: "Scope lens", value: "1 + 2", detail: "direct + energy emissions" },
  { label: "Accrual", value: "live", detail: "per-second liability" },
  { label: "Evidence", value: "linked", detail: "source beside every number" },
];

export default function CarbonDebt() {
  return (
    <Layout>
      <Head>
        <title>Carbon Debt Ledger — RWA | BASED NUT</title>
        <meta
          name="description"
          content="Emissions as ecological debt: a public ledger pricing Scope 1+2 disclosures against the EU ETS carbon benchmark, with live market overlay and primary-source provenance."
        />
      </Head>

      <Box sx={{ maxWidth: 1060, mx: "auto", px: 2, py: 5 }}>
        <Typography
          variant="overline"
          sx={{ color: HONEY, fontWeight: 800, letterSpacing: 2 }}
        >
          🏦 Real-World Assets
        </Typography>
        <Typography
          variant="h3"
          sx={{ color: BARK, fontWeight: 900, letterSpacing: -1, mb: 2 }}
        >
          The Carbon Debt Ledger.
        </Typography>
        <Typography sx={{ color: "#423B31", fontSize: "1.15rem", maxWidth: 760, mb: 4 }}>
          Emissions are not a footnote. They are a liability owed to the atmosphere. This
          ledger prices disclosed Scope 1+2 emissions against a live carbon benchmark and
          shows how the market values each emitter — physical debt and market price side by side.
        </Typography>

        <Grid container spacing={2} sx={{ mb: 5 }}>
          {METRICS.map((m) => (
            <Grid item xs={6} md={3} key={m.label}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: PARCHMENT,
                  border: "1px solid #D9CFBF",
                  borderRadius: 3,
                }}
              >
                <Typography sx={{ fontSize: "0.8rem", color: "#6B6254", mb: 0.5 }}>
                  {m.label}
                </Typography>
                <Typography sx={{ color: BARK, fontWeight: 800, fontSize: "1.35rem" }}>
                  {m.value}
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: MOSS }}>
                  {m.detail}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h5" sx={{ color: BARK, fontWeight: 800, mb: 2 }}>
          Core principles
        </Typography>
        <Stack spacing={2} sx={{ mb: 5 }}>
          {PRINCIPLES.map((p) => (
            <Paper
              key={p.title}
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: CREAM,
                borderLeft: `4px solid ${HONEY}`,
                borderRadius: 2,
              }}
            >
              <Typography sx={{ fontWeight: 800, color: BARK, mb: 0.5 }}>
                {p.emoji} {p.title}
              </Typography>
              <Typography sx={{ color: "#51483C", fontSize: "0.95rem" }}>
                {p.body}
              </Typography>
            </Paper>
          ))}
        </Stack>

        <Divider sx={{ my: 5, borderColor: "#D1B48C" }} />

        <Typography variant="h5" sx={{ color: BARK, fontWeight: 800, mb: 2 }}>
          How the ledger works
        </Typography>
        <Stack spacing={1.5}>
          {LEDGER_LAYERS.map((l) => (
            <Box
              key={l.step}
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "flex-start",
                p: 2,
                bgcolor: PARCHMENT,
                border: "1px solid #D9CFBF",
                borderRadius: 2,
              }}
            >
              <Chip
                label={l.step}
                size="small"
                sx={{
                  bgcolor: BARK,
                  color: "#FFF7EA",
                  fontWeight: 800,
                  mt: 0.5,
                }}
              />
              <Box>
                <Typography sx={{ fontWeight: 800, color: BARK }}>
                  {l.label}
                </Typography>
                <Typography sx={{ color: "#51483C", fontSize: "0.9rem" }}>
                  {l.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>

        <Paper
          elevation={0}
          sx={{
            mt: 5,
            p: 3,
            bgcolor: BARK,
            color: "#FFF7EA",
            borderRadius: 3,
          }}
        >
          <Typography sx={{ fontWeight: 800, mb: 1 }}>
            🌳 Why RWA matters here
          </Typography>
          <Typography sx={{ color: "#D9CDBB", fontSize: "0.93rem" }}>
            Carbon is the original real-world asset — physically measurable, economically
            consequential, and only now becoming machine-readable. The Carbon Debt Ledger is
            a proof of method: take a physical liability, price it transparently, and let
            anyone verify the arithmetic. That is the discipline the Orchard brings to every
            RWA experiment.
          </Typography>
        </Paper>

        <Box sx={{ mt: 5, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Link href="/rwa/nuts-production" passHref style={{ textDecoration: "none" }}>
            <Chip
              clickable
              label="🌰 America Runs on Nuts"
              sx={{ bgcolor: OAT, color: "#FFF", fontWeight: 700 }}
            />
          </Link>
          <Link href="/tree" passHref style={{ textDecoration: "none" }}>
            <Chip
              clickable
              label="🌳 Back to the Tree"
              sx={{ bgcolor: CREAM, color: BARK, fontWeight: 700, border: "1px solid #D1B48C" }}
            />
          </Link>
        </Box>
      </Box>
    </Layout>
  );
}
