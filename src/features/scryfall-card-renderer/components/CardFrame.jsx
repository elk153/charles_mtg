import React from 'react';
import useOracleText from "../../../hooks/useOracleText";

/**
 * The visual frame shared by every layout: image, name, mana cost, type
 * line, oracle text, and stats. Every shape component composes this rather
 * than re-implementing it, so the 99%-common case (a face) is written once.
 */
export default function CardFrame({ face, image, cardSymbols, style={undefined} }) {
  const resolvedImage = image ?? face.image;
 
  return (
    <div className="scryfall-card__frame card-frame">
      {resolvedImage && (
        <img
          className="scryfall-card__image card"
          src={resolvedImage}
          alt={face.name}
          style={style}
          loading="lazy"
        />
      )}
      <div className="scryfall-card__text card-description">
        <div className="scryfall-card__header">
          <h3 className="scryfall-card__name">{face.name}</h3>
        </div>

        {face.typeLine && (
          <em><span className="scryfall-card__type-line">{face.typeLine}</span></em>
        )}
        {face.manaCost 
          ? (
            <span className="scryfall-card__mana-cost">{useOracleText(face.manaCost, cardSymbols)}</span>
          )
          : (
            // Need to keep the same count of renders when cards do not have mana on the other side. Avoid having useOracleText as hook to resolve.
            <span className="scryfall-card__mana-cost">{useOracleText("   ", cardSymbols)}</span>  
          )
      }
        &nbsp;
        {face.power&& (
          <span className={"color-pill color__M"}>
            {face.power ? (face.power+"/"+face.toughness) : "N/A"}
          </span>
        )}
        {face.loyalty&& (
          <span className={"color-pill color__M"}>
            {face.loyalty}
          </span>
        )}
        {face.defense&& (
          <span className={"color-pill color__M"}>
            {face.defense}
          </span>
        )}

        {face.oracleText && (
          <>
            <hr style={{ border: "none", height: "1px", backgroundColor: "#805e24" }} />
            <p className="scryfall-card__oracle-text">{useOracleText(face.oracleText, cardSymbols)}</p>
          </>
        )}

        {face.flavorText && (
          <>
            <hr style={{ border: "none", height: "1px", backgroundColor: "#805e24" }} />
            <p className="scryfall-card__flavor-text"><em>{face.flavorText}</em></p>
          </>
        )}

      </div>
    </div>
  );
}
