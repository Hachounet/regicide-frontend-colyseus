import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useConnectionStore } from '../stores/connectionStore.js';
import { useGameConnection } from '../hooks/useGameConnection.js';
import Button from './ui/Button.jsx';
import Tutoriel from './Tutoriel.jsx';

const ConnectionScreen = () => {
  const [pseudo, setPseudo] = useState('');
  const [playerCount, setPlayerCount] = useState(4);
  const [isPrivate, setIsPrivate] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  
  const { error, playerPseudo, setPlayerPseudo } = useConnectionStore();
  const { connect, isConnecting } = useGameConnection();

  const handleConnect = async () => {
    if (!pseudo.trim()) return;
    
    setPlayerPseudo(pseudo);
    
    const options = {
      playerCount,
      isPrivate,
      roomCode: isPrivate ? roomCode : undefined,
    };
    
    await connect(pseudo, options);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="bg-white/10 backdrop-blur-card rounded-xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Rejoindre une partie</h2>
          <p className="text-gray-300">
            Entrez vos informations pour commencer
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6"
          >
            <p className="text-red-200 text-sm">{error}</p>
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Pseudo */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Pseudo
            </label>
            <input
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder={playerPseudo || "Votre nom..."}
              className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         text-white placeholder-gray-300"
              maxLength={20}
            />
          </div>

          {/* Nombre de joueurs */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre de joueurs
            </label>
            <div className="flex space-x-2">
              {[3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => setPlayerCount(count)}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    playerCount === count
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/20 text-gray-300 hover:bg-white/30'
                  }`}
                >
                  {count} joueurs
                </button>
              ))}
            </div>
          </div>

          {/* Room privée */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded focus:ring-blue-500"
              />
              <span className="text-sm">Partie privée</span>
            </label>
          </div>

          {/* Code de room (si privée) */}
          {isPrivate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <label className="block text-sm font-medium mb-2">
                Code de la room
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Entrez le code..."
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 
                           text-white placeholder-gray-300"
              />
            </motion.div>
          )}

          {/* Boutons */}
          <div className="space-y-3">
            <Button
              onClick={handleConnect}
              disabled={!pseudo.trim() }
              loading={isConnecting}
              variant="primary"
              className="w-full"
            >
              {isPrivate ? 'Rejoindre une room spécifique' : 'Créer/Rejoindre une partie aléatoire'}
            </Button>

            <Button
              onClick={() => setShowTutorial(true)}
              disabled={isConnecting}
              variant="warning"
              className="w-full"
            >
              📚 Comment jouer ?
            </Button>
          </div>
        </div>

      
      </div>

      {/* Tutoriel Modal */}
      {showTutorial && (
        <Tutoriel onClose={() => setShowTutorial(false)} />
      )}
    </motion.div>
  );
};

export default ConnectionScreen;
