import { useMemo } from "react";
import { useQueryStates } from "nuqs";
import { useTable } from "@tanstack/react-table";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { columns, features } from "./columns.ts";
import { filterParsers } from "./filterParams.ts";
import type { ScryfallCard } from "./types.ts";

// Stable fallback: a new [] on every render would make the table recompute everything.
const NO_CARDS: ScryfallCard[] = [];

export function useCardsTable(cards: ScryfallCard[] | undefined) {
  // 1. URL state (source of truth). Same shape as useState: [values, setter].
  const [filters, setFilters] = useQueryStates(filterParsers);

  // 2. Translate URL state into TanStack Table state.
  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const active: ColumnFiltersState = [];
    if (filters.colors.length) active.push({ id: "colors", value: filters.colors });
    if (filters.rarity.length) active.push({ id: "rarity", value: filters.rarity });
    if (filters.type.trim()) active.push({ id: "type", value: filters.type.trim() });
    return active;
  }, [filters.colors, filters.rarity, filters.type]);

  const sorting = useMemo<SortingState>(
    () => (filters.sort ? [{ id: filters.sort, desc: filters.dir === "desc" }] : []),
    [filters.sort, filters.dir],
  );

  // 3. The table is "controlled": it reads our state instead of keeping its own.
  //    The URL is the only place state is written, so the data flow is one-way.
  const table = useTable({
    features,
    columns,
    data: cards ?? NO_CARDS,
    state: { columnFilters, sorting },
  });

  const resetFilters = () =>
    setFilters({ colors: null, rarity: null, type: null, sort: null, dir: null });

  return { table, filters, setFilters, resetFilters };
}
