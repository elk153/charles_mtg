import React from "react";
import Card from "../Card/Card";
import getCardPrints from "../../services/getCardPrices";
import IconClose from "../../assets/IconClose";
import IconTurnAround from "../../assets/IconTurnAround";
import getCardPrices from "../../services/getCardPrices";
import "./CardDetails.css";

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
          <li>Prices (Scryfall)
            <table>
              <thead>
                <tr>
                  <td>Prints</td>
                  <td>EUR</td>
                  <td>EUR<br></br>(foil)</td>
                  <td>TIX</td>
                  <td>USD</td>
                  <td>USD<br></br>(etched)</td>
                  <td>USD<br></br>(foil)</td>
                </tr>
              </thead>
              <tbody>
                {cardPrices.map( ( {id, set, image, prices}, indexSet) => (
                  <tr key={indexSet}>
                    <td>{set}</td>
                    {Object.entries(cardPrices[indexSet].prices).map( ([trace, price], indexCurr) => (
                      <td key={indexCurr}>{price ? price : ""}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </li>
          <li>Prints
            <dl>
              {cardPrices.map( ( {id, set, image, prices}, index) => (
                <>
                  <dt key={index}>{set}</dt>
                  <dd>
                    <img className="card" src={image} />
                  </dd>
                </>
              ))}
                 
            </dl>

          </li>
        </ul>
      </div>

    </div>
  )
};

export default CardDetails;