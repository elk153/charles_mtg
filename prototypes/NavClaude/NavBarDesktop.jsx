import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import navItems from "./navItems";
import NavSearchField from "./NavSearchField";
import useScrollVisibility from "./hooks/useScrollVisibility";

export default function NavBarDesktop() {
  const visible = useScrollVisibility({ threshold: 12, topGuard: 56 });
  const { pathname } = useLocation();
  const navigate = useNavigate();

  function handleSearch(query) {
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : "/search/random");
  }

  return (
    <header
      className={`nav-bar nav-bar--desktop nav-surface${visible ? "" : " nav-bar--hidden"}`}
      data-visible={visible}
    >
      <nav className="nav-bar__row" aria-label="Primary">
        <NavSearchField onSearch={handleSearch} id="nav-search-desktop" />

        <ul className="nav-bar__list">
          {navItems.map(({ id, label, path, Icon }) => {
            const isActive = pathname === path;
            return (
              <li key={id}>
                <button
                  type="button"
                  className={`nav-item${isActive ? " is-active" : ""}`}
                  onClick={() => navigate(path)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon />
                  <span className="nav-label">{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
