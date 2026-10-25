import type { SVGProps } from "react";

/**
 * Sun and moon icons for the NavBar theme toggle.
 *
 * Same two-layer recipe as NavIcons.jsx, so they pick up the NavBar's
 * existing CSS (navbar-shared.css) without any new color rules:
 *  - .nc-trace  the etched outline, always faintly visible
 *  - .nc-core   the sunken interior, filled with the accent color
 *               when the toggle is hovered or focused
 *
 * `satisfies` checks the object against the SVG prop types while keeping
 * its exact literal types, so a typo in an attribute name is caught.
 */
const base = {
  viewBox: "0 0 24 24",
  width: "1em",
  height: "1em",
  className: "nav-icon",
  "aria-hidden": "true",
  focusable: "false",
} satisfies SVGProps<SVGSVGElement>;

export function NavSunIcon() {
  // Shown in dark mode: "click me to get the light theme".
  return (
    <svg {...base}>
      <path
        className="nc-trace"
        d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle
        className="nc-trace"
        cx="12"
        cy="12"
        r="4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle className="nc-core" cx="12" cy="12" r="2.6" />
    </svg>
  );
}

export function NavMoonIcon() {
  // Shown in light mode: "click me to get the dark theme".
  return (
    <svg {...base}>
      <path
        className="nc-trace"
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* The core is the same crescent shrunk toward its middle, so it
          always stays inside the outline. */}
      <path
        className="nc-core"
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
        transform="translate(4.73 6.08) scale(0.55)"
      />
    </svg>
  );
}
