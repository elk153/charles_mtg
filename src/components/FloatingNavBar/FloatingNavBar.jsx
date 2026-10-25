import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import Input from "../Input/Input";
import FloatingThemeToggle from "./FloatingThemeToggle.tsx";
import useScrollDirection from "../../hooks/useScrollDirection";
import "./FloatingNavBar.css";

const FloatingNavBar = ({
  isLoading,
  onRandomRequest,
  isRandomRoute,
  randomCardName,
}) => {
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchText.trim();
    if (query) {
      navigate(`cards/${encodeURIComponent(query)}`);
      return;
    }

    setSearchText("");
    onRandomRequest?.();
    navigate("random");
  };

  useEffect(() => {
    if (!isRandomRoute || !randomCardName) return;
    navigate(`cards/${encodeURIComponent(randomCardName)}`, { replace: true });
  }, [isRandomRoute, randomCardName, navigate]);
 
  const navRef                = useRef(null);

  // Set to true as soon as the input is focused — before iOS fires any
  // scroll or resize events. This is the earliest possible signal that
  // the keyboard is about to open, so useScrollDirection is blocked
  // before the problematic events arrive.
  const keyboardRef           = useRef(false);

  const hidden = useScrollDirection(12, keyboardRef);

  const applyBottom = () => {
    const vp = window.visualViewport;
    if (!vp || !navRef.current) return;
    const kbH = window.innerHeight - vp.height - vp.offsetTop;
    navRef.current.style.bottom = kbH > 0 ? `${kbH + 8}px` : "";
  };

  useEffect(() => {
    const vp = window.visualViewport;
    if (!vp) return;

    // Re-measure on every resize tick — iOS fires several resize events
    // as the keyboard animates up, each with a larger kbH. Listening to
    // all of them means we track the keyboard smoothly rather than
    // snapping to a single (possibly early, wrong) measurement.
    vp.addEventListener("resize", applyBottom);
    return () => vp.removeEventListener("resize", applyBottom);
  }, []);

  useEffect(() => {
    // Use capture phase so these fire before scroll events bubble up.
    const onFocus = () => {
      keyboardRef.current = true;
      // Immediately un-hide in case the bar was hidden from a prior scroll.
      navRef.current?.classList.remove("hidden");
    };

    const onBlur = () => {
      keyboardRef.current = false;
      // Clear the inline bottom so CSS takes back control.
      // Small delay so the keyboard has time to close before we
      // reset — avoids a flicker where bottom briefly reads as 0.
      setTimeout(() => {
        if (!keyboardRef.current && navRef.current) {
          navRef.current.style.bottom = "";
        }
      }, 300);
    };

    // Listen on the nav element so we catch focus on the Input inside it.
    const nav = navRef.current;
    nav?.addEventListener("focusin",  onFocus, true);
    nav?.addEventListener("focusout", onBlur,  true);
    return () => {
      nav?.removeEventListener("focusin",  onFocus, true);
      nav?.removeEventListener("focusout", onBlur,  true);
    };
  }, []);

  // Sync hidden class from scroll hook — only when keyboard is closed.
  useEffect(() => {
    if (!navRef.current || keyboardRef.current) return;
    navRef.current.classList.toggle("hidden", hidden);
  }, [hidden]);

  return (
    <nav
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
      <FloatingThemeToggle />
    </nav>
  );
};

export default FloatingNavBar;