import { CARD_VALUES, SUITS, CARD_TYPES } from '../types/game.js';

/**
 * Obtient une carte à une position donnée dans la pyramide
 */
export const getPyramidCardAt = (pyramid, position) => {
  if (!pyramid) return null;

  const { row, col } = position;

  switch (row) {
    case 1:
      return pyramid.row1[col] || null;
    case 2:
      return pyramid.row2[col] || null;
    case 3:
      return pyramid.row3[col] || null;
    case 4:
      return pyramid.row4[col] || null;
    default:
      return null;
  }
};

/**
 * Vérifie si une carte peut remplacer une autre selon la hiérarchie
 */
export const canReplaceCard = (newCard, existingCard) => {
  // As peut remplacer Valet/Dame/Roi (cycle spécial)
  if (
    newCard.type === CARD_TYPES.ACE &&
    [CARD_TYPES.JACK, CARD_TYPES.QUEEN, CARD_TYPES.KING].includes(existingCard.type)
  ) {
    return true;
  }

  // As vs As
  if (newCard.type === CARD_TYPES.ACE && existingCard.type === CARD_TYPES.ACE) {
    return true;
  }

  // As vs Nombres : As est battu
  if (newCard.type === CARD_TYPES.ACE && existingCard.type === CARD_TYPES.NUMBER) {
    return false;
  }

  // Tout bat As (sauf As)
  if (existingCard.type === CARD_TYPES.ACE && newCard.type !== CARD_TYPES.ACE) {
    return true;
  }

  // Nombres vs Nombres
  if (newCard.type === CARD_TYPES.NUMBER && existingCard.type === CARD_TYPES.NUMBER) {
    return newCard.value >= existingCard.value;
  }

  // Têtes
  if (newCard.type === CARD_TYPES.JACK) {
    return [CARD_TYPES.ACE, CARD_TYPES.NUMBER, CARD_TYPES.JACK].includes(existingCard.type);
  }

  if (newCard.type === CARD_TYPES.QUEEN) {
    return [
      CARD_TYPES.ACE,
      CARD_TYPES.NUMBER,
      CARD_TYPES.JACK,
      CARD_TYPES.QUEEN,
    ].includes(existingCard.type);
  }

  if (newCard.type === CARD_TYPES.KING) {
    return true; // Roi remplace tout
  }

  return false;
};

/**
 * Vérifie si une carte peut être placée à une position donnée
 */
export const canPlaceCardAt = (card, position, pyramid) => {
  const { row, col } = position;

  // Vérifier que la position est valide
  if (row < 1 || row > 4) return false;
  
  const maxCol = getMaxColForRow(row);
  if (col < 0 || col >= maxCol) return false;

  const existingCard = getPyramidCardAt(pyramid, position);

  if (existingCard) {
    // Position occupée - vérifier remplacement
    return canReplaceCard(card, existingCard);
  } else {
    // Position vide - vérifier placement
    if (row === 1) {
      // Base de la pyramide - placement libre
      return true;
    } else {
      // Rangées supérieures - vérifier supports
      const leftSupport = getPyramidCardAt(pyramid, { row: row - 1, col });
      const rightSupport = getPyramidCardAt(pyramid, { row: row - 1, col: col + 1 });

      // Au moins un support de la même famille
      return !!(
        (leftSupport && leftSupport.suit === card.suit) ||
        (rightSupport && rightSupport.suit === card.suit)
      );
    }
  }
};

/**
 * Obtient le nombre maximum de colonnes pour une rangée
 */
export const getMaxColForRow = (row) => {
  switch (row) {
    case 1: return 4;
    case 2: return 3;
    case 3: return 2;
    case 4: return 1;
    default: return 0;
  }
};

/**
 * Calcule tous les mouvements valides pour une carte
 */
export const getValidMoves = (card, pyramid) => {
  const validMoves = [];

  for (let row = 1; row <= 4; row++) {
    const maxCol = getMaxColForRow(row);
    
    for (let col = 0; col < maxCol; col++) {
      const position = { row, col };
      
      if (canPlaceCardAt(card, position, pyramid)) {
        validMoves.push(position);
      }
    }
  }

  return validMoves;
};

/**
 * Calcule le score d'un joueur
 */
export const calculateScore = (player, pyramid) => {
  if (!player.secretKing || !pyramid) return 0;

  const playerSuit = player.secretKing.suit;
  let totalScore = 0;

  // Parcourir toutes les rangées de la pyramide
  for (let row = 1; row <= 4; row++) {
    const multiplier = row;
    const rowCards = getRowCards(pyramid, row);

    rowCards.forEach((card) => {
      if (card && card.suit === playerSuit) {
        totalScore += card.value * multiplier;
      }
    });
  }

  return totalScore;
};

/**
 * Obtient toutes les cartes d'une rangée
 */
export const getRowCards = (pyramid, row) => {
  switch (row) {
    case 1: return pyramid.row1;
    case 2: return pyramid.row2;
    case 3: return pyramid.row3;
    case 4: return pyramid.row4;
    default: return [];
  }
};

/**
 * Vérifie si une position est valide pour l'échange (pouvoir Dame)
 */
export const isValidExchangeTarget = (position, pyramid) => {
  const card = getPyramidCardAt(pyramid, position);
  return card !== null; // Peut seulement échanger des cartes existantes
};

/**
 * Vérifie si deux positions peuvent être échangées (pouvoir Dame)
 */
export const canExchangePositions = (pos1, pos2, pyramid) => {
  return (
    isValidExchangeTarget(pos1, pyramid) && 
    isValidExchangeTarget(pos2, pyramid) &&
    !(pos1.row === pos2.row && pos1.col === pos2.col) // Positions différentes
  );
};

/**
 * Obtient toutes les positions occupées dans la pyramide
 */
export const getOccupiedPositions = (pyramid) => {
  const positions = [];

  for (let row = 1; row <= 4; row++) {
    const maxCol = getMaxColForRow(row);
    
    for (let col = 0; col < maxCol; col++) {
      const position = { row, col };
      const card = getPyramidCardAt(pyramid, position);
      
      if (card) {
        positions.push(position);
      }
    }
  }

  return positions;
};

/**
 * Vérifie si la pyramide est complète
 */
export const isPyramidComplete = (pyramid) => {
  const totalSlots = 4 + 3 + 2 + 1; // 10 emplacements total
  return pyramid.totalCards === totalSlots;
};

/**
 * Obtient l'affichage d'une valeur de carte
 */
export const getCardDisplayValue = (card) => {
  switch (card.value) {
    case CARD_VALUES.ACE:
      return 'A';
    case CARD_VALUES.JACK:
      return 'J';
    case CARD_VALUES.QUEEN:
      return 'Q';
    case CARD_VALUES.KING:
      return 'K';
    default:
      return card.value.toString();
  }
};

/**
 * Obtient le symbole d'une famille
 */
export const getSuitSymbol = (suit) => {
  switch (suit) {
    case SUITS.HEARTS:
      return '♥';
    case SUITS.DIAMONDS:
      return '♦';
    case SUITS.CLUBS:
      return '♣';
    case SUITS.SPADES:
      return '♠';
    default:
      return '';
  }
};

/**
 * Obtient la couleur d'une famille
 */
export const getSuitColor = (suit) => {
  return [SUITS.HEARTS, SUITS.DIAMONDS].includes(suit) ? 'red' : 'black';
};

/**
 * Vérifie si c'est une carte rouge
 */
export const isRedCard = (card) => {
  return getSuitColor(card.suit) === 'red';
};

/**
 * Formate un nom de joueur pour l'affichage
 */
export const formatPlayerName = (pseudo, maxLength = 12) => {
  if (pseudo.length <= maxLength) return pseudo;
  return pseudo.substring(0, maxLength - 3) + '...';
};

/**
 * Obtient la classe CSS pour une famille de carte
 */
export const getSuitClass = (suit) => {
  switch (suit) {
    case SUITS.HEARTS:
      return 'text-red-500';
    case SUITS.DIAMONDS:
      return 'text-red-500';
    case SUITS.CLUBS:
      return 'text-gray-800';
    case SUITS.SPADES:
      return 'text-gray-800';
    default:
      return 'text-gray-500';
  }
};
