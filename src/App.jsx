import React, { useState, useEffect } from "react";
import Header from "./components/Header/Header.jsx";
import Card from "./components/Card/Card.jsx";
import Input from "./components/Input/Input.jsx";
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
        <br />
        <Input 
          id="scryfall-named" 
          type="text" 
          placeholder="Enter card name" 
          label="I'm looking for" 
        />
        <button id="searchButton">Go for it</button>
        <Card child=/*{cardData.name}*/"Rare" style="gold" />
    </>
  );

};

export default App;

