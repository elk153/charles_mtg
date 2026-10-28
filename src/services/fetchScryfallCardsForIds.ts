import fetchScryfallCards, {
  SCRYFALL_COLLECTION_LIMIT,
  type ScryfallCardRecord,
} from "./fetchScryfallCards.ts";

const REQUEST_GAP_MS = 100;

export default async function fetchScryfallCardsForIds(
  ids: string[],
  signal: AbortSignal,
): Promise<ScryfallCardRecord[]> {
  const uniqueIds = [...new Set(ids)];
  const cards: ScryfallCardRecord[] = [];

  for (let offset = 0; offset < uniqueIds.length; offset += SCRYFALL_COLLECTION_LIMIT) {
    if (signal.aborted) {
      throw new DOMException("The Scryfall collection request was aborted.", "AbortError");
    }

    if (offset > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, REQUEST_GAP_MS));
    }

    cards.push(
      ...(await fetchScryfallCards(
        uniqueIds.slice(offset, offset + SCRYFALL_COLLECTION_LIMIT),
        signal,
      )),
    );
  }

  return cards;
}
