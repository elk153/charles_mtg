import { SCRYFALL_CARD_LAYOUT_MAP } from './scryfallCardLayouts.js';

/**
 * Normalize a single Scryfall face (or a single-faced root card) into a
 * flat, consistently-named object. Every renderer downstream consumes this
 * shape only — never the raw Scryfall field names directly.
 */
function toNormalizedFace(face) {
  return {
    name: face.name,
    manaCost: face.mana_cost ?? null,
    typeLine: face.type_line ?? '',
    oracleText: face.oracle_text ?? '',
    flavorText: face.flavor_text ?? null,
    power: face.power ?? null,
    toughness: face.toughness ?? null,
    loyalty: face.loyalty ?? null,
    defense: face.defense ?? null,
    artist: face.artist ?? null,
    image: face.image_uris?.normal ?? face.image_uris?.large ?? null,
    // Only present on reversible_card faces — each face can have its own
    // layout (e.g. front = normal, back = saga). Consumers that render a
    // reversible_card face directly should re-run it through this same
    // normalization using this value.
    layout: face.layout ?? null,
  };
}

/**
 * Normalize any Scryfall card object into a consistent structure:
 * always a `faces` array (length 1 for single-faced cards), a resolved
 * `shape` for component dispatch, and the raw `layout`/`allParts` kept
 * around for the rare cases that need them (extras widgets, meld).
 *
 * @param {object} card - Raw Scryfall card object
 * @returns {object} Normalized card
 */
export function normalizeCard(card) {
  const config =
    SCRYFALL_CARD_LAYOUT_MAP.get(card.layout) ??
    SCRYFALL_CARD_LAYOUT_MAP.get('normal');

  const faces = card.card_faces?.length
    ? card.card_faces.map(toNormalizedFace)
    : [toNormalizedFace(card)];

  return {
    id: card.id,
    layout: card.layout,
    shape: config.shape,
    name: card.name,
    faces,
    allParts: card.all_parts ?? null,
    // Fallback image for single-faced cards (card.image_uris lives on the
    // root object when there's no card_faces array).
    rootImage: card.image_uris?.normal ?? card.image_uris?.large ?? null,
  };
}
