import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header/Header.jsx";
import Input from "./components/Input/Input.jsx";
import CardsList from "./components/CardsList/CardsList.jsx";
import CardDetails from "./components/CardDetails/CardDetails.jsx";
import createApiClient from "./services/createApiClient.js";
import getCardPrices from "./services/getCardPrices.js";
import "./App.css";

const scryfallClient = createApiClient("https://api.scryfall.com");

const App = () => {
  const [theme, setTheme] = useState("dark");
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cardData, setCardData] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [cardPrices, setCardPrices] = useState([]);

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
      return;
    }

    const fetchPrints = async () => {
      try {
        const prices = await getCardPrices(activeCard.prints_search_uri);
        setCardPrices(prices);
      } catch (error) {
        console.error(error);
        setCardPrices([]);
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
        <Header />

        <Input
          id="scryfall-named"
          placeholder="Enter card name"
          label="I'm looking for"
          onSubmit={handleSearchSubmit}
          isLoading={isLoading}
          value={searchText}
          onChange={setSearchText}
        />

        {cardData.length > 0 && <CardsList cardData={cardData} onCardSelect={handleCardSelect} />}
      </div>

      {activeCard && (
        <div className="top-layer">
          <Header />
          <CardDetails card={activeCard} onClose={handleCloseDetails} cardPrices={cardPrices} />
        </div>
      )}
    </>
  );
};

export default App;
