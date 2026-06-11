import React from "react";
import "./Header.css";
import magnifier from "../../assets/magnifier.svg";
import deck from "../../assets/deck.svg";

const Header = () => {

  return (

    <header className="header">

      <nav aria-label="Main Navigation">
        <ul className="nav-menu">
          <li><img src={magnifier} alt="Search for cards" /></li>
          <li><img src={deck} alt="My decks" /></li>
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