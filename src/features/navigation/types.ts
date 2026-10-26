export type SearchSource = "scryfall" | "collection";

export type NavBarProps = {
  searchSource: SearchSource;
  onSearchSourceToggle: () => void;
  onSearch: (query: string) => void;
};
