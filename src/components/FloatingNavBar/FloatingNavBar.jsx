import { useEffect, useRef, useState } from "react";
import useScrollDirection from "../../hooks/useScrollDirection";
import "./floatingNavBar.css";
import { useFormState } from "react-dom";

const NAV_ITEMS = [
  { id:"home", label:"Home", icon:"house" },
  { id:"explore", label:"Explore", icon:"compass" }
];

const FloatingNavBar = () => {

  const [active, setActive] = useState("home")
  const navRef = useRef(null);
  const hidden = useScrollDirection();

  useEffect( () => {

    const vp = window.visualViewport;
    if (!vp) return;

    const update () => {
      const kbH = window.innerHeight - vp.height - vp.offsetTop;
      navRef.current.style.bottom = `${Math.max(24, kbH + 8)}px`;
    };

    vp.addEventListener("resize", update);

    return () => vp.removeEventListener("resize", update);

  }, []);

  const handleSelect = (id) => {
    setActive(id);
    onNavigate?.(id);
  };

  return (

    <nav
      ref={navRef}
      className={`floating-navbar${hidden ? hidden : ""}`}
      aria-label="Main navigation"
    >

      {NAV_ITEMS.map()}
    </nav>

  );

};

export default FloatingNavBar;