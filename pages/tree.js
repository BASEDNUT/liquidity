import React, {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import Head from "next/head";
import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Modal,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import Layout from "../components/Layout";
import nutTreeData from "../utils/fetchTokens.js";

/**
 * BASED NUT Liquidity Tree
 * Single-file production refactor.
 *
 * Design principles:
 * - SVG owns the map/tree artwork.
 * - React owns interaction state.
 * - MUI owns shell, modal, and info panels.
 * - SVG-native <animate> owns motion for consistent rendering.
 * - No render-time Math.random().
 */

const BRAND = {
  ink: "#2B1A10",
  bark950: "#241004",
  bark900: "#321708",
  bark800: "#4B240B",
  bark700: "#633315",
  bark600: "#78370F",
  bark500: "#8B4513",
  bark400: "#B56B2B",
  bark300: "#D59022",
  bark200: "#E8B875",

  soil950: "#211006",
  soil900: "#2B170B",
  soil800: "#3F210F",
  soil700: "#633315",
  soil600: "#8A4A1F",
  soil500: "#A76632",

  leaf950: "#17351F",
  leaf900: "#1E4628",
  leaf800: "#275A31",
  leaf700: "#36713D",
  leaf600: "#4D9546",
  leaf500: "#62AD46",
  leaf400: "#82C957",
  leaf300: "#A8E46E",
  leaf200: "#D8FF92",

  gold: "#FFD700",
  gold2: "#FFD000",
  amber: "#FFA500",
  orange: "#FF8A2A",

  cream: "#FFF3D2",
  cream2: "#FFEECF",
  panel: "rgba(255, 238, 204, 0.88)",
  panelStrong: "rgba(255, 244, 220, 0.94)",

  greenFlow: "#B8F777",
  goldFlow: "#FFD000",
  rootFlow: "#8A4A1F",
};

const VIEWBOX = {
  width: 1400,
  height: 850,
};

const FALLBACK_DATA = {
  trunk: {
    name: "NUT",
    icon: "🌰",
    color: "#8B4513",
    role: "Liquidity Anchor",
    utility: "The root parent token anchoring the BASED NUT ecosystem.",
  },
  branches: [
    {
      name: "SNUT",
      icon: "🔥",
      color: "#4A7C59",
      role: "Burn Pressure",
      utility: "Routes deflationary pressure through the ecosystem.",
    },
    {
      name: "pNUT",
      icon: "🌰",
      color: "#FFA500",
      role: "Liquidity Balance",
      utility: "Index/liquidity layer balancing deflationary forces.",
    },
  ],
  nestedTokens: [
    { name: "Nested", icon: "🍃", color: "#71CC31", role: "Child Layer" },
    { name: "Child", icon: "🌿", color: "#71CC31", role: "Nested Token" },
    { name: "Canopy", icon: "🍀", color: "#71CC31", role: "Epiphyte" },
    { name: "Layer", icon: "🌱", color: "#71CC31", role: "Nested Token" },
    { name: "Epiphyte", icon: "🪴", color: "#71CC31", role: "Micro Ecosystem" },
  ],
  soil: [
    { name: "Pool", icon: "💧", color: "#8B4513", role: "Liquidity Pool" },
    { name: "LP", icon: "🌱", color: "#8B4513", role: "LP Position" },
    { name: "Aero", icon: "💵", color: "#8B4513", role: "Aero vAMM" },
    { name: "UniV3", icon: "✈️", color: "#8B4513", role: "UniV3 Pool" },
    { name: "Depth", icon: "🌊", color: "#8B4513", role: "AMM Depth" },
  ],
};

function normalizeTreeData(data) {
  const safeData = data && typeof data === "object" ? data : FALLBACK_DATA;

  return {
    trunk: safeData.trunk || FALLBACK_DATA.trunk,
    branches:
      Array.isArray(safeData.branches) && safeData.branches.length
        ? safeData.branches
        : FALLBACK_DATA.branches,
    nestedTokens:
      Array.isArray(safeData.nestedTokens) && safeData.nestedTokens.length
        ? safeData.nestedTokens
        : FALLBACK_DATA.nestedTokens,
    soil:
      Array.isArray(safeData.soil) && safeData.soil.length
        ? safeData.soil
        : FALLBACK_DATA.soil,
  };
}

function sanitizeSvgId(value) {
  return String(value || "nut")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .replace(/^(\d)/, "nut-$1");
}

function darkenColor(hex, amount = 0.18) {
  if (!hex || typeof hex !== "string" || !hex.startsWith("#")) {
    return BRAND.bark700;
  }

  const raw = hex.replace("#", "");
  if (raw.length !== 6) return BRAND.bark700;

  const r = Math.floor(parseInt(raw.slice(0, 2), 16) * (1 - amount));
  const g = Math.floor(parseInt(raw.slice(2, 4), 16) * (1 - amount));
  const b = Math.floor(parseInt(raw.slice(4, 6), 16) * (1 - amount));

  return `rgb(${r}, ${g}, ${b})`;
}

function shortRole(role = "", max = 28) {
  if (!role) return "";
  return role.length <= max ? role : `${role.slice(0, max - 1)}…`;
}

function tokenName(token) {
  return String(token?.name || "").toLowerCase();
}

function tokenRole(token) {
  return String(token?.role || "").toLowerCase();
}

function isPnut(token) {
  return tokenName(token).includes("pnut") || tokenRole(token).includes("liquidity");
}

function isSnut(token) {
  return tokenName(token).includes("snut") || tokenRole(token).includes("burn");
}

function getTokenCategory(data, token) {
  if (!token) return "unknown";

  if (data.trunk?.name === token.name) return "trunk";
  if (data.branches?.some((item) => item.name === token.name)) return "branch";
  if (data.nestedTokens?.some((item) => item.name === token.name)) return "canopy";
  if (data.soil?.some((item) => item.name === token.name)) return "soil";

  return "unknown";
}

function getAllTokens(data) {
  return [
    ...(data.nestedTokens || []),
    ...(data.branches || []),
    data.trunk,
    ...(data.soil || []),
  ].filter(Boolean);
}

function getTreeLayout(data) {
  const positions = {};

  const canopySlots = [
    { x: 250, y: 286 },
    { x: 420, y: 220 },
    { x: 590, y: 175 },
    { x: 700, y: 160 },
    { x: 810, y: 175 },
    { x: 980, y: 220 },
    { x: 1150, y: 286 },
    { x: 515, y: 305 },
    { x: 700, y: 280 },
    { x: 885, y: 305 },
  ];

  const branchSlots = [
    {
      x: 395,
      y: 420,
      side: "left",
      anchor: { x: 688, y: 420 },
      label: "SNUT burn branch",
    },
    {
      x: 1005,
      y: 420,
      side: "right",
      anchor: { x: 732, y: 420 },
      label: "pNUT liquidity branch",
    },
    {
      x: 520,
      y: 355,
      side: "left",
      anchor: { x: 690, y: 375 },
      label: "branch route",
    },
    {
      x: 880,
      y: 355,
      side: "right",
      anchor: { x: 730, y: 375 },
      label: "branch route",
    },
  ];

  const rootSlots = [
    { x: 270, y: 735 },
    { x: 485, y: 785 },
    { x: 700, y: 800 },
    { x: 915, y: 785 },
    { x: 1130, y: 735 },
    { x: 150, y: 680 },
    { x: 1250, y: 680 },
  ];

  if (data.trunk?.name) {
    positions[data.trunk.name] = {
      x: 700,
      y: 555,
      category: "trunk",
      anchor: { x: 700, y: 520 },
    };
  }

  data.branches.forEach((token, index) => {
    const slot = branchSlots[index % branchSlots.length];

    positions[token.name] = {
      ...slot,
      category: "branch",
      branchIndex: index,
    };
  });

  data.nestedTokens.forEach((token, index) => {
    const slot =
      canopySlots[index] ||
      (() => {
        const pct = index / Math.max(1, data.nestedTokens.length - 1);
        const x = 230 + pct * 940;
        const y = 295 - Math.sin(pct * Math.PI) * 135;
        return { x, y };
      })();

    positions[token.name] = {
      ...slot,
      category: "canopy",
      anchor: { x: 700, y: 370 },
      canopyIndex: index,
    };
  });

  data.soil.forEach((token, index) => {
    const slot =
      rootSlots[index] ||
      (() => {
        const pct = index / Math.max(1, data.soil.length - 1);
        const x = 170 + pct * 1060;
        const y = 755 + Math.sin(pct * Math.PI) * 45;
        return { x, y };
      })();

    positions[token.name] = {
      ...slot,
      category: "soil",
      anchor: { x: 700, y: 630 },
      rootIndex: index,
    };
  });

  return positions;
}

function makeBranchPath(anchor, target, side) {
  const direction = side === "left" ? -1 : 1;

  return [
    `M ${anchor.x} ${anchor.y}`,
    `C ${anchor.x + direction * 42} ${anchor.y - 52},`,
    `${target.x - direction * 112} ${target.y - 58},`,
    `${target.x} ${target.y}`,
  ].join(" ");
}

function makeCanopyPath(anchor, target) {
  const midX = (anchor.x + target.x) / 2;
  const controlY = Math.min(anchor.y - 90, target.y + 70);

  return [
    `M ${anchor.x} ${anchor.y}`,
    `C ${anchor.x} ${anchor.y - 88},`,
    `${midX} ${controlY},`,
    `${target.x} ${target.y}`,
  ].join(" ");
}

function makeRootPath(anchor, target) {
  const midX = (anchor.x + target.x) / 2;

  return [
    `M ${anchor.x} ${anchor.y}`,
    `C ${midX} ${anchor.y + 88},`,
    `${midX} ${target.y - 58},`,
    `${target.x} ${target.y}`,
  ].join(" ");
}

function FlowPath({
  d,
  color,
  width = 6,
  glowWidth = 18,
  duration = 3.4,
  delay = 0,
  opacity = 1,
  filterId,
  reducedMotion,
}) {
  return (
    <>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={glowWidth}
        strokeLinecap="round"
        opacity="0.18"
        filter={`url(#${filterId})`}
      />

      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={reducedMotion ? undefined : "12 15"}
        strokeDashoffset="0"
        opacity={opacity}
      >
        {!reducedMotion && (
          <animate
            attributeName="stroke-dashoffset"
            values="0;-54"
            dur={`${duration}s`}
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        )}
      </path>
    </>
  );
}

function LabelPill({
  x,
  y,
  text,
  width,
  fill = "rgba(43, 26, 16, 0.54)",
  stroke = "rgba(255, 243, 210, 0.26)",
}) {
  const pillWidth = width || Math.max(150, text.length * 10.4 + 34);

  return (
    <g pointerEvents="none">
      <rect
        x={x - pillWidth / 2}
        y={y - 18}
        width={pillWidth}
        height="34"
        rx="17"
        fill={fill}
        stroke={stroke}
        strokeWidth="1"
      />
      <text
        x={x}
        y={y + 5}
        textAnchor="middle"
        fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
        fontSize="17"
        fontWeight="950"
        fill={BRAND.cream}
        paintOrder="stroke"
        stroke="rgba(43,26,16,.7)"
        strokeWidth="4"
        strokeLinejoin="round"
      >
        {text}
      </text>
    </g>
  );
}

const SvgTokenNode = memo(function SvgTokenNode({
  token,
  position,
  category,
  selected,
  ids,
  onSelect,
}) {
  const isTrunkNode = category === "trunk";
  const isBranchNode = category === "branch";
  const isCanopyNode = category === "canopy";
  const isSoilNode = category === "soil";

  const fill =
    isTrunkNode
      ? `url(#${ids.nutCore})`
      : isSoilNode
        ? `url(#${ids.rootNode})`
        : isBranchNode && isPnut(token)
          ? `url(#${ids.pnutNode})`
          : isBranchNode
            ? `url(#${ids.snutNode})`
            : `url(#${ids.leafNode})`;

  const stroke =
    isTrunkNode
      ? BRAND.gold
      : isSoilNode
        ? BRAND.soil700
        : isBranchNode && isPnut(token)
          ? BRAND.gold
          : BRAND.leaf200;

  const body = {
    width: isTrunkNode ? 144 : isSoilNode ? 116 : isBranchNode ? 136 : 116,
    height: isTrunkNode ? 144 : isSoilNode ? 68 : isBranchNode ? 78 : 78,
    radius: isTrunkNode ? 72 : isSoilNode ? 34 : 39,
    emojiSize: isTrunkNode ? 40 : isSoilNode ? 29 : isBranchNode ? 32 : 29,
  };

  const labelY = isTrunkNode ? 104 : isSoilNode ? 63 : isBranchNode ? 72 : 70;
  const roleY = labelY + 19;

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(token);
    }
  };

  return (
    <g
      className="nut-node"
      transform={`translate(${position.x} ${position.y})`}
      role="button"
      tabIndex={0}
      focusable="true"
      aria-label={`Open details for ${token.name}`}
      onClick={() => onSelect(token)}
      onKeyDown={handleKeyDown}
    >
      <title>{`${token.name}${token.role ? ` — ${token.role}` : ""}`}</title>

      <ellipse
        cx="0"
        cy={isTrunkNode ? 30 : 19}
        rx={body.width * 0.45}
        ry={body.height * 0.28}
        fill="rgba(0,0,0,.22)"
        filter={`url(#${ids.blurShadow})`}
      />

      {selected && (
        <rect
          x={-body.width / 2 - 8}
          y={-body.height / 2 - 8}
          width={body.width + 16}
          height={body.height + 16}
          rx={body.radius + 8}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="5"
          opacity=".92"
        />
      )}

      {isTrunkNode ? (
        <>
          <circle
            className="node-body"
            cx="0"
            cy="0"
            r="72"
            fill={fill}
            stroke={stroke}
            strokeWidth="7"
            filter={`url(#${ids.coreGlow})`}
          >
            <animate
              attributeName="stroke-width"
              values="7;9;7"
              dur="4.8s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="0" cy="0" r="50" fill="rgba(255,215,0,.12)" />
          <path
            d="M -28 23 C -14 -8, 5 -24, 30 23 Z"
            fill="rgba(45, 17, 8, .45)"
          />
        </>
      ) : (
        <rect
          className="node-body"
          x={-body.width / 2}
          y={-body.height / 2}
          width={body.width}
          height={body.height}
          rx={body.radius}
          fill={fill}
          stroke={stroke}
          strokeWidth={isSoilNode ? 3 : 3.5}
        />
      )}

      {isCanopyNode && (
        <>
          <circle
            cx="-31"
            cy="-35"
            r="29"
            fill="#A2E85D"
            opacity=".9"
            pointerEvents="none"
          />
          <circle
            cx="29"
            cy="-32"
            r="27"
            fill="#67BD35"
            opacity=".92"
            pointerEvents="none"
          />
        </>
      )}

      <text
        x="0"
        y={isTrunkNode ? 3 : 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={body.emojiSize}
        pointerEvents="none"
      >
        {token.icon || "🌰"}
      </text>

      <text
        x="0"
        y={labelY}
        textAnchor="middle"
        fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
        fontSize={isTrunkNode ? 18 : 17}
        fontWeight="950"
        fill={BRAND.ink}
        paintOrder="stroke"
        stroke="rgba(255,246,222,.92)"
        strokeWidth="5"
        strokeLinejoin="round"
        pointerEvents="none"
      >
        {token.name}
      </text>

      {token.role && (
        <text
          x="0"
          y={roleY}
          textAnchor="middle"
          fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
          fontSize="12"
          fontWeight="850"
          fill="rgba(43,26,16,.78)"
          paintOrder="stroke"
          stroke="rgba(255,246,222,.78)"
          strokeWidth="3"
          strokeLinejoin="round"
          pointerEvents="none"
        >
          {shortRole(token.role)}
        </text>
      )}
    </g>
  );
});

