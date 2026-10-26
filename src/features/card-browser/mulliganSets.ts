const BOOSTER_FOCUSED_SET_TYPES = new Set([
  "core",
  "expansion",
  "masters",
  "draft_innovation",
  "eternal",
  "funny",
]);

export type ScryfallSet = {
  code: string;
  name: string;
  set_type: string;
  card_count: number;
  digital: boolean;
  released_at: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isScryfallSet(value: unknown): value is ScryfallSet {
  return (
    isRecord(value) &&
    typeof value.code === "string" &&
    typeof value.name === "string" &&
    typeof value.set_type === "string" &&
    typeof value.card_count === "number" &&
    typeof value.digital === "boolean" &&
    (typeof value.released_at === "string" || value.released_at === null)
  );
}

export function getMulliganSets(sets: readonly ScryfallSet[]): ScryfallSet[] {
  // Set objects have no booster-eligibility flag; keep this set-type allowlist
  // explicit so other product categories can be added without changing the picker.
  return sets
    .filter(
      (set) =>
        !set.digital &&
        set.card_count >= 5 &&
        set.released_at !== null &&
        BOOSTER_FOCUSED_SET_TYPES.has(set.set_type),
    )
    .toSorted((left, right) => left.code.localeCompare(right.code));
}

function indexForDay(day: number, count: number): number {
  const hashedDay = (Math.imul(day, 48271) + 0x7fffffff) >>> 0;
  let index = hashedDay % count;

  if (count > 1) {
    const previousHash = (Math.imul(day - 1, 48271) + 0x7fffffff) >>> 0;
    if (index === previousHash % count) index = (index + 1) % count;
  }

  return index;
}

export function selectDailyMulliganSet(
  sets: readonly ScryfallSet[],
  day: number,
): ScryfallSet | undefined {
  if (sets.length === 0) return undefined;
  return sets[indexForDay(day, sets.length)];
}
