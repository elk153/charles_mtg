# Decisions List

## D-001: Logo and icon set for the web app

- Status: Accepted
- Date: 2026-10-25
- Decision: The logo was traced from the uploaded raster into a vector SVG with CSS variables for all colors. A full icon set was generated from it: SVGs, favicon.ico, 180/192/512/1024 px PNGs in transparent, dark (#000000) and light (#ffffff) versions where relevant.
- Why: One vector source keeps every size consistent and lets the colors be edited in one place. The Apple-sized canvas (logo about 70% of the height) leaves room for iOS corner masking. A separate tight crop (about 92%) keeps the favicon readable at small sizes.
- Alternatives considered: A hand-drawn SVG would be cleaner but less faithful to the original. Inline SVG components via SVGR would allow runtime recoloring but need a new dependency. Both were not chosen for now.
- Consequences: Files live in public/. The CSS variables only work when the SVG is inlined, not through <img> or as a favicon. A maskable PWA icon and an og:image are not covered yet. The App Store icons are only needed for a native iOS build.
Source: “[Branding] Logo and icon set”