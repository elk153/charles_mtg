import React, { useState, useEffect, use } from "react";
import Header from "./components/Header/Header.jsx";
import Card from "./components/Card/Card.jsx";
import Input from "./components/Input/Input.jsx";
import createApiClient from "./services/createApiClient.js";
import "./App.css";

const scryfallClient = createApiClient("https://api.scryfall.com");

const App = () => {

  const [theme, setTheme] =useState("dark");
  const [searchQuery, setSearchQuery] = useState({ path: "", params: {} });
  const [isLoading, setIsloading] = useState(false);
  const [cardData, setCardData] = useState(null);
  const [isFirstRender, setIsFirstRender] = useState(true);
  
  // When state value theme changes, modify the data)theme attribute
  useEffect( () => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme] );

  // Make the splashcreen clickable once react is loaded
  useEffect( () => {
    window.reactIsReady = true;
    const logoButton = document.getElementById("splash-logo");
    if (logoButton) { logoButton.classList.add("ready")};
  }, [] );

  useEffect( () => {    
    firstSearch()
  }, [] );

  const handleSearch  = async (event) => {
    event.preventDefault();

    const { path, params } = searchQuery; // destructuring
    if (!params.exact.trim()) return;

    setIsloading(true);
    try {
      const data = await scryfallClient.fetchData(path, params);
      setCardData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsloading(false);
    }
  }

  const firstSearch  = async (event) => {

    setIsloading(true);
    try {
      const data = await scryfallClient.fetchData("cards/random", {format:"json"});
      setCardData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsloading(false);
    }
  }

  return (
    <>
        <Header />

        <Input 
          id="scryfall-named" 
          placeholder="Enter card name" 
          label="I'm looking for" 
          onSubmit={handleSearch}
          isLoading={isLoading}
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
        />

        {cardData && (
          <>
            <img src={cardData.image_uris.border_crop} alt={cardData.name} />
          </>
        )}

    </>
  );

};

export default App;

