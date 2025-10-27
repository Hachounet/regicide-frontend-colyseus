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
  reconnectionToken: null, // Token pour la reconnexion
  isReconnecting: false, // Flag pour indiquer une reconnexion en cours
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

      // Token de reconnexion
      setReconnectionToken: (token) => {
        set({ reconnectionToken: token });
      },

      clearReconnectionToken: () => {
        set({ reconnectionToken: null });
      },

      hasReconnectionToken: () => {
        return !!get().reconnectionToken && !!get().roomId;
      },

      setReconnecting: (isReconnecting) => {
        set({ isReconnecting });
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

      // Reset complet (utilisé lors d'un départ volontaire)
      resetAll: () => {
        set({
          ...initialState,
          // Garder uniquement le serverUrl
          serverUrl: get().serverUrl,
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
        reconnectionToken: state.reconnectionToken, // Persister le token
        roomId: state.roomId, // Persister le roomId pour la reconnexion
      }),
    }
  )
);
