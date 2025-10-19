import { useCallback, useRef } from 'react';

interface UseWebsocketOptions {
  onMessage?: (payload: any) => void;
}

export const useWebsocket = ({ onMessage }: UseWebsocketOptions) => {
  const sockets = useRef<Map<string, WebSocket>>(new Map());

  const connect = useCallback(
    (url: string) => {
      if (sockets.current.has(url)) {
        return;
      }
      const socket = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}${url}`);
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (error) {
          console.error('Failed to parse websocket payload', error);
        }
      };
      socket.onclose = () => {
        sockets.current.delete(url);
      };
      sockets.current.set(url, socket);
    },
    [onMessage]
  );

  const disconnect = useCallback((url: string) => {
    const socket = sockets.current.get(url);
    if (socket) {
      socket.close();
      sockets.current.delete(url);
    }
  }, []);

  return { connect, disconnect };
};
