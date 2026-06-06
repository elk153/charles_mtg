import React from "react";
import "./Card.css"

const Pill = ({child, style}) => {
  return <span className="pill" style={{backgroundColor: style}}>{child}</span>;
};

const Card = ({child, style}) => {

  return(

    <div class="card">
      <div class="card-image">
        <img src="../../../public/icon-512.png" />
      </div>
      <div class="card-details">
        <h2 class="card-name">Name <Pill child={child} style={style} /></h2>         
        <p>
          Price
        </p>
      </div>
    </div>

  );
}

export default Card;