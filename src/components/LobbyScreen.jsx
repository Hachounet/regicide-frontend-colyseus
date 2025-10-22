import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore.js';
import { useGameConnection } from '../hooks/useGameConnection.js';
import gameService from '../services/gameService.js';
import Button from './ui/Button.jsx';

const LobbyScreen = () => {
  const { gameState, getMyPlayer } = useGameStore();
  const { disconnect } = useGameConnection();

  // Récupérer les informations de la room actuelle
  const room = gameService.getRoom();
  const mySessionId = room?.sessionId;
  
  // Debug: Affichons ce que nous recevons
  console.log('🔍 Debug Lobby:', {
    gameState,
    mySessionId,
    room: room ? {
      roomId: room.roomId,
      sessionId: room.sessionId,
      state: room.state
    } : null
  });
  
  // Récupérer les joueurs - gestion spéciale pour ArraySchema de Colyseus
  let players = [];
  
  if (gameState?.players) {
    // Si c'est un ArraySchema de Colyseus, on doit l'itérer différemment
    if (gameState.players.length !== undefined) {
      // Convertir ArraySchema en array normal
      for (let i = 0; i < gameState.players.length; i++) {
        const player = gameState.players[i];
        if (player && typeof player === 'object') {
          players.push(player);
        }
      }
    }
    // Fallback pour les objets normaux
    else if (typeof gameState.players === 'object' && !Array.isArray(gameState.players)) {
      players = Object.values(gameState.players);
    }
    // Si c'est déjà un array normal
    else if (Array.isArray(gameState.players)) {
      players = gameState.players;
    }
  }
  
  console.log('👥 Players trouvés:', players);
  console.log('� Players details:', players.map(p => ({
    sessionId: p?.sessionId,
    pseudo: p?.pseudo,
    isReady: p?.isReady
  })));
  
  const myPlayer = getMyPlayer();
  
  // Si aucun joueur n'est trouvé, créons au moins notre propre entrée
  if (players.length === 0 && mySessionId) {
    players = [{
      sessionId: mySessionId,
      pseudo: 'Moi', // Nous devrions récupérer le vrai pseudo du store
      isReady: false
    }];
  }
  
  console.log('👤 My player:', myPlayer);
  console.log('🔑 My session ID:', mySessionId);

  // Fonctions pour gérer le statut "prêt"
  const handleToggleReady = () => {
    if (myPlayer?.isReady) {
      gameService.setNotReady();
    } else {
      gameService.setReady();
    }
  };

  const handleLeaveRoom = async () => {
    await disconnect();
  };

  // Informations sur la room
  const roomInfo = gameState?.roomInfo || {};
  const readyCount = players.filter(player => player.isReady).length;
  const totalCount = players.length;
  const minRequired = roomInfo.minPlayers || 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xs sm:max-w-lg md:max-w-2xl mx-auto px-2 sm:px-4 lg:px-0"
    >
      <div className="bg-white/10 backdrop-blur-card rounded-lg sm:rounded-xl p-4 sm:p-8 shadow-xl">
        {/* En-tête du lobby */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">Lobby</h2>
          <p className="text-gray-300 text-xs sm:text-sm">
            Room ID: <span className="font-mono text-blue-400">{room?.roomId || 'N/A'}</span>
          </p>
          <div className="mt-3 sm:mt-4">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
              <div className={`w-2.5 h-2.5 sm:w-3 h-3 rounded-full ${readyCount >= minRequired ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-xs sm:text-sm">
                {readyCount}/{totalCount} joueurs prêts (min: {minRequired})
              </span>
            </div>
          </div>
        </div>

        {/* Liste des joueurs */}
        <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-semibold text-center mb-2 sm:mb-4">Joueurs connectés</h3>
          {players.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <p className="text-gray-400 text-sm sm:text-base">Aucun joueur connecté...</p>
            </div>
          ) : (
            players.map((player, index) => {
              const isMe = player.sessionId === mySessionId;
              return (
                <motion.div
                  key={player.sessionId || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`flex flex-col sm:flex-row items-center sm:justify-between gap-2 sm:gap-0 p-3 sm:p-4 rounded-lg border-2 transition-all ${
                    isMe 
                      ? 'bg-blue-600/20 border-blue-500 shadow-lg' 
                      : 'bg-white/10 border-white/20'
                  }`}
                >
                  {/* Informations du joueur */}
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    {/* Avatar */}
                    <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-base sm:text-lg ${
                      isMe ? 'bg-blue-500' : 'bg-gray-600'
                    }`}>
                      {player.pseudo ? player.pseudo.charAt(0).toUpperCase() : '?'}
                    </div>
                    {/* Nom et statut */}
                    <div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="font-semibold text-sm sm:text-base">
                          {player.pseudo || 'Joueur inconnu'}
                        </span>
                        {isMe && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                            Vous
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                        <div className={`w-1.5 h-1.5 sm:w-2 h-2 rounded-full ${
                          player.isReady ? 'bg-green-500' : 'bg-gray-500'
                        }`}></div>
                        <span className={player.isReady ? 'text-green-400' : 'text-gray-400'}>
                          {player.isReady ? 'Prêt' : 'En attente'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Bouton Ready pour le joueur actuel */}
                  {isMe && (
                    <div className="w-full sm:w-auto mt-2 sm:mt-0 flex justify-end">
                      <Button
                        onClick={handleToggleReady}
                        variant={myPlayer?.isReady ? 'success' : 'secondary'}
                        size="small"
                        className="w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                      >
                        {myPlayer?.isReady ? '✓ Prêt' : 'Se préparer'}
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Statut de la partie */}
        <div className="text-center mb-4 sm:mb-6">
          {readyCount >= minRequired ? (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-green-600/20 border border-green-500 rounded-lg p-3 sm:p-4"
            >
              <p className="text-green-400 font-semibold text-sm sm:text-base">
                🎉 Assez de joueurs prêts ! La partie peut commencer
              </p>
              {readyCount === totalCount && (
                <p className="text-xs sm:text-sm text-green-300 mt-1">
                  Tous les joueurs sont prêts - En attente du serveur...
                </p>
              )}
            </motion.div>
          ) : (
            <div className="bg-yellow-600/20 border border-yellow-500 rounded-lg p-3 sm:p-4">
              <p className="text-yellow-400 text-xs sm:text-sm">
                En attente de {minRequired - readyCount} joueur(s) supplémentaire(s)
              </p>
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
          <Button
            onClick={handleLeaveRoom}
            variant="danger"
            size="medium"
            className="w-full sm:w-auto text-sm sm:text-base px-4 py-2"
          >
            Quitter la room
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default LobbyScreen;
