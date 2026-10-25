import { COLORS, RARITIES, SORT_DIRS, SORT_KEYS, filterParsers } from "./filterParams.ts";
import type { UseQueryStatesReturn, inferParserType } from "nuqs";
import "./CardFilters.css";

type Filters = inferParserType<typeof filterParsers>;

type Props = {
  filters: Filters;
  setFilters: UseQueryStatesReturn<typeof filterParsers>[1];
  onReset: () => void;
  shown: number;
  total: number;
};

// Add the value if missing, remove it if present.
const toggle = <T extends string>(list: readonly T[], value: T): T[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

export default function CardFilters({ filters, setFilters, onReset, shown, total }: Props) {
  return (
    <section className="card-filters" aria-label="Card filters">
      <div className="card-filters__group" role="group" aria-label="Colors">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={filters.colors.includes(c)}
            onClick={() => setFilters({ colors: toggle(filters.colors, c) })}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="card-filters__group" role="group" aria-label="Rarity">
        {RARITIES.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={filters.rarity.includes(r)}
            onClick={() => setFilters({ rarity: toggle(filters.rarity, r) })}
          >
            {r}
          </button>
        ))}
      </div>

      <input
        type="search"
        placeholder="Type (e.g. creature)"
        aria-label="Filter by card type"
        value={filters.type}
        onChange={(e) => setFilters({ type: e.target.value })}
      />

      <div className="card-filters__group">
        <select
          aria-label="Sort by"
          value={filters.sort ?? ""}
          onChange={(e) => setFilters({ sort: SORT_KEYS.find((k) => k === e.target.value) ?? null })}
        >
          <option value="">Sort: default</option>
          {SORT_KEYS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!filters.sort}
          onClick={() => setFilters({ dir: filters.dir === SORT_DIRS[0] ? "desc" : "asc" })}
        >
          {filters.dir === "asc" ? "↑" : "↓"}
        </button>
      </div>

      <p className="card-filters__count">
        {shown} of {total} cards
        <button type="button" onClick={onReset}>
          Clear
        </button>
      </p>
    </section>
  );
}
