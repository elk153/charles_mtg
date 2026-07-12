import React, { useState } from 'react';

/**
 * Covers: flip. A single physical image with two text halves printed
 * upside-down relative to each other; "flipping" rotates 180deg rather
 * than swapping to a different image.
 */
export default function FlipVerticalCard({ card }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const face = card.faces[activeIndex];
  const image = face.image ?? card.rootImage;
  const isFlipped = activeIndex === 1;

  return (
    <div className="scryfall-card scryfall-card--flip-vertical">
      <figure className="scryfall-card__frame">
        {image && (
          <img
            className="scryfall-card__image"
            style={isFlipped ? { transform: 'rotate(180deg)' } : undefined}
            src={image}
            alt={face.name}
            loading="lazy"
          />
        )}
        <figcaption className="scryfall-card__text">
          <div className="scryfall-card__name">{face.name}</div>
          {face.typeLine && (
            <div className="scryfall-card__type-line">{face.typeLine}</div>
          )}
          {face.oracleText && (
            <p className="scryfall-card__oracle-text">{face.oracleText}</p>
          )}
        </figcaption>
      </figure>

      {card.faces.length > 1 && (
        <button
          type="button"
          className="scryfall-card__flip-button"
          onClick={() => setActiveIndex((i) => (i === 0 ? 1 : 0))}
        >
          ⇅ Flip
        </button>
      )}
    </div>
  );
}
