import React from "react";
import Card from "../Card/Card";
import "./CardsList.css";

const CardsList = ({ cardData }) => {
  console.log(!cardData.length);
  
  return (

    <div className="cards-list">

      { !cardData.length 

        ? <Card cardData={cardData} />
      
        : cardData.map( (card, index) => (

            <Card key={ card.id ?? index } cardData={ card } />

          ))
        }  

    </div>

  );

};

export default CardsList;