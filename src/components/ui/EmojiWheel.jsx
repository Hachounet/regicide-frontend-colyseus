import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EmojiWheel = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const emojis = [
    { emoji: '😊', label: 'Content' },
    { emoji: '😢', label: 'Triste' },
    { emoji: '😡', label: 'Colère' },
    { emoji: '😮', label: 'Surpris' },
    { emoji: '😴', label: 'Fatigué' },
    { emoji: '🤔', label: 'Réfléchi' }
  ];

  const handleEmojiSelect = (emojiData) => {
    console.log(`Emoji sélectionné: ${emojiData.emoji} (${emojiData.label})`);
    setIsOpen(false);
    // Ici vous pouvez ajouter la logique pour envoyer l'emoji aux autres joueurs
  };

  const getEmojiPosition = (index, totalEmojis) => {
    // Cercle complet à 360°
    const angle = (index * 360) / totalEmojis;
    const radius = 60;
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    return { x, y };
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bouton principal de la roue */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        🎭
      </motion.button>

      {/* Roue des emojis */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay pour fermer en cliquant à côté */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Cercle de fond */}
            <motion.div
              className="absolute w-32 h-32 bg-black bg-opacity-50 rounded-full border-2 border-purple-400 z-50"
              style={{ 
                top: '-64px', // Décalé vers le haut (moitié de la hauteur 128px / 2)
                left: '-64px' // Décalé vers la gauche (moitié de la largeur 128px / 2)
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* Emojis disposés en cercle */}
            {emojis.map((emojiData, index) => {
              const position = getEmojiPosition(index, emojis.length);
              return (
                <motion.button
                  key={index}
                  className="absolute w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-xl hover:scale-125 z-50 border-2 border-purple-300"
                  style={{
                    top: `${position.y - 24}px`, // -24px pour centrer (moitié de 48px)
                    left: `${position.x - 24}px`, // -24px pour centrer (moitié de 48px)
                  }}
                  onClick={() => handleEmojiSelect(emojiData)}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    transition: { delay: index * 0.05 }
                  }}
                  exit={{ 
                    scale: 0, 
                    opacity: 0,
                    transition: { delay: (emojis.length - index) * 0.05 }
                  }}
                  whileHover={{ 
                    scale: 1.25,
                    boxShadow: '0 0 20px rgba(147, 51, 234, 0.5)'
                  }}
                  whileTap={{ scale: 1.1 }}
                  title={emojiData.label}
                >
                  {emojiData.emoji}
                </motion.button>
              );
            })}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmojiWheel;