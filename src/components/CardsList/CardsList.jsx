import React from "react";
import Card from "../Card/Card";
import "./CardsList.css";

const CardsList = ({ cardData, setCardId, setIsCardDetails }) => {
  console.log(cardData.length);
  
  return (

    <div className="cards-list">

      { !cardData.length 

        ? <Card 
            cardData={cardData}
            setCardId={setCardId} 
            setIsCardDetails={setIsCardDetails}
          />
      
        : cardData.slice(0, cardData.length).map( (card, index) => (

            <Card 
              key={ card.id ?? index } 
              cardData={card} 
              setCardId={setCardId} 
              setIsCardDetails={setIsCardDetails}
            />
            
        ))
        }  

    </div>

  );

};

export default CardsList;