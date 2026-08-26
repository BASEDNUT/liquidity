import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material";

// Unified live board: every NUT token and every pool, priced live, in ONE table.
// Token merge order: GeckoTerminal -> DexScreener -> CoinGecko -> Balancer
// Pool merge order: GeckoTerminal -> DexScreener -> MintClub
// Stale flag = last-good cached value.

function mergeTokenLive(token) {
  const md = token.marketData;
  if (!md) return null;
  const gt = md.geckoTerminal;
  const ds = md.dexScreener;
  const cg = md.coinGecko;
  const bal = md.balancer;
  const price = gt && gt.price_usd != null ? gt.price_usd
    : ds && ds.priceUsd != null ? ds.priceUsd
    : cg && cg.price_usd != null ? cg.price_usd
    : bal && bal.bptPrice != null ? bal.bptPrice
    : null;
  const source = gt && gt.price_usd != null ? "GT"
    : ds && ds.priceUsd != null ? "DS"
    : cg && cg.price_usd != null ? "CG"
    : bal && bal.bptPrice != null ? "BAL"
    : null;
  const volume = ds && ds.volume_h24 != null ? ds.volume_h24
    : gt && gt.volume_usd_h24 != null ? gt.volume_usd_h24
    : bal && bal.volume24h != null ? bal.volume24h
    : null;
  const liquidity = ds && ds.liquidity_usd != null ? ds.liquidity_usd
    : gt && gt.total_reserve_in_usd != null ? gt.total_reserve_in_usd
    : bal && bal.totalLiquidity != null ? bal.totalLiquidity
    : null;
  const change = ds && ds.priceChange_h24 != null ? ds.priceChange_h24 : null;
  const stale = [gt, ds, cg, bal].some((s) => s && s.stale);
  if (price == null && volume == null && liquidity == null) return null;
  return { price, source, volume, liquidity, change, stale };
}

function mergePoolLive(poolId, marketData) {
  if (!marketData || !marketData.pools || !marketData.pools[poolId]) return null;
  const p = marketData.pools[poolId];
  const src = p.geckoTerminal || p.dexScreener || p.mintClub || null;
  if (!src) return null;
  return {
    tvl: src.tvl != null ? src.tvl : null,
    volume24h: src.volume24h != null ? src.volume24h : null,
    price: src.price != null ? src.price : null,
    priceChange24h: src.priceChange24h != null ? src.priceChange24h : null,
    stale: src.stale || false,
    source: p.geckoTerminal ? "GT" : p.dexScreener ? "DS" : "MC",
  };
}

function fmtUsd(val) {
  if (val == null || isNaN(val)) return "-";
  const n = Number(val);
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(2) + "K";
  if (n === 0) return "$0";
  return "$" + n.toFixed(2);
}

function fmtPrice(val) {
  if (val == null || isNaN(val)) return "-";
  const n = Number(val);
  if (n >= 1000) return "$" + n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (n >= 1) return "$" + n.toFixed(4);
  if (n >= 0.001) return "$" + n.toFixed(6);
  if (n > 0) return "$" + n.toFixed(8);
  return "$0";
}

// Derive fee label only when a venue explicitly states it - never invent numbers.
function feeLabel(platform, flavor) {
  const hay = ((platform || "") + " " + (flavor || ""));
  const m = hay.match(/\((\d+(?:\.\d+)?%)\s*(?:fee|pool)\)/i);
  return m ? m[1] : null;
}

const COLS = [
  { id: "name", label: "Asset", numeric: false },
  { id: "kind", label: "Class", numeric: false },
  { id: "price", label: "Price", numeric: true },
  { id: "change", label: "24h", numeric: true },
  { id: "volume", label: "Volume 24h", numeric: true },
  { id: "liquidity", label: "Liquidity", numeric: true },
  { id: "links", label: "Links", numeric: false, disableSort: true },
];

