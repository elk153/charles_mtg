import React, { useState } from "react";
import { QuickSearchIcon } from "./icons/NavIcons";

/**
 * Compact name search. Enter (or tapping the torch icon) submits.
 * An empty query is treated as "surprise me" and routes to a random card.
 *
 * onSearch(query: string) — parent decides how to route:
 *   query === ""  -> navigate('/search/random')
 *   query !== ""  -> navigate(`/search?q=${encodeURIComponent(query)}`)
 */
export default function NavSearchField({ onSearch, expanded, onFocusChange, id }) {
  const [value, setValue] = useState("");

  function submit(e) {
    e.preventDefault();
    onSearch?.(value.trim());
  }

  return (
    <form
      className={`nav-search${expanded ? " nav-search--expanded" : ""}`}
      onSubmit={submit}
      role="search"
    >
      <button
        type="submit"
        className="nav-search__glyph"
        aria-label={value.trim() ? "Search for card" : "Random card"}
        title={value.trim() ? "Search" : "Random card"}
      >
        <QuickSearchIcon />
      </button>
      <input
        id={id}
        className="nav-search__input"
        type="search"
        inputMode="search"
        placeholder="Find a card, or leave blank…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => onFocusChange?.(true)}
        onBlur={() => onFocusChange?.(false)}
        aria-label="Quick card name search"
      />
    </form>
  );
}
