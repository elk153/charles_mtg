import {
  SCRYFALL_CARD_LAYOUT_MAP,
  AFTERMATH_ROTATION_OVERRIDE,
  BATTLE_ROTATION_OVERRIDE,
} from './scryfallCardLayouts.js';

/**
 * Normalize a single Scryfall face (or a single-faced root card) into a
 * flat, consistently-named object. Every renderer downstream consumes this
 * shape only — never the raw Scryfall field names directly.
 *
 * @param {object} face - Raw face object (or the root card, for single-faced cards)
 * @param {number} rotation - Degrees (0/90/180/270) to rotate this face's
 *   block (image + text together) to read it as printed. See
 *   ROTATION_BY_LAYOUT in scryfallCardLayouts.js for how this is derived.
 */
function toNormalizedFace(face, rotation) {
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
    rotation,
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

  // Aftermath split cards (e.g. "Destined // Lead by Example") only rotate
  // their second half — Scryfall exposes this as a keyword, not a distinct
  // layout, so it can't live in the static ROTATION_BY_LAYOUT table and has
  // to be checked here, per card.
  const isAftermath = card.layout === 'split' && card.keywords?.includes('Aftermath');
  const isBattle = card.layout === 'transform' && card.card_faces[0]?.type_line.startsWith("Battle");
  const faceRotations = 
    isAftermath ? AFTERMATH_ROTATION_OVERRIDE
    : isBattle ? BATTLE_ROTATION_OVERRIDE
    : config.faceRotations;

  const faces = card.card_faces?.length
    ? card.card_faces.map((face, index) => toNormalizedFace(face, faceRotations[index] ?? 0))
    : [toNormalizedFace(card, faceRotations[0] ?? 0)];

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
    // Convenience flag for UI treatment (e.g. a "rotate your device" hint
    // on mobile) without every consumer having to scan card.faces itself.
    hasRotatedFaces: faces.some((face) => face.rotation !== 0),
  };
}