# Charles' MTG Collection — Agent Context

Working map of the app for AI coding agents. Verified against branch `typescript` (commit `a74627d`, "inital mod to TS") in October 2026. Where this file and the source disagree, the source wins; say so and propose a fix to this file.

## How to work with me (read first)

The developer is learning React and TypeScript and wants to understand every change, not just receive code.

- Explain the reasoning *before* changing code, and name the concept used (e.g. "this is a custom hook", "this is a type guard").
- Make small, single-purpose changes. For anything touching more than two files, show a short plan and wait for approval.
- Prefer the simplest approach that fits the existing code over clever abstractions.
- Ask before deleting files, adding dependencies, or converting files between JS and TS.
- After a change, say which command to run to check it (see Commands) and what a pass looks like.
- Do not claim a feature works unless you checked the source or ran the check.

## App at a glance

- React 19 + Vite single-page app for finding Magic: The Gathering cards via the public Scryfall API (`https://api.scryfall.com`).
- Works today: random card, search by name, card detail overlay, rulings, legalities, printings, and per-printing EUR / foil EUR prices.
- No backend, authentication, or user database. TanStack Query caches remote data in memory and persists some of it in browser `localStorage`.
- The README's collection tracking, acquisition/location records, decks, price history, sales and balance are **goals, not features**. Never imply they exist.

## Commands and current status

Node 22 works. Install with `npm install`.

| Command | Purpose | Status on this branch |
|---|---|---|
| `npm run dev` | Vite dev server | works |
| `npm run build` | production build into `dist/` | passes |
| `npm run preview` | serve the build | works |
| `npm run typecheck` | `tsc --noEmit` | passes |
| `npm run lint` | ESLint | **fails: 21 errors, 1 warning (pre-existing)** |

- No test framework or test script exists.
- Lint failures are mostly unused parameters (`props`, `face`, `index`) in icon and `extras/` components, plus `rules-of-hooks` errors in the unused `original-card-renderer/CardDetails`. Do not treat them as caused by your change; compare before and after.
- Run the narrowest check that fits. At minimum run `npm run typecheck` and `npm run build`.

## Active application flow

1. `index.html` loads `/theme.css`, `style.css` and `/src/main.tsx`, and holds `#root` plus the splash elements.
2. `src/main.tsx` mounts `AppProviders` inside `StrictMode`.
3. `src/app/AppProviders.tsx` nests `PersistenceProvider` > `QueryDevToolsProvider` > `RouterProvider`.
4. `src/app/router.jsx` (React Router data router): `/` redirects to `/random`; `/random` and `/cards/:searchQuery` render the cards list; `/card/:cardId` declares `CardOverlay`.
5. `src/app/App.jsx` is the layout route. It owns search and card queries, the floating search bar, outlet context (`scryfallCards`, `isLoadingCards`, `onCardSelect`), the splash transition, and the overlay.
6. `scryfall-card-renderer/CardsList/CardsList.jsx` renders results. Despite the folder name it renders `original-card-renderer/Card/Card.jsx` per item.
7. Clicking a card navigates to `/card/:cardId` with `state.fromList`. `App.jsx` fetches the card if it is a direct link and renders `CardOverlay` in `.top-layer`.

### Gotchas to preserve

- The routed `CardOverlay` (from `router.jsx`) receives no `card` prop and returns `null`. The visible overlay is the one rendered by `App.jsx`. Understand this before touching card-route rendering.
- Closing: if `location.state.fromList`, navigate back in history; otherwise navigate to `/cards/<encoded card name>`.
- Random: seed (`Date.now()`) is part of the query key; an empty search submit changes the seed.
- Keep route params URI-safe (`encodeURIComponent` / `decodeURIComponent`).
- Card symbol data is prefetched in `App.jsx` via `usePreFetchUrl("cardSymbols", ".../symbology", Infinity)` and also read by `useOracleText`.

## Data and state

- `src/hooks/useScryfallCardsSearch.jsx`: TanStack Query hook, key `["scryfallCards", route, params, seed]`, `enabled` only when a route is given, 24 h `staleTime`. Uses `src/services/createApiClient.js`, which normalizes `card` responses to `[card]` and `list`/`catalog` to `data`, and throws on Scryfall errors.
- `src/hooks/useFetchUrl.js`: fetches auxiliary Scryfall URLs (rulings, print searches), key `["fetchedUrl", purpose, url]`, returns `json.data`. It does not check `res.ok`.
- `PersistenceProvider.tsx` persists only `fetchedUrl` queries and `scryfallCards` queries whose second key is `"cards/search"`, via `localStorage` (inspect with `JSON.parse(localStorage.getItem("REACT_QUERY_OFFLINE_CACHE"))`). Random and single-card queries are not persisted.
- `queryProvider.ts`: `gcTime` is 24 h and must stay >= persisted data's max age.
- `QueryDevToolsProvider.tsx` loads Devtools lazily and only when `import.meta.env.DEV`.
- Many files contain debug `console.log` calls (e.g. `createApiClient.js`, `useFetchUrl.js`). Do not add more; ask before removing.
- Prices are current per-printing Scryfall data, not history or collection valuation.

