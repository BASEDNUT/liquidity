import React, { useState } from "react";
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

// --------------------- ANIMATIONS ---------------------
const wiggle = keyframes`
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(3deg); }
  40% { transform: rotate(-3deg); }
  60% { transform: rotate(2deg); }
  80% { transform: rotate(-2deg); }
`;

const fallDown = keyframes`
  0% { transform: translateY(0px); opacity: 1; }
  100% { transform: translateY(200px); opacity: 0; }
`;

const flow = keyframes`
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 30; }
`;

// --------------------- TOKEN POSITIONS ---------------------
const tokenPositions = {
  NUT: { x: 50, y: 60 },
  SNUT: { x: 30, y: 45 },
  pNUT: { x: 70, y: 45 },
  NUTINO: { x: 20, y: 30 },
  PNUTS: { x: 35, y: 25 },
  SALMD: { x: 50, y: 20 },
  ALMD: { x: 65, y: 25 },
  PNUTRMY: { x: 80, y: 30 },
  cbETH: { x: 40, y: 85 },
  cbBTC: { x: 60, y: 85 },
};

// --------------------- CONNECTION LINES ---------------------
const lines = [
  // trunk -> main branches (THICK)
  { start: "NUT", end: "SNUT", color: "#5BA150", thickness: 8 },
  { start: "NUT", end: "pNUT", color: "#D5A100", thickness: 8 },

  // trunk -> top canopy (nested tokens)
  { start: "NUT", end: "NUTINO", color: "#8A5A5A", thickness: 4 },
  { start: "NUT", end: "PNUTS", color: "#E1B382", thickness: 4 },
  { start: "NUT", end: "SALMD", color: "#F5D6A3", thickness: 4 },
  { start: "NUT", end: "ALMD", color: "#5D3A1A", thickness: 4 },
  { start: "NUT", end: "PNUTRMY", color: "#D7A45F", thickness: 4 },

  // trunk -> soil (MEDIUM)
  { start: "NUT", end: "cbETH", color: "#555555", thickness: 6 },
  { start: "NUT", end: "cbBTC", color: "#4A4A4A", thickness: 6 },
];

// --------------------- FALLING EMOJI ---------------------
const FallingEmoji = styled("div")({
  position: "absolute",
  fontSize: "1.5rem",
  animation: `${fallDown} 1s ease-in-out forwards`,
  zIndex: 9999, // ensure falling emojis are on top
  pointerEvents: "none", // don't block clicks
});

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
const AnimatedLine = styled("line")(({ color, thickness }) => ({
  stroke: color,
  strokeWidth: thickness,
  strokeLinecap: "round",
  strokeDasharray: "5 5",
  animation: `${flow} 2s linear infinite`,
}));

