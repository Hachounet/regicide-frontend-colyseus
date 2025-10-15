import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  getCardDisplayValue, 
  getSuitSymbol, 
  isRedCard 
} from '../../utils/gameRules.js';

const Card = ({
  card,
  isSelected = false,
  isValidMove = false,
  isDisabled = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className = '',
  size = 'medium'
}) => {
  const displayValue = getCardDisplayValue(card);
  const suitSymbol = getSuitSymbol(card.suit);
  const isRed = isRedCard(card);
  
  const sizeClasses = {
    small: 'w-12 h-16 text-xs',
    medium: 'w-16 h-24 text-sm',
    large: 'w-20 h-28 text-base'
  };

  const cardClasses = `
    ${sizeClasses[size]}
    card-base
    bg-white
    border-2
    rounded-lg
    shadow-md
    flex
    flex-col
    items-center
    justify-between
    p-2
    transition-all
    duration-200
    ${isSelected ? 'card-selected border-blue-500 transform -translate-y-2 shadow-lg' : ''}
    ${isValidMove ? 'card-valid-move border-green-500 ring-2 ring-green-500 ring-opacity-50' : ''}
    ${isDisabled ? 'card-invalid-move opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}
    ${isRed ? 'text-red-600' : 'text-gray-800'}
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
      {/* Valeur en haut à gauche */}
      <div className="self-start font-bold leading-none">
        {displayValue}
      </div>
      
      {/* Symbole au centre */}
      <div className="text-2xl font-bold">
        {suitSymbol}
      </div>
      
      {/* Valeur en bas à droite (inversée) */}
      <div className="self-end font-bold leading-none transform rotate-180">
        {displayValue}
      </div>
      
      {/* Indicateurs visuels */}
      {isSelected && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
      )}
      
      {isValidMove && (
        <motion.div
          className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
        />
      )}
    </motion.div>
  );
};

export default Card;