## Source layout (key parts only; list the folders yourself for the rest)

- `src/main.tsx`, `src/app/` — entry, providers (TS), router and `App.jsx` (JS).
- `src/features/scryfall-card-renderer/` — active renderer. `normalizeCard.js` maps raw Scryfall cards to the internal shape; `scryfallCardLayouts.js` and `components/` (one/split/toggle/flip/meld faces, `OracleText`, `extras/` for saga, class, case, leveler, mutate, prototype) consume that shape.
- `src/features/original-card-renderer/` — older renderer. Only its `Card/` is used.
- `src/components/FloatingNavBar/` — active navbar: name search, empty search for random, mobile keyboard/viewport handling, hides on scroll. Also `Input/`.
- `src/hooks/`, `src/services/` — see Data and state.
- `public/theme.css` holds theme tokens (dark/light); `style.css` and `src/app/App.css` hold splash and layer styles. The app is fixed to `"dark"` and has no toggle.
- `references/` — design notes, sequence diagrams (`.mmd`), `CARD.json` sample. May lag the code.
- `NavClaude/` — separate navbar prototype, not imported by `src/`.

## Present but not wired in (do not edit as if live)

`src/app/App2.jsx` (empty), `src/components/Header/` (import commented out in `App.jsx`), `original-card-renderer/CardDetails/` and `original-card-renderer/CardsList/`, `scryfall-card-renderer/CardsList/CardsList.css` (list uses the original `Card` styles), `src/hooks/useCardSearch.js`, `src/services/getCardPrices.js`, `src/services/getCardRulings.js`, `NavClaude/`.

## Planned, not implemented

User-owned collection records (source, physical location), deck building, collection valuation and price history, sales and balance tracking, advanced search (color, role), and page-level navigation (the commented-out routes in `router.jsx`).

## TypeScript migration (the purpose of this branch)

- Currently TypeScript: `main.tsx`, `AppProviders.tsx`, and the three files in `AppProviders/`. Everything else is JS/JSX.
- `tsconfig.json`: `strict: true`, `allowJs: true`, `checkJs: false`, `verbatimModuleSyntax: true`, `allowImportingTsExtensions: true`. JS files are **not** type-checked.
- Imports of `.tsx`/`.ts` files include the extension (as in `AppProviders.tsx`). Use `import type` for type-only imports (required by `verbatimModuleSyntax`).
- Follow the local pattern: convert one file at a time, only when asked, and avoid `any` and non-null assertions in TS files.
- Suggested low-risk next conversions, smallest first: `useScrollDirection`, `createApiClient`, `useFetchUrl`, `useScryfallCardsSearch`, then `normalizeCard`. A good first step is a `ScryfallCard` type based on `references/CARD.json`.

## Tooling gotchas

- `eslint.config.js` uses the glob `'**/*.{js,jsx,ts, tsx}'`. The space before `tsx` means `.tsx` files get **no** lint config (verified: `eslint --print-config src/main.tsx` returns nothing). Fixing it will surface new lint errors in `.tsx` files; propose the fix, do not apply silently.
- `index.html` loads `http://localhost:8097`, almost certainly the standalone React DevTools script. It fails harmlessly when nothing listens on that port, but it also ships in the production build. Check its purpose with the developer before removing. In a Codespace the port is not forwarded by default.
- `.github/copilot-instructions.md` currently only points to Mermaid diagram rules in `.github/instructions/mermaid.instructions.md`. Diagram requests: write `.mmd` files in `references/`.

## Conventions

- Keep the pipeline separated: raw Scryfall data enters through the hooks and client, `normalizeCard.js` maps it, renderer components consume the normalized shape only.
- Use `createApiClient` for Scryfall card/list endpoints. Auxiliary URL hooks use direct `fetch`; keep their query-key conventions when extending.
- Be gentle with Scryfall: no request loops or bursts. Check Scryfall's API docs for current rate-limit and header requirements before adding new fetch patterns.
- Keep new UI aligned with the tokens in `public/theme.css` and the component-local CSS pattern.
- Do not convert unrelated files, rename folders, or "clean up" unused files without being asked.

## Reference material

`references/CARD_SEARCH_SEQUENCES.md` and `card-search-seq-*.mmd` (search and overlay flows), `Components.md`, `Sequence.md`, `component-architecture.mmd` (architecture), `THEME.md` (theme rationale), `FOLDER_STRUCTURE.md` (general guidance, not the literal tree), `ExternalResources.md`, `RESOURCES.md`, `NavClaude/README.md`. Treat these as aspirational; verify in source.