import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useConnectionStore } from '../stores/connectionStore.js';
import { useGameConnection } from '../hooks/useGameConnection.js';
import Button from './ui/Button.jsx';
import Tutoriel from './Tutoriel.jsx';



const ConnectionScreen = () => {
  // Initialiser le pseudo à vide, puis charger depuis localStorage si dispo
  const [pseudo, setPseudo] = useState('');

  useEffect(() => {
    const savedPseudo = localStorage.getItem('regicide_pseudo');
    if (savedPseudo) {
      setPseudo(savedPseudo);
    }
  }, []);
  const [playerCount, setPlayerCount] = useState(4);
  const [roomMode, setRoomMode] = useState('public'); // 'public', 'create', 'join'
  const [roomCode, setRoomCode] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  
  const { error, setPlayerPseudo } = useConnectionStore();
  const { connect, isConnecting } = useGameConnection();

  const handleConnect = async () => {
    if (!pseudo.trim()) return;
    // Enregistrer le pseudo en localStorage pour les prochaines fois
    localStorage.setItem('regicide_pseudo', pseudo);
    setPlayerPseudo(pseudo);
    
    const options = {
      playerCount,
      mode: roomMode, // 'public', 'create', 'join'
      roomCode: roomMode !== 'public' ? roomCode : undefined,
    };
    await connect(pseudo, options);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xs sm:max-w-md mx-auto px-3 sm:px-0"
    >
      <div className="bg-white/10 backdrop-blur-card rounded-lg sm:rounded-xl p-5 sm:p-8 shadow-xl">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Rejoindre une partie</h2>
          <p className="text-gray-300 text-xs sm:text-sm">
            Entrez vos informations pour commencer
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/20 border border-red-500 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6"
          >
            <p className="text-red-200 text-xs sm:text-sm">{error}</p>
          </motion.div>
        )}

        <div className="space-y-4 sm:space-y-6">
          {/* Pseudo */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
              Pseudo
            </label>
            <input
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder="Votre nom..."
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/20 border border-white/30 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         text-white placeholder-gray-300 text-sm sm:text-base"
              maxLength={20}
            />
          </div>

          {/* Nombre de joueurs */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
              Nombre de joueurs
            </label>
            <div className="flex gap-2">
              {[3, 4].map((count) => (
                <button
                  key={count}
                  onClick={count === 3 ? undefined : () => setPlayerCount(count)}
                  disabled={count === 3}
                  className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base ${
                    count === 3
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
                      : playerCount === count
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/20 text-gray-300 hover:bg-white/30'
                  }`}
                >
                  {count} joueurs
                </button>
              ))}
            </div>
          </div>

          {/* Mode de room */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
              Type de partie
            </label>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setRoomMode('public')}
                className={`py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base text-left ${
                  roomMode === 'public'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/20 text-gray-300 hover:bg-white/30'
                }`}
              >
                🌐 Partie publique (rejoindre ou créer)
              </button>
              <button
                onClick={() => {
                  setRoomMode('create');
                  // Générer un code aléatoire de 6 caractères
                  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
                  setRoomCode(code);
                }}
                className={`py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base text-left ${
                  roomMode === 'create'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/20 text-gray-300 hover:bg-white/30'
                }`}
              >
                🔐 Créer une partie privée
              </button>
              <button
                onClick={() => {
                  setRoomMode('join');
                  setRoomCode('');
                }}
                className={`py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base text-left ${
                  roomMode === 'join'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/20 text-gray-300 hover:bg-white/30'
                }`}
              >
                🔑 Rejoindre une partie privée
              </button>
            </div>
          </div>

          {/* Code de room (si mode privé) */}
          {roomMode !== 'public' && (
            <div className="animate-slideDown">
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                {roomMode === 'create' ? 'Code de votre partie' : 'Code de la partie'}
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder={roomMode === 'create' ? 'Code généré automatiquement' : 'Entrez le code...'}
                readOnly={roomMode === 'create'}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/20 border border-white/30 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 
                           text-white placeholder-gray-300 text-sm sm:text-base
                           ${roomMode === 'create' ? 'font-bold text-center text-lg tracking-wider' : ''}`}
                maxLength={10}
              />
              {roomMode === 'create' && (
                <p className="text-xs text-gray-300 mt-1">
                  Partagez ce code avec vos amis pour qu'ils puissent rejoindre votre partie
                </p>
              )}
            </div>
          )}

          {/* Boutons */}
          <div className="space-y-2 sm:space-y-3">
            <Button
              onClick={handleConnect}
              disabled={!/[a-zA-Z0-9]/.test(pseudo) || (roomMode !== 'public' && !roomCode.trim())}
              loading={isConnecting}
              variant="primary"
              className="w-full text-sm sm:text-base py-2.5 sm:py-3"
            >
              {roomMode === 'public' && 'Créer/Rejoindre une partie aléatoire'}
              {roomMode === 'create' && 'Créer la partie privée'}
              {roomMode === 'join' && 'Rejoindre la partie privée'}
            </Button>

            <Button
              onClick={() => setShowTutorial(true)}
              disabled={isConnecting}
              variant="warning"
              className="w-full text-sm sm:text-base py-2.5 sm:py-3"
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
