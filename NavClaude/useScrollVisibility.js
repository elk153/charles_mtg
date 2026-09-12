import { useEffect, useRef, useState } from "react";

/**
 * useScrollVisibility
 *
 * Shared "disappearing bar" logic for both the desktop header and the
 * mobile floating bar. Scrolling down past `threshold` hides the bar;
 * scrolling up (by even a little) reveals it again. Staying near the
 * top of the page always keeps it visible.
 *
 * @param {number} threshold - px of downward scroll before hiding
 * @param {number} topGuard  - px from top where the bar is always shown
 */
export default function useScrollVisibility({ threshold = 10, topGuard = 48 } = {}) {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(typeof window !== "undefined" ? window.scrollY : 0);
  const accum = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      const delta = y - lastY.current;

      if (y <= topGuard) {
        setVisible(true);
        accum.current = 0;
        lastY.current = y;
        return;
      }

      // Only accumulate while scrolling in one consistent direction,
      // so a jittery trackpad doesn't flicker the bar.
      if (Math.sign(delta) === Math.sign(accum.current) || accum.current === 0) {
        accum.current += delta;
      } else {
        accum.current = delta;
      }

      if (accum.current > threshold) {
        setVisible(false);
        accum.current = 0;
      } else if (accum.current < -threshold * 0.6) {
        setVisible(true);
        accum.current = 0;
      }

      lastY.current = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold, topGuard]);

  return visible;
}
