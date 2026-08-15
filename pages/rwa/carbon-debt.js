import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import {
  Box, Typography, Paper, Chip, Stack, Divider, Grid, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Collapse,
} from "@mui/material";
import carbonData from "../../src/data/carbon-data.json";

// Orchard theme tokens
const BARK = "#5D3A1A";
const OAT = "#7D5A50";
const HONEY = "#A67C52";
const CREAM = "#F5E9DA";
const PARCHMENT = "#FFFDF7";
const MOSS = "#496A49";
const OCHRE = "#C68B36";

const PRICE_PER_T = carbonData.pricePerT;
const PRICE_AS_OF = carbonData.priceAsOf;
const EMITTERS = carbonData.emitters;

const fmt = new Intl.NumberFormat("en-US");
const fmtUsd = (n) => "$" + fmt.format(Math.round(n));
const fmtUsdFull = (n) => "$" + fmt.format(Math.round(n));
const fmtT = (n) => fmt.format(Math.round(n)) + " t";

function totalScope12(e) { return e.scope1T + e.scope2T; }

function yearSeconds() {
  const y = new Date().getUTCFullYear();
  const start = Date.UTC(y, 0, 1);
  const end = Date.UTC(y + 1, 0, 1);
  return (end - start) / 1000;
}

export default function CarbonDebtPage() {
  const [now, setNow] = useState(() => Date.now());
  const [quotes, setQuotes] = useState({});
  const [sort, setSort] = useState("debt");
  const [sortDir, setSortDir] = useState("desc");
  const [sector, setSector] = useState("All");
  const [open, setOpen] = useState({});

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Live quotes
  useEffect(() => {
    fetch("/api/quotes")
      .then((r) => r.json())
      .then((q) => setQuotes(q))
      .catch(() => {});
  }, []);

  const ytd = useMemo(() => {
    const y = new Date().getUTCFullYear();
    const elapsed = (now - Date.UTC(y, 0, 1)) / 1000;
    return elapsed / yearSeconds();
  }, [now]);

  const rows = useMemo(() => {
    const enriched = EMITTERS.map((e) => {
      const scope12T = totalScope12(e);
      const annualDebtUsd = scope12T * PRICE_PER_T;
      const coverage = e.marketCapUsd > 0 ? annualDebtUsd / e.marketCapUsd : 0;
      const ratePerSec = annualDebtUsd / yearSeconds();
      return { ...e, scope12T, annualDebtUsd, coverage, ratePerSec };
    });
    const filtered = sector === "All" ? enriched : enriched.filter((r) => r.sector === sector);
    const dir = sortDir === "asc" ? 1 : -1;
    filtered.sort((a, b) => {
      switch (sort) {
        case "debt": return (a.annualDebtUsd - b.annualDebtUsd) * dir;
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
    const all = EMITTERS.map((e) => totalScope12(e));
    const annualT = all.reduce((s, v) => s + v, 0);
    const annualDebt = annualT * PRICE_PER_T;
    return {
      emittedT: annualT * ytd,
      debtUsd: annualDebt * ytd,
      annualT,
      ratePerSec: annualDebt / yearSeconds(),
      annualDebt,
    };
  }, [ytd]);

  const sectors = useMemo(() => [...new Set(EMITTERS.map((e) => e.sector))].sort(), []);

  const handleSort = (key) => {
    if (sort === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSort(key); setSortDir("desc"); }
  };

  const toggle = (ticker) => setOpen((o) => ({ ...o, [ticker]: !o[ticker] }));

  const quoteFor = (ticker) => {
    const map = {
      "2222.SR": "2222.SR", XOM: "XOM", SHEL: "SHEL", CVX: "CVX", TTE: "TTE",
      BP: "BP", COP: "COP", MPC: "MPC", PSX: "PSX", VLO: "VLO",
      DUK: "DUK", SO: "SO", NEE: "NEE", AEP: "AEP", ENGI: "ENGI.PA",
      UAL: "UAL", DAL: "DAL", AAL: "AAL", LUV: "LUV", IAG: "IAG.L",
      "MAERSK-B.CO": "MAERSK-B.CO", FDX: "FDX", UPS: "UPS", UNP: "UNP",
      MT: "MT", NUE: "NUE", CLF: "CLF", BHP: "BHP", RIO: "RIO",
      HOLN: "HOLN.SW", CRH: "CRH", DOW: "DOW", LYB: "LYB", BAS: "BAS.DE",
      TM: "TM", F: "F", TSLA: "TSLA", WMT: "WMT", AMZN: "AMZN",
      MSFT: "MSFT", GOOGL: "GOOGL", AAPL: "AAPL",
    };
    return quotes[map[ticker]] || null;
  };

  return (
    <Layout>
      <Head>
        <title>Carbon Debt Ledger — RWA | BASED NUT</title>
        <meta name="description" content="A public ledger of ecological debt owed by publicly-listed companies — Scope 1+2 emissions priced at the EU ETS spot, with live equity quotes and transparent math." />
      </Head>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, py: 5 }}>
        <Typography variant="overline" sx={{ color: HONEY, fontWeight: 800, letterSpacing: 2 }}>
          🏦 Real-World Assets
        </Typography>
        <Typography variant="h3" sx={{ color: BARK, fontWeight: 900, letterSpacing: -1, mb: 1 }}>
          The Carbon Debt Ledger
        </Typography>
        <Typography sx={{ color: "#423B31", fontSize: "1.1rem", maxWidth: 820, mb: 4 }}>
          Every ton of CO₂e is a debt owed to the atmosphere. This ledger pairs each
          company's disclosed Scope 1+2 emissions with a live equity quote, priced at the
          EU ETS spot ({PRICE_AS_OF}: ${PRICE_PER_T}/t).
        </Typography>

        {/* Hero ledger clock */}
        <Paper elevation={0} sx={{ p: 4, bgcolor: BARK, color: "#FFF7E7", borderRadius: 3, mb: 3 }}>
          <Typography sx={{ color: OCHRE, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800 }}>
            YTD accrued liability
          </Typography>
          <Typography sx={{ fontWeight: 900, fontSize: { xs: "2.2rem", md: "3.2rem" }, letterSpacing: -1, my: 1 }}>
            {fmtUsd(totals.debtUsd)}
          </Typography>
          <Typography sx={{ color: "#D9CDBB", fontSize: "0.9rem" }}>
            {fmtT(totals.emittedT)} Scope 1+2 accrued since January 1, priced at EU ETS spot.
          </Typography>
        </Paper>

        {/* KPIs */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { label: "Issuers", value: fmt.format(EMITTERS.length) },
            { label: "Annual liability", value: fmtUsd(totals.annualDebt) },
            { label: "Annual Scope 1+2", value: fmtT(totals.annualT) },
            { label: "Live rate", value: fmtUsd(totals.ratePerSec) + "/s" },
          ].map((s) => (
            <Grid item xs={12} sm={6} md={3} key={s.label}>
              <Paper elevation={0} sx={{ p: 2.5, bgcolor: PARCHMENT, border: "1px solid #D9CFBF", borderRadius: 3 }}>
                <Typography sx={{ color: BARK, fontWeight: 900, fontSize: "1.6rem", letterSpacing: -1 }}>{s.value}</Typography>
                <Typography sx={{ color: "#6B6254", fontSize: "0.85rem", mt: 0.5 }}>{s.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Sector filter */}
        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}>
          <Chip
            label="All sectors"
            onClick={() => setSector("All")}
            sx={{ bgcolor: sector === "All" ? BARK : CREAM, color: sector === "All" ? "#FFF" : BARK, fontWeight: 700 }}
          />
          {sectors.map((s) => (
            <Chip
              key={s}
              label={s}
              onClick={() => setSector(s)}
              sx={{ bgcolor: sector === s ? BARK : CREAM, color: sector === s ? "#FFF" : BARK, fontWeight: 700 }}
            />
          ))}
        </Stack>

        {/* Ledger table */}
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #D9CFBF", borderRadius: 3, overflow: "hidden" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: CREAM }}>
                <TableCell sx={{ fontWeight: 800, color: BARK }}>Issuer</TableCell>
                <TableCell sx={{ fontWeight: 800, color: BARK }}>Sector</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: BARK }}>
                  <TableSortLabel active={sort === "debt"} direction={sortDir} onClick={() => handleSort("debt")}>
                    YTD debt
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: BARK }}>
                  <TableSortLabel active={sort === "rate"} direction={sortDir} onClick={() => handleSort("rate")}>
                    Rate
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: BARK }}>
                  <TableSortLabel active={sort === "intensity"} direction={sortDir} onClick={() => handleSort("intensity")}>
                    Scope 1+2
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: BARK }}>
                  <TableSortLabel active={sort === "coverage"} direction={sortDir} onClick={() => handleSort("coverage")}>
                    Coverage
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: BARK }}>Quote</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => {
                const q = quoteFor(r.ticker);
                const isOpen = !!open[r.ticker];
                return (
                  <>
                    <TableRow
                      key={r.ticker}
                      hover
                      onClick={() => toggle(r.ticker)}
                      sx={{ cursor: "pointer", "&:hover": { bgcolor: "#FBF6EA" } }}
                    >
                      <TableCell sx={{ fontWeight: 700, color: BARK }}>
                        {r.name} <span style={{ color: "#9A8B7A", fontSize: "0.75rem" }}>({r.ticker})</span>
                      </TableCell>
                      <TableCell sx={{ color: "#51483C", fontSize: "0.85rem" }}>{r.sector}</TableCell>
                      <TableCell align="right" sx={{ color: OAT, fontWeight: 700 }}>{fmtUsd(r.annualDebtUsd * ytd)}</TableCell>
                      <TableCell align="right" sx={{ color: "#51483C", fontSize: "0.85rem" }}>{fmtUsd(r.ratePerSec)}/s</TableCell>
                      <TableCell align="right" sx={{ color: "#51483C", fontSize: "0.85rem" }}>{fmtT(r.scope12T)}</TableCell>
                      <TableCell align="right" sx={{ color: "#51483C", fontSize: "0.85rem" }}>{(r.coverage * 100).toFixed(1)}%</TableCell>
                      <TableCell align="right" sx={{ color: MOSS, fontWeight: 700 }}>
                        {q?.price ? "$" + q.price.toFixed(2) : "—"}
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
                                <Typography sx={{ color: "#51483C", fontSize: "0.9rem" }}><b style={{ color: OAT }}>Climate commitments:</b> {r.climateCommitments}</Typography>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Typography sx={{ color: BARK, fontWeight: 800, fontSize: "0.85rem", mb: 1 }}>Scope breakdown</Typography>
                                <Typography sx={{ color: "#51483C", fontSize: "0.85rem" }}>Scope 1 · direct: {fmtT(r.scope1T)}</Typography>
                                <Typography sx={{ color: "#51483C", fontSize: "0.85rem" }}>Scope 2 · purchased energy: {fmtT(r.scope2T)}</Typography>
                                <Typography sx={{ color: "#51483C", fontSize: "0.85rem" }}>Scope 3 · value chain: {fmtT(r.scope3T)} (not in debt math)</Typography>
                                <Typography sx={{ color: OAT, fontWeight: 700, fontSize: "0.85rem", mt: 1 }}>Annual liability: {fmtUsdFull(r.annualDebtUsd)}</Typography>
                                <Typography sx={{ color: "#51483C", fontSize: "0.85rem" }}>Market cap: {fmtUsdFull(r.marketCapUsd)} · Revenue: {fmtUsdFull(r.revenueUsd)}</Typography>
                                <Typography sx={{ color: "#51483C", fontSize: "0.85rem" }}>Reporting year: {r.reportingYear} · HQ: {r.hqCountry} · Exchange: {r.exchange}</Typography>
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

        {/* Methodology */}
        <Paper elevation={0} sx={{ mt: 4, p: 3, bgcolor: CREAM, borderLeft: "4px solid #C68B36", borderRadius: 2 }}>
          <Typography sx={{ fontWeight: 800, color: BARK, mb: 1 }}>🧾 Methodology</Typography>
          <Typography sx={{ color: "#51483C", fontSize: "0.93rem", mb: 1 }}>
            The debt clock is a model, not a live sensor. Each company's most-recently disclosed
            annual Scope 1+2 emissions are divided into a per-second flow, accruing since January 1
            at 00:00 UTC. YTD debt = Scope 1+2 × ${PRICE_PER_T}/t EUA spot × elapsed year fraction.
          </Typography>
          <Typography sx={{ color: "#51483C", fontSize: "0.93rem", mb: 1 }}>
            Scope 1 (direct) + Scope 2 (purchased energy) are self-reported by each issuer for its
            most recent completed fiscal year (typically FY2023, published 2024). Sources: CDP Climate
            Change disclosures, TCFD-aligned sustainability reports, and SEC / national-regulator
            filings. Every row links to the primary document.
          </Typography>
          <Typography sx={{ color: "#51483C", fontSize: "0.93rem" }}>
            Scope 3 is shown when disclosed but <b>not</b> used in the debt math — Scope 3 accounting
            varies too much between issuers to compare fairly. Live quotes are 15-min delayed via
            Yahoo Finance v8 chart endpoint, informational only.
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
