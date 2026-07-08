import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import {
  Container,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert
} from '@mui/material';

// ── Static game data ──
const factions = [
  "Peanuts", "Almonds", "Walnuts", "Cashews", "Pistachios",
  "Hazelnuts", "Coconuts", "Macadamias", "Pecans", "Chestnuts"
];

const actions = ["Attack", "Defend", "Rally", "Scheme", "Trade"];

const factionAbilities = {
  Peanuts: "Salt Shield — Reduces incoming damage by 50%",
  Almonds: "Golden Swarm — +2 morale on Rally",
  Walnuts: "Hard Shell — Defend grants +3 morale",
  Cashews: "Swift Strike — Attack deals double morale loss",
  Pistachios: "Pistachio Pact — Trade yields +2 territories",
  Hazelnuts: "Nutty Fortune — Scheme has 30% chance to steal territory",
  Coconuts: "Tropical Slam — Attack hits two factions",
  Macadamias: "Iron Nut — Defend grants +5 morale",
  Pecans: "Pecan Blitz — Attack costs no morale",
  Chestnuts: "Roasting Rampage — Scheme burns enemy morale",
};

// Action outcome generators — fully local, deterministic-ish with Math.random
const actionNarratives = {
  Attack: (faction, target) => `${faction} launched a surprise Attack on ${target}! Shells were flying everywhere!`,
  Defend: (faction) => `${faction} fortified their position with a Defend order. The walls shall not fall!`,
  Rally: (faction) => `${faction} rallied the troops with a fiery speech. Morale is soaring!`,
  Scheme: (faction, target) => `${faction} hatched a devious Scheme against ${target}. Plot twist incoming!`,
  Trade: (faction) => `${faction} opened Trade routes. Profit over war, sometimes.`,
};

const initialMap = Array(9).fill().map(() => Array(9).fill('neutral'));

const getFactionColor = (faction) => {
  switch (faction) {
    case 'Peanuts': return '#FDE8B1';
    case 'Almonds': return '#D4A373';
    case 'Walnuts': return '#A47C6F';
    case 'Cashews': return '#E7C8A0';
    case 'Pistachios': return '#AEC3B0';
    case 'Hazelnuts': return '#B08968';
    case 'Coconuts': return '#D2B48C';
    case 'Macadamias': return '#F5F5DC';
    case 'Pecans': return '#8B4513';
    case 'Chestnuts': return '#964B00';
    default: return '#E2D5C3';
  }
};

// Generate initial faction stats
const getInitialStats = () => factions.reduce((acc, f) => {
  acc[f] = {
    morale: Math.floor(Math.random() * 20) + 10,
    territories: Math.floor(Math.random() * 5) + 1,
    specialAbility: factionAbilities[f],
  };
  return acc;
}, {});

// Generate initial seed outcomes for the chronicle
const getSeedOutcomes = () => {
  const seeds = [];
  for (let i = 0; i < 5; i++) {
    const f = factions[Math.floor(Math.random() * factions.length)];
    const a = actions[Math.floor(Math.random() * actions.length)];
    const target = factions[Math.floor(Math.random() * factions.length)];
    const moraleChange = Math.floor(Math.random() * 6) - 2;
    seeds.push({
      faction: f,
      action: a,
      narrative: actionNarratives[a](f, target),
      effects: `Morale ${moraleChange > 0 ? '+' : ''}${moraleChange}`,
      timestamp: new Date(Date.now() - (5 - i) * 60000).toLocaleTimeString(),
    });
  }
  return seeds;
};

const COOLDOWN_SECONDS = 30; // Short cooldown for local game

