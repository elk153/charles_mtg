import React, { useEffect } from "react";
import Header from "./components/Header/Header.jsx";
import Card from "./components/Card/Card.jsx";
import createApiClient from "./services/createApiClient.js";
import "./App.css";

const App = () => {

  useEffect( () => {

    window.reactIsReady = true;
    const logoButton = document.getElementById("splash-logo");
    if (logoButton) { logoButton.classList.add("ready")};

  }, []);

  const scryfallClient = createApiClient("https://api.scryfall.com");
  const card = scryfallClient.fetchData("cards/named",  { exact: "Black Lotus" });;
  console.log(card);

  return (
    <>
        <Header />
        <label htmlFor="request">I'm looking for </label>
        <input type="text" id="request" placeholder="card name" />
        <button id="searchButton">Go for it</button>
        <Card child="Common" style="gold" />
    </>
  );

};

export default App;