function TreeArtwork({
  data,
  selectedTokenName,
  onSelect,
  reducedMotion,
}) {
  const rawId = useId();
  const idBase = useMemo(
    () => `based-nut-tree-${sanitizeSvgId(rawId)}`,
    [rawId],
  );

  const ids = useMemo(
    () => ({
      bg: `${idBase}-bg`,
      trunk: `${idBase}-trunk`,
      barkLines: `${idBase}-bark-lines`,
      canopy: `${idBase}-canopy`,
      leafNode: `${idBase}-leaf-node`,
      snutNode: `${idBase}-snut-node`,
      pnutNode: `${idBase}-pnut-node`,
      nutCore: `${idBase}-nut-core`,
      rootNode: `${idBase}-root-node`,
      shadow: `${idBase}-shadow`,
      glow: `${idBase}-glow`,
      coreGlow: `${idBase}-core-glow`,
      blurShadow: `${idBase}-blur-shadow`,
    }),
    [idBase],
  );

  const url = useCallback((id) => `url(#${id})`, []);

  const positions = useMemo(() => getTreeLayout(data), [data]);
  const tokens = useMemo(() => getAllTokens(data), [data]);

  const branchRoutes = useMemo(
    () =>
      data.branches
        .map((token, index) => {
          const position = positions[token.name];
          if (!position) return null;

          return {
            token,
            index,
            position,
            d: makeBranchPath(position.anchor, position, position.side),
            color: isPnut(token)
              ? BRAND.goldFlow
              : isSnut(token)
                ? BRAND.greenFlow
                : BRAND.leaf300,
            woodColor: isPnut(token) ? BRAND.bark300 : BRAND.bark400,
            label:
              index === 0 || isSnut(token)
                ? "SNUT burn branch"
                : index === 1 || isPnut(token)
                  ? "pNUT liquidity branch"
                  : `${token.name} branch`,
          };
        })
        .filter(Boolean),
    [data.branches, positions],
  );

  const canopyRoutes = useMemo(
    () =>
      data.nestedTokens
        .map((token, index) => {
          const position = positions[token.name];
          if (!position) return null;

          return {
            token,
            index,
            position,
            d: makeCanopyPath(position.anchor, position),
          };
        })
        .filter(Boolean),
    [data.nestedTokens, positions],
  );

  const rootRoutes = useMemo(
    () =>
      data.soil
        .map((token, index) => {
          const position = positions[token.name];
          if (!position) return null;

          return {
            token,
            index,
            position,
            d: makeRootPath(position.anchor, position),
          };
        })
        .filter(Boolean),
    [data.soil, positions],
  );

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      role="img"
      aria-label="Interactive BASED NUT liquidity tree map"
      style={{
        display: "block",
        overflow: "visible",
      }}
    >
      <defs>
        <radialGradient id={ids.bg} cx="50%" cy="18%" r="85%">
          <stop offset="0%" stopColor="#FFF4CF" />
          <stop offset="44%" stopColor="#E5C594" />
          <stop offset="100%" stopColor="#AD7841" />
        </radialGradient>

        <linearGradient id={ids.trunk} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={BRAND.bark950} />
          <stop offset="22%" stopColor={BRAND.bark600} />
          <stop offset="45%" stopColor="#C47A2F" />
          <stop offset="65%" stopColor={BRAND.bark600} />
          <stop offset="100%" stopColor={BRAND.bark950} />
        </linearGradient>

        <radialGradient id={ids.canopy} cx="45%" cy="30%" r="72%">
          <stop offset="0%" stopColor={BRAND.leaf200} />
          <stop offset="35%" stopColor={BRAND.leaf500} />
          <stop offset="72%" stopColor={BRAND.leaf700} />
          <stop offset="100%" stopColor={BRAND.leaf950} />
        </radialGradient>

        <radialGradient id={ids.leafNode} cx="35%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#E4FF9B" />
          <stop offset="50%" stopColor="#70CF35" />
          <stop offset="100%" stopColor="#2F7927" />
        </radialGradient>

        <radialGradient id={ids.snutNode} cx="35%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#B8E28A" />
          <stop offset="50%" stopColor="#558C46" />
          <stop offset="100%" stopColor="#203F21" />
        </radialGradient>

        <radialGradient id={ids.pnutNode} cx="35%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#FFF1A3" />
          <stop offset="48%" stopColor="#FFAE00" />
          <stop offset="100%" stopColor="#8A4C00" />
        </radialGradient>

        <radialGradient id={ids.nutCore} cx="35%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#F0BD75" />
          <stop offset="55%" stopColor="#9D5319" />
          <stop offset="100%" stopColor="#43200D" />
        </radialGradient>

        <radialGradient id={ids.rootNode} cx="35%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#D0A06E" />
          <stop offset="55%" stopColor="#88491E" />
          <stop offset="100%" stopColor="#31170A" />
        </radialGradient>

        <pattern id={ids.barkLines} width="26" height="34" patternUnits="userSpaceOnUse">
          <path
            d="M 7 -4 C 1 9, 5 20, 13 36"
            fill="none"
            stroke="rgba(30,10,2,.28)"
            strokeWidth="4"
          />
          <path
            d="M 21 -3 C 15 10, 18 22, 26 37"
            fill="none"
            stroke="rgba(255,218,142,.14)"
            strokeWidth="3"
          />
        </pattern>

        <filter id={ids.shadow} x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow
            dx="0"
            dy="16"
            stdDeviation="16"
            floodColor="#2B1607"
            floodOpacity=".28"
          />
        </filter>

        <filter id={ids.glow} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={ids.coreGlow} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="9" result="goldBlur" />
          <feColorMatrix
            in="goldBlur"
            type="matrix"
            values="
              1 0 0 0 1
              0 .74 0 0 .62
              0 0 0 0 0
              0 0 0 .55 0"
            result="gold"
          />
          <feMerge>
            <feMergeNode in="gold" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={ids.blurShadow} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="10" />
        </filter>

        <style>
          {`
            .nut-node {
              cursor: pointer;
              outline: none;
            }

            .nut-node .node-body {
              transition: filter 160ms ease, opacity 160ms ease;
            }

            .nut-node:hover .node-body {
              filter: brightness(1.08);
            }

            .nut-node:focus-visible .node-body {
              filter: brightness(1.12);
            }

            @media (prefers-reduced-motion: reduce) {
              .nut-node .node-body {
                transition: none;
              }
            }
          `}
        </style>
      </defs>

      <rect width={VIEWBOX.width} height={VIEWBOX.height} fill={url(ids.bg)} />

      <circle cx="230" cy="230" r="190" fill="rgba(255,255,255,.075)" />
      <circle cx="1180" cy="260" r="225" fill="rgba(255,255,255,.065)" />
      <circle cx="260" cy="690" r="170" fill="rgba(72,38,14,.055)" />
      <circle cx="1110" cy="690" r="190" fill="rgba(72,38,14,.05)" />

      <g filter={url(ids.shadow)}>
        <ellipse cx="700" cy="305" rx="520" ry="210" fill={BRAND.leaf950} opacity=".42" />

        <ellipse cx="590" cy="275" rx="360" ry="165" fill={BRAND.leaf700} opacity=".72">
          {!reducedMotion && (
            <animate attributeName="opacity" values=".68;.78;.68" dur="8.5s" repeatCount="indefinite" />
          )}
        </ellipse>

        <ellipse cx="810" cy="275" rx="370" ry="170" fill={BRAND.leaf700} opacity=".72">
          {!reducedMotion && (
            <animate attributeName="opacity" values=".78;.68;.78" dur="8.5s" repeatCount="indefinite" />
          )}
        </ellipse>

        <ellipse cx="700" cy="235" rx="345" ry="150" fill={BRAND.leaf500} opacity=".82" />

        <ellipse cx="700" cy="305" rx="435" ry="178" fill={url(ids.canopy)} opacity=".76">
          {!reducedMotion && (
            <animate attributeName="opacity" values=".70;.82;.70" dur="7.8s" repeatCount="indefinite" />
          )}
        </ellipse>

        <circle cx="330" cy="305" r="108" fill={BRAND.leaf500} opacity=".70" />
        <circle cx="465" cy="185" r="128" fill={BRAND.leaf300} opacity=".60" />
        <circle cx="635" cy="135" r="126" fill={BRAND.leaf300} opacity=".55" />
        <circle cx="790" cy="135" r="126" fill={BRAND.leaf300} opacity=".55" />
        <circle cx="955" cy="188" r="132" fill={BRAND.leaf300} opacity=".60" />
        <circle cx="1085" cy="310" r="110" fill={BRAND.leaf500} opacity=".70" />
        <ellipse cx="705" cy="250" rx="270" ry="90" fill="rgba(222,255,165,.22)" />
      </g>

      <path
        d="M 0 730 C 210 698, 410 710, 560 742 C 680 768, 825 770, 975 740 C 1130 708, 1270 710, 1400 742 L 1400 850 L 0 850 Z"
        fill="rgba(76,40,17,.21)"
      />

      {rootRoutes.map((route) => (
        <g key={`${route.token.name}-root-route`}>
          <path
            d={route.d}
            stroke={BRAND.soil950}
            strokeWidth="18"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={route.d}
            stroke={BRAND.soil600}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            opacity=".74"
          />
          <FlowPath
            d={route.d}
            color={BRAND.rootFlow}
            width={5}
            glowWidth={14}
            duration={4.8}
            delay={route.index * 0.18}
            opacity=".92"
            filterId={ids.glow}
            reducedMotion={reducedMotion}
          />
        </g>
      ))}

      <g filter={url(ids.shadow)}>
        <path
          d="
            M 630 815
            C 654 700, 665 570, 672 445
            C 676 360, 692 292, 710 245
            C 728 292, 742 360, 748 445
            C 758 570, 770 700, 794 815
            C 748 794, 685 794, 630 815 Z
          "
          fill={url(ids.trunk)}
        />

        <path
          d="
            M 630 815
            C 654 700, 665 570, 672 445
            C 676 360, 692 292, 710 245
            C 728 292, 742 360, 748 445
            C 758 570, 770 700, 794 815
            C 748 794, 685 794, 630 815 Z
          "
          fill={url(ids.barkLines)}
          opacity=".62"
        />

        <path
          d="M 698 285 C 690 430, 694 620, 685 790"
          fill="none"
          stroke="rgba(255,219,145,.18)"
          strokeWidth="17"
          strokeLinecap="round"
        />

        <path
          d="M 638 805 C 575 797, 535 815, 487 828 C 545 839, 602 824, 673 833 C 694 828, 716 816, 744 804 Z"
          fill={BRAND.soil700}
        />

        <path
          d="M 784 805 C 848 797, 887 815, 936 828 C 877 839, 821 824, 750 833 C 728 828, 708 816, 681 804 Z"
          fill={BRAND.soil700}
        />
      </g>

      {branchRoutes.map((route) => {
        const isMajor = route.index < 2;
        const strokeWidth = isMajor ? 36 : 22;
        const highlightWidth = isMajor ? 15 : 9;
        const flowWidth = isMajor ? 8 : 5;

        return (
          <g key={`${route.token.name}-branch-route`}>
            <path
              d={route.d}
              stroke={BRAND.bark900}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
            <path
              d={route.d}
              stroke={route.woodColor}
              strokeWidth={highlightWidth}
              fill="none"
              strokeLinecap="round"
              opacity=".56"
            />

            <FlowPath
              d={route.d}
              color={route.color}
              width={flowWidth}
              glowWidth={isMajor ? 18 : 13}
              duration={isPnut(route.token) ? 2.9 : 3.4}
              delay={route.index * 0.15}
              filterId={ids.glow}
              reducedMotion={reducedMotion}
            />
          </g>
        );
      })}

      {canopyRoutes.map((route) => (
        <g key={`${route.token.name}-canopy-route`}>
          <path
            d={route.d}
            stroke="rgba(22,65,27,.45)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <FlowPath
            d={route.d}
            color={BRAND.greenFlow}
            width={4}
            glowWidth={11}
            duration={4.2}
            delay={route.index * 0.2}
            opacity=".78"
            filterId={ids.glow}
            reducedMotion={reducedMotion}
          />
        </g>
      ))}

      <LabelPill x={430} y={360} text="SNUT burn branch" width={205} />
      <LabelPill x={965} y={360} text="pNUT liquidity branch" width={245} />
      <LabelPill x={700} y={675} text="LP roots / AMM depth" width={230} />

      {!reducedMotion && (
        <g pointerEvents="none">
          <circle cx="716" cy="366" r="7" fill={BRAND.gold}>
            <animate attributeName="opacity" values=".28;.95;.28" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="770" cy="448" r="5" fill={BRAND.gold}>
            <animate attributeName="opacity" values=".25;.85;.25" dur="2.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="635" cy="455" r="5" fill={BRAND.greenFlow}>
            <animate attributeName="opacity" values=".25;.85;.25" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="710" cy="640" r="5" fill="#D88B42">
            <animate attributeName="opacity" values=".25;.85;.25" dur="3s" repeatCount="indefinite" />
          </circle>
        </g>
      )}

      {tokens.map((token) => {
        const position = positions[token.name];
        if (!position) return null;

        return (
          <SvgTokenNode
            key={token.name}
            token={token}
            position={position}
            category={getTokenCategory(data, token)}
            selected={selectedTokenName === token.name}
            ids={ids}
            onSelect={onSelect}
          />
        );
      })}
    </svg>
  );
}

