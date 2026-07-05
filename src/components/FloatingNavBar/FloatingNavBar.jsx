import { useEffect, useRef, useState } from "react";
import Input from "../Input/Input";
import useScrollDirection from "../../hooks/useScrollDirection";
//import "./floatingNavBar.css";
//import IconSearch from "../../assets/IconSearch";
//import IconCards from "../../assets/IconCards";

/*const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "house" },
  { id: "explore", label: "Explore", icon: "compass" }
];*/

// The component must accept `onNavigate` as a prop — it's not a global,
// so it has to come from whoever renders <FloatingNavBar onNavigate={...} />
const FloatingNavBar = ({ onNavigate, handleSearchSubmit, isLoading, searchText, setSearchText}) => {

  const [active, setActive] = useState("home");

  // navRef lets us directly read/write the <nav> DOM node's style
  // (used below to shift the bar up when a mobile keyboard appears).
  const navRef = useRef(null);

  // true = user is scrolling down past 80px -> we should hide the bar
  const hidden = useScrollDirection();

  useEffect(() => {

    const vp = window.visualViewport;
    // Not all browsers support visualViewport — bail out safely if so.
    if (!vp) return;

    const update = () => {
      // When a mobile on-screen keyboard opens, the visual viewport
      // shrinks. This calculates how much space the keyboard is taking
      // up, so we can push the nav bar above it instead of letting the
      // keyboard cover it.
      const kbH = window.innerHeight - vp.height - vp.offsetTop;

      // Guard in case navRef.current isn't attached yet (e.g. during
      // fast unmounts) — avoids a "cannot set property of null" crash.
      if (navRef.current) {
        navRef.current.style.bottom = `${Math.max(24, kbH + 8)}px`;
      }
    };

    vp.addEventListener("resize", update);

    // Cleanup: remove the exact listener we added, mirroring it above.
    return () => vp.removeEventListener("resize", update);

  }, []); // Runs once on mount — no dependencies needed.

  const handleSelect = (id) => {
    setActive(id);
    // Optional chaining protects against onNavigate being undefined
    // (e.g. if the parent didn't pass one) — but only works because
    // onNavigate is now a real, declared prop.
    onNavigate?.(id);
  };

  return (
    <nav
      ref={navRef}
      // Building the class string:
      // - always has "floating-navbar"
      // - adds a modifier class "hidden" ONLY when
      //   `hidden` is true. The leading space is required so the two
      //   class names don't get glued together.
      className={`floating-navbar${hidden ? " hidden" : ""}`}
      aria-label="Main navigation"
    >

      {/* map's callback receives each item and destructures
          id/label/icon straight out of it  */}
      {/*{NAV_ITEMS.map(({ id, label, icon }) => (

        <button
          key={id}
          className="floating-navbar__item"
          aria-current={active === id ? "page" : undefined}
          onClick={() => handleSelect(id)}
        >

          <span className="floating-navbar__icon" aria-hidden="true">
            {icon === "house" && <IconCards />}
            {icon === "compass" && <IconSearch />}
          </span>
          <span className="floating-navbar__label">{label}</span>
        </button>

      ))}*/}

      <Input
        className="floating-navbar__item"
        id="scryfall-named"
        placeholder="Enter card name"
        onSubmit={handleSearchSubmit}
        isLoading={isLoading}
        value={searchText}
        onChange={setSearchText}
        />

    </nav>
  );
};

export default FloatingNavBar;