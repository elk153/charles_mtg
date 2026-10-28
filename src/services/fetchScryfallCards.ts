import type { ApiRecord } from "./createApiClient.ts";

const SCRYFALL_COLLECTION_URL = "https://api.scryfall.com/cards/collection";
export const SCRYFALL_COLLECTION_LIMIT = 75;

export type ScryfallCardRecord = ApiRecord & {
  id: string;
};

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isScryfallCardRecord(value: unknown): value is ScryfallCardRecord {
  return isRecord(value) && typeof value.id === "string";
}

export default async function fetchScryfallCards(
  ids: string[],
  signal: AbortSignal,
): Promise<ScryfallCardRecord[]> {
  if (ids.length > SCRYFALL_COLLECTION_LIMIT) {
    throw new Error("A Scryfall collection request cannot contain more than 75 cards.");
  }

  if (ids.length === 0) return [];

  const response = await fetch(SCRYFALL_COLLECTION_URL, {
    method: "POST",
    signal,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identifiers: ids.map((id) => ({ id })),
    }),
  });
  const json: unknown = await response.json();

  if (!isRecord(json)) {
    throw new Error("Scryfall returned collection data in an unexpected format.");
  }

  if (!response.ok || json.object === "error") {
    const details =
      typeof json.details === "string"
        ? json.details
        : typeof json.message === "string"
          ? json.message
          : `${response.status} ${response.statusText}`;
    throw new Error(`Scryfall collection request failed: ${details}`);
  }

  if (
    json.object !== "list" ||
    !Array.isArray(json.data) ||
    !json.data.every(isScryfallCardRecord)
  ) {
    throw new Error("Scryfall returned collection data in an unexpected format.");
  }

  return json.data;
}
