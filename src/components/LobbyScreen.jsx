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
  const minRequired = roomInfo.minPlayers || 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white/10 backdrop-blur-card rounded-xl p-8 shadow-xl">
        {/* En-tête du lobby */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Lobby</h2>
          <p className="text-gray-300">
            Room ID: <span className="font-mono text-blue-400">{room?.roomId || 'N/A'}</span>
          </p>
          <div className="mt-4">
            <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
              <div className={`w-3 h-3 rounded-full ${readyCount >= minRequired ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm">
                {readyCount}/{totalCount} joueurs prêts (min: {minRequired})
              </span>
            </div>
          </div>
        </div>

        {/* Liste des joueurs */}
        <div className="space-y-3 mb-8">
          <h3 className="text-xl font-semibold text-center mb-4">Joueurs connectés</h3>
          
          {players.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Aucun joueur connecté...</p>
            </div>
          ) : (
            players.map((player, index) => {
              const isMe = player.sessionId === mySessionId;
              
              return (
                <motion.div
                  key={player.sessionId || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    isMe 
                      ? 'bg-blue-600/20 border-blue-500 shadow-lg' 
                      : 'bg-white/10 border-white/20'
                  }`}
                >
                  {/* Informations du joueur */}
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      isMe ? 'bg-blue-500' : 'bg-gray-600'
                    }`}>
                      {player.pseudo ? player.pseudo.charAt(0).toUpperCase() : '?'}
                    </div>
                    
                    {/* Nom et statut */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">
                          {player.pseudo || 'Joueur inconnu'}
                        </span>
                        {isMe && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                            Vous
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${
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
                    <Button
                      onClick={handleToggleReady}
                      variant={myPlayer?.isReady ? 'success' : 'secondary'}
                      size="small"
                    >
                      {myPlayer?.isReady ? '✓ Prêt' : 'Se préparer'}
                    </Button>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Statut de la partie */}
        <div className="text-center mb-6">
          {readyCount >= minRequired ? (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-green-600/20 border border-green-500 rounded-lg p-4"
            >
              <p className="text-green-400 font-semibold">
                🎉 Assez de joueurs prêts ! La partie peut commencer
              </p>
              {readyCount === totalCount && (
                <p className="text-sm text-green-300 mt-1">
                  Tous les joueurs sont prêts - En attente du serveur...
                </p>
              )}
            </motion.div>
          ) : (
            <div className="bg-yellow-600/20 border border-yellow-500 rounded-lg p-4">
              <p className="text-yellow-400">
                En attente de {minRequired - readyCount} joueur(s) supplémentaire(s)
              </p>
              {totalCount < minRequired && (
                <p className="text-sm text-yellow-300 mt-1">
                  {minRequired - totalCount} joueur(s) doivent encore rejoindre la room
                </p>
              )}
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={handleLeaveRoom}
            variant="danger"
            size="medium"
          >
            Quitter la room
          </Button>
        </div>

        {/* Informations de debug (à supprimer en production) */}
        {import.meta.env.DEV && (
          <details className="mt-8 p-4 bg-black/20 rounded-lg">
            <summary className="cursor-pointer text-sm text-gray-400">
              Debug Info (dev only)
            </summary>
            <pre className="text-xs text-gray-300 mt-2 overflow-auto">
              {JSON.stringify({
                mySessionId,
                myPlayer: myPlayer || 'null',
                players: players.length,
                gameState: gameState ? 'loaded' : 'null'
              }, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </motion.div>
  );
};

export default LobbyScreen;
