import React from "react";
import Card from "../Card/Card";
import "./CardDetails.css";
import close from "../../assets/close.svg";

const CardDetails = ({cardData, setIsCardDetails}) => {
  console.log(cardData);
  const card = cardData[0];

  return (

    <div className="card-details">

      <button className="button-close-top-layer" onClick={ () => setIsCardDetails(false)}>
        <img src={close} alt="Close top layer" />
      </button>

      <img className="card" src={card.image_uris.normal} alt={card.name} />

      <div className="card-info">
        <ul>
          <li>{card.name} ({card.mana_cost})</li>
          <li>{card.type_line}</li>
          <li>{card.oracle_text}</li>
          <li>Illustrated by {card.artist}, framed in {card.frame}</li>
          <li>Legalities
            <ul>
              {Object.entries(card.legalities).map( ([format, legality]) => (
                <li>{format}: {legality}</li>
              ))}
            </ul>
          </li>
        </ul>
      </div>

    </div>
  )
};

export default CardDetails;