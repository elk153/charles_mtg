import React from "react";
import "./Card.css";

const Card = ({ cardData, setCardId, onCardClick }) => {
  //console.log(cardData.id);

  if(!cardData?.image_uris?.normal) {return null;}

  return (

  <button 
    id={cardData.id} 
    className="cardButton" 
    onClick={ () => {
      setCardId(cardData.id);
      onCardClick();
    }}
  >
    
    <img className="card" src={cardData.image_uris.normal} alt={cardData.name} />
  
  </button>

  )
};

export default Card;