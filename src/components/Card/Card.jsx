import React from "react";
import "./Card.css";

const Card = ({ cardData }) => {
  //console.log(cardData.id);

  return (

  <>
    <img className="card" src={cardData.image_uris.normal} alt={cardData.name} />
  </>

)};

export default Card;