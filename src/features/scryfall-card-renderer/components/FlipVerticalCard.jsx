import React, { useState } from 'react';
import CardFrame from './CardFrame.jsx';

/**
 * Covers: flip. A single physical image with two text halves printed
 * upside-down relative to each other; "flipping" rotates 180deg rather
 * than swapping to a different image.
 */
export default function FlipVerticalCard({ card, cardSymbols }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const face = card.faces[activeIndex];
  const image = face.image ?? card.rootImage;
  const isFlipped = activeIndex === 1;

  console.log(face)

  return (
    <div className="scryfall-card scryfall-card--flip-vertical">
      
      <CardFrame 
        face={face} 
        image={image} 
        cardSymbols={cardSymbols} 
        style={isFlipped ? { transform: 'rotate(180deg)' } : undefined}
      />

      {card.faces.length > 1 && (
        <div className="input">
          <button
            type="button"
            className="scryfall-card__flip-button"
            onClick={() => setActiveIndex((i) => (i === 0 ? 1 : 0))}
          >
            ⇅ Flip
          </button>
        </div>
      )}
    </div>
  );
}
