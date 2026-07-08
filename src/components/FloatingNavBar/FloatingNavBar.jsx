import { useEffect, useRef, useState, useCallback } from "react";
import Input from "../Input/Input";
import useScrollDirection from "../../hooks/useScrollDirection";
import "./FloatingNavBar.css";

// How long (ms) to wait after a viewport resize before updating `bottom`.
// iOS keyboard animation is ~250ms — we wait for it to finish so we don't
// fight it with a JS style change mid-animation (causes the jolt).
const KEYBOARD_SETTLE_MS = 0;

const FloatingNavBar = ({
  onNavigate,
  handleSearchSubmit,
  isLoading,
  searchText,
  setSearchText,
}) => {
  const [active, setActive] = useState("home");
  const navRef         = useRef(null);
  const keyboardRef    = useRef(false);   // sync flag for useScrollDirection
  const settleTimer    = useRef(null);    // debounce timer ref

  // Pass keyboardRef so the scroll handler can bail out synchronously,
  // before React has had a chance to flush any setState calls.
  const hidden = useScrollDirection(12, keyboardRef);

  const updatePosition = useCallback(() => {
    const vp = window.visualViewport;
    if (!vp || !navRef.current) return;

    const kbH      = window.innerHeight - vp.height - vp.offsetTop;
    const isKbOpen = kbH > 80;

    // Always update the ref immediately so scroll events are blocked
    // from this point forward — even before the settle timer fires.
    keyboardRef.current = isKbOpen;

    // Clear any previous pending update.
    clearTimeout(settleTimer.current);

    if (isKbOpen) {
      // Wait for the iOS keyboard animation to finish before moving the bar.
      // Without this delay, we set `bottom` while the keyboard is still
      // sliding up, which creates a jolt as the two animations fight.
      settleTimer.current = setTimeout(() => {
        if (navRef.current) {
          // Remove the hidden class directly — state update would be too slow
          // and might race with the scroll events iOS fires during keyboard open.
          navRef.current.classList.remove("hidden");
          //navRef.current.style.bottom = `${kbH + 8}px`;
        }
      }, KEYBOARD_SETTLE_MS);
    } else {
      // Keyboard is closing: reset bottom immediately so CSS takes over,
      // but re-sync lastY in the hook by resetting the scroll position
      // reference so the next real scroll isn't misread as a big jump.
      settleTimer.current = setTimeout(() => {
        if (navRef.current) {
          //navRef.current.style.bottom = "";
        }
      }, KEYBOARD_SETTLE_MS);
    }
  }, []);

  useEffect(() => {
    const vp = window.visualViewport;
    if (!vp) return;
    vp.addEventListener("resize", updatePosition);
    return () => {
      vp.removeEventListener("resize", updatePosition);
      clearTimeout(settleTimer.current);
    };
  }, [updatePosition]);

  // Sync the hidden class from hook state, but only when keyboard is closed.
  // When keyboard is open we manage the class directly above.
  useEffect(() => {
    if (!navRef.current || keyboardRef.current) return;
    if (hidden) {
      navRef.current.classList.add("hidden");
    } else {
      navRef.current.classList.remove("hidden");
    }
  }, [hidden]);

  const handleSelect = (id) => {
    setActive(id);
    onNavigate?.(id);
  };

  return (
    <nav
      ref={navRef}
      // Don't derive className from `hidden` state here — we manage the
      // class directly via ref to avoid React re-render lag racing with
      // iOS scroll events.
      className="floating-navbar"
      aria-label="Main navigation"
    >
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