# Agent Context

Working map of the app for AI coding agents. Verified against branch `typescript` at commit `5f79767` (24 Oct 2026): I cloned it, installed, ran the checks, and read the entry, router, navigation and v1 layout sources. Where this file and the source disagree, the source wins; say so and propose an update to this file.

## How to work with me (read first)

The developer is learning React and TypeScript and wants to understand every change, not just receive code.

- Explain the reasoning *before* changing code, and name the concept used (e.g. "custom hook", "type guard", "route-relative navigation").
- Make small, single-purpose changes. For anything touching more than two files, show a short plan and wait for approval.
- Prefer the simplest approach that fits the existing code over clever abstractions.
- Ask before deleting files, adding dependencies, or converting files between JS and TS.
- After a change, say which command to run to check it and what a pass looks like.
- Do not claim something works unless you checked the source or ran the check.

## App at a glance

- React 19 + Vite SPA that finds Magic: The Gathering cards through the public Scryfall API (`https://api.scryfall.com`). Routing uses `react-router` 8 (`createBrowserRouter`).
- The app currently ships **two layouts** side by side, mounted at different URL prefixes:
  - **`/v1`: the working app.** Random card, name search, card detail overlay with rulings, legalities, printings and per-printing EUR / foil EUR prices.
  - **`/v2`: a new shell under construction.** A navigation bar and placeholder pages (Home, Search, Favorites, Collection, Decks). It has no real features yet.
- No backend, authentication, or user database. TanStack Query caches remote data in memory and persists some of it in browser `localStorage`.
- Collection tracking, acquisition/location records, decks, price history, sales and balance are **goals, not features**. Never imply they exist.

## Commands and current status

Node 22 works. Install with `npm install`.

| Command | Purpose | Status |
| --- | --- | --- |
| `npm run dev` | Vite dev server | works |
| `npm run build` | production build into `dist/` | passes |
| `npm run preview` | serve the build | works |
| `npm run typecheck` | `tsc --noEmit` | passes |
| `npm run lint` | ESLint (covers `.js`, `.jsx`, `.ts`, `.tsx`) | **fails: 21 errors, 1 warning (pre-existing)** |

- No test framework or test script exists.
- Lint failures are in 13 files: `src/assets/Icon*.jsx`, `original-card-renderer/CardDetails/CardDetails.jsx`, `scryfall-card-renderer/components/SplitFacesCard.jsx`, `components/extras/*` (Case, Class, Leveler, Mutate, Prototype, Saga), and `hooks/usePreFetchUrl.js`. Do not treat them as caused by your change; compare before and after.
- Run the narrowest check that fits. At minimum run `npm run typecheck` and `npm run build`.

## Routes

Defined in `src/app/router.tsx`. There is **no route for `/`** and no redirect to `/v1` (reading the router; not verified in a browser).

| Path | Renders |
| --- | --- |
| `/v1` | redirects to `/v1/random` |
| `/v1/random` | random card, via `CardsList` |
| `/v1/cards/:searchQuery` | name search results, via `CardsList` |
| `/v1/card/:cardId` | declares `CardOverlay` (see gotchas) |
| `/v2` | redirects to `/v2/home` (route loader) |
| `/v2/home`, `/v2/search/advanced`, `/v2/favorites`, `/v2/collection`, `/v2/decks` | placeholder pages exported from `src/app/App.tsx` |

## v1 flow (working app)

1. `index.html` links root `style.css` and loads `/src/main.tsx`; it holds `#root` and the splash elements. `main.tsx` imports `src/theme.css` and mounts `AppProviders` in `StrictMode`.
2. `AppProviders.tsx` nests `PersistenceProvider` > `QueryDevToolsProvider` (receives `queryClient` as a prop) > `RouterProvider`.
3. `src/app/App.jsx` is the v1 layout route. It owns search and card queries, `FloatingNavBar`, outlet context (`scryfallCards`, `isLoadingCards`, `onCardSelect`), the splash transition, and the overlay.
4. `scryfall-card-renderer/CardsList/CardsList.jsx` renders results. Despite the folder name, it renders `original-card-renderer/Card/Card.jsx` for each item.
5. Clicking a card calls `navigate("card/<id>", { state: { fromList: true } })`. `App.jsx` renders `CardOverlay` in `.top-layer` using its own fetched/selected card.

