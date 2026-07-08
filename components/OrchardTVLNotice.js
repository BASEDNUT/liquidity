import { useEffect, useState, useMemo } from 'react';
import { Box } from '@mui/material';

function formatCurrency(n) {
  try {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0, useGrouping: true }).format(n || 0);
  } catch {
    return String(Math.round(n || 0));
  }
}

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
    const id = setInterval(load, 5 * 60 * 1000);
    return () => { active = false; clearInterval(id); };
  }, []);

  const { tvl, assets, pools, timestamp, checkedAt, volume24hTotal, priceChange24hAvg } = useMemo(() => {
    const d = state?.data || {};
    return {
      tvl: d.tvl ?? 0,
      assets: d.assets ?? 0,
      pools: d.pools ?? 0,
      timestamp: d.timestamp,
      checkedAt: d.checkedAt,
      volume24hTotal: d.volume24hTotal ?? 0,
      priceChange24hAvg: d.priceChange24hAvg ?? 0,
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

  const cssText = `
    .h1 { font-family: Georgia, 'Times New Roman', serif; font-weight: 700; letter-spacing: 0.10em; }
    .tvl-num { font-family: Georgia, 'Times New Roman', serif; font-weight: 900; letter-spacing: 0.01em; }
    .tvl-label { font-family: Georgia, 'Times New Roman', serif; font-weight: 700; letter-spacing: 0.14em; }
    .stat-num { font-family: Georgia, 'Times New Roman', serif; font-weight: 800; letter-spacing: 0.02em; font-variant-numeric: tabular-nums lining-nums; }
    .stat-label { font-family: Georgia, 'Times New Roman', serif; font-weight: 600; letter-spacing: 0.08em; }
    .stamp { font-family: Georgia, 'Times New Roman', serif; font-weight: 500; letter-spacing: 0.04em; font-variant-numeric: tabular-nums; }
    .carved-gold { fill: #ffe580; }
    .carved-cream { fill: #fff2cc; }
    .carved-warm { fill: #f0dba8; }
    .carved-dark { fill: #1a0e04; }
    .pos { fill: #4a9e3a; } .neg { fill: #c63838; } .neu { fill: #8a7a5a; }
    .gold-stroke { paint-order: stroke fill; stroke: rgba(30,18,6,0.55); stroke-width: 2px; }
    .cream-stroke { paint-order: stroke fill; stroke: rgba(30,18,6,0.40); stroke-width: 1.2px; }
    .dark-stroke { paint-order: stroke fill; stroke: rgba(255,240,210,0.25); stroke-width: 0.8px; }
  `;

  return (
  <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto', mb: dense ? 1 : 1 }} aria-label="Orchard TVL notice">
    <Box component="div" sx={{ width: '100%' }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 540" width="100%" style={{ height: 'auto' }} role="img" aria-labelledby="title desc" aria-label={ariaLabel} preserveAspectRatio="xMidYMid meet" textRendering="geometricPrecision">
        <title id="title">BASED NUT — Orchard Bulletin Board</title>
        <desc id="desc">Rustic three-plank board on two posts with carved lettering and grass, showing TVL and 24h metrics.</desc>

        <defs>
          {/* Drop shadow for posts and planks */}
          <filter id="drop" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="3" dy="6" stdDeviation="4" floodColor="#000" floodOpacity="0.45" />
          </filter>
          <filter id="shadowBlur" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5"/>
          </filter>

          {/* Deep rich wood gradients — per plank with warm and cool variation */}
          <linearGradient id="woodFill1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#4a2d14"/>
            <stop offset="0.08" stopColor="#6b4423"/>
            <stop offset="0.20" stopColor="#8a5a30"/>
            <stop offset="0.42" stopColor="#a67342"/>
            <stop offset="0.58" stopColor="#b07d48"/>
            <stop offset="0.78" stopColor="#8a5a30"/>
            <stop offset="0.92" stopColor="#6b4423"/>
            <stop offset="1" stopColor="#4a2d14"/>
          </linearGradient>
          <linearGradient id="woodFill2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#503018"/>
            <stop offset="0.08" stopColor="#735030"/>
            <stop offset="0.22" stopColor="#946230"/>
            <stop offset="0.45" stopColor="#b88454"/>
            <stop offset="0.58" stopColor="#c08c5a"/>
            <stop offset="0.78" stopColor="#946230"/>
            <stop offset="0.92" stopColor="#735030"/>
            <stop offset="1" stopColor="#503018"/>
          </linearGradient>
          <linearGradient id="woodFill3" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#452810"/>
            <stop offset="0.08" stopColor="#684520"/>
            <stop offset="0.22" stopColor="#86582b"/>
            <stop offset="0.42" stopColor="#a87040"/>
            <stop offset="0.58" stopColor="#ac7742"/>
            <stop offset="0.78" stopColor="#86582b"/>
            <stop offset="0.92" stopColor="#684520"/>
            <stop offset="1" stopColor="#452810"/>
          </linearGradient>

          {/* Vertical bevel — stronger 3D depth with top highlight and bottom shadow */}
          <linearGradient id="bevelV" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1a0a00" stopOpacity="0.55"/>
            <stop offset="0.06" stopColor="#000" stopOpacity="0.30"/>
            <stop offset="0.14" stopColor="#fff" stopOpacity="0.12"/>
            <stop offset="0.30" stopColor="#fff" stopOpacity="0.04"/>
            <stop offset="0.50" stopColor="#fff" stopOpacity="0.02"/>
            <stop offset="0.70" stopColor="#000" stopOpacity="0.04"/>
            <stop offset="0.86" stopColor="#000" stopOpacity="0.18"/>
            <stop offset="0.94" stopColor="#000" stopOpacity="0.35"/>
            <stop offset="1" stopColor="#000" stopOpacity="0.50"/>
          </linearGradient>

          {/* Radial lighting — warm spotlight from upper left */}
          <radialGradient id="lightOverlay" cx="35%" cy="12%" r="70%">
            <stop offset="0" stopColor="#fff3d0" stopOpacity="0.22"/>
            <stop offset="0.25" stopColor="#ffe8b0" stopOpacity="0.10"/>
            <stop offset="0.55" stopColor="#000" stopOpacity="0.0"/>
            <stop offset="1" stopColor="#0a0500" stopOpacity="0.35"/>
          </radialGradient>

          {/* Post gradients — darker, weathered wood */}
          <linearGradient id="postFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a230f"/>
            <stop offset="0.15" stopColor="#4a2d14"/>
            <stop offset="0.5" stopColor="#5b371a"/>
            <stop offset="0.85" stopColor="#3a230f"/>
            <stop offset="1" stopColor="#2e1a08"/>
          </linearGradient>
          <linearGradient id="postWood" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2a1808"/>
            <stop offset="0.15" stopColor="#5a3820"/>
            <stop offset="0.35" stopColor="#7a4f28"/>
            <stop offset="0.5" stopColor="#8a5a30"/>
            <stop offset="0.65" stopColor="#7a4f28"/>
            <stop offset="0.85" stopColor="#5a3820"/>
            <stop offset="1" stopColor="#2a1808"/>
          </linearGradient>

          {/* Rich organic grain pattern — long flowing lines with varied curvature */}
          <pattern id="grain" width="220" height="62" patternUnits="userSpaceOnUse">
            {/* Primary dark grain lines — long flowing curves */}
            <g stroke="#3d2812" strokeWidth="1.1" opacity="0.35" fill="none" vectorEffect="non-scaling-stroke">
              <path d="M-30 6 C40 -4 80 16 120 6 C160 -4 200 16 250 6"/>
              <path d="M-30 16 C35 6 75 26 120 16 C160 6 200 26 250 16"/>
              <path d="M-30 26 C30 16 70 36 120 26 C165 16 205 36 250 26"/>
              <path d="M-30 36 C40 26 80 46 120 36 C160 26 200 46 250 36"/>
              <path d="M-30 46 C35 36 75 56 120 46 C160 36 200 56 250 46"/>
              <path d="M-30 56 C40 46 80 66 120 56 C160 46 200 66 250 56"/>
            </g>
            {/* Secondary lighter grain — finer, offset */}
            <g stroke="#6b4525" strokeWidth="0.7" opacity="0.22" fill="none" vectorEffect="non-scaling-stroke">
              <path d="M-30 10 C45 2 85 22 120 10 C155 2 195 22 250 10"/>
              <path d="M-30 20 C40 12 80 32 120 20 C160 12 200 32 250 20"/>
              <path d="M-30 30 C35 22 75 42 120 30 C165 22 205 42 250 30"/>
              <path d="M-30 40 C45 32 85 52 120 40 C155 32 195 52 250 40"/>
              <path d="M-30 50 C40 42 80 62 120 50 C160 42 200 62 250 50"/>
            </g>
            {/* Tertiary ultra-fine grain */}
            <g stroke="#8a5a30" strokeWidth="0.4" opacity="0.14" fill="none" vectorEffect="non-scaling-stroke">
              <path d="M-30 3 C50 -3 90 13 120 3 C170 -3 210 13 250 3"/>
              <path d="M-30 13 C45 7 85 23 120 13 C160 7 200 23 250 13"/>
              <path d="M-30 23 C40 17 80 33 120 23 C165 17 205 33 250 23"/>
              <path d="M-30 33 C50 27 90 43 120 33 C170 27 210 43 250 33"/>
              <path d="M-30 43 C45 37 85 53 120 43 C160 37 200 53 250 43"/>
              <path d="M-30 53 C40 47 80 63 120 53 C165 47 205 63 250 53"/>
            </g>
            {/* Knots with surrounding distortion rings */}
            <g opacity="0.40" fill="none" stroke="#2a1808" strokeWidth="1.2" vectorEffect="non-scaling-stroke">
              <ellipse cx="130" cy="28" rx="14" ry="8"/>
              <ellipse cx="130" cy="28" rx="9" ry="5"/>
              <ellipse cx="130" cy="28" rx="5" ry="3"/>
            </g>
            <g opacity="0.28" fill="none" stroke="#4a2d14" strokeWidth="0.9" vectorEffect="non-scaling-stroke">
              <ellipse cx="130" cy="28" rx="18" ry="11"/>
              <path d="M112 28 C118 22 122 34 130 28 C138 22 142 34 148 28"/>
            </g>
            <g opacity="0.32" fill="none" stroke="#2a1808" strokeWidth="1.0" vectorEffect="non-scaling-stroke">
              <ellipse cx="55" cy="48" rx="10" ry="6"/>
              <ellipse cx="55" cy="48" rx="6" ry="4"/>
              <ellipse cx="55" cy="48" rx="3" ry="2"/>
            </g>
            <g opacity="0.30" fill="none" stroke="#2a1808" strokeWidth="0.9" vectorEffect="non-scaling-stroke">
              <ellipse cx="185" cy="15" rx="7" ry="4"/>
              <ellipse cx="185" cy="15" rx="4" ry="2.5"/>
            </g>
            <g opacity="0.25" fill="none" stroke="#4a2d14" strokeWidth="0.7" vectorEffect="non-scaling-stroke">
              <ellipse cx="95" cy="20" rx="5" ry="3"/>
              <ellipse cx="170" cy="44" rx="8" ry="5"/>
              <ellipse cx="170" cy="44" rx="4" ry="2.5"/>
            </g>
          </pattern>

          {/* Surface noise — fine fractal roughness */}
          <filter id="surfaceNoise" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="5" result="noise"/>
            <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.28  0 0 0 0 0.18  0 0 0 0 0.08  0 0 0 0.12 0"/>
            <feComposite operator="in" in2="SourceGraphic" result="textured"/>
            <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="textured"/></feMerge>
          </filter>

          {/* Stronger rough edge displacement */}
          <filter id="rough" x="-12%" y="-12%" width="124%" height="124%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="5" seed="9" result="r"/>
            <feDisplacementMap in="SourceGraphic" in2="r" scale="6" xChannelSelector="R" yChannelSelector="G"/>
          </filter>

          {/* Deep carve filter for text engraving */}
          <filter id="carve">
            <feOffset dy="1.5" in="SourceAlpha" result="o"/>
            <feGaussianBlur in="o" stdDeviation="1.2" result="g"/>
            <feComposite in="g" in2="SourceAlpha" operator="arithmetic" k2="-1.2" k3="1.2" result="inner"/>
            <feColorMatrix in="inner" type="matrix" values="0 0 0 0 0.10  0 0 0 0 0.06  0 0 0 0 0.03  0 0 0 1.2 0"/>
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Inner shadow for plank edges — deeper groove effect */}
          <filter id="innerShadow" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
            <feOffset dy="3" in="blur" result="offsetBlur"/>
            <feComposite in="offsetBlur" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"/>
            <feColorMatrix in="shadowDiff" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0" result="shadow"/>
            <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="shadow"/></feMerge>
          </filter>

          {/* Nail — weathered metal */}
          <radialGradient id="nail" cx="35%" cy="30%" r="70%">
            <stop offset="0" stopColor="#e8e8e8"/>
            <stop offset="0.35" stopColor="#c0c4c8"/>
            <stop offset="0.7" stopColor="#7a7f84"/>
            <stop offset="1" stopColor="#4a4f54"/>
          </radialGradient>
          <radialGradient id="nailRust" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#8a5a20" stopOpacity="0"/>
            <stop offset="0.7" stopColor="#6a4a18" stopOpacity="0.0"/>
            <stop offset="1" stopColor="#5a3a15" stopOpacity="0.35"/>
          </radialGradient>

          {/* Dark scorched text zone — darkens wood behind lettering for contrast */}
          <radialGradient id="smoothZone" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#1a0a00" stopOpacity="0.72"/>
            <stop offset="0.2" stopColor="#2a1808" stopOpacity="0.60"/>
            <stop offset="0.45" stopColor="#3a2210" stopOpacity="0.35"/>
            <stop offset="0.7" stopColor="#4a2d14" stopOpacity="0.15"/>
            <stop offset="1" stopColor="#4a2d14" stopOpacity="0"/>
          </radialGradient>

          {/* Text glow — subtle halo for pop against dark zone */}
          <filter id="textGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="glow"/>
            <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          <linearGradient id="grassG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#66c24f"/>
            <stop offset="1" stopColor="#2f7a2b"/>
          </linearGradient>

          <style dangerouslySetInnerHTML={{ __html: cssText }} />

          {/* Plank paths — organic curved shapes */}
          <path id="plank1" d="M120,168 C156,156 246,160 300,166 L1000,180 c28,6 44,22 44,40 v26 c-2,16-16,28-44,32 L300,270 c-64,6-154,6-190,-8 c-18,-8-24,-22-22,-36 l2,-30 c2,-12 6,-20 20,-28z"/>
          <path id="plank2" d="M112,244 C150,232 244,238 300,240 L1008,256 c30,8 44,24 44,42 v32 c-2,16-16,30-44,34 L302,362 c-66,6-158,6-196,-10 c-16,-8-22,-22-20,-38 l2,-42 c2,-12 8,-22 18,-28z"/>
          <path id="plank3" d="M118,322 C154,308 246,314 300,318 L1002,336 c26,10 42,28 42,46 v50 c-2,22-16,38-42,42 L304,500 c-70,8-162,8-198,-12 c-14,-10-18,-26-16,-40 l2,-56 c2,-14 8,-24 16,-32z"/>

          {/* Clip paths for overlays per plank */}
          <clipPath id="clip1"><use href="#plank1"/></clipPath>
          <clipPath id="clip2"><use href="#plank2"/></clipPath>
          <clipPath id="clip3"><use href="#plank3"/></clipPath>
        </defs>

        {/* Grounded shadows — darker, more atmospheric */}
        <g pointerEvents="none" opacity="0.35">
          <ellipse cx="192" cy="515" rx="100" ry="20" fill="#000" filter="url(#shadowBlur)"/>
          <ellipse cx="952" cy="515" rx="100" ry="20" fill="#000" filter="url(#shadowBlur)"/>
          <ellipse cx="550" cy="528" rx="380" ry="30" fill="#000" opacity="0.18" filter="url(#shadowBlur)"/>
        </g>

        {/* Posts with rich wood grain and weathering */}
        <g filter="url(#drop)">
          {/* Left post */}
          <rect x="160" y="140" width="64" height="360" rx="8" fill="url(#postFill)"/>
          <rect x="160" y="140" width="64" height="360" rx="8" fill="url(#postWood)" opacity="0.65"/>
          {/* Post grain lines */}
          <g opacity="0.25" stroke="#2a1808" strokeWidth="0.8" fill="none">
            <path d="M170 150 C168 200 172 300 170 530"/>
            <path d="M185 148 C183 180 187 280 185 532"/>
            <path d="M200 150 C198 220 202 320 200 530"/>
            <path d="M212 148 C210 190 214 290 212 534"/>
          </g>
          {/* Post top highlight */}
          <rect x="160" y="140" width="64" height="12" rx="6" fill="#fff" opacity="0.08"/>
          {/* Post cap */}
          <rect x="153" y="132" width="78" height="16" rx="5" fill="#3a230f"/>
          <rect x="153" y="132" width="78" height="6" rx="3" fill="#5a3820" opacity="0.6"/>

          {/* Right post */}
          <rect x="920" y="140" width="64" height="360" rx="8" fill="url(#postFill)"/>
          <rect x="920" y="140" width="64" height="360" rx="8" fill="url(#postWood)" opacity="0.65"/>
          <g opacity="0.25" stroke="#2a1808" strokeWidth="0.8" fill="none">
            <path d="M930 150 C928 200 932 300 930 530"/>
            <path d="M945 148 C943 180 947 280 945 532"/>
            <path d="M960 150 C958 220 962 320 960 530"/>
            <path d="M972 148 C970 190 974 290 972 534"/>
          </g>
          <rect x="920" y="140" width="64" height="12" rx="6" fill="#fff" opacity="0.08"/>
          <rect x="913" y="132" width="78" height="16" rx="5" fill="#3a230f"/>
          <rect x="913" y="132" width="78" height="6" rx="3" fill="#5a3820" opacity="0.6"/>
        </g>

        {/* Grass with flowers */}
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

        {/* PLANK 1 — top */}
        <g filter="url(#drop)">
          <g filter="url(#rough)">
            <use href="#plank1" fill="url(#woodFill1)"/>
            <use href="#plank1" fill="url(#grain)" opacity="0.32"/>
            <g clipPath="url(#clip1)">
              <rect x="100" y="160" width="960" height="120" fill="url(#bevelV)"/>
            </g>
            <g clipPath="url(#clip1)">
              <rect x="100" y="160" width="960" height="120" fill="url(#lightOverlay)"/>
            </g>
            {/* Surface noise for roughness */}
            <g clipPath="url(#clip1)" filter="url(#surfaceNoise)">
              <rect x="100" y="160" width="960" height="120" fill="#8a5a30" opacity="0.3"/>
            </g>
            {/* Dark smooth zone behind header text */}
            <g clipPath="url(#clip1)">
              <rect x="240" y="175" width="640" height="80" rx="40" fill="url(#smoothZone)"/>
            </g>
            {/* Inner shadow for depth */}
            <use href="#plank1" fill="none" stroke="#1a0a00" strokeWidth="3" opacity="0.5" filter="url(#innerShadow)"/>
            {/* Edge highlight */}
            <use href="#plank1" fill="none" stroke="#c89860" strokeWidth="1" opacity="0.30" transform="translate(0,1.5)"/>
            {/* Nails with rust */}
            <circle cx="186" cy="208" r="6.5" fill="url(#nail)"/>
            <circle cx="186" cy="208" r="6.5" fill="url(#nailRust)"/>
            <circle cx="184" cy="206" r="2" fill="#fff" opacity="0.5"/>
            <circle cx="1026" cy="212" r="6.5" fill="url(#nail)"/>
            <circle cx="1026" cy="212" r="6.5" fill="url(#nailRust)"/>
            <circle cx="1024" cy="210" r="2" fill="#fff" opacity="0.5"/>
          </g>
        </g>

        {/* Dark gap between plank 1 and 2 — deeper shadow groove */}
        <line x1="120" y1="270" x2="1044" y2="278" stroke="#0a0500" strokeWidth="4" opacity="0.6"/>
        <line x1="120" y1="272" x2="1044" y2="280" stroke="#000" strokeWidth="2" opacity="0.4"/>

        {/* PLANK 2 — middle */}
        <g filter="url(#drop)">
          <g filter="url(#rough)">
            <use href="#plank2" fill="url(#woodFill2)"/>
            <use href="#plank2" fill="url(#grain)" opacity="0.32"/>
            <g clipPath="url(#clip2)">
              <rect x="100" y="238" width="960" height="160" fill="url(#bevelV)"/>
            </g>
            <g clipPath="url(#clip2)">
              <rect x="100" y="238" width="960" height="160" fill="url(#lightOverlay)"/>
            </g>
            <g clipPath="url(#clip2)" filter="url(#surfaceNoise)">
              <rect x="100" y="238" width="960" height="160" fill="#946230" opacity="0.3"/>
            </g>
            {/* Dark smooth zone behind TVL number — wider for full text area */}
            <g clipPath="url(#clip2)">
              <rect x="180" y="255" width="760" height="110" rx="55" fill="url(#smoothZone)"/>
            </g>
            <use href="#plank2" fill="none" stroke="#1a0a00" strokeWidth="3" opacity="0.5" filter="url(#innerShadow)"/>
            <use href="#plank2" fill="none" stroke="#c89860" strokeWidth="1" opacity="0.30" transform="translate(0,1.5)"/>
            <circle cx="176" cy="296" r="6.5" fill="url(#nail)"/>
            <circle cx="176" cy="296" r="6.5" fill="url(#nailRust)"/>
            <circle cx="174" cy="294" r="2" fill="#fff" opacity="0.5"/>
            <circle cx="1036" cy="300" r="6.5" fill="url(#nail)"/>
            <circle cx="1036" cy="300" r="6.5" fill="url(#nailRust)"/>
            <circle cx="1034" cy="298" r="2" fill="#fff" opacity="0.5"/>
          </g>
        </g>

        {/* Dark gap between plank 2 and 3 */}
        <line x1="112" y1="366" x2="1052" y2="374" stroke="#0a0500" strokeWidth="4" opacity="0.6"/>
        <line x1="112" y1="368" x2="1052" y2="376" stroke="#000" strokeWidth="2" opacity="0.4"/>

        {/* PLANK 3 — bottom */}
        <g filter="url(#drop)">
          <g filter="url(#rough)">
            <use href="#plank3" fill="url(#woodFill3)"/>
            <use href="#plank3" fill="url(#grain)" opacity="0.32"/>
            <g clipPath="url(#clip3)">
              <rect x="100" y="316" width="960" height="200" fill="url(#bevelV)"/>
            </g>
            <g clipPath="url(#clip3)">
              <rect x="100" y="316" width="960" height="200" fill="url(#lightOverlay)"/>
            </g>
            <g clipPath="url(#clip3)" filter="url(#surfaceNoise)">
              <rect x="100" y="316" width="960" height="200" fill="#86582b" opacity="0.3"/>
            </g>
            {/* Dark smooth zone behind stats — full plank 3 text area */}
            <g clipPath="url(#clip3)">
              <rect x="160" y="370" width="800" height="120" rx="60" fill="url(#smoothZone)"/>
            </g>
            <use href="#plank3" fill="none" stroke="#1a0a00" strokeWidth="3" opacity="0.5" filter="url(#innerShadow)"/>
            <use href="#plank3" fill="none" stroke="#c89860" strokeWidth="1" opacity="0.30" transform="translate(0,1.5)"/>
            <circle cx="186" cy="368" r="6.5" fill="url(#nail)"/>
            <circle cx="186" cy="368" r="6.5" fill="url(#nailRust)"/>
            <circle cx="184" cy="366" r="2" fill="#fff" opacity="0.5"/>
            <circle cx="1024" cy="372" r="6.5" fill="url(#nail)"/>
            <circle cx="1024" cy="372" r="6.5" fill="url(#nailRust)"/>
            <circle cx="1022" cy="370" r="2" fill="#fff" opacity="0.5"/>
          </g>
        </g>

        {/* Text — bold Georgia carved typography */}
        <text x="560" y="212" className="h1 carved-cream cream-stroke" textAnchor="middle" fontSize="28" filter="url(#carve)">
          WELCOME TO THE NUT FARM
        </text>

        <text x="560" y="302" className="tvl-num carved-gold gold-stroke" textAnchor="middle" fontSize="76" filter="url(#textGlow)">
          {tvlText}
        </text>

        <text x="560" y="340" className="tvl-label carved-warm" textAnchor="middle" fontSize="26" filter="url(#textGlow)">
          TOTAL VALUE LOCKED (USD)
        </text>

        <line x1="220" y1="370" x2="900" y2="370" stroke="#3a2210" strokeWidth="1.5" opacity="0.35" strokeDasharray="4 6"/>

        <text x="280" y="406" className="stat-num carved-gold" textAnchor="middle" fontSize="36" filter="url(#textGlow)">
          {assets}
        </text>
        <text x="280" y="430" className="stat-label carved-warm" textAnchor="middle" fontSize="20" filter="url(#textGlow)">
          TOKENS
        </text>

        <text x="560" y="406" className="stat-num carved-gold" textAnchor="middle" fontSize="36" filter="url(#textGlow)">
          {pools}
        </text>
        <text x="560" y="430" className="stat-label carved-warm" textAnchor="middle" fontSize="20" filter="url(#textGlow)">
          LIQUIDITY POOLS
        </text>

        <text x="840" y="406" className="stat-num carved-gold" textAnchor="middle" fontSize="36" filter="url(#textGlow)">
          {volText}
        </text>
        <text x="840" y="430" className="stat-label carved-warm" textAnchor="middle" fontSize="20" filter="url(#textGlow)">
          24h VOLUME
        </text>

        <text x="560" y="464" textAnchor="middle" fontSize="24" filter="url(#textGlow)">
          <tspan className="stat-label carved-warm">24h Δ </tspan>
          <tspan className={`stat-num ${priceClass}`}>{priceText}</tspan>
        </text>

        <text x="560" y="488" className="stamp carved-dark" textAnchor="middle" fontSize="17" opacity="0.75" filter="url(#textGlow)">
          {shortStamp}
        </text>
      </svg>
    </Box>
  </Box>
  );
}
