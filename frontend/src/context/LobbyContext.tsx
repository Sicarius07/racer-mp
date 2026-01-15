import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebsocket } from '../hooks/useWebsocket';

export interface CarInfo {
  id: string;
  name: string;
  car_class: string;
  acceleration: number;
  top_speed: number;
  handling: number;
  nitro: number;
}

export interface LobbyPlayer {
  playerId: string;
  displayName: string;
  carId: string;
  position: number;
  speed: number;
  nitro: number;
  inRace: boolean;
}

interface LobbySnapshot {
  tick: number;
  countdown: number | null;
  raceActive: boolean;
  players: LobbyPlayer[];
}

interface LobbyContextState {
  cars: CarInfo[];
  tracks: any[];
  lobbyId?: string;
  playerId?: string;
  snapshot?: LobbySnapshot;
  joinLobby: (lobbyId: string, playerId: string, displayName: string, carId: string) => Promise<void>;
  createLobby: (payload: Record<string, unknown>) => Promise<string>;
  setReady: (lobbyId: string, playerId: string, ready: boolean) => Promise<void>;
  setSnapshot: React.Dispatch<React.SetStateAction<LobbySnapshot | undefined>>;
}

const LobbyContext = createContext<LobbyContextState | undefined>(undefined);

export const LobbyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cars, setCars] = useState<CarInfo[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [snapshot, setSnapshot] = useState<LobbySnapshot>();
  const [lobbyId, setLobbyId] = useState<string>();
  const [playerId, setPlayerId] = useState<string>();
  const navigate = useNavigate();

  const { connect, disconnect } = useWebsocket({
    onMessage: (data) => {
      if (data.type === 'snapshot') {
        setSnapshot(data.payload);
      }
    }
  });

  useEffect(() => {
    const fetchCatalog = async () => {
      const [carRes, trackRes] = await Promise.all([
        fetch('/api/cars'),
        fetch('/api/tracks')
      ]);
      const [carData, trackData] = await Promise.all([carRes.json(), trackRes.json()]);
      setCars(carData);
      setTracks(trackData);
    };
    fetchCatalog();
  }, []);

  const joinLobby = async (targetLobbyId: string, targetPlayerId: string, displayName: string, carId: string) => {
    await fetch(`/api/lobbies/${targetLobbyId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: targetPlayerId, display_name: displayName, car_id: carId })
    });
    setLobbyId(targetLobbyId);
    setPlayerId(targetPlayerId);
    connect(`/ws/lobby?lobbyId=${targetLobbyId}&playerId=${targetPlayerId}`);
    navigate(`/lobby/${targetLobbyId}`);
  };

  const createLobby = async (payload: Record<string, unknown>) => {
    const response = await fetch('/api/lobbies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const lobby = await response.json();
    setLobbyId(lobby.lobby_id);
    setPlayerId(lobby.host_id);
    connect(`/ws/lobby?lobbyId=${lobby.lobby_id}&playerId=${lobby.host_id}`);
    navigate(`/lobby/${lobby.lobby_id}`);
    return lobby.lobby_id;
  };

  const setReady = async (currentLobbyId: string, currentPlayerId: string, ready: boolean) => {
    await fetch(`/api/lobbies/${currentLobbyId}/ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: currentPlayerId, ready })
    });
  };

  const value = useMemo(
    () => ({ cars, tracks, lobbyId, playerId, joinLobby, createLobby, setReady, snapshot, setSnapshot }),
    [cars, tracks, lobbyId, playerId, snapshot]
  );

  useEffect(() => () => {
    if (lobbyId && playerId) {
      disconnect(`/ws/lobby?lobbyId=${lobbyId}&playerId=${playerId}`);
    }
  }, [disconnect, lobbyId, playerId]);

  return <LobbyContext.Provider value={value}>{children}</LobbyContext.Provider>;
};

export const useLobby = (): LobbyContextState => {
  const context = useContext(LobbyContext);
  if (!context) {
    throw new Error('useLobby must be used within LobbyProvider');
  }
  return context;
};
