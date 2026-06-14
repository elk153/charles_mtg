import React from "react";
import "./Card.css";

const Card = ({ cardData, setCardId, setIsCardDetails }) => {
  console.log(cardData);

  if(!cardData?.image_uris?.normal) {return null};

  return (

  <button 
    id={cardData.id} 
    className="cardButton" 
    onClick={ () => {
      setCardId(cardData.id);
      setIsCardDetails(true);
    }}
  >
    
    <img className="card" src={cardData.image_uris.normal} alt={cardData.name} />
  
  </button>

  )
};

export default Card;

