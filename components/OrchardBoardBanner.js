// OrchardBoardBanner — Boss v35 orchard bulletin board, site-native React port (S126).
// Scene ported verbatim from based_nut_orchard_board_v35.html (2026-10-19):
// layout, gradients, filters, weather layers, planks, posts, foreground preserved.
// Changes vs the standalone HTML: data fields are live (/api/orchard-board),
// NSI weather is auto-selected from live NSI score, the weather engine is React
// state instead of DOM script, CSS is scoped under .obb-root, and the emblem is
// served from /img/orchard-emblem.png (byte-exact extraction of the embedded art).
import { useEffect, useState } from 'react';

// Board states (v35 verbatim)
const STATES = [
  { key: 'xfear', label: 'X-FEAR', icon: '\u26C8', valueClass: 'stat-word accent-blue', fill: '#6b7fa7', mode: 'stormy', size: '48px' },
  { key: 'fear', label: 'FEAR', icon: '\u2602', valueClass: 'stat-word accent-blue', fill: '#74a7de', mode: 'rainy', size: '58px' },
  { key: 'neutral', label: 'NEUTRAL', icon: '\u26C5', valueClass: 'stat-label ink-soft', fill: '#5a3a1a', mode: 'neutral', size: '34px' },
  { key: 'greed', label: 'GREED', icon: '\u2600', valueClass: 'stat-word', fill: '#e2bb49', mode: 'sunny', size: '50px' },
  { key: 'xgreed', label: 'X-GREED', icon: '\u2600\u224B', valueClass: 'stat-word', fill: '#d07a34', mode: 'hot', size: '42px' },
];
const STATE_INDEX = Object.fromEntries(STATES.map((s, i) => [s.key, i]));

// Weather mode attributes (v35 applyWeather verbatim)
const WEATHER_MODES = {
  sunny:   { sky: '#fcf6d8', sunny: 1, hot: 0, storm: 0, neutral: 0, rain: 0, clouds: 0.06, whiteWash: 0.035, whiteGlow: 0.68 },
  hot:     { sky: '#fff0cd', sunny: 0, hot: 1, storm: 0, neutral: 0, rain: 0, clouds: 0,    whiteWash: 0.025, whiteGlow: 0.42 },
  stormy:  { sky: '#889aa8', sunny: 0, hot: 0, storm: 1, neutral: 0, rain: 0, clouds: 0,    whiteWash: 0.018, whiteGlow: 0.34 },
  neutral: { sky: '#a8cee8', sunny: 0, hot: 0, storm: 0, neutral: 1, rain: 0, clouds: 0.96, whiteWash: 0.002, whiteGlow: 0.12 },
  rainy:   { sky: 'url(#obbSkyRain)', sunny: 0, hot: 0, storm: 0, neutral: 0, rain: 0.48, clouds: 0.86, whiteWash: 0.08, whiteGlow: 1 },
};

const CSS_TEXT = `
  .obb-root { display: block; width: 100%; height: auto; }
  .obb-root .display { font-family: Georgia, 'Palatino Linotype', 'Book Antiqua', serif; }
  .obb-root .headline { font-size: 65px; font-weight: 900; letter-spacing: 0.05em; }
  .obb-root .headline-sub { font-size: 32px; font-weight: 700; letter-spacing: 0.08em; }
  .obb-root .hero-label { font-size: 38px; font-weight: 800; letter-spacing: 0.11em; }
  .obb-root .hero-value { font-size: 106px; font-weight: 900; font-variant-numeric: tabular-nums lining-nums; }
  .obb-root .stat-num { font-size: 58px; font-weight: 900; font-variant-numeric: tabular-nums lining-nums; }
  .obb-root .stat-word { font-size: 58px; font-weight: 900; letter-spacing: 0.03em; }
  .obb-root .stat-label { font-size: 24px; font-weight: 800; letter-spacing: 0.035em; }
  .obb-root .foot { font-size: 27px; font-weight: 800; letter-spacing: 0.03em; }
  .obb-root .cream { fill: #f7e7c7; }
  .obb-root .gold { fill: #f4dc8a; }
  .obb-root .ink { fill: #2f1709; }
  .obb-root .ink-soft { fill: #43210c; }
  .obb-root .accent-green { fill: #63c95b; paint-order: stroke fill; stroke: rgba(60,24,10,0.88); stroke-width: 1.4px; }
  .obb-root .accent-blue { fill: #74a7de; paint-order: stroke fill; stroke: rgba(60,24,10,0.88); stroke-width: 1.4px; }
  .obb-root .cream-stroke { paint-order: stroke fill; stroke: rgba(60,24,10,0.82); stroke-width: 2.2px; }
  .obb-root .ink-stroke { paint-order: stroke fill; stroke: rgba(248,229,193,0.18); stroke-width: 1px; }
`;

