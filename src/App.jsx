import { useEffect, useMemo, useState } from "react";
import FloatingNavBar from "./components/FloatingNavBar/FloatingNavBar.jsx";
import Header from "./components/Header/Header.jsx";
import CardsList from "./components/CardsList/CardsList.jsx";
import CardDetails from "./components/CardDetails/CardDetails.jsx";
import createApiClient from "./services/createApiClient.js";
import getCardPrices from "./services/getCardPrices.js";
import getCardRulings from "./services/getCardRulings.js";
import "./App.css";

const scryfallClient = createApiClient("https://api.scryfall.com");

const App = () => {
  const [theme, setTheme] = useState("dark");
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cardData, setCardData] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [cardPrices, setCardPrices] = useState([]);
  const [cardRulings, setCardRulings] = useState([]);

  const activeCard = useMemo(
    () => cardData.find((card) => card.id === selectedCardId),
    [cardData, selectedCardId]
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.reactIsReady = true;
    const logoButton = document.getElementById("splash-logo");
    if (logoButton) {
      logoButton.classList.add("ready");
    }
  }, []);

  useEffect(() => {
    fetchCards("cards/random", { format: "json" });
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

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchText.trim();
    if (!query) {
      return;
    }

    fetchCards("cards/search", { q: query });
  };

  const handleCardSelect = (cardId) => {
    setSelectedCardId(cardId);
  };

  const handleCloseDetails = () => {
    setSelectedCardId(null);
  };

  return (
    <>
      <div className="main-layer">
        {/*<Header />*/}
        
        <FloatingNavBar
          onNavigate={(id) => console.log("navigate to:", id)}
          handleSearchSubmit={handleSearchSubmit}
          isLoading={isLoading}
          searchText={searchText}
          setSearchText={setSearchText}
        />

        {cardData.length > 0 && <CardsList cardData={cardData} onCardSelect={handleCardSelect} />}
      </div>

      {activeCard && (
        <div className="top-layer">
          {/*<Header />*/}
          <CardDetails 
            card={activeCard} 
            onClose={handleCloseDetails} 
            cardPrices={cardPrices} 
            cardRulings={cardRulings} />
        </div>
      )}
    </>
  );
};

export default App;
