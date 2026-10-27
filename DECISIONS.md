# Decisions List

## D-001: Logo and icon set for the web app

- Status: Accepted
- Date: 2026-10-25
- Decision: The logo was traced from the uploaded raster into a vector SVG with CSS variables for all colors. A full icon set was generated from it: SVGs, favicon.ico, 180/192/512/1024 px PNGs in transparent, dark (#000000) and light (#ffffff) versions where relevant.
- Why: One vector source keeps every size consistent and lets the colors be edited in one place. The Apple-sized canvas (logo about 70% of the height) leaves room for iOS corner masking. A separate tight crop (about 92%) keeps the favicon readable at small sizes.
- Alternatives considered: A hand-drawn SVG would be cleaner but less faithful to the original. Inline SVG components via SVGR would allow runtime recoloring but need a new dependency. Both were not chosen for now.
- Consequences: Files live in public/. The CSS variables only work when the SVG is inlined, not through <img> or as a favicon. A maskable PWA icon and an og:image are not covered yet. The App Store icons are only needed for a native iOS build. Schema changes never go through the MCP; they follow D-014.
- Source: “[Branding] Logo and icon set”

## D-002: Theme toggle buttons in both navigation bars

- Status: Accepted
- Date: 2026-10-25
- Decision: Each navigation bar gets its own round button that switches between the dark and light theme through the existing useTheme() hook. The icon shows the theme you will switch to (sun in dark mode, moon in light mode).
- Why: The theme state, the data-theme attribute and the theme tokens already existed, so the simplest fix was a button that calls setTheme. Separate components per bar let each match its own visual style (glowing two-layer icons in the NavBar, plain filled icons in the FloatingNavBar).
- Alternatives considered: One shared button component (less duplication, but the two bars look different). A toggleTheme function in the context (needs two more files). Saving the choice in localStorage (left for later; needs an early script to avoid a flash). Putting the FloatingNavBar button between the text field and "Go for it" (needs changes to Input.jsx).
- Consequences: The FloatingNavBar now follows the app theme instead of the OS setting. The choice is lost on reload. The NavBar mobile bar and the FloatingNavBar on narrow phones are wider or tighter and need a visual check. Each toggle contains the same one-line "pick the other theme" logic.
- Source: "[Theme] Dark/light toggle in navigation bars"

## D-003: V2 card browser data and integration boundary

- Status: Accepted
- Date: 2026-10-26
- Decision: Implement the first card-browser flow under `/v2` and leave V1's
  card browsing behavior intact. Keep filters in the URL and apply them to the
  TanStack Query-cached result set; do not issue a Scryfall request for each
  filter change. Use existing dependencies, convert only the touched browser
  and navigation surfaces to TypeScript, and keep the new styling local to
  those features.
- Why: V2 is the target shell and its navbar already offers the search entry
  point. Reusing the query cache and the existing layout-aware card renderer
  avoids duplicate data requests and renderer logic while limiting risk to the
  working V1 app.
- Alternatives considered: Replacing V1, integrating the feature into both
  versions, filtering only a new server query per filter, adding a card-state
  library, and reorganizing all app CSS. These were not selected because V1
  must remain available, local filtering satisfies the requested cache-first
  behavior, existing packages already cover routing/query/table needs, and a
  broad migration is unnecessary.
- Consequences: Implemented. `/` opens the V2 home page, which displays seven
  cards from the daily mulligan set. V2 search filters only the first
  175-card Scryfall result page. The search-source toggle is URL-backed.
  The daily mulligan uses an explicit non-digital set-type allowlist because
  the Scryfall Set object has no booster-eligibility field; one
  `unique=cards`, random-ordered search request supplies the seven displayed
  cards.
- The details overlay uses one flip control beneath the artwork to switch the
  artwork and rendered face, gives the details column less width than the
  printings column, and shows flip/favorites/collection/decks actions on
  printing tiles. Favorites, collection and deck actions remain
  under-construction notices until those features have storage. Collection-mode
  search also remains an under-construction notice.
- The desktop navbar search border follows its content width. On mobile, the
  search icon expands and focuses the input; navigation links hide while it is
  focused. Enter or a second tap on the search icon submits, and Escape closes
  the field.
- Source: "[V2 Card Browser](./docs/card-browser-v2.md)"

## D-004: Supabase project and security baseline

- Status: Accepted
- Date: 2026-10-27
- Decision: Use one Supabase project in an EU region for local development and the Netlify site. Only the publishable key reaches the browser (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`). The auth redirect allow-list holds `http://localhost:5173/**` and the Netlify URL. Unused auth providers are off, and the Data API exposes only the `public` schema.
- Why: This is a solo learning app, so one project keeps setup small. A publishable key in a bundle is only safe because RLS restricts every row.
- Alternatives considered: Separate dev and production projects (safer, double the setup, can be added later). Any use of the secret/service-role key in the app (rejected: it bypasses RLS).
- Consequences: Dev and production share data. Free projects can pause after inactivity (verify current rules). Keys never go in chat or the repo, and Netlify holds the production values. New projects expose no tables to the Data API by default, so every migration must grant access explicitly. Legacy anon/service_role keys are not used. The production redirect entry is tightened to the callback route in D-008. Status: implemented once the checks above pass.
- Source: "[Supabase] Auth and favorites plan"

## D-005: Supabase MCP is read-only

- Status: Accepted
- Date: 2026-10-27
- Decision: Connect the Supabase MCP server to VS Code Copilot, scoped to this project with `read_only=true`. Schema changes are tracked and applied through the migration workflow in D-014.
- Why: Database content can carry prompt-injection text, so a write-enabled agent is a risk. Read-only still lets Copilot inspect schema, logs and advisors.
- Alternatives considered: Write-enabled MCP (faster, riskier). No MCP (loses the inspection help).
- Consequences: The workspace MCP entry is in the gitignored `.vscode/mcp.json`; first-time OAuth authentication in VS Code is still required. Copilot cannot apply migrations. To enable writes later, remove the flag, keep the project scope and per-call approvals, then record a superseding decision.
- Source: "[Supabase] Auth and favorites plan"

## D-006: Favorites table keyed to a card printing, with owner-only RLS

- Status: Accepted
- Date: 2026-10-27
- Decision: Create `public.favorites (user_id, scryfall_id, created_at)` with primary key `(user_id, scryfall_id)`, an index on `(user_id, created_at desc)`, RLS enabled, and select/insert/delete policies for `authenticated` users on their own rows. `anon` has no access. `scryfall_id` is the Scryfall card id, which identifies one printing. There is no `profiles` table.
- Why: The composite key prevents duplicates and indexes lookups by user. The second index serves "latest added first". `user_id` defaults to `auth.uid()`, so the browser never sends it.
- Alternatives considered: Favoriting the card across printings via `oracle_id` (dedupes, but loses the printing). A `profiles` table now (nothing to store yet). Snapshotting card JSON (goes stale).
- Consequences: Two printings of one card are two favorites. A nullable `oracle_id` column can be added later without breaking anything. The migration is applied and verified in the project: the table, key, index, RLS policies and grants match this decision, and an anonymous Data API read is denied. The pgTAP owner-isolation suite is authored but still needs to run against a local Supabase database. Use the migration workflow in D-014, never the SQL editor.
- Source: "[Supabase] Auth and favorites plan"

## D-007: Supabase client and AuthProvider

- Status: Accepted
- Date: 2026-10-27
- Decision: Add `@supabase/supabase-js`, create a single client in `src/services/supabaseClient.ts`, and add an `AuthProvider` with a `useAuth` hook. The provider sits inside `PersistenceProvider` and around `RouterProvider`. On sign-out it removes the favorites queries.
- Why: The library already stores the session and refreshes tokens. A context plus a hook matches the existing `ThemeProvider` pattern.
- Alternatives considered: Reading the session separately in each component (duplicated logic). A state library (new dependency, unnecessary). Auth UI packages (less to learn, less control).
- Consequences: The existing `@supabase/supabase-js` dependency and `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` configuration are used by the shared client. `AuthProvider` exposes session, user, loading state and sign-out through `useAuth`; sign-out removes favorites queries from the React Query cache. Implemented; sign-in UI and user-facing auth routes are covered by D-008.
- Source: "[Supabase] Auth and favorites plan"

## D-008: Email and password authentication

- Status: Accepted
- Date: 2026-10-27
- Decision: Add `/v2/login` with email/password sign-in and signup, plus `/v2/auth/callback` for email confirmation. After authentication, navigate to `next` only when it starts with `/v2/` and contains no `//` or backslash; otherwise use `/v2/home`.
- Why: Use Supabase's built-in password authentication rather than passwordless OTP, while keeping a dedicated route for account access.
- Alternatives considered: Passwordless email OTP (D-008's previous implementation); literal usernames (not supported as a native Supabase Auth identifier).
- Consequences: Supabase email confirmation must be enabled/configured as desired, and the callback URL must be in the Auth redirect allow-list. Email confirmation links are for signup verification only; normal sign-in uses the password. Password reset and profile management are outside this decision. Implemented.
- Source: "[Supabase] Auth and favorites plan"

## D-009: RequireAuth layout route

- Status: Accepted
- Date: 2026-10-27
- Decision: Wrap `/v2/favorites`, `/v2/collection` and `/v2/decks` in a `RequireAuth` layout route. It renders nothing while the session loads, an inline sign-in invitation linking to `/v2/login?next=<current path>` when signed out, and `<Outlet />` when signed in.
- Why: An invitation fits your request better than a silent redirect, and the loading state avoids a flash.
- Alternatives considered: Redirecting to the login route (loses the page context). Guarding inside each page (duplicated).
- Consequences: This guard is UX only. Security is enforced by RLS, never by the client. Implemented.
- Source: "[Supabase] Auth and favorites plan"

## D-010: Paginated card source for the card browser

- Status: Accepted
- Date: 2026-10-27
- Decision: Define a `CardSource` shape (`cards`, `isLoading`, `isFetchingNextPage`, `hasNextPage`, `fetchNextPage`, `error`). Implement it for Scryfall search with `useInfiniteQuery`, following `next_page` while `has_more` is true. Add a "Load more" button. Keep the current daily-set mode as a single page and leave V1 untouched.
- Why: One source shape lets search, favorites, collections and decks share the card browser. A button is the simplest trigger and keeps Scryfall requests polite.
- Alternatives considered: Infinite scroll with an intersection observer (a new dependency, can come later). A separate browser per page (duplicates the filter code).
- Consequences: Search results can be paged beyond the first 175 cards, but local filters and sorts cover only cards loaded so far. The daily set remains limited to seven cards and V1 is unchanged. The paginated hook reads Scryfall's `has_more` and `next_page` metadata directly, and uses a query-key prefix that `PersistenceProvider` does not persist. Implemented.
- Source: "[Supabase] Auth and favorites plan"

## D-011: Favorite hooks and the heart toggle

- Status: Accepted
- Date: 2026-10-27
- Decision: Add `useFavoriteIds` (a query for the user's `scryfall_id` set) and `useToggleFavorite` (a mutation that inserts or deletes, then invalidates). Optimistic updates come later. The heart on `CardTile` replaces the under-construction notice. For anonymous users it shows the sign-in invitation.
- Why: One id set lets every tile show its heart without a request per card.
- Alternatives considered: Checking each visible card with `.in(...)` (more requests). Starting optimistic (more concepts at once).
- Consequences: The Supabase API caps rows per request (default 1000, verify), so the id query needs paging if favorites pass that. Favorites are never persisted to `localStorage`. Not implemented yet.
- Source: "[Supabase] Auth and favorites plan"

## D-012: Favorites page on the shared card source

- Status: Accepted
- Date: 2026-10-27
- Decision: Implement `CardSource` for favorites. Each page reads up to 75 rows ordered by `created_at desc`, continuing from the last row's `created_at`. It resolves them through Scryfall's `POST /cards/collection`, re-orders them by the Supabase order, and skips ids Scryfall no longer returns. Page size is a single constant.
- Why: Scryfall accepts at most 75 identifiers per request. Cursor paging stays correct when favorites are added or removed between pages.
- Alternatives considered: Offset paging (rows can shift). Relying on Scryfall's response order (not guaranteed).
- Consequences: A new POST helper is needed because `createApiClient` is for GET. "No sort selected" means latest added. Collections and decks will implement the same `CardSource` later. Not implemented yet.
- Source: "[Supabase] Auth and favorites plan"

## D-013: Email delivery for magic links

- Status: Evaluating
- Date: 2026-10-27
- Decision: Use Supabase's built-in sender during solo development, and choose a free SMTP provider before inviting others.
- Why: The built-in sender is for testing and heavily rate-limited, but enough for one developer.
- Alternatives considered: Brevo (free daily quota, can verify a single sender address), Resend (free monthly quota, needs a domain you control), Mailtrap (test inbox only, no real delivery). Verify current free limits.
- Consequences: A `netlify.app` address cannot be verified as a sending domain, so Resend needs a domain. Without one, Brevo is the practical option, and sending from a free-mail address can land in spam.
- Source: "[Supabase] Auth and favorites plan"

## D-014: Schema tracked as migration files and applied with the Supabase CLI

- Status: Accepted
- Date: 2026-10-27
- Decision: Keep every schema change as a timestamped SQL file in `supabase/migrations/`, created with `supabase migration new` and applied with `supabase db push` (dry run first). The CLI is added as a pinned dev dependency, or run through `npx`, after approval. No local Docker database for now. The dashboard is for reading and experiments, not for schema changes.
- Why: Files in git give a reviewable history and one source of truth. `db push` also records each migration in the project's migration history, so later automation knows what is already applied. Pasting into the SQL editor would leave that history empty.
- Alternatives considered: SQL editor plus committed files (simple, but files and database drift, and later automation would try to re-run them). Hand-written GitHub Actions running `db push` (needs the access token and database password stored as GitHub secrets). A local Docker stack (best for testing, heavy for now).
- Consequences: One dev dependency and a one-time `supabase login` and `supabase link`. The token lives on your machine and the database password is typed in the terminal. Rollbacks are new forward migrations. Each migration still needs approval per AGENTS.md. If the schema is changed in the dashboard, `supabase db pull` captures it as a file. Not implemented yet.
- Source: "[Supabase] Migrations and GitHub"

## D-015: Supabase GitHub integration deploys migrations from main

- Status: Evaluating
- Date: 2026-10-27
- Decision: After `favorites` is merged, connect the Supabase GitHub integration to this repository only, with the working directory at the repo root, "Deploy to production" on for `main`, and automatic branching off.
- Why: Merging to `main` then applies pending migrations, and no database password or access token is stored in GitHub. Deploying from GitHub works on any plan.
- Alternatives considered: Keep manual `db push` (enough for one developer, nothing to configure). Branching with per-PR preview databases (isolated and data-less, plan requirements to verify, not needed without users). GitHub Actions with stored secrets.
- Consequences: Supabase gets read access to the repo. With one shared project, a merge changes the live database. Because D-014 records history, migrations already applied from the feature branch should not run twice; verify on the first merge. `config.toml` does not push auth settings, which stay in the dashboard (D-004). Revisit if a staging project is added.
- Source: "[Supabase] Migrations and GitHub"

## D-016: Generated TypeScript types for the database

- Status: Evaluating
- Date: 2026-10-27
- Decision: After the first migration, generate `src/types/database.ts` with the CLI (`supabase gen types typescript --linked`, flag to verify) and pass `Database` to `createClient<Database>()` in D-007.
- Why: `npm run typecheck` then catches wrong table or column names at compile time.
- Alternatives considered: Hand-written row types (drift from the schema). No types (no checks).
- Consequences: A generated, committed file that must be regenerated after every migration. JS/JSX files stay unchecked, as in AGENTS.md. Not implemented yet.
- Source: "[Supabase] Migrations and GitHub"