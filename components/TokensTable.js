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
  Typography,
} from "@mui/material";

// Token live merge - mirrors TokenSpecimenCard.jsx source display order:
// GeckoTerminal -> DexScreener -> CoinGecko -> Balancer
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

const COLS = [
  { id: "name", label: "Token", numeric: false },
  { id: "category", label: "Class", numeric: false },
  { id: "role", label: "Role", numeric: false },
  { id: "price", label: "Price", numeric: true },
  { id: "change", label: "24h", numeric: true },
  { id: "volume", label: "Volume 24h", numeric: true },
  { id: "liquidity", label: "Liquidity", numeric: true },
  { id: "links", label: "Links", numeric: false, disableSort: true },
];

export default function TokensTable({ tokens = [] }) {
  const [orderBy, setOrderBy] = useState("liquidity");
  const [order, setOrder] = useState("desc");

  const rows = useMemo(() => {
    return tokens.map((t) => {
      const live = mergeTokenLive(t);
      const trade = Array.isArray(t.tradeLinks) && t.tradeLinks.length ? t.tradeLinks[0] : null;
      return {
        id: t.id,
        icon: t.icon || "",
        name: t.name || "-",
        category: t.category || "-",
        role: t.role || "-",
        price: live ? live.price : null,
        source: live ? live.source : null,
        change: live ? live.change : null,
        volume: live ? live.volume : null,
        liquidity: live ? live.liquidity : null,
        stale: live ? live.stale : false,
        tradeUrl: trade ? trade.url : null,
        tradeLabel: trade ? trade.label : "Trade",
        explorerUrl: t.link || null,
      };
    });
  }, [tokens]);

  const sorted = useMemo(() => {
    const dir = order === "desc" ? -1 : 1;
    const textCol = orderBy === "name" || orderBy === "category" || orderBy === "role";
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
      const textCol = col === "name" || col === "category" || col === "role";
      setOrder(textCol ? "asc" : "desc");
    }
  };

  if (!tokens.length) {
    return (
      <Paper sx={{ p: 3, textAlign: "center", background: "#FFF7EA", border: "1px solid #E8DCC8", borderRadius: "20px" }}>
        <Typography sx={{ color: "#7D5A50" }}>No tokens match - clear the search or filters to see the whole tree.</Typography>
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
      <Table sx={{ minWidth: 820 }} aria-label="All tokens table" size="small">
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
            return (
              <TableRow
                key={r.id}
                hover
                sx={{
                  "&:last-child td, &:last-child th": { borderBottom: 0 },
                  "& td": { borderColor: "#EFE3CF", color: "#5D4037" },
                }}
              >
                <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                  <Link
                    href={"/token/" + r.id}
                    style={{ textDecoration: "none", color: "inherit", display: "inline-flex", alignItems: "center", gap: 6 }}
                    aria-label={"View profile for token " + r.name}
                  >
                    <span aria-hidden="true">{r.icon}</span>
                    <span style={{ color: "#7D5A50" }}>{r.name}</span>
                  </Link>
                  {r.stale ? (
                    <Chip label="stale" size="small" sx={{ ml: 1, height: 18, fontSize: "0.6rem", bgcolor: "#E6B87D", color: "#5B3A29" }} />
                  ) : null}
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <Chip label={r.category} size="small" sx={{ bgcolor: "#EFE3CF", color: "#5B3A29", fontWeight: 600 }} />
                </TableCell>
                <TableCell sx={{ fontSize: "0.8rem", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.role}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                  {fmtPrice(r.price)}{r.source ? <small style={{ color: "#A0522D", fontWeight: 700, fontSize: "0.62rem" }}> ({r.source})</small> : null}
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap", color: changeColor, fontWeight: 600 }}>{chgTxt}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>{fmtUsd(r.volume)}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>{fmtUsd(r.liquidity)}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <Box sx={{ display: "inline-flex", gap: 1 }}>
                    {r.tradeUrl ? (
                      <Chip
                        component="a"
                        href={r.tradeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        clickable
                        label="Swap"
                        size="small"
                        sx={{ bgcolor: "#E2CDAE", color: "#5B3A29", fontWeight: 600 }}
                      />
                    ) : null}
                    {r.explorerUrl ? (
                      <Chip
                        component="a"
                        href={r.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        clickable
                        label="Verify"
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
          Live source preference: GeckoTerminal to DexScreener to CoinGecko to Balancer - GT/DS/CG/BAL shown per row - stale = last-good cache
        </Typography>
      </Box>
    </TableContainer>
  );
}
