import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import {
  Box, Typography, Paper, Chip, Stack, Grid, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Collapse,
} from "@mui/material";
import carbonData from "../../src/data/carbon-data.json";

const BARK = "#5D3A1A";
const OAT = "#7D5A50";
const HONEY = "#A67C52";
const CREAM = "#F5E9DA";
const PARCHMENT = "#FFFDF7";
const MOSS = "#496A49";
const OCHRE = "#C68B36";
const RUST = "#B3542E";

const PRICE_PER_T = carbonData.pricePerT;
const PRICE_AS_OF = carbonData.priceAsOf;
const PRICE_SOURCE = carbonData.priceSource || "";
const PRICE_NOTE = carbonData.priceNote || "";
const EMITTERS = carbonData.emitters;

const fmt = new Intl.NumberFormat("en-US");
const fmtUsd = (n) => "$" + fmt.format(Math.round(n));
const fmtUsdB = (n) => "$" + (n / 1e9).toFixed(1) + "B";
const fmtT = (n) => fmt.format(Math.round(n)) + " t";
const fmtPct = (n) => (n * 100).toFixed(1) + "%";

function totalScope12(e) { return e.scope1T + e.scope2T; }
function yearSeconds() {
  const y = new Date().getUTCFullYear();
  return (Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1)) / 1000;
}

// Verified aggregate context (CDP) — used in discussion, not per-row.
const CDP_CONTEXT = [
  { label: "Disclose reduction initiatives", value: "72%", note: "of companies reporting through CDP" },
  { label: "Align capex with transition", value: "11%", note: "of companies — the financing gap" },
  { label: "Commit to 100% renewables", value: "~1 in 9", note: "of studied companies" },
];

