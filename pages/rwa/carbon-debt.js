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

const PRICE_PER_T = carbonData.pricePerT;
const PRICE_CURRENCY = carbonData.priceCurrency || "EUR";
const PRICE_AS_OF = carbonData.priceAsOf;
const PRICE_SOURCE = carbonData.priceSource || "";
const PRICE_NOTE = carbonData.priceNote || "";
const EMITTERS = carbonData.emitters;

const fmt = new Intl.NumberFormat("en-US");
const fmtUsd = (n) => "$" + fmt.format(Math.round(n));
const fmtEur = (n) => "€" + fmt.format(Math.round(n));
const fmtT = (n) => fmt.format(Math.round(n)) + " t";
const fmtMoney = (n) => PRICE_CURRENCY === "EUR" ? fmtEur(n) : fmtUsd(n);

function totalScope12(e) { return e.scope1T + e.scope2T; }
function yearSeconds() {
  const y = new Date().getUTCFullYear();
  return (Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1)) / 1000;
}

// Verified aggregate context (CDP, 2024-2025) — used in the discussion, not per-row.
const CDP_CONTEXT = [
  { label: "Disclose reduction initiatives", value: "72%", note: "of companies reporting through CDP" },
  { label: "Align capex with transition", value: "11%", note: "of companies — the financing gap" },
  { label: "Commit to 100% renewables", value: "~1 in 9", note: "of studied companies" },
];

