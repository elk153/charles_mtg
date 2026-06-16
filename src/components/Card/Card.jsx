import React from "react";
import "./Card.css";
import IconTurnAround from "../../assets/IconTurnAround";

const Card = ({ cardData, setCardId, setIsCardDetails }) => {

  return (

  <button 
    id={cardData.id} 
    className="cardButton" 
    onClick={ () => {
      setCardId(cardData.id);
      setIsCardDetails(true);
    }}
  >
    
    {(cardData.layout !== "transform" && cardData.layout !== "modal_dfc") 
      ? 
      <div>
        <img className="card" src={cardData.image_uris.normal} alt={cardData.name} />
      </div>
      :
      <div className="card-flip-outer">

        <div className="card-flip-inner">

          <div className="card-flip-front">
            <img className="card" src={cardData.card_faces[0].image_uris.normal} alt={cardData.name} />
            <div className="nav-icon"><IconTurnAround /></div>
          </div>
      
          <div className="card-flip-back">
            <img className="card" src={cardData.card_faces[1].image_uris.normal} alt={cardData.name} />
            <div className="nav-icon"><IconTurnAround /></div>
          </div>

        /</div>

      </div>
    }
      
  </button>

  )
};

export default Card;

