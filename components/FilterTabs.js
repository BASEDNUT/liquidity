import React from "react";
import {
  Button,
  ButtonGroup,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
  Box,
} from "@mui/material";

const FilterTabs = ({ filter, setFilter, pools }) => {
  const filters = ["All", "NFTs", "TKNs", "NUT", "SNUT", "pNUT", "NUTcoins"];
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const filteredPools = pools.filter((pool) => {
    return filter === "All" || pool.category.includes(filter);
  });

  if (isMobile) {
    return (
      <Box
        sx={{
          backgroundColor: "#F6E8C3",
          border: "2px solid #D2B48C",
          borderRadius: 2,
          padding: 0.5,
          width: "fit-content",
        }}
      >
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{
            color: "#7D5A50",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#7D5A50",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#7D5A50",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#7D5A50",
            },
          }}
        >
          {filters.map((f) => (
            <MenuItem key={f} value={f}>
              {f}
            </MenuItem>
          ))}
        </Select>
      </Box>
    );
  }

  return (
    <ButtonGroup
      variant="outlined"
      aria-label="outlined button group"
      sx={{
        backgroundColor: "#F6E8C3",
        borderRadius: 2,
        p: 0.5,
        border: "2px solid #D2B48C",
      }}
    >
      {filters.map((f) => {
        const isActive = filter === f;
        return (
          <Button
            key={f}
            onClick={() => setFilter(f)}
            variant={isActive ? "contained" : "outlined"}
            sx={{
              color: isActive ? "#FFF" : "#7D5A50",
              borderColor: "#7D5A50",
              textTransform: "none",
              backgroundColor: isActive ? "#7D5A50" : "transparent",
              margin: "0 2px",
              borderRadius: 2,
              "&:hover": {
                backgroundColor: isActive ? "#6C4A3C" : "#F1D9AB",
                borderColor: "#7D5A50",
              },
            }}
          >
            {f}
          </Button>
        );
      })}
    </ButtonGroup>
  );
};

export default FilterTabs;