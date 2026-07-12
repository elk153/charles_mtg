import React from 'react';

/**
 * The visual frame shared by every layout: image, name, mana cost, type
 * line, oracle text, and stats. Every shape component composes this rather
 * than re-implementing it, so the 99%-common case (a face) is written once.
 */
export default function CardFrame({ face, image }) {
  const resolvedImage = image ?? face.image;

  return (
    <figure className="scryfall-card__frame">
      {resolvedImage && (
        <img
          className="scryfall-card__image"
          src={resolvedImage}
          alt={face.name}
          loading="lazy"
        />
      )}
      <figcaption className="scryfall-card__text">
        <div className="scryfall-card__header">
          <span className="scryfall-card__name">{face.name}</span>
          {face.manaCost && (
            <span className="scryfall-card__mana-cost">{face.manaCost}</span>
          )}
        </div>

        {face.typeLine && (
          <div className="scryfall-card__type-line">{face.typeLine}</div>
        )}

        {face.oracleText && (
          <p className="scryfall-card__oracle-text">{face.oracleText}</p>
        )}

        {face.flavorText && (
          <p className="scryfall-card__flavor-text">{face.flavorText}</p>
        )}

        {(face.power != null || face.toughness != null) && (
          <div className="scryfall-card__pt">
            {face.power}/{face.toughness}
          </div>
        )}

        {face.loyalty != null && (
          <div className="scryfall-card__loyalty">Loyalty: {face.loyalty}</div>
        )}

        {face.defense != null && (
          <div className="scryfall-card__defense">Defense: {face.defense}</div>
        )}
      </figcaption>
    </figure>
  );
}
