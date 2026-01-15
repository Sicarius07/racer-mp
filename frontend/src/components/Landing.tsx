import { Box, Button, Container, Grid, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLobby } from '../context/LobbyContext';
import { useMemo, useState } from 'react';
import neonCity from '../assets/neon-city.svg';

const heroStyles = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  backgroundImage: `linear-gradient(180deg, rgba(3,7,18,0.85), rgba(17,38,61,0.95)), url(${neonCity})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: '#f1f5f9'
};

const Landing = () => {
  const navigate = useNavigate();
  const { cars, tracks, createLobby } = useLobby();
  const [hostName, setHostName] = useState('Most Wanted');
  const defaultCar = useMemo(() => cars[0]?.id, [cars]);
  const defaultTrack = useMemo(() => tracks[0]?.id, [tracks]);

  const handleLaunch = async () => {
    const lobbyId = await createLobby({
      host_id: crypto.randomUUID(),
      host_name: hostName || 'Most Wanted',
      car_id: defaultCar,
      track_id: defaultTrack,
      name: `${hostName || 'Anonymous'}'s Pursuit`,
      max_players: 6
    });
    navigate(`/lobby/${lobbyId}`);
  };

  return (
    <Box sx={heroStyles}>
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Racer: Most Pursued
            </Typography>
            <Typography variant="h6" gutterBottom>
              Build your blacklist. Dominate the streets. Bring the heat in a multiplayer pursuit inspired by NFS Most Wanted.
            </Typography>
            <TextField
              variant="filled"
              label="Alias"
              fullWidth
              value={hostName}
              onChange={(event) => setHostName(event.target.value)}
              sx={{ mt: 3, input: { color: '#f8fafc' } }}
            />
            <Box sx={{ display: 'flex', gap: 3, mt: 4 }}>
              <Button onClick={handleLaunch}>Launch Lobby</Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate('/garage')}
                sx={{ borderColor: 'secondary.main', color: 'secondary.main' }}
              >
                Enter Garage
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Landing;