function TokenModal({ token, onClose }) {
  if (!token) return null;

  const addressUrl = token.address
    ? `https://basescan.org/address/${token.address}`
    : null;

  const sourceUrl = token.address
    ? `https://basescan.org/address/${token.address}#code`
    : null;

  return (
    <Modal
      open={Boolean(token)}
      onClose={onClose}
      aria-labelledby="based-nut-token-modal-title"
      aria-describedby="based-nut-token-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(440px, calc(100vw - 28px))",
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          bgcolor: "#FFF3D8",
          border: "1px solid rgba(96, 53, 20, .22)",
          boxShadow: "0 26px 90px rgba(0,0,0,.38)",
          color: BRAND.ink,
          outline: 0,
        }}
      >
        <Typography
          id="based-nut-token-modal-title"
          variant="h5"
          sx={{ fontWeight: 950, mb: 0.75 }}
        >
          {token.icon || "🌰"} {token.name}
        </Typography>

        {token.role && (
          <Typography
            id="based-nut-token-modal-description"
            sx={{ fontWeight: 800, color: "rgba(43,26,16,.78)" }}
          >
            {token.role}
          </Typography>
        )}

        {token.utility && (
          <Typography sx={{ mt: 1.5, color: "rgba(43,26,16,.72)" }}>
            {token.utility}
          </Typography>
        )}

        {token.mintUrl && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1.25,
              fontWeight: 800,
              color: "rgba(43,26,16,.6)",
            }}
          >
            Mint Club token
          </Typography>
        )}

        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2.5 }}>
          {token.link && (
            <Button
              href={token.link}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              sx={{
                fontWeight: 900,
                bgcolor: token.color || BRAND.bark500,
                "&:hover": {
                  bgcolor: darkenColor(token.color || BRAND.bark500),
                },
              }}
            >
              BaseScan
            </Button>
          )}

          {addressUrl && (
            <Button
              href={addressUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
            >
              Address
            </Button>
          )}

          {sourceUrl && (
            <Button
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
            >
              Source
            </Button>
          )}

          {token.mintUrl && (
            <Button
              href={token.mintUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
            >
              Mint
            </Button>
          )}
        </Stack>

        {/* View Token Profile — links to /token/{name} */}
        <Link
          href={`/token/${(token.name || '').toLowerCase()}`}
          style={{ textDecoration: "none", display: "block", marginTop: "1.25rem" }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
              py: 1,
              borderRadius: 2,
              fontWeight: 800,
              fontSize: "0.9rem",
              color: "#fff",
              background: "linear-gradient(135deg, #8B4513 0%, #A0522D 100%)",
              border: "1px solid #6B3D20",
              boxShadow: "0 3px 8px rgba(139,69,19,0.2)",
              transition: "all 0.2s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #A0522D 0%, #B87333 100%)",
                transform: "translateY(-1px)",
              },
            }}
          >
            🌰 View Token Profile
          </Box>
        </Link>
      </Box>
    </Modal>
  );
}

