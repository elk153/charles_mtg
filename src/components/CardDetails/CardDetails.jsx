import React from "react";
import Card from "../Card/Card";
import "./CardDetails.css";
import IconClose from "../../assets/IconClose";
import IconTurnAround from "../../assets/IconTurnAround";

const CardDetails = ({cardData, setIsCardDetails}) => {
  console.log(cardData[0].layout);
  const card = cardData[0];

  return (

    <div className="card-details">

      <button className="nav-icon" onClick={ () => setIsCardDetails(false)}>
        <IconClose />
      </button>

      {(card.layout !== "transform" && card.layout !== "modal_dfc") 
        ? 
        <div>
          <img className="card" src={card.image_uris.normal} alt={card.name} />
        </div>
        :
        <div className="card-wrapper ">
  
          <div className="nav-icon turn-icon"><IconTurnAround /></div>
            
          <img className="card" src={card.card_faces[0].image_uris.normal} alt={card.name} />
  
        </div>
      }

      <div className="card-info">
        <ul>
          <li>{card.name} ({card.mana_cost})</li>
          <li>{card.type_line}</li>
          <li>{card.oracle_text}</li>
          <li>Illustrated by {card.artist}, framed in {card.frame}</li>
          <li>Legalities
            <ul>
              {Object.entries(card.legalities).map( ([format, legality], index) => (
                <li key={index}>{format}: {legality}</li>
              ))}
            </ul>
          </li>
        </ul>
      </div>

    </div>
  )
};

export default CardDetails;