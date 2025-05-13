import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
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
import Header from '../components/Header';
import Footer from '../components/Footer';

const COOLDOWN_PERIOD_MS = 60 * 60 * 1000; // 1 hour in milliseconds
const LOCAL_STORAGE_KEY_LAST_ACTION = 'warmachineLastActionTime';
const LOCAL_STORAGE_KEY_OUTCOMES = 'warmachineOutcomes';
const LOCAL_STORAGE_KEY_FACTION_STATS = 'warmachineFactionStats'; // New key
const MAX_OUTCOMES_HISTORY = 15;

const factions = ["Peanuts", "Almonds", "Cashews", "Pistachios", "Hazelnuts"];
const actions = ["Attack", "Defend", "Rally", "Scheme", "Trade"];

// Initial Faction Stats
const initialFactionStats = factions.reduce((acc, faction) => {
  acc[faction] = {
    morale: 10,
    territoriesControlled: 0,
    specialAbilities: [],
    lastActionEffect: "" // To store the direct string effect from the last action
  };
  return acc;
}, {});

// Initial map setup - Simple map representation of the 9x9 grid
const initialMap = Array(9).fill().map(() => Array(9).fill('neutral'));

// Utility function to get color for a faction
const getFactionColor = (faction) => {
  switch (faction) {
    case 'Peanuts': return '#FDE8B1'; // Light peanut color
    case 'Almonds': return '#D4A373'; // Almond color
    case 'Cashews': return '#E7C8A0'; // Cashew color
    case 'Pistachios': return '#AEC3B0'; // Pistachio green
    case 'Hazelnuts': return '#B08968'; // Hazelnut brown
    default: return '#E2D5C3'; // Neutral territory
  }
};

