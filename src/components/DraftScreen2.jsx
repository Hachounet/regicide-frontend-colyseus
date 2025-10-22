import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore.js';
import { useGameConnection } from '../hooks/useGameConnection.js';
import Card from './ui/Card.jsx';
import ConfirmSelection from './ui/ConfirmSelection.jsx';
import EmojiWheel from './ui/EmojiWheel.jsx';

const DraftScreen2 = () => {
  const { gameState, mySessionId, getMyPlayer } = useGameStore();
  const { sendMessage } = useGameConnection();
  const [selectedCards, setSelectedCards] = useState([]);
  const [showKingReveal, setShowKingReveal] = useState(false);
  const [draftPhase, setDraftPhase] = useState('waiting');

  const myPlayer = getMyPlayer();
  const players = gameState?.players || [];
  const playerCount = players.length;
  const pickCount = (playerCount === 3 && (myPlayer?.draftPack?.length === 4)) ? 2 : 1;

  // Responsive detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ...existing logic for draftPhase, handleCardSelect, handleConfirmSelection...
  // Gestion de la sélection des cartes
  const handleCardSelect = (card) => {
    const isAlreadySelected = selectedCards.some(c => c.id === card.id);
    if (isAlreadySelected) {
      setSelectedCards(selectedCards.filter(c => c.id !== card.id));
      return;
    }
    if (selectedCards.length < pickCount) {
      setSelectedCards([...selectedCards, card]);
    } else {
      setSelectedCards([...selectedCards.slice(1), card]);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedCards.length === 0) return;
    sendMessage('draft_cards', {
      cardIds: selectedCards.map(card => card.id)
    });
    setSelectedCards([]);
    setDraftPhase('passing');
    setTimeout(() => {
      setDraftPhase('drafting');
    }, 1500);
  };

  // UI joueur (avatar + nom)
  const renderPlayer = (player, visualIndex) => {
    const isMe = player.sessionId === mySessionId;
    return (
      <motion.div
        key={player.sessionId}
        className={`flex flex-col items-center ${isMobile ? 'mx-2' : 'absolute'} ${isMobile ? '' : ''}`}
        style={isMobile ? {} : { top: '10px', right: `${10 + visualIndex * 120}px` }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: visualIndex * 0.2 }}
      >
        <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center font-bold text-xl sm:text-2xl shadow-xl border-2
          ${isMe ? 'bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900 border-blue-300' : 'bg-gradient-to-br from-gray-500 via-gray-700 to-gray-900 border-gray-300'}
          backdrop-blur-md bg-white/20 relative overflow-hidden`}>
          <span className="z-10 text-white drop-shadow-lg">
            {player.pseudo?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
        <div className={`mt-2 text-base font-semibold ${isMe ? 'text-blue-300' : 'text-gray-300'} drop-shadow-sm`}>
          {isMe ? 'Vous' : player.pseudo}
        </div>
        {player.handCount > 0 && (
          <div className="mt-1 text-xs text-gray-400 bg-white/10 rounded-full px-2 py-0.5 shadow-sm">
            {player.handCount} carte{player.handCount > 1 ? 's' : ''}
          </div>
        )}
      </motion.div>
    );
  };

  // Phase de révélation du roi
  if (draftPhase === 'revealing_king' && myPlayer?.secretKing) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-white">Votre Roi</h2>
          <motion.div
            initial={{ scale: 0, rotateY: 180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ delay: 0.5, duration: 1, type: 'spring' }}
          >
            <Card card={myPlayer.secretKing} size={isMobile ? 'large' : 'xlarge'} className="mx-auto" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-4 text-gray-300"
          >
            Préparation du draft en cours...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Responsive layout
  return (
    <div className={`relative w-full h-screen overflow-hidden ${isMobile ? 'p-2' : ''}`}>
      {/* Titre et instructions */}
      <div className={`w-full text-center z-20 ${isMobile ? 'pt-4 pb-2' : 'absolute top-4 left-1/2 transform -translate-x-1/2'}`}>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Phase de Draft</h2>
        <div className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
          Piochez 2 cartes, passez le reste au voisin de gauche.<br />
          Piochez 1 carte parmi les 2 restantes, passez la dernière.<br />
          Piochez la dernière carte reçue.
        </div>
      </div>

      {/* Joueurs */}
      <div className={`flex ${isMobile ? 'justify-center gap-2 mt-2' : ''}`}>
        {players.map((player, visualIndex) => renderPlayer(player, visualIndex))}
      </div>

      {/* Zone de draft au centre */}
      {draftPhase === 'drafting' && myPlayer?.draftPack?.length > 0 && (
        <motion.div
          className={`w-full ${isMobile ? 'flex flex-col items-center mt-6' : 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-4xl px-4'}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
        >
          <div className={`flex ${isMobile ? 'flex-wrap justify-center gap-3 mb-4' : 'justify-center gap-8 mb-8'}`}>
            {myPlayer.draftPack.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ y: -50, opacity: 0, rotateY: 180 }}
                animate={{ y: 0, opacity: 1, rotateY: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6, type: 'spring' }}
                whileHover={isMobile ? {} : {
                  y: -20,
                  scale: 1.1,
                  zIndex: 50,
                  transition: { duration: 0.2, ease: 'easeOut' }
                }}
              >
                <Card
                  card={card}
                  isSelected={selectedCards.find(c => c.id === card.id)}
                  onClick={() => handleCardSelect(card)}
                  size={isMobile ? 'large' : 'xlarge'}
                  className={`transition-all duration-200 ${
                    selectedCards.find(c => c.id === card.id)
                      ? 'ring-2 ring-blue-400 ring-opacity-75 shadow-2xl'
                      : 'shadow-lg hover:shadow-xl'
                  }`}
                />
              </motion.div>
            ))}
          </div>
          <div className="flex justify-center">
            <ConfirmSelection
              selectedCount={selectedCards.length}
              requiredCount={pickCount}
              onClick={handleConfirmSelection}
            />
          </div>
        </motion.div>
      )}

      {/* Main du joueur en bas */}
      {myPlayer?.hand?.length > 0 && (
        <motion.div
          className={`w-full flex flex-col items-center ${isMobile ? 'mb-2' : 'absolute bottom-8'}`}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className={`flex ${isMobile ? 'justify-center gap-1 mb-2' : 'justify-center items-end gap-1 mb-4'}`}>
            {myPlayer.hand.map((card, index) => {
              const isSelected = selectedCards.find(c => c.id === card.id);
              return (
                <motion.div
                  key={card.id}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  whileHover={isMobile ? {} : {
                    y: -30,
                    scale: 2.25,
                    zIndex: 50,
                    transition: { duration: 0.2, ease: 'easeOut' }
                  }}
                  transition={{
                    delay: index * 0,
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    duration: 0.001
                  }}
                  style={{ zIndex: isSelected ? 40 : 10 + index }}
                >
                  <Card
                    card={card}
                    isSelected={isSelected}
                    onClick={() => handleCardSelect(card)}
                    size={isMobile ? 'medium' : 'large'}
                    className={`transition-all duration-200 ${
                      isSelected ? 'ring-2 ring-blue-400 ring-opacity-75 shadow-2xl' : 'shadow-lg'
                    } ${isMobile ? '' : 'scale-150'}`}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* EmojiWheel en bas à droite (mobile: centré en bas) */}
      <motion.div
        className={isMobile ? 'fixed bottom-2 left-1/2 -translate-x-1/2 z-40' : 'absolute bottom-12 right-12 z-40'}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.7, duration: 0.8, type: 'spring' }}
      >
        <EmojiWheel />
      </motion.div>

      {/* Message d'attente */}
      {draftPhase === 'passing' && (
        <motion.div
          className={`text-center ${isMobile ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ marginTop: '-50px' }}
        >
          <div className="text-white text-xl sm:text-2xl font-semibold">
            En attente des autres joueurs...
          </div>
          <div className="text-gray-400 text-sm sm:text-lg mt-2">
            Les paquets vont bientôt passer !
          </div>
        </motion.div>
      )}

      {/* Message d'état de base */}
      {draftPhase === 'waiting' && (
        <div className={`text-center ${isMobile ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'}`}>
          <div className="text-white text-lg sm:text-xl mb-2 sm:mb-4">En attente du début du draft...</div>
          <div className="text-gray-400 text-xs sm:text-base">Phase actuelle: {gameState?.phase}</div>
        </div>
      )}
    </div>
  );
};

export default DraftScreen2;
