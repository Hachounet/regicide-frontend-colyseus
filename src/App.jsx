import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGameStore } from './stores/gameStore';
import { useConnectionStore } from './stores/connectionStore';
import { useUIStore } from './stores/uiStore';
import { useGameConnection } from './hooks/useGameConnection';
import pokerTableBg from './assets/poker_table.jpg';

// Composants (à créer)
import ConnectionScreen from './components/ConnectionScreen';
import LobbyScreen from './components/LobbyScreen';
import DraftScreen from './components/DraftScreen';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';
import LoadingScreen from './components/LoadingScreen';

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
  const { isLoading } = useUIStore();
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
      case 'draft':
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
  const isFullScreenMode = currentScreen === 'draft' || currentScreen === 'game';

  return (
    <QueryClientProvider client={queryClient}>
      <div 
        className="fixed inset-0 w-full h-full overflow-hidden"
        style={{
          backgroundImage: `url(${pokerTableBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay pour assombrir légèrement l'image et améliorer la lisibilité */}
        <div className="absolute inset-0 bg-black bg-opacity-40 z-0"></div>
        
        <div className="relative z-10 w-full h-full overflow-y-auto text-white">
        {isFullScreenMode ? (
          // Mode plein écran pour DraftScreen et GameScreen
          <div className="w-full h-full">
            {currentScreen === 'draft' && <DraftScreen />}
            {currentScreen === 'game' && <GameScreen />}
          </div>
        ) : (
          // Mode normal avec header et footer pour les autres écrans
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 min-h-full flex flex-col">
            {/* Header */}
            <header className="text-center mb-4 sm:mb-6 lg:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                Regicide
              </h1>
              <p className="text-gray-300 mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base">
                Jeu de cartes stratégique multijoueur
              </p>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center">
              {currentScreen === 'connection' && <ConnectionScreen />}
              {currentScreen === 'loading' && <LoadingScreen />}
              {currentScreen === 'lobby' && <LobbyScreen />}
              {currentScreen === 'results' && <ResultsScreen />}
            </main>

            {/* Footer */}
            <footer className="text-center mt-4 sm:mt-6 lg:mt-8 text-gray-400 text-xs sm:text-sm">
              <p>
                Développé avec React, Vite et Colyseus
              </p>
            </footer>
          </div>
        )}

        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