export default function WarMachinePage() {
  const [outcomes, setOutcomes] = useState([]);
  const [factionStats, setFactionStats] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isStateLoading, setIsStateLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedFaction, setSelectedFaction] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [error, setError] = useState('');
  const [map, setMap] = useState(initialMap);

  // Initialize game state on mount — fully local, no API
  useEffect(() => {
    setFactionStats(getInitialStats());
    setOutcomes(getSeedOutcomes());
    setIsStateLoading(false);
  }, []);

  // Update map based on outcomes
  useEffect(() => {
    const newMap = initialMap.map(row => [...row]);
    outcomes.slice(0, 8).forEach((outcome) => {
      if (outcome.faction && factions.includes(outcome.faction)) {
        const r = Math.abs(outcome.faction.charCodeAt(0) + (outcome.action?.charCodeAt(0) || 0)) % 9;
        const c = Math.abs(outcome.faction.charCodeAt(0) - (outcome.action?.charCodeAt(0) || 0)) % 9;
        if (newMap[r] && newMap[r][c] !== undefined) {
          newMap[r][c] = outcome.faction;
        }
      }
    });
    setMap(newMap);
  }, [outcomes]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [timeLeft]);

  const handleSubmit = useCallback(() => {
    if (!selectedFaction) {
      setError('Please select a faction.');
      return;
    }
    if (!selectedAction) {
      setError('Please select an action.');
      return;
    }
    if (timeLeft > 0) {
      setError(`Action on cooldown. Wait ${timeLeft}s.`);
      return;
    }

    setIsLoading(true);
    setError('');

    // ── Local game logic ──
    const target = factions[Math.floor(Math.random() * factions.length)];
    const moraleRoll = Math.floor(Math.random() * 8) - 3; // -3 to +4
    const territoryRoll = Math.floor(Math.random() * 3) - 1; // -1 to +1

    let moraleChange = moraleRoll;
    let territoryChange = territoryRoll;
    let effects = '';

    // Ability flags for target-side effects
    let coconutMultiAttack = false;
    let chestnutMoraleBurn = false;
    let stealTerritory = false;

    // Apply special ability modifiers
    switch (selectedFaction) {
      case 'Peanuts':
        // Salt Shield — passive: reduces incoming damage by 50% (applied in target section)
        break;
      case 'Almonds':
        if (selectedAction === 'Rally') moraleChange += 2;
        break;
      case 'Walnuts':
        if (selectedAction === 'Defend') moraleChange += 3;
        break;
      case 'Cashews':
        // Swift Strike — Attack deals double morale loss to target (applied in target section)
        break;
      case 'Pistachios':
        if (selectedAction === 'Trade') territoryChange += 2;
        break;
      case 'Hazelnuts':
        // Nutty Fortune — Scheme has 30% chance to steal territory
        if (selectedAction === 'Scheme' && Math.random() < 0.3) {
          stealTerritory = true;
          territoryChange += 1;
        }
        break;
      case 'Coconuts':
        // Tropical Slam — Attack hits two factions
        if (selectedAction === 'Attack') {
          coconutMultiAttack = true;
        }
        break;
      case 'Macadamias':
        if (selectedAction === 'Defend') moraleChange += 5;
        break;
      case 'Pecans':
        // Pecan Blitz — Attack costs no morale
        if (selectedAction === 'Attack') moraleChange = 0;
        break;
      case 'Chestnuts':
        // Roasting Rampage — Scheme burns enemy morale
        if (selectedAction === 'Scheme') {
          chestnutMoraleBurn = true;
        }
        break;
      default:
        break;
    }

    effects = `Morale ${moraleChange > 0 ? '+' : ''}${moraleChange}, Territories ${territoryChange > 0 ? '+' : ''}${territoryChange}`;

    // Update faction stats
    setFactionStats(prev => {
      const updated = { ...prev };
      if (updated[selectedFaction]) {
        updated[selectedFaction] = {
          ...updated[selectedFaction],
          morale: Math.max(0, (updated[selectedFaction].morale || 0) + moraleChange),
          territories: Math.max(0, (updated[selectedFaction].territories || 0) + territoryChange),
        };
      }
      // Attack also affects target
      if (selectedAction === 'Attack' && target !== selectedFaction && updated[target]) {
        let targetLoss = -Math.floor(Math.random() * 4) - 1;
        // Peanuts: Salt Shield — reduces incoming damage by 50%
        if (target === 'Peanuts') {
          targetLoss = Math.ceil(targetLoss / 2);
        }
        // Cashews: Swift Strike — Attack deals double morale loss
        if (selectedFaction === 'Cashews') {
          targetLoss *= 2;
        }
        updated[target] = {
          ...updated[target],
          morale: Math.max(0, (updated[target].morale || 0) + targetLoss),
        };
        // Coconuts: Tropical Slam — Attack hits two factions
        if (coconutMultiAttack) {
          const otherFactions = factions.filter(f => f !== target && f !== selectedFaction);
          const secondTarget = otherFactions[Math.floor(Math.random() * otherFactions.length)];
          if (secondTarget && updated[secondTarget]) {
            let secondLoss = -Math.floor(Math.random() * 4) - 1;
            // Peanuts: Salt Shield — reduces incoming damage by 50%
            if (secondTarget === 'Peanuts') {
              secondLoss = Math.ceil(secondLoss / 2);
            }
            updated[secondTarget] = {
              ...updated[secondTarget],
              morale: Math.max(0, (updated[secondTarget].morale || 0) + secondLoss),
            };
          }
        }
      }
      // Chestnuts: Roasting Rampage — Scheme burns enemy morale
      if (chestnutMoraleBurn && selectedAction === 'Scheme' && target !== selectedFaction && updated[target]) {
        const burnLoss = -Math.floor(Math.random() * 3) - 1;
        updated[target] = {
          ...updated[target],
          morale: Math.max(0, (updated[target].morale || 0) + burnLoss),
        };
      }
      // Hazelnuts: Nutty Fortune — steal territory from target
      if (stealTerritory && selectedAction === 'Scheme' && target !== selectedFaction && updated[target]) {
        if (updated[target].territories > 0) {
          updated[target] = {
            ...updated[target],
            territories: Math.max(0, (updated[target].territories || 0) - 1),
          };
        }
      }
      return updated;
    });

    // Add outcome to chronicle
    const newOutcome = {
      faction: selectedFaction,
      action: selectedAction,
      narrative: actionNarratives[selectedAction](selectedFaction, target),
      effects,
      timestamp: new Date().toLocaleTimeString(),
    };
    setOutcomes(prev => [newOutcome, ...prev].slice(0, 15));

    // Start cooldown
    setTimeLeft(COOLDOWN_SECONDS);
    setIsLoading(false);
  }, [selectedFaction, selectedAction, timeLeft]);

  return (
    <Layout>
      <Head>
        <title>Nut War Battlefield | BASED NUT</title>
        <meta name="description" content="Engage in the Nut War, led by Peanutoshi Nutkamoto. Choose your faction and action, and witness the chaotic outcomes." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 4 }, mb: 4 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#8B4513' }}>
            🥜 Nut War Battlefield 💣
          </Typography>
          <Typography variant="subtitle1" gutterBottom sx={{ mb: 3, color: 'rgba(93,64,55,0.7)' }}>
            The fate of the Nutverse is in your hands! Choose wisely, or don&apos;t... Peanutoshi loves chaos.
          </Typography>

          {isStateLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <Typography sx={{ ml: 2, color: 'rgba(93,64,55,0.7)' }}>Loading Game State...</Typography>
            </Box>
          ) : (
            <>
              {/* Faction Stats Display */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#A0522D' }}>
                  Faction Standings
                </Typography>
                <TableContainer component={Paper} elevation={2}>
                  <Table size="small" aria-label="faction stats table">
                    <TableHead sx={{ backgroundColor: 'rgba(205,127,50,0.15)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Faction</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Morale</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Territories</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Special Ability</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Last Action Effect</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {factions.map((factionName) => {
                        const lastActionByFaction = outcomes.find(o => o.faction === factionName);
                        const lastEffect = lastActionByFaction ? lastActionByFaction.effects : '-';
                        return (
                          <TableRow key={factionName} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'rgba(0,0,0,0.02)' } }}>
                            <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                              {factionName}
                            </TableCell>
                            <TableCell align="right">{factionStats[factionName]?.morale || 0}</TableCell>
                            <TableCell align="right">{factionStats[factionName]?.territories || 0}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{factionStats[factionName]?.specialAbility || 'None'}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={lastEffect}>
                              {lastEffect}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Map Visualization */}
              <Box
                sx={{
                  width: '100%',
                  maxWidth: '400px',
                  height: '200px',
                  margin: '0 auto 24px auto',
                  border: '3px solid #7D5A50',
                  borderRadius: 2,
                  backgroundColor: '#F4E3CF',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(9, 1fr)',
                  gridTemplateRows: 'repeat(9, 1fr)',
                  gap: '2px',
                  p: 1,
                  boxShadow: 2
                }}
                aria-label="Nut War Battlefield Map"
              >
                {map.map((row, rowIndex) => (
                  row.map((cell, colIndex) => (
                    <Box
                      key={`${rowIndex}-${colIndex}`}
                      sx={{
                        backgroundColor: getFactionColor(cell),
                        borderRadius: '2px',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: 1
                        }
                      }}
                      title={`Tile ${String.fromCharCode(65 + rowIndex)}${colIndex + 1}: ${cell !== 'neutral' ? `Controlled by ${cell}` : 'Neutral Territory'}`}
                    />
                  ))
                ))}
              </Box>

              {error && <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>{error}</Alert>}

              <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="faction-select-label">Select Faction</InputLabel>
                    <Select
                      labelId="faction-select-label"
                      id="faction-select"
                      value={selectedFaction}
                      label="Select Faction"
                      onChange={(e) => setSelectedFaction(e.target.value)}
                    >
                      <MenuItem value=""><em>-- Select Faction --</em></MenuItem>
                      {factions.map(faction => (
                        <MenuItem key={faction} value={faction}>{faction}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="action-select-label">Select Action</InputLabel>
                    <Select
                      labelId="action-select-label"
                      id="action-select"
                      value={selectedAction}
                      label="Select Action"
                      onChange={(e) => setSelectedAction(e.target.value)}
                    >
                      <MenuItem value=""><em>-- Select Action --</em></MenuItem>
                      {actions.map(action => (
                        <MenuItem key={action} value={action}>{action}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleSubmit}
                disabled={isLoading || isStateLoading || timeLeft > 0 || !selectedFaction || !selectedAction}
                sx={{
                  minWidth: { xs: '100%', sm: '200px' },
                  height: '56px',
                  mb: 2,
                  transition: 'background-color 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  background: "linear-gradient(45deg, #7D5A50, #A67C52)",
                }}
              >
                {isLoading ? 'Engaging...' : 'Engage in Battle!'}
              </Button>

              {timeLeft > 0 && !isStateLoading && (
                <Typography variant="h6" sx={{ color: '#A0522D', mb: 2, fontWeight: 'medium' }}>
                  Next action in: {timeLeft}s
                </Typography>
              )}
            </>
          )}
        </Paper>

        <Typography variant="h5" component="h2" sx={{ mt: 5, mb: 3, textAlign: 'center', fontWeight: 'bold', color: '#5D4037' }}>
          📜 War Chronicle 📜
        </Typography>
        {outcomes.length === 0 ? (
          <Typography sx={{ textAlign: 'center', fontStyle: 'italic', color: 'rgba(93,64,55,0.5)' }}>No actions recorded yet. Be the first to shape history!</Typography>
        ) : (
          <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
            <Table aria-label="war outcomes history" sx={{ minWidth: { xs: '100%', md: 650 } }}>
              <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.04)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'table-cell' } }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Faction</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Narrative</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Effects</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {outcomes.map((outcome, index) => (
                  <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'rgba(0,0,0,0.02)' }, '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{outcome.timestamp}</TableCell>
                    <TableCell>{outcome.faction}</TableCell>
                    <TableCell>{outcome.action}</TableCell>
                    <TableCell>{outcome.narrative}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{outcome.effects}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Layout>
  );
}
