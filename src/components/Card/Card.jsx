import React from "react";

import "./Card.css";

const Pill = ({child, style}) => {
  return <span className="pill" style={{backgroundColor: style}}>{child}</span>;
};

const Card = ({child, style}) => {

  return(

    <div className="card">
      <div className="card-image">
        <img src="../../../public/icon-512.png" />
      </div>
      <div className="card-details">
        <h2 className="card-name">Name <Pill child={child} style={style} /></h2>         
        <p>
          Price
        </p>
      </div>
    </div>

  );
}

export default Card;