import React from "react";
import NavBarDesktop from "./NavBarDesktop";
import NavBarMobile from "./NavBarMobile";
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
  return (
    <>
      <NavBarDesktop />
      <NavBarMobile />
    </>
  );
}