function formatCurrency(n) {
  try {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0, useGrouping: true }).format(n || 0);
  } catch {
    return String(Math.round(n || 0));
  }
}

function isoUtcHM(msOrIso) {
  try {
    const d = msOrIso instanceof Date ? msOrIso : new Date(msOrIso);
    if (isNaN(d.getTime())) return '\u2014';
    const p = (x) => String(x).padStart(2, '0');
    return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())} UTC`;
  } catch {
    return '\u2014';
  }
}

export default function OrchardBoardBanner() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const resp = await fetch('/api/orchard-board');
        const json = await resp.json();
        if (!active) return;
        setData(json);
      } catch {
        /* keep last-known */
      }
    };
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => { active = false; clearInterval(id); };
  }, []);

  // Weather auto-drives from the live NSI boardState. No manual control (S126b).
  const liveKey = data && data.boardState ? data.boardState : 'neutral';
  const stateIdx = STATE_INDEX[liveKey] !== undefined ? STATE_INDEX[liveKey] : STATE_INDEX.neutral;
  const st = STATES[stateIdx];
  const w = WEATHER_MODES[st.mode];

  const tvlText = data ? `$${formatCurrency(data.tvl)}` : '\u2014';
  const assetsText = data ? String(data.assets) : '\u2014';
  const poolsText = data ? String(data.pools) : '\u2014';
  const volText = data ? `$${formatCurrency(data.volume24hTotal)}` : '\u2014';
  const deltaNum = data ? Number(data.priceChange24hAvg) : null;
  const deltaText = deltaNum === null ? '\u2014' : `${deltaNum > 0 ? '+' : ''}${deltaNum.toFixed(2)}%`;
  const deltaClass = deltaNum === null ? 'stat-num ink ink-stroke' : deltaNum >= 0 ? 'stat-num accent-green' : 'stat-num accent-blue';
  const nsiWord = data && data.boardState ? st.label : (data ? '\u2014' : st.label);
  const updatedText = data ? `UPDATED ${isoUtcHM(data.checkedAt || (data.nsi && data.nsi.timestamp))}` : 'UPDATED \u2014';

  const ariaLabel = `Orchard market board: total value locked ${tvlText} USD; ${assetsText} tokens; ${poolsText} liquidity pools; 24 hour volume ${volText}; 24 hour change ${deltaText}; NSI ${data && data.nsi ? data.nsi.score : 'unavailable'}; ${updatedText}`;

  return (
    <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto' }} role="img" aria-label={ariaLabel}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1400" className="obb-root" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="obbSkyRain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#86aecf" />
            <stop offset="0.52" stopColor="#bdd1df" />
            <stop offset="1" stopColor="#dfe8e0" />
          </linearGradient>
          <linearGradient id="obbHillBack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6ea457" />
            <stop offset="1" stopColor="#5b8a42" />
          </linearGradient>
          <linearGradient id="obbHillFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#70a846" />
            <stop offset="1" stopColor="#4f8032" />
          </linearGradient>
          <linearGradient id="obbField" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#84bd4d" />
            <stop offset="1" stopColor="#4c862d" />
          </linearGradient>
          <linearGradient id="obbWoodDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9c6733" />
            <stop offset="0.14" stopColor="#ba7d3e" />
            <stop offset="0.44" stopColor="#a5642e" />
            <stop offset="0.82" stopColor="#7c4620" />
            <stop offset="1" stopColor="#5d3115" />
          </linearGradient>
          <linearGradient id="obbWoodMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d09551" />
            <stop offset="0.16" stopColor="#dca160" />
            <stop offset="0.48" stopColor="#bf7939" />
            <stop offset="0.84" stopColor="#995522" />
            <stop offset="1" stopColor="#723914" />
          </linearGradient>
          <linearGradient id="obbWoodLight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d7a15e" />
            <stop offset="0.16" stopColor="#e1a968" />
            <stop offset="0.45" stopColor="#c57f3f" />
            <stop offset="0.84" stopColor="#9b5723" />
            <stop offset="1" stopColor="#723915" />
          </linearGradient>
          <linearGradient id="obbPostWood" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#43220d" />
            <stop offset="0.24" stopColor="#8f5828" />
            <stop offset="0.55" stopColor="#aa6831" />
            <stop offset="0.82" stopColor="#6b3e1c" />
            <stop offset="1" stopColor="#381c0b" />
          </linearGradient>
          <radialGradient id="obbBolt" cx="35%" cy="28%" r="75%">
            <stop offset="0" stopColor="#f7e6c3" />
            <stop offset="0.22" stopColor="#bca98b" />
            <stop offset="0.55" stopColor="#776c5d" />
            <stop offset="1" stopColor="#352f29" />
          </radialGradient>
          <linearGradient id="obbRainFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e8f5ff" stopOpacity="0.56" />
            <stop offset="1" stopColor="#e8f5ff" stopOpacity="0.08" />
          </linearGradient>
          <radialGradient id="obbSoftBackdropGlow" cx="50%" cy="44%" r="56%">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.34" />
            <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="0.78" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id="obbBoardShadow" x="-20%" y="-30%" width="150%" height="180%">
            <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#251408" floodOpacity="0.34" />
          </filter>
          <filter id="obbSoftBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <filter id="obbBadgeShadow" x="-20%" y="-20%" width="140%" height="180%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#1f0d03" floodOpacity="0.30" />
          </filter>
          <filter id="obbTextPop" x="-10%" y="-15%" width="120%" height="140%">
            <feDropShadow dx="0" dy="2.3" stdDeviation="1.1" floodColor="#2a1208" floodOpacity="0.85" />
          </filter>
          <filter id="obbLightningSoftGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.98  0 1 0 0 0.93  0 0 1 0 0.62  0 0 0 1 0" result="tint" />
            <feMerge>
              <feMergeNode in="tint" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="obbThunderAura" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <pattern id="obbRainPattern" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="rotate(14)">
            <animateTransform attributeName="patternTransform" type="translate" additive="sum" from="0 0" to="-12 38" dur="0.85s" repeatCount="indefinite" />
            <path d="M14 0 V30 M40 8 V44" stroke="url(#obbRainFade)" strokeWidth="4" strokeLinecap="round" opacity="0.65" />
            <path d="M2 20 V40 M28 26 V56" stroke="#eef7ff" strokeWidth="2" strokeLinecap="round" opacity="0.33" />
          </pattern>
          <pattern id="obbStormRainPattern" width="42" height="42" patternUnits="userSpaceOnUse" patternTransform="rotate(16)">
            <animateTransform attributeName="patternTransform" type="translate" additive="sum" from="0 0" to="-16 48" dur="0.55s" repeatCount="indefinite" />
            <path d="M8 -4 V31 M28 2 V38" stroke="#eaf6ff" strokeWidth="4.5" strokeLinecap="round" opacity="0.58" />
            <path d="M18 10 V39 M39 -2 V29" stroke="#cfeaff" strokeWidth="2.4" strokeLinecap="round" opacity="0.42" />
          </pattern>
          <radialGradient id="obbSunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#fff7c7" stopOpacity="0.92" />
            <stop offset="0.42" stopColor="#ffe998" stopOpacity="0.60" />
            <stop offset="1" stopColor="#ffe998" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="obbHotGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#fff1a8" stopOpacity="1" />
            <stop offset="0.36" stopColor="#ffc85f" stopOpacity="0.72" />
            <stop offset="1" stopColor="#ffb13b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="obbStormWash" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#223445" stopOpacity="0.50" />
            <stop offset="0.55" stopColor="#526979" stopOpacity="0.30" />
            <stop offset="1" stopColor="#334936" stopOpacity="0.16" />
          </linearGradient>

          <g id="obbBoltMark">
            <circle r="10" fill="#2d180c" opacity="0.35" />
            <circle r="8" fill="url(#obbBolt)" />
            <path d="M-3.5 0 H3.5" stroke="#3a332c" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
            <circle cx="-2" cy="-2.2" r="1.5" fill="#fff" opacity="0.45" />
          </g>
          <g id="obbAcornMark">
            <path d="M0 9 C-15 9 -25 19 -25 36 C-25 53 -12 66 0 72 C12 66 25 53 25 36 C25 19 15 9 0 9Z" fill="#9c5a24" stroke="#5a3215" strokeWidth="4" />
            <path d="M-28 12 C-23 -5 -13 -14 0 -14 C13 -14 23 -5 28 12 C18 6 9 4 0 4 C-9 4 -18 6 -28 12Z" fill="#6d431e" stroke="#4b2c12" strokeWidth="4" />
            <path d="M0 -14 C1 -26 7 -33 14 -38" fill="none" stroke="#4b2c12" strokeWidth="5" strokeLinecap="round" />
            <g stroke="#a2783b" strokeWidth="2" opacity="0.55">
              <path d="M-19 3 L-10 12 M-8 -6 L1 5 M4 -8 L13 4 M15 0 L23 10" />
            </g>
          </g>

          <style>{CSS_TEXT}</style>
        </defs>

        {/* backdrop */}
        <rect id="obbSky" width="1600" height="1400" fill={w.sky} />
        <g id="obbWeatherClouds" opacity={w.clouds}>
          <ellipse cx="225" cy="122" rx="145" ry="56" fill="#d9e5eb" />
          <ellipse cx="333" cy="126" rx="117" ry="46" fill="#c8d7de" />
          <ellipse cx="806" cy="102" rx="148" ry="58" fill="#dbe6ed" opacity="0.92" />
          <ellipse cx="914" cy="112" rx="117" ry="46" fill="#c8d6df" opacity="0.92" />
          <ellipse cx="1315" cy="118" rx="152" ry="58" fill="#dae6ec" />
          <ellipse cx="1436" cy="125" rx="122" ry="48" fill="#c8d6df" />
        </g>
        <path d="M0 450 C138 398 312 403 464 373 C687 328 885 392 1059 355 C1276 309 1403 346 1600 322 L1600 900 L0 900Z" fill="url(#obbHillBack)" />
        <path d="M0 528 C195 447 359 482 538 446 C737 407 886 462 1058 423 C1272 376 1416 429 1600 381 L1600 900 L0 900Z" fill="url(#obbHillFront)" opacity="0.92" />
        <rect y="594" width="1600" height="806" fill="url(#obbField)" />
        <rect id="obbRainLayer" width="1600" height="1400" fill="url(#obbRainPattern)" opacity={w.rain} />

        {/* weather layers */}
        <g id="obbSunnyLayer" opacity={w.sunny} pointerEvents="none">
          <circle cx="1400" cy="112" r="178" fill="url(#obbSunGlow)" />
          <circle cx="1400" cy="112" r="70" fill="#fff09a" opacity="0.98" />
          <circle cx="1400" cy="112" r="108" fill="none" stroke="#ffe598" strokeWidth="12" opacity="0.34" />
          <path d="M1400 -10 V-72 M1400 234 V296 M1278 112 H1210 M1522 112 H1592 M1313 25 L1265 -23 M1487 199 L1535 247 M1487 25 L1535 -23 M1313 199 L1265 247" stroke="#ffe9ad" strokeWidth="9" strokeLinecap="round" opacity="0.28" />
          <rect y="240" width="1600" height="1160" fill="#fff0b9" opacity="0.065" />
          <path d="M0 575 C190 558 360 591 544 571 C738 550 907 590 1091 569 C1283 547 1438 579 1600 560 L1600 900 L0 900Z" fill="#e4d676" opacity="0.13" />
          <path d="M0 430 C236 414 447 437 651 420 C860 402 1068 422 1277 403 C1399 392 1503 396 1600 392" fill="none" stroke="#f0de96" strokeWidth="5" opacity="0.28" strokeLinecap="round" />
        </g>
        <g id="obbNeutralLayer" opacity={w.neutral} pointerEvents="none">
          <rect width="1600" height="365" fill="#a8cee8" opacity="0.58" />
          <rect y="365" width="1600" height="120" fill="#bdd5df" opacity="0.12" />
          <ellipse cx="1320" cy="110" rx="178" ry="78" fill="#eef3d0" opacity="0.08" />
          <g opacity="0.90">
            <ellipse cx="145" cy="130" rx="265" ry="76" fill="#e1eaf0" />
            <ellipse cx="405" cy="142" rx="205" ry="60" fill="#cddce7" />
            <ellipse cx="760" cy="118" rx="326" ry="82" fill="#e6eff5" />
            <ellipse cx="1030" cy="136" rx="224" ry="64" fill="#d0dfeb" />
            <ellipse cx="1362" cy="126" rx="272" ry="76" fill="#e1ebf3" />
            <ellipse cx="1528" cy="142" rx="176" ry="54" fill="#cad9e6" />
            <ellipse cx="560" cy="92" rx="150" ry="34" fill="#eef3f7" opacity="0.54" />
            <ellipse cx="1185" cy="92" rx="142" ry="32" fill="#eef3f7" opacity="0.50" />
          </g>
        </g>
        <g id="obbHotLayer" opacity={w.hot} pointerEvents="none">
          <rect width="1600" height="1400" fill="#ffd277" opacity="0.12" />
          <rect y="300" width="1600" height="1100" fill="#d5a44f" opacity="0.16" />
          <circle cx="1460" cy="118" r="250" fill="url(#obbHotGlow)" />
          <circle cx="1460" cy="118" r="82" fill="#ffe37e" opacity="0.98" />
          <circle cx="1460" cy="118" r="118" fill="none" stroke="#ffcc63" strokeWidth="13" opacity="0.46" />
          <g fill="none" strokeLinecap="round">
            <path d="M50 420 C190 402 318 437 468 417 C624 396 763 435 917 414 C1077 392 1203 428 1370 408 C1450 399 1515 401 1585 394" stroke="#d99b45" strokeWidth="11" opacity="0.42" />
            <path d="M20 468 C181 449 328 483 490 462 C650 441 807 480 965 458 C1126 436 1287 471 1460 449 C1511 443 1552 443 1595 438" stroke="#f6d79a" strokeWidth="7" opacity="0.40" />
            <path d="M110 522 C252 505 388 536 536 516 C680 497 828 530 979 511 C1125 493 1272 524 1423 505" stroke="#c8893b" strokeWidth="7" opacity="0.34" />
            <path d="M160 565 C300 548 430 576 574 559 C720 541 857 573 1004 555 C1148 537 1284 566 1434 548" stroke="#fff0c1" strokeWidth="4" opacity="0.35" />
          </g>
          <path d="M0 590 C190 565 360 604 544 582 C738 559 907 601 1091 578 C1283 554 1438 588 1600 566 L1600 900 L0 900Z" fill="#c2a24d" opacity="0.12" />
        </g>
        <g id="obbStormLayer" opacity={w.storm} pointerEvents="none">
          <rect width="1600" height="1400" fill="url(#obbStormWash)" opacity="1" />
          <rect y="260" width="1600" height="1140" fill="#20343a" opacity="0.16" />
          <rect width="1600" height="1400" fill="url(#obbStormRainPattern)" opacity="0.95" />
          <g fill="#697985" opacity="0.78">
            <animateTransform attributeName="transform" type="translate" values="0 0; -10 2; 0 0; 8 -2; 0 0" dur="7s" repeatCount="indefinite" />
            <ellipse cx="160" cy="125" rx="235" ry="92" />
            <ellipse cx="375" cy="145" rx="265" ry="100" />
            <ellipse cx="1220" cy="128" rx="285" ry="96" />
            <ellipse cx="1450" cy="150" rx="255" ry="95" />
          </g>
          <g fill="#4e616f" opacity="0.44">
            <animateTransform attributeName="transform" type="translate" values="0 0; 12 1; 0 0; -8 -1; 0 0" dur="9s" repeatCount="indefinite" />
            <ellipse cx="280" cy="205" rx="310" ry="82" />
            <ellipse cx="1330" cy="210" rx="320" ry="85" />
          </g>
          <g>
            <ellipse cx="154" cy="182" rx="92" ry="48" fill="#fff4c0" opacity="0.07" filter="url(#obbThunderAura)">
              <animate attributeName="opacity" values="0.04;0.08;0.05;0.09;0.04" dur="5.2s" repeatCount="indefinite" />
            </ellipse>
            <g filter="url(#obbLightningSoftGlow)">
              <animate attributeName="opacity" values="0.18;0.26;0.20;0.28;0.18" dur="5.2s" repeatCount="indefinite" />
              <path d="M145 168 L100 267 L151 254 L105 354 L208 222 L159 235 L190 168 Z" fill="#ffe98b" opacity="0.22" />
            </g>
            <path d="M145 168 L100 267 L151 254 L105 354 L208 222 L159 235 L190 168 Z" fill="#fff0a1" opacity="0.84">
              <animate attributeName="opacity" values="0.76;0.84;0.80;0.88;0.76" dur="5.2s" repeatCount="indefinite" />
            </path>
          </g>
          <g>
            <ellipse cx="1464" cy="190" rx="88" ry="46" fill="#fff2bf" opacity="0.06" filter="url(#obbThunderAura)">
              <animate attributeName="opacity" values="0.03;0.07;0.04;0.08;0.03" dur="6.1s" repeatCount="indefinite" />
            </ellipse>
            <g filter="url(#obbLightningSoftGlow)">
              <animate attributeName="opacity" values="0.16;0.22;0.18;0.24;0.16" dur="6.1s" repeatCount="indefinite" />
              <path d="M1462 176 L1420 258 L1464 248 L1425 340 L1519 225 L1478 237 L1502 176 Z" fill="#fff0a8" opacity="0.20" />
            </g>
            <path d="M1462 176 L1420 258 L1464 248 L1425 340 L1519 225 L1478 237 L1502 176 Z" fill="#fff4b2" opacity="0.80">
              <animate attributeName="opacity" values="0.72;0.80;0.76;0.84;0.72" dur="6.1s" repeatCount="indefinite" />
            </path>
          </g>
        </g>

        <rect id="obbWhiteWash" width="1600" height="1400" fill="#ffffff" opacity={w.whiteWash} />
        <ellipse id="obbWhiteGlow" cx="800" cy="760" rx="760" ry="640" fill="url(#obbSoftBackdropGlow)" opacity={w.whiteGlow} />

        {/* fence */}
        <g opacity="0.32" fill="#74522e">
          <rect x="0" y="662" width="1600" height="13" rx="6" />
          <rect x="0" y="724" width="1600" height="12" rx="6" />
          <rect x="45" y="634" width="24" height="121" rx="6" />
          <rect x="264" y="634" width="24" height="121" rx="6" />
          <rect x="483" y="634" width="24" height="121" rx="6" />
          <rect x="702" y="634" width="24" height="121" rx="6" />
          <rect x="921" y="634" width="24" height="121" rx="6" />
          <rect x="1140" y="634" width="24" height="121" rx="6" />
          <rect x="1359" y="634" width="24" height="121" rx="6" />
        </g>

        {/* orchard emblem (Boss artwork, byte-exact from v35) */}
        <image x="220" y="25" width="1160" height="507" preserveAspectRatio="xMidYMid meet" href="/img/orchard-emblem.png" />

        <ellipse cx="800" cy="1325" rx="642" ry="54" fill="#173117" opacity="0.15" />

        {/* sign assembly */}
        <g transform="translate(0 510)">
          {/* posts */}
          <g>
            <rect x="228" y="91" width="88" height="721" rx="18" fill="url(#obbPostWood)" stroke="#4e2910" strokeWidth="8" />
            <rect x="1286" y="89" width="88" height="723" rx="18" fill="url(#obbPostWood)" stroke="#4e2910" strokeWidth="8" />
            <path d="M246 132 C258 214 236 363 255 790 M281 128 C298 252 271 440 288 790" stroke="#4f2a11" strokeWidth="4" opacity="0.28" fill="none" />
            <path d="M1305 130 C1321 278 1296 474 1318 790 M1338 128 C1356 284 1331 520 1355 790" stroke="#4f2a11" strokeWidth="4" opacity="0.28" fill="none" />
          </g>
          <rect x="214" y="72" width="116" height="23" rx="6" fill="#60341a" />
          <rect x="1272" y="70" width="116" height="23" rx="6" fill="#60341a" />

          {/* planks */}
          <g>
            <path d="M176 105 C236 88 344 94 474 93 C650 89 888 90 1127 93 C1254 95 1374 101 1457 111 C1485 115 1497 132 1495 160 L1484 259 C1481 301 1465 320 1435 326 C1310 341 1104 332 912 332 L328 332 C260 332 206 333 175 323 C149 315 136 296 139 269 L145 155 C147 129 157 113 176 105 Z" fill="url(#obbWoodDark)" stroke="#532b11" strokeWidth="8" />
            <path d="M146 318 C214 298 338 305 512 301 C726 296 1014 299 1272 304 C1388 307 1456 311 1488 320 C1513 327 1526 343 1523 367 L1511 484 C1508 512 1494 528 1470 534 C1430 544 1304 548 1132 548 L502 548 C307 548 203 546 160 536 C133 530 120 517 123 494 L136 357 C138 338 140 327 146 318 Z" fill="url(#obbWoodLight)" stroke="#5c2e11" strokeWidth="8" />
            <path d="M160 555 C234 534 389 544 568 540 C780 535 1036 539 1296 547 C1414 551 1476 558 1503 569 C1523 577 1534 593 1530 616 L1512 747 C1508 780 1493 797 1464 804 C1412 816 1276 816 1108 814 L383 814 C251 814 181 810 151 800 C126 792 114 775 118 748 L133 597 C135 579 142 563 160 555 Z" fill="url(#obbWoodMid)" stroke="#5c2e11" strokeWidth="8" />

            <path d="M197 116 C540 94 976 99 1461 121" stroke="#efc688" strokeWidth="5" opacity="0.23" fill="none" />
            <path d="M168 332 C579 304 1037 309 1491 330" stroke="#f1c88f" strokeWidth="5" opacity="0.22" fill="none" />
            <path d="M182 573 C597 545 1045 553 1496 578" stroke="#f0c080" strokeWidth="5" opacity="0.22" fill="none" />

            <g stroke="#6f3d18" strokeWidth="3" opacity="0.28" fill="none" strokeLinecap="round">
              <path d="M194 151 C310 136 405 159 538 146 C734 126 949 157 1161 140 C1273 132 1379 137 1442 146" />
              <path d="M188 207 C322 192 456 215 594 202 C791 182 990 216 1199 199 C1312 190 1393 196 1454 204" />
              <path d="M187 258 C318 244 448 267 587 254 C786 234 985 269 1195 251 C1310 242 1390 248 1452 256" />
              <path d="M170 373 C333 352 482 386 652 366 C850 343 1049 379 1261 360 C1374 351 1441 358 1497 367" />
              <path d="M163 475 C345 459 528 490 710 472 C924 451 1102 484 1323 468 C1413 462 1468 465 1498 470" />
              <path d="M185 606 C361 588 542 616 737 600 C929 584 1146 611 1328 595 C1406 589 1457 595 1497 601" />
              <path d="M172 742 C381 724 602 754 782 736 C983 715 1144 746 1359 731 C1424 727 1469 730 1492 734" />
              <path d="M394 453 C381 466 374 477 365 490" opacity="0.55" />
              <path d="M709 713 C699 726 690 739 679 757" opacity="0.55" />
              <path d="M1128 220 C1118 230 1110 240 1105 252" opacity="0.55" />
            </g>
            <g fill="none" stroke="#6d3c17" opacity="0.4">
              <ellipse cx="300" cy="212" rx="29" ry="12" strokeWidth="4" />
              <ellipse cx="300" cy="212" rx="14" ry="5.5" strokeWidth="3" />
              <ellipse cx="1368" cy="382" rx="24" ry="10" strokeWidth="4" />
              <ellipse cx="1368" cy="382" rx="12" ry="4.5" strokeWidth="3" />
              <ellipse cx="1000" cy="690" rx="28" ry="11" strokeWidth="4" />
              <ellipse cx="1000" cy="690" rx="13" ry="5" strokeWidth="3" />
            </g>

            <use href="#obbBoltMark" transform="translate(179 182)" />
            <use href="#obbBoltMark" transform="translate(1446 183)" />
            <use href="#obbBoltMark" transform="translate(176 357)" />
            <use href="#obbBoltMark" transform="translate(1484 360)" />
            <use href="#obbBoltMark" transform="translate(175 590)" />
            <use href="#obbBoltMark" transform="translate(1472 598)" />
          </g>

          {/* header */}
          <use href="#obbAcornMark" transform="translate(364 218) scale(.74) rotate(-8)" />
          <use href="#obbAcornMark" transform="translate(1260 217) scale(.74) rotate(8)" />
          <text x="800" y="197" textAnchor="middle" className="display headline cream cream-stroke" filter="url(#obbTextPop)">WELCOME TO THE NUT FARM</text>
          <text x="800" y="283" textAnchor="middle" className="display headline-sub gold cream-stroke" filter="url(#obbTextPop)">ORCHARD MARKET SNAPSHOT</text>

          {/* tvl */}
          <text x="800" y="370" textAnchor="middle" className="display hero-label ink">TOTAL VALUE LOCKED (USD)</text>
          <text x="800" y="472" textAnchor="middle" className="display hero-value gold cream-stroke" filter="url(#obbTextPop)">{tvlText}</text>
          <path d="M350 510 C520 506 668 514 804 511 C975 508 1157 516 1260 511" stroke="#70401b" strokeWidth="3" opacity="0.28" fill="none" />

          {/* bottom board */}
          <g className="display">
            <line x1="428" y1="628" x2="428" y2="713" stroke="#76431b" strokeWidth="3" opacity="0.42" />
            <line x1="676" y1="628" x2="676" y2="713" stroke="#76431b" strokeWidth="3" opacity="0.42" />
            <line x1="924" y1="628" x2="924" y2="713" stroke="#76431b" strokeWidth="3" opacity="0.42" />
            <line x1="1172" y1="628" x2="1172" y2="713" stroke="#76431b" strokeWidth="3" opacity="0.42" />

            <text x="304" y="640" textAnchor="middle" className="stat-label ink-soft">TOKENS</text>
            <text x="304" y="702" textAnchor="middle" className="stat-num ink ink-stroke">{assetsText}</text>

            <text x="552" y="640" textAnchor="middle" className="stat-label ink-soft">LIQUIDITY POOLS</text>
            <text x="552" y="702" textAnchor="middle" className="stat-num ink ink-stroke">{poolsText}</text>

            <text x="800" y="640" textAnchor="middle" className="stat-label ink-soft">24h VOLUME</text>
            <text x="800" y="702" textAnchor="middle" className="stat-num ink ink-stroke">{volText}</text>

            <text x="1048" y="640" textAnchor="middle" className="stat-label ink-soft">24h Î</text>
            <text x="1048" y="702" textAnchor="middle" className={deltaClass}>{deltaText}</text>

            <text x="1296" y="640" textAnchor="middle" className="stat-label ink-soft">NSI</text>
            <text id="obbNsiValue" x="1296" y="702" textAnchor="middle" className={data && data.boardState ? st.valueClass : 'stat-label ink-soft'} style={data && data.boardState ? { fontSize: st.size, fill: st.fill } : undefined}>{nsiWord}</text>

            <g aria-hidden="true">
              <rect x="1238" y="720" width="116" height="30" rx="15" fill="rgba(255,248,235,.58)" stroke="#7b4b21" strokeWidth="1.5" opacity="0.96" />
              <text x="1296" y="742" textAnchor="middle" style={{ fontFamily: 'system-ui, sans-serif', fontSize: 18, fill: st.fill }}>{st.icon}</text>
            </g>

            <path d="M376 760 C536 756 714 762 854 759 C1004 755 1160 763 1320 759" stroke="#70401b" strokeWidth="2.5" opacity="0.24" fill="none" />
            <text x="800" y="792" textAnchor="middle" className="foot ink-soft">{updatedText}</text>
          </g>
        </g>

        {/* foreground */}
        <g transform="translate(0 500)">
          <g fill="#2e6d25" opacity="0.88">
            <path d="M0 900 L0 810 C12 838 16 851 26 900 M34 900 C40 850 50 824 64 798 C65 842 67 872 70 900 M94 900 C102 850 110 824 123 795 C125 842 126 869 130 900 M1460 900 C1468 849 1476 825 1489 797 C1490 841 1491 870 1494 900 M1522 900 C1531 851 1539 826 1551 798 C1552 842 1554 871 1556 900 M1578 900 C1586 851 1592 830 1600 809 L1600 900Z" />
          </g>
          <g transform="translate(136 820)">
            <use href="#obbAcornMark" transform="translate(0 0) scale(.42) rotate(-22)" />
            <use href="#obbAcornMark" transform="translate(48 18) scale(.34) rotate(15)" />
            <use href="#obbAcornMark" transform="translate(85 4) scale(.28) rotate(-3)" />
          </g>
          <g fill="#fff" opacity="0.82">
            <circle cx="98" cy="840" r="4" /><circle cx="1412" cy="846" r="4" /><circle cx="1498" cy="830" r="4" />
          </g>
          <g fill="#efd36a" opacity="0.9"><circle cx="98" cy="840" r="1.8" /><circle cx="1412" cy="846" r="1.8" /><circle cx="1498" cy="830" r="1.8" /></g>
        </g>
      </svg>
    </div>
  );
}
