import React from 'react';
import aceSpades from '../../assets/cards/ace_spades.png';
import kingHearts from '../../assets/cards/king_hearts.png';

const Header = () => {
  return (
    <header className="text-center mb-4 sm:mb-6 lg:mb-8">
      <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6">
        {/* Carte gauche */}
        <img
          src={aceSpades}
          alt="Ace of Spades"
          className="w-12 h-16 sm:w-14 sm:h-20 md:w-16 md:h-24 object-contain drop-shadow-2xl transform -rotate-12"
        />

        {/* Titre */}
        <div>
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider pixel-text text-white"
            style={{
              fontFamily: '"Press Start 2P", cursive',
              textShadow: `
                3px 3px 0px #000,
                4px 4px 0px rgba(0,0,0,0.5),
                0 0 20px rgba(255, 255, 255, 0.5),
                0 0 40px rgba(255, 255, 255, 0.3)
              `
            }}
          >
            REGICIDE
          </h1>
          <p className="text-gray-300 mt-2 sm:mt-3 text-xs sm:text-sm lg:text-base font-medium tracking-wide">
            Jeu de cartes stratégique multijoueur
          </p>
        </div>

        {/* Carte droite */}
        <img
          src={kingHearts}
          alt="King of Hearts"
          className="w-12 h-16 sm:w-14 sm:h-20 md:w-16 md:h-24 object-contain drop-shadow-2xl transform rotate-12"
        />
      </div>
    </header>
  );
};

export default Header;
