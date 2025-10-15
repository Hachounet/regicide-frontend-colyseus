import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <motion.div
        className="flex space-x-2 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className="w-4 h-4 bg-blue-500 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      <motion.h2
        className="text-xl font-semibold text-center mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Connexion en cours...
      </motion.h2>

      <motion.p
        className="text-gray-300 text-center max-w-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Veuillez patienter pendant que nous établissons la connexion avec le serveur.
      </motion.p>

      {/* Animation de cartes */}
      <motion.div
        className="mt-12 flex space-x-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        {['♠', '♥', '♦', '♣'].map((suit, index) => (
          <motion.div
            key={suit}
            className={`w-12 h-16 rounded-lg border-2 flex items-center justify-center text-2xl font-bold
              ${suit === '♥' || suit === '♦' ? 'text-red-500 border-red-300' : 'text-gray-700 border-gray-300'}
              bg-white/90`}
            animate={{
              rotateY: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.3,
              ease: "easeInOut",
            }}
          >
            {suit}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
