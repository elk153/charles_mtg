import { useEffect, useRef, useState } from "react";

/**
 * useScrollDirection
 * ------------------
 * A custom hook that tells you whether the user is scrolling DOWN
 * (past a certain point on the page) so you can, e.g., hide a navbar.
 *
 * @param {number} threshold
 * Minimum scroll distance (in px) the user must move before we react. 
 * This prevents tiny, jittery scrolls (like trackpad noise)
 * from constantly flipping the state.
 *
 * @returns {boolean} hidden
 * True when the user has scrolled DOWN past 80px by 
 * at least `threshold` px since the last check.
 */
export default function useScrollDirection(threshold = 12) {

  // A ref lets us store a mutable value (the last scroll position) 
  // that persists across renders WITHOUT causing a
  // re-render every time it changes (unlike useState).
  const lastY = useRef(0);

  // This is state, because changing it should trigger a re-render
  // (the component needs to actually react to "hidden" changing).
  const [hidden, setHidden] = useState(false);

  useEffect(() => {

    // This function runs on every scroll event.
    const handle = () => {
      const y = window.scrollY;

      // How far (and which direction) did we move since last time?
      // Positive diff = scrolling down. Negative = scrolling up.
      const diff = y - lastY.current;

      // Ignore small movements — only act once we've moved
      // at least `threshold` pixels since our last recorded position.
      if (Math.abs(diff) < threshold) return;

      // Hide only if:
      //  - we're scrolling down (diff > 0), AND
      //  - we're already past 80px (so it doesn't hide near the very top)
      setHidden(diff > 0 && y > 80);

      // Update our "last known position" for the next comparison.
      lastY.current = y;
    };

    window.addEventListener("scroll", handle, { passive: true });

    // Cleanup: this runs when the component unmounts, OR right before
    // the effect re-runs (e.g., if `threshold` changes). It MUST remove
    // the exact same listener we added above — otherwise old listeners
    // pile up and never get cleared, causing "handle" to fire multiple
    // times per scroll and leaking memory.
    return () => window.removeEventListener("scroll", handle);

  }, [threshold]); // Effect re-runs only if `threshold` changes.

  return hidden;
}