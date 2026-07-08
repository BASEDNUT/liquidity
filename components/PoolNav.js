// PoolNav.js — Reusable pool navigation matching site's aesthetic
// 20 pools is too many for buttons — always use a Select dropdown
import { Select, MenuItem, Box, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { fetchPools } from '../utils/fetchPools';

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function PoolNav() {
  const router = useRouter();
  const currentId = router.query.id;
  const pools = fetchPools();

  const c = {
    bg: '#F6E8C3',
    border: '#D2B48C',
    text: '#7D5A50',
    label: 'rgba(91,58,41,0.5)',
  };

  return (
    <Box sx={{
      mb: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      flexWrap: 'wrap',
    }}>
      <Typography sx={{
        fontSize: '0.75rem',
        fontWeight: 700,
        color: c.label,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        whiteSpace: 'nowrap',
      }}>
        Pools
      </Typography>
      <Box sx={{
        backgroundColor: c.bg,
        border: `2px solid ${c.border}`,
        borderRadius: 2,
        padding: 0.5,
        width: 'fit-content',
      }}>
        <Select
          value={currentId || ''}
          displayEmpty
          sx={{
            color: c.text,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: c.border },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.border },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: c.border },
            minWidth: 180,
          }}
          renderValue={(val) => {
            if (!val) return 'Select pool...';
            const p = pools.find((p) => `${slugify(p.name)}-${slugify(p.platform)}` === val);
            return p ? `${p.icon} ${p.name} (${p.platform})` : 'Select pool...';
          }}
        >
          {pools.map((p) => {
            const poolId = `${slugify(p.name)}-${slugify(p.platform)}`;
            return (
              <MenuItem key={poolId} value={poolId} component={Link} href={`/pool/${poolId}`}>
                {p.icon} {p.name} · {p.platform}
              </MenuItem>
            );
          })}
        </Select>
      </Box>
    </Box>
  );
}
