import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export const useGameStore = create(
  subscribeWithSelector((set, get) => ({
    // État initial
    gameState: null,
    mySessionId: null,

    // Actions
    setGameState: (state) => {
      set({ gameState: state });
    },

    setMySessionId: (sessionId) => {
      set({ mySessionId: sessionId });
    },

    reset: () => {
      set({
        gameState: null,
        mySessionId: null,
      });
    },

    // Getters
    getMyPlayer: () => {
      const { gameState, mySessionId } = get();
      if (!gameState || !mySessionId) return null;
      return gameState.players.find(p => p.sessionId === mySessionId) || null;
    },

    getCurrentPlayer: () => {
      const { gameState } = get();
      if (!gameState) return null;
      return gameState.players[gameState.currentPlayerIndex] || null;
    },

    isMyTurn: () => {
      const { gameState, mySessionId } = get();
      if (!gameState || !mySessionId) return false;
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      return currentPlayer?.sessionId === mySessionId;
    },

    getPlayerBySessionId: (sessionId) => {
      const { gameState } = get();
      if (!gameState) return null;
      return gameState.players.find(p => p.sessionId === sessionId) || null;
    },
  }))
);
