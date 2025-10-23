import React from 'react';
import Card from './Card.jsx';

const PlayerHandPlayPhase = ({ 
  hand, 
  selectedCards, 
  onCardSelect,
  jackGiveCard,
  specialPowerMode,
  isMyTurn,
  onDragStart,
  onDragEnd
}) => {
  // Diviser la main en 2 lignes
  const midPoint = Math.ceil(hand.length / 2);
  const firstRow = hand.slice(0, midPoint);
  const secondRow = hand.slice(midPoint);

  const renderCard = (card, index) => {
    const isSelected = selectedCards.find(c => c.id === card.id);
    const isJackGiveSelected = jackGiveCard?.id === card.id;
    const canSelectForJack = specialPowerMode === 'jack' && !isSelected;
    
    const handleCardClick = () => {
      onCardSelect(card);
    };

    return (
      <div
        key={card.id}
        style={{
          zIndex: isSelected || isJackGiveSelected ? 40 : 10 + index
        }}
        className="flex-shrink-0 transition-transform hover:-translate-y-2 hover:scale-125"
      >
        <Card
          card={card}
          isSelected={isSelected || isJackGiveSelected}
          onClick={handleCardClick}
          size="small"
          className={`transition-all duration-200 ${
            isJackGiveSelected ? 'ring-2 ring-yellow-400 ring-opacity-75 shadow-2xl' :
            isSelected ? 'ring-2 ring-blue-400 ring-opacity-75 shadow-2xl' : 
            canSelectForJack ? 'ring-1 ring-yellow-300 ring-opacity-50 shadow-lg hover:ring-2' :
            'shadow-lg'
          }`}
          draggable={isMyTurn}
          onDragStart={() => onDragStart && onDragStart(card)}
          onDragEnd={onDragEnd}
        />
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center gap-1 px-2">
      {/* Première ligne */}
      <div className="flex justify-center items-end gap-0.5 overflow-visible">
        {firstRow.map((card, index) => renderCard(card, index))}
      </div>
      
      {/* Deuxième ligne */}
      {secondRow.length > 0 && (
        <div className="flex justify-center items-end gap-0.5 overflow-visible">
          {secondRow.map((card, index) => renderCard(card, index))}
        </div>
      )}
    </div>
  );
};

export default PlayerHandPlayPhase;