function InfoPanel({ selectedToken, visible }) {
  if (!visible) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        right: { xs: 12, md: 24 },
        top: { xs: 88, md: 112 },
        zIndex: 7,
        width: { xs: "min(350px, calc(100% - 24px))", md: 340 },
        p: 2,
        borderRadius: 4,
        bgcolor: BRAND.panel,
        border: "1px solid rgba(89,49,20,.22)",
        boxShadow: "0 18px 46px rgba(49,25,8,.2)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Typography
        sx={{
          fontWeight: 950,
          fontSize: 13,
          letterSpacing: ".09em",
          textTransform: "uppercase",
          color: BRAND.bark800,
          mb: 1,
        }}
      >
        Liquidity Map
      </Typography>

      <Typography
        sx={{
          fontWeight: 760,
          fontSize: 14,
          lineHeight: 1.45,
          color: BRAND.ink,
        }}
      >
        NUT anchors the structure. SNUT routes deflationary pressure. pNUT routes
        liquidity balance. Roots spread toward AMMs, pools, and LP depth.
      </Typography>

      <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1.5 }}>
        <Chip size="small" label="🌰 NUT Anchor" />
        <Chip size="small" label="🔥 SNUT Burn" />
        <Chip size="small" label="🌰 pNUT Liquidity" />
        <Chip size="small" label="🌱 LP Roots" />
      </Stack>

      {selectedToken && (
        <Box
          sx={{
            mt: 1.5,
            p: 1.5,
            borderRadius: 3,
            bgcolor: "rgba(255,255,255,.45)",
            border: "1px solid rgba(89,49,20,.12)",
          }}
        >
          <Typography sx={{ fontWeight: 950 }}>
            Selected: {selectedToken.icon || "🌰"} {selectedToken.name}
          </Typography>
          {selectedToken.role && (
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 750,
                color: "rgba(43,26,16,.7)",
              }}
            >
              {selectedToken.role}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

function LegendPanel({ visible }) {
  if (!visible) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        left: { xs: 12, md: 24 },
        bottom: { xs: 14, md: 24 },
        zIndex: 7,
        width: { xs: "min(330px, calc(100% - 24px))", md: 330 },
        p: 2,
        borderRadius: 4,
        bgcolor: BRAND.panelStrong,
        border: "1px solid rgba(89,49,20,.2)",
        boxShadow: "0 18px 44px rgba(49,25,8,.18)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Typography
        sx={{
          fontWeight: 950,
          fontSize: 13,
          letterSpacing: ".09em",
          textTransform: "uppercase",
          color: BRAND.bark800,
          mb: 1,
        }}
      >
        Ecosystem Legend
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 0.6,
          fontSize: 13,
          fontWeight: 800,
          color: BRAND.ink,
        }}
      >
        <span>🌰 Roots = NUT anchor</span>
        <span>🔥 Left branch = SNUT burn pressure</span>
        <span>🌰 Right branch = pNUT liquidity balance</span>
        <span>🍃 Canopy = nested token layers</span>
        <span>🌱 Root nodes = LPs, AMMs, and depth</span>
      </Box>

      <Button
        href="https://docs.basednut.com/"
        target="_blank"
        rel="noopener noreferrer"
        size="small"
        sx={{
          mt: 1.5,
          borderRadius: 999,
          fontWeight: 900,
          color: BRAND.cream,
          bgcolor: BRAND.bark800,
          "&:hover": {
            bgcolor: BRAND.bark900,
          },
        }}
      >
        Docs →
      </Button>
    </Box>
  );
}