export default function CarbonExposurePage() {
  const [now, setNow] = useState(() => Date.now());
  const [quotes, setQuotes] = useState({});
  const [sort, setSort] = useState("debt");
  const [sortDir, setSortDir] = useState("desc");
  const [sector, setSector] = useState("All");
  const [open, setOpen] = useState({});

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch("/api/quotes")
      .then((r) => r.json())
      .then((j) => {
        const map = {};
        (j.quotes || []).forEach((q) => { map[q.ticker] = q; });
        setQuotes(map);
      })
      .catch(() => {});
  }, []);

  const ytd = useMemo(() => {
    const y = new Date().getUTCFullYear();
    return (now - Date.UTC(y, 0, 1)) / 1000 / yearSeconds();
  }, [now]);

  const rows = useMemo(() => {
    const enriched = EMITTERS.map((e) => {
      const scope12T = totalScope12(e);
      const annualDebt = scope12T * PRICE_PER_T;
      const greenCapex = e.greenCapexUsd || 0;
      const repayment = annualDebt > 0 ? greenCapex / annualDebt : 0;
      const coverage = e.marketCapUsd > 0 ? annualDebt / e.marketCapUsd : 0;
      const ratePerSec = annualDebt / yearSeconds();
      return { ...e, scope12T, annualDebt, greenCapex, repayment, coverage, ratePerSec };
    });
    const filtered = sector === "All" ? enriched : enriched.filter((r) => r.sector === sector);
    const dir = sortDir === "asc" ? 1 : -1;
    filtered.sort((a, b) => {
      switch (sort) {
        case "debt": return (a.annualDebt - b.annualDebt) * dir;
        case "rate": return (a.ratePerSec - b.ratePerSec) * dir;
        case "intensity": return (a.scope12T - b.scope12T) * dir;
        case "reinvest": return (a.greenCapex - b.greenCapex) * dir;
        case "repayment": return (a.repayment - b.repayment) * dir;
        case "coverage": return (a.coverage - b.coverage) * dir;
        case "name": return a.name.localeCompare(b.name) * dir;
        default: return 0;
      }
    });
    return filtered;
  }, [sort, sortDir, sector]);

  const totals = useMemo(() => {
    const annualT = EMITTERS.reduce((s, e) => s + totalScope12(e), 0);
    const annualDebt = annualT * PRICE_PER_T;
    const disclosed = EMITTERS.filter((e) => e.greenCapexUsd != null && e.greenCapexUsd > 0 && e.greenCapexTag === "ACTUAL");
    const reinvest = disclosed.reduce((s, e) => s + e.greenCapexUsd, 0);
    const disclosedDebt = disclosed.reduce((s, e) => s + totalScope12(e) * PRICE_PER_T, 0);
    return {
      annualT,
      annualDebt,
      reinvest,
      disclosedCount: disclosed.length,
      disclosedDebt,
      repaymentRatio: disclosedDebt > 0 ? reinvest / disclosedDebt : 0,
      unpaid: annualDebt - reinvest,
      ytdDebt: annualDebt * ytd,
      ytdT: annualT * ytd,
      ratePerSec: annualDebt / yearSeconds(),
    };
  }, [ytd]);

  const sectors = useMemo(() => [...new Set(EMITTERS.map((e) => e.sector))].sort(), []);
  const handleSort = (key) => {
    if (sort === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSort(key); setSortDir("desc"); }
  };
  const toggle = (ticker) => setOpen((o) => ({ ...o, [ticker]: !o[ticker] }));

  return (
    <Layout>
      <Head>
        <title>Environmental Balance Sheet — RWA | BASED NUT</title>
        <meta name="description" content="A transparent two-sided model: 42 companies' disclosed emissions priced at a reference carbon price, against their disclosed environmental reinvestment." />
      </Head>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, py: 5 }}>
        <Typography variant="overline" sx={{ color: HONEY, fontWeight: 800, letterSpacing: 2 }}>
          🏦 Real-World Assets
        </Typography>
        <Typography variant="h3" sx={{ color: BARK, fontWeight: 900, letterSpacing: -1, mb: 1, fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3rem" } }}>
          Environmental balance sheet
        </Typography>
        <Typography sx={{ color: "#423B31", fontSize: "1.1rem", maxWidth: 860, mb: 2 }}>
          Economic activity creates measurable environmental externalities. Carbon is one
          slice we can price consistently. This page puts two disclosed numbers side by
          side: the environmental pressure companies create, and the capital they direct
          toward reducing it. The gap between them is the open question.
        </Typography>
        <Box sx={{ mb: 4, px: 1 }}>
          <Typography sx={{ color: "#6B6254", fontSize: "0.9rem", lineHeight: 1.6 }}>
            <b style={{ color: BARK }}>🌍 Carbon is not the environment.</b> This balance sheet
            measures Scope 1+2 greenhouse-gas emissions — one consistently measurable
            externality. Water, land, biodiversity, waste and pollution matter too. Carbon
            is the first layer, not the whole picture.
          </Typography>
        </Box>

                {/* Hero: coherent dashboard */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 2, mb: 2 }}>
          <Box>
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: PARCHMENT, border: "1px solid #E3D9C8", borderLeft: "4px solid #5D3A1A", borderRadius: 2, width: "100%", minHeight: 166 }}>
              <Typography sx={{ color: BARK, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 800, mb: 1 }}>
                Modeled burden
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: "1.7rem", sm: "2rem" }, letterSpacing: -1, color: BARK, lineHeight: 1.1 }}>
                {fmtUsdB(totals.annualDebt)}
              </Typography>
              <Typography sx={{ color: "#8A7D6B", fontSize: "0.8rem", fontWeight: 700, mt: 0.25 }}>/ year</Typography>
              <Typography sx={{ color: "#6B6254", fontSize: "0.8rem", mt: 1 }}>
                {fmtT(totals.annualT)} Scope 1+2 × ${PRICE_PER_T}/t
              </Typography>
            </Paper>
          </Box>
          <Box>
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: PARCHMENT, border: "1px solid #E3D9C8", borderLeft: "4px solid #496A49", borderRadius: 2, width: "100%", minHeight: 166 }}>
              <Typography sx={{ color: MOSS, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 800, mb: 1 }}>
                Response investment
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: "1.7rem", sm: "2rem" }, letterSpacing: -1, color: BARK, lineHeight: 1.1 }}>
                {fmtUsdB(totals.reinvest)}
              </Typography>
              <Typography sx={{ color: "#8A7D6B", fontSize: "0.8rem", fontWeight: 700, mt: 0.25 }}>/ year</Typography>
              <Typography sx={{ color: "#6B6254", fontSize: "0.8rem", mt: 1 }}>
                ACTUAL annual low-carbon capex
              </Typography>
            </Paper>
          </Box>
          <Box>
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: PARCHMENT, border: "1px solid #E3D9C8", borderLeft: "4px solid #A67C52", borderRadius: 2, width: "100%", minHeight: 166 }}>
              <Typography sx={{ color: OAT, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 800, mb: 1 }}>
                Disclosure coverage
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: "1.7rem", sm: "2rem" }, letterSpacing: -1, color: BARK, lineHeight: 1.1 }}>
                {totals.disclosedCount} / {EMITTERS.length}
              </Typography>
              <Typography sx={{ color: "#8A7D6B", fontSize: "0.8rem", fontWeight: 700, mt: 0.25 }}>companies</Typography>
              <Typography sx={{ color: "#6B6254", fontSize: "0.8rem", mt: 1 }}>
                with comparable annual figures
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* Secondary row — quieter metrics, one unified panel */}
        <Paper elevation={0} sx={{ mb: 3, p: 2.5, bgcolor: "#FBF6EA", border: "1px solid #E3D9C8", borderRadius: 2 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" } }}>
            <Box sx={{ px: { xs: 0, md: 2 }, py: { xs: 1.5, md: 0 }, borderBottom: { xs: "1px solid #E3D9C8", md: "none" }, borderRight: { md: "1px solid #E3D9C8" }, "&:first-of-type": { pl: { md: 0 } }, "&:last-child": { borderRight: "none", borderBottom: "none", pr: { md: 0 } } }}>
              <Typography sx={{ color: "#8A7D6B", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>
                Comparable-company ratio
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: BARK, my: 0.5 }}>
                {fmtPct(totals.repaymentRatio)}
              </Typography>
              <Typography sx={{ color: "#8A7D6B", fontSize: "0.78rem" }}>
                among the {totals.disclosedCount} disclosing companies only
              </Typography>
            </Box>
            <Box sx={{ px: { xs: 0, md: 2 }, py: { xs: 1.5, md: 0 }, borderBottom: { xs: "1px solid #E3D9C8", md: "none" }, borderRight: { md: "1px solid #E3D9C8" }, "&:first-of-type": { pl: { md: 0 } }, "&:last-child": { borderRight: "none", borderBottom: "none", pr: { md: 0 } } }}>
              <Typography sx={{ color: "#8A7D6B", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>
                Unmatched modeled cost
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: RUST, my: 0.5 }}>
                {fmtUsdB(totals.unpaid)}
              </Typography>
              <Typography sx={{ color: "#8A7D6B", fontSize: "0.78rem" }}>
                upper bound — incomplete disclosure
              </Typography>
            </Box>
            <Box sx={{ px: { xs: 0, md: 2 }, py: { xs: 1.5, md: 0 }, borderBottom: { xs: "1px solid #E3D9C8", md: "none" }, borderRight: { md: "1px solid #E3D9C8" }, "&:first-of-type": { pl: { md: 0 } }, "&:last-child": { borderRight: "none", borderBottom: "none", pr: { md: 0 } } }}>
              <Typography sx={{ color: "#8A7D6B", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>
                Benchmark
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: BARK, my: 0.5 }}>
                ${PRICE_PER_T}/t
              </Typography>
              <Typography sx={{ color: "#8A7D6B", fontSize: "0.78rem" }}>
                fixed reference, not a damage estimate
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Annualized strip — three equal cards */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 2, mb: 3 }}>
          <Box>
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: PARCHMENT, border: "1px solid #E3D9C8", borderRadius: 2, width: "100%", minHeight: 104 }}>
              <Typography sx={{ color: "#8A7D6B", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700, mb: 1 }}>
                Modeled YTD burden
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: "1.3rem", color: BARK }}>{fmtUsd(totals.ytdDebt)}</Typography>
            </Paper>
          </Box>
          <Box>
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: PARCHMENT, border: "1px solid #E3D9C8", borderRadius: 2, width: "100%", minHeight: 104 }}>
              <Typography sx={{ color: "#8A7D6B", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700, mb: 1 }}>
                Annualized rate
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: "1.3rem", color: BARK }}>{fmtUsd(totals.ratePerSec)}/s</Typography>
            </Paper>
          </Box>
          <Box>
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: PARCHMENT, border: "1px solid #E3D9C8", borderRadius: 2, width: "100%", minHeight: 104 }}>
              <Typography sx={{ color: "#8A7D6B", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700, mb: 1 }}>
                Modeled YTD emissions
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: "1.3rem", color: BARK }}>{fmtT(totals.ytdT)}</Typography>
            </Paper>
          </Box>
        </Box>

        {/* Two-sided context */}
        <Paper elevation={0} sx={{ mb: 3, p: 3, bgcolor: "#FBF6EA", border: "1px solid #E3D9C8", borderRadius: 2 }}>
          <Typography sx={{ fontWeight: 800, color: BARK, mb: 2 }}>⚖️ Two sides, one question</Typography>
          <Typography sx={{ color: "#51483C", fontSize: "0.95rem", mb: 2 }}>
            Intent is abundant. Reinvestment is scarcer. CDP's aggregate data shows the gap
            between awareness and capital allocation across the whole economy:
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: { xs: 2, md: 3 } }}>
            {CDP_CONTEXT.map((c) => (
              <Box key={c.label}>
                <Typography sx={{ color: BARK, fontWeight: 900, fontSize: "1.4rem" }}>{c.value}</Typography>
                <Typography sx={{ color: "#6B6254", fontSize: "0.85rem", fontWeight: 700 }}>{c.label}</Typography>
                <Typography sx={{ color: "#8A7D6B", fontSize: "0.8rem" }}>{c.note}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

{/* Sector filter */}
        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}>
          <Chip label="All sectors" onClick={() => setSector("All")} sx={{ bgcolor: sector === "All" ? BARK : CREAM, color: sector === "All" ? "#FFF" : BARK, fontWeight: 700 }} />
          {sectors.map((s) => (
            <Chip key={s} label={s} onClick={() => setSector(s)} sx={{ bgcolor: sector === s ? BARK : CREAM, color: sector === s ? "#FFF" : BARK, fontWeight: 700 }} />
          ))}
        </Stack>

        {/* Table */}
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #D9CFBF", borderRadius: 3, overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: CREAM }}>
                <TableCell sx={{ fontWeight: 800, color: BARK }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 800, color: BARK }}>Sector</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: BARK }}>
                  <TableSortLabel active={sort === "debt"} direction={sortDir} onClick={() => handleSort("debt")}>Carbon burden</TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: BARK }}>
                  <TableSortLabel active={sort === "reinvest"} direction={sortDir} onClick={() => handleSort("reinvest")}>Reinvest</TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: BARK }}>
                  <TableSortLabel active={sort === "repayment"} direction={sortDir} onClick={() => handleSort("repayment")}>Reinvest %</TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: BARK }}>Source yr</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => {
                const q = quotes[r.ticker];
                const isOpen = !!open[r.ticker];
                return (
                  <>
                    <TableRow key={r.ticker} hover onClick={() => toggle(r.ticker)} sx={{ cursor: "pointer", "&:hover": { bgcolor: "#FBF6EA" } }}>
                      <TableCell sx={{ fontWeight: 700, color: BARK }}>
                        {r.name} <span style={{ color: "#9A8B7A", fontSize: "0.75rem" }}>({r.ticker})</span>
                      </TableCell>
                      <TableCell sx={{ color: "#51483C", fontSize: "0.85rem" }}>{r.sector}</TableCell>
                      <TableCell align="right" sx={{ color: OAT, fontWeight: 700 }}>{fmtUsd(r.annualDebt)}</TableCell>
                      <TableCell align="right" sx={{ color: r.greenCapex > 0 ? MOSS : "#9A8B7A", fontWeight: 700 }}>
                        {r.greenCapex > 0 ? <Box><span>{fmtUsd(r.greenCapex)}</span><span style={{ color: "#9A8B7A", fontSize: "0.7rem", display: "block" }}>{r.greenCapexTag}</span></Box> : "n/d"}
                      </TableCell>
                      <TableCell align="right" sx={{ color: r.repayment > 0.5 ? MOSS : RUST, fontWeight: 700 }}>
                        {r.greenCapex > 0 && r.greenCapexTag === "ACTUAL" ? fmtPct(r.repayment) : "—"}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "#51483C", fontSize: "0.85rem" }}>{r.reportingYear}</TableCell>
                    </TableRow>
                    <TableRow key={r.ticker + "-detail"}>
                      <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 3, bgcolor: PARCHMENT }}>
                            <Typography sx={{ fontWeight: 800, color: BARK, mb: 1 }}>{r.name} — disclosure detail</Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Typography sx={{ color: "#51483C", fontSize: "0.9rem", mb: 1 }}>{r.description}</Typography>
                                <Typography sx={{ color: "#51483C", fontSize: "0.9rem", mb: 1 }}><b style={{ color: OAT }}>Emissions narrative:</b> {r.emissionsNarrative}</Typography>
                                <Typography sx={{ color: "#51483C", fontSize: "0.9rem" }}><b style={{ color: MOSS }}>Climate commitments (as disclosed):</b> {r.climateCommitments}</Typography>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Typography sx={{ color: BARK, fontWeight: 800, fontSize: "0.85rem", mb: 1 }}>Modeled balance (FY{r.reportingYear})</Typography>
                                <Typography sx={{ color: "#51483C", fontSize: "0.85rem" }}>Scope 1 · direct: {fmtT(r.scope1T)}</Typography>
                                <Typography sx={{ color: "#51483C", fontSize: "0.85rem" }}>Scope 2 · purchased energy: {fmtT(r.scope2T)}</Typography>
                                <Typography sx={{ color: "#51483C", fontSize: "0.85rem" }}>Scope 3 · value chain: {fmtT(r.scope3T)} (excluded from model)</Typography>
                                <Typography sx={{ color: OAT, fontWeight: 700, fontSize: "0.85rem", mt: 1 }}>Modeled carbon burden: {fmtUsd(r.annualDebt)}</Typography>
                                <Typography sx={{ color: MOSS, fontWeight: 700, fontSize: "0.85rem" }}>
                                  Response investment: {r.greenCapex > 0 ? fmtUsd(r.greenCapex) + " (" + r.greenCapexYear + ")" : "not disclosed"}
                                </Typography>
                                {r.greenCapex > 0 && (
                                  <Typography sx={{ color: "#51483C", fontSize: "0.82rem" }}>{r.greenCapexNote} — {r.greenCapexSource}</Typography>
                                )}
                                <Typography sx={{ color: "#51483C", fontSize: "0.85rem", mt: 0.5 }}>
                                  Boundary: {r.boundary || "not stated"} · Scope 2: {r.scope2Method || "not stated"}
                                </Typography>
                                <Typography sx={{ color: "#51483C", fontSize: "0.85rem" }}>Market cap: {fmtUsd(r.marketCapUsd)} · Revenue: {fmtUsd(r.revenueUsd)}</Typography>
                                <Typography sx={{ color: "#51483C", fontSize: "0.85rem" }}>HQ: {r.hqCountry} · Exchange: {r.exchange}</Typography>
                                {r.dataNote && <Typography sx={{ color: "#B00020", fontSize: "0.8rem", mt: 0.5 }}>⚠ {r.dataNote}</Typography>}
                                <Box sx={{ mt: 1.5 }}>
                                  {r.references.map((ref) => (
                                    <Link key={ref.url} href={ref.url} passHref>
                                      <Typography component="a" target="_blank" rel="noopener" sx={{ display: "block", color: MOSS, fontSize: "0.8rem", textDecoration: "underline", mb: 0.5 }}>
                                        {ref.label} ↗
                                      </Typography>
                                    </Link>
                                  ))}
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

                        {/* Deep discussion */}
        <Paper elevation={0} sx={{ mt: 4, p: { xs: 3, md: 5 }, bgcolor: PARCHMENT, color: "#423B31", border: "1px solid #E3D9C8", borderRadius: 2 }}>
          <Typography sx={{ fontWeight: 900, fontSize: "1.5rem", color: BARK, mb: 1 }}>
            🧠 What these numbers do — and don't — mean
          </Typography>
          <Typography sx={{ color: "#51483C", fontSize: "0.9rem", mb: 3.5 }}>
            Five caveats that keep this page honest.
          </Typography>

          <Box sx={{ mb: 3.5, pb: 3.5, borderBottom: "1px solid #E3D9C8" }}>
            <Typography sx={{ color: BARK, fontWeight: 800, fontSize: "1rem", mb: 1 }}>1. It is a model, not a measurement.</Typography>
            <Typography sx={{ color: "#51483C", fontSize: "0.95rem", lineHeight: 1.8 }}>
              The YTD clock does not measure this year's emissions. It takes each company's
              most recent disclosed annual Scope 1+2 figure and divides it evenly across the
              year — an annualized rate, not a live sensor. Real emissions change year to year.
            </Typography>
          </Box>

          <Box sx={{ mb: 3.5, pb: 3.5, borderBottom: "1px solid #E3D9C8" }}>
            <Typography sx={{ color: BARK, fontWeight: 800, fontSize: "1rem", mb: 1 }}>2. The price is a benchmark, not a damage estimate.</Typography>
            <Typography sx={{ color: "#51483C", fontSize: "0.95rem", lineHeight: 1.8 }}>
              We are not claiming one tonne causes ${PRICE_PER_T} of harm. ${PRICE_PER_T}/t is a
              fixed reference benchmark ({PRICE_SOURCE}) used to translate emissions onto a
              comparable financial scale. It is explicitly a fixed baseline, not a live price.
            </Typography>
          </Box>

          <Box sx={{ mb: 3.5, pb: 3.5, borderBottom: "1px solid #E3D9C8" }}>
            <Typography sx={{ color: BARK, fontWeight: 800, fontSize: "1rem", mb: 1 }}>3. Emissions are self-reported and imperfect.</Typography>
            <Typography sx={{ color: "#51483C", fontSize: "0.95rem", lineHeight: 1.8 }}>
              Every figure comes from the company's own disclosure (CDP, TCFD, or
              sustainability reports). Scope 2 has two legitimate methods — location-based and
              market-based — that give different numbers. Organizational boundary (equity vs
              operated) also changes the total. Scope 3 is shown but excluded because
              accounting varies too much to compare fairly. Where we corrected an error, it
              is flagged in the row.
            </Typography>
          </Box>

          <Box sx={{ mb: 3.5, pb: 3.5, borderBottom: "1px solid #E3D9C8" }}>
            <Typography sx={{ color: BARK, fontWeight: 800, fontSize: "1rem", mb: 1 }}>4. The unmatched figure is an upper bound, not a floor.</Typography>
            <Typography sx={{ color: "#51483C", fontSize: "0.95rem", lineHeight: 1.8 }}>
              Only {totals.disclosedCount} of {EMITTERS.length} companies disclose comparable
              ACTUAL annual low-carbon investment. If the rest invested undisclosed sums, the
              true gap would shrink. The "unmatched" number is therefore the maximum observable
              gap given available data — not a floor, and not an estimate of any true net balance.
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ color: BARK, fontWeight: 800, fontSize: "1rem", mb: 1 }}>5. Where does the reinvestment go?</Typography>
            <Typography sx={{ color: "#51483C", fontSize: "0.95rem", lineHeight: 1.8 }}>
              Measuring the gap is only useful if capital can be directed toward measurable
              environmental outcomes. Renewable infrastructure, efficiency, ecosystem
              restoration, carbon removal, regenerative agriculture — these are different ways
              of turning investment into physical change. The harder problem is proving what
              happened: where the money went, what changed, how much impact was produced, and
              whether it would have occurred anyway. A verified environmental sink is one
              mechanism for closing that loop — it converts capital into measurable recovery.
            </Typography>
          </Box>
        </Paper>

