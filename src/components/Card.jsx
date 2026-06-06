import React from "react";

const Card = () => {

  return(

    <div class="card">
      <div class="card-image">
        <img src="../../../public/icon-512.png" />
      </div>
      <div class="card-details">
        <h2 class="card-name">Name</h2>
        <h3 class="card-rarity">Rarity</h3>      
          <p>
            Price
          </p>
      </div>
    </div>

  );
}

export default Card;