import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

export default function Header() {
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
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
            BASED NUT 🌰
          </Typography>
        </Box>
        <a href="https://docs.basednut.com/" style={{ textDecoration: "none" }}>
          {/* Custom styling for the button to fit the “nutty” theme */}
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#7D5A50",
              color: "#FFF",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#6C4A3C",
              },
            }}
          >
            Learn More
          </Button>
        </a>
      </Toolbar>
    </AppBar>
  );
}
