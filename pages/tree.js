import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  keyframes,
  styled,
  Tooltip,
  Modal,
  Button,
} from "@mui/material";
import nutTreeData from "../utils/fetchTokens.js";
import Layout from "../components/Layout";
import Head from "next/head";

// --------------------- ANIMATIONS ---------------------
const wiggle = keyframes`
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(3deg); }
  40% { transform: rotate(-3deg); }
  60% { transform: rotate(2deg); }
  80% { transform: rotate(-2deg); }
`;

const fallDown = keyframes`
  0% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 1; }
  60% { transform: translate3d(12px, 120px, 0) rotate(20deg); opacity: 0.9; }
  100% { transform: translate3d(24px, 260px, 0) rotate(40deg); opacity: 0; }
`;

const swaySlow = keyframes`
  0%, 100% { transform: rotate(-0.6deg); }
  50% { transform: rotate(0.6deg); }
`;

const swayBranch = keyframes`
  0%, 100% { transform: rotate(-1.2deg); }
  50% { transform: rotate(1.2deg); }
`;

const flow = keyframes`
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 30; }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 rgba(255, 215, 130, 0.0), 0 0 0 rgba(255, 215, 130, 0.0); }
  50% { box-shadow: 0 0 20px rgba(255, 215, 130, 0.35), 0 0 40px rgba(255, 215, 130, 0.15); }
`;

const shimmerFlow = keyframes`
  0% { opacity: 0.4; stroke-dashoffset: 0; }
  50% { opacity: 0.8; }
  100% { opacity: 0.4; stroke-dashoffset: -40; }
`;

const parallaxSway = keyframes`
  0%, 100% { transform: translate3d(-2px, 0, 0) rotate(-0.8deg); }
  50% { transform: translate3d(2px, -1px, 0) rotate(0.8deg); }
`;

const rootPulse = keyframes`
  0%, 100% { stroke-width: 12; opacity: 0.7; }
  50% { stroke-width: 16; opacity: 0.9; }
`;

const leafRustle = keyframes`
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.02) rotate(0.5deg); }
  75% { transform: scale(0.98) rotate(-0.5deg); }
`;

const rotate = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
`;

// Punchier micro-interactions
const impactPulse = keyframes`
  0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0.9; }
  60% { transform: translate(-50%, -50%) scale(1.25); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
`;

const burstFlame = keyframes`
  0% { transform: translate(-50%, -50%) scale(0.7) rotate(0deg); filter: drop-shadow(0 0 6px rgba(255,80,120,0.8)); opacity: 0.95; }
  60% { transform: translate(-50%, -50%) scale(1.2) rotate(15deg); filter: drop-shadow(0 0 10px rgba(255,120,80,0.8)); opacity: 0.65; }
  100% { transform: translate(-50%, -50%) scale(1.45) rotate(25deg); filter: drop-shadow(0 0 0 rgba(0,0,0,0)); opacity: 0; }
`;

const bounce = keyframes`
  0% { transform: translate(-50%, -50%) scale(1); }
  35% { transform: translate(-50%, -54%) scale(1.08); }
  100% { transform: translate(-50%, -50%) scale(1); }
`;

// --------------------- DYNAMIC LAYOUT ---------------------
// Compute aesthetically pleasing positions for tokens across canopy, branches, trunk, and soil.
function computeLayout(data, isMobile) {
  const positions = {};
  // Trunk (NUT) centered
  positions[data.trunk.name] = { x: 50, y: isMobile ? 58 : 60 };

  // Branches: spread left/right from trunk
  const branchRadiusX = isMobile ? 18 : 20;
  const branchY = isMobile ? 43 : 45;
  data.branches.forEach((t, i) => {
    const dir = i % 2 === 0 ? -1 : 1;
    const offset = Math.ceil((i + 1) / 2);
    positions[t.name] = {
      x: 50 + dir * (branchRadiusX * offset),
      y: branchY + (offset - 1) * (isMobile ? 2 : 1.5),
    };
  });

  // Canopy (nested tokens) arranged on a gentle arc
  const canopy = data.nestedTokens;
  const canopyY = isMobile ? 22 : 24;
  const canopySpan = isMobile ? 56 : 60; // width in percentage
  canopy.forEach((t, i) => {
    const pct = canopy.length > 1 ? i / (canopy.length - 1) : 0.5;
    const x = 50 - canopySpan / 2 + canopySpan * pct;
    // Arch curve: raise more at edges for a rounded crown
    const curvature = Math.sin(pct * Math.PI) * (isMobile ? 6 : 8);
    positions[t.name] = { x, y: canopyY + (8 - curvature) };
  });

  // Soil (liquidity base) arranged along bottom arc
  const soil = data.soil;
  const soilY = isMobile ? 86 : 84;
  const soilSpan = isMobile ? 40 : 44;
  soil.forEach((t, i) => {
    const pct = soil.length > 1 ? i / (soil.length - 1) : 0.5;
    const x = 50 - soilSpan / 2 + soilSpan * pct;
    const curvature = Math.sin(pct * Math.PI) * (isMobile ? 3 : 4);
    positions[t.name] = { x, y: soilY + curvature };
  });

  return positions;
}

// (Old straight-line connections removed; replaced with curved flows below)

// --------------------- BRAND + FALLING NUTS ---------------------
const BRAND = {
  brownDark: "#7D5A50",
  brownMed: "#A67C52", 
  brownLight: "#D1B48C",
  barkDark: "#5D3A1A",
  barkDeep: "#3E1F0A",
  bark: "#8B4513",
  leafDark: "#2F5233",
  leafMed: "#4A7C59",
  leafLight: "#7FB069",
  leafBright: "#A7E080",
  gold: "#FFD700",
  amber: "#FFA500",
  soil: "#8B4513",
  soilDark: "#654321",
  bg0: "#F5E6D3",
  bg1: "#E8D5B7",
  bg2: "#D4B896",
  bg3: "#C19A6B",
};

const FallingNut = styled("div")(({ size = 22, variant = "default" }) => ({
  position: "absolute",
  fontSize: `${size}px`,
  animation: `${fallDown} ${1.2 + Math.random() * 0.6}s ease-in forwards`,
  zIndex: 4,
  pointerEvents: "none",
  willChange: "transform, opacity",
  filter: variant === "glow" 
    ? "drop-shadow(0 0 4px rgba(255,215,0,0.6)) drop-shadow(0 2px 3px rgba(0,0,0,0.25))"
    : "drop-shadow(0 2px 3px rgba(0,0,0,0.25))",
  transform: `rotate(${-15 + Math.random() * 30}deg)`,
}));

const Impact = styled("div")(({ kind = "ring", color = "#ffd87a" }) => ({
  position: "absolute",
  width: kind === "flame" ? 36 : 48,
  height: kind === "flame" ? 36 : 48,
  left: 0,
  top: 0,
  borderRadius: kind === "flame" ? 8 : "50%",
  pointerEvents: "none",
  zIndex: 4,
  animation: `${kind === "flame" ? burstFlame : impactPulse} ${kind === "flame" ? 700 : 800}ms ease-out forwards`,
  background: kind === "flame"
    ? `radial-gradient(circle at 45% 45%, rgba(255,180,120,0.95) 0%, rgba(255,120,80,0.75) 35%, rgba(120,20,0,0.2) 100%)`
    : "transparent",
  boxShadow: kind === "ring" ? `0 0 0 3px ${color} inset, 0 0 12px ${color}` : "none",
}));

// --------------------- HELPER: Darken/Lighten Color ---------------------
function darkenColor(hex, amt = 0.15) {
  const c = hex.replace("#", "");
  let r = parseInt(c.substring(0, 2), 16);
  let g = parseInt(c.substring(2, 4), 16);
  let b = parseInt(c.substring(4, 6), 16);
  r = Math.floor(r * (1 - amt));
  g = Math.floor(g * (1 - amt));
  b = Math.floor(b * (1 - amt));
  return `rgb(${r}, ${g}, ${b})`;
}

function lightenColor(hex, amt = 0.15) {
  const c = hex.replace("#", "");
  let r = parseInt(c.substring(0, 2), 16);
  let g = parseInt(c.substring(2, 4), 16);
  let b = parseInt(c.substring(4, 6), 16);
  r = Math.min(255, Math.floor(r + (255 - r) * amt));
  g = Math.min(255, Math.floor(g + (255 - g) * amt));
  b = Math.min(255, Math.floor(b + (255 - b) * amt));
  return `rgb(${r}, ${g}, ${b})`;
}

// --------------------- CATEGORIZATION ---------------------
function getTokenCategory(token) {
  if (nutTreeData.soil.some((t) => t.name === token.name)) return "soil";
  if (nutTreeData.trunk.name === token.name) return "trunk";
  if (nutTreeData.branches.some((t) => t.name === token.name)) return "branch";
  if (nutTreeData.nestedTokens.some((t) => t.name === token.name))
    return "canopy";
  return "unknown";
}

// --------------------- STYLED LINES (Animated) ---------------------
const AnimatedPath = styled("path")(({ color, thickness, dash = true }) => ({
  stroke: color,
  strokeWidth: thickness,
  strokeLinecap: "round",
  fill: "none",
  strokeDasharray: dash ? "6 8" : "none",
  animation: dash ? `${flow} 3s linear infinite` : "none",
}));

// --------------------- NODE SHAPES ---------------------
const TokenContainer = styled("div", {
  shouldForwardProp: (prop) => prop !== "category" && prop !== "tokenColor",
})(({ category, tokenColor }) => {
  const baseStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    cursor: "pointer",
    color: "#FFF",
    fontWeight: "bold",
    userSelect: "none",
    textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
    transition: "transform 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease",
    "&:hover": {
      animation: `${wiggle} 0.4s ease-in-out`,
      transform: "translateY(-2px)",
    },
    "& .emoji": {
      position: "relative",
      zIndex: 1,
    },
  };

  const greenPalette = ["#8ED172", "#71CC31", "#A3E043", "#4DBD00", "#C5F568"];
  function pickGreenShade(name) {
    const sum = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return greenPalette[sum % greenPalette.length];
  }

  switch (category) {
    case "soil":
      return {
        ...baseStyles,
        width: "72px",
        height: "56px",
        borderRadius: "36px / 28px",
        background: `
          radial-gradient(120% 120% at 35% 40%, ${lightenColor(tokenColor, 0.2)} 10%, ${tokenColor} 50%, ${darkenColor(tokenColor, 0.1)} 85%, ${darkenColor(tokenColor, 0.25)} 100%),
          linear-gradient(45deg, rgba(139,69,19,0.1) 0%, transparent 50%)
        `,
        boxShadow: `
          inset 0 -3px 8px rgba(0,0,0,0.35), 
          0 3px 6px rgba(0,0,0,0.25),
          0 0 0 1px rgba(139,69,19,0.2)
        `,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "25%",
          left: "20%",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${lightenColor(tokenColor, 0.4)} 0%, ${lightenColor(tokenColor, 0.2)} 100%)`,
          boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "20%",
          right: "25%",
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${lightenColor(tokenColor, 0.3)} 0%, ${tokenColor} 100%)`,
          boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
        },
      };

    case "trunk":
      return {
        ...baseStyles,
        width: "110px",
        height: "110px",
        borderRadius: "50%",
        background: `
          radial-gradient(circle at 35% 35%, ${lightenColor(tokenColor, 0.25)} 0%, ${tokenColor} 45%, ${darkenColor(tokenColor, 0.1)} 80%, ${darkenColor(tokenColor, 0.25)} 100%),
          linear-gradient(135deg, rgba(255,215,0,0.1) 0%, transparent 50%)
        `,
        border: `4px solid ${BRAND.gold}`,
        position: "relative",
        boxShadow: `
          0 0 20px rgba(255,215,0,0.3),
          0 8px 16px rgba(0,0,0,0.25),
          inset 0 2px 4px rgba(255,255,255,0.2)
        `,
        animation: `${pulseGlow} 4s ease-in-out infinite`,
        "&::before": {
          content: '""',
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          height: "90%",
          borderRadius: "50%",
          background: `linear-gradient(45deg, transparent 40%, rgba(255,215,0,0.15) 50%, transparent 60%)`,
          animation: `rotate 8s linear infinite`,
        },
        "&::after": {
          content: '"👑"',
          position: "absolute",
          top: "-8px",
          right: "-8px",
          fontSize: "16px",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
        },
      };

    case "branch":
      return {
        ...baseStyles,
        width: "92px",
        height: "48px",
        borderRadius: "28px",
        background: `
          linear-gradient(145deg, ${lightenColor(tokenColor, 0.1)} 0%, ${tokenColor} 50%, ${darkenColor(tokenColor, 0.15)} 100%),
          radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)
        `,
        boxShadow: `
          inset 0 -3px 8px rgba(0,0,0,0.25), 
          0 4px 8px rgba(0,0,0,0.2),
          0 0 0 2px rgba(255,255,255,0.1)
        `,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "20%",
          left: "15%",
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          background: lightenColor(tokenColor, 0.3),
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: "25%",
          right: "20%",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: darkenColor(tokenColor, 0.2),
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
        },
      };

    case "canopy": {
      const canopyColor = pickGreenShade(tokenColor);
      return {
        ...baseStyles,
        width: "80px",
        height: "56px",
        backgroundColor: canopyColor,
        borderRadius: "40px",
        boxShadow: `
          0 4px 8px rgba(0,0,0,0.2),
          inset 0 2px 4px rgba(255,255,255,0.2),
          0 0 0 2px rgba(127,176,105,0.3)
        `,
        position: "relative",
        background: `
          radial-gradient(ellipse at 30% 30%, ${lightenColor(canopyColor, 0.2)} 0%, ${canopyColor} 60%, ${darkenColor(canopyColor, 0.1)} 100%)
        `,
        "&::before": {
          content: '""',
          position: "absolute",
          zIndex: 0,
          top: "-14px",
          left: "10px",
          width: "38px",
          height: "38px",
          backgroundColor: lightenColor(canopyColor, 0.15),
          borderRadius: "50%",
          boxShadow: `
            0 2px 6px rgba(0,0,0,0.2),
            inset 0 1px 2px rgba(255,255,255,0.3)
          `,
          border: `1px solid rgba(127,176,105,0.2)`,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          zIndex: 0,
          top: "-12px",
          right: "10px",
          width: "34px",
          height: "34px",
          backgroundColor: darkenColor(canopyColor, 0.15),
          borderRadius: "50%",
          boxShadow: `
            0 2px 6px rgba(0,0,0,0.2),
            inset 0 1px 2px rgba(255,255,255,0.2)
          `,
          border: `1px solid rgba(127,176,105,0.15)`,
        },
      };
    }

    default:
      return {
        ...baseStyles,
        width: "50px",
        height: "50px",
        backgroundColor: tokenColor,
        borderRadius: "50%",
      };
  }
});

// --------------------- TOKEN MODAL ---------------------
function TokenModal({ token, open, onClose }) {
  const baseScanAddressUrl = token?.address
    ? `https://basescan.org/address/${token.address}`
    : null;
  const baseScanSourceUrl = token?.address
    ? `https://basescan.org/address/${token.address}#code`
    : null;
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          outline: 0,
          maxWidth: 400,
          width: "90%",
        }}
      >
        <Typography variant="h6" component="h2">
          {token.icon} {token.name}
        </Typography>
        {token.role && (
          <Typography sx={{ mt: 1 }}>{token.role}</Typography>
        )}
        {token.utility && (
          <Typography sx={{ mt: 1.25 }} variant="body2" color="text.secondary">
            {token.utility}
          </Typography>
        )}
        {token.mintUrl && (
          <Typography sx={{ mt: 1 }} variant="caption" color="text.secondary">
            Mint Club token
          </Typography>
        )}
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {token.link && (
            <Button
              variant="contained"
              href={token.link}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                backgroundColor: token.color,
                "&:hover": { backgroundColor: darkenColor(token.color) },
              }}
            >
              View on BaseScan
            </Button>
          )}
          {baseScanAddressUrl && (
            <Button
              variant="outlined"
              href={baseScanAddressUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Address
            </Button>
          )}
          {baseScanSourceUrl && (
            <Button
              variant="outlined"
              href={baseScanSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Source
            </Button>
          )}
          {token.mintUrl && (
            <Button
              variant="outlined"
              href={token.mintUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Mint Page
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
}

// --------------------- SINGLE TOKEN NODE ---------------------
function TokenNode({ token, onClick, pos, onHoverFall }) {
  const category = getTokenCategory(token);

  const handleMouseEnter = () => {
  onHoverFall?.({ icon: token.icon, pos });
  };

  const left = `${pos?.x ?? 50}%`;
  const top = `${pos?.y ?? 50}%`;

  return (
    <Box
      sx={{
        position: "absolute",
        top,
        left,
        transform: "translate(-50%, -50%)",
        zIndex: 2,
      }}
    >
      <Tooltip title={token.role} arrow>
        <TokenContainer
          category={category}
          tokenColor={token.color}
          onClick={() => onClick(token)}
          onMouseEnter={handleMouseEnter}
        >
          <span className="emoji">{token.icon}</span>
        </TokenContainer>
      </Tooltip>
    </Box>
  );
}

// --------------------- MAIN COMPONENT ---------------------
export default function NutTree() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedToken, setSelectedToken] = useState(null);
  const [falling, setFalling] = useState([]);
  const [impacts, setImpacts] = useState([]);
  const [showLegend, setShowLegend] = useState(true);

  // Compute layout once per viewport breakpoint
  const positions = useMemo(() => computeLayout(nutTreeData, isMobile), [isMobile]);

  const handleTokenClick = (token) => {
    const pos = positions[token.name];
    if (pos) {
      const id = `${token.name}-impact-${Date.now()}`;
      const kind = token.name === "SNUT" ? "flame" : "ring";
      const color = token.name === "pNUT" ? BRAND.gold : token.color;
      setImpacts((prev) => [...prev, { id, kind, color, pos }]);
      setTimeout(() => setImpacts((prev) => prev.filter((i) => i.id !== id)), 900);
    }
    setSelectedToken(token);
  };
  const handleCloseModal = () => setSelectedToken(null);
  const handleHoverFall = ({ icon, pos }) => {
    if (!pos) return;
    // Generate 2-3 falling nuts with slight variations
    const nutCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < nutCount; i++) {
      const id = `${icon}-${Date.now()}-${Math.random()}`;
      const offsetX = (Math.random() - 0.5) * 8; // spread horizontally
      const delay = i * 150; // stagger timing
      const variant = icon === "🌰" ? "glow" : "default";
      
      setTimeout(() => {
        setFalling((prev) => [...prev, { 
          id, 
          icon, 
          pos: { x: pos.x + offsetX, y: pos.y },
          variant 
        }]);
      }, delay);
      
      setTimeout(() => {
        setFalling((prev) => prev.filter((f) => f.id !== id));
      }, 1500 + delay);
    }
  };

  // Flatten all tokens (render order: canopy, branches, trunk, soil)
  const allTokens = useMemo(
    () => [
      ...nutTreeData.nestedTokens,
      ...nutTreeData.branches,
      nutTreeData.trunk,
      ...nutTreeData.soil,
    ],
    [],
  );

  return (
    <Layout>
      <Head>
  <title>The BASED NUT Tree 🌳</title>
  <meta name="description" content="The BASED NUT Tree — art-first liquidity map: NUT is the trunk, SNUT burns, pNUT fuels liquidity, roots feed pools." />
      </Head>
      <Box
        sx={{
          maxWidth: "1200px",
          margin: "0 auto",
          position: "relative",
          minHeight: "100vh",
          background: `
            radial-gradient(ellipse 1400px 900px at 50% 30%, ${BRAND.bg0} 0%, ${BRAND.bg1} 35%, ${BRAND.bg2} 65%, ${BRAND.bg3} 100%),
            linear-gradient(180deg, rgba(123,90,80,0.05) 0%, rgba(212,184,150,0.1) 50%, rgba(139,69,19,0.15) 100%)
          `,
          overflow: "hidden",
          "@media (prefers-reduced-motion: reduce)": {
            "*": {
              animation: "none !important",
              transition: "none !important",
            },
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url('/img/oak.webp')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.03,
            zIndex: 0,
          },
          // Add subtle texture overlay
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%", 
            height: "100%",
            background: `
              radial-gradient(circle at 20% 80%, rgba(139,69,19,0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(212,184,150,0.08) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(255,215,0,0.02) 0%, transparent 25%)
            `,
            zIndex: 0,
          },
        }}
      >
        {/* Title */}
        <Box
          sx={{
            textAlign: "center",
            pt: 3,
            pb: 2,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{ color: BRAND.brownDark, fontWeight: 900, letterSpacing: 0.5 }}
          >
            The BASED NUT Tree{" "}
            <span role="img" aria-label="tree">
              🌳
            </span>
          </Typography>
          {/* subtitle removed per branding direction */}
        </Box>

        {/* Legend plaque + toggle (bottom-left) */}
        <Box sx={{ position: "absolute", left: 12, bottom: 12, zIndex: 4 }}>
          <Button
            size="small"
            onClick={() => setShowLegend((s) => !s)}
            sx={{
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              fontWeight: 800,
              letterSpacing: 0.3,
              color: "#f7eedc",
              background: `linear-gradient(145deg, ${BRAND.barkDark}, ${BRAND.bark})`,
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              '&:hover': { filter: "brightness(1.05)" },
            }}
          >
            ☰ Legend
          </Button>
          {showLegend && (
            <Box
              sx={{
                mt: 1,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                fontSize: 13,
                color: BRAND.brownDark,
                background: `linear-gradient(145deg, ${BRAND.bg0} 0%, ${BRAND.bg1} 100%)`,
                backdropFilter: "blur(6px)",
                boxShadow: `0 6px 14px rgba(0,0,0,0.2)`,
                border: `1px solid rgba(139,69,19,0.25)`,
                maxWidth: 300,
                lineHeight: 1.4,
              }}
            >
              <Typography variant="caption" sx={{ display: "block", fontWeight: 800, mb: 0.75, color: BRAND.barkDark }}>
                Legend
              </Typography>
              <Box sx={{ display: "grid", gap: 0.5 }}>
                <span>🌰 Trunk = NUT (core)</span>
                <span>🌿 Branches = SNUT (burn), pNUT (liquidity)</span>
                <span>🍃 Canopy = nested tokens / NFTs</span>
                <span>🌱 Roots = base LPs / pools</span>
              </Box>
              <Button
                href="https://docs.basednut.com/"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{
                  mt: 1.25,
                  borderRadius: 999,
                  fontWeight: 800,
                  color: "#f7eedc",
                  background: `linear-gradient(145deg, ${BRAND.barkDark}, ${BRAND.bark})`,
                  '&:hover': { filter: "brightness(1.05)" },
                }}
              >
                Learn More →
              </Button>
            </Box>
          )}
        </Box>

        {/* Visualization Area */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "80vh",
            zIndex: 1,
          }}
        >
          {/* Tree SVG */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1200 800"
            preserveAspectRatio="xMidYMid meet"
            style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
          >
            <defs>
              <linearGradient id="bark" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={BRAND.bark} />
                <stop offset="40%" stopColor={BRAND.barkDark} />
                <stop offset="100%" stopColor={BRAND.barkDeep} />
              </linearGradient>
              <linearGradient id="barkTexture" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor={BRAND.brownMed} />
                <stop offset="50%" stopColor={BRAND.bark} />
                <stop offset="100%" stopColor={BRAND.barkDark} />
              </linearGradient>
              <linearGradient id="leaf" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={BRAND.leafBright} />
                <stop offset="50%" stopColor={BRAND.leafLight} />
                <stop offset="100%" stopColor={BRAND.leafMed} />
              </linearGradient>
              <linearGradient id="leafDeep" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={BRAND.leafMed} />
                <stop offset="100%" stopColor={BRAND.leafDark} />
              </linearGradient>
              <linearGradient id="root" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={BRAND.soil} />
                <stop offset="100%" stopColor={BRAND.soilDark} />
              </linearGradient>
              <linearGradient id="goldFlow" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="30%" stopColor={BRAND.gold} stopOpacity="0.6" />
                <stop offset="70%" stopColor={BRAND.amber} stopOpacity="0.8" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.25" />
              </filter>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <pattern id="barkPattern" patternUnits="userSpaceOnUse" width="8" height="8">
                <rect width="8" height="8" fill={BRAND.bark} />
                <path d="M0,4 Q4,2 8,4 Q4,6 0,4" fill={BRAND.barkDark} opacity="0.3" />
              </pattern>
            </defs>

            {/* Enhanced canopy with depth and parallax */}
            <g filter="url(#softShadow)" style={{ transformOrigin: "600px 220px", animation: `${parallaxSway} 8s ease-in-out infinite` }}>
              {/* Background canopy layer */}
              <ellipse cx="600" cy="235" rx="380" ry="165" fill="url(#leafDeep)" opacity="0.25" />
              <ellipse cx="580" cy="225" rx="340" ry="145" fill="url(#leafDeep)" opacity="0.35" />
              
              {/* Mid canopy layer */}
              <ellipse cx="620" cy="215" rx="300" ry="125" fill="url(#leaf)" opacity="0.45" 
                style={{ animation: `${leafRustle} 6s ease-in-out infinite` }} />
              <ellipse cx="590" cy="210" rx="260" ry="110" fill="url(#leaf)" opacity="0.55" 
                style={{ animation: `${leafRustle} 5s ease-in-out -1s infinite` }} />
              
              {/* Foreground canopy highlights */}
              <ellipse cx="610" cy="205" rx="220" ry="95" fill="url(#leaf)" opacity="0.65" 
                style={{ animation: `${leafRustle} 7s ease-in-out -2s infinite` }} />
              <ellipse cx="590" cy="200" rx="180" ry="80" fill={BRAND.leafBright} opacity="0.4" />
              
              {/* Individual leaf clusters for detail */}
              <circle cx="520" cy="190" r="25" fill={BRAND.leafLight} opacity="0.6" 
                style={{ animation: `${leafRustle} 4s ease-in-out infinite` }} />
              <circle cx="680" cy="200" r="20" fill={BRAND.leafMed} opacity="0.7" 
                style={{ animation: `${leafRustle} 5s ease-in-out -1.5s infinite` }} />
              <circle cx="600" cy="180" r="18" fill={BRAND.leafBright} opacity="0.8" 
                style={{ animation: `${leafRustle} 6s ease-in-out -0.5s infinite` }} />
            </g>

            {/* Enhanced trunk with texture and depth */}
            <g filter="url(#softShadow)">
              {/* Main trunk body with texture */}
              <path
                d="M565 780 C 570 720, 575 640, 580 540 C 585 420, 580 350, 585 280 C 588 250, 590 230, 590 230 L 610 230 C 610 230, 612 250, 615 280 C 620 350, 615 420, 620 540 C 625 640, 630 720, 635 780 Z"
                fill="url(#bark)"
                opacity="0.95"
              />
              
              {/* Bark texture overlay */}
              <path
                d="M570 780 C 574 720, 578 640, 582 540 C 586 420, 582 350, 585 280 C 587 250, 588 235, 590 230 L 610 230 C 612 235, 613 250, 615 280 C 618 350, 614 420, 618 540 C 622 640, 626 720, 630 780 Z"
                fill="url(#barkPattern)"
                opacity="0.6"
              />
              
              {/* Trunk highlights for 3D effect */}
              <path
                d="M575 780 C 578 720, 580 640, 583 540 C 585 420, 583 350, 585 280 C 586 250, 587 240, 588 235 L 590 235 L 590 780 Z"
                fill={BRAND.brownLight}
                opacity="0.3"
              />
              
              {/* Trunk shadows for depth */}
              <path
                d="M610 235 C 612 240, 613 250, 615 280 C 617 350, 615 420, 617 540 C 620 640, 622 720, 625 780 L 630 780 C 628 720, 625 640, 622 540 C 619 420, 617 350, 620 280 C 622 250, 623 240, 625 235 Z"
                fill={BRAND.barkDeep}
                opacity="0.4"
              />
            </g>

            {/* Enhanced major branches with dynamic sway */}
            <g style={{ transformOrigin: "520px 300px", animation: `${swayBranch} 7s ease-in-out infinite` }}>
              <AnimatedPath
                color={BRAND.leafMed}
                thickness={12}
                dash={false}
                d="M600 320 C 580 310, 550 295, 520 285 C 480 270, 440 260, 400 260"
                style={{ filter: "url(#glow)" }}
              />
              <AnimatedPath
                color={BRAND.leafLight}
                thickness={6}
                dash={false}
                d="M600 320 C 580 310, 550 295, 520 285 C 480 270, 440 260, 400 260"
                style={{ filter: "url(#glow)" }}
              />
            </g>
            
            <g style={{ transformOrigin: "680px 300px", animation: `${swayBranch} 6s ease-in-out -2s infinite` }}>
              <AnimatedPath
                color={BRAND.amber}
                thickness={12}
                dash={false}
                d="M600 320 C 620 310, 650 295, 680 285 C 720 270, 760 260, 800 260"
                style={{ filter: "url(#glow)" }}
              />
              <AnimatedPath
                color={BRAND.gold}
                thickness={6}
                dash={false}
                d="M600 320 C 620 310, 650 295, 680 285 C 720 270, 760 260, 800 260"
                style={{ filter: "url(#glow)" }}
              />
            </g>

            {/* Enhanced flowing liquidity roots */}
            <g style={{ animation: `${rootPulse} 5s ease-in-out infinite` }}>
              <path d="M600 780 C 580 785, 560 790, 540 795 C 520 800, 500 795, 480 790 C 460 785, 440 795, 420 800" 
                stroke="url(#root)" strokeWidth="14" fill="none" opacity="0.8" />
              <path d="M600 780 C 620 785, 640 790, 660 795 C 680 800, 700 795, 720 790 C 740 785, 760 795, 780 800" 
                stroke="url(#root)" strokeWidth="14" fill="none" opacity="0.8" />
              
              {/* Secondary root networks */}
              <path d="M580 790 C 570 795, 550 800, 530 795 C 510 790, 490 800, 470 805" 
                stroke="url(#root)" strokeWidth="8" fill="none" opacity="0.6" />
              <path d="M620 790 C 630 795, 650 800, 670 795 C 690 790, 710 800, 730 805" 
                stroke="url(#root)" strokeWidth="8" fill="none" opacity="0.6" />
                
              {/* Liquidity flow highlights */}
              <path d="M600 780 C 580 785, 560 790, 540 795" 
                stroke={BRAND.gold} strokeWidth="2" fill="none" opacity="0.4" 
                style={{ animation: `${shimmerFlow} 3s ease-in-out infinite` }} />
              <path d="M600 780 C 620 785, 640 790, 660 795" 
                stroke={BRAND.amber} strokeWidth="2" fill="none" opacity="0.4" 
                style={{ animation: `${shimmerFlow} 3s ease-in-out -1s infinite` }} />
            </g>

            {/* Enhanced animated nutrient flows with shimmer */}
            {[
              ...nutTreeData.nestedTokens.map((t) => ({ 
                end: t.name, 
                color: BRAND.leafLight, 
                thickness: 5,
                shimmer: BRAND.leafBright
              })),
              ...nutTreeData.branches.map((t) => ({ 
                end: t.name, 
                color: t.name === "SNUT" ? BRAND.leafMed : BRAND.amber, 
                thickness: 7,
                shimmer: t.name === "SNUT" ? BRAND.leafBright : BRAND.gold
              })),
              ...nutTreeData.soil.map((t) => ({ 
                end: t.name, 
                color: BRAND.barkDark, 
                thickness: 6,
                shimmer: BRAND.soil
              })),
            ].map((conn, i) => {
              const start = positions[nutTreeData.trunk.name];
              const end = positions[conn.end];
              if (!start || !end) return null;
              const sx = (start.x / 100) * 1200;
              const sy = (start.y / 100) * 800;
              const ex = (end.x / 100) * 1200;
              const ey = (end.y / 100) * 800;
              const mx = (sx + ex) / 2;
              const my = sy + (ey < sy ? -90 : 70);
              const d = `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`;
              
              return (
                <g key={`flow-${conn.end}-${i}`}>
                  {/* Base flow path */}
                  <AnimatedPath
                    d={d}
                    color={conn.color}
                    thickness={conn.thickness}
                    style={{ 
                      animation: `${shimmerFlow} ${3 + Math.random()}s ease-in-out infinite`,
                      strokeDasharray: "8 12"
                    }}
                  />
                  {/* Shimmer overlay */}
                  <AnimatedPath
                    d={d}
                    color={conn.shimmer}
                    thickness={Math.max(2, conn.thickness - 3)}
                    dash={false}
                    style={{ 
                      animation: `${shimmerFlow} ${2 + Math.random() * 0.5}s ease-in-out infinite`,
                      opacity: 0.6
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Enhanced falling nuts overlay with variety */}
          <Box sx={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }} aria-hidden>
            {impacts.map((it) => (
              <Impact
                key={it.id}
                kind={it.kind}
                color={it.color}
                style={{ left: `${it.pos.x}%`, top: `${it.pos.y}%` }}
              />
            ))}
            {falling.map((f) => (
              <FallingNut
                key={f.id}
                size={isMobile ? 16 + Math.random() * 6 : 20 + Math.random() * 8}
                variant={f.variant}
                style={{ 
                  left: `${f.pos.x}%`, 
                  top: `${f.pos.y}%`, 
                  transform: "translate(-50%, -50%)",
                }}
              >
                {f.icon}
              </FallingNut>
            ))}
          </Box>

          {/* Token Nodes */}
          {allTokens.map((token) => (
            <TokenNode
              key={token.name}
              token={token}
              onClick={handleTokenClick}
              pos={positions[token.name]}
              onHoverFall={handleHoverFall}
            />
          ))}
        </Box>

        {/* Modal for Token Details */}
        {selectedToken && (
          <TokenModal
            token={selectedToken}
            open={Boolean(selectedToken)}
            onClose={handleCloseModal}
          />
        )}
        {/* Narrative card (top-right) */}
        <Box
          sx={{
            position: "absolute",
            right: 12,
            top: { xs: 84, md: 96 },
            zIndex: 3,
            px: 2,
            py: 1.5,
            borderRadius: 2,
            background: `linear-gradient(145deg, ${BRAND.bg0}, ${BRAND.bg1})`,
            border: `1px solid rgba(139,69,19,0.22)`,
            boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
            maxWidth: 320,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 900, color: BRAND.barkDark, display: "block", mb: 0.75 }}>
            How this tree works
          </Typography>
          <Typography variant="caption" sx={{ display: "block", color: BRAND.barkDark }}>
            NUT anchors the trunk. SNUT burns create pressure. pNUT fuels liquidity. Roots feed LPs and pools. The glow lines show active flow; falling symbols hint at market pressure.
          </Typography>
        </Box>
      </Box>
    </Layout>
  );
}
