import React, {useEffect} from "react";
import Card from "./components/Card/Card.jsx";

const App = () => {

  useEffect( () => {

    window.reactIsReady = true;
    const logoButton = document.getElementById("splash-logo");
    if (logoButton) { logoButton.classList.add("ready")};

  }, []);

  return (
    <>
        <h1>MTG Card Collector</h1>
        <label for="request">I'm looking for </label>
        <input type="text" id="request" placeholder="card name" />
        <button id="searchButton">Go for it</button>
        <Card child="Common" style="gold" />
    </>
  );

};

export default App;

