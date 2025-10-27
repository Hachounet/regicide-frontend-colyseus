import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore.js';
import { useGameConnection } from '../hooks/useGameConnection.js';
import ReturnToLobbyButton from './ui/ReturnToLobbyButton.jsx';

// =======================
// CONSTANTES ET CONFIG
// =======================

const SUIT_CONFIG = {
  spades: { gradient: 'from-gray-800 to-black', symbol: '♠' },
  hearts: { gradient: 'from-red-500 to-red-700', symbol: '♥' },
  diamonds: { gradient: 'from-orange-400 to-orange-600', symbol: '♦' },
  clubs: { gradient: 'from-blue-800 to-blue-950', symbol: '♣' },
};

const RANK_STYLES = [
  'from-yellow-400 to-yellow-600 text-gray-900 shadow-lg',
  'from-gray-300 to-gray-400 text-gray-900',
  'from-orange-400 to-orange-600 text-white',
];

const ANIMATION = {
  container: { duration: 0.5 },
  title: { delay: 0.2 },
  playerCard: (index) => ({ delay: 0.3 + index * 0.08 }),
  button: { delay: 0.7 },
};

// =======================
// SOUS-COMPOSANTS
// =======================

const PageTitle = () => (
  <motion.header
    className="text-center mb-6 sm:mb-10"
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={ANIMATION.title}
  >
    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500">
      🏆 Fin de Partie
    </h1>
    <div className="h-1 w-24 sm:w-32 mx-auto bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" />
  </motion.header>
);

const RankBadge = ({ rank }) => {
  const style = RANK_STYLES[rank] || 'bg-white/20 text-gray-300';
  const isGradient = rank <= 2;
  return (
    <div
      className={`flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl
        ${isGradient ? `bg-gradient-to-br ${style}` : style}
      `}
    >
      {rank + 1}
    </div>
  );
};

const PlayerAvatar = ({ pseudo, isMe }) => (
  <div
    className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl border-2
      ${isMe
        ? 'bg-blue-500 border-blue-300 text-white'
        : 'bg-white/20 border-white/30 text-gray-200'
      }
    `}
  >
    {pseudo?.charAt(0)?.toUpperCase() || '?'}
  </div>
);

const PlayerBadges = ({ isMe, isWinner }) => (
  <div className="flex items-center gap-2 flex-wrap">
    {isMe && (
      <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
        VOUS
      </span>
    )}
    {isWinner && (
      <span className="bg-yellow-400 text-gray-900 px-2 py-0.5 rounded-full text-xs font-bold">
        GAGNANT
      </span>
    )}
  </div>
);

const PlayerInfo = ({ player, isMe, isWinner }) => (
  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
    <PlayerAvatar pseudo={player.pseudo} isMe={isMe} />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-white font-semibold text-base sm:text-lg md:text-xl truncate">
          {player.pseudo}
        </span>
        <PlayerBadges isMe={isMe} isWinner={isWinner} />
      </div>
    </div>
  </div>
);

const KingIcon = ({ suit }) => {
  const config = SUIT_CONFIG[suit] || { gradient: '', symbol: '?' };
  const gradientClass = config.gradient
    ? `bg-gradient-to-br ${config.gradient}`
    : 'bg-gray-500';

  return (
    <div
      className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold shadow-lg ${gradientClass} text-white`}
    >
      {config.symbol}
    </div>
  );
};

const ScoreDisplay = ({ score, isWinner }) => (
  <div className="text-right">
    <div
      className={`text-2xl sm:text-3xl md:text-4xl font-bold ${
        isWinner ? 'text-yellow-400' : 'text-white'
      }`}
    >
      {score}
    </div>
    <div className="text-xs text-gray-400">points</div>
  </div>
);

const PlayerCard = ({ player, rank, isWinner, isMe }) => {
  const cardStyles = `relative rounded-xl p-3 sm:p-4 transition-all duration-300 flex flex-col sm:flex-row items-center gap-3 sm:gap-0
    ${isWinner
      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/50 shadow-lg shadow-yellow-500/20'
      : 'bg-white/5 border border-white/10'
    }
    ${isMe ? 'ring-2 ring-blue-400' : ''}
  `;

  return (
    <motion.article
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={ANIMATION.playerCard(rank)}
      className={cardStyles}
    >
      {/* Rang + infos joueur */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        <RankBadge rank={rank} />
        <PlayerInfo player={player} isMe={isMe} isWinner={isWinner} />
      </div>
      {/* Roi + score */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 mt-2 sm:mt-0">
        <KingIcon suit={player.secretKing?.suit} />
        <ScoreDisplay score={player.score} isWinner={isWinner} />
      </div>
    </motion.article>
  );
};

const EmptyState = () => (
  <motion.div
    className="text-center py-12"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={ANIMATION.title}
  >
    <div className="text-gray-200 text-xl mb-2">Fin de partie...</div>
    <div className="text-gray-400">Aucun score à afficher</div>
  </motion.div>
);

const PlayerList = ({ players, winnerId, mySessionId }) => {
  if (players.length === 0) {
    return <EmptyState />;
  }
  return (
    <div className="space-y-3 mb-8">
      {players.map((player, index) => (
        <PlayerCard
          key={player.sessionId}
          player={player}
          rank={index}
          isWinner={player.sessionId === winnerId}
          isMe={player.sessionId === mySessionId}
        />
      ))}
    </div>
  );
};

// =======================
// COMPOSANT PRINCIPAL
// =======================

const ResultsScreen = () => {
  const { gameState, mySessionId } = useGameStore();
  const { disconnect } = useGameConnection();
  // Utilisation dynamique de useNavigate pour éviter l'erreur Vite si react-router-dom n'est pas installé
  let navigate = () => {};
  try {
    // eslint-disable-next-line
    navigate = require('react-router-dom').useNavigate?.() || (() => {});
  } catch {}

  // Préparer les données
  let players = [];
  if (gameState?.players) {
    // Supporte ArraySchema, array ou object
    if (Array.isArray(gameState.players)) {
      players = gameState.players.map((p) => ({ ...p, score: p.score ?? 0 }));
    } else if (typeof gameState.players === 'object' && gameState.players.length === undefined) {
      players = Object.values(gameState.players).map((p) => ({ ...p, score: p.score ?? 0 }));
    } else if (gameState.players.length !== undefined) {
      for (let i = 0; i < gameState.players.length; i++) {
        const p = gameState.players[i];
        if (p && typeof p === 'object') players.push({ ...p, score: p.score ?? 0 });
      }
    }
  }

  const sortedPlayers = players.slice().sort((a, b) => b.score - a.score);

  const handleReturnToLobby = async () => {
    await disconnect();
    navigate('/');
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={ANIMATION.container}
        className="w-full max-w-lg sm:max-w-xl"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 sm:p-6 shadow-2xl border border-white/20">
          <PageTitle />
          <PlayerList
            players={sortedPlayers}
            winnerId={gameState?.winner}
            mySessionId={mySessionId}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={ANIMATION.button}
            className="flex justify-center"
          >
            <ReturnToLobbyButton onClick={handleReturnToLobby} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultsScreen;
