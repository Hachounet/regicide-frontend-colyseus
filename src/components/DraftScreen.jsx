import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore.js';
import { useGameConnection } from '../hooks/useGameConnection.js';
import Card from './ui/Card.jsx';
import Button from './ui/Button.jsx';
import ConfirmSelection from './ui/ConfirmSelection.jsx';
import EmojiWheel from './ui/EmojiWheel.jsx';
import PlayerHandMobile from './ui/PlayerHandMobile.jsx';

const DraftScreen = () => {
  const { gameState, mySessionId, getMyPlayer } = useGameStore();
  const { sendMessage } = useGameConnection();
  
  const [selectedCards, setSelectedCards] = useState([]);
  const [showKingReveal, setShowKingReveal] = useState(false);
  const [draftPhase, setDraftPhase] = useState('waiting'); // waiting, revealing_king, drafting, passing

  const myPlayer = getMyPlayer();
  const players = gameState?.players || [];
  const playerCount = players.length;
  // Pour 3 joueurs: premier pick = 2 quand le pack contient 4 cartes, sinon 1
  const pickCount = (playerCount === 3 && (myPlayer?.draftPack?.length === 4)) ? 2 : 1;

  // Réorganiser les joueurs pour l'affichage visuel
  const getVisualPlayerOrder = () => {
    if (!myPlayer || players.length === 0) return [];
    
    // Trouver l'index du joueur actuel dans le tableau
    const myIndex = players.findIndex(p => p.sessionId === mySessionId);
    if (myIndex === -1) return players;
    
    // Réorganiser pour que le joueur actuel soit en position 0
    const reorderedPlayers = [];
    for (let i = 0; i < players.length; i++) {
      const playerIndex = (myIndex + i) % players.length;
      reorderedPlayers.push(players[playerIndex]);
    }
    
    return reorderedPlayers;
  };

  const visualPlayers = getVisualPlayerOrder();

  // Debug: afficher l'état du jeu
  console.log('DraftScreen Debug:', {
    gameState,
    myPlayer,
    players,
    visualPlayers,
    mySessionId,
    draftPhase,
    phase: gameState?.phase,
    draftRound: gameState?.draftRound
  });
  useEffect(() => {
    if (!gameState) return;

    if (gameState.phase === 'drafting') {
      // Montrer la révélation du roi une seule fois si disponible
      if (!showKingReveal && myPlayer?.secretKing) {
        setDraftPhase('revealing_king');
        setShowKingReveal(true);

        const timer = setTimeout(() => {
          setDraftPhase('drafting');
        }, 3000);
        return () => clearTimeout(timer);
      }

      // Sinon rester/aller en mode draft
      setDraftPhase('drafting');
    }
  }, [gameState, myPlayer, showKingReveal]);

  // Gestion de la sélection des cartes (toggle + limite pickCount, remplacement FIFO)
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

    sendMessage('draft_cards', {
      cardIds: selectedCards.map(card => card.id)
    });

    setSelectedCards([]);
    setDraftPhase('passing');

    // Animation de passage des paquets
    setTimeout(() => {
      setDraftPhase('drafting');
    }, 2500);
  };

  // Rendu d'un joueur pour flexbox
  const renderPlayer = (player, visualIndex) => {
    const isMe = player.sessionId === mySessionId;
    
    return (
      <motion.div
        key={player.sessionId}
        className="flex flex-col items-center mx-2 sm:mx-3 md:mx-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: visualIndex * 0.2 }}
      >
        {/* Avatar du joueur modernisé - responsive */}
        <motion.div
          className={`w-12 h-12 sm:w-16 md:w-20 sm:h-16 md:h-20 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl md:text-2xl shadow-lg md:shadow-xl border-2 transition-all duration-300
            ${isMe ? 'bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900 border-blue-300' : 'bg-gradient-to-br from-gray-500 via-gray-700 to-gray-900 border-gray-300'}
            backdrop-blur-md bg-white/20 relative overflow-hidden`}
          whileHover={{ scale: 1.08 }}
        >
          {/* Effet lumineux */}
          <span className="absolute inset-0 rounded-full pointer-events-none" style={{
            boxShadow: isMe
              ? '0 0 24px 6px rgba(59,130,246,0.25)' // bleu
              : '0 0 24px 6px rgba(156,163,175,0.18)' // gris
          }} />
          <span className="z-10 text-white drop-shadow-lg">
            {player.pseudo?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </motion.div>
        {/* Nom du joueur modernisé - responsive */}
        <div className={`mt-1 sm:mt-2 text-xs sm:text-sm md:text-base font-semibold ${isMe ? 'text-blue-300' : 'text-gray-300'} drop-shadow-sm`}>
          {isMe ? 'Vous' : player.pseudo}
        </div>
        {/* Indicateur de cartes en main modernisé - responsive */}
        {player.handCount > 0 && (
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-gray-400 bg-white/10 rounded-full px-1.5 sm:px-2 py-0.5 shadow-sm">
            {player.handCount} carte{player.handCount > 1 ? 's' : ''}
          </div>
        )}
      </motion.div>
    );
  };

  // Phase de révélation du roi
  if (draftPhase === 'revealing_king' && myPlayer?.secretKing) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4">
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
    <div className="relative w-full h-screen overflow-hidden flex flex-col">
      {/* Debug info en haut à gauche - très petit */}
      <div className="absolute top-1 left-1 z-50 bg-black bg-opacity-50 text-white p-1 text-[8px] sm:text-[10px]">
        Phase: {gameState?.phase} | DraftPhase: {draftPhase} | Players: {players.length}
      </div>

      {/* Titre et informations en haut au milieu - responsive */}
      <div className="w-full text-center pt-2 sm:pt-4 px-4 z-20">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">
          Phase de Draft
        </h2>
        <div className="text-xs sm:text-sm text-gray-300 max-w-xs sm:max-w-md mx-auto leading-snug">
          Piochez 2 cartes, passez le reste au voisin de gauche.<br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          Piochez 1 carte parmi les 2 restantes, passez la dernière.<br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          Piochez la dernière carte reçue.
        </div>
      </div>

      {/* Cercles des joueurs - responsive: centré sous le titre en dessous de 1300px, en haut à droite au-dessus */}
      <div className="w-full flex justify-center items-center mt-3 sm:mt-4 xl:mt-0 xl:absolute xl:top-2 xl:right-2 xl:w-auto z-20">
        {visualPlayers.map((player, visualIndex) => renderPlayer(player, visualIndex))}
      </div>

      {/* Zone centrale flexible pour les cartes à choisir */}
      <div className="flex-1 flex items-center justify-center px-2 sm:px-4 relative">
        {/* Zone de draft au centre - responsive */}
        {draftPhase === 'drafting' && myPlayer?.draftPack?.length > 0 && (
          <motion.div
            className="w-full max-w-full sm:max-w-2xl md:max-w-4xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
          >
            {/* Cartes disponibles au centre - responsive */}
            <div className="flex justify-center gap-2 sm:gap-4 md:gap-8 mb-4 sm:mb-6 md:mb-8 flex-wrap">
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
                    className={`transition-all duration-200 scale-75 sm:scale-90 md:scale-110 ${
                      selectedCards.find(c => c.id === card.id) 
                        ? 'ring-2 ring-blue-400 ring-opacity-75 shadow-2xl' 
                        : 'shadow-lg hover:shadow-xl'
                    }`}
                  />
                </motion.div>
              ))}
            </div>

            {/* Bouton de confirmation */}
            <div className="flex justify-center">
              <ConfirmSelection
                selectedCount={selectedCards.length}
                requiredCount={pickCount}
                onClick={handleConfirmSelection}
              />
            </div>
          </motion.div>
        )}

        {/* Message d'attente - responsive */}
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

        {/* Message d'état de base - responsive */}
        {draftPhase === 'waiting' && (
          <div className="text-center px-4">
            <div className="text-white text-lg sm:text-xl mb-4">En attente du début du draft...</div>
            <div className="text-gray-400 text-sm sm:text-base">Phase actuelle: {gameState?.phase}</div>
          </div>
        )}
      </div>

      {/* Barre inférieure avec Roi, Main et Emoji - responsive */}
      <div className="w-full pb-2 sm:pb-4 md:pb-8">
        {/* Version mobile (< 640px) : disposition horizontale centrée */}
        <div className="sm:hidden flex justify-center items-center gap-4 px-4">
          {/* Roi du joueur à gauche */}
          {myPlayer?.secretKing && (
            <motion.div
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1.2, rotateY: 0 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
              className="flex-shrink-0"
            >
              <Card 
                card={myPlayer.secretKing} 
                size="small"
                className="shadow-lg border-2 border-yellow-400 scale-75"
              />
              <div className="text-[10px] text-yellow-300 text-center mt-0.5 font-medium">
                Votre Roi
              </div>
            </motion.div>
          )}

          {/* Main du joueur au centre */}
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

          {/* Roue à emoji à droite */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.7, duration: 0.8, type: "spring" }}
            className="flex-shrink-0 scale-75"
          >
            <EmojiWheel />
          </motion.div>
        </div>

        {/* Version desktop (>= 640px) : positions absolues comme avant */}
        <div className="hidden sm:block">
          {/* Roi du joueur en bas à gauche */}
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

          {/* Roue à emoji en bas à droite */}
          <motion.div
            className="absolute bottom-4 right-4 sm:bottom-8 md:bottom-12 sm:right-8 md:right-12 z-40 scale-75 sm:scale-90 md:scale-100"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.7, duration: 0.8, type: "spring" }}
          >
            <EmojiWheel />
          </motion.div>

          {/* Main du joueur en bas au milieu */}
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
                      animate={{ 
                        y: 0, 
                        opacity: 1
                      }}
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