### Gotchas to preserve

- The routed `CardOverlay` from the router receives no `card` prop and returns `null`. The visible overlay is rendered by `App.jsx`. Understand this before changing card-route rendering.
- **Navigation is route-relative** (recent change "changed to relative navigation"): `navigate("random")`, `navigate("cards/<name>")`, `navigate("card/<id>")`, and `isRandomRoute` uses `useResolvedPath("random")`. Do not replace these with absolute paths like `/random`; they resolve against the layout that renders them (`/v1` or `/v2`).
- Closing the overlay: if `location.state.fromList`, `navigate(-1)`; otherwise go to `cards/<encoded card name>`.
- Random: the seed (`Date.now()`) is part of the query key; submitting an empty search changes it.
- Keep route params URI-safe (`encodeURIComponent` / `decodeURIComponent`).
- Card symbols are prefetched in `App.jsx` with `usePreFetchUrl("cardSymbols", ".../symbology", Infinity)` and also read by `useOracleText`.

## v2 shell (under construction) and known gaps

- `src/app/App.tsx` renders only `<NavBar />`. **It has no `<Outlet />`**, so the child routes' placeholder pages are not rendered yet. This looks like work in progress, not a bug to fix unprompted.
- `src/features/navigation/` holds the new navbar: `NavBar` renders `NavBarDesktop` and `NavBarMobile` (CSS shows one at a time; breakpoint 861px), `NavSearchField`, `NavIcons.jsx`, `navItems.js` (the single source of truth for the five items), and three CSS files. The scroll hide/show logic is `src/hooks/useScrollVisibility.js`.
- The navbar search navigates to `search?q=<term>` or `search/random`. **No such routes exist in `/v2`** (only `search/advanced`), so searching from the v2 navbar leads nowhere yet.
- `src/features/navigation/README.md` is stale: it describes `navbar/`, `hooks/` and `icons/` subfolders and `react-router-dom`; the real layout is flat and uses `react-router`.

## Data and state

- `src/hooks/useScryfallCardsSearch.jsx`: TanStack Query hook, key `["scryfallCards", route, params, seed]`, `enabled` only when a route is given, 24 h `staleTime`. It uses `src/services/createApiClient.js`, which maps `card` responses to `[card]` and `list`/`catalog` to `data`, and throws on Scryfall errors.
- `src/hooks/useFetchUrl.js`: fetches auxiliary Scryfall URLs (rulings, print searches), key `["fetchedUrl", purpose, url]`, returns `json.data`. It does not check `res.ok`, and returns an empty array when no URL is given.
- `PersistenceProvider.tsx` persists only `fetchedUrl` queries and `scryfallCards` queries whose second key is `"cards/search"`, in `localStorage`. Random and single-card queries are not persisted.
- `queryProvider.ts`: `gcTime` is 24 h and must stay >= the persisted data's max age.
- `QueryDevToolsProvider.tsx` loads Devtools lazily and only when `import.meta.env.DEV`.
- Many files contain debug `console.log` calls (e.g. `createApiClient.js`, `useFetchUrl.js`). Do not add more; ask before removing.
- Prices are current per-printing Scryfall data, not history or collection valuation.

## Source layout

