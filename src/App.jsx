import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header/Header.jsx";
import Input from "./components/Input/Input.jsx";
import CardsList from "./components/CardsList/CardsList.jsx";
import CardDetails from "./components/CardDetails/CardDetails.jsx";
import createApiClient from "./services/createApiClient.js";
import getCardPrices from "./services/getCardPrices.js";
import "./App.css";


// Create a API Client to run Scryfall requests
const scryfallClient = createApiClient("https://api.scryfall.com");

const App = () => {

  // State variables
  const [theme, setTheme] =useState("dark"); // Light vs dark theme
  const [searchQuery, setSearchQuery] = useState({ path: "", params: {} }); // Search Field content
  const [isLoading, setIsloading] = useState(false); // Loading state 
  const [cardData, setCardData] = useState([]); // Returned card data
  const [cardId, setCardId] = useState(null); // Returned card data
  const [isCardDetails, setIsCardDetails] = useState(false); // Returned card data
  const [cardPrices, setCardPrices] = useState([]);
  const isFirstPageLoad = useRef(true); // Initial page load
  
  // When theme changes, modify the data-theme attribute
  useEffect( () => {

    document.documentElement.setAttribute("data-theme", theme);

  }, [theme] );

  // Make the splashcreen clickable once react is loaded
  useEffect( () => {

    window.reactIsReady = true;

    const logoButton = document.getElementById("splash-logo");
    if (logoButton) { logoButton.classList.add("ready")};

  }, [] );

  // Load a random card on page load
  useEffect( () => {

    handleSubmit(event, "cards/random", {format:"json"});
    isFirstPageLoad.current = false
     
  }, [] );

  useEffect( () => {

    if (!isCardDetails) return;

    async function fetchPrints () {

      const fetchedPrices = await getCardPrices(cardData[0].prints_search_uri);
      setCardPrices(fetchedPrices);
      console.log(fetchedPrices);

    };

    fetchPrints();
    

  }, [isCardDetails] );

  // Handle search on submit
  const handleSubmit  = async (event, path, params) => {

    // Difference between first page load and subsequent ones
    isFirstPageLoad.current == false && event.preventDefault();

    setIsloading(true);

    try {
      const data = await scryfallClient.fetchData(path, params);
      setCardData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsloading(false);
    }
  };

  return (

    <>
      <div className="main-layer">

        <Header />

        <Input 
          id="scryfall-named" 
          placeholder="Enter card name" 
          label="I'm looking for" 
          onSubmit={ () => {handleSubmit(event, "cards/search", searchQuery.params) } }
          isLoading={isLoading}
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
        />

       {cardData && (
          <>
            <CardsList 
              cardData={cardData} 
              setCardId={setCardId} 
              setIsCardDetails={setIsCardDetails}
            />
          </>
        )}

      </div>

      {isCardDetails ===true && (
        
        <div className="top-layer">

          <Header />

          <CardDetails 
            cardData={cardData.filter( (f) => f.id === cardId)}
            setIsCardDetails={setIsCardDetails}
            cardPrices={cardPrices}
          />

        </div>

      )}

    </>
  );

};

export default App;

