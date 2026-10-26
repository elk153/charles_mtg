import { useNavigate, useSearchParams } from "react-router";
import NavBarDesktop from "./NavBarDesktop.tsx";
import NavBarMobile from "./NavBarMobile.tsx";
import type { SearchSource } from "./types.ts";
import "./SearchSourceToggle.css";
import "./navbar-shared.css";
import "./navbar-desktop.css";
import "./navbar-mobile.css";

/**
 * Drop <NavBar /> once, near the root of the app (inside the Router).
 * Both bars render in the DOM; navbar-desktop.css / navbar-mobile.css
 * use the same breakpoint to show exactly one of them at a time, so
 * there's no layout-shift flash from a JS-driven media query check.
 */
export default function NavBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchSource: SearchSource =
    searchParams.get("source") === "collection" ? "collection" : "scryfall";
  const isCollectionMode = searchSource === "collection";

  function handleSearch(query: string) {
    if (isCollectionMode) return;
    navigate(query ? `search?q=${encodeURIComponent(query)}` : "search/random");
  }

  function toggleSearchSource() {
    const next = new URLSearchParams(searchParams);
    if (isCollectionMode) {
      next.delete("source");
    } else {
      next.set("source", "collection");
    }
    setSearchParams(next, { preventScrollReset: true });
  }

  const navProps = {
    searchSource,
    onSearchSourceToggle: toggleSearchSource,
    onSearch: handleSearch,
  };

  return (
    <>
      <NavBarDesktop {...navProps} />
      <NavBarMobile {...navProps} />
      {isCollectionMode && (
        <p className="nav-mode-notice" role="status">
          Personal collection search is under construction.
        </p>
      )}
    </>
  );
}
