import { useEffect, useState, useMemo, useRef } from 'react';
import { Box } from '@mui/material';

function formatCurrency(n) {
  try {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0, useGrouping: true }).format(n || 0);
  } catch {
    return String(Math.round(n || 0));
  }
}

// ISO-like UTC time for programmatic, locale-stable display: 2025-09-17 19:06 UTC
function isoUtcHM(iso) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    return `${y}-${m}-${day} ${hh}:${mm} UTC`;
  } catch {
    return '—';
  }
}

export default function OrchardTVLNotice({ dense = false }) {
  const [state, setState] = useState({ loading: true });
  const mainRef = useRef(null); // Main 2-line body sentence
  const subRef = useRef(null);  // 24h Vol • Avg
  const boardRef = useRef(null); // middle plank bbox (legacy)
  const signRef = useRef(null);  // full board bbox (all planks)
  const headerRef = useRef(null); // header bbox to avoid overlap with TVL
  const [mainTransform, setMainTransform] = useState('');
  const [subTransform, setSubTransform] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const resp = await fetch('/api/orchard-tvl');
        const json = await resp.json();
        if (!active) return;
        setState({ loading: false, data: json });
      } catch (e) {
        if (!active) return;
        setState({ loading: false, error: String(e) });
      }
    };
    load();
    const id = setInterval(load, 5 * 60 * 1000); // refresh every 5 minutes
    return () => { active = false; clearInterval(id); };
  }, []);

  const { tvl, assets, pools, timestamp, checkedAt, volume24hTotal, priceChange24hAvg, source } = useMemo(() => {
    const d = state?.data || {};
    return {
      tvl: d.tvl ?? 0,
      assets: d.assets ?? 0,
      pools: d.pools ?? 0,
      timestamp: d.timestamp,
      checkedAt: d.checkedAt,
      volume24hTotal: d.volume24hTotal ?? 0,
      priceChange24hAvg: d.priceChange24hAvg ?? 0,
      source: d.source,
    };
  }, [state]);

  const priceSign = priceChange24hAvg > 0 ? '+' : priceChange24hAvg < 0 ? '' : '+';
  const priceClass = priceChange24hAvg > 0 ? 'pos' : priceChange24hAvg < 0 ? 'neg' : 'neu';

  const tvlText = `$${formatCurrency(tvl)}`;
  const volText = `$${formatCurrency(volume24hTotal)}`;
  const priceText = `${priceSign}${priceChange24hAvg.toFixed(2)}%`;
  const fullISO = (checkedAt ? new Date(checkedAt).toISOString() : timestamp) || '';
  const shortStamp = isoUtcHM(fullISO);

  const ariaLabel = `Project TVL ${tvlText} USD; ${assets} assets across ${pools} pools; 24h volume ${volText}; average 24h price change ${priceText}; updated ${shortStamp}`;

  // Auto-fit the main body and sub-metrics inside the board safe area with no overlap
  useEffect(() => {
    if (typeof window === 'undefined') return;
  // Measure full board (all planks) to compute safe area and anchors
  const sr = (() => { try { return signRef.current?.getBBox?.(); } catch { return null; } })();
  const br = (() => { try { return boardRef.current?.getBBox?.(); } catch { return null; } })();
  // Fallback approximates entire three-plank board area
  const fallbackBoard = { x: 120, y: 170, width: 960, height: 300 };
  const base = (sr && isFinite(sr.width) && isFinite(sr.height)) ? sr : (br && isFinite(br.width) && isFinite(br.height) ? br : fallbackBoard);
  // Robust padding so text never crosses nails/posts and keeps top/bottom breathing room
  const padX = Math.max(70, base.width * 0.10); // inner side padding inside rounded edges
  const padY = Math.max(18, base.height * 0.16); // safe padding from top/bottom board edges
  const SAFE_LEFT = base.x + padX;
  const SAFE_RIGHT = base.x + base.width - padX;
  const SAFE_TOP = base.y + padY;
  const SAFE_BOTTOM = base.y + base.height - padY;
    const SAFE_WIDTH = SAFE_RIGHT - SAFE_LEFT;
    const SAFE_HEIGHT = SAFE_BOTTOM - SAFE_TOP;
    const CENTER_X = SAFE_LEFT + SAFE_WIDTH / 2;

    // Fits an element into a target width and height fraction of the safe area,
    // returns the applied scale and scaled height. Anchors vertically by centerY.
    const computeTransform = (el, widthPct, maxHeightPx, centerY) => {
      const bbox = el.getBBox();
      if (!bbox || !isFinite(bbox.width) || bbox.width === 0) return null;
      const targetW = SAFE_WIDTH * (widthPct ?? 0.98);
      const sW = targetW / bbox.width;
      const sH = (maxHeightPx ?? (SAFE_HEIGHT * 0.5)) / bbox.height;
      const s = Math.max(0.7, Math.min(3.2, Math.min(sW, sH)));
      const cx = bbox.x + bbox.width / 2;
      const cy = bbox.y + bbox.height / 2;
      const transform = `translate(${CENTER_X},${centerY}) scale(${s}) translate(${-cx},${-cy})`;
      return { transform, s, scaledHeight: bbox.height * s };
    };

    const run = () => {
      const mainEl = mainRef.current;
      const subEl = subRef.current;
      if (!mainEl || !subEl) return;
      try {
    // Compute content top below header to avoid overlap
    let headBottom = SAFE_TOP;
    try {
      const hb = headerRef.current?.getBBox?.();
      if (hb && isFinite(hb.height)) headBottom = Math.max(SAFE_TOP, hb.y + hb.height);
    } catch {}
    const headerGap = Math.max(8, SAFE_HEIGHT * 0.02);
    const CONTENT_TOP = Math.max(SAFE_TOP, headBottom + headerGap);

    // 1) Fit main anchored near top area (CONTENT_TOP): centerY = CONTENT_TOP + scaledHeight/2 + innerTopGap
    const tempMain = computeTransform(mainEl, 0.98, SAFE_HEIGHT * 0.56, CONTENT_TOP + (SAFE_HEIGHT * 0.56) / 2);
        if (!tempMain) return;
        // Re-center using its actual scaled height to keep a small inner top gap
  const innerTopGap = Math.max(6, SAFE_HEIGHT * 0.026); // tight but safe gap beneath header
    const mainCenterY = CONTENT_TOP + innerTopGap + tempMain.scaledHeight / 2;
    const main = computeTransform(mainEl, 0.98, SAFE_HEIGHT * 0.56, mainCenterY);
        if (!main) return;
        setMainTransform(main.transform);

        // 2) Place sub below main with a dynamic gap, within remaining height
        // Add stroke-aware fudge (getBBox excludes strokes) so we don't collide visually
  const strokeFudge = main.s * 10; // buffer for outline/highlight
  const gap = Math.max(18, SAFE_HEIGHT * 0.10);
    const remainingTop = CONTENT_TOP + innerTopGap + main.scaledHeight + strokeFudge + gap;
        const remainingHeight = Math.max(0, SAFE_BOTTOM - remainingTop);
    const subMaxHeight = remainingHeight * 0.86; // ensure timestamp stays above bottom edge
        const subCenterY = remainingTop + subMaxHeight / 2;
        const sub = computeTransform(subEl, 0.92, subMaxHeight, subCenterY);
        if (!sub) return;
        setSubTransform(sub.transform);
      } catch (_) { /* ignore */ }
    };
    // delay until fonts/text render and run once more shortly after
    const id = requestAnimationFrame(run);
    const t = setTimeout(run, 60);
    window.addEventListener('resize', run);
    return () => { cancelAnimationFrame(id); clearTimeout(t); window.removeEventListener('resize', run); };
  }, [tvlText, assets, pools, volText, priceText]);

  return (
  <Box sx={{ width: '100%', maxWidth: 760, mx: 'auto', mb: dense ? 1 : 1 }} aria-label="Orchard TVL notice">
        <Box component="div" sx={{ width: '100%' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 680" width="100%" height="auto" role="img" aria-labelledby="title desc" aria-label={ariaLabel} preserveAspectRatio="xMidYMid meet" textRendering="geometricPrecision">
            <title id="title">BASED NUT — Orchard Bulletin Board</title>
            <desc id="desc">Rustic three-plank board on two posts with carved lettering and grass, showing TVL and 24h metrics.</desc>

            <defs>
              <filter id="drop" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="#000" flood-opacity="0.35" />
              </filter>
              <filter id="shadowBlur" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="3"/>
              </filter>

              <linearGradient id="woodFill" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#7f542e"/>
                <stop offset="0.5" stopColor="#a97742"/>
                <stop offset="1" stopColor="#8b5d33"/>
              </linearGradient>
              <linearGradient id="postFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#5b371a"/><stop offset="1" stopColor="#3a230f"/>
              </linearGradient>

              <pattern id="grain" width="180" height="54" patternUnits="userSpaceOnUse">
                <g stroke="#5d3c21" strokeWidth="1.3" opacity="0.24" fill="none" vectorEffect="non-scaling-stroke">
                  <path d="M-20 12 C20 0 60 24 100 12 C140 0 180 24 220 12"/>
                  <path d="M-20 27 C20 15 60 39 100 27 C140 15 180 39 220 27"/>
                  <path d="M-20 42 C20 30 60 54 100 42 C140 30 180 54 220 42"/>
                </g>
                <g opacity=".25" fill="none" stroke="#4a2d16" strokeWidth="1.2">
                  <ellipse cx="122" cy="34" rx="10" ry="6"/><ellipse cx="48" cy="20" rx="7" ry="5"/>
                </g>
              </pattern>

              <filter id="rough" x="-10%" y="-10%" width="120%" height="120%">
                <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="7" result="r"/>
                <feDisplacementMap in="SourceGraphic" in2="r" scale="3" xChannelSelector="R" yChannelSelector="G"/>
              </filter>

              <filter id="carve">
                <feOffset dy="1.2" in="SourceAlpha" result="o"/><feGaussianBlur in="o" stdDeviation="1.0" result="g"/>
                <feComposite in="g" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="inner"/>
                <feColorMatrix in="inner" type="matrix" values="0 0 0 0 0.13  0 0 0 0 0.09  0 0 0 0 0.06  0 0 0 1 0"/>
                <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>

              <radialGradient id="nail" cx="35%" cy="30%" r="70%">
                <stop offset="0" stopColor="#f3f3f3"/><stop offset="0.5" stopColor="#c4c8cc"/><stop offset="1" stopColor="#7a7f84"/>
              </radialGradient>
              <linearGradient id="grassG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#66c24f"/><stop offset="1" stopColor="#2f7a2b"/>
              </linearGradient>

              <style>{`
                /* One family + numeric variant; explicit letter-spacing and kerning for header */
                .h1 { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-weight: 800; letter-spacing: 0.06em; font-kerning: normal; }
                .p  { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; letter-spacing: 0; }
                .num{ font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-variant-numeric: tabular-nums lining-nums; font-weight: 800; letter-spacing: 0.02em; }
                .numPrimary { fill: #17130F; }
                .numAlt { fill: #2A1D12; }
                .nut { fill: #b07b49; }
                .cashew { fill: #a56e3c; }
                .dark { fill: #23160d; }
                .green { fill: #1B5E20; }
                .pos { fill:#1B5E20; } .neg { fill:#B71C1C; } .neu { fill:#455A64; }
                .outline { paint-order: stroke fill; stroke: rgba(0,0,0,.36); stroke-width: 1.4px; }
                .contrastStroke { paint-order: stroke fill; stroke: rgba(255,255,255,.95); stroke-width: 3px; }
                .hl { paint-order: stroke fill; stroke: rgba(255,255,255,.24); stroke-width: .6px; }
                .stamp { fill: #3f2a16; opacity: .95; font-variant-numeric: tabular-nums; }
                .body { fill: #2f2318; opacity: .98; }
              `}</style>

              <path id="plank1" d="M120,168 C156,156 246,160 300,166 L1000,180 c28,6 44,22 44,40 v26 c-2,16-16,28-44,32 L300,270 c-64,6-154,6-190,-8 c-18,-8-24,-22-22,-36 l2,-30 c2,-12 6,-20 20,-28z"/>
              <path id="plank2" d="M112,244 C150,232 244,238 300,240 L1008,256 c30,8 44,24 44,42 v32 c-2,16-16,30-44,34 L302,362 c-66,6-158,6-196,-10 c-16,-8-22,-22-20,-38 l2,-42 c2,-12 8,-22 18,-28z"/>
              <path id="plank3" d="M118,322 C154,308 246,314 300,318 L1002,336 c26,10 42,28 42,46 v30 c-2,18-16,32-42,36 L304,444 c-70,8-162,8-198,-12 c-14,-10-18,-26-16,-40 l2,-46 c2,-14 8,-24 16,-32z"/>
            </defs>

            {/** Grounded shadows anchored to posts/board, unified light source **/}
            <g pointerEvents="none" opacity="0.24">
              <ellipse cx="192" cy="556" rx="92" ry="18" fill="#000" filter="url(#shadowBlur)"/>
              <ellipse cx="952" cy="556" rx="92" ry="18" fill="#000" filter="url(#shadowBlur)"/>
              <ellipse cx="550" cy="570" rx="320" ry="24" fill="#000" opacity="0.12" filter="url(#shadowBlur)"/>
            </g>

            <g filter="url(#drop)">
              <rect x="160" y="140" width="64" height="400" rx="10" fill="url(#postFill)"/>
              <rect x="164" y="140" width="56" height="400" rx="10" fill="url(#woodFill)"/>
              <rect x="920" y="140" width="64" height="400" rx="10" fill="url(#postFill)"/>
              <rect x="924" y="140" width="56" height="400" rx="10" fill="url(#woodFill)"/>
            </g>

            <g filter="url(#drop)" pointerEvents="none" opacity="0.92">
              <g transform="translate(140,540)">
                <path d="M-40,0 q12,-36 0,-80 M-20,0 q10,-34 8,-76 M0,0 q8,-30 8,-64 M22,0 q10,-40 -2,-86 M44,0 q8,-36 4,-70" stroke="url(#grassG)" strokeWidth="4" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
                <path d="M-60,12 q28,-10 60,-10 q32,0 60,10 q-28,18 -60,18 q-32,0 -60,-18z" fill="url(#grassG)" opacity=".5"/>
                <circle cx="68" cy="-46" r="9" fill="#ffd24a" opacity="0.85"/>
                <circle cx="68" cy="-46" r="3.4" fill="#ee9b00" opacity="0.85"/>
              </g>
              <g transform="translate(960,546) scale(-1,1)">
                <path d="M-40,0 q12,-36 0,-80 M-20,0 q10,-34 8,-76 M0,0 q8,-30 8,-64 M22,0 q10,-40 -2,-86 M44,0 q8,-36 4,-70" stroke="url(#grassG)" strokeWidth="4" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
                <path d="M-60,12 q28,-10 60,-10 q32,0 60,10 q-28,18 -60,18 q-32,0 -60,-18z" fill="url(#grassG)" opacity=".5"/>
                <circle cx="68" cy="-46" r="9" fill="#ffd24a" opacity="0.85"/>
                <circle cx="68" cy="-46" r="3.4" fill="#ee9b00" opacity="0.85"/>
              </g>
            </g>

            <g filter="url(#drop)" pointerEvents="none" ref={signRef}>
              <g filter="url(#rough)">
                <use href="#plank1" fill="url(#woodFill)"/><use href="#plank1" fill="url(#grain)" opacity=".35"/>
                <circle cx="186" cy="208" r="6" fill="url(#nail)"/>
                <circle cx="1026" cy="212" r="6" fill="url(#nail)"/>
              </g>
              <g filter="url(#rough)">
                <use href="#plank2" fill="url(#woodFill)" ref={boardRef}/><use href="#plank2" fill="url(#grain)" opacity=".35"/>
                <circle cx="176" cy="296" r="6" fill="url(#nail)"/>
                <circle cx="1036" cy="300" r="6" fill="url(#nail)"/>
              </g>
              <g filter="url(#rough)">
                <use href="#plank3" fill="url(#woodFill)"/><use href="#plank3" fill="url(#grain)" opacity=".35"/>
                <circle cx="186" cy="368" r="6" fill="url(#nail)"/>
                <circle cx="1024" cy="372" r="6" fill="url(#nail)"/>
              </g>
            </g>

            {/** Header positioned closer to main body with minimal safe gap; wrapped in group for bbox **/}
            <g ref={headerRef}>
              <text x="560" y="228" className="h1 hl" textAnchor="middle" fontSize="26" filter="url(#carve)">WELCOME TO THE NUT FARM</text>
              <text x="560" y="230" className="h1 dark outline" textAnchor="middle" fontSize="26" filter="url(#carve)">WELCOME TO THE NUT FARM</text>
            </g>

            <g ref={mainRef} transform={mainTransform}>
              {/** Main body copy: clear TVL label, Title Case, no trailing periods; larger TVL number for hierarchy **/}
              <text x="560" y="236" className="p body hl" textAnchor="middle" fontSize="40" letterSpacing="0.2px" filter="url(#carve)">
                <tspan x="560">
                  <tspan className="num numPrimary" style={{ fontSize: '56px' }}>{tvlText}</tspan>
                  <tspan className="p"> TVL (USD)</tspan>
                </tspan>
                <tspan x="560" dy="1.55em">
                  <tspan className="p">Grown From </tspan>
                  <tspan className="num numAlt">{assets}</tspan>
                  <tspan className="p"> Different </tspan>
                  <tspan className="p" fill="#b07b49">NUT Tree Types</tspan>
                </tspan>
                <tspan x="560" dy="1.55em">
                  <tspan className="p">Planted Across </tspan>
                  <tspan className="num numAlt">{pools}</tspan>
                  <tspan className="p"> Farm Plots</tspan>
                </tspan>
              </text>
              <text x="560" y="238" className="p dark outline" textAnchor="middle" fontSize="40" letterSpacing="0.2px" filter="url(#carve)">
                <tspan x="560">
                  <tspan className="num numPrimary" id="tvlValue" style={{ fontSize: '56px' }}>{tvlText}</tspan>
                  <tspan className="p dark"> TVL (USD)</tspan>
                </tspan>
                <tspan x="560" dy="1.55em">
                  <tspan className="p dark">Grown From </tspan>
                  <tspan className="num numAlt" id="soilCount">{assets}</tspan>
                  <tspan className="p dark"> Different </tspan>
                  <tspan className="p dark" fill="#b07b49">NUT Tree Types</tspan>
                </tspan>
                <tspan x="560" dy="1.55em">
                  <tspan className="p dark">Planted Across </tspan>
                  <tspan className="num numAlt" id="groveCount">{pools}</tspan>
                  <tspan className="p dark"> Farm Plots</tspan>
                </tspan>
              </text>
            </g>

            <g ref={subRef} transform={subTransform}>
              <text x="560" y="274" className="p body hl" textAnchor="middle" fontSize="26" letterSpacing="0.12px" filter="url(#carve)">
                <tspan className="p">24h Vol </tspan>
                <tspan className="num">{volText}</tspan>
                <tspan className="p">  •  Avg 24h Price Δ </tspan>
                <tspan className={`num ${priceClass} contrastStroke`}>{priceText}</tspan>
                <tspan x="560" dy="1.6em" className="stamp">{shortStamp}</tspan>
              </text>
              <text x="560" y="276" className="p outline" textAnchor="middle" fontSize="26" letterSpacing="0.12px" filter="url(#carve)">
                <tspan className="p dark">24h Vol </tspan>
                <tspan className="num dark" id="vol24h">{volText}</tspan>
                <tspan className="p dark">  •  Avg 24h Price Δ </tspan>
                <tspan className={`num ${priceClass} contrastStroke`} id="price24h">{priceText}</tspan>
                <tspan x="560" dy="1.6em" className="stamp">{shortStamp}</tspan>
              </text>
            </g>

            <text x="560" y="410" className="p dark" textAnchor="middle" fontSize="22" filter="url(#carve)"> </text>
          </svg>
        </Box>
    </Box>
  );
}
