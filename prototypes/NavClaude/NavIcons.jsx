import React from "react";

/**
 * Every icon is built from exactly two layers, matching the "ring
 * inscription" effect requested:
 *
 *  - .nc-trace  the etched outline, always faintly visible (never fully off)
 *  - .nc-core   the sunken interior. Dark/empty at rest, filled with the
 *               eerie accent color and glowing when the parent .nav-item
 *               carries .is-active (see navbar-shared.css)
 *
 * Keep both layers on every icon — the glow-on-select effect depends on
 * having a fillable "core" shape distinct from the outer "trace" line.
 */

const base = {
  viewBox: "0 0 24 24",
  width: "1em",
  height: "1em",
  className: "nav-icon",
  "aria-hidden": "true",
  focusable: "false",
};

export function HomeIcon() {
  // A gate / archway — the "core" is the flame beyond the threshold.
  return (
    <svg {...base}>
      <path
        className="nc-trace"
        d="M4 21V10.5L12 4l8 6.5V21"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        className="nc-core"
        d="M9.5 21v-6.2c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5V21z"
      />
    </svg>
  );
}

export function AdvancedSearchIcon() {
  // A scrying lens — the "core" is the eye/star seen through the glass.
  return (
    <svg {...base}>
      <circle
        className="nc-trace"
        cx="10.5"
        cy="10.5"
        r="6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        className="nc-trace"
        d="M15.3 15.3 21 21"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        className="nc-core"
        d="M10.5 7.3 12 10l2.7 1.5L12 13l-1.5 2.7L9 13l-2.7-1.5L9 10z"
      />
    </svg>
  );
}

export function FavoritesIcon() {
  // A mana-spark star.
  return (
    <svg {...base}>
      <path
        className="nc-trace"
        d="M12 3.2 14.4 9.4 21 10.2 16.1 14.4 17.6 20.8 12 17.4 6.4 20.8 7.9 14.4 3 10.2 9.6 9.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        className="nc-core"
        d="M12 7.2 13.5 10.7 17.2 11.1 14.4 13.5 15.2 17.2 12 15.2 8.8 17.2 9.6 13.5 6.8 11.1 10.5 10.7Z"
      />
    </svg>
  );
}

export function CollectionIcon() {
  // Stacked cards — trace on the two back cards, glow-core on the front one.
  return (
    <svg {...base}>
      <rect
        className="nc-trace"
        x="4.2"
        y="5"
        width="12"
        height="16"
        rx="1.6"
        transform="rotate(-8 10.2 13)"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        className="nc-trace"
        x="7.8"
        y="4.2"
        width="12"
        height="16"
        rx="1.6"
        transform="rotate(6 13.8 12.2)"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect className="nc-core" x="8.4" y="9" width="7.2" height="9" rx="1" />
    </svg>
  );
}

export function DecksIcon() {
  // A closed tome — trace is the cover, core is the glowing page-edge sigil.
  return (
    <svg {...base}>
      <path
        className="nc-trace"
        d="M4.5 5.2c1.8-.9 4.3-1 6 0v14.6c-1.7-1-4.2-.9-6 0Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        className="nc-trace"
        d="M19.5 5.2c-1.8-.9-4.3-1-6 0v14.6c1.7-1 4.2-.9 6 0Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path className="nc-core" d="M12 6.4c.9-.3 1.9-.4 2.8-.3v11.4c-.9-.1-1.9 0-2.8.3Z" />
    </svg>
  );
}

export function QuickSearchIcon() {
  // A carried torch/lantern for the quick search field.
  return (
    <svg {...base}>
      <path
        className="nc-trace"
        d="M9.5 21v-6.6c0-1.9 1.1-3.4 2.5-4.4 1.4 1 2.5 2.5 2.5 4.4V21Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        className="nc-core"
        d="M12 4.6c1.1 1.6 1.7 2.8 1.7 3.9 0 1-.8 1.7-1.7 1.7s-1.7-.7-1.7-1.7c0-1.1.6-2.3 1.7-3.9Z"
      />
    </svg>
  );
}
