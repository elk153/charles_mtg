import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router";
import CardFilters from "../card-filters/CardFilters.tsx";
import { useCardsTable } from "../card-filters/useCardsTable.ts";
import CardTile from "./CardTile.tsx";
import CardDetailsOverlay from "./CardDetailsOverlay.tsx";
import type { CardAction, CardBrowserCard } from "./types.ts";
import { isCardBrowserCard } from "./types.ts";
import useScryfallCardsSearch from "../../hooks/useScryfallCardsSearch.ts";
import useFetchUrl from "../../hooks/useFetchUrl.ts";
import {
  getMulliganSets,
  isScryfallSet,
  selectDailyMulliganSet,
} from "./mulliganSets.ts";
import "./CardBrowserPage.css";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const NO_DATA: unknown[] = [];

const ACTION_LABELS: Record<CardAction, string> = {
  favorite: "Favorites",
  collection: "Collection",
  deck: "Decks",
};

export default function CardBrowserPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();
  const [notice, setNotice] = useState("");
  const searchQuery = searchParams.get("q")?.trim() ?? "";
  const cardId = searchParams.get("card");
  const isRandomRoute = pathname.endsWith("/random");
  const [dailyDay, setDailyDay] = useState(() =>
    Math.floor(Date.now() / MILLISECONDS_PER_DAY),
  );

  useEffect(() => {
    const nextUtcMidnight = (dailyDay + 1) * MILLISECONDS_PER_DAY;
    const timer = window.setTimeout(
      () => setDailyDay(Math.floor(Date.now() / MILLISECONDS_PER_DAY)),
      nextUtcMidnight - Date.now(),
    );
    return () => window.clearTimeout(timer);
  }, [dailyDay]);
  const setsQuery = useFetchUrl(
    "scryfallSets",
    "https://api.scryfall.com/sets",
  );
  const rawSets = setsQuery.data ?? NO_DATA;
  const invalidSetData = rawSets.some((value) => !isScryfallSet(value));
  const availableSets = useMemo(
    () =>
      invalidSetData
        ? []
        : getMulliganSets(rawSets.filter(isScryfallSet)),
    [invalidSetData, rawSets],
  );
  const mulliganSet = isRandomRoute
    ? selectDailyMulliganSet(availableSets, dailyDay)
    : undefined;
  const mulliganQuery = mulliganSet
    ? `set:${mulliganSet.code}`
    : "";
  const routeParam = isRandomRoute
    ? mulliganSet
      ? "cards/search"
      : null
    : searchQuery
      ? "cards/search"
      : null;
  const queryParams = isRandomRoute
    ? { q: mulliganQuery, unique: "cards", order: "random", format: "json" }
    : { q: searchQuery, format: "json" };
  const querySeed = isRandomRoute ? dailyDay : 0;
  const search = useScryfallCardsSearch(routeParam, queryParams, querySeed);
  const rawCards = search.data;
  const invalidCardData = rawCards?.some((card) => !isCardBrowserCard(card)) ?? false;
  const cards = useMemo<CardBrowserCard[]>(
    () =>
      rawCards && !invalidCardData
        ? rawCards.filter(isCardBrowserCard).slice(0, isRandomRoute ? 5 : undefined)
        : [],
    [rawCards, invalidCardData, isRandomRoute],
  );
  const { table, filters, setFilters, resetFilters } = useCardsTable(cards);
  const rows = table.getRowModel().rows;
  const cardsById = useMemo(
    () => new Map(cards.map((card) => [card.id, card])),
    [cards],
  );
  const orderedCards = rows.map((row) => {
    const card = cardsById.get(row.original.id);
    if (!card) throw new Error(`Filtered card ${row.original.id} was not in the cached result.`);
    return card;
  });
  const total = isRandomRoute ? cards.length : rawCards?.length ?? 0;

  function openCard(card: CardBrowserCard) {
    const next = new URLSearchParams(searchParams);
    next.set("card", card.id);
    setSearchParams(next, { preventScrollReset: true });
  }

  const closeDetails = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete("card");
    setSearchParams(next, { preventScrollReset: true });
  }, [searchParams, setSearchParams]);

  function showActionNotice(action: CardAction, card: CardBrowserCard) {
    setNotice(`${ACTION_LABELS[action]} for ${card.name} is under construction.`);
  }

  return (
    <section className="card-browser-page">
      <header className="card-browser__heading">
        <h1>{isRandomRoute ? "Mulligan" : searchQuery || "Search cards"}</h1>
        {isRandomRoute && mulliganSet && (
          <p>Today’s set: {mulliganSet.name} ({mulliganSet.code.toUpperCase()})</p>
        )}
        {!isRandomRoute && !searchQuery && (
          <p>Enter a card name in the search field to browse Scryfall.</p>
        )}
      </header>

      {isRandomRoute && setsQuery.isLoading && (
        <p className="card-browser__message" role="status">
          Choosing today’s set…
        </p>
      )}

      {isRandomRoute && setsQuery.error && (
        <p className="card-browser__message card-browser__message--error" role="alert">
          Could not load Scryfall sets: {setsQuery.error.message}
        </p>
      )}

      {isRandomRoute && invalidSetData && (
        <p className="card-browser__message card-browser__message--error" role="alert">
          Scryfall returned set data in an unexpected format.
        </p>
      )}

      {isRandomRoute &&
        !setsQuery.isLoading &&
        !setsQuery.error &&
        !invalidSetData &&
        !mulliganSet && (
          <p className="card-browser__message" role="status">
            No booster-focused sets are available for today’s mulligan.
          </p>
        )}

      {search.isLoading && (
        <p className="card-browser__message" role="status">
          {isRandomRoute ? "Choosing five cards…" : "Loading cards…"}
        </p>
      )}

      {search.error && (
        <p className="card-browser__message card-browser__message--error" role="alert">
          Could not load cards: {search.error.message}
        </p>
      )}

      {invalidCardData && (
        <p className="card-browser__message card-browser__message--error" role="alert">
          Scryfall returned card data in an unexpected format.
        </p>
      )}

      {!search.isLoading && !search.error && !invalidCardData && routeParam && total === 0 && (
        <p className="card-browser__message">No cards found.</p>
      )}

      {cards.length > 0 && (
        <>
          <CardFilters
            filters={filters}
            setFilters={setFilters}
            onReset={resetFilters}
            shown={rows.length}
            total={total}
            feature="search"
            layout="floating"
          />
          <div className="card-browser__list" aria-label="Card search results">
            {orderedCards.map((card) => (
              <CardTile
                key={card.id}
                card={card}
                onSelect={openCard}
                onAction={showActionNotice}
              />
            ))}
          </div>
          {rows.length === 0 && (
            <p className="card-browser__message">No cards match these filters.</p>
          )}
        </>
      )}

      {notice && (
        <p className="card-browser__notice" role="status">
          {notice}
          <button type="button" onClick={() => setNotice("")}>
            Dismiss
          </button>
        </p>
      )}
      {cardId && (
        <CardDetailsOverlay
          key={cardId}
          cardId={cardId}
          fallbackCard={cards.find((card) => card.id === cardId)}
          onClose={closeDetails}
        />
      )}
    </section>
  );
}
