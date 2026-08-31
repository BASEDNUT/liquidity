// TokenNav.js — Reusable token navigation matching site's FilterTabs aesthetic
// dark=true for custom dark pages (NUT/SNUT/pNUT), dark=false for light [id].js pages
import {
  Button,
  ButtonGroup,
  Select,
  MenuItem,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { fetchTokens } from '../utils/fetchTokens';

export default function TokenNav({ dark = false }) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const data = fetchTokens();
  // wNUT observatory page lives at /token/wnut (static route beats [id])
  const wnutToken = { name: 'wNUT', icon: '🎁', id: 'wnut', color: '#6B8E4E' };
  const tokens = [
    { ...data.trunk, id: (data.trunk?.name || 'trunk').toLowerCase() },
    wnutToken,
    ...(data.branches || []).map((t, i) => ({ ...t, id: (t.name || `branch-${i}`).toLowerCase() })),
    ...(data.nestedTokens || []).map((t, i) => ({ ...t, id: (t.name || `nested-${i}`).toLowerCase() })),
    ...(data.soil || []).map((t, i) => ({ ...t, id: (t.name || `soil-${i}`).toLowerCase() })),
  ];

  // Determine current token id from path
  let currentId = '';
  const path = router.pathname;
  if (path === '/token/nut') currentId = 'nut';
  else if (path === '/token/snut') currentId = 'snut';
  else if (path === '/token/pnut') currentId = 'pnut';
  else if (path === '/token/wnut') currentId = 'wnut';
  else if (router.query.id) currentId = String(router.query.id).toLowerCase();

  const c = dark
    ? {
        bg: 'rgba(45,30,20,0.85)',
        border: '#C8A27A',
        text: '#F5E6D3',
        textActive: '#FFFFFF',
        activeBg: '#A0703C',
        hoverBg: 'rgba(160,112,60,0.3)',
      }
    : {
        bg: '#F6E8C3',
        border: '#D2B48C',
        text: '#5B3A29',
        textActive: '#FFFFFF',
        activeBg: '#7D5A50',
        hoverBg: '#F1D9AB',
      };

  if (isMobile) {
    return (
      <Box sx={{
        mb: 2,
        backgroundColor: c.bg,
        border: `2px solid ${c.border}`,
        borderRadius: 2,
        padding: 0.5,
        width: 'fit-content',
      }}>
        <Select
          value={currentId}
          sx={{
            color: c.text,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: c.border },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.border },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: c.border },
          }}
          renderValue={(val) => {
            const t = tokens.find((t) => t.id === val);
            return t ? `${t.icon} ${t.name}` : 'Select token';
          }}
        >
          {tokens.map((t) => (
            <MenuItem key={t.id} value={t.id} component={Link} href={t.href || `/token/${t.id}`}>
              {t.icon} {t.name}
            </MenuItem>
          ))}
        </Select>
      </Box>
    );
  }

  return (
    <ButtonGroup
      variant="outlined"
      sx={{
        backgroundColor: c.bg,
        borderRadius: 2,
        p: 0.5,
        border: `2px solid ${c.border}`,
        mb: 2,
        '& .MuiButtonGroup-grouped': {
          minWidth: 'auto',
        },
      }}
    >
      {tokens.map((t) => {
        const isActive = t.id === currentId;
        return (
          <Button
            key={t.id}
            href={t.href || `/token/${t.id}`}
            LinkComponent={Link}
            variant={isActive ? 'contained' : 'outlined'}
            sx={{
              color: isActive ? c.textActive : c.text,
              borderColor: c.border,
              textTransform: 'none',
              backgroundColor: isActive ? c.activeBg : 'transparent',
              margin: '0 2px',
              borderRadius: 2,
              fontSize: '0.8rem',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: isActive ? c.activeBg : c.hoverBg,
                borderColor: c.border,
              },
            }}
          >
            {t.icon} {t.name}
          </Button>
        );
      })}
    </ButtonGroup>
  );
}
