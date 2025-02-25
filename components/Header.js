import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  SwipeableDrawer,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme, keyframes } from "@mui/system";
import { useState } from "react";
import Link from "next/link";

// Wiggle Animation (borrowed from the pool cards)
const wiggle = keyframes`
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(3deg); }
  40% { transform: rotate(-3deg); }
  60% { transform: rotate(2deg); }
  80% { transform: rotate(-2deg); }
`;

// Reusable gradient button styling
const gradientButtonStyle = {
  background: "linear-gradient(45deg, #7D5A50, #A67C52)",
  color: "#FFFFFF",
  textTransform: "none",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
  transition: "background 0.3s ease, transform 0.3s ease",
  "&:hover": {
    background: "linear-gradient(45deg, #6C4A3C, #8A623F)",
    animation: `${wiggle} 0.4s ease-in-out`,
    transform: "translateY(-2px)",
  },
};

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const menuItems = (
    <Box
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
      // This Box will exactly fill the drawer width,
      // and box-sizing ensures padding won't cause overflow
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 2,
        boxSizing: "border-box",
        height: "100%", // Optional if you want the box to fill vertical space
        backgroundColor: "#F5E9DA",
      }}
    >
      <Link href="/" passHref>
        <Button
          variant="contained"
          sx={{
            ...gradientButtonStyle,
            width: "100%",
            my: 1,
          }}
        >
          Home
        </Button>
      </Link>
      <Link href="/tree" passHref>
        <Button
          variant="contained"
          sx={{
            ...gradientButtonStyle,
            width: "100%",
            my: 1,
          }}
        >
          Tree
        </Button>
      </Link>
      {isMobile && (
        <Link href="https://docs.basednut.com/" passHref>
          <Button
            variant="contained"
            sx={{
              ...gradientButtonStyle,
              width: "100%",
              my: 1,
            }}
          >
            LEARN MORE
          </Button>
        </Link>
      )}
    </Box>
  );

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#D1B48C", // Warm peanut-brown
        borderBottom: "4px solid #7D5A50", // Darker brown border for emphasis
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            BASED NUT 🌰
          </Typography>
        </Box>

        {/* Desktop "LEARN MORE" button */}
        {!isMobile && (
          <Button
            variant="contained"
            href="https://docs.basednut.com/"
            sx={{
              ...gradientButtonStyle,
              mr: 2,
            }}
          >
            LEARN MORE
          </Button>
        )}

        <IconButton onClick={toggleDrawer(true)} color="inherit">
          <MenuIcon />
        </IconButton>

        <SwipeableDrawer
          anchor="right"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
          PaperProps={{
            sx: {
              width: 280, // Fixed side-drawer width
              boxSizing: "border-box",
              backgroundColor: "#F5E9DA",
            },
          }}
        >
          {menuItems}
        </SwipeableDrawer>
      </Toolbar>
    </AppBar>
  );
}
