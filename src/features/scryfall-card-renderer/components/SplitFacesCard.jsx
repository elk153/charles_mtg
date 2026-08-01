import React from 'react';
import CardFrame from './CardFrame.jsx';

/**
 * Covers: split, adventure. Both faces are legal casting options on the
 * same piece of card stock, shown at once rather than toggled.
 */
export default function SplitFacesCard({ card, cardSymbols }) {

  return (
    <div className="scryfall-card scryfall-card--split-faces">
      {card.faces.map((face, index) => (
        <CardFrame
          key={face.name ?? index}
          face={face}
          image={index === 0 ? (face.image ?? card.rootImage) : undefined}
          cardSymbols={cardSymbols}
        />
      ))}
    </div>
  );
}