export default function WarMachinePage() {
  const [outcomes, setOutcomes] = useState([]);
  const [factionStats, setFactionStats] = useState(initialFactionStats); // New state
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedFaction, setSelectedFaction] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [error, setError] = useState('');
  const [map, setMap] = useState(initialMap);

  // Check if localStorage is available
  const isLocalStorageAvailable = () => {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn("localStorage is not available:", e);
      return false;
    }
  };

  const localStorageAvailable = React.useMemo(() => isLocalStorageAvailable(), []);

  // Load outcomes from localStorage on mount
  useEffect(() => {
    if (localStorageAvailable) {
      try {
        const storedOutcomes = localStorage.getItem(LOCAL_STORAGE_KEY_OUTCOMES);
        if (storedOutcomes) {
          setOutcomes(JSON.parse(storedOutcomes));
        }
        const storedFactionStats = localStorage.getItem(LOCAL_STORAGE_KEY_FACTION_STATS); // Load faction stats
        if (storedFactionStats) {
          setFactionStats(JSON.parse(storedFactionStats));
        } else {
          setFactionStats(initialFactionStats); // Initialize if not found
        }
      } catch (e) {
        console.error("Failed to load data from localStorage", e);
        // Silently fail - we'll start with empty/initial states
        setOutcomes([]);
        setFactionStats(initialFactionStats);
      }
    }
  }, [localStorageAvailable]);

  // Save outcomes to localStorage when they change
  useEffect(() => {
    if (localStorageAvailable && outcomes.length > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_OUTCOMES, JSON.stringify(outcomes));
      } catch (e) {
        console.error("Failed to save outcomes to localStorage", e);
      }
    }
  }, [outcomes, localStorageAvailable]);

  // Save factionStats to localStorage when they change
  useEffect(() => {
    if (localStorageAvailable) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_FACTION_STATS, JSON.stringify(factionStats));
      } catch (e) {
        console.error("Failed to save faction stats to localStorage", e);
      }
    }
  }, [factionStats, localStorageAvailable]);


  // Simulate map updates based on outcomes AND update territoriesControlled in factionStats
  useEffect(() => {
    const newMap = initialMap.map(row => [...row]); // Start with a fresh copy of initialMap
    const territoryCounts = factions.reduce((acc, f) => ({ ...acc, [f]: 0 }), {});

    // Simplified: last 5 outcomes influence the map
    // More sophisticated logic would be needed for persistent territory control
    outcomes.slice(0, 5).forEach((outcome) => {
      if (outcome.faction && factions.includes(outcome.faction)) {
        const r = Math.abs(outcome.faction.charCodeAt(0) + (outcome.action?.charCodeAt(0) || 0)) % 9;
        const c = Math.abs(outcome.faction.charCodeAt(0) - (outcome.action?.charCodeAt(0) || 0)) % 9;
        if (newMap[r]) {
          newMap[r][c] = outcome.faction;
        }
      }
    });
    setMap(newMap);

    // Recalculate territory counts from the newMap
    for (let r = 0; r < newMap.length; r++) {
      for (let c = 0; c < newMap[r].length; c++) {
        const controllingFaction = newMap[r][c];
        if (factions.includes(controllingFaction)) {
          territoryCounts[controllingFaction]++;
        }
      }
    }

    setFactionStats(prevStats => {
      let statsChanged = false;
      const updatedStats = { ...prevStats };
      factions.forEach(f => {
        if (updatedStats[f] && updatedStats[f].territoriesControlled !== territoryCounts[f]) {
          updatedStats[f] = { ...updatedStats[f], territoriesControlled: territoryCounts[f] };
          statsChanged = true;
        }
      });
      return statsChanged ? updatedStats : prevStats;
    });

  }, [outcomes, factions]); // Assuming 'factions' is stable, otherwise add as dependency.

  const updateCooldown = useCallback(() => {
    if (localStorageAvailable) {
      try {
        const lastActionTime = localStorage.getItem(LOCAL_STORAGE_KEY_LAST_ACTION);
        if (lastActionTime) {
          const timePassed = Date.now() - parseInt(lastActionTime, 10);
          const newTimeLeft = Math.max(0, COOLDOWN_PERIOD_MS - timePassed);
          setTimeLeft(newTimeLeft);
        } else {
          setTimeLeft(0);
        }
      } catch (e) {
        console.warn("Error accessing localStorage in updateCooldown:", e);
        setTimeLeft(0);  // Ensure button is enabled if localStorage fails
      }
    } else {
      // If localStorage isn't available, don't enforce cooldown
      setTimeLeft(0);
    }
  }, [localStorageAvailable]);

  useEffect(() => {
    updateCooldown();
    const intervalId = setInterval(updateCooldown, 1000); // Update every second
    return () => clearInterval(intervalId);
  }, [updateCooldown]);

  const parseAndUpdateFactionStats = (currentStats, effectsString, actingFaction) => {
    let newStats = JSON.parse(JSON.stringify(currentStats)); // Deep copy

    // Reset lastActionEffect for all factions
    factions.forEach(f => {
        if(newStats[f]) newStats[f].lastActionEffect = "";
    });
    
    // Store the raw effect string for the acting faction (or all involved if parsed)
    if (newStats[actingFaction]) {
        newStats[actingFaction].lastActionEffect = effectsString;
    }


    // Morale changes: "FactionName Morale +/-Value"
    const moraleRegex = new RegExp(`(${factions.join('|')})\\s*Morale\\s*([+-]\\d+)`, 'gi');
    let match;
    while ((match = moraleRegex.exec(effectsString)) !== null) {
      const factionName = match[1];
      const change = parseInt(match[2], 10);
      if (newStats[factionName]) {
        newStats[factionName].morale = (newStats[factionName].morale || 0) + change;
      }
    }

    // Unlock upgrades: "Unlocks 'Upgrade Name'" (applies to acting faction for simplicity)
    const unlockRegex = /Unlocks\s*'([^']+)'/i;
    const unlockMatch = effectsString.match(unlockRegex);
    if (unlockMatch && unlockMatch[1] && newStats[actingFaction]) {
      if (!newStats[actingFaction].specialAbilities.includes(unlockMatch[1])) {
        newStats[actingFaction].specialAbilities.push(unlockMatch[1]);
      }
    }
    
    // Generic effect capture for other factions mentioned
    // Example: "Almond Pantry -2 strategic crumbs!"
    // This is tricky. For now, if another faction is mentioned, we'll just assign the whole effect string to them too.
    factions.forEach(f => {
        if (f !== actingFaction && effectsString.toLowerCase().includes(f.toLowerCase())) {
            if (newStats[f]) {
                 // Append if there's already an effect from morale/unlock for this faction from the same action
                newStats[f].lastActionEffect = newStats[f].lastActionEffect 
                    ? newStats[f].lastActionEffect + "; " + effectsString 
                    : effectsString;
            }
        }
    });


    // Add more parsing rules here for other effects like resources, territory changes etc.
    // For "Almond Pantry -2 strategic crumbs!", we could look for "Faction loses X item" or "Faction gains Y item"
    // This requires more complex regex and understanding of game-specific terms.

    return newStats;
  };


  const handleSubmit = async () => {
    if (timeLeft > 0 || !selectedFaction || !selectedAction) {
      if (timeLeft > 0) setError(`Action on cooldown. Please wait ${Math.ceil(timeLeft / 1000 / 60)} minutes.`);
      if (!selectedFaction) setError("Please select a faction.");
      if (!selectedAction) setError("Please select an action.");
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/warmachineAction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faction: selectedFaction,
          action: selectedAction,
          history: outcomes.slice(0, 5).map(o => `Faction: ${o.faction}, Action: ${o.action}, Narrative: ${o.narrative}, Effects: ${o.effects}`) // Send last 5 outcomes as history strings
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to perform action due to a server error.');
      }

      const newOutcome = {
        timestamp: new Date().toLocaleString(),
        faction: selectedFaction,
        action: selectedAction,
        narrative: data.narrative || "Peanutoshi has gone silent...",
        effects: data.effects || "No visible effects",
        imageUrl: data.imageUrl, // Optional: image from AI
      };

      setOutcomes(prev => [newOutcome, ...prev.slice(0, MAX_OUTCOMES_HISTORY - 1)]);
      setFactionStats(prevStats => parseAndUpdateFactionStats(prevStats, newOutcome.effects, newOutcome.faction)); // Update faction stats

      if (localStorageAvailable) {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY_LAST_ACTION, Date.now().toString());
        } catch (e) {
          console.warn("Failed to save action timestamp to localStorage:", e);
        }
      }
      
      setTimeLeft(COOLDOWN_PERIOD_MS); // Reset cooldown even if localStorage fails
      // Optionally clear selections after successful submission
      // setSelectedFaction('');
      // setSelectedAction('');

    } catch (err) {
      console.error('Action failed:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Nut War Battlefield | BASED NUT</title>
        <meta name="description" content="Engage in the Nut War, led by Peanutoshi Nutkamoto. Choose your faction and action, and witness the chaotic outcomes." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Header />
      <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 4 }, mb: 4 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            🥜 Nut War Battlefield 💣
          </Typography>
          <Typography variant="subtitle1" gutterBottom sx={{ mb: 3, color: 'text.secondary' }}>
            The fate of the Nutverse is in your hands! Choose wisely, or don&apos;t... Peanutoshi loves chaos.
          </Typography>

          {/* Faction Stats Display */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
              Faction Standings
            </Typography>
            <TableContainer component={Paper} elevation={2}>
              <Table size="small" aria-label="faction stats table">
                <TableHead sx={{ backgroundColor: 'primary.light' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Faction</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Morale</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Territories</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Special Abilities</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Last Action Effect</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {factions.map((factionName) => (
                    <TableRow key={factionName} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                        {factionName}
                      </TableCell>
                      <TableCell align="right">{factionStats[factionName]?.morale || 0}</TableCell>
                      <TableCell align="right">{factionStats[factionName]?.territoriesControlled || 0}</TableCell>
                      <TableCell>{factionStats[factionName]?.specialAbilities?.join(', ') || 'None'}</TableCell>
                      <TableCell sx={{fontSize: '0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={factionStats[factionName]?.lastActionEffect || ''}>
                        {factionStats[factionName]?.lastActionEffect || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
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
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
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
            disabled={isLoading || timeLeft > 0 || !selectedFaction || !selectedAction}
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
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Engage in Battle!'}
          </Button>

          {timeLeft > 0 && (
            <Typography variant="h6" sx={{ color: 'secondary.main', mb: 2, fontWeight: 'medium' }}>
              Next action in: {Math.floor(timeLeft / 1000 / 60)}m {Math.ceil((timeLeft / 1000) % 60)}s
            </Typography>
          )}
        </Paper>

        <Typography variant="h5" component="h2" sx={{ mt: 5, mb: 3, textAlign: 'center', fontWeight: 'bold', color: 'text.primary' }}>
          📜 War Chronicle 📜
        </Typography>
        {outcomes.length === 0 && !isLoading ? (
          <Typography sx={{textAlign: 'center', fontStyle: 'italic', color: 'text.secondary'}}>No actions recorded yet. Be the first to shape history!</Typography>
        ) : (
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2}}>
          <Table aria-label="war outcomes history" sx={{ minWidth: { xs: '100%', md: 650 } }}>
            <TableHead sx={{ backgroundColor: 'grey.200' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'table-cell'} }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Faction</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Narrative</TableCell>
                <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell'} }}>Effects</TableCell>
                {outcomes.some(o => o.imageUrl) && <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell'} }}>Scene</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {outcomes.map((outcome, index) => (
                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' }, '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell'} }}>{outcome.timestamp}</TableCell>
                  <TableCell>{outcome.faction}</TableCell>
                  <TableCell>{outcome.action}</TableCell>
                  <TableCell>{outcome.narrative}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell'} }}>{outcome.effects}</TableCell>
                  {outcomes.some(o => o.imageUrl) && (
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell'} }}>
                      {outcome.imageUrl ? <img src={outcome.imageUrl} alt="War scene" style={{maxWidth: '80px', maxHeight: '80px', borderRadius: '4px', objectFit: 'cover'}} /> : '-'}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        )}
      </Container>
      <Footer />
    </>
  );
}
