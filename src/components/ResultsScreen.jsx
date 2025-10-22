import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore.js';
import { useGameConnection } from '../hooks/useGameConnection.js';
import ReturnToLobbyButton from './ui/ReturnToLobbyButton.jsx';

const suitColors = {
  spades: 'bg-black text-white',
  hearts: 'bg-red-600 text-white',
  diamonds: 'bg-orange-500 text-white',
  clubs: 'bg-blue-900 text-white',
};

const suitSymbols = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

const ResultsScreen = () => {
  const { gameState, mySessionId } = useGameStore();
  const { disconnect } = useGameConnection();
  const winnerId = gameState?.winner;
  // Utilise la liste des joueurs pour afficher les scores
  const scores = gameState?.players
  ? Array.from(gameState.players).map(player => ({
      ...player,
      score: player.score ?? 0
    }))
  : [];

  console.log(scores)
  console.log(gameState)

  // Détermine si la partie s'est terminée par blocage
  const allPlayersBlocked = scores.length > 0 && scores.every(player => 
    gameState?.players?.find(p => p.sessionId === player.sessionId)?.handCount === 0
  );

  const handleReturnToLobby = async () => {
    await disconnect();
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-3 sm:p-4 lg:p-6 py-4 sm:py-6 lg:py-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm sm:max-w-2xl md:max-w-3xl lg:max-w-5xl"
      >
        <div className="bg-white/10 backdrop-blur-card rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 shadow-xl">
          {/* Titre avec animation */}
          <motion.div
            className="text-center mb-4 sm:mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              🏆 Fin de Partie
            </h2>
            {allPlayersBlocked && (
              <p className="text-gray-300 text-xs sm:text-sm lg:text-base">
                La partie s'est terminée - Aucun joueur ne pouvait continuer
              </p>
            )}
          </motion.div>

          {scores.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <div className="overflow-hidden rounded-lg sm:rounded-xl shadow-lg bg-white/5 border border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/10">
                      <tr>
                        <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-gray-200 font-medium text-xs sm:text-sm lg:text-base">#</th>
                        <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-gray-200 font-medium text-xs sm:text-sm lg:text-base">Joueur</th>
                        <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-center text-gray-200 font-medium text-xs sm:text-sm lg:text-base">Score</th>
                        <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-center text-gray-200 font-medium text-xs sm:text-sm lg:text-base hidden sm:table-cell">Roi</th>
                        <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-center text-gray-200 font-medium text-xs sm:text-sm lg:text-base hidden md:table-cell">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {scores
                        .slice()
                        .sort((a, b) => b.score - a.score)
                        .map((player, idx) => {
                          const isWinner = player.sessionId === winnerId;
                          const isMe = player.sessionId === mySessionId;
                          
                          return (
                            <motion.tr
                              key={player.sessionId}
                              className={`transition-all duration-200 hover:bg-white/5 ${
                                isWinner ? 'bg-yellow-500/10' : ''
                              } ${
                                isMe ? 'ring-2 ring-blue-400/50 ring-inset' : ''
                              }`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 + idx * 0.08, duration: 0.3 }}
                            >
                              <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3">
                                <div className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${
                                  isWinner ? 'bg-yellow-500 text-gray-900' : 'bg-white/20 text-gray-300'
                                }`}>
                                  {idx + 1}
                                </div>
                              </td>
                              <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3">
                                <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                                  <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base lg:text-lg flex-shrink-0 ${
                                    isMe ? 'bg-blue-500 text-white' : 'bg-white/20 text-gray-300'
                                  }`}>
                                    {player.pseudo?.charAt(0)?.toUpperCase() || '?'}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs sm:text-sm lg:text-base font-semibold text-white flex items-center gap-1 sm:gap-2 flex-wrap">
                                      <span className="truncate">{player.pseudo}</span>
                                      {isMe && (
                                        <span className="text-[10px] sm:text-xs bg-blue-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                                          VOUS
                                        </span>
                                      )}
                                      {isWinner && (
                                        <span className="md:hidden text-[10px] sm:text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-1.5 sm:px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                                          👑
                                        </span>
                                      )}
                                    </div>
                                    {/* Afficher le roi secret sur mobile sous le pseudo */}
                                    <div className="sm:hidden mt-1">
                                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xl font-bold ${
                                        suitColors[player.secretKing?.suit] || 'bg-gray-500 text-white'
                                      }`}>
                                        {suitSymbols[player.secretKing?.suit] || '?'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-center">
                                <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                                  isWinner ? 'text-yellow-400' : 'text-gray-200'
                                }`}>
                                  {player.score}
                                </div>
                              </td>
                              <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-center hidden sm:table-cell">
                                <div className="flex items-center justify-center">
                                  <span className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full text-2xl sm:text-3xl lg:text-4xl font-bold ${
                                    suitColors[player.secretKing?.suit] || 'bg-gray-500 text-white'
                                  }`}>
                                    {suitSymbols[player.secretKing?.suit] || '?'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-center hidden md:table-cell">
                                {isWinner && (
                                  <div className="flex items-center justify-center">
                                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-2 py-1 sm:px-3 sm:py-1 lg:px-4 lg:py-1.5 rounded-full font-bold text-xs lg:text-sm flex items-center gap-1">
                                      👑 <span className="hidden lg:inline">GAGNANT</span>
                                    </span>
                                  </div>
                                )}
                              </td>
                            </motion.tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="text-center p-6 sm:p-8 bg-white/5 rounded-lg sm:rounded-xl border border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-gray-200 text-base sm:text-lg">Fin de partie...</div>
              <div className="text-gray-400 mt-2 text-sm sm:text-base">Aucun score à afficher</div>
            </motion.div>
          )}

          {/* Boutons d'action */}
          <motion.div 
            className="mt-4 sm:mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.3 }}
          >
            <ReturnToLobbyButton onClick={handleReturnToLobby} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultsScreen;
