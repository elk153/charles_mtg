import React from "react";
import "./Header.css";
import magnifier from "../../assets/magnifier.svg";
import deck from "../../assets/deck.svg";
import IconSearch from "../../assets/IconSearch";
import IconCards from "../../assets/IconCards";

const Header = () => {

  return (

    <header className="header">

      <nav aria-label="Main Navigation">
        <ul className="nav-menu">
          <li className="nav-icon"><IconSearch /></li>
          <li className="nav-icon"><IconCards /></li>
        </ul>
      </nav>

      <h1 className="title">
        Charles' MTG Collection
      </h1>

      <img className="logo" src="/favicon.svg" />

    </header>

  );

};

export default Header;