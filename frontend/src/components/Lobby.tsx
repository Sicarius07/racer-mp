import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { useLobby } from '../context/LobbyContext';

const Lobby = () => {
  const { lobbyId } = useParams();
  const navigate = useNavigate();
  const { snapshot, setReady, lobbyId: contextLobbyId, playerId } = useLobby();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!contextLobbyId && lobbyId) {
      navigate('/');
    }
  }, [contextLobbyId, lobbyId, navigate]);

  useEffect(() => {
    if (snapshot?.raceActive) {
      navigate(`/race/${lobbyId}`);
    }
  }, [snapshot?.raceActive, navigate, lobbyId]);

  const countdownValue = snapshot?.countdown ?? null;
  const sortedPlayers = useMemo(() => snapshot?.players.sort((a, b) => b.position - a.position) ?? [], [snapshot?.players]);

  const handleReady = async () => {
    if (!contextLobbyId || !playerId) return;
    await setReady(contextLobbyId, playerId, !isReady);
    setIsReady((prev) => !prev);
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 8, background: 'linear-gradient(160deg, rgba(3,7,18,0.95), rgba(17,38,61,0.92))' }}>
      <Container maxWidth="md">
        <Card sx={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(77,208,225,0.2)' }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Lobby / Heat Level {sortedPlayers.length}
            </Typography>
            {countdownValue !== null && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Countdown to race
                </Typography>
                <LinearProgress value={Math.max(0, ((5 - countdownValue) / 5) * 100)} variant="determinate" />
              </Box>
            )}
            <List>
              {sortedPlayers.map((player) => (
                <ListItem key={player.playerId} sx={{ borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <DirectionsCarIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${player.displayName} ${playerId === player.playerId ? '(You)' : ''}`}
                    secondary={`Car: ${player.carId} | Progress: ${(player.position * 100).toFixed(0)}%`}
                  />
                </ListItem>
              ))}
            </List>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item>
                <Button onClick={handleReady} color={isReady ? 'secondary' : 'primary'} variant="contained">
                  {isReady ? 'Cancel Ready' : 'Ready Up'}
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" onClick={() => navigate('/')}>Leave Lobby</Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Lobby;