export default function CarbonExposurePage() {
  const [now, setNow] = useState(() => Date.now());
  const [quotes, setQuotes] = useState({});
  const [sort, setSort] = useState("exposure");
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
      const annualExposure = scope12T * PRICE_PER_T;
      const coverage = e.marketCapUsd > 0 ? annualExposure / e.marketCapUsd : 0;
      const ratePerSec = annualExposure / yearSeconds();
      return { ...e, scope12T, annualExposure, coverage, ratePerSec };
    });
    const filtered = sector === "All" ? enriched : enriched.filter((r) => r.sector === sector);
    const dir = sortDir === "asc" ? 1 : -1;
    filtered.sort((a, b) => {
      switch (sort) {
        case "exposure": return (a.annualExposure - b.annualExposure) * dir;
        case "rate": return (a.ratePerSec - b.ratePerSec) * dir;
        case "intensity": return (a.scope12T - b.scope12T) * dir;
        case "coverage": return (a.coverage - b.coverage) * dir;
        case "name": return a.name.localeCompare(b.name) * dir;
        default: return 0;
      }
    });
    return filtered;
  }, [sort, sortDir, sector]);

  const totals = useMemo(() => {
    const annualT = EMITTERS.reduce((s, e) => s + totalScope12(e), 0);
    const annualExposure = annualT * PRICE_PER_T;
    return {
      annualT,
      annualExposure,
      ytdExposure: annualExposure * ytd,
      ytdT: annualT * ytd,
      ratePerSec: annualExposure / yearSeconds(),
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
        <title>Modeled Carbon-Pricing Exposure — RWA | BASED NUT</title>
        <meta name="description" content="A transparent thought experiment: 42 public companies' disclosed Scope 1+2 emissions priced at a reference carbon price — with the green-investment side shown honestly alongside." />
      </Head>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, py: 5 }}>
        <Typography variant="overline" sx={{ color: HONEY, fontWeight: 800, letterSpacing: 2 }}>
          🏦 Real-World Assets
        </Typography>
        <Typography variant="h3" sx={{ color: BARK, fontWeight: 900, letterSpacing: -1, mb: 1 }}>
          Modeled carbon-pricing exposure
        </Typography>
        <Typography sx={{ color: "#423B31", fontSize: "1.1rem", maxWidth: 860, mb: 4 }}>
          A thought experiment, not an accounting. What would it cost if each company's
          disclosed Scope 1+2 emissions faced a carbon price? This is a financial
          re-expression of an externality — not a debt anyone owes, and not a damage bill.
        </Typography>

        {/* Hero: modeled YTD exposure */}
        <Paper elevation={0} sx={{ p: 4, bgcolor: BARK, color: "#FFF7E7", borderRadius: 3, mb: 3 }}>
          <Typography sx={{ color: OCHRE, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800 }}>
            Modeled YTD carbon-pricing exposure
          </Typography>
          <Typography sx={{ fontWeight: 900, fontSize: { xs: "2.2rem", md: "3.2rem" }, letterSpacing: -1, my: 1 }}>
            {fmtMoney(totals.ytdExposure)}
          </Typography>
          <Typography sx={{ color: "#D9CDBB", fontSize: "0.9rem" }}>
            {fmtT(totals.ytdT)} Scope 1+2, annualized from FY2023 disclosures, at a reference
            price of {PRICE_CURRENCY === "EUR" ? "€" : "$"}{PRICE_PER_T}/t ({PRICE_AS_OF}).
          </Typography>
        </Paper>

        {/* KPIs */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { label: "Companies", value: fmt.format(EMITTERS.length) },
            { label: "Annual modeled exposure", value: fmtMoney(totals.annualExposure) },
            { label: "Annual Scope 1+2", value: fmtT(totals.annualT) },
            { label: "Annualized rate", value: fmtMoney(totals.ratePerSec) + "/s" },
          ].map((s) => (
            <Grid item xs={12} sm={6} md={3} key={s.label}>
              <Paper elevation={0} sx={{ p: 2.5, bgcolor: PARCHMENT, border: "1px solid #D9CFBF", borderRadius: 3 }}>
                <Typography sx={{ color: BARK, fontWeight: 900, fontSize: "1.6rem", letterSpacing: -1 }}>{s.value}</Typography>
                <Typography sx={{ color: "#6B6254", fontSize: "0.85rem", mt: 0.5 }}>{s.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Two-sided context */}
        <Paper elevation={0} sx={{ p: 3, bgcolor: CREAM, borderLeft: "4px solid #C68B36", borderRadius: 2, mb: 4 }}>
          <Typography sx={{ fontWeight: 800, color: BARK, mb: 1 }}>
            ⚖️ One side of a two-sided story
          </Typography>
          <Typography sx={{ color: "#51483C", fontSize: "0.95rem", mb: 2 }}>
            Emissions are only half the ledger. These same companies also invest in
            decarbonization. CDP's aggregate data shows the gap between the two sides:
          </Typography>
          <Grid container spacing={2}>
            {CDP_CONTEXT.map((c) => (
              <Grid item xs={12} sm={4} key={c.label}>
                <Typography sx={{ color: BARK, fontWeight: 900, fontSize: "1.4rem" }}>{c.value}</Typography>
                <Typography sx={{ color: "#6B6254", fontSize: "0.85rem", fontWeight: 700 }}>{c.label}</Typography>
                <Typography sx={{ color: "#8A7D6B", fontSize: "0.8rem" }}>{c.note}</Typography>
              </Grid>
            ))}
          </Grid>
          <Typography sx={{ color: "#51483C", fontSize: "0.9rem", mt: 2 }}>
            Each company's disclosed climate commitments — including low-carbon capex,
            renewables, and removals — are shown in the row detail below. These are
            qualitative disclosures, not audited numbers, and are reported here as the
            company states them.
          </Typography>
        </Paper>

        {/* Sector filter */}
        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}>
          <Chip label="All sectors" onClick={() => setSector("All")} sx={{ bgcolor: sector === "All" ? BARK : CREAM, color: sector === "All" ? "#FFF" : BARK, fontWeight: 700 }} />
          {sectors.map((s) => (
            <Chip key={s} label={s} onClick={() => setSector(s)} sx={{ bgcolor: sector === s ? BARK : CREAM, color: sector === s ? "#FFF" : BARK, fontWeight: 700 }} />
          ))}
        </Stack>

        {/* Table */}
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #D9CFBF", borderRadius: 3, overflow: "hidden" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: CREAM }}>
                <TableCell sx={{ fontWeight: 800, color: BARK }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 800, color: BARK }}>Sector</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: BARK }}>
                  <TableSortLabel active={sort === "exposure"} direction={sortDir} onClick={() => handleSort("exposure")}>YTD exposure</TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: BARK }}>
                  <TableSortLabel active={sort === "rate"} direction={sortDir} onClick={() => handleSort("rate")}>Rate</TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: BARK }}>
                  <TableSortLabel active={sort === "intensity"} direction={sortDir} onClick={() => handleSort("intensity")}>Scope 1+2</TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: BARK }}>
                  <TableSortLabel active={sort === "coverage"} direction={sortDir} onClick={() => handleSort("coverage")}>Exposure ÷ mkt cap</TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: BARK }}>Quote</TableCell>
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
                      <TableCell align="right" sx={{ color: OAT, fontWeight: 700 }}>{fmtMoney(r.annualExposure * ytd)}</TableCell>
                      <TableCell align="right" sx={{ color: "#51483C", fontSize: "0.85rem" }}>{fmtMoney(r.ratePerSec)}/s</TableCell>
                      <TableCell align="right" sx={{ color: "#51483C", fontSize: "0.85rem" }}>{fmtT(r.scope12T)}</TableCell>
                      <TableCell align="right" sx={{ color: "#51483C", fontSize: "0.85rem" }}>{(r.coverage * 100).toFixed(1)}%</TableCell>
                      <TableCell align="right" sx={{ color: MOSS, fontWeight: 700 }}>
                        {q?.price != null ? `${q.price.toFixed(2)} ${q.currency || ""}` : "—"}
                      </TableCell>
                    </TableRow>
                    <TableRow key={r.ticker + "-detail"}>
                      <TableCell colSpan={7} sx={{ p: 0, border: 0 }}>
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
                                <Typography sx={{ color: BARK, fontWeight: 800, fontSize: "0.85rem", mb: 1 }}>Scope breakdown (FY{r.reportingYear})</Typography>
                                <Typography sx={{ color: "#51483C", fontSize: "0.85rem" }}>Scope 1 · direct: {fmtT(r.scope1T)}</Typography>
                                <Typography sx={{ color: "#51483C", fontSize: "0.85rem" }}>Scope 2 · purchased energy: {fmtT(r.scope2T)}</Typography>
                                <Typography sx={{ color: "#51483C", fontSize: "0.85rem" }}>Scope 3 · value chain: {fmtT(r.scope3T)} (not in the model)</Typography>
                                <Typography sx={{ color: OAT, fontWeight: 700, fontSize: "0.85rem", mt: 1 }}>Annual modeled exposure: {fmtMoney(r.annualExposure)}</Typography>
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
        <Paper elevation={0} sx={{ mt: 4, p: 4, bgcolor: BARK, color: "#FFF7E7", borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 900, fontSize: "1.6rem", color: "#FFF7E7", mb: 2 }}>
            🧠 What these numbers do — and don't — mean
          </Typography>

          <Typography sx={{ color: OCHRE, fontWeight: 800, mb: 0.5 }}>1. It is a model, not a measurement.</Typography>
          <Typography sx={{ color: "#D9CDBB", fontSize: "0.95rem", mb: 2 }}>
            The "YTD" clock does not measure 2026 emissions. It takes each company's most
            recent disclosed annual Scope 1+2 figure (mostly FY2023, published 2024) and
            divides it evenly across every second of the year. That is an annualized rate —
            a useful approximation, not a live sensor. Real emissions change year to year.
          </Typography>

          <Typography sx={{ color: OCHRE, fontWeight: 800, mb: 0.5 }}>2. The price is a reference, not a bill.</Typography>
          <Typography sx={{ color: "#D9CDBB", fontSize: "0.95rem", mb: 2 }}>
            We use {PRICE_CURRENCY === "EUR" ? "€" : "$"}{PRICE_PER_T}/t as a reference carbon price
            ({PRICE_SOURCE}, {PRICE_AS_OF}). {PRICE_NOTE} No company here pays this price on
            all its emissions — most pay nothing on most of them. The number answers a
            hypothetical: <i>what if they did?</i>
          </Typography>

          <Typography sx={{ color: OCHRE, fontWeight: 800, mb: 0.5 }}>3. Emissions are self-reported and imperfect.</Typography>
          <Typography sx={{ color: "#D9CDBB", fontSize: "0.95rem", mb: 2 }}>
            Every figure comes from the company's own disclosure (CDP, TCFD, or
            sustainability reports). Scope 2 has two legitimate methods — location-based and
            market-based — that give different numbers for the same company. Scope 3 is
            shown but excluded from the model because accounting varies too much to compare
            fairly. Where we found and corrected an error, it is flagged in the row.
          </Typography>

          <Typography sx={{ color: OCHRE, fontWeight: 800, mb: 0.5 }}>4. Exposure is not the whole story.</Typography>
          <Typography sx={{ color: "#D9CDBB", fontSize: "0.95rem", mb: 2 }}>
            A high exposure number does not make a company "bad." The same companies power
            electricity, transport, steel, cement, and fertilizer — the physical economy.
            Many also invest in the transition. The interesting question is not the gross
            number, but the <b>net direction</b>: is a company's decarbonization spending
            and verified reductions moving faster or slower than its emissions?
          </Typography>

          <Typography sx={{ color: OCHRE, fontWeight: 800, mb: 0.5 }}>5. The open question a carbon-credit regime must answer.</Typography>
          <Typography sx={{ color: "#D9CDBB", fontSize: "0.95rem" }}>
            If emissions are one side of a ledger and green investment is the other, then
            the gap between them is the space where a credit could live. But a credit is
            only meaningful if it is <b>additional</b> — a reduction that would not have
            happened anyway — and <b>verified</b>, not self-declared. That is the hard part:
            CDP shows 72% of companies disclose initiatives, but only 11% align their capex
            with their own transition targets. The precedent this page points toward is not
            "polluters owe money" — it is "make the net direction visible, verifiable, and
            priced."
          </Typography>
        </Paper>

        {/* Methodology */}
        <Paper elevation={0} sx={{ mt: 4, p: 3, bgcolor: CREAM, borderLeft: "4px solid #C68B36", borderRadius: 2 }}>
          <Typography sx={{ fontWeight: 800, color: BARK, mb: 1 }}>🧾 Methodology & provenance</Typography>
          <Typography sx={{ color: "#51483C", fontSize: "0.93rem", mb: 1 }}>
            Modeled exposure = Scope 1+2 (tCO₂e) × reference carbon price. Coverage =
            annual modeled exposure ÷ market capitalization — how large the hypothetical
            cost is relative to the company's equity value. Quotes are 15-min delayed via
            Yahoo Finance, informational only.
          </Typography>
          <Typography sx={{ color: "#51483C", fontSize: "0.93rem", mb: 1 }}>
            Sources per company: CDP Climate Change disclosures, TCFD-aligned
            sustainability reports, and SEC / national-regulator filings. Each row links to
            its primary document. Emissions are FY2023 unless noted; reporting year is
            shown per row.
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
