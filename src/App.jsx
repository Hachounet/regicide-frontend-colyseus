import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGameStore } from './stores/gameStore';
import { useConnectionStore } from './stores/connectionStore';
import { useUIStore } from './stores/uiStore';
import { useGameConnection } from './hooks/useGameConnection';

// Composants (à créer)
import ConnectionScreen from './components/ConnectionScreen';
import LobbyScreen from './components/LobbyScreen';
import DraftScreen from './components/DraftScreen';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';
import LoadingScreen from './components/LoadingScreen';
import NotificationToast from './components/ui/NotificationToast';

// Client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { gameState } = useGameStore();
  const { isConnected, isConnecting } = useConnectionStore();
  const { notifications, isLoading } = useUIStore();
  const { error } = useGameConnection();

  // Déterminer quel écran afficher
  const getCurrentScreen = () => {
    if (error && !isConnected) {
      return 'connection';
    }

    if (isConnecting || isLoading) {
      return 'loading';
    }

    if (!isConnected) {
      return 'connection';
    }

    if (!gameState) {
      return 'loading';
    }

    switch (gameState.phase) {
      case 'waiting':
        return 'lobby';
      case 'drafting':
        return 'draft';
      case 'playing':
        return 'game';
      case 'finished':
        return 'results';
      default:
        return 'connection';
    }
  };

  const currentScreen = getCurrentScreen();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-game-bg to-pyramid-bg text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              Regicide
            </h1>
            <p className="text-gray-300 mt-2">
              Jeu de cartes stratégique multijoueur
            </p>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {currentScreen === 'connection' && <ConnectionScreen />}
            {currentScreen === 'loading' && <LoadingScreen />}
            {currentScreen === 'lobby' && <LobbyScreen />}
            {currentScreen === 'draft' && <DraftScreen />}
            {currentScreen === 'game' && <GameScreen />}
            {currentScreen === 'results' && <ResultsScreen />}
          </main>

          {/* Footer */}
          <footer className="text-center mt-8 text-gray-400 text-sm">
            <p>
              Développé avec React, Vite et Colyseus
            </p>
          </footer>
        </div>

        {/* Notifications */}
        <NotificationToast notifications={notifications} />
      </div>
    </QueryClientProvider>
  );
}

export default App;
