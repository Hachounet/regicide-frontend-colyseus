import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore.js';
import { useGameConnection } from '../hooks/useGameConnection.js';
import Card from './ui/Card.jsx';
import Button from './ui/Button.jsx';
import ConfirmSelection from './ui/ConfirmSelection.jsx';
import EmojiWheel from './ui/EmojiWheel.jsx';
import PlayerHandMobile from './ui/PlayerHandMobile.jsx';
import PlayerRing from './PlayerRing.jsx';

const DraftScreen = () => {
  const { gameState, mySessionId, getMyPlayer } = useGameStore();
  const { sendMessage } = useGameConnection();

  const [selectedCards, setSelectedCards] = useState([]);
  const [showKingReveal, setShowKingReveal] = useState(false);
  const [draftPhase, setDraftPhase] = useState('waiting');

  const myPlayer = getMyPlayer();
  const players = gameState?.players || [];
  const playerCount = players.length;
  const pickCount = (playerCount === 3 && (myPlayer?.draftPack?.length === 4)) ? 2 : 1;

  // Réorganiser les joueurs pour l'affichage visuel
  const getVisualPlayerOrder = () => {
    if (!myPlayer || players.length === 0) return [];
    const myIndex = players.findIndex(p => p.sessionId === mySessionId);
    if (myIndex === -1) return players;
    const reorderedPlayers = [];
    for (let i = 0; i < players.length; i++) {
      const playerIndex = (myIndex + i) % players.length;
      reorderedPlayers.push(players[playerIndex]);
    }
    return reorderedPlayers;
  };
  const visualPlayers = getVisualPlayerOrder();

  useEffect(() => {
    if (!gameState) return;
    if (gameState.phase === 'drafting') {
      if (!showKingReveal && myPlayer?.secretKing) {
        setDraftPhase('revealing_king');
        setShowKingReveal(true);
        const timer = setTimeout(() => setDraftPhase('drafting'), 3000);
        return () => clearTimeout(timer);
      }
      setDraftPhase('drafting');
    }
  }, [gameState, myPlayer, showKingReveal]);

  // Sélection des cartes
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

  // Confirmer le choix des cartes
  const handleConfirmSelection = () => {
    if (selectedCards.length === 0) return;
    sendMessage('draft_cards', { cardIds: selectedCards.map(card => card.id) });
    setSelectedCards([]);
    setDraftPhase('passing');
    setTimeout(() => setDraftPhase('drafting'), 2500);
  };

  // Affichage de la révélation du roi
  if (draftPhase === 'revealing_king' && myPlayer?.secretKing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-white">Votre Roi</h2>
          <motion.div
            initial={{ scale: 0, rotateY: 180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ delay: 0.5, duration: 1, type: "spring" }}
          >
            <Card 
              card={myPlayer.secretKing} 
              size="large"
              className="mx-auto"
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-300"
          >
            Préparation du draft en cours...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen flex flex-col">
      {/* Header */}
      <div className="w-full text-center pt-2 sm:pt-6 px-2 sm:px-4 z-20 flex-shrink-0">
        <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">
          Phase de Draft
        </h2>
        <div className="text-[11px] sm:text-sm text-gray-300 max-w-xs sm:max-w-md mx-auto leading-tight">
          Piochez 1 carte, passez le reste au voisin de gauche.<br className="hidden sm:block" />
          Piochez 1 carte parmi les 2/3 restantes, passez le reste.<br className="hidden sm:block" />
          Piochez la dernière carte reçue.
        </div>
      </div>

      {/* Liste des joueurs : PlayerRing */}
      <PlayerRing players={visualPlayers} mySessionId={mySessionId} />

      {/* Zone centrale flexible pour les cartes à choisir */}
      <div className="flex-1 flex items-center justify-center px-2 sm:px-4 relative min-h-0">
        {/* Zone de draft au centre */}
        {draftPhase === 'drafting' && myPlayer?.draftPack?.length > 0 && (
          <motion.div
            className="w-full max-w-full sm:max-w-2xl md:max-w-4xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
          >
            <div className="flex justify-center gap-1.5 sm:gap-4 md:gap-8 mb-2 sm:mb-6 md:mb-8 flex-wrap">
              {myPlayer.draftPack.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ y: -50, opacity: 0, rotateY: 180 }}
                  animate={{ y: 0, opacity: 1, rotateY: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6, type: "spring" }}
                  whileHover={{
                    y: -10,
                    scale: 1.05,
                    zIndex: 50,
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                  className="flex-shrink-0"
                >
                  <Card
                    card={card}
                    isSelected={selectedCards.find(c => c.id === card.id)}
                    onClick={() => handleCardSelect(card)}
                    size="large"
                    className={`transition-all duration-200 scale-[0.6] sm:scale-90 md:scale-110 ${
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

        {/* Message d'attente */}
        {draftPhase === 'passing' && (
          <motion.div
            className="text-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-white text-xl sm:text-2xl font-semibold">
              En attente des autres joueurs...
            </div>
            <div className="text-gray-400 text-base sm:text-lg mt-2">
              Les paquets vont bientôt passer !
            </div>
          </motion.div>
        )}

        {/* Message d'état de base */}
        {draftPhase === 'waiting' && (
          <div className="text-center px-4">
            <div className="text-white text-lg sm:text-xl mb-4">En attente du début du draft...</div>
            <div className="text-gray-400 text-sm sm:text-base">Phase actuelle: {gameState?.phase}</div>
          </div>
        )}
      </div>

      {/* Barre inférieure avec Roi, Main et Emoji */}
      <div className="w-full pb-2 sm:pb-6 flex-shrink-0">
        {/* Mobile: horizontal, Desktop: absolu */}
        <div className="sm:hidden flex justify-center items-center gap-2 px-2">
          {myPlayer?.secretKing && (
            <motion.div
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
              className="flex-shrink-0"
            >
              <Card 
                card={myPlayer.secretKing} 
                size="small"
                className="shadow-lg border-2 border-yellow-400 scale-[0.6]"
              />
              <div className="text-[8px] text-yellow-300 text-center mt-0.5 font-medium">
                Votre Roi
              </div>
            </motion.div>
          )}
          {myPlayer?.hand?.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex-shrink-0"
            >
              <PlayerHandMobile
                hand={myPlayer.hand}
                selectedCards={selectedCards}
                onCardSelect={handleCardSelect}
              />
            </motion.div>
          )}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.7, duration: 0.8, type: "spring" }}
            className="flex-shrink-0 scale-[0.6]"
          >
            <EmojiWheel />
          </motion.div>
        </div>
        <div className="hidden sm:block">
          {myPlayer?.secretKing && (
            <motion.div
              className="absolute bottom-4 left-4 sm:bottom-8 md:bottom-12 sm:left-8 md:left-12 z-40"
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1.2, rotateY: 0 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
            >
              <Card 
                card={myPlayer.secretKing} 
                size="small"
                className="shadow-lg border-2 border-yellow-400 scale-75 sm:scale-100"
              />
              <div className="text-[10px] sm:text-xs text-yellow-300 text-center mt-0.5 sm:mt-1 font-medium">
                Votre Roi
              </div>
            </motion.div>
          )}
          <motion.div
            className="absolute bottom-4 right-4 sm:bottom-8 md:bottom-12 sm:right-8 md:right-12 z-40 scale-75 sm:scale-90 md:scale-100"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.7, duration: 0.8, type: "spring" }}
          >
            <EmojiWheel />
          </motion.div>
          {myPlayer?.hand?.length > 0 && (
            <motion.div
              className="w-full flex flex-col items-center"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex justify-center items-end gap-0.5 sm:gap-1 mb-2 sm:mb-4 overflow-visible px-2 max-w-full md:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
                {myPlayer.hand.map((card, index) => {
                  const isSelected = selectedCards.find(c => c.id === card.id);
                  return (
                    <motion.div
                      key={card.id}
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      whileHover={{
                        y: -15,
                        scale: 1.8,
                        zIndex: 50,
                        transition: { duration: 0.2, ease: "easeOut" }
                      }}
                      transition={{
                        delay: index * 0,
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        duration: 0.001
                      }}
                      style={{
                        zIndex: isSelected ? 40 : 10 + index
                      }}
                      className="flex-shrink-0"
                    >
                      <Card
                        card={card}
                        isSelected={isSelected}
                        onClick={() => handleCardSelect(card)}
                        size="large"
                        className={`transition-all duration-200 scale-90 sm:scale-110 md:scale-150 ${
                          isSelected ? 'ring-2 ring-blue-400 ring-opacity-75 shadow-2xl' : 'shadow-lg'
                        }`}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DraftScreen;
