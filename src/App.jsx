import React, { useState, useEffect } from "react";
import Header from "./components/Header/Header.jsx";
import Card from "./components/Card/Card.jsx";
import createApiClient from "./services/createApiClient.js";
import "./App.css";

const App = () => {

  const [cardData, setCardData] = useState(null);

  useEffect( () => {

    window.reactIsReady = true;
    const logoButton = document.getElementById("splash-logo");
    if (logoButton) { logoButton.classList.add("ready")};

  }, []);

  //const scryfallClient = createApiClient("https://api.scryfall.com");
  //scryfallClient
  //  .fetchData("cards/named", { exact: "Black Lotus" })
  //  .then((data) => {
    //  console
  //    setCardData(data);
 //   });


  return (
    <>
        <Header />
        <label htmlFor="request">I'm looking for </label>
        <input type="text" id="request" placeholder="card name" />
        <button id="searchButton">Go for it</button>
        <Card child=/*{cardData.name}*/"Rare" style="gold" />
    </>
  );

};

export default App;

