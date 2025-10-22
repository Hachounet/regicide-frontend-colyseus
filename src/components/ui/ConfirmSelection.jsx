import React from 'react';
import { motion } from 'framer-motion';

const ConfirmSelection = ({
  selectedCount = 0,
  requiredCount = 1,
  onClick,
  disabled = false,
  className = ''
}) => {
  const isReady = selectedCount === requiredCount && selectedCount > 0;
  const isDisabled = disabled || !isReady;

  const baseClasses = `
    inline-flex
    items-center
    justify-center
    font-bold
    text-lg
    px-8
    py-4
    rounded-xl
    transition-all
    duration-300
    focus:outline-none
    focus:ring-4
    focus:ring-offset-2
    min-w-[280px]
    relative
    overflow-hidden
  `;

  const variantClasses = isReady
    ? `
        bg-gradient-to-r
        from-green-500
        to-green-600
        hover:from-green-600
        hover:to-green-700
        text-white
        shadow-lg
        hover:shadow-xl
        focus:ring-green-300
        border-2
        border-green-400
        hover:border-green-500
      `
    : `
        bg-gradient-to-r
        from-gray-500
        to-gray-600
        text-gray-300
        shadow-md
        border-2
        border-gray-400
        cursor-not-allowed
      `;

  const buttonClasses = `${baseClasses} ${variantClasses} ${className}`.replace(/\s+/g, ' ').trim();

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: isReady ? 1.05 : 1 },
    tap: { scale: isReady ? 0.95 : 1 },
    ready: {
      scale: 1,
      boxShadow: isReady ? "0 0 20px rgba(34, 197, 94, 0.5)" : "none"
    }
  };

  const glowVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      scale: [1, 1.1, 1],
    }
  };

  return (
    <motion.button
      className={buttonClasses}
      onClick={isReady ? onClick : undefined}
      disabled={isDisabled}
      variants={buttonVariants}
      initial="initial"
      whileHover={!isDisabled ? "hover" : undefined}
      whileTap={!isDisabled ? "tap" : undefined}
      animate="ready"
    >
      {/* Effet de lueur quand prêt */}
      {isReady && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 rounded-xl opacity-30"
          variants={glowVariants}
          animate="animate"
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* Contenu du bouton */}
      <div className="relative z-10 flex items-center space-x-3">
        {/* Icône de validation */}
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
          isReady 
            ? 'border-white bg-white text-green-600' 
            : 'border-gray-400 text-gray-400'
        }`}>
          {isReady && (
            <motion.svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </motion.svg>
          )}
        </div>
        
        {/* Texte du bouton */}
        <span className="font-bold">
          {isReady ? 'Confirmer la sélection' : 'Sélectionnez vos cartes'}
        </span>
        
        {/* Compteur */}
        <div className={`px-3 py-1 rounded-full text-sm font-bold transition-all duration-300 ${
          isReady 
            ? 'bg-white text-green-600' 
            : 'bg-gray-700 text-gray-300'
        }`}>
          {selectedCount}/{requiredCount}
        </div>
      </div>
      
      {/* Animation de particules quand prêt */}
      {isReady && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-70"
              style={{
                left: `${20 + i * 30}%`,
                top: '50%'
              }}
              animate={{
                y: [-10, -20, -10],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </>
      )}
    </motion.button>
  );
};

export default ConfirmSelection;