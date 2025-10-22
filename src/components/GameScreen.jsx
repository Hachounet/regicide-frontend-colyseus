import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore.js';
import { useGameConnection } from '../hooks/useGameConnection.js';
import Card from './ui/Card.jsx';
import Button from './ui/Button.jsx';
import EmojiWheel from './ui/EmojiWheel.jsx';
import PlayerHandMobile from './ui/PlayerHandMobile.jsx';
import PlayerHandPlayPhase from './ui/PlayerHandPlayPhase.jsx';
import { CARD_VALUES, GAME_ACTIONS } from '../types/game.js';

const GameScreen = () => {
  const { gameState, mySessionId, getMyPlayer } = useGameStore();
  const { sendMessage } = useGameConnection();
  
  const [selectedCards, setSelectedCards] = useState([]);
  const [gamePhase, setGamePhase] = useState('waiting'); // waiting, playing, special_power
  const [actionAnimation, setActionAnimation] = useState(false);
  const [draggedCard, setDraggedCard] = useState(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  
  // États pour les pouvoirs spéciaux
  const [specialPowerMode, setSpecialPowerMode] = useState(null); // 'queen' | 'jack' | null
  const [queenExchangeTargets, setQueenExchangeTargets] = useState([]);
  const [jackTargetPlayer, setJackTargetPlayer] = useState(null);
  const [jackGiveCard, setJackGiveCard] = useState(null);

  const myPlayer = getMyPlayer();
  const players = gameState?.players || [];

  // Vérifie si le joueur peut jouer une carte
  const canPlayAnyCard = () => {
    if (!myPlayer || !gameState) return false;
    if (!myPlayer.hand || myPlayer.hand.length === 0) return false;
    for (const card of myPlayer.hand) {
      for (let row = 1; row <= 4; row++) {
        const maxCols = [0, 4, 3, 2, 1];
        for (let col = 0; col < maxCols[row]; col++) {
          if (getValidAction(card, row, col)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Handler pour passer son tour
  const handlePassTurn = () => {
    sendMessage('pass_turn', {});
  };
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
  console.log('GameScreen Debug:', {
    gameState,
    myPlayer,
    players,
    visualPlayers,
    mySessionId,
    gamePhase,
    phase: gameState?.phase,
    currentPlayerIndex: gameState?.currentPlayerIndex
  });

  useEffect(() => {
    if (!gameState) return;

    // Gérer les phases de jeu
    if (gameState.phase === 'playing') {
      setGamePhase('playing');
    }
  }, [gameState]);

  // Vérifier si c'est mon tour
  const isMyTurn = () => {
    if (!gameState || !myPlayer) return false;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    return currentPlayer?.sessionId === mySessionId;
  };

  // Gestion de la sélection des cartes
  const handleCardSelect = (card) => {
    if (!isMyTurn()) return;
    
    // Si une carte est déjà sélectionnée et c'est la même, la désélectionner
    if (selectedCards.find(c => c.id === card.id)) {
      setSelectedCards([]);
      resetSpecialPowerMode();
      return;
    }
    
    // Sélectionner la nouvelle carte
    setSelectedCards([card]);
    
    // Vérifier si c'est une carte à pouvoir spécial
    if (card.value === CARD_VALUES.QUEEN) {
      setSpecialPowerMode('queen');
      setQueenExchangeTargets([]);
    } else if (card.value === CARD_VALUES.JACK) {
      setSpecialPowerMode('jack');
      setJackTargetPlayer(null);
      setJackGiveCard(null);
    } else {
      resetSpecialPowerMode();
    }
  };

  // Réinitialiser le mode pouvoir spécial
  const resetSpecialPowerMode = () => {
    setSpecialPowerMode(null);
    setQueenExchangeTargets([]);
    setJackTargetPlayer(null);
    setJackGiveCard(null);
  };

  // Validations côté frontend
  const isValidPosition = (row, col) => {
    const maxCols = [0, 4, 3, 2, 1]; // index 0 inutilisé, row1=4, row2=3, row3=2, row4=1
    return row >= 1 && row <= 4 && col >= 0 && col < maxCols[row];
  };

  const getCardAt = (row, col) => {
    if (!gameState?.pyramid) return null;
    const rowKey = `row${row}`;
    return gameState.pyramid[rowKey]?.[col] || null;
  };

  const canPlaceCard = (card, row, col) => {
    if (!isValidPosition(row, col)) return false;
    
    // Vérifier que l'emplacement est vide
    const existingCard = getCardAt(row, col);
    if (existingCard && !existingCard.isEmpty) return false;
    
    // Row 1 : placement libre
    if (row === 1) return true;
    
    // Rows 2-4 : vérifier le support de même famille
    const leftSupportCol = col;
    const rightSupportCol = col + 1;
    const leftSupport = getCardAt(row - 1, leftSupportCol);
    const rightSupport = getCardAt(row - 1, rightSupportCol);
    
    return (leftSupport && leftSupport.suit === card.suit) || 
           (rightSupport && rightSupport.suit === card.suit);
  };

  const canReplaceCard = (newCard, row, col) => {
    if (!isValidPosition(row, col)) return false;
    
    const existingCard = getCardAt(row, col);
    if (!existingCard || existingCard.isEmpty) return false;
    
    // Spécifique rangée 1: valeur >= requise (règle serveur)
    if (row === 1) {
      return (typeof newCard.value === 'number' && typeof existingCard.value === 'number')
        ? newCard.value >= existingCard.value
        : false;
    }
    
    // Règles alignées avec CardService.canReplaceCard côté serveur
    const tN = newCard.type;
    const tE = existingCard.type;
    const vN = newCard.value;
    const vE = existingCard.value;
    if (!tN || !tE) return false;

    if (tN === 'ace' && ['jack', 'queen', 'king'].includes(tE)) return true;
    if (tN === 'ace' && tE === 'ace') return true;
    if (tN === 'ace' && tE === 'number') return false;
    if (tE === 'ace' && tN !== 'ace') return true;
    if (tN === 'number' && tE === 'number') return vN >= vE;
    if (tN === 'jack') return ['ace', 'number', 'jack'].includes(tE);
    if (tN === 'queen') return ['ace', 'number', 'jack', 'queen'].includes(tE);
    if (tN === 'king') return true;
    if (tN === 'number' && ['jack', 'queen', 'king'].includes(tE)) return false;
    return false;
  };

  const getValidAction = (card, row, col) => {
    if (canPlaceCard(card, row, col)) return GAME_ACTIONS.PLACE;
    if (canReplaceCard(card, row, col)) return GAME_ACTIONS.REPLACE;
    return null;
  };

  // Gestion des cibles d'échange pour la Dame
  const handleQueenExchangeSelect = (row, col) => {
    const position = { row, col };
    const existingCard = getCardAt(row, col);
    
    if (!existingCard || existingCard.isEmpty) return; // Peut seulement échanger des cartes existantes
    
    const isAlreadySelected = queenExchangeTargets.some(
      target => target.row === row && target.col === col
    );
    
    if (isAlreadySelected) {
      // Retirer de la sélection
      setQueenExchangeTargets(prev => 
        prev.filter(target => !(target.row === row && target.col === col))
      );
    } else if (queenExchangeTargets.length < 2) {
      // Ajouter à la sélection (max 2)
      setQueenExchangeTargets(prev => [...prev, position]);
    }
  };

  // Gestion de la sélection de joueur cible pour le Valet
  const handleJackPlayerSelect = (player) => {
    if (player.sessionId === mySessionId) return; // Ne peut pas se donner une carte à soi-même
    setJackTargetPlayer(player);
  };

  // Gestion de la sélection de carte à donner pour le Valet
  const handleJackCardSelect = (card) => {
    if (selectedCards[0] && card.id === selectedCards[0].id) return; // Ne peut pas donner la carte jouée
    setJackGiveCard(card);
  };

  // Jouer une carte
  const handlePlayCard = (card, row, col) => {
    if (!isMyTurn() || !card) return;
    
    // Vérifier si c'est une carte à pouvoir spécial
    if (card.value === CARD_VALUES.QUEEN || card.value === CARD_VALUES.JACK) {
      return handleSpecialPowerPlay(card, row, col);
    }
    
    // Jeu normal
    const action = getValidAction(card, row, col);
    if (!action) {
      console.log('Action non valide pour cette position');
      return;
    }
    
    sendMessage('play_card', {
      cardId: card.id,
      action: action,
      target: { row, col }
    });
    
    setSelectedCards([]);
    resetSpecialPowerMode();
    setActionAnimation(true);
    
    // Animation d'action
    setTimeout(() => {
      setActionAnimation(false);
    }, 1000);
  };

  // Jouer une carte à pouvoir spécial
  const handleSpecialPowerPlay = (card, row, col) => {
    // Forcer des littéraux 'place' / 'replace' pour correspondre au backend
    const baseAction = canPlaceCard(card, row, col)
      ? 'place'
      : (canReplaceCard(card, row, col) ? 'replace' : null);
    if (!baseAction) {
      console.log('Position non valide pour placer la carte à pouvoir');
      return;
    }

    if (card.value === CARD_VALUES.QUEEN) {
      if (queenExchangeTargets.length !== 2) {
        console.log('Vous devez sélectionner exactement 2 cartes à échanger');
        return;
      }

      sendMessage('play_card', {
        cardId: card.id,
        action: 'special_power',
        target: {
          baseAction,
          row: row,
          col: col,
          exchangeTargets: queenExchangeTargets
        }
      });
    } else if (card.value === CARD_VALUES.JACK) {
      if (!jackTargetPlayer || !jackGiveCard) {
        console.log('Vous devez sélectionner un joueur et une carte à donner');
        return;
      }

      sendMessage('play_card', {
        cardId: card.id,
        action: 'special_power',
        target: {
          baseAction,
          row: row,
          col: col,
          giveCardId: jackGiveCard.id,
          targetPlayerId: jackTargetPlayer.sessionId
        }
      });
    }

    setSelectedCards([]);
    resetSpecialPowerMode();
    setActionAnimation(true);
    
    setTimeout(() => {
      setActionAnimation(false);
    }, 1000);
  };

  // Gestion du drag & drop
  const handleDragStart = (card) => {
    if (!isMyTurn()) return;
    setDraggedCard(card);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setHoveredSlot(null);
  };

  const handleSlotDragOver = (e, row, col) => {
    e.preventDefault();
    if (!draggedCard) return;
    
    // Si on est en mode Dame et qu'on survole une carte existante
    if (specialPowerMode === 'queen') {
      const existingCard = getCardAt(row, col);
      if (existingCard && !existingCard.isEmpty && queenExchangeTargets.length < 2) {
        setHoveredSlot({ row, col, action: 'exchange' });
        return;
      }
    }
    
    const action = getValidAction(draggedCard, row, col);
    if (action) {
      setHoveredSlot({ row, col, action });
    }
  };

  const handleSlotDragLeave = () => {
    setHoveredSlot(null);
  };

  const handleSlotDrop = (e, row, col) => {
    e.preventDefault();
    if (!draggedCard) return;
    
    handlePlayCard(draggedCard, row, col);
    handleDragEnd();
  };

  // Clic sur slot pour placer une carte sélectionnée
  const handleSlotClick = (row, col) => {
    if (selectedCards.length === 1) {
      const selectedCard = selectedCards[0];
      
      // Si on est en mode Dame et qu'on clique sur la pyramide
      if (specialPowerMode === 'queen') {
        const existingCard = getCardAt(row, col);
        // Tant que 2 cibles d'échange ne sont pas sélectionnées, on sélectionne des cartes existantes
        if (queenExchangeTargets.length < 2) {
          if (existingCard && !existingCard.isEmpty) {
            handleQueenExchangeSelect(row, col);
            return;
          }
        }
      }
      
      handlePlayCard(selectedCard, row, col);
    }
  };

  // Vérifier si une position est sélectionnée pour l'échange (Dame)
  const isQueenExchangeTarget = (row, col) => {
    return queenExchangeTargets.some(target => target.row === row && target.col === col);
  };

  // Rendu d'un joueur
  const renderPlayer = (player, visualIndex) => {
    const isMe = player.sessionId === mySessionId;
    const isCurrentPlayer = gameState?.players[gameState?.currentPlayerIndex]?.sessionId === player.sessionId;
    const isJackTarget = jackTargetPlayer?.sessionId === player.sessionId;
    const canSelectForJack = specialPowerMode === 'jack' && !isMe;
    
    return (
      <motion.div
        key={player.sessionId}
        className="flex flex-col items-center mx-2 sm:mx-3 md:mx-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: visualIndex * 0.2 }}
        onClick={canSelectForJack ? () => handleJackPlayerSelect(player) : undefined}
      >
        {/* Avatar du joueur avec indicateur de tour */}
        <motion.div
          className={`w-12 h-12 sm:w-16 md:w-20 sm:h-16 md:h-20 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl md:text-2xl shadow-lg md:shadow-xl border-2 transition-all duration-300 cursor-pointer
            ${isJackTarget ? 'bg-yellow-600 border-yellow-400 ring-4 ring-yellow-300' :
            isMe ? 'bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900 border-blue-300' : 
            'bg-gradient-to-br from-gray-500 via-gray-700 to-gray-900 border-gray-300'}
            ${isCurrentPlayer ? (isMe ? 'ring-4 ring-green-500 ring-opacity-75' : 'ring-4 ring-yellow-400 ring-opacity-75') : ''} 
            ${canSelectForJack ? 'hover:bg-yellow-500 hover:border-yellow-300' : ''}
            backdrop-blur-md bg-white/20 relative overflow-hidden`}
          whileHover={{ scale: 1.08 }}
          animate={isCurrentPlayer ? (isMe ? { 
            boxShadow: ['0 0 20px rgba(34, 197, 94, 0.6)', '0 0 30px rgba(34, 197, 94, 0.9)', '0 0 20px rgba(34, 197, 94, 0.6)']
          } : { 
            boxShadow: ['0 0 20px rgba(251, 191, 36, 0.5)', '0 0 30px rgba(251, 191, 36, 0.8)', '0 0 20px rgba(251, 191, 36, 0.5)']
          }) : {
            boxShadow: 'none'
          }}
          transition={isCurrentPlayer ? { duration: 2, repeat: Infinity } : { duration: 0.3 }}
        >
          {/* Effet lumineux */}
          <span className="absolute inset-0 rounded-full pointer-events-none" style={{
            boxShadow: isMe
              ? '0 0 24px 6px rgba(59,130,246,0.25)'
              : '0 0 24px 6px rgba(156,163,175,0.18)'
          }} />
          <span className="z-10 text-white drop-shadow-lg">
            {player.pseudo?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </motion.div>
        
        {/* Nom du joueur + indices pour debug */}
        <div className={`mt-1 sm:mt-2 text-xs sm:text-sm md:text-base font-semibold ${
          isJackTarget ? 'text-yellow-300' : 
          isMe ? 'text-blue-300' : 'text-gray-300'
        } drop-shadow-sm`}>
          {isMe ? 'Vous' : player.pseudo}
          {isCurrentPlayer && <div className="text-[10px] sm:text-xs text-yellow-300">À jouer</div>}
          {isJackTarget && <div className="text-[10px] sm:text-xs text-yellow-300">Cible</div>}
        </div>
        
        {/* Indicateur de cartes en main */}
        {player.handSize > 0 && (
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-gray-400 bg-white/10 rounded-full px-1.5 sm:px-2 py-0.5 shadow-sm">
            {player.handSize} carte{player.handSize > 1 ? 's' : ''}
          </div>
        )}
        
        {/* Animation d'action */}
        <AnimatePresence>
          {actionAnimation && isCurrentPlayer && (
            <motion.div
              className="absolute top-0 w-6 h-6 bg-green-500 rounded-full"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                scale: [0, 1.5, 1.5, 0],
                y: [-20, -40, -40, -60]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Pyramide des ennemis au centre
  const renderEnemyPyramid = () => (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ marginTop: '-40px' }}>
      <motion.div
        className="relative"
        initial={{ scale: 0, rotate: 180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        {/* Pyramide d'ennemis - structure en triangle avec emplacements */}
        <div className="flex flex-col items-center gap-2">
          {/* Rangée du haut - 1 emplacement */}
          <div className="flex gap-1">
            {[...Array(1)].map((_, index) => {
              const enemy = gameState?.pyramid?.row4?.[index];
              const hasCard = enemy && !enemy.isEmpty;
              const row = 4, col = index;
              const isHovered = hoveredSlot?.row === row && hoveredSlot?.col === col;
              const canDrop = draggedCard && getValidAction(draggedCard, row, col);
              const canClick = selectedCards.length === 1 && getValidAction(selectedCards[0], row, col);
              const isExchangeTarget = isQueenExchangeTarget(row, col);
              const canSelectForExchange = specialPowerMode === 'queen' && hasCard && queenExchangeTargets.length < 2;
              
              return (
                <motion.div
                  key={`row4-${index}`}
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-16 h-20 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                    isExchangeTarget ? 'border-purple-400 bg-purple-400 bg-opacity-30 ring-2 ring-purple-300' :
                    isHovered && canDrop ? 
                      (hoveredSlot.action === 'place' ? 'border-green-400 bg-green-400 bg-opacity-20' : 'border-orange-400 bg-orange-400 bg-opacity-20') :
                    canClick ? 'border-blue-400 bg-blue-400 bg-opacity-10' :
                    canSelectForExchange ? 'border-purple-300 bg-purple-300 bg-opacity-10' :
                    hasCard ? 'border-gray-300' : 'border-dashed border-gray-500'
                  }`}
                  onDragOver={(e) => handleSlotDragOver(e, row, col)}
                  onDragLeave={handleSlotDragLeave}
                  onDrop={(e) => handleSlotDrop(e, row, col)}
                  onClick={() => handleSlotClick(row, col)}
                  whileHover={canClick || canDrop ? { scale: 1.05 } : {}}
                >
                  {hasCard ? (
                    <Card 
                      card={enemy}
                      size="small"
                      className="shadow-lg border border-gray-300 pointer-events-none"
                    />
                  ) : (
                    <div className="text-gray-500 text-xs pointer-events-none">4</div>
                  )}
                </motion.div>
              );
            })}
          </div>
          
          {/* Rangée 2 - 2 emplacements */}
          <div className="flex gap-1">
            {[...Array(2)].map((_, index) => {
              const enemy = gameState?.pyramid?.row3?.[index];
              const hasCard = enemy && !enemy.isEmpty;
              const row = 3, col = index;
              const isHovered = hoveredSlot?.row === row && hoveredSlot?.col === col;
              const canDrop = draggedCard && getValidAction(draggedCard, row, col);
              const canClick = selectedCards.length === 1 && getValidAction(selectedCards[0], row, col);
              const isExchangeTarget = isQueenExchangeTarget(row, col);
              const canSelectForExchange = specialPowerMode === 'queen' && hasCard && queenExchangeTargets.length < 2;
              
              return (
                <motion.div
                  key={`row3-${index}`}
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: (index + 1) * 0.1 }}
                  className={`w-16 h-20 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                    isExchangeTarget ? 'border-purple-400 bg-purple-400 bg-opacity-30 ring-2 ring-purple-300' :
                    isHovered && canDrop ? 
                      (hoveredSlot.action === 'place' ? 'border-green-400 bg-green-400 bg-opacity-20' : 'border-orange-400 bg-orange-400 bg-opacity-20') :
                    canClick ? 'border-blue-400 bg-blue-400 bg-opacity-10' :
                    canSelectForExchange ? 'border-purple-300 bg-purple-300 bg-opacity-10' :
                    hasCard ? 'border-gray-300' : 'border-dashed border-gray-500'
                  }`}
                  onDragOver={(e) => handleSlotDragOver(e, row, col)}
                  onDragLeave={handleSlotDragLeave}
                  onDrop={(e) => handleSlotDrop(e, row, col)}
                  onClick={() => handleSlotClick(row, col)}
                  whileHover={canClick || canDrop ? { scale: 1.05 } : {}}
                >
                  {hasCard ? (
                    <Card 
                      card={enemy}
                      size="small"
                      className="shadow-lg border border-gray-300 pointer-events-none"
                    />
                  ) : (
                    <div className="text-gray-500 text-xs pointer-events-none">3</div>
                  )}
                </motion.div>
              );
            })}
          </div>
          
          {/* Rangée 3 - 3 emplacements */}
          <div className="flex gap-1">
            {[...Array(3)].map((_, index) => {
              const enemy = gameState?.pyramid?.row2?.[index];
              const hasCard = enemy && !enemy.isEmpty;
              const row = 2, col = index;
              const isHovered = hoveredSlot?.row === row && hoveredSlot?.col === col;
              const canDrop = draggedCard && getValidAction(draggedCard, row, col);
              const canClick = selectedCards.length === 1 && getValidAction(selectedCards[0], row, col);
              const isExchangeTarget = isQueenExchangeTarget(row, col);
              const canSelectForExchange = specialPowerMode === 'queen' && hasCard && queenExchangeTargets.length < 2;
              
              return (
                <motion.div
                  key={`row2-${index}`}
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: (index + 3) * 0.1 }}
                  className={`w-16 h-20 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                    isExchangeTarget ? 'border-purple-400 bg-purple-400 bg-opacity-30 ring-2 ring-purple-300' :
                    isHovered && canDrop ? 
                      (hoveredSlot.action === 'place' ? 'border-green-400 bg-green-400 bg-opacity-20' : 'border-orange-400 bg-orange-400 bg-opacity-20') :
                    canClick ? 'border-blue-400 bg-blue-400 bg-opacity-10' :
                    canSelectForExchange ? 'border-purple-300 bg-purple-300 bg-opacity-10' :
                    hasCard ? 'border-gray-300' : 'border-dashed border-gray-500'
                  }`}
                  onDragOver={(e) => handleSlotDragOver(e, row, col)}
                  onDragLeave={handleSlotDragLeave}
                  onDrop={(e) => handleSlotDrop(e, row, col)}
                  onClick={() => handleSlotClick(row, col)}
                  whileHover={canClick || canDrop ? { scale: 1.05 } : {}}
                >
                  {hasCard ? (
                    <Card 
                      card={enemy}
                      size="small"
                      className="shadow-lg border border-gray-300 pointer-events-none"
                    />
                  ) : (
                    <div className="text-gray-500 text-xs pointer-events-none">2</div>
                  )}
                </motion.div>
              );
            })}
          </div>
          
          {/* Rangée du bas - 4 emplacements */}
          <div className="flex gap-1">
            {[...Array(4)].map((_, index) => {
              const enemy = gameState?.pyramid?.row1?.[index];
              const hasCard = enemy && !enemy.isEmpty;
              const row = 1, col = index;
              const isHovered = hoveredSlot?.row === row && hoveredSlot?.col === col;
              const canDrop = draggedCard && getValidAction(draggedCard, row, col);
              const canClick = selectedCards.length === 1 && getValidAction(selectedCards[0], row, col);
              const isExchangeTarget = isQueenExchangeTarget(row, col);
              const canSelectForExchange = specialPowerMode === 'queen' && hasCard && queenExchangeTargets.length < 2;
              
              return (
                <motion.div
                  key={`row1-${index}`}
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: (index + 6) * 0.1 }}
                  className={`w-16 h-20 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                    isExchangeTarget ? 'border-purple-400 bg-purple-400 bg-opacity-30 ring-2 ring-purple-300' :
                    isHovered && canDrop ? 
                      (hoveredSlot.action === 'place' ? 'border-green-400 bg-green-400 bg-opacity-20' : 'border-orange-400 bg-orange-400 bg-opacity-20') :
                    canClick ? 'border-blue-400 bg-blue-400 bg-opacity-10' :
                    canSelectForExchange ? 'border-purple-300 bg-purple-300 bg-opacity-10' :
                    hasCard ? 'border-gray-300' : 'border-dashed border-gray-500'
                  }`}
                  onDragOver={(e) => handleSlotDragOver(e, row, col)}
                  onDragLeave={handleSlotDragLeave}
                  onDrop={(e) => handleSlotDrop(e, row, col)}
                  onClick={() => handleSlotClick(row, col)}
                  whileHover={canClick || canDrop ? { scale: 1.05 } : {}}
                >
                  {hasCard ? (
                    <Card 
                      card={enemy}
                      size="small"
                      className="shadow-lg border border-gray-300 pointer-events-none"
                    />
                  ) : (
                    <div className="text-gray-500 text-xs pointer-events-none">1</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col">


      {/* Titre et informations en haut au milieu - responsive */}
      <div className="w-full text-center pt-2 sm:pt-4 px-4 z-20">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">
          Partie en cours
        </h2>
        {/* Texte dynamique uniquement sur desktop */}
        <div className="hidden sm:block">
          {specialPowerMode === 'queen' && (
            <p className="text-xs sm:text-sm text-purple-300 font-medium">
              Mode Dame : Sélectionnez 2 cartes à échanger
            </p>
          )}
          {specialPowerMode === 'jack' && (
            <p className="text-xs sm:text-sm text-yellow-300 font-medium">
              Mode Valet : Sélectionnez un joueur et une carte à donner de votre main
            </p>
          )}
          {!specialPowerMode && isMyTurn() && myPlayer?.hand?.length > 0 && (
            <p className="text-xs sm:text-sm text-green-300">
              C'est votre tour ! Sélectionnez une carte à jouer
            </p>
          )}
          {!isMyTurn() && (
            <p className="text-xs sm:text-sm text-gray-300">
              En attente de {gameState?.players[gameState?.currentPlayerIndex]?.pseudo || 'un joueur'}
            </p>
          )}
        </div>
      </div>

      {/* Cercles des joueurs - responsive: centré sous le titre en dessous de 1300px, en haut à droite au-dessus */}
      <div className="w-full flex justify-center items-center mt-3 sm:mt-4 xl:mt-0 xl:absolute xl:top-2 xl:right-2 xl:w-auto z-20 flex-wrap">
        {visualPlayers.map((player, visualIndex) => renderPlayer(player, visualIndex))}
      </div>

      {/* Pyramide des ennemis au centre */}
      <div className="flex-1 flex items-center justify-center">
        {renderEnemyPyramid()}
      </div>

      {/* Main du joueur en 2 lignes sur mobile - entre pyramide et bas */}
      {myPlayer?.hand?.length > 0 && (
        <div className="sm:hidden w-full pb-4">
          {/* Bouton Annuler le coup pour les pouvoirs spéciaux */}
          {specialPowerMode && (
            <div className="w-full flex justify-center mb-2">
              <Button
                onClick={() => {
                  setSelectedCards([]);
                  resetSpecialPowerMode();
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm shadow-lg"
              >
                Annuler le coup
              </Button>
            </div>
          )}
          
          <PlayerHandPlayPhase
            hand={myPlayer.hand}
            selectedCards={selectedCards}
            onCardSelect={(card) => {
              if (specialPowerMode === 'jack' && !selectedCards.find(c => c.id === card.id)) {
                handleJackCardSelect(card);
              } else {
                handleCardSelect(card);
              }
            }}
            jackGiveCard={jackGiveCard}
            specialPowerMode={specialPowerMode}
            isMyTurn={isMyTurn()}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        </div>
      )}




      {/* Barre inférieure avec Emoji - responsive */}
      <div className="w-full pb-2 sm:pb-4 md:pb-8">
        {/* Version mobile (< 640px) : disposition avec éléments poussés aux bords */}
        <div className="sm:hidden flex justify-between items-center px-4 gap-2">
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

          {/* Texte dynamique au centre */}
          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-[60%]">
              {specialPowerMode === 'queen' && (
                <span className="text-sm text-purple-300 font-semibold text-center block">
                  {queenExchangeTargets.length < 2 
                    ? `Mode Dame : Sélectionnez 2 cartes à échanger (${queenExchangeTargets.length}/2)`
                    : 'Cliquez sur un emplacement pour poser la Dame'
                  }
                </span>
              )}
              {specialPowerMode === 'jack' && (
                <span className="text-sm text-yellow-300 font-semibold text-center block">
                  Mode Valet : Sélectionnez un joueur et une carte de votre main à donner puis cliquez sur un emplacement.
                </span>
              )}
              {!specialPowerMode && isMyTurn() && myPlayer?.hand?.length > 0 && (
                <span className="text-sm text-green-300 font-semibold text-center block">
                  C'est votre tour ! Sélectionnez une carte à jouer
                </span>
              )}
              {!isMyTurn() && (
                <span className="text-sm text-gray-300 font-semibold text-center block">
                  En attente de {gameState?.players[gameState?.currentPlayerIndex]?.pseudo || 'un joueur'}
                </span>
              )}
            </div>
          </div>

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

        {/* Version desktop (>= 640px) : positions absolues et main en ligne */}
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

          {/* Zone de jeu en bas - Main du joueur */}
          {myPlayer?.hand?.length > 0 && (
            <motion.div
              className="w-full flex flex-col items-center"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Bouton Passer son tour */}
              {isMyTurn() && !canPlayAnyCard() && (
                <div className="mb-2">
                  <Button
                    onClick={handlePassTurn}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg shadow-lg"
                  >
                    Passer son tour
                  </Button>
                  <div className="text-xs text-yellow-300 mt-1">Aucune action possible, passez votre tour</div>
                </div>
              )}
              {/* Cartes en ligne droite */}
              <div className="flex justify-center items-end gap-0.5 sm:gap-1 mb-2 sm:mb-4 overflow-visible px-2 max-w-full md:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
                {myPlayer.hand.map((card, index) => {
                  const isSelected = selectedCards.find(c => c.id === card.id);
                  const isJackGiveSelected = jackGiveCard?.id === card.id;
                  const canSelectForJack = specialPowerMode === 'jack' && !isSelected;
                  
                  const handleCardClick = () => {
                    if (specialPowerMode === 'jack' && !isSelected) {
                      handleJackCardSelect(card);
                    } else {
                      handleCardSelect(card);
                    }
                  };
                  
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
                        zIndex: isSelected || isJackGiveSelected ? 40 : 10 + index
                      }}
                      className="flex-shrink-0"
                    >
                      <Card
                        card={card}
                        isSelected={isSelected || isJackGiveSelected}
                        onClick={handleCardClick}
                        size="large"
                        className={`transition-all duration-200 scale-90 sm:scale-110 md:scale-150 ${
                          isJackGiveSelected ? 'ring-2 ring-yellow-400 ring-opacity-75 shadow-2xl' :
                          isSelected ? 'ring-2 ring-blue-400 ring-opacity-75 shadow-2xl' : 
                          canSelectForJack ? 'ring-1 ring-yellow-300 ring-opacity-50 shadow-lg hover:ring-2' :
                          'shadow-lg'
                        }`}
                        draggable={isMyTurn()}
                        onDragStart={() => handleDragStart(card)}
                        onDragEnd={handleDragEnd}
                      />
                    </motion.div>
                  );
                })}
              </div>

              {/* Instructions de jeu */}
              <div className="text-center text-xs sm:text-sm text-gray-300">
                {specialPowerMode === 'queen' ? (
                  <div className="text-purple-300">
                    <div className="font-medium">Pouvoir de la Dame</div>
                    <div>Sélectionnez 2 cartes dans la pyramide à échanger ({queenExchangeTargets.length}/2)</div>
                    {queenExchangeTargets.length === 2 && (
                      <div className="text-green-300 mt-1">Cliquez sur un emplacement pour placer la Dame</div>
                    )}
                  </div>
                ) : specialPowerMode === 'jack' ? (
                  <div className="text-yellow-300">
                    <div className="font-medium">Pouvoir du Valet</div>
                    <div>
                      1. Sélectionnez un joueur cible {jackTargetPlayer ? '✓' : ''}
                    </div>
                    <div>
                      2. Sélectionnez une carte à donner {jackGiveCard ? '✓' : ''}
                    </div>
                    {jackTargetPlayer && jackGiveCard && (
                      <div className="text-green-300 mt-1">Cliquez sur un emplacement pour placer le Valet</div>
                    )}
                  </div>
                ) : selectedCards.length > 0 ? (
                  <span className="text-blue-300">
                    Cliquez sur un emplacement de la pyramide ou glissez-déposez la carte
                  </span>
                ) : (
                  <span>
                    Sélectionnez une carte pour jouer
                  </span>
                )}
              </div>

              {/* Bouton d'annulation pour les pouvoirs spéciaux */}
              {specialPowerMode && (
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={() => {
                      setSelectedCards([]);
                      resetSpecialPowerMode();
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    Annuler
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

    

      {/* Message d'état de base */}
      {gamePhase === 'waiting' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-white text-xl mb-4">En attente du début de la partie...</div>
          <div className="text-gray-400">Phase actuelle: {gameState?.phase}</div>
        </div>
      )}

      {/* Indicateur de santé/score */}
      {gameState?.health !== undefined && (
        <div className="absolute top-4 right-4 text-right">
          <div className="text-white text-sm">
            Santé: {gameState.health}
          </div>
          <div className="w-32 h-2 bg-gray-700 rounded-full mt-1">
            <motion.div
              className="h-full bg-red-500 rounded-full"
              initial={{ width: '100%' }}
              animate={{ 
                width: `${Math.max(0, (gameState.health / (gameState.maxHealth || 100)) * 100)}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GameScreen;
