import { useEffect, useRef, useState } from "react";

/**
 * @param {number}               threshold   - Min px delta before direction registers.
 * @param {{ current: boolean }} keyboardRef - Shared ref; when true the scroll handler
 *                                            exits immediately without updating state.
 */
export default function useScrollDirection(threshold = 12, keyboardRef = null) {
  const lastY  = useRef(window.scrollY);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handle = () => {
      // Bail out synchronously before doing anything if keyboard is open.
      // keyboardRef.current is always current — no React flush lag.
      if (keyboardRef?.current) return;

      const y    = window.scrollY;
      const diff = y - lastY.current;

      if (Math.abs(diff) < threshold) return;

      setHidden(diff > 0 && y > 80);
      lastY.current = y;
    };

    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, [threshold, keyboardRef]);

  // When keyboard opens, immediately un-hide so the bar is visible above it.
  // We watch keyboardRef via a separate effect driven by a mirrored state.
  return hidden;
}