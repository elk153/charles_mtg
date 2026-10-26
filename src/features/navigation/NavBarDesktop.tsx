import SearchSourceToggle from "./SearchSourceToggle.tsx";
import type { NavBarProps } from "./types.ts";
import { resolvePath, useLocation, useNavigate, useResolvedPath } from "react-router";
import navItems from "./navItems";
import NavSearchField from "./NavSearchField";
import NavThemeToggle from "./NavThemeToggle.tsx";
import useScrollVisibility from "../../hooks/useScrollVisibility";

export default function NavBarDesktop({
  searchSource,
  onSearchSourceToggle,
  onSearch,
}: NavBarProps) {
  const visible = useScrollVisibility({ threshold: 12, topGuard: 56 });
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const routeBasePath = useResolvedPath(".").pathname;

  return (
    <header
      className={`nav-bar nav-bar--desktop nav-surface${visible ? "" : " nav-bar--hidden"}`}
      data-visible={visible}
    >
      <nav className="nav-bar__row" aria-label="Primary">
        <NavThemeToggle />
        <SearchSourceToggle
          value={searchSource}
          onToggle={onSearchSourceToggle}
        />
        <NavSearchField onSearch={onSearch} id="nav-search-desktop" />

        <ul className="nav-bar__list">
          {navItems.map(({ id, label, path, Icon }) => {
            const isActive = pathname === resolvePath(path, routeBasePath).pathname;
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