// --------------------- NODE SHAPES ---------------------
const TokenContainer = styled("div")(({ category, tokenColor }) => {
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
    transition: "transform 0.3s, backgroundColor 0.3s",
    "&:hover": {
      animation: `${wiggle} 0.4s ease-in-out`,
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
        width: "70px",
        height: "60px",
        clipPath:
          "polygon(0 0, 100% 0, 100% 65%, 85% 85%, 70% 100%, 30% 100%, 15% 85%, 0 65%)",
        background: `radial-gradient(circle at 30% 50%, ${tokenColor} 20%, #222 90%)`,
        boxShadow: "0 0 8px rgba(0, 0, 0, 0.3)",
      };

    case "trunk":
      return {
        ...baseStyles,
        width: "80px",
        height: "120px",
        background: `linear-gradient(135deg, ${tokenColor} 30%, #5D3A1A 100%)`,
        clipPath: "polygon(40% 0%, 60% 0%, 75% 100%, 25% 100%)",
        boxShadow: "inset 0 0 10px rgba(0,0,0,0.3)",
      };

    case "branch":
      return {
        ...baseStyles,
        width: "80px",
        height: "40px",
        clipPath:
          "polygon(0 30%, 10% 0%, 90% 0%, 100% 30%, 100% 70%, 90% 100%, 10% 100%, 0 70%)",
        background: `linear-gradient(to right, ${tokenColor} 40%, ${darkenColor(
          tokenColor,
          0.2,
        )} 100%)`,
        boxShadow: "inset 0 0 5px rgba(0,0,0,0.3)",
        "&::before": {
          content: '""',
          position: "absolute",
          zIndex: 0,
          top: "-8px",
          left: "12px",
          width: "16px",
          height: "16px",
          backgroundColor: lightenColor(tokenColor, 0.2),
          borderRadius: "50%",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          zIndex: 0,
          top: "-8px",
          right: "12px",
          width: "16px",
          height: "16px",
          backgroundColor: darkenColor(tokenColor, 0.2),
          borderRadius: "50%",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        },
      };

    case "canopy": {
      const canopyColor = pickGreenShade(tokenColor);
      return {
        ...baseStyles,
        width: "70px",
        height: "50px",
        backgroundColor: canopyColor,
        borderRadius: "50px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        "&::before": {
          content: '""',
          position: "absolute",
          zIndex: 0,
          top: "-12px",
          left: "5px",
          width: "35px",
          height: "35px",
          backgroundColor: lightenColor(canopyColor, 0.15),
          borderRadius: "50%",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          zIndex: 0,
          top: "-10px",
          right: "5px",
          width: "30px",
          height: "30px",
          backgroundColor: darkenColor(canopyColor, 0.15),
          borderRadius: "50%",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
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
        <Typography sx={{ mt: 2 }}>{token.role}</Typography>
        <Button
          variant="contained"
          href={token.link}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            mt: 2,
            backgroundColor: token.color,
            "&:hover": { backgroundColor: darkenColor(token.color) },
          }}
        >
          View Contract
        </Button>
      </Box>
    </Modal>
  );
}

// --------------------- SINGLE TOKEN NODE ---------------------
function TokenNode({ token, onClick }) {
  const [fallingEmojis, setFallingEmojis] = useState([]);
  const category = getTokenCategory(token);

  const handleMouseEnter = () => {
    const newEmoji = { id: Date.now(), icon: token.icon };
    setFallingEmojis((prev) => [...prev, newEmoji]);
    // Remove the falling emoji after 1 second
    setTimeout(() => {
      setFallingEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
    }, 1000);
  };

  const pos = tokenPositions[token.name] || { x: 50, y: 50 };
  const left = `${pos.x}%`;
  const top = `${pos.y}%`;

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
          {fallingEmojis.map((emoji) => (
            <FallingEmoji key={emoji.id}>{emoji.icon}</FallingEmoji>
          ))}
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

  const handleTokenClick = (token) => setSelectedToken(token);
  const handleCloseModal = () => setSelectedToken(null);

  // Flatten all tokens
  const allTokens = [
    ...nutTreeData.nestedTokens,
    ...nutTreeData.branches,
    nutTreeData.trunk,
    ...nutTreeData.soil,
  ];

  return (
    <Layout>
      <Box
        sx={{
          maxWidth: "1200px",
          margin: "0 auto",
          position: "relative",
          minHeight: "100vh",
          backgroundColor: "#F6E8C3",
          overflow: "hidden",
          // Pseudo-element for oak image background:
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
            opacity: 0.08,
            zIndex: 0,
          },
          [theme.breakpoints.up("lg")]: {
            // Optional scaling on large screens
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
            sx={{ color: "#7D5A50", fontWeight: "bold" }}
          >
            The BASED NUT Tree{" "}
            <span role="img" aria-label="tree">
              🌳
            </span>
          </Typography>
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
          {/* Lines (SVG) */}
          <svg
            width="100%"
            height="100%"
            style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
          >
            {lines.map(({ start, end, color, thickness }, i) => {
              const startPos = tokenPositions[start] || { x: 50, y: 50 };
              const endPos = tokenPositions[end] || { x: 50, y: 50 };
              const x1 = `${startPos.x}%`;
              const y1 = `${startPos.y}%`;
              const x2 = `${endPos.x}%`;
              const y2 = `${endPos.y}%`;
              return (
                <AnimatedLine
                  key={`${start}-${end}-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  color={color}
                  thickness={thickness}
                />
              );
            })}
          </svg>

          {/* Token Nodes */}
          {allTokens.map((token) => (
            <TokenNode
              key={token.name}
              token={token}
              onClick={handleTokenClick}
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
      </Box>
    </Layout>
  );
}