- `src/main.tsx`, `src/app/` — entry, providers (TS), `router.tsx` (TS), `App.jsx` (v1 layout), `App.tsx` (v2 layout and placeholder pages).
- `src/features/scryfall-card-renderer/` — active renderer. `normalizeCard.js` maps raw Scryfall cards to the internal shape; `scryfallCardLayouts.js` and `components/` (one/split/toggle/flip/meld faces, `OracleText`, `extras/` for saga, class, case, leveler, mutate, prototype) consume that shape.
- `src/features/original-card-renderer/Card/` — the older card tile, still used by the v1 results list.
- `src/features/navigation/` — v2 navbar (see above).
- `src/components/FloatingNavBar/` — v1 navbar: name search, empty search for random, mobile keyboard/viewport handling, hides on scroll (`useScrollDirection`). Also `Input/`.
- `src/hooks/`, `src/services/` — see Data and state.
- `src/theme.css` — theme tokens (dark/light), imported by `main.tsx`. `src/app/AppProviders/ThemeContext.ts` provides the current theme and setter; `ThemeProvider.tsx` defaults to `"dark"` and synchronizes the document theme and browser theme color. `style.css` (root) is linked from `index.html`. `src/app/App.css` holds layer styles.
- `src/assets/` — inline SVG icon components. `public/` — site-root icons and favicons.
- `docs/` — notes (`app/` architecture and flow notes, `theme/theme.md`, `scryfall/CARD.json`, `file-conventions.md`, `external-resources.md`). Some notes lag the code; verify in source.

## Present but not wired in (do not edit as if live)

`src/components/Header/` (commented out in `App.jsx`), `src/features/original-card-renderer/CardDetails/` and `CardsList/`, `src/hooks/useCardSearch.js`, `src/services/getCardPrices.js`, `src/services/getCardRulings.js`. Also `scryfall-card-renderer/CardsList/CardsList.css` is used by the active list, while the tile styles come from `original-card-renderer/Card/`.

## Planned, not implemented

User-owned collection records (source, physical location), deck building, favorites, collection valuation and price history, sales and balance tracking, and advanced search (color, role). The v2 pages and navbar items for these exist only as placeholders.

## TypeScript migration (the purpose of this branch)

- **TypeScript today:** `src/main.tsx`, `src/app/AppProviders.tsx`, `src/app/router.tsx`, `src/app/App.tsx`, the three files in `src/app/AppProviders/`, and `src/hooks/useOracleText.tsx` (the first hook converted; it uses a `CardSymbol` type and an `isCardSymbol` type guard, a good model for the next conversions). Everything else is JS/JSX.
- `tsconfig.json`: `strict`, `allowJs: true`, `checkJs: false`, `verbatimModuleSyntax: true`, `allowImportingTsExtensions: true`, `include: ["src"]`. JS files are **not** type-checked, so passing `typecheck` says little about them.
- Imports of `.ts`/`.tsx` files include the extension. Use `import type` for type-only imports.
- Convert one file at a time, only when asked. Avoid `any` and non-null assertions in TS files.
- Suggested low-risk next conversions, smallest first: `useScrollDirection`, `useScrollVisibility`, `createApiClient`, `useFetchUrl`, `useScryfallCardsSearch`, then `normalizeCard`. A good first step is a `ScryfallCard` type based on `docs/scryfall/CARD.json`.

## Tooling gotchas

- `package.json` lists both `react-router` ^8 and `react-router-dom` ^7, but the source imports only from `react-router`. `react-router-dom` appears unused; ask before removing.
- The hardcoded `localhost:8097` script that used to be in `index.html` is gone.
- `.github/copilot-instructions.md` and `CLAUDE.md` point to the repo-root `AGENTS.md` for context. Mermaid diagram rules are in `.github/mermaid.instructions.md`.

## Conventions

- Keep the pipeline separated: raw Scryfall data enters through the hooks and client, `normalizeCard.js` maps it, renderer components consume the normalized shape only.
- Use `createApiClient` for Scryfall card/list endpoints. Auxiliary URL hooks use direct `fetch`; keep their query-key conventions when extending.
- Be gentle with Scryfall: no request loops or bursts. Check Scryfall's API docs for current rate-limit and header requirements before adding new fetch patterns.
- Keep new UI aligned with the tokens in `src/theme.css` and the component-local CSS pattern.
- Follow `docs/file-conventions.md` for naming and file types.
- Do not convert unrelated files, rename folders, or "clean up" unused files without being asked.
