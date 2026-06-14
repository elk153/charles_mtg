import React from "react";
import "./Card.css";
import IconTurnAround from "../../assets/IconTurnAround";

const Card = ({ cardData, setCardId, setIsCardDetails }) => {
  //console.log(cardData);

  if((cardData.layout === "transform" || cardData.layout === "modal_dfc")) {
    //console.log(cardData);
    //console.log(cardData.card_faces[0].image_uris.normal);
    //return;
  };

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
      <div className="card-wrapper ">

        <div className="nav-icon turn-icon"><IconTurnAround /></div>
          
        <img className="card" src={cardData.card_faces[0].image_uris.normal} alt={cardData.name} />

      </div>
    }
      
  </button>

  )
};

export default Card;

