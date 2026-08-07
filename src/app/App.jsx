import { useEffect, useMemo, useState } from "react";
import FloatingNavBar from "../components/FloatingNavBar/FloatingNavBar.jsx";
import CardsList from "../features/original-card-renderer/CardsList/CardsList.jsx"
import CardOverlay from "../features/scryfall-card-renderer/CardOverlay/CardOverlay.jsx";
import createApiClient from "../services/createApiClient.js";
import getCardPrices from "../services/getCardPrices.js";
import getCardRulings from "../services/getCardRulings.js";
import IconClose from "../assets/IconClose.jsx";
import "./App.css";
import { Outlet } from "react-router";
import { useQuery } from "@tanstack/react-query";
import useScryfallCardsSearch from "../hooks/useScryfallCardsSearch.jsx";

const scryfallClient = createApiClient("https://api.scryfall.com");

const App = () => {
  const [theme, setTheme] = useState("dark");
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cardData, setCardData] = useState([]);
  const [cardSymbols, setCardSymbols] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [cardPrices, setCardPrices] = useState([]);
  const [cardRulings, setCardRulings] = useState([]);
  const [searchRequest, setSearchRequest] = useState({
    routeParam: "cards/random",
    queryParam: { format: "json" },
    seedParam: 0,
  });

  const activeCard = useMemo(
    () => cardData.find((card) => card.id === selectedCardId),
    [cardData, selectedCardId]
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.reactIsReady = true;

    const splashLogo = document.getElementById("splash-logo");
    const splashBackground = document.getElementById("splash-background");
    const root = document.getElementById("root");

    if (!splashLogo || !splashBackground || !root) {
      return;
    }

    // Trigger the visual transition: both splash background and logo
    // will transition their opacity to the same level to keep a uniform color.
    splashBackground.classList.add("ready");
    splashLogo.classList.add("ready");

    const handleTransitionEnd = (event) => {
      // Wait specifically for the opacity transition on the splash background
      if (event.propertyName !== "opacity") return;

      // Reveal the app root and move the splash behind the app content
      root.classList.add("visible");
      splashBackground.classList.add("background");

      // Clean up listener
      splashBackground.removeEventListener("transitionend", handleTransitionEnd);
    };

    // Attach to splashBackground so we observe the container opacity end
    splashBackground.addEventListener("transitionend", handleTransitionEnd);

    return () => {
      splashBackground.removeEventListener("transitionend", handleTransitionEnd);
    };

  }, []);

  useEffect(() => {
    /*fetchCards("cards/random", { format: "json" });*/
    /*fetchCardSymbols("symbology");*/
  }, []);

  useEffect(() => {
    if (!activeCard?.prints_search_uri) {
      setCardPrices([]);
      setCardRulings([]);
      return;
    }

    const fetchPrints = async () => {
      try {
        const prices = await getCardPrices(activeCard.prints_search_uri);
        setCardPrices(prices);
        const rulings = await getCardRulings(activeCard.rulings_uri);
        setCardRulings(rulings);
      } catch (error) {
        console.error(error);
        setCardPrices([]);
        setCardRulings([]);
      }
    };

    fetchPrints();
  }, [activeCard]);

  const fetchCards = async (path, params = {}) => {
    setIsLoading(true);

    try {
      const data = await scryfallClient.fetchData(path, params);
      setCardData(data);
      setSelectedCardId(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCardSymbols = async (path, params = {}) => {
    try {
      const data = await scryfallClient.fetchData(path, params);
      setCardSymbols(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchText.trim();
    setSearchRequest(
    (query === "" || !query)
      ? { routeParam: "cards/random", queryParam: { format: "json" }, seedParam: Math.random() }
      : { routeParam: "cards/search", queryParam: { q: query }, seedParam: 0 }
    );
  };

  const handleCardSelect = (cardId) => {
    setSelectedCardId(cardId);
  };

  const handleCloseDetails = () => {
    setSelectedCardId(null);
  };

  const { data: scryfallCards } = useScryfallCardsSearch(searchRequest.routeParam, searchRequest.queryParam, searchRequest.seedParam);
  const { data: scryfallSymbols } = useScryfallCardsSearch("symbology", { format: "json" }, 0);
  console.log(scryfallSymbols);
  

  return (
    <>
      <div className="main-layer">
        {/*<Header />*/}
        
        <FloatingNavBar // use navbar for Aria
          onNavigate={(id) => console.log("navigate to:", id)}
          handleSearchSubmit={handleSearchSubmit}
          isLoading={isLoading}
          searchText={searchText}
          setSearchText={setSearchText}
        />

        {scryfallCards && <CardsList cardData={scryfallCards} onCardSelect={handleCardSelect} />}
        {/*cardData.length > 0 && <CardsList cardData={cardData} onCardSelect={handleCardSelect} />*/}
        {/*<Outlet />*/}
      </div>
      


      {activeCard && (
        <>
          <div className="nav-close">
            <button className="nav-icon" onClick={handleCloseDetails}>
              <IconClose />
            </button>
          </div>
          <div className="top-layer">
            <CardOverlay 
              card={activeCard} 
              cardPrices={cardPrices} 
              cardSymbols={cardSymbols}
              cardRulings={cardRulings} 
              onCardSelect={handleCardSelect}
            />
            {/**<CarRenderer card={activeCard} />*/}
          </div>
        </>
      )}
    </>
  );
};

export default App;
