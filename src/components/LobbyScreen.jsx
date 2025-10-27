import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore.js';
import { useGameConnection } from '../hooks/useGameConnection.js';
import gameService from '../services/gameService.js';
import Button from './ui/Button.jsx';

const LobbyScreen = () => {
  const { gameState, getMyPlayer } = useGameStore();
  const { disconnect } = useGameConnection();

  const room = gameService.getRoom();
  const mySessionId = room?.sessionId;

  // Gestion des joueurs (ArraySchema, array ou object)
  let players = [];
  if (gameState?.players) {
    if (gameState.players.length !== undefined) {
      for (let i = 0; i < gameState.players.length; i++) {
        const player = gameState.players[i];
        if (player && typeof player === 'object') players.push(player);
      }
    } else if (typeof gameState.players === 'object' && !Array.isArray(gameState.players)) {
      players = Object.values(gameState.players);
    } else if (Array.isArray(gameState.players)) {
      players = gameState.players;
    }
  }
  const myPlayer = getMyPlayer();
  if (players.length === 0 && mySessionId) {
    players = [{
      sessionId: mySessionId,
      pseudo: 'Moi',
      isReady: false
    }];
  }

  // Infos partie
  let gameOptions = {};
  if (gameState?.gameOptions) {
    try {
      gameOptions = typeof gameState.gameOptions === 'string'
        ? JSON.parse(gameState.gameOptions)
        : gameState.gameOptions;
    } catch {}
  }
  const readyCount = players.filter(player => player.isReady).length;
  const totalCount = players.length;
  const requiredPlayers = gameOptions.playerCount || gameState?.playerCount || gameState?.roomInfo?.playerCount || 4;
  const minRequired = requiredPlayers;

  // Actions
  const handleToggleReady = () => {
    if (myPlayer?.isReady) gameService.setNotReady();
    else gameService.setReady();
  };
  const handleLeaveRoom = async () => { await disconnect(); };

  // Responsive: avatars plus petits si >3 joueurs
  const compactMode = players.length > 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg md:max-w-2xl mx-auto px-2 sm:px-4"
    >
      <div className="bg-white/10 backdrop-blur-card rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-xl flex flex-col min-h-[80vh]">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">Lobby</h2>
          <p className="text-gray-300 text-xs sm:text-sm">
            Room ID: <span className="font-mono text-blue-400">{room?.roomId || 'N/A'}</span>
          </p>
          <div className="mt-3 flex justify-center">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${readyCount >= minRequired ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-xs">
                {readyCount}/{totalCount} prêts (min: {minRequired})
              </span>
            </div>
          </div>
        </div>

        {/* Liste des joueurs (scrollable si besoin) */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-lg sm:text-xl font-semibold text-center mb-2">Joueurs connectés</h3>
          <div
            className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent"
            style={{ maxHeight: 260 }}
          >
            {players.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm">Aucun joueur connecté...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {players.map((player, index) => {
                  const isMe = player.sessionId === mySessionId;
                  return (
                    <motion.div
                      key={player.sessionId || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className={`flex flex-col sm:flex-row items-center sm:justify-between gap-2 rounded-lg border-2 transition-all
                        ${isMe ? 'bg-blue-600/20 border-blue-500 shadow-lg' : 'bg-white/10 border-white/20'}
                        ${compactMode ? 'p-2' : 'p-3'}
                      `}
                    >
                      {/* Avatar + nom */}
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className={`rounded-full flex items-center justify-center font-bold
                          ${compactMode ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-base sm:w-12 sm:h-12 sm:text-lg'}
                          ${isMe ? 'bg-blue-500' : 'bg-gray-600'}`}>
                          {player.pseudo ? player.pseudo.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-sm">
                              {player.pseudo || 'Joueur inconnu'}
                            </span>
                            {isMe && (
                              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                                Vous
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <div className={`w-2 h-2 rounded-full ${player.isReady ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                            <span className={player.isReady ? 'text-green-400' : 'text-gray-400'}>
                              {player.isReady ? 'Prêt' : 'En attente'}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Bouton Ready pour soi */}
                      {isMe && (
                        <div className="w-full sm:w-auto mt-2 sm:mt-0 flex justify-end">
                          <Button
                            onClick={handleToggleReady}
                            variant={myPlayer?.isReady ? 'success' : 'secondary'}
                            size="small"
                            className={`w-full sm:w-auto ${compactMode ? 'text-xs px-2 py-1' : 'text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2'}`}
                          >
                            {myPlayer?.isReady ? '✓ Prêt' : 'Se préparer'}
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Statut de la partie */}
        <div className="text-center my-4">
          {readyCount >= minRequired ? (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-green-600/20 border border-green-500 rounded-lg p-3"
            >
              <p className="text-green-400 font-semibold text-sm">
                🎉 Assez de joueurs prêts ! La partie peut commencer
              </p>
              {readyCount === totalCount && (
                <p className="text-xs text-green-300 mt-1">
                  Tous les joueurs sont prêts - En attente du serveur...
                </p>
              )}
            </motion.div>
          ) : (
            <div className="bg-yellow-600/20 border border-yellow-500 rounded-lg p-3">
              <p className="text-yellow-400 text-xs">
                En attente de {requiredPlayers - totalCount} joueur(s) supplémentaire(s) (partie à {requiredPlayers} joueurs)
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-2">
          <Button
            onClick={handleLeaveRoom}
            variant="danger"
            size="medium"
            className="w-full sm:w-auto text-sm px-4 py-2"
          >
            Quitter la room
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default LobbyScreen;
