import React from "react";
import "./Card.css";

const Card = ({ cardData }) => {
  //console.log(cardData.id);

  if(!cardData?.image_uris?.normal) {return null;}

  return (

  <>
    <img className="card" src={cardData.image_uris.normal} alt={cardData.name} />
  </>

)};

export default Card;