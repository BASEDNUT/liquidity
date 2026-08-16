import Head from "next/head";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
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
  const [now, setNow] = useState(null);
  const [quotes, setQuotes] = useState({});
  const [sort, setSort] = useState("debt");
  const [sortDir, setSortDir] = useState("desc");
  const [sector, setSector] = useState("All");
  const [open, setOpen] = useState({});

  useEffect(() => {
    setNow(Date.now());
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
    if (now === null) return 0;
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
        <Paper elevation={0} sx={{ mb: 4, overflow: "hidden", bgcolor: PARCHMENT, border: "1px solid #E3D9C8", borderRadius: 3 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "104px minmax(0, 1fr)" }, gap: { xs: 2, md: 3 }, p: { xs: 3, md: 4 }, alignItems: "center" }}>
            <Box sx={{ width: 76, height: 76, borderRadius: "50%", bgcolor: CREAM, border: "1px solid #D1B48C", display: "grid", placeItems: "center", fontSize: "2.6rem", transform: { md: "rotate(-8deg)" } }}>🌰</Box>
            <Box>
              <Typography variant="overline" sx={{ color: HONEY, fontWeight: 800, letterSpacing: 2 }}>
                🏦 Real-World Assets · The Orchard Ledger
              </Typography>
              <Typography variant="h3" sx={{ color: BARK, fontWeight: 900, letterSpacing: -1, mb: 1, fontSize: { xs: "1.9rem", sm: "2.5rem", md: "3.15rem" }, lineHeight: 1.05 }}>
                Environmental balance sheet
              </Typography>
              <Typography sx={{ color: "#423B31", fontSize: { xs: "1rem", md: "1.1rem" }, maxWidth: 820, lineHeight: 1.6 }}>
                Every industrial system leaves a mark. This ledger places one measurable mark beside one disclosed response: operational emissions, translated at a fixed carbon-market benchmark, and capital directed toward lower-carbon infrastructure.
              </Typography>
            </Box>
          </Box>
          <Box sx={{ px: { xs: 3, md: 4 }, py: 2, bgcolor: "#FBF6EA", borderTop: "1px solid #E3D9C8", display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr auto" }, gap: 2, alignItems: "center" }}>
            <Typography sx={{ color: "#51483C", fontSize: "0.92rem", lineHeight: 1.55 }}>
              <b style={{ color: BARK }}>How to read it:</b> Scope 1+2 emissions × a fixed ${PRICE_PER_T}/t benchmark = modeled burden. That is compared with disclosed environmental response capital. It is a common financial scale — not a damage invoice or an offset claim.
            </Typography>
            <Typography sx={{ color: MOSS, fontSize: "0.82rem", fontWeight: 800, whiteSpace: { md: "nowrap" } }}>🌱 pressure → capital → outcome</Typography>
          </Box>
        </Paper>

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
                  <Fragment key={r.ticker}>
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
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* After the table: interpretation */}
        <Paper elevation={0} sx={{ mt: 5, p: { xs: 3, md: 4 }, bgcolor: PARCHMENT, border: "1px solid #E3D9C8", borderRadius: 3 }}>
          <Typography variant="overline" sx={{ color: HONEY, fontWeight: 800, letterSpacing: 1.6 }}>After the ledger</Typography>
          <Typography sx={{ color: BARK, fontWeight: 900, fontSize: { xs: "1.45rem", md: "1.85rem" }, lineHeight: 1.15, mb: 1 }}>
            The number is a signal. The outcome is the question.
          </Typography>
          <Typography sx={{ color: "#51483C", fontSize: "1rem", lineHeight: 1.7, maxWidth: 900, mb: 3.5 }}>
            This page does not rank the world&apos;s most damaging companies, and it does not say capital spending repairs past emissions dollar-for-dollar. It compares one consistently reported layer of operational pressure with what companies disclose about their response. The missing link is physical proof: what changed because the money moved?
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
            <Box sx={{ pr: { md: 2 }, borderRight: { md: "1px solid #E3D9C8" } }}>
              <Typography sx={{ fontSize: "1.5rem", mb: 0.5 }}>🏭</Typography>
              <Typography sx={{ color: BARK, fontWeight: 800, mb: 0.75 }}>1. Environmental pressure</Typography>
              <Typography sx={{ color: "#51483C", fontSize: "0.9rem", lineHeight: 1.65 }}>The burden column is disclosed Scope 1+2 emissions translated onto the same fixed ${PRICE_PER_T}/t reference scale. It excludes Scope 3, water, land, waste and biodiversity.</Typography>
            </Box>
            <Box sx={{ px: { md: 2 }, borderRight: { md: "1px solid #E3D9C8" } }}>
              <Typography sx={{ fontSize: "1.5rem", mb: 0.5 }}>🌱</Typography>
              <Typography sx={{ color: MOSS, fontWeight: 800, mb: 0.75 }}>2. Response capital</Typography>
              <Typography sx={{ color: "#51483C", fontSize: "0.9rem", lineHeight: 1.65 }}>The investment column records what a company discloses for transition, prevention, abatement or restoration. ACTUAL figures enter totals; BUDGET, TARGET and MULTI-YEAR figures remain visible but separate.</Typography>
            </Box>
            <Box sx={{ pl: { md: 2 } }}>
              <Typography sx={{ fontSize: "1.5rem", mb: 0.5 }}>🌳</Typography>
              <Typography sx={{ color: BARK, fontWeight: 800, mb: 0.75 }}>3. Verified outcome</Typography>
              <Typography sx={{ color: "#51483C", fontSize: "0.9rem", lineHeight: 1.65 }}>Spending is not restitution. The durable question is where the dollar went, what changed in the physical world, and whether the result can be measured and verified.</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Compact methodology */}
        <Paper elevation={0} sx={{ mt: 3, p: { xs: 3, md: 4 }, bgcolor: CREAM, borderLeft: "4px solid #C68B36", borderRadius: 2 }}>
          <Typography sx={{ fontWeight: 900, color: BARK, fontSize: "1.2rem", mb: 0.5 }}>🧾 The short methodology</Typography>
          <Typography sx={{ color: "#6B6254", fontSize: "0.9rem", mb: 2.5 }}>Three rules keep the ledger useful — and honest.</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
            <Box sx={{ pr: { md: 2 }, borderRight: { md: "1px solid #D9CFBF" } }}>
              <Typography sx={{ color: BARK, fontWeight: 800, mb: 0.5 }}>Fixed benchmark</Typography>
              <Typography sx={{ color: "#51483C", fontSize: "0.88rem", lineHeight: 1.6 }}>${PRICE_PER_T}/t is a fixed carbon-market reference from {PRICE_SOURCE}. It is not a claim that each tonne causes ${PRICE_PER_T} of damage.</Typography>
            </Box>
            <Box sx={{ px: { md: 2 }, borderRight: { md: "1px solid #D9CFBF" } }}>
              <Typography sx={{ color: BARK, fontWeight: 800, mb: 0.5 }}>Comparable disclosures</Typography>
              <Typography sx={{ color: "#51483C", fontSize: "0.88rem", lineHeight: 1.6 }}>Rows use company disclosures and link to their primary sources. Scope 1+2 is comparable enough to begin; Scope 3 is shown in details but excluded from totals.</Typography>
            </Box>
            <Box sx={{ pl: { md: 2 } }}>
              <Typography sx={{ color: BARK, fontWeight: 800, mb: 0.5 }}>Incomplete capital data</Typography>
              <Typography sx={{ color: "#51483C", fontSize: "0.88rem", lineHeight: 1.6 }}>Only ACTUAL annual response capital enters aggregates. Missing disclosure can shrink the observable gap; none of these figures is a legal obligation or investment advice.</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
}
