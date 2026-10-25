import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table";
import type { CardColor, ScryfallCard } from "./types.ts";

// Features are opt-in in v9: register only what the table uses.
// Keep this at module level so its reference never changes.
export const features = tableFeatures({
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
});

const RARITY_RANK: Record<string, number> = { common: 0, uncommon: 1, rare: 2, mythic: 3 };

// Double-faced cards keep their colors on the faces, so fall back to the front face.
const getColors = (card: ScryfallCard): CardColor[] =>
  card.colors ?? card.card_faces?.[0]?.colors ?? [];

const getTypeLine = (card: ScryfallCard): string =>
  card.type_line ?? card.card_faces?.[0]?.type_line ?? "";

const helper = createColumnHelper<typeof features, ScryfallCard>();

// A column = how to read a value from a card + how it filters/sorts.
// filterFn(row, columnId, filterValue) returns true to KEEP the row.
export const columns = helper.columns([
  helper.accessor((card) => card.name, { id: "name" }),
  helper.accessor((card) => getColors(card), {
    id: "colors",
    filterFn: (row, columnId, selected: string[]) => {
      const colors = row.getValue<CardColor[]>(columnId);
      return selected.some((c) => (c === "C" ? colors.length === 0 : colors.includes(c as CardColor)));
    },
  }),
  helper.accessor((card) => getTypeLine(card), {
    id: "type",
    filterFn: (row, columnId, text: string) =>
      row.getValue<string>(columnId).toLowerCase().includes(text.toLowerCase()),
  }),
  helper.accessor((card) => card.cmc ?? 0, { id: "cmc" }),
  helper.accessor((card) => RARITY_RANK[card.rarity] ?? -1, {
    id: "rarity",
    filterFn: (row, _columnId, selected: string[]) => selected.includes(row.original.rarity),
  }),
  helper.accessor((card) => (card.prices?.eur ? Number(card.prices.eur) : undefined), {
    id: "price",
    sortUndefined: "last", // cards without a price always go to the end
  }),
]);
