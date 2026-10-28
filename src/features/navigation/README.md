# Eerie Nav — desktop header + mobile floating bar

Two breakpoints, one shared visual language. Built directly against the
`theme.css` tokens you pasted (`--bg-header`, `--bg-card`, `--btn-gold`,
`--text-accent`, `--eerie-glow`, etc.) — no new palette was invented.

## Files

```text
navbar/
├── NavBar.jsx              — drop-in root component (renders both bars)
├── NavBarDesktop.jsx        — top header, icon + title, hides on scroll
├── NavBarMobile.jsx         — bottom floating pill, icon-only, hides on scroll
├── NavSearchField.jsx       — shared quick-search / random input
├── navItems.js              — single source of truth for the 5 options
├── hooks/
│   └── useScrollVisibility.js  — shared show/hide-on-scroll logic
├── icons/
│   └── NavIcons.jsx         — 6 icons, each with a trace + core layer
├── navbar-shared.css        — the reusable "floating bar" surface + glow
├── navbar-desktop.css       — desktop-only positioning
└── navbar-mobile.css        — mobile-only positioning
```

In the current V2 app, the Binder item opens `/v2/binder`; the former
`/v2/collection` path redirects there.

## How the "reuse the floating bar" ask was implemented

`navbar-shared.css` owns everything visual: the glass gradient surface,
the gold hairline border, `box-shadow: var(--eerie-glow)`, the blur, and
the icon/label glow mechanic. Both `<header class="nav-surface">` (desktop)
and `<nav class="nav-surface">` (mobile) point at the exact same class —
they only differ in `navbar-desktop.css` / `navbar-mobile.css`, which set
`position`, `top` vs `bottom`, width, and the hide-transform direction
(slides up off-screen on desktop, down on mobile). Change the surface once,
both bars update.

`useScrollVisibility` is the same hook for both; only the thresholds differ
slightly since a bottom bar under a thumb behaves differently than a header
under a cursor.

## The glow mechanic (the "Ring inscription" effect)

Every icon in `NavIcons.jsx` is drawn as two layers:

- `.nc-trace` — an outline that's always faintly present (never fully
  invisible, so the icon reads at rest)
- `.nc-core` — the sunken interior, filled with `var(--sublayer-bg)`
  (black) at rest

When a `.nav-item` gets `.is-active`, `.nc-core` switches to
`var(--text-accent)` (your aquamarine) with a layered `drop-shadow` glow,
and `.nc-trace` picks up a matching stroke color and soft glow. The nav
label uses the same idea via layered `text-shadow` — dim/engraved at rest,
glowing once active. This reads correctly in both your light and dark
`data-theme` blocks since it's driven entirely by CSS variables, not
hardcoded colors.

## Typography

```css
--font-display: "Cinzel", "Iowan Old Style", serif;   /* used sparingly, not wired in below */
--font-ui: "Manrope", "Inter", system-ui, sans-serif; /* nav labels — this is what's used */
```

Nav labels use `--font-ui` at uppercase + small tracking (`letter-spacing:
0.06em`) — enough medieval-plaque feel to fit the theme without
sacrificing legibility at 0.7rem. `--font-display` is left as a token for
a logotype/brand mark elsewhere in the app; it's deliberately **not**
used on the nav items themselves, since a heavy serif at icon-label size
fights the "must remain very readable" requirement. Load both via
`@font-face` or Google Fonts in your root stylesheet; fallbacks are
system-safe if you don't.

## Assumptions made (flag if wrong)

- **Routing:** `react-router-dom` (`useLocation` / `useNavigate`). If
  you're on Next.js or another router, swap those two hooks out in
  `NavBarDesktop.jsx` / `NavBarMobile.jsx` — everything else is
  router-agnostic.
- **Search behavior:** empty submit → `search/random`, non-empty →
  `search?q=<term>`. These destinations are route-relative to the
  version layout that renders the navbar. Adjust them in each bar's
  `handleSearch` if the child routes change.
- **Breakpoint:** 861px is the desktop/mobile split (matches common
  tablet-portrait cutoffs). Change the `min-width` in both CSS files if
  your app uses a different one.
- **`color-mix()`** is used for glow opacity blending — supported in all
  current evergreen browsers. If you need older Safari support, swap
  those for precomputed `rgba()` values.

## Usage

```jsx
// App.jsx, inside your Router
import NavBar from "./navbar/NavBar";

function App() {
  return (
    <>
      <NavBar />
      <main>{/* routed content */}</main>
    </>
  );
}
```

Since both bars are `position: fixed`, give your main content wrapper
top/bottom padding so it doesn't sit underneath either bar, e.g.:

```css
main { padding-top: 5.5rem; padding-bottom: 5rem; }
```
