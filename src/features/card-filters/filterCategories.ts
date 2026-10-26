export type FilterFeature = "v1" | "search" | "advancedSearch" | "collection" | "decks";
export type FilterCategory = "colors" | "rarity" | "type" | "sort";

export const FILTER_CATEGORIES_BY_FEATURE: Record<
  FilterFeature,
  readonly FilterCategory[]
> = {
  v1: ["colors", "rarity", "type", "sort"],
  search: ["colors", "rarity", "type", "sort"],
  advancedSearch: ["colors", "rarity", "type", "sort"],
  collection: ["colors", "rarity", "type"],
  decks: ["colors", "type"],
};

export const COLOR_LABELS = {
  W: "White",
  U: "Blue",
  B: "Black",
  R: "Red",
  G: "Green",
  C: "Colorless",
} as const;

export const RARITY_LABELS = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  mythic: "Mythic",
} as const;

export const SORT_LABELS = {
  name: "Name",
  cmc: "Mana value",
  rarity: "Rarity",
  price: "Price",
} as const;
