import React from "react";
import Card from "../Card/Card";
import "./CardDetails.css";

const CardDetails = ({cardData}) => {

  return (

    <div className="card-popup">

      <Card cardData={cardData} />

    </div>
  )
};

export default CardDetails;