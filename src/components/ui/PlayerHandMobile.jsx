import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card.jsx';

const PlayerHandMobile = ({ hand, selectedCards, onCardSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bouton pour afficher la main avec glassmorphisme */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600/80 hover:bg-blue-700/90 backdrop-blur-md text-white font-semibold py-2 px-4 rounded-lg shadow-lg border border-blue-400/30 transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Afficher votre main ({hand.length})
      </motion.button>

      {/* Popup modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay avec effet de flou */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Contenu du modal avec glassmorphisme */}
            <motion.div
              className="fixed inset-4 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50 flex flex-col overflow-hidden"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* En-tête avec glassmorphisme */}
              <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
                <h3 className="text-white text-lg font-bold drop-shadow-lg">Votre main</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-300 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  ×
                </button>
              </div>

              {/* Grille de cartes scrollable */}
              <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-transparent via-black/5 to-black/10">
                <div className="grid grid-cols-2 gap-3">
                  {hand.map((card, index) => {
                    const isSelected = selectedCards.find(c => c.id === card.id);
                    
                    return (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex justify-center"
                      >
                        <Card
                          card={card}
                          isSelected={isSelected}
                          onClick={() => onCardSelect(card)}
                          size="medium"
                          className={`transition-all duration-200 ${
                            isSelected 
                              ? 'ring-2 ring-blue-400 ring-opacity-75 shadow-2xl scale-95' 
                              : 'shadow-lg'
                          }`}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Footer avec bouton fermer et glassmorphisme */}
              <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 shadow-lg"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PlayerHandMobile;
