import React from "react";
import "./Card.css";

const Card = ({ cardData }) => {
  console.log(cardData.id);

  return (

  <>
    <img className="card" src={cardData.image_uris.border_crop} alt={cardData.name} />
  </>

)};

export default Card;