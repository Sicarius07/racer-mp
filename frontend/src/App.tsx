import { CssBaseline, ThemeProvider } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import { RacerThemeProvider, useRacerTheme } from './context/ThemeContext';
import { LobbyProvider } from './context/LobbyContext';
import Landing from './components/Landing';
import Garage from './components/Garage';
import Lobby from './components/Lobby';
import RaceHud from './components/RaceHud';

const AppShell = () => {
  const { theme } = useRacerTheme();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/garage" element={<Garage />} />
        <Route path="/lobby/:lobbyId" element={<Lobby />} />
        <Route path="/race/:lobbyId" element={<RaceHud />} />
      </Routes>
    </ThemeProvider>
  );
};

const App = () => (
  <RacerThemeProvider>
    <LobbyProvider>
      <AppShell />
    </LobbyProvider>
  </RacerThemeProvider>
);

export default App;
