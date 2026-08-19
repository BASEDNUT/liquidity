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

// Live market merge - same preference order as pages/pool/[id].js
// GeckoTerminal -> DexScreener -> MintClub. Stale flag = last-good cached value.
function mergeLive(poolId, marketData) {
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
  { id: "name", label: "Pool", numeric: false },
  { id: "platform", label: "Venue", numeric: false },
  { id: "fee", label: "Fee", numeric: false },
  { id: "price", label: "Price", numeric: true },
  { id: "priceChange24h", label: "24h", numeric: true },
  { id: "volume24h", label: "Volume 24h", numeric: true },
  { id: "tvl", label: "Liquidity", numeric: true },
  { id: "links", label: "Links", numeric: false, disableSort: true },
];

export default function PoolsTable({ pools = [], marketData = null }) {
  const [orderBy, setOrderBy] = useState("tvl");
  const [order, setOrder] = useState("desc");

  const rows = useMemo(() => {
    return pools.map((p) => {
      const live = mergeLive(p.id, marketData);
      return {
        id: p.id,
        icon: p.icon || "",
        name: p.name || "-",
        platform: p.platform || "-",
        fee: feeLabel(p.platform, p.flavor),
        price: live ? live.price : null,
        priceChange24h: live ? live.priceChange24h : null,
        volume24h: live ? live.volume24h : null,
        tvl: live && live.tvl != null ? live.tvl : (p.tvl != null ? Number(p.tvl) : null),
        stale: live ? live.stale : false,
        source: live ? live.source : (p.tvl != null ? "GT" : null),
        dexscreenerUrl: p.dexscreenerUrl || null,
        checkPoolUrl: p.checkPoolUrl || null,
      };
    });
  }, [pools, marketData]);

  const sorted = useMemo(() => {
    const dir = order === "desc" ? -1 : 1;
    const textCol = orderBy === "name" || orderBy === "platform" || orderBy === "fee";
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
      const textCol = col === "name" || col === "platform" || col === "fee";
      setOrder(textCol ? "asc" : "desc");
    }
  };

  if (!pools.length) {
    return (
      <Paper sx={{ p: 3, textAlign: "center", background: "#FFF7EA", border: "1px solid #E8DCC8", borderRadius: "20px" }}>
        <Typography sx={{ color: "#7D5A50" }}>No pools match - clear the search or filters to see the whole orchard.</Typography>
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
      <Table sx={{ minWidth: 780 }} aria-label="All liquidity pools table" size="small">
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
            const chg = r.priceChange24h;
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
                    href={"/pool/" + r.id}
                    style={{ textDecoration: "none", color: "inherit", display: "inline-flex", alignItems: "center", gap: 6 }}
                    aria-label={"View details for pool " + r.name}
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
                <TableCell sx={{ whiteSpace: "nowrap", fontSize: "0.8rem" }}>{r.platform}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{r.fee != null ? r.fee : "-"}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                  {fmtPrice(r.price)}{r.source ? <small style={{ color: "#A0522D", fontWeight: 700, fontSize: "0.62rem" }}> ({r.source})</small> : null}
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap", color: changeColor, fontWeight: 600 }}>{chgTxt}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>{fmtUsd(r.volume24h)}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>{fmtUsd(r.tvl)}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <Box sx={{ display: "inline-flex", gap: 1 }}>
                    {r.dexscreenerUrl ? (
                      <Chip
                        component="a"
                        href={r.dexscreenerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        clickable
                        label="Chart"
                        size="small"
                        sx={{ bgcolor: "#E2CDAE", color: "#5B3A29", fontWeight: 600 }}
                      />
                    ) : null}
                    {r.checkPoolUrl ? (
                      <Chip
                        component="a"
                        href={r.checkPoolUrl}
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
          Live source preference: GeckoTerminal to DexScreener to MintClub - GT/DS/MC shown per row - stale = last-good cache
        </Typography>
      </Box>
    </TableContainer>
  );
}
