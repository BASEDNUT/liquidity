import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography, Paper, Select, MenuItem, IconButton, Chip } from "@mui/material";
import chartsData from "../src/data/ecosystem-charts.json";

// Shared ecosystem graph viewer — extracted from the former /ecosystem page.
// Renders as a section on /faq (2026-08-28). Page-level Head/Layout stay in the page.

const BARK = "#5D3A1A";
const CREAM = "#F5E9DA";
const PARCHMENT = "#FFFDF7";

const IMAGE_FILES = {
  "TVL Treemap": "/img/ecosystem/tvl-treemap.png",
  "NUT Flow": "/img/ecosystem/nut-flow-sankey.png",
  "Bonding Curves": "/img/ecosystem/bonding-curves.png",
  "V3 Liquidity Depth": "/img/ecosystem/v3-depth.png",
  "Pool Correlation": "/img/ecosystem/pool-correlation.png",
};

const CHARTS = chartsData.charts;

let mermaidPromise = null;
function loadMermaid() {
  if (mermaidPromise) return mermaidPromise;
  mermaidPromise = new Promise((resolve, reject) => {
    if (window.mermaid) return resolve(window.mermaid);
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/mermaid@11.12.0/dist/mermaid.min.js";
    s.onload = () => {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: {
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          fontSize: "15px",
          primaryColor: "#ffffff",
          primaryTextColor: "#171717",
          lineColor: "#5f5b55",
          clusterBkg: "#fcfbf8",
          clusterBorder: "#ded8cf",
        },
      });
      resolve(window.mermaid);
    };
    s.onerror = () => reject(new Error("mermaid load failed"));
    document.head.appendChild(s);
  });
  return mermaidPromise;
}

export default function EcosystemCharts() {
  const [selected, setSelected] = useState(0);
  const [svg, setSvg] = useState("");
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const renderId = useRef(0);

  const chart = CHARTS[selected];

  const categories = useMemo(() => {
    const map = {};
    CHARTS.forEach((c) => {
      if (!map[c.category]) map[c.category] = [];
      map[c.category].push(c);
    });
    return map;
  }, []);

  useEffect(() => {
    const id = ++renderId.current;
    if (chart.type === "image") {
      setSvg("");
      setScale(1);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    loadMermaid()
      .then(async (mermaid) => {
        if (id !== renderId.current) return;
        const { svg: out } = await mermaid.render("ecosystem-chart", chart.code);
        if (id === renderId.current) {
          setSvg(out);
          setScale(1);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (id === renderId.current) {
          setError(e.message || "render failed");
          setLoading(false);
        }
      });
  }, [selected, chart]);

  const zoom = (factor) => setScale((s) => Math.min(4, Math.max(0.25, s * factor)));

  return (
    <Paper elevation={0} sx={{ mb: 4, border: "1px solid rgba(139,90,43,0.15)", borderRadius: 3, overflow: "hidden", background: PARCHMENT }}>
      {/* Top bar: category picker + zoom controls */}
      <Box sx={{ p: 2, borderBottom: "1px solid rgba(139,90,43,0.1)", display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
        <Select
          value={selected}
          onChange={(e) => setSelected(Number(e.target.value))}
          size="small"
          sx={{ minWidth: 280, bgcolor: "#fff", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#D1B48C" } }}
        >
          {Object.entries(categories).map(([cat, charts]) => [
            <MenuItem key={cat} disabled sx={{ fontWeight: 800, color: BARK, fontSize: "0.75rem", opacity: 1 }}>
              {cat}
            </MenuItem>,
            ...charts.map((c) => (
              <MenuItem key={c.title} value={CHARTS.indexOf(c)} sx={{ pl: 3 }}>
                {c.title}
              </MenuItem>
            )),
          ])}
        </Select>
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          <IconButton onClick={() => zoom(1.15)} size="small" sx={{ border: "1px solid #D1B48C", color: BARK }}>+</IconButton>
          <IconButton onClick={() => zoom(1 / 1.15)} size="small" sx={{ border: "1px solid #D1B48C", color: BARK }}>−</IconButton>
          <Chip label={`${Math.round(scale * 100)}%`} size="small" onClick={() => setScale(1)} sx={{ bgcolor: CREAM, color: BARK, fontWeight: 700 }} />
        </Box>
        <Typography sx={{ color: "rgba(40,40,60,0.5)", fontSize: "0.75rem", ml: "auto" }}>
          drag · wheel to zoom
        </Typography>
      </Box>

      {/* Title + description */}
      <Box sx={{ px: 2.5, py: 1.5 }}>
        <Typography sx={{ fontWeight: 800, color: BARK, fontSize: "1.15rem" }}>{chart.title}</Typography>
        {chart.description && (
          <Typography sx={{ color: "rgba(40,40,60,0.6)", fontSize: "0.85rem", mt: 0.25 }}>{chart.description}</Typography>
        )}
      </Box>

      {/* Render area */}
      <Box
        sx={{
          p: 2,
          bgcolor: "#FBF6EA",
          minHeight: 420,
          overflow: "auto",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
        onWheel={(e) => {
          if (e.deltaY < 0) zoom(1.12);
          else zoom(1 / 1.12);
        }}
      >
        {loading && <Typography sx={{ color: "rgba(40,40,60,0.5)", py: 8 }}>Rendering…</Typography>}
        {error && <Typography sx={{ color: "#B00020", py: 8 }}>Render failed: {error}</Typography>}
        {!loading && !error && chart.type === "image" && (
          <img
            src={IMAGE_FILES[chart.title]}
            alt={chart.title}
            style={{ maxWidth: "100%", height: "auto", transform: `scale(${scale})`, transformOrigin: "top left", borderRadius: 12 }}
          />
        )}
        {!loading && !error && chart.type === "mermaid" && svg && (
          <Box
            sx={{ transform: `scale(${scale})`, transformOrigin: "top left", "& svg": { maxWidth: "100%", height: "auto" } }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </Box>
    </Paper>
  );
}
