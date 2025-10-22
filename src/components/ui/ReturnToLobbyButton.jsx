import React from 'react';
import { motion } from 'framer-motion';

/**
 * Bouton simple et élégant pour retourner au lobby
 * Design minimaliste et professionnel
 */
const ReturnToLobbyButton = ({ onClick, className = '' }) => {
  return (
    <motion.button
      onClick={onClick}
      className={`
        relative w-full
        bg-white/10 backdrop-blur-sm
        hover:bg-white/20
        text-white font-medium
        px-6 py-3 sm:px-8 sm:py-3.5
        rounded-lg
        border border-white/20
        hover:border-white/40
        transition-all duration-300
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base">
        <svg 
          className="w-4 h-4 sm:w-5 sm:h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 19l-7-7m0 0l7-7m-7 7h18" 
          />
        </svg>
        <span>Retour au lobby</span>
      </span>
    </motion.button>
  );
};

export default ReturnToLobbyButton;
