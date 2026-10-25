# Decisions List

## D-001: Logo and icon set for the web app

- Status: Accepted
- Date: 2026-10-25
- Decision: The logo was traced from the uploaded raster into a vector SVG with CSS variables for all colors. A full icon set was generated from it: SVGs, favicon.ico, 180/192/512/1024 px PNGs in transparent, dark (#000000) and light (#ffffff) versions where relevant.
- Why: One vector source keeps every size consistent and lets the colors be edited in one place. The Apple-sized canvas (logo about 70% of the height) leaves room for iOS corner masking. A separate tight crop (about 92%) keeps the favicon readable at small sizes.
- Alternatives considered: A hand-drawn SVG would be cleaner but less faithful to the original. Inline SVG components via SVGR would allow runtime recoloring but need a new dependency. Both were not chosen for now.
- Consequences: Files live in public/. The CSS variables only work when the SVG is inlined, not through <img> or as a favicon. A maskable PWA icon and an og:image are not covered yet. The App Store icons are only needed for a native iOS build.
- Source: “[Branding] Logo and icon set”

## D-002: Theme toggle buttons in both navigation bars

- Status: Accepted
- Date: 2026-10-25
- Decision: Each navigation bar gets its own round button that switches between the dark and light theme through the existing useTheme() hook. The icon shows the theme you will switch to (sun in dark mode, moon in light mode).
- Why: The theme state, the data-theme attribute and the theme tokens already existed, so the simplest fix was a button that calls setTheme. Separate components per bar let each match its own visual style (glowing two-layer icons in the NavBar, plain filled icons in the FloatingNavBar).
- Alternatives considered: One shared button component (less duplication, but the two bars look different). A toggleTheme function in the context (needs two more files). Saving the choice in localStorage (left for later; needs an early script to avoid a flash). Putting the FloatingNavBar button between the text field and "Go for it" (needs changes to Input.jsx).
- Consequences: The FloatingNavBar now follows the app theme instead of the OS setting. The choice is lost on reload. The NavBar mobile bar and the FloatingNavBar on narrow phones are wider or tighter and need a visual check. Each toggle contains the same one-line "pick the other theme" logic.
- Source: "[Theme] Dark/light toggle in navigation bars"
