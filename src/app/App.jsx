import { useEffect, useMemo, useState } from "react";
import FloatingNavBar from "../components/FloatingNavBar/FloatingNavBar.jsx";
import CardsList from "../features/original-card-renderer/CardsList/CardsList.jsx"
import CardOverlay from "../features/scryfall-card-renderer/CardOverlay/CardOverlay.jsx";
import IconClose from "../assets/IconClose.jsx";
import "./App.css";
import { Outlet } from "react-router";
import useScryfallCardsSearch from "../hooks/useScryfallCardsSearch.jsx";
import useFetchUrl from "../hooks/useFetchUrl.jsx";

const App = () => {
  const [theme, setTheme] = useState("dark");
  const [searchText, setSearchText] = useState("");
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [searchRequest, setSearchRequest] = useState({
    routeParam: "cards/random",
    queryParam: { format: "json" },
    seedParam: 0,
  });

  const { data: scryfallCards, isLoading: isLoadingCards } = useScryfallCardsSearch(searchRequest.routeParam, searchRequest.queryParam, searchRequest.seedParam);
  const { data: scryfallSymbols } = useScryfallCardsSearch("symbology", { format: "json" }, 0); // need to add duration
  
 

  const activeCard = useMemo(
    () => scryfallCards?.find((card) => card.id === selectedCardId),
    [scryfallCards, selectedCardId]
  );

  const { data: scryfallRulings, isLoading: isLoadingRulings } = useFetchUrl("cardRulings", activeCard?.rulings_uri)
  const { data: scryfallPrints, isLoading: isLoadingPrints } = useFetchUrl("cardPrints", activeCard?.prints_search_uri)
  console.log(scryfallPrints)

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


  
  return (
    <>
      <div className="main-layer">
        {/*<Header />*/}
        
        <FloatingNavBar // use navbar for Aria
          onNavigate={(id) => console.log("navigate to:", id)}
          handleSearchSubmit={handleSearchSubmit}
          isLoading={isLoadingCards}
          searchText={searchText}
          setSearchText={setSearchText}
        />

        {scryfallCards && <CardsList cardData={scryfallCards} onCardSelect={handleCardSelect} />}
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
            {isLoadingPrints || isLoadingRulings
              ?
              <p>Loading</p>
              :
              <CardOverlay 
                card={activeCard} 
                cardPrints={scryfallPrints} 
                cardSymbols={scryfallSymbols}
                cardRulings={scryfallRulings} 
                onCardSelect={handleCardSelect}
              />
              /**<CarRenderer card={activeCard} />*/
            }
          </div>
        </>
      )}
    </>
  );
};

export default App;
