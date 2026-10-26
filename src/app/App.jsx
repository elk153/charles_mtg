import { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate, useLocation, useMatches, useResolvedPath } from "react-router";
import FloatingNavBar from "../components/FloatingNavBar/FloatingNavBar.jsx";
import CardOverlay from "../features/scryfall-card-renderer/CardOverlay/CardOverlay.jsx";
import IconClose from "../assets/IconClose.tsx";
import "./App.css";
import useScryfallCardsSearch from "../hooks/useScryfallCardsSearch.ts";
import usePreFetchUrl from "../hooks/usePreFetchUrl.ts";

const App = () => {
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [randomSeed, setRandomSeed] = useState(() => Date.now());
  const navigate = useNavigate();
  const location = useLocation();
  const routeParams = useMatches().slice(-1)[0]?.params ?? {};
  const { searchQuery, cardId } = routeParams;

  const normalizedSearchQuery = searchQuery ?? "";
  const isRandomRoute = location.pathname === useResolvedPath("random").pathname;

  // Avoid issuing an automatic empty `cards/search?q=` request when the
  // route contains no search term. Manual submits with an empty field still
  // go to the random route via FloatingNavBar and should trigger the random API.
  const shouldDoSearch = !isRandomRoute && normalizedSearchQuery.length > 0;
  const routeParam = isRandomRoute ? "cards/random" : shouldDoSearch ? "cards/search" : null;
  const queryParam = isRandomRoute ? { format: "json" } : shouldDoSearch ? { q: normalizedSearchQuery, format: "json" } : {};
  const seedParam = isRandomRoute ? randomSeed : 0;

  const { data: scryfallCards, isLoading: isLoadingCards } = useScryfallCardsSearch(
    routeParam,
    queryParam,
    seedParam
  );

  // If URL is the card-detail route (direct link), fetch that single card so
  // we can render the overlay on top of a search that contains only it.
  const routeCardId = cardId ?? null;
  const { data: cardFromRoute, isLoading: isLoadingCardRoute } = useScryfallCardsSearch(
    routeCardId ? `cards/${routeCardId}` : null,
    {},
    0
  );

  const effectiveCards = cardFromRoute?.length ? cardFromRoute : scryfallCards;
  usePreFetchUrl("cardSymbols", "https://api.scryfall.com/symbology", Infinity);

  

  const activeCard = useMemo(
    () => effectiveCards?.find((card) => card.id === selectedCardId),
    [effectiveCards, selectedCardId]
  );

  const overlayCard = selectedCardId
    ? activeCard
    : cardFromRoute?.[0];

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
    // Whenever we leave a card-detail route, clear the in-memory selection
    // so the overlay is closed. This covers Back navigation and close.
    const currentId = cardId ?? null;

    if (!currentId && selectedCardId) {
      setTimeout(() => {
        setSelectedCardId(null);
      }, 0);
    }
  }, [cardId, location.pathname, selectedCardId]);

  const handleCardSelect = (cardId) => {
    setSelectedCardId(cardId);
  };

  const handleCloseDetails = () => {
    // If the overlay was opened from the in-app list, go back in history.
    if (location.state?.fromList) {
      // Navigate back first and let the location-change effect clear selection state.
      navigate(-1);
      return;
    }

    // Otherwise (external link), navigate to a cards search for that name.
    const card = effectiveCards?.find((c) => c.id === selectedCardId) || effectiveCards?.[0];
    setSelectedCardId(null);
    if (card?.name) {
      navigate(`cards/${encodeURIComponent(card.name)}`);
    }
  };

  return (
    <>
      <div className="main-layer">
        {/*<Header />*/}
        
        <FloatingNavBar // use navbar for Aria
          isLoading={isLoadingCards}
          onRandomRequest={() => setRandomSeed(Date.now())}
        />

        <Outlet context={{ scryfallCards: effectiveCards, isLoadingCards: isLoadingCards || isLoadingCardRoute, onCardSelect: (id) => {
          // Called when clicking a card in the list: set selection and navigate
          // with history state so we know the overlay was opened from the list.
          setSelectedCardId(id);
          const encoded = encodeURIComponent(id);
          navigate(`card/${encoded}`, { state: { fromList: true, fromPath: location.pathname + location.search } });
        } }} />
      </div>
      


      {overlayCard && (
        <>
          <div className="nav-close">
            <button className="nav-icon" onClick={handleCloseDetails}>
              <IconClose />
            </button>
          </div>
          <div className="top-layer">
              <CardOverlay 
                card={overlayCard} 
                onCardSelect={handleCardSelect}
              />
          </div>
        </>
      )}
    </>
  );
};

export default App;
