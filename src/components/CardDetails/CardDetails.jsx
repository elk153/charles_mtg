import React from "react";
import Card from "../Card/Card";
import getCardPrints from "../../services/getCardPrices";
import "./CardDetails.css";
import IconClose from "../../assets/IconClose";
import IconTurnAround from "../../assets/IconTurnAround";
import getCardPrices from "../../services/getCardPrices";

const CardDetails = ({cardData, setIsCardDetails, cardPrices}) => {

  console.log(cardPrices);
  
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
        <div className="card-flip-outer">
  
          <div className="card-flip-inner">
  
            <div className="card-flip-front">
              <img className="card" src={card.card_faces[0].image_uris.normal} alt={card.name} />
            </div>
        
            <div className="card-flip-back">
              <img className="card" src={card.card_faces[1].image_uris.normal} alt={card.name} />
            </div>
  
          /</div>
  
          <div className="card-icon"><IconTurnAround /></div>
  
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
          <li>Prices</li>
              <table>
                <thead>
                  <tr>
                    <td>Prints</td>
                    <td>EUR</td>
                    <td>EUR (foil)</td>
                    <td>TIX</td>
                    <td>USD</td>
                    <td>USD (etched)</td>
                    <td>USD (foil)</td>
                  </tr>
                </thead>
                <tbody>
                  {cardPrices.map( ( {id, set, image, prices}, index) => (
                    <tr>
                      <td>{set}</td>
                      <td>EUR</td>
                      <td>EUR (foil)</td>
                      <td>TIX</td>
                      <td>USD</td>
                      <td>USD (etched)</td>
                      <td>USD (foil)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
        </ul>
      </div>

    </div>
  )
};

export default CardDetails;