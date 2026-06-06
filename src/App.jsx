import React from "react";
import Card from "./components/Card/Card.jsx";

const App = () => {

  return (
    <>
        <h1>MTG Card Finder</h1>
        <label for="request">I'm looking for </label>
        <input type="text" id="request" placeholder="card name" />
        <button id="searchButton">Go for it</button>
        <Card />
    </>
  );

};

export default App;

