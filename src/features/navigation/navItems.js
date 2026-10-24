import {
  HomeIcon,
  AdvancedSearchIcon,
  FavoritesIcon,
  CollectionIcon,
  DecksIcon,
} from "./NavIcons";

// Single source of truth for the 5 options. Both NavBarDesktop and
// NavBarMobile map over this so labels/icons/paths never drift apart.
const navItems = [
  { id: "home", label: "Home", path: "/", Icon: HomeIcon },
  { id: "advanced-search", label: "Search", path: "/search/advanced", Icon: AdvancedSearchIcon },
  { id: "favorites", label: "Favorites", path: "/favorites", Icon: FavoritesIcon },
  { id: "collection", label: "Collection", path: "/collection", Icon: CollectionIcon },
  { id: "decks", label: "Decks", path: "/decks", Icon: DecksIcon },
];

export default navItems;
