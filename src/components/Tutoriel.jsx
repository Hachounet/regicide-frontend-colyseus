import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button.jsx';

const Tutoriel = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Bienvenue dans Regicide !",
      content: (
        <div className="space-y-4">
          <p>
            Regicide est un jeu de cartes de 3 à 4 joueurs où tour à tour vous construisez une pyramide symbolisant la Cour du Roi en posant vos cartes et en remplaçant celles de vos adversaires.
          </p>
          <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">🎯 Objectif</h4>
            <p className="text-sm">
              Celui avec le plus de points à la fin de la partie l'emporte !
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Familles Royales",
      content: (
        <div className="space-y-4">
          <p>
            Au début de la partie, on isole les 4 rois du jeu de cartes. Chaque joueur en reçoit un au hasard, qui détermine sa famille secrète. A la fin de la partie, chaque joueur compte ses points en fonction de la famille du Roi qu'il a tiré en début de partie.
          </p>
          
          {/* Affichage des 4 rois en éventail */}
          <div className="flex justify-center items-center py-8">
            <div className="relative">
              {/* Roi de Cœur */}
              <motion.img
                src="/src/assets/cards/king_hearts.png"
                alt="Roi de Cœur"
                className="w-20 h-28 absolute shadow-lg rounded-lg border-2 border-red-400"
                style={{ zIndex: 1, left: '-30px' }}
                animate={{ rotate: -12 }}
                whileHover={{ scale: 1.1, rotate: -12, zIndex: 10 }}
                transition={{ duration: 0.2 }}
              />
              
              {/* Roi de Pique */}
              <motion.img
                src="/src/assets/cards/king_spades.png"
                alt="Roi de Pique"
                className="w-20 h-28 absolute shadow-lg rounded-lg border-2 border-gray-400"
                style={{ zIndex: 2, left: '-10px' }}
                animate={{ rotate: -4 }}
                whileHover={{ scale: 1.1, rotate: -4, zIndex: 10 }}
                transition={{ duration: 0.2 }}
              />
              
              {/* Roi de Carreau */}
              <motion.img
                src="/src/assets/cards/king_diamonds.png"
                alt="Roi de Carreau"
                className="w-20 h-28 absolute shadow-lg rounded-lg border-2 border-red-400"
                style={{ zIndex: 3, left: '10px' }}
                animate={{ rotate: 4 }}
                whileHover={{ scale: 1.1, rotate: 4, zIndex: 10 }}
                transition={{ duration: 0.2 }}
              />
              
              {/* Roi de Trèfle */}
              <motion.img
                src="/src/assets/cards/king_clubs.png"
                alt="Roi de Trèfle"
                className="w-20 h-28 absolute shadow-lg rounded-lg border-2 border-green-400"
                style={{ zIndex: 4, left: '30px' }}
                animate={{ rotate: 12 }}
                whileHover={{ scale: 1.1, rotate: 12, zIndex: 10 }}
                transition={{ duration: 0.2 }}
              />
              
              {/* Espace pour éviter le chevauchement */}
              <div className="w-20 h-28 opacity-0"></div>
            </div>
          </div>

          
         
          <div className="bg-yellow-600/20 border border-yellow-500 rounded-lg p-3">
            <h4 className="font-semibold text-yellow-400 mb-2">⚠️ Variantes 3 joueurs</h4>
            <ul className="text-sm space-y-1">
              <li>• A 3 joueurs, un Roi n'est pas tiré au hasard et est donc laissé sur le côté.</li>
              <li>• Les cartes de sa famille seront jouées mais ne vaudront aucun point.</li>
              
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Phase de Draft",
      content: (
        <div className="space-y-4">
          <p>
            Au début de chaque round, vous recevez un paquet de 4 cartes et devez en choisir une
            avant de passer le paquet au joueur suivant. On recommence ainsi jusqu'à ce que toutes les cartes soient distribuées. Chaque joueur ajoute son Roi secret dans sa main qui est donc constituée de cartes de sa famille mais aussi de cartes adverses.
          </p>

          {/* Illustration : Main de cartes en éventail */}
          <div className="flex justify-center items-center py-6">
            <div className="relative">
              {/* Carte 1 - As de Cœur */}
              <motion.img
                src="/src/assets/cards/ace_hearts.png"
                alt="As de Cœur"
                className="w-16 h-24 absolute shadow-md rounded-lg border border-red-300"
                style={{ zIndex: 1, left: '-24px' }}
                animate={{ rotate: -15 }}
                whileHover={{ scale: 1.05, rotate: -15, zIndex: 10 }}
                transition={{ duration: 0.2 }}
              />
              
              {/* Carte 2 - Dame de Pique */}
              <motion.img
                src="/src/assets/cards/queen_spades.png"
                alt="Dame de Pique"
                className="w-16 h-24 absolute shadow-md rounded-lg border border-gray-300"
                style={{ zIndex: 2, left: '-8px' }}
                animate={{ rotate: -5 }}
                whileHover={{ scale: 1.05, rotate: -5, zIndex: 10 }}
                transition={{ duration: 0.2 }}
              />
              
              {/* Carte 3 - 7 de Carreau */}
              <motion.img
                src="/src/assets/cards/7_diamonds.png"
                alt="7 de Carreau"
                className="w-16 h-24 absolute shadow-md rounded-lg border border-red-300"
                style={{ zIndex: 3, left: '8px' }}
                animate={{ rotate: 5 }}
                whileHover={{ scale: 1.05, rotate: 5, zIndex: 10 }}
                transition={{ duration: 0.2 }}
              />
              
              {/* Carte 4 - Valet de Trèfle */}
              <motion.img
                src="/src/assets/cards/jack_clubs.png"
                alt="Valet de Trèfle"
                className="w-16 h-24 absolute shadow-md rounded-lg border border-green-300"
                style={{ zIndex: 4, left: '24px' }}
                animate={{ rotate: 15 }}
                whileHover={{ scale: 1.05, rotate: 15, zIndex: 10 }}
                transition={{ duration: 0.2 }}
              />
              
              {/* Espace pour éviter le chevauchement */}
              <div className="w-16 h-24 opacity-0"></div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-400 mb-4">
            Exemple de main reçue pendant le draft
          </div>

         
         <div className="bg-yellow-600/20 border border-yellow-500 rounded-lg p-3">
            <h4 className="font-semibold text-yellow-400 mb-2">⚠️ Variantes 3 joueurs</h4>
            <ul className="text-sm space-y-1">
              <li>• A 3 joueurs, chaque joueur choisit 2 cartes parmi les 4 reçues.</li>
              
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Construction de la Pyramide",
      content: (
        <div className="space-y-4">
          <p>
            Après le draft, le jeu commence et vous devez placer vos cartes pour construire votre pyramide.
          </p>
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold mb-3">🏗️ Structure de la Pyramide</h4>
            <div className="font-mono text-center space-y-2">
              <div className="text-yellow-400">👑 (1 carte - Niveau 4 - Score X4)</div>
              <div className="text-blue-400">🃏 🃏 (2 cartes - Niveau 3 - Score X2)</div>
              <div className="text-green-400">🃏 🃏 🃏 (3 cartes - Niveau 2 - Score X3)</div>
              <div className="text-red-400">🃏 🃏 🃏 🃏 (4 cartes - Niveau 1 - Score X1)</div>
            </div>
          </div>
          <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-3">
            <h4 className="font-semibold text-blue-400 mb-2">Poser sur le niveau 1</h4>
            <ul className="text-sm space-y-1">
              <li>• En début de partie, les emplacements vides du niveau 1 peuvent accueillir n'importe quelle carte.</li>
              
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Construction de la Pyramide 2",
      content: (
        <div className="space-y-4">
          <p>
            Pour placer sur un emplacement <span className="font-bold">vide</span> sur les rangs 2 à 4, il faut que les deux emplacements en dessous créent un <span className="font-bold">support valide</span>. Un support est considéré comme valide si une des deux cartes est de la même famille que la carte à poser.
          </p>
          
          <div className="bg-gray-800 rounded-lg p-2">
            <h4 className="font-semibold mb-2 text-center text-sm">🏗️ Exemples</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Support Valide */}
              <motion.div 
                className="bg-green-600/20 border border-green-500 rounded-lg p-2"
                initial="rest"
                whileHover="hover"
                animate="rest"
              >
                <h5 className="font-semibold text-green-400 mb-1 text-center text-xs">✅ Valide</h5>
                
                <div className="flex flex-col items-center space-y-1">
                  {/* Carte à poser (niveau 2) */}
                  <motion.img
                    src="/src/assets/cards/5_hearts.png"
                    alt="5 de Cœur à poser"
                    className="w-8 h-12 shadow-sm rounded border border-green-400"
                    variants={{
                      rest: { scale: 1 },
                      hover: { scale: 2 }
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  <motion.div 
                    className="text-xs text-green-300"
                    variants={{
                      rest: { scale: 1 },
                      hover: { scale: 2 }
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    ↓
                  </motion.div>
                  
                  {/* Support (niveau 1) */}
                  <div className="flex space-x-0.5">
                    <motion.img
                      src="/src/assets/cards/3_hearts.png"
                      alt="3 de Cœur (support)"
                      className="w-8 h-12 shadow-sm rounded border border-green-400"
                      variants={{
                        rest: { scale: 1 },
                        hover: { scale: 2 }
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.img
                      src="/src/assets/cards/7_spades.png"
                      alt="7 de Pique"
                      className="w-8 h-12 shadow-sm rounded border border-gray-400"
                      variants={{
                        rest: { scale: 1 },
                        hover: { scale: 2 }
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  
                  <p className="text-xs text-green-300 text-center">
                    ♥️ famille
                  </p>
                </div>
              </motion.div>

              {/* Support Incorrect */}
              <motion.div 
                className="bg-red-600/20 border border-red-500 rounded-lg p-2"
                initial="rest"
                whileHover="hover"
                animate="rest"
              >
                <h5 className="font-semibold text-red-400 mb-1 text-center text-xs">❌ Incorrect</h5>
                
                <div className="flex flex-col items-center space-y-1">
                  {/* Carte à poser (niveau 2) */}
                  <motion.img
                    src="/src/assets/cards/queen_hearts.png"
                    alt="Dame de Cœur à poser"
                    className="w-8 h-12 shadow-sm rounded border border-red-400"
                    variants={{
                      rest: { scale: 1 },
                      hover: { scale: 2 }
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  <motion.div 
                    className="text-xs text-red-300"
                    variants={{
                      rest: { scale: 1 },
                      hover: { scale: 2 }
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    ↓
                  </motion.div>
                  
                  {/* Support (niveau 1) */}
                  <div className="flex space-x-0.5">
                    <motion.img
                      src="/src/assets/cards/8_clubs.png"
                      alt="8 de Trèfle"
                      className="w-8 h-12 shadow-sm rounded border border-gray-400"
                      variants={{
                        rest: { scale: 1 },
                        hover: { scale: 2 }
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.img
                      src="/src/assets/cards/jack_spades.png"
                      alt="Valet de Pique"
                      className="w-8 h-12 shadow-sm rounded border border-gray-400"
                      variants={{
                        rest: { scale: 1 },
                        hover: { scale: 2 }
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  
                  <p className="text-xs text-red-300 text-center">
                    Pas ♥️
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
          
         
        </div>
      )
    },
    {
      title: "Remplacement d'une carte",
      content: (
        <div className="space-y-4">
          <p>
            Vous pouvez poser une carte sur un emplacement déjà pris en comparant la force des deux cartes. Si la nouvelle carte est plus forte ou égale, elle remplace l'ancienne. La règle des supports valides ne s'applique pas, les cartes au dessus ne sont pas affectées.
          </p>
        
          <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-center text-sm">⚔️ Exemple de Remplacement</h4>
            
            <motion.div 
              className="bg-gray-800 border border-blue-400 rounded-lg p-3"
              initial="rest"
              whileHover="hover"
              animate="rest"
            >
              <h5 className="font-semibold text-blue-400 mb-2 text-center text-xs">✅ Remplacement Valide</h5>
              
              <div className="flex items-center justify-center space-x-4">
                {/* Carte actuelle */}
                <div className="flex flex-col items-center space-y-1">
                  <motion.img
                    src="/src/assets/cards/7_diamonds.png"
                    alt="7 de Carreau (carte actuelle)"
                    className="w-10 h-14 shadow-sm rounded border border-red-400"
                    variants={{
                      rest: { scale: 1 },
                      hover: { scale: 1.15 }
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <p className="text-xs text-gray-300 text-center">
                    Carte actuelle<br/>
                    <span className="text-red-400">Force: 7</span>
                  </p>
                </div>

                {/* Flèche de remplacement */}
                <motion.div 
                  className="text-lg text-blue-300"
                  variants={{
                    rest: { scale: 1 },
                    hover: { scale: 1.15 }
                  }}
                  transition={{ duration: 0.3 }}
                >
                  →
                </motion.div>

                {/* Nouvelle carte */}
                <div className="flex flex-col items-center space-y-1">
                  <motion.img
                    src="/src/assets/cards/8_clubs.png"
                    alt="8 de Trèfle (nouvelle carte)"
                    className="w-10 h-14 shadow-sm rounded border border-green-400"
                    variants={{
                      rest: { scale: 1 },
                      hover: { scale: 1.15 }
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <p className="text-xs text-gray-300 text-center">
                    Nouvelle carte<br/>
                    <span className="text-green-400">Force: 8</span>
                  </p>
                </div>
              </div>
              
              <p className="text-xs text-blue-300 text-center mt-2">
                8 &gt; 7 → Remplacement autorisé !
              </p>
            </motion.div>
          </div>
          
        </div>
      )
    },
    
    {
      title: "Pouvoirs spéciaux et force des cartes",
      content: (
        <div className="space-y-3">
          <p className="text-sm">
            Chaque carte a une force numérique qui détermine si elle peut remplacer une autre carte. Certaines cartes ont des pouvoirs spéciaux.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="bg-red-600/20 border border-red-500 rounded-lg p-2">
              <h4 className="font-semibold text-red-400 mb-1 text-sm">As (1)</h4>
              <p className="text-xs">
                Plus fort que Valet, Dame, Roi. Moins fort que 2-10.
              </p>
            </div>
            <div className="bg-green-600/20 border border-green-500 rounded-lg p-2">
              <h4 className="font-semibold text-green-400 mb-1 text-sm">2-10</h4>
              <p className="text-xs">
                Valeur numérique de la carte.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-2">
              <h4 className="font-semibold text-blue-400 mb-1 text-sm">🃏 Valet (11)</h4>
              <p className="text-xs">
                Échangez une carte de votre main avec une carte aléatoire d'un adversaire.
              </p>
            </div>
            <div className="bg-purple-600/20 border border-purple-500 rounded-lg p-2">
              <h4 className="font-semibold text-purple-400 mb-1 text-sm">👸 Dame (12)</h4>
              <p className="text-xs">
                Échangez 2 cartes de position dans la pyramide.
              </p>
            </div>
            <div className="bg-yellow-600/20 border border-yellow-500 rounded-lg p-2">
              <h4 className="font-semibold text-yellow-400 mb-1 text-sm">👑 Roi (13)</h4>
              <p className="text-xs">
                Valeur numérique de la carte.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Conditions de Victoire",
      content: (
        <div className="space-y-4">
          <p>
            La partie se termine quand plus personne n'a de cartes ou lorsqu'un seul joueur peut encore jouer. Il joue ce qu'il peut et la partie s'arrête immédiatement. On passe alors au calcul des scores.
          </p>
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold mb-3">🏗️ Structure de la Pyramide</h4>
            <div className="font-mono text-center space-y-2">
              <div className="text-yellow-400">👑 (1 carte - Niveau 4 - Score X4)</div>
              <div className="text-blue-400">🃏 🃏 (2 cartes - Niveau 3 - Score X2)</div>
              <div className="text-green-400">🃏 🃏 🃏 (3 cartes - Niveau 2 - Score X3)</div>
              <div className="text-red-400">🃏 🃏 🃏 🃏 (4 cartes - Niveau 1 - Score X1)</div>
            </div>
          </div>
          <div className="text-center mt-6">
            <p className="text-lg font-semibold text-yellow-400">
              🎮 Bonne chance et amusez-vous bien !
            </p>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const closeTeacher = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-xl">📚</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Tutoriel Regicide</h2>
              <p className="text-gray-400 text-sm">
                Étape {currentStep + 1} sur {tutorialSteps.length}
              </p>
            </div>
          </div>
          <button
            onClick={closeTeacher}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">
                {tutorialSteps[currentStep].title}
              </h3>
              <div className="text-gray-300">
                {tutorialSteps[currentStep].content}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-white/20">
          <Button
            onClick={prevStep}
            disabled={currentStep === 0}
            variant="secondary"
            size="medium"
          >
            ← Précédent
          </Button>

          <div className="flex space-x-2">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          {currentStep < tutorialSteps.length - 1 ? (
            <Button
              onClick={nextStep}
              variant="primary"
              size="medium"
            >
              Suivant →
            </Button>
          ) : (
            <Button
              onClick={closeTeacher}
              variant="success"
              size="medium"
            >
              Commencer à jouer ! 🎮
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Tutoriel;
