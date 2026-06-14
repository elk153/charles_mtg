import React from "react";
import Card from "../Card/Card";
import "./CardsList.css";

const CardsList = ({ cardData, setCardId, onCardClick }) => {
  console.log(cardData.length);
  
  return (

    <div className="cards-list">

      { !cardData.length 

        ? <Card 
            cardData={cardData}
            setCardId={setCardId} 
            onCardClick={onCardClick}
          />
      
        : cardData.slice(cardData.length).map( (card, index) => (

            <Card 
              key={ card.id ?? index } 
              cardData={card} 
              setCardId={setCardId} 
              onCardClick={onCardClick}
            />
            
        ))
        }  

    </div>

  );

};

export default CardsList;