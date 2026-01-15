import { createContext, useContext, useMemo, useState } from 'react';
import { createTheme, Theme } from '@mui/material/styles';

interface ThemeContextState {
  theme: Theme;
  toggleNightMode: () => void;
  nightMode: boolean;
}

const ThemeContext = createContext<ThemeContextState | undefined>(undefined);

const createRacerTheme = (nightMode: boolean) =>
  createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: nightMode ? '#4dd0e1' : '#ff9100'
      },
      secondary: {
        main: nightMode ? '#ff6e40' : '#4db6ac'
      },
      background: {
        default: nightMode ? '#030712' : '#0c1b2a',
        paper: nightMode ? '#0f172a' : '#11263d'
      }
    },
    typography: {
      fontFamily: 'Orbitron, sans-serif'
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            textTransform: 'uppercase',
            letterSpacing: 2,
            padding: '0.75rem 2.25rem',
            background: 'linear-gradient(135deg, rgba(255,145,0,0.9), rgba(77,208,225,0.9))',
            boxShadow: '0 0 12px rgba(255,145,0,0.4)'
          }
        }
      }
    }
  });

export const RacerThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nightMode, setNightMode] = useState(true);
  const theme = useMemo(() => createRacerTheme(nightMode), [nightMode]);
  const toggleNightMode = () => setNightMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ theme, toggleNightMode, nightMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useRacerTheme = (): ThemeContextState => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useRacerTheme must be used within RacerThemeProvider');
  }
  return context;
};
