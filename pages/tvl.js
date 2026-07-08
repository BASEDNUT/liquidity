import { useEffect, useState } from "react";
import Head from "next/head";
import { Box, Typography, Paper, Chip, Link as MuiLink, Skeleton, Alert, Tooltip, Divider } from "@mui/material";
import Header from "../components/Header";
import Footer from "../components/Footer";

function fmtUsd(n) {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function fmtUsdFull(n) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `$${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
}

function fmtPct(n) {
  if (n == null || !Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function fmtAddr(a) {
  if (!a) return "—";
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
}

function fmtNum(n, decimals = 2) {
  if (n == null || !Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: decimals }).format(n);
}

const SOURCE_COLORS = {
  "GeckoTerminal": "#4a9e3a",
  "DexScreener": "#9c5cbf",
  "MintClub (on-chain RPC)": "#c8862a",
  "MintClub": "#c8862a",
};

export default function TVLPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const resp = await fetch("/api/tvl-breakdown");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        if (!active) return;
        setData(json);
        setLoading(false);
      } catch (e) {
        if (!active) return;
        setError(String(e?.message || e));
        setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 60000);
    return () => { active = false; clearInterval(id); };
  }, []);

  const summary = data?.summary;
  const pools = data?.pools || [];
  const methodology = data?.methodology || {};
  const sourceBreakdown = data?.sourceBreakdown || {};

  return (
    <>
      <Head>
        <title>TVL Transparency | BASED NUT</title>
        <meta name="description" content="Full TVL breakdown — per-pool data sources, formulas, and methodology." />
      </Head>
      <Header />
      <Box sx={{ minHeight: "100vh", bgcolor: "#F5E6D3", pb: 6 }}>
        <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, pt: 4 }}>

          {/* Title */}
          <Typography variant="h3" sx={{ fontWeight: 900, color: "#3E1F0A", mb: 1, fontFamily: "Georgia, serif" }}>
            🌰 TVL Transparency Ledger
          </Typography>
          <Typography sx={{ color: "#6B4226", mb: 3, fontSize: 16 }}>
            Full per-pool breakdown of Total Value Locked — data sources, formulas, and methodology. No black boxes.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              Failed to load TVL data: {error}
            </Alert>
          )}

          {/* Summary Cards */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 4 }}>
            {[
              { label: "Total TVL", value: loading ? null : fmtUsdFull(summary?.totalTvl), sub: "Sum of all pool TVLs", color: "#3E1F0A" },
              { label: "24h Volume", value: loading ? null : fmtUsdFull(summary?.totalVolume24h), sub: "Aggregate across pools", color: "#5B3A29" },
              { label: "Avg 24h Δ", value: loading ? null : fmtPct(summary?.avgPriceChange), sub: `Across ${summary?.poolsWithData || 0} pools with data`, color: summary?.avgPriceChange >= 0 ? "#4a9e3a" : "#c63838" },
              { label: "Data Coverage", value: loading ? null : `${summary?.poolsWithData || 0}/${summary?.poolCount || 0}`, sub: "Pools with live TVL data", color: "#7D5A50" },
            ].map((card, i) => (
              <Paper key={i} elevation={3} sx={{ p: 2.5, borderRadius: 3, bgcolor: "#FFFCF5", border: "1px solid #D4B896" }}>
                <Typography sx={{ fontSize: 12, color: "#8B7355", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", mb: 1 }}>
                  {card.label}
                </Typography>
                {loading ? (
                  <Skeleton variant="text" width={120} height={32} />
                ) : (
                  <Typography sx={{ fontSize: 22, fontWeight: 800, color: card.color, fontFamily: "Georgia, serif", fontVariantNumeric: "tabular-nums" }}>
                    {card.value}
                  </Typography>
                )}
                <Typography sx={{ fontSize: 11, color: "#A0896C", mt: 0.5 }}>
                  {card.sub}
                </Typography>
              </Paper>
            ))}
          </Box>

          {/* Source Breakdown */}
          {!loading && Object.keys(sourceBreakdown).length > 0 && (
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: "#FFFCF5", border: "1px solid #D4B896", mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#3E1F0A", mb: 2, fontFamily: "Georgia, serif" }}>
                📊 Data Source Breakdown
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {Object.entries(sourceBreakdown).map(([source, info]) => (
                  <Box key={source} sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5, borderRadius: 2, bgcolor: "#F5E9DA", border: `2px solid ${SOURCE_COLORS[source] || "#888"}` }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: SOURCE_COLORS[source] || "#888" }} />
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#3E1F0A" }}>{source}</Typography>
                      <Typography sx={{ fontSize: 12, color: "#6B4226" }}>
                        {info.count} pools · {fmtUsd(info.tvl)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Typography sx={{ fontSize: 12, color: "#8B7355", mt: 2, fontStyle: "italic" }}>
                Data fetched from upstream APIs with 5-minute server-side cache. Source: {data?.source}
                {data?.generatedAt && ` · Generated: ${new Date(data.generatedAt).toLocaleString()}`}
              </Typography>
            </Paper>
          )}

          {/* Per-Pool Ledger Table */}
          <Paper elevation={3} sx={{ p: 0, borderRadius: 3, bgcolor: "#FFFCF5", border: "1px solid #D4B896", mb: 4, overflow: "hidden" }}>
            <Box sx={{ p: 2.5, borderBottom: "2px solid #D4B896", bgcolor: "#F5E9DA" }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#3E1F0A", fontFamily: "Georgia, serif" }}>
                📋 Per-Pool TVL Ledger
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#6B4226", mt: 0.5 }}>
                Every tracked pool — TVL, data source, formula, volume, and contract address.
              </Typography>
            </Box>

            {/* Desktop table */}
            <Box sx={{ display: { xs: "none", md: "block" }, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Georgia, serif" }}>
                <thead>
                  <tr style={{ bgcolor: "#E8D5B8", borderBottom: "2px solid #C8A27A" }}>
                    {"Pool|Platform|TVL|Source|Volume 24h|24h Δ|Contract".split("|").map((h, i) => (
                      <th key={i} style={{ padding: "10px 12px", textAlign: i >= 2 && i <= 5 ? "right" : "left", fontSize: 12, fontWeight: 700, color: "#5B3A29", letterSpacing: 0.5, textTransform: "uppercase" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading && Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #E8D5B8" }}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} style={{ padding: "10px 12px" }}><Skeleton variant="text" width={80} /></td>
                      ))}
                    </tr>
                  ))}
                  {!loading && pools.map((pool, i) => (
                    <tr key={pool.id} style={{ borderBottom: "1px solid #E8D5B8", bgcolor: i % 2 === 0 ? "#FFFCF5" : "#FAF3E6" }}>
                      <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 700, color: "#3E1F0A" }}>
                        {pool.label}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: "#6B4226" }}>{pool.platform}</td>
                      <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 800, color: "#3E1F0A", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                        {pool.hasData ? fmtUsdFull(pool.tvl) : <span style={{ color: "#B0A090" }}>—</span>}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        {pool.tvlSource ? (
                          <Chip
                            label={pool.tvlSource}
                            size="small"
                            sx={{
                              fontSize: 10,
                              height: 20,
                              bgcolor: SOURCE_COLORS[pool.tvlSource] || "#888",
                              color: "#fff",
                              fontWeight: 600,
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: 12, color: "#B0A090" }}>No data</span>
                        )}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 13, color: "#5B3A29", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                        {pool.volume24h != null ? fmtUsdFull(pool.volume24h) : "—"}
                      </td>
                      <td style={{
                        padding: "10px 12px",
                        fontSize: 13,
                        fontWeight: 700,
                        textAlign: "right",
                        color: pool.priceChange24h > 0 ? "#4a9e3a" : pool.priceChange24h < 0 ? "#c63838" : "#8B7355",
                        fontVariantNumeric: "tabular-nums",
                      }}>
                        {fmtPct(pool.priceChange24h)}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 11, color: "#7D5A50" }}>
                        {pool.address ? (
                          <MuiLink href={`https://basescan.org/address/${pool.address}`} target="_blank" rel="noopener" sx={{ color: "#7D5A50", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                            {fmtAddr(pool.address)}
                          </MuiLink>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {!loading && (
                  <tfoot>
                    <tr style={{ bgcolor: "#E8D5B8", borderTop: "2px solid #C8A27A", fontWeight: 800 }}>
                      <td style={{ padding: "12px", fontSize: 14, color: "#3E1F0A" }}>TOTAL ({pools.length} pools)</td>
                      <td></td>
                      <td style={{ padding: "12px", fontSize: 15, fontWeight: 900, color: "#3E1F0A", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                        {fmtUsdFull(summary?.totalTvl)}
                      </td>
                      <td colSpan={4}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </Box>

            {/* Mobile cards */}
            <Box sx={{ display: { xs: "block", md: "none" }, p: 2 }}>
              {loading && Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={120} sx={{ mb: 1.5, borderRadius: 2 }} />
              ))}
              {!loading && pools.map((pool, i) => (
                <Box key={pool.id} sx={{ mb: 1.5, p: 2, borderRadius: 2, bgcolor: i % 2 === 0 ? "#FFFCF5" : "#FAF3E6", border: "1px solid #E8D5B8" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#3E1F0A" }}>{pool.label}</Typography>
                    {pool.tvlSource && (
                      <Chip label={pool.tvlSource} size="small" sx={{ fontSize: 9, height: 18, bgcolor: SOURCE_COLORS[pool.tvlSource] || "#888", color: "#fff", fontWeight: 600 }} />
                    )}
                  </Box>
                  <Typography sx={{ fontSize: 11, color: "#8B7355", mb: 1 }}>{pool.platform}</Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography sx={{ fontSize: 11, color: "#6B4226" }}>TVL</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#3E1F0A", fontVariantNumeric: "tabular-nums" }}>
                      {pool.hasData ? fmtUsdFull(pool.tvl) : "—"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography sx={{ fontSize: 11, color: "#6B4226" }}>Volume 24h</Typography>
                    <Typography sx={{ fontSize: 12, color: "#5B3A29", fontVariantNumeric: "tabular-nums" }}>
                      {pool.volume24h != null ? fmtUsdFull(pool.volume24h) : "—"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 11, color: "#6B4226" }}>24h Δ</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: pool.priceChange24h > 0 ? "#4a9e3a" : pool.priceChange24h < 0 ? "#c63838" : "#8B7355" }}>
                      {fmtPct(pool.priceChange24h)}
                    </Typography>
                  </Box>
                  {pool.address && (
                    <MuiLink href={`https://basescan.org/address/${pool.address}`} target="_blank" rel="noopener" sx={{ display: "block", mt: 1, fontSize: 11, color: "#7D5A50" }}>
                        {fmtAddr(pool.address)} ↗
                    </MuiLink>
                  )}
                </Box>
              ))}
              {!loading && (
                <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "#E8D5B8", border: "2px solid #C8A27A" }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#3E1F0A" }}>TOTAL TVL</Typography>
                  <Typography sx={{ fontSize: 20, fontWeight: 900, color: "#3E1F0A", fontVariantNumeric: "tabular-nums" }}>
                    {fmtUsdFull(summary?.totalTvl)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>

          {/* MintClub Detail Expansion */}
          {!loading && pools.some(p => p.tvlSource === "MintClub (on-chain RPC)" || p.tvlSource === "MintClub") && (
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: "#FFFCF5", border: "1px solid #D4B896", mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#3E1F0A", mb: 2, fontFamily: "Georgia, serif" }}>
                🧮 MintClub Bonding Curve Details
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#6B4226", mb: 2 }}>
                These tokens use a bonding curve — TVL is calculated on-chain, not from DEX reserves.
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2 }}>
                {pools.filter(p => p.tvlSource === "MintClub (on-chain RPC)" || p.tvlSource === "MintClub").map(pool => (
                  <Box key={pool.id} sx={{ p: 2, borderRadius: 2, bgcolor: "#F5E9DA", border: "1px solid #D4B896" }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#3E1F0A", mb: 1 }}>{pool.label}</Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, fontSize: 12 }}>
                      <Box><Typography sx={{ color: "#8B7355", fontSize: 11 }}>Price (NUT)</Typography><Typography sx={{ color: "#3E1F0A", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{pool.priceInNUT != null ? `${fmtNum(pool.priceInNUT, 6)} NUT` : "—"}</Typography></Box>
                      <Box><Typography sx={{ color: "#8B7355", fontSize: 11 }}>NUT/USD</Typography><Typography sx={{ color: "#3E1F0A", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{pool.nutUsdPrice != null ? `$${fmtNum(pool.nutUsdPrice, 6)}` : "—"}</Typography></Box>
                      <Box><Typography sx={{ color: "#8B7355", fontSize: 11 }}>Current Supply</Typography><Typography sx={{ color: "#3E1F0A", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{pool.currentSupply != null ? fmtNum(pool.currentSupply, 2) : "—"}</Typography></Box>
                      <Box><Typography sx={{ color: "#8B7355", fontSize: 11 }}>Max Supply</Typography><Typography sx={{ color: "#3E1F0A", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{pool.maxSupply != null ? fmtNum(pool.maxSupply, 2) : "—"}</Typography></Box>
                      <Box><Typography sx={{ color: "#8B7355", fontSize: 11 }}>NUT Reserve</Typography><Typography sx={{ color: "#3E1F0A", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{pool.reserveBalanceNUT != null ? `${fmtNum(pool.reserveBalanceNUT, 2)} NUT` : "—"}</Typography></Box>
                      <Box><Typography sx={{ color: "#8B7355", fontSize: 11 }}>TVL (calc)</Typography><Typography sx={{ color: "#3E1F0A", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{fmtUsdFull(pool.tvl)}</Typography></Box>
                    </Box>
                    <Typography sx={{ fontSize: 10, color: "#A0896C", mt: 1, fontStyle: "italic" }}>
                      Formula: priceUsd × currentSupply
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}

          {/* Methodology */}
          {!loading && (
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: "#FFFCF5", border: "1px solid #D4B896", mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#3E1F0A", mb: 2, fontFamily: "Georgia, serif" }}>
                📐 Methodology
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {Object.entries(methodology).map(([key, desc]) => (
                  <Box key={key} sx={{ display: "flex", gap: 1.5 }}>
                    <Typography component="span" sx={{ fontSize: 13, fontWeight: 700, color: "#7D5A50", minWidth: 120, flexShrink: 0, textTransform: "capitalize" }}>
                      {key.replace(/([A-Z])/g, " $1").trim()}:
                    </Typography>
                    <Typography component="span" sx={{ fontSize: 13, color: "#5B3A29", lineHeight: 1.6 }}>
                      {desc}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}

          {/* Disclaimer */}
          <Alert severity="info" sx={{ borderRadius: 2, bgcolor: "#F0E6D6", border: "1px solid #D4B896", "& .MuiAlert-icon": { color: "#7D5A50" } }}>
            <Typography sx={{ fontSize: 13, color: "#5B3A29" }}>
              <strong>Transparency Note:</strong> TVL figures are aggregated from third-party APIs (GeckoTerminal, DexScreener) and on-chain RPC calls. Values update every 5 minutes via server-side cache. Pools without data sources are excluded from the total (not counted as zero). Sudoswap NFT AMM pools do not expose TVL via standard APIs.
            </Typography>
          </Alert>

        </Box>
      </Box>
      <Footer />
    </>
  );
}
