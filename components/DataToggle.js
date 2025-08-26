import { ButtonGroup, Button } from "@mui/material";

export default function DataToggle({ value, onChange }) {
  const options = [
    { key: 'pools', label: 'Pools' },
    { key: 'tokens', label: 'Tokens' },
  ];

  return (
    <ButtonGroup
      role="tablist"
      aria-label="Data view toggle"
      sx={{
        backgroundColor: "#F6E8C3",
        border: "2px solid #D2B48C",
        borderRadius: 2,
        p: 0.5,
      }}
    >
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <Button
            key={opt.key}
            role="tab"
            aria-pressed={active}
            variant={active ? 'contained' : 'outlined'}
            onClick={() => onChange(opt.key)}
            sx={{
              textTransform: 'none',
              color: active ? '#FFF' : '#7D5A50',
              borderColor: '#7D5A50',
              backgroundColor: active ? '#7D5A50' : 'transparent',
              '&:hover': {
                backgroundColor: active ? '#6C4A3C' : '#F1D9AB',
                borderColor: '#7D5A50',
              },
            }}
          >
            {opt.label}
          </Button>
        );
      })}
    </ButtonGroup>
  );
}
