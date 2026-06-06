import React from "react";
import "./Header.css";

const Header = () => {

  return (

    <header className="header">

      <nav aria-label="Main Navigation">
        <ul className="nav-menu">
          <li>Search Tool</li>
          <li>Collection</li>
        </ul>
      </nav>

      <h1 className="title">
        MTG Collector
      </h1>

      <img className="logo" src="/favicon.svg" />

    </header>

  );

};

export default Header;