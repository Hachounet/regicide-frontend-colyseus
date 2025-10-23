import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  getCardDisplayValue
} from '../../utils/gameRules.js';

// Fonction pour obtenir le chemin de l'image d'une carte
const getCardImagePath = (card) => {
  if (!card || card.value === undefined || card.value === null || !card.suit) {
    return new URL('../../assets/cards/back_blue.png', import.meta.url).href;
  }

  let value = card.value;
  let suit = card.suit.toLowerCase();

  // Conversion des valeurs spéciales
  switch (card.value) {
    case 1:
      value = 'ace';
      break;
    case 11:
      value = 'jack';
      break;
    case 12:
      value = 'queen';
      break;
    case 13:
      value = 'king';
      break;
    default:
      // Vérifier que value est bien défini avant de faire toString()
      if (card.value !== undefined && card.value !== null) {
        value = card.value.toString();
      } else {
        return new URL('../../assets/cards/back_blue.png', import.meta.url).href;
      }
  }

  // Conversion des couleurs en anglais
  switch (suit) {
    case 'coeur':
    case 'coeurs':
    case 'heart':
      suit = 'hearts';
      break;
    case 'carreau':
    case 'carreaux':
    case 'diamond':
      suit = 'diamonds';
      break;
    case 'trèfle':
    case 'trefle':
    case 'trèfles':
    case 'trefles':
    case 'club':
      suit = 'clubs';
      break;
    case 'pique':
    case 'piques':
    case 'spade':
      suit = 'spades';
      break;
  }

  const fileName = `${value}_${suit}.png`;
  return new URL(`../../assets/cards/${fileName}`, import.meta.url).href;
};

const Card = ({
  card,
  isSelected = false,
  isValidMove = false,
  isDisabled = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className = '',
  size = 'medium',
  showBack = false // Nouvelle prop pour afficher le dos de la carte
}) => {
  // Si pas de carte ou carte invalide, afficher le dos
  const shouldShowBack = showBack || !card || card.value === undefined || card.value === null;
  
  const cardImagePath = shouldShowBack ? 
    new URL('../../assets/cards/back_blue.png', import.meta.url).href : 
    getCardImagePath(card);
  
  const sizeClasses = {
    small: 'w-10 h-14 sm:w-12 sm:h-16',
    medium: 'w-16 h-24',
    large: 'w-20 h-28',
    xlarge: 'w-24 h-36'
  };

  const cardClasses = `
    ${sizeClasses[size]}
    card-base
    relative
    rounded-lg
    shadow-md
    transition-all
    duration-200
    ${isSelected ? 'card-selected transform -translate-y-2 shadow-lg scale-110' : ''}
    ${isValidMove ? 'card-valid-move ring-2 ring-green-500 ring-opacity-50' : ''}
    ${isDisabled ? 'card-invalid-move opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}
    ${className}
  `.trim();

  const cardVariants = {
    initial: { scale: 1, y: 0 },
    hover: { scale: 1.05, y: -4 },
    selected: { scale: 1.1, y: -8 },
    disabled: { opacity: 0.5 }
  };

  return (
    <motion.div
      className={cardClasses}
      variants={cardVariants}
      initial="initial"
      animate={
        isDisabled ? "disabled" : 
        isSelected ? "selected" : 
        "initial"
      }
      whileHover={!isDisabled ? "hover" : undefined}
      onClick={!isDisabled ? onClick : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      layout
    >
      {/* Image de la carte */}
      <img 
        src={cardImagePath}
        alt={showBack ? 'Dos de carte' : `${getCardDisplayValue(card)} de ${card?.suit || 'inconnue'}`}
        className="w-full h-full object-cover rounded-lg"
        draggable={false}
      />
      
      {/* Indicateurs visuels */}
      {isSelected && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
      )}
      
      {isValidMove && (
        <motion.div
          className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
        />
      )}
    </motion.div>
  );
};

export default Card;
