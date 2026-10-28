# V2 Card Browser

This note describes the first working card-browser flow in `/v2`. It does not
turn the Favorites, Binder, or Decks placeholder pages into stored user
features; the matching card actions currently announce that they are under
construction.

## How to try it

1. Run `npm run dev`.
2. Open `/v2/search?q=lightning%20bolt` and submit a card name in the V2 search
   field, or use an empty submit to open `/v2/search/random`.
3. Toggle a color, rarity, or type filter and see the result list and URL query
   update without another Scryfall search request.
4. Open a card to inspect its details. Its ID is added to the URL, so reloading
   or sharing the link opens the same card overlay. Close it with the close
   button, Escape, or browser Back.

## Architecture and concepts

- **Routes and deep links:** the app opens `/v2/home`, which displays the
  daily seven-card set. `/v2/search?q=...` is the name-search route;
  `/v2/search/random` is the daily mulligan route. `?card=<id>` opens a card
  overlay without replacing the search URL. React Router and nuqs keep the
  existing filter URL state.
- **Cached queries:** `useScryfallCardsSearch` keys requests by endpoint,
  parameters, and seed. Search results remain cached for 24 hours. The filter
  controls operate on the current cached Scryfall result; changing a filter
  does not create an API request. Scryfall search is paginated at 175 cards,
  so this V2 browser flow does not yet fetch later pages.
- **Set picker / mulligan:** the V2 layout prefetches `/sets` alongside card
  symbols. `getMulliganSets` currently allows released, non-digital sets with
  at least five cards whose `set_type` is `core`, `expansion`, `masters`,
  `draft_innovation`, `eternal`, or `funny`. Scryfall's Set object does not
  expose a direct booster-eligibility flag, so this explicit allowlist is the
  extension point for additional product types. The selected set is stable for
  the UTC day. One random-ordered `cards/search` request with `unique=cards`
  supplies a cached pool; seven different cards are displayed from its first
  page rather than fetching every page of a set.
- **Rendering:** search tiles use the normal Scryfall card image at a shared
  250px target width. The existing normalized card renderer is reused in the
  detail panel so its layout-specific renderers handle split, transform, flip,
  meld, and other formats. Double-faced tiles flip on desktop hover and with
  the focused button on keyboard or touch. The button has an accessible name
  and pressed state.
- **Detail overlay:** the card ID is URL-backed. Rulings are queried through
  TanStack Query; the print query supplies both printing images and their
  current `prices.eur` / `prices.eur_foil` fields, avoiding a separate price
  endpoint. The details column is narrower than the print column on desktop;
  both scroll independently on wide screens and stack on narrow screens.
  Double-faced cards have one flip control below the artwork, and printed-card
  tiles expose the same flip, favorites, binder, and decks actions as
  search results. Art crops retain an artist and Wizards of the Coast
  attribution in the same interface.
- **Shared UI:** navigation source state is stored as `?source=collection`, so
  it is bookmarkable and the desktop/mobile controls stay synchronized.
  Scryfall is the default; switching to collection displays an
  under-construction notice. Filter categories are selected through
  `FILTER_CATEGORIES_BY_FEATURE`.
- **TypeScript:** the new browser UI, relevant V2 navigation, query helpers,
  and reused turn/close icons are TypeScript. Existing V1 stays in place and
  still uses its existing flow.

## Scryfall request behavior

The app uses Scryfall's browser fetch and preserves the browser User-Agent;
requests explicitly accept JSON. Card search is only triggered when a search
is submitted or a daily mulligan set is selected. TanStack Query caches these
responses for 24 hours, consistent with Scryfall's caching guidance and its
2-requests-per-second card-search limit. If the API returns an error or an
unexpected response shape, the browser shows an error instead of substituting
success-shaped data.

## Validation performed

- `npm run typecheck` — passes.
- `npm run build` — passes.
- Targeted ESLint on the changed TypeScript browser/navigation surfaces —
  passes.
- `npm run lint` — still reports the pre-existing legacy renderer/icon lint
  errors in addition to any repo-wide baseline; compare its output with
  `AGENTS.md` before attributing those errors to this feature.
- Browser check: `/v2/search?q=lightning%20bolt` loaded two results; clicking
  Red added `colors=R` to the URL; a card action showed its construction
  notice; the details overlay showed printings and prices; and
  `/v2/search/random` selected Return to Ravnica and displayed seven unique
  cards from its cached 175-card search page.
