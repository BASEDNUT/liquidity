import React from "react";
import { TextField, InputAdornment, Box, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

const SearchBar = ({ value, onChange, placeholder = "Search pools, tokens, platforms..." }) => {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 480,
        mx: "auto",
      }}
    >
      <TextField
        fullWidth
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#FFF7EA",
            borderRadius: "16px",
            border: "2px solid #D2B48C",
            color: "#5B3A29",
            fontSize: "0.95rem",
            "& fieldset": {
              border: "none",
            },
            "&:hover": {
              backgroundColor: "#FFF3DD",
            },
            "&.Mui-focused": {
              backgroundColor: "#FFF7EA",
              boxShadow: "0 0 0 3px rgba(210, 180, 140, 0.3)",
            },
          },
          "& .MuiInputBase-input::placeholder": {
            color: "#A0866A",
            opacity: 1,
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#7D5A50", fontSize: "1.2rem" }} />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => onChange("")}
                sx={{ color: "#7D5A50", p: 0.5 }}
                aria-label="clear search"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />
    </Box>
  );
};

export default SearchBar;
