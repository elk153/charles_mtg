import React, { useState } from 'react';
import CardFrame from './CardFrame.jsx';
import useOracleText from "../../../hooks/useOracleText";

/**
 * Covers: split, adventure. Both faces are legal casting options on the
 * same piece of card stock, shown at once rather than toggled.
 */
export default function SplitFacesCard({ card, cardSymbols }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const resolvedRotation = card.rotation ?? card.faces[activeIndex].rotation ?? 0;
  const differentFaceOrientation = card.faces[0].rotation !== card.faces[1].rotation
  const activeFace = card.faces[activeIndex];
  const nextFace = activeIndex === 0 ? 1 : 0;
  console.log(card)

  if (!differentFaceOrientation) {
  return (
    <>
      <div className="card-frame">
        <img
          className={`scryfall-card__image card rotated-card-${resolvedRotation}`}
          src={card.faces[activeIndex].image ?? card.rootImage}
          alt={card.faces[activeIndex].name}
        />
      </div>

      <div className="card-frame">
        {card.faces.map((face, index) => (
          <div className="card-description">
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
        ))}
      </div>
    </>
  )}

  if (differentFaceOrientation) {
    return(
      <>
        <div className="card-frame">
          <img
            className={`scryfall-card__image card rotated-card-${resolvedRotation}`}
            src={activeFace.image ?? card.rootImage}
            alt={activeFace.name}
          />
        </div>

        <div className="card-frame">
          <div className="card-description">
            <div className="scryfall-card__header">
              <h3 className="scryfall-card__name">{activeFace.name}</h3>
            </div>
    
            {activeFace.typeLine && (
              <em><span className="scryfall-card__type-line">{activeFace.typeLine}</span></em>
            )}
            {activeFace.manaCost 
              ? (
                <span className="scryfall-card__mana-cost">{useOracleText(activeFace.manaCost, cardSymbols)}</span>
              )
              : (
                // Need to keep the same count of renders when cards do not have mana on the other side. Avoid having useOracleText as hook to resolve.
                <span className="scryfall-card__mana-cost">{useOracleText("", cardSymbols)}</span>  
              )
            }
            {activeFace.power&& (
              <span className={"color-pill color__M"}>
                {activeFace.power ? (activeFace.power+"/"+activeFace.toughness) : "N/A"}
              </span>
            )}
            {activeFace.loyalty&& (
              <span className={"color-pill color__M"}>
                {activeFace.loyalty}
              </span>
            )}
            {activeFace.defense&& (
              <span className={"color-pill color__M"}>
                {activeFace.defense}
              </span>
            )}
    
            {activeFace.oracleText && (
              <>
                <hr style={{ border: "none", height: "1px", backgroundColor: "#805e24" }} />
                <p className="scryfall-card__oracle-text">{useOracleText(activeFace.oracleText, cardSymbols)}</p>
              </>
            )}
    
            {activeFace.flavorText && (
              <>
                <hr style={{ border: "none", height: "1px", backgroundColor: "#805e24" }} />
                <p className="scryfall-card__flavor-text"><em>{activeFace.flavorText}</em></p>
              </>
            )}
          
          </div>
        </div>        

        <div className="input">
          <button
            type="button"
            onClick={() => setActiveIndex((i) => (i === 0 ? 1 : 0))}
          >
            ↺ Rotate to {card.faces[nextFace].name}
          </button>
        </div>
      </>
  )}

}