export default function OrchardBoard({ tokens = [], pools = [], marketData = null }) {
  const [orderBy, setOrderBy] = useState("liquidity");
  const [order, setOrder] = useState("desc");

  const rows = useMemo(() => {
    const tokenRows = tokens.map((t) => {
      const live = mergeTokenLive(t);
      const trade = Array.isArray(t.tradeLinks) && t.tradeLinks.length ? t.tradeLinks[0] : null;
      return {
        id: t.id,
        icon: t.icon || "",
        name: t.name || "-",
        type: "token",
        kind: t.category || "-",
        href: "/token/" + t.id,
        price: live ? live.price : null,
        source: live ? live.source : null,
        change: live ? live.change : null,
        volume: live ? live.volume : null,
        liquidity: live ? live.liquidity : null,
        stale: live ? live.stale : false,
        primaryUrl: trade ? trade.url : null,
        primaryLabel: trade ? trade.label : "Swap",
        secondaryUrl: t.link || null,
        secondaryLabel: "Verify",
      };
    });
    const poolRows = pools.map((p) => {
      const live = mergePoolLive(p.id, marketData);
      const fee = feeLabel(p.platform, p.flavor);
      return {
        id: p.id,
        icon: p.icon || "",
        name: p.name || "-",
        type: "pool",
        kind: p.platform || "-" + (fee ? " · " + fee : ""),
        href: "/pool/" + p.id,
        price: live ? live.price : null,
        source: live ? live.source : (p.tvl != null ? "GT" : null),
        change: live ? live.priceChange24h : null,
        volume: live ? live.volume24h : null,
        liquidity: live && live.tvl != null ? live.tvl : (p.tvl != null ? Number(p.tvl) : null),
        stale: live ? live.stale : false,
        primaryUrl: p.dexscreenerUrl || null,
        primaryLabel: "Chart",
        secondaryUrl: p.checkPoolUrl || null,
        secondaryLabel: "Verify",
      };
    });
    return tokenRows.concat(poolRows);
  }, [tokens, pools, marketData]);

  const sorted = useMemo(() => {
    const dir = order === "desc" ? -1 : 1;
    const textCol = orderBy === "name" || orderBy === "kind";
    const withVal = [];
    const nullVal = [];
    for (const r of rows) {
      const v = r[orderBy];
      const ok = textCol ? v != null : (v != null && !isNaN(v));
      (ok ? withVal : nullVal).push(r);
    }
    withVal.sort((a, b) => {
      const av = a[orderBy];
      const bv = b[orderBy];
      if (typeof av === "string" || typeof bv === "string") {
        return String(av).localeCompare(String(bv)) * dir;
      }
      return (Number(av) - Number(bv)) * dir;
    });
    if (orderBy !== "name") {
      nullVal.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    }
    return withVal.concat(nullVal);
  }, [rows, order, orderBy]);

  const handleSort = (col) => {
    if (col === orderBy) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setOrderBy(col);
      const textCol = col === "name" || col === "kind";
      setOrder(textCol ? "asc" : "desc");
    }
  };

  if (!rows.length) {
    return (
      <Paper sx={{ p: 3, textAlign: "center", background: "#FFF7EA", border: "1px solid #E8DCC8", borderRadius: "20px" }}>
        <Typography sx={{ color: "#7D5A50" }}>Nothing to price - clear the search or filters to see the whole orchard.</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        background: "linear-gradient(135deg, #FFF7EA 0%, #FFEED6 100%)",
        border: "1px solid #E8DCC8",
        borderRadius: "24px",
        boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
        overflowX: "auto",
      }}
    >
      <Table sx={{ minWidth: 880 }} aria-label="The Orchard Board - all NUTs and pools priced live" size="small">
        <TableHead>
          <TableRow sx={{ background: "rgba(226,205,174,0.35)" }}>
            {COLS.map((c) => (
              <TableCell
                key={c.id}
                align={c.numeric ? "right" : "left"}
                sortDirection={orderBy === c.id ? order : false}
                sx={{ color: "#5B3A29", fontWeight: 700, whiteSpace: "nowrap" }}
              >
                {c.disableSort ? (
                  c.label
                ) : (
                  <TableSortLabel
                    active={orderBy === c.id}
                    direction={orderBy === c.id ? order : "asc"}
                    onClick={() => handleSort(c.id)}
                  >
                    {c.label}
                  </TableSortLabel>
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((r) => {
            const chg = r.change;
            const changeColor = chg == null ? "#9E8B7E" : Number(chg) >= 0 ? "#2E7D32" : "#C62828";
            const chgTxt = chg == null ? "-" : (Number(chg) >= 0 ? "+" : "") + Number(chg).toFixed(2) + "%";
            const kindBg = r.type === "token" ? "#EFE3CF" : "#DCE8D4";
            const kindFg = r.type === "token" ? "#5B3A29" : "#2E4B2E";
            return (
              <TableRow
                key={r.type + "-" + r.id}
                hover
                sx={{
                  "&:last-child td, &:last-child th": { borderBottom: 0 },
                  "& td": { borderColor: "#EFE3CF", color: "#5D4037" },
                }}
              >
                <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                  <Link
                    href={r.href}
                    style={{ textDecoration: "none", color: "inherit", display: "inline-flex", alignItems: "center", gap: 6 }}
                    aria-label={(r.type === "token" ? "View profile for token " : "View details for pool ") + r.name}
                  >
                    <span aria-hidden="true">{r.icon}</span>
                    <span style={{ color: "#7D5A50" }}>{r.name}</span>
                  </Link>
                  {r.stale ? (
                    <Tooltip title="Last-good cached value - live source not responding.">
                      <Chip label="stale" size="small" sx={{ ml: 1, height: 18, fontSize: "0.6rem", bgcolor: "#E6B87D", color: "#5B3A29" }} />
                    </Tooltip>
                  ) : null}
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <Chip label={r.kind} size="small" sx={{ bgcolor: kindBg, color: kindFg, fontWeight: 600 }} />
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                  {fmtPrice(r.price)}{r.source ? <small style={{ color: "#A0522D", fontWeight: 700, fontSize: "0.62rem" }}> ({r.source})</small> : null}
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap", color: changeColor, fontWeight: 600 }}>{chgTxt}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>{fmtUsd(r.volume)}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>{fmtUsd(r.liquidity)}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <Box sx={{ display: "inline-flex", gap: 1 }}>
                    {r.primaryUrl ? (
                      <Chip
                        component="a"
                        href={r.primaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        clickable
                        label={r.primaryLabel}
                        size="small"
                        sx={{ bgcolor: "#E2CDAE", color: "#5B3A29", fontWeight: 600 }}
                      />
                    ) : null}
                    {r.secondaryUrl ? (
                      <Chip
                        component="a"
                        href={r.secondaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        clickable
                        label={r.secondaryLabel}
                        size="small"
                        sx={{ bgcolor: "#C8E6C9", color: "#2E4B2E", fontWeight: 600 }}
                      />
                    ) : null}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Box sx={{ px: 2, py: 1, textAlign: "right" }}>
        <Typography variant="caption" sx={{ color: "rgba(93,64,55,0.6)", fontSize: "0.65rem" }}>
          All NUTs and pools priced live - token preference GT &gt; DS &gt; CG &gt; BAL - pool preference GT &gt; DS &gt; MC - stale = last-good cache
        </Typography>
      </Box>
    </TableContainer>
  );
}
