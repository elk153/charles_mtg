import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useParams } from "react-router";
import FloatingNavBar from "../components/FloatingNavBar/FloatingNavBar.jsx";
import CardOverlay from "../features/scryfall-card-renderer/CardOverlay/CardOverlay.jsx";
import IconClose from "../assets/IconClose.jsx";
import "./App.css";
import useScryfallCardsSearch from "../hooks/useScryfallCardsSearch.jsx";
import usePreFetchUrl from "../hooks/usePreFetchUrl.jsx";

const App = () => {
  const [theme] = useState("dark");
  const [searchText, setSearchText] = useState("");
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [randomSeed, setRandomSeed] = useState(() => Date.now());
  const location = useLocation();
  const { searchQuery } = useParams();

  const normalizedSearchQuery = searchQuery ? decodeURIComponent(searchQuery) : "";
  const isRandomRoute = location.pathname === "/random";
  const routeParam = isRandomRoute ? "cards/random" : "cards/search";
  const queryParam = isRandomRoute ? { format: "json" } : { q: normalizedSearchQuery, format: "json" };
  const seedParam = isRandomRoute ? randomSeed : 0;

  const { data: scryfallCards, isLoading: isLoadingCards } = useScryfallCardsSearch(
    routeParam,
    queryParam,
    seedParam
  );
  usePreFetchUrl("cardSymbols", "https://api.scryfall.com/symbology", Infinity);

  const randomCardName = isRandomRoute && scryfallCards?.[0]?.name ? scryfallCards[0].name : undefined;

  const activeCard = useMemo(
    () => scryfallCards?.find((card) => card.id === selectedCardId),
    [scryfallCards, selectedCardId]
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
          isLoading={isLoadingCards}
          searchText={searchText}
          setSearchText={setSearchText}
          onRandomRequest={() => setRandomSeed(Date.now())}
          isRandomRoute={isRandomRoute}
          randomCardName={randomCardName}
        />

        <Outlet context={{ scryfallCards, isLoadingCards, onCardSelect: setSelectedCardId }} />
      </div>
      


      {activeCard && (
        <>
          <div className="nav-close">
            <button className="nav-icon" onClick={handleCloseDetails}>
              <IconClose />
            </button>
          </div>
          <div className="top-layer">
            {!activeCard
              ?
              <div className="card-details">
                <div className="card-overlay-info oracle-panel-dark corner-got parchment-frame-metallic">
                  <h3 style={{textAlign: "center"}}>Summoning...</h3>
                </div>
              </div>
              :
              <CardOverlay 
                card={activeCard} 
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
