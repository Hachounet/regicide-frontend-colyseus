import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const PlayerRing = ({
  players,
  mySessionId,
  currentPlayerId = null,
  jackTargetMode = false,
  onJackTargetSelect = () => {},
  jackTargetPlayerId = null
}) => {
  // Pour forcer le reset de l'animation à chaque changement de currentPlayerId
  const prevCurrentPlayerId = useRef(currentPlayerId);

  useEffect(() => {
    prevCurrentPlayerId.current = currentPlayerId;
  }, [currentPlayerId]);

  return (
    <div className="w-full flex justify-center items-center mt-2 sm:mt-6 px-1 sm:px-0">
      <div className="flex gap-3 sm:gap-6 md:gap-8 overflow-x-auto sm:overflow-x-visible py-2 sm:py-0 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent">
        {players.map((player, idx) => {
          const isMe = player.sessionId === mySessionId;
          const isCurrent = player.sessionId === currentPlayerId;
          const isJackTarget = player.sessionId === jackTargetPlayerId;
          let ringClass = '';
          let animateProps = { scale: 1 };

          // Utilise une clé unique pour forcer le reset de l'animation à chaque changement de currentPlayerId
          const animationKey = `${player.sessionId}-${isCurrent ? currentPlayerId : ''}`;

          if (isCurrent) {
            if (isMe) {
              ringClass = 'ring-4 ring-red-500 ring-opacity-80';
              animateProps = {
                scale: [1, 1.08, 1],
                boxShadow: [
                  '0 0 0px 0px #ef4444',
                  '0 0 16px 8px #ef4444',
                  '0 0 0px 0px #ef4444'
                ]
              };
            } else {
              ringClass = 'ring-4 ring-yellow-400 ring-opacity-80';
              animateProps = {
                scale: [1, 1.08, 1],
                boxShadow: [
                  '0 0 0px 0px #facc15',
                  '0 0 16px 8px #facc15',
                  '0 0 0px 0px #facc15'
                ]
              };
            }
          }

          // Ajout d'un effet visuel pour la cible du Valet
          let jackTargetClass = '';
          if (jackTargetMode && !isMe) {
            jackTargetClass = 'cursor-pointer hover:ring-4 hover:ring-yellow-300 hover:ring-opacity-80';
          }
          if (isJackTarget) {
            jackTargetClass += ' ring-4 ring-yellow-400 ring-opacity-100';
          }

          return (
            <motion.div
              key={animationKey}
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.15 }}
            >
              <motion.div
                className={`rounded-full flex items-center justify-center font-bold shadow-lg border-2 transition-all duration-300
                  ${isMe ? 'bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900 border-blue-300' : 'bg-gradient-to-br from-gray-500 via-gray-700 to-gray-900 border-gray-300'}
                  backdrop-blur-md bg-white/20 relative overflow-hidden
                  w-10 h-10 text-base
                  sm:w-16 sm:h-16 sm:text-xl
                  md:w-20 md:h-20 md:text-2xl
                  ${ringClass}
                  ${jackTargetClass}
                `}
                whileHover={{ scale: jackTargetMode && !isMe ? 1.12 : 1.08 }}
                animate={animateProps}
                transition={isCurrent ? { duration: 1.2, repeat: Infinity } : { duration: 0.3 }}
                onClick={
                  jackTargetMode && !isMe
                    ? () => onJackTargetSelect(player)
                    : undefined
                }
                style={{
                  cursor: jackTargetMode && !isMe ? 'pointer' : undefined,
                  outline: isJackTarget ? '2px solid #facc15' : undefined
                }}
              >
                <span className="absolute inset-0 rounded-full pointer-events-none" style={{
                  boxShadow: isMe
                    ? '0 0 24px 6px rgba(59,130,246,0.25)'
                    : '0 0 24px 6px rgba(156,163,175,0.18)'
                }} />
                <span className="z-10 text-white drop-shadow-lg">
                  {player.pseudo?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </motion.div>
              <div className={`mt-1 text-[10px] sm:text-sm md:text-base font-semibold ${isMe ? 'text-blue-300' : 'text-gray-300'} drop-shadow-sm`}>
                {isMe ? 'Vous' : player.pseudo}
              </div>
              {player.handCount > 0 && (
                <div className="mt-0.5 text-[8px] sm:text-xs text-gray-400 bg-white/10 rounded-full px-1 sm:px-2 py-0.5 shadow-sm">
                  {player.handCount} carte{player.handCount > 1 ? 's' : ''}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerRing;
