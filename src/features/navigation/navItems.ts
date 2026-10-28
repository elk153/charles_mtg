import HomeIcon from "../../assets/navigation/HomeIcon.tsx";
import AdvancedSearchIcon from "../../assets/navigation/AdvancedSearchIcon.tsx";
import FavoritesIcon from "../../assets/navigation/FavoritesIcon.tsx";
import BinderIcon from "../../assets/navigation/BinderIcon.tsx";
import DecksIcon from "../../assets/navigation/DecksIcon.tsx";

// Single source of truth for the 5 options. Both NavBarDesktop and
// NavBarMobile map over this so labels/icons/paths never drift apart.
const navItems = [
  { id: "home", label: "Home", path: "home", Icon: HomeIcon },
  { id: "advanced-search", label: "Search", path: "search/advanced", Icon: AdvancedSearchIcon },
  { id: "favorites", label: "Favorites", path: "favorites", Icon: FavoritesIcon },
  { id: "binder", label: "Binder", path: "binder", Icon: BinderIcon },
  { id: "decks", label: "Decks", path: "decks", Icon: DecksIcon },
];

export default navItems;