export default function NutTree() {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"), { noSsr: true });
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", {
    noSsr: true,
  });

  const data = useMemo(() => normalizeTreeData(nutTreeData), []);
  const [selectedToken, setSelectedToken] = useState(null);
  // Start with server-safe defaults (true) and sync to media query after mount
  const [showLegend, setShowLegend] = useState(true);
  const [showMapNotes, setShowMapNotes] = useState(true);

  useEffect(() => {
    setShowLegend(!isSmall);
    setShowMapNotes(!isSmall);
  }, [isSmall]);

  const handleSelect = useCallback((token) => {
    setSelectedToken(token);
  }, []);

  return (
    <Layout>
      <Head>
        <title>BASED NUT Liquidity Tree</title>
        <meta
          name="description"
          content="Interactive BASED NUT liquidity tree map: NUT trunk, SNUT burn branch, pNUT liquidity branch, nested token canopy, and LP root system."
        />
      </Head>

      <Box
        component="main"
        sx={{
          position: "relative",
          minHeight: "100dvh",
          overflow: "hidden",
          bgcolor: "#D7B487",
          color: BRAND.ink,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 14%, rgba(255,246,219,.92), rgba(229,199,151,.74) 40%, rgba(174,125,73,.48) 100%)",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.28,
            background:
              "radial-gradient(circle at 16% 34%, rgba(255,255,255,.15), transparent 21%), radial-gradient(circle at 82% 35%, rgba(255,255,255,.12), transparent 24%), radial-gradient(circle at 50% 82%, rgba(58,28,10,.12), transparent 32%)",
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            top: { xs: 10, md: 20 },
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(980px, calc(100vw - 24px))",
            zIndex: 8,
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <Typography
            variant="h1"
            sx={{
              m: 0,
              fontSize: { xs: 32, sm: 44, md: 56 },
              lineHeight: 1,
              fontWeight: 950,
              letterSpacing: ".035em",
              color: "#765144",
              textShadow: "0 2px 0 rgba(255,255,255,.24)",
            }}
          >
            The BASED NUT Tree 🌳
          </Typography>

          <Typography
            sx={{
              mt: 1,
              fontSize: { xs: 12, sm: 14, md: 16 },
              fontWeight: 900,
              color: "rgba(43,26,16,.68)",
              display: { xs: "none", sm: "block" },
            }}
          >
            A living liquidity map for NUT, SNUT, pNUT, nested tokens, and pools.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            position: "absolute",
            left: { xs: 12, md: 24 },
            top: { xs: 82, md: 104 },
            zIndex: 9,
          }}
        >
          <Button
            size="small"
            onClick={() => setShowLegend((value) => !value)}
            sx={{
              borderRadius: 999,
              px: 1.35,
              fontWeight: 950,
              color: BRAND.cream,
              bgcolor: BRAND.bark800,
              boxShadow: "0 8px 20px rgba(49,25,8,.18)",
              "&:hover": {
                bgcolor: BRAND.bark900,
              },
            }}
          >
            ☰ Legend
          </Button>

          <Button
            size="small"
            onClick={() => setShowMapNotes((value) => !value)}
            sx={{
              borderRadius: 999,
              px: 1.35,
              fontWeight: 950,
              color: BRAND.cream,
              bgcolor: BRAND.bark800,
              boxShadow: "0 8px 20px rgba(49,25,8,.18)",
              "&:hover": {
                bgcolor: BRAND.bark900,
              },
            }}
          >
            ⓘ Map
          </Button>
        </Stack>

        <InfoPanel selectedToken={selectedToken} visible={showMapNotes} />
        <LegendPanel visible={showLegend} />

        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            width: "min(1500px, 100vw)",
            height: "100dvh",
            minHeight: { xs: 760, md: 850 },
            mx: "auto",
            pt: { xs: 0, md: 0 },
          }}
        >
          <TreeArtwork
            data={data}
            selectedTokenName={selectedToken?.name}
            onSelect={handleSelect}
            reducedMotion={reducedMotion}
          />
        </Box>

        <TokenModal
          token={selectedToken}
          onClose={() => setSelectedToken(null)}
        />
      </Box>
    </Layout>
  );
}
