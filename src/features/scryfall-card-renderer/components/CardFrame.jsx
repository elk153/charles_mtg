import OracleText from "./OracleText.jsx";

/**
 * The visual frame shared by every layout: image, name, mana cost, type
 * line, oracle text, and stats. Every shape component composes this rather
 * than re-implementing it, so the 99%-common case (a face) is written once.
 *
 * `rotation` (degrees: 0/90/180/270) rotates the whole block — image and
 * text together — since that's how split/flip cards are physically
 * printed: the image and its text are one rotated unit, not independent
 * pieces. Defaults to `face.rotation` (set by normalizeCard) but can be
 * overridden explicitly by a caller that manages rotation itself.
 */
export default function CardFrame({ face, image, rotation}) {
  const resolvedImage = image ?? face.image;
  const resolvedRotation = rotation ?? face.rotation ?? 0;
  console.log(resolvedRotation);

  return (
    <div className="card-frame">
      {resolvedImage && (
        <div className={`card-frame-${resolvedRotation}`} >
          <img
            className={`card rotated-card-${resolvedRotation}`}
            src={resolvedImage}
            alt={face.name}
            loading="lazy"
          />
        </div>
      )}
      <div className="scryfall-card__text card-description">
        <div className="scryfall-card__header">
          <h3 className="scryfall-card__name">{face.name}</h3>
        </div>

        {face.typeLine && (
          <em><span className="scryfall-card__type-line">{face.typeLine}</span></em>
        )}
        {face.manaCost && (
            <span className="scryfall-card__mana-cost"><OracleText text={face.manaCost} Component="span" /></span>
        )}
        &nbsp;
        {face.power&& (
          <span className={"color-pill color__M"}>
            {face.power ? (face.power+"/"+face.toughness) : "N/A"}
          </span>
        )}
        {face.loyalty&& (
          <span className={"color-pill color__M"}>
            {face.loyalty}
          </span>
        )}
        {face.defense&& (
          <span className={"color-pill color__M"}>
            {face.defense}
          </span>
        )}

        {face.oracleText && (
          <>
            <hr style={{ border: "none", height: "1px", backgroundColor: "#805e24" }} />
            <div className="scryfall-card__oracle-text"><OracleText text={face.oracleText} Component="p" /></div>
          </>
        )}

        {face.flavorText && (
          <>
            <hr style={{ border: "none", height: "1px", backgroundColor: "#805e24" }} />
            <p className="scryfall-card__flavor-text"><em>{face.flavorText}</em></p>
          </>
        )}

      </div>
    </div>
  );
}
