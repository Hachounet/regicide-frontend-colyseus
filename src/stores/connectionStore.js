import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialState = {
  isConnected: false,
  isConnecting: false,
  error: null,
  roomId: null,
  serverUrl: 'wss://regicide-backend-colyseus.onrender.com',
  playerPseudo: '',
  lastRoomId: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 3,
};

export const useConnectionStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions de connexion
      setConnecting: (connecting) => {
        set({ isConnecting: connecting });
        if (connecting) {
          set({ error: null });
        }
      },

      setConnected: (connected) => {
        set({ 
          isConnected: connected,
          isConnecting: false,
          error: connected ? null : get().error 
        });
        
        if (connected) {
          get().resetReconnectAttempts();
        }
      },

      setError: (error) => {
        set({ 
          error,
          isConnecting: false,
          isConnected: false 
        });
      },

      setRoomId: (roomId) => {
        set({ roomId });
        if (roomId) {
          set({ lastRoomId: roomId });
        }
      },

      // Configuration
      setServerUrl: (url) => {
        set({ serverUrl: url });
      },

      setPlayerPseudo: (pseudo) => {
        set({ playerPseudo: pseudo });
      },

      // Reconnexion
      incrementReconnectAttempts: () => {
        set({ reconnectAttempts: get().reconnectAttempts + 1 });
      },

      resetReconnectAttempts: () => {
        set({ reconnectAttempts: 0 });
      },

      canReconnect: () => {
        return get().reconnectAttempts < get().maxReconnectAttempts;
      },

      // Reset
      reset: () => {
        set({
          ...initialState,
          // Garder la configuration utilisateur
          serverUrl: get().serverUrl,
          playerPseudo: get().playerPseudo,
        });
      },
    }),
    {
      name: 'regicide-connection',
      // Persister seulement certaines valeurs
      partialize: (state) => ({
        serverUrl: state.serverUrl,
        playerPseudo: state.playerPseudo,
        lastRoomId: state.lastRoomId,
      }),
    }
  )
);
