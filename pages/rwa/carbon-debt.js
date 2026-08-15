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
    const disclosed = EMITTERS.filter((e) => e.greenCapexUsd != null && e.greenCapexUsd > 0);
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
        <title>Carbon Balance Sheet — RWA | BASED NUT</title>
        <meta name="description" content="A transparent two-sided model: 42 companies' disclosed emissions priced at a reference carbon price, against their disclosed environmental reinvestment." />
      </Head>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, py: 5 }}>
        <Typography variant="overline" sx={{ color: HONEY, fontWeight: 800, letterSpacing: 2 }}>
          🏦 Real-World Assets
        </Typography>
        <Typography variant="h3" sx={{ color: BARK, fontWeight: 900, letterSpacing: -1, mb: 1 }}>
          Carbon balance sheet
        </Typography>
        <Typography sx={{ color: "#423B31", fontSize: "1.1rem", maxWidth: 860, mb: 4 }}>
          A thought experiment in two columns. One side: what each company's disclosed
          Scope 1+2 emissions would cost at a reference carbon price. The other: what the
          same company discloses spending on decarbonization. The gap between them is the
          open question.
        </Typography>

        {/* Hero: 4-KPI priority architecture */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, bgcolor: BARK, color: "#FFF7E7", borderRadius: 3, height: "100%" }}>
              <Typography sx={{ color: OCHRE, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800 }}>
                Modeled carbon debt
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: "2.4rem", letterSpacing: -1, my: 0.5 }}>
                {fmtUsdB(totals.annualDebt)} <span style={{ fontSize: "1rem", fontWeight: 700, color: "#D9CDBB" }}>/ year</span>
              </Typography>
              <Typography sx={{ color: "#D9CDBB", fontSize: "0.85rem" }}>
                {fmtT(totals.annualT)} Scope 1+2 × ${PRICE_PER_T}/t ({PRICE_AS_OF})
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, bgcolor: MOSS, color: "#F2F7EE", borderRadius: 3, height: "100%" }}>
              <Typography sx={{ color: "#CDE6C3", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800 }}>
                Earth reinvestment (disclosed)
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: "2.4rem", letterSpacing: -1, my: 0.5 }}>
                {fmtUsdB(totals.reinvest)} <span style={{ fontSize: "1rem", fontWeight: 700, color: "#CDE6C3" }}>/ year</span>
              </Typography>
              <Typography sx={{ color: "#CDE6C3", fontSize: "0.85rem" }}>
                Low-carbon capex, {totals.disclosedCount} of {EMITTERS.length} companies disclose it
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, bgcolor: PARCHMENT, border: "1px solid #D9CFBF", borderRadius: 3, height: "100%" }}>
              <Typography sx={{ color: OAT, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800 }}>
                Repayment ratio
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: "2.4rem", letterSpacing: -1, my: 0.5, color: BARK }}>
                {fmtPct(totals.repaymentRatio)}
              </Typography>
              <Typography sx={{ color: "#6B6254", fontSize: "0.85rem" }}>
                Reinvestment ÷ debt, over the {totals.disclosedCount} disclosing companies only
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, bgcolor: CREAM, borderLeft: "4px solid #B3542E", borderRadius: 3, height: "100%" }}>
              <Typography sx={{ color: RUST, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800 }}>
                Unpaid balance (gross)
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: "2.4rem", letterSpacing: -1, my: 0.5, color: RUST }}>
                {fmtUsdB(totals.unpaid)} <span style={{ fontSize: "1rem", fontWeight: 700, color: OAT }}>/ year</span>
              </Typography>
              <Typography sx={{ color: "#6B6254", fontSize: "0.85rem" }}>
                Debt minus disclosed reinvestment — a floor, not a true net, since 37 companies don't disclose
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Live rate strip */}
        <Paper elevation={0} sx={{ p: 2.5, bgcolor: BARK, color: "#FFF7E7", borderRadius: 2, mb: 4, display: "flex", flexWrap: "wrap", gap: 3, alignItems: "baseline" }}>
          <Box>
            <Typography sx={{ color: OCHRE, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 800 }}>Modeled YTD debt</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: "1.5rem" }}>{fmtUsd(totals.ytdDebt)}</Typography>
          </Box>
          <Box>
            <Typography sx={{ color: OCHRE, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 800 }}>Annualized rate</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: "1.5rem" }}>{fmtUsd(totals.ratePerSec)}/s</Typography>
          </Box>
          <Box>
            <Typography sx={{ color: OCHRE, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 800 }}>Modeled YTD emissions</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: "1.5rem" }}>{fmtT(totals.ytdT)}</Typography>
          </Box>
        </Paper>

        {/* Two-sided context */}
        <Paper elevation={0} sx={{ p: 3, bgcolor: CREAM, borderLeft: "4px solid #C68B36", borderRadius: 2, mb: 4 }}>
          <Typography sx={{ fontWeight: 800, color: BARK, mb: 1 }}>⚖️ Two sides, one question</Typography>
          <Typography sx={{ color: "#51483C", fontSize: "0.95rem", mb: 2 }}>
            Emissions are one side of a ledger; decarbonization spending is the other. CDP's
            aggregate data shows the gap between the two sides across the whole economy:
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
                  <TableSortLabel active={sort === "debt"} direction={sortDir} onClick={() => handleSort("debt")}>Carbon debt</TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: BARK }}>
                  <TableSortLabel active={sort === "reinvest"} direction={sortDir} onClick={() => handleSort("reinvest")}>Reinvest</TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: BARK }}>
                  <TableSortLabel active={sort === "repayment"} direction={sortDir} onClick={() => handleSort("repayment")}>Repay %</TableSortLabel>
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
                        {r.greenCapex > 0 ? fmtUsd(r.greenCapex) : "n/d"}
                      </TableCell>
                      <TableCell align="right" sx={{ color: r.repayment > 0.5 ? MOSS : RUST, fontWeight: 700 }}>
                        {r.greenCapex > 0 ? fmtPct(r.repayment) : "—"}
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
                                <Typography sx={{ color: OAT, fontWeight: 700, fontSize: "0.85rem", mt: 1 }}>Modeled carbon debt: {fmtUsd(r.annualDebt)}</Typography>
                                <Typography sx={{ color: MOSS, fontWeight: 700, fontSize: "0.85rem" }}>
                                  Earth reinvestment: {r.greenCapex > 0 ? fmtUsd(r.greenCapex) + " (" + r.greenCapexYear + ")" : "not disclosed"}
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
        <Paper elevation={0} sx={{ mt: 4, p: 4, bgcolor: BARK, color: "#FFF7E7", borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 900, fontSize: "1.6rem", color: "#FFF7E7", mb: 2 }}>
            🧠 What these numbers do — and don't — mean
          </Typography>

          <Typography sx={{ color: OCHRE, fontWeight: 800, mb: 0.5 }}>1. It is a model, not a measurement.</Typography>
          <Typography sx={{ color: "#D9CDBB", fontSize: "0.95rem", mb: 2 }}>
            The YTD clock does not measure 2026 emissions. It takes each company's most
            recent disclosed annual Scope 1+2 figure and divides it evenly across the year —
            an annualized rate, not a live sensor. Real emissions change year to year.
          </Typography>

          <Typography sx={{ color: OCHRE, fontWeight: 800, mb: 0.5 }}>2. The price is a fixed benchmark, not a live spot.</Typography>
          <Typography sx={{ color: "#D9CDBB", fontSize: "0.95rem", mb: 2 }}>
            We use ${PRICE_PER_T}/t as a reference carbon price ({PRICE_SOURCE}). {PRICE_NOTE}
            The number answers a hypothetical: <i>what if every tonne faced this price?</i>
          </Typography>

          <Typography sx={{ color: OCHRE, fontWeight: 800, mb: 0.5 }}>3. Emissions are self-reported and imperfect.</Typography>
          <Typography sx={{ color: "#D9CDBB", fontSize: "0.95rem", mb: 2 }}>
            Every figure comes from the company's own disclosure (CDP, TCFD, or
            sustainability reports). Scope 2 has two legitimate methods — location-based and
            market-based — that give different numbers. Organizational boundary (equity vs
            operated) also changes the total. Scope 3 is shown but excluded because
            accounting varies too much to compare fairly. Where we corrected an error, it
            is flagged in the row.
          </Typography>

          <Typography sx={{ color: OCHRE, fontWeight: 800, mb: 0.5 }}>4. The reinvestment side is incomplete — and that is the point.</Typography>
          <Typography sx={{ color: "#D9CDBB", fontSize: "0.95rem", mb: 2 }}>
            Only {totals.disclosedCount} of {EMITTERS.length} companies disclose a clean,
            attributable annual low-carbon capex figure. The repayment ratio is therefore
            computed over those {totals.disclosedCount} only — it is not extrapolated to the
            rest. The "unpaid balance" is a floor, not a true net. The missing data is
            itself the finding: if we want a real environmental balance sheet, disclosure
            must become as routine as the income statement.
          </Typography>

          <Typography sx={{ color: OCHRE, fontWeight: 800, mb: 0.5 }}>5. The open question a carbon-credit regime must answer.</Typography>
          <Typography sx={{ color: "#D9CDBB", fontSize: "0.95rem" }}>
            If emissions are one side of a ledger and reinvestment is the other, the gap is
            where a credit could live. But a credit is only meaningful if it is
            <b> additional</b> — a reduction that would not have happened anyway — and
            <b> verified</b>, not self-declared. CDP shows 72% of companies disclose
            initiatives, but only 11% align capex with their own targets. The precedent
            this page points toward is not "polluters owe money" — it is "make the net
            direction visible, verifiable, and priced."
          </Typography>
        </Paper>

        {/* Methodology */}
        <Paper elevation={0} sx={{ mt: 4, p: 3, bgcolor: CREAM, borderLeft: "4px solid #C68B36", borderRadius: 2 }}>
          <Typography sx={{ fontWeight: 800, color: BARK, mb: 1 }}>🧾 Methodology & provenance</Typography>
          <Typography sx={{ color: "#51483C", fontSize: "0.93rem", mb: 1 }}>
            Modeled carbon debt = Scope 1+2 (tCO₂e) × ${PRICE_PER_T}/t reference price.
            Earth reinvestment = disclosed annual low-carbon capex (renewables, CCS,
            hydrogen, efficiency) where the company reports a clean attributable figure.
            Repayment ratio = reinvestment ÷ debt, over disclosing companies only.
            "Unpaid balance" = total debt − disclosed reinvestment (a floor).
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