{/* Methodology */}
        <Paper elevation={0} sx={{ mt: 4, p: 3, bgcolor: CREAM, borderLeft: "4px solid #C68B36", borderRadius: 2 }}>
          <Typography sx={{ fontWeight: 800, color: BARK, mb: 1 }}>🧾 Methodology & provenance</Typography>
          <Typography sx={{ color: "#51483C", fontSize: "0.93rem", mb: 1 }}>
            Modeled carbon burden = Scope 1+2 (tCO₂e) × ${PRICE_PER_T}/t fixed reference
            benchmark. Environmental response investment = disclosed low-carbon capex
            (renewables, CCS, hydrogen, efficiency), shown with a tag: ACTUAL, BUDGET,
            TARGET, or MULTI-YEAR. Only ACTUAL annual figures enter the aggregates and the
            reinvestment ratio; budgeted and multi-year figures are shown in the table but
            never combined into the same total. "Unmatched modeled carbon cost" = total
            burden − captured ACTUAL investment — an upper bound given incomplete
            disclosure, not a true net estimate.
          </Typography>
          <Typography sx={{ color: "#51483C", fontSize: "0.93rem", mb: 1 }}>
            Sources per company: CDP Climate Change disclosures, TCFD-aligned
            sustainability reports, and SEC / national-regulator filings. Each row links to
            its primary document. Reporting year, organizational boundary, and Scope 2
            method are shown per row where stated.
          </Typography>
          <Typography sx={{ color: "#51483C", fontSize: "0.93rem" }}>
            Not investment advice. Not an accounting of any real obligation. A transparent
            thought experiment with its limitations stated openly.
          </Typography>
        </Paper>

        <Box sx={{ mt: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Link href="/rwa/nuts-production" passHref style={{ textDecoration: "none" }}>
            <Chip clickable label="🌰 US Nut Economy" sx={{ bgcolor: OAT, color: "#FFF", fontWeight: 700 }} />
          </Link>
          <Link href="/tree" passHref style={{ textDecoration: "none" }}>
            <Chip clickable label="🌳 Back to the Tree" sx={{ bgcolor: CREAM, color: BARK, fontWeight: 700, border: "1px solid #D1B48C" }} />
          </Link>
        </Box>
      </Box>
    </Layout>
  );
}
