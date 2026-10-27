import { useRef, useState } from "react";
import CollectionIcon from "../../assets/navigation/CollectionIcon.tsx";
import DecksIcon from "../../assets/navigation/DecksIcon.tsx";
import FavoritesIcon from "../../assets/navigation/FavoritesIcon.tsx";
import IconTurnAround from "../../assets/IconTurnAround.tsx";
import type { CardAction, CardBrowserCard } from "./types.ts";
import "./CardTile.css";

type CardTileProps = {
  card: CardBrowserCard;
  onSelect?: (card: CardBrowserCard) => void;
  onAction?: (action: CardAction, card: CardBrowserCard) => void;
  isFavorite?: boolean;
  isFavoritePending?: boolean;
  showActions?: boolean;
};

const CARD_ACTIONS = [
  { action: "favorite", label: "Favorites", Icon: FavoritesIcon },
  { action: "collection", label: "Collection", Icon: CollectionIcon },
  { action: "deck", label: "Decks", Icon: DecksIcon },
] as const;

export default function CardTile({
  card,
  onSelect,
  onAction,
  isFavorite = false,
  isFavoritePending = false,
  showActions = true,
}: CardTileProps) {
  const [showBack, setShowBack] = useState(false);
  const mouseIsHoveringFlip = useRef(false);
  const faces = card.card_faces ?? [];
  const canFlip =
    ["transform", "modal_dfc", "reversible_card", "double_faced_token"].includes(
      card.layout,
    ) &&
    faces.length > 1 &&
    Boolean(faces[0].image_uris?.normal && faces[1].image_uris?.normal);
  const activeFace = canFlip ? faces[showBack ? 1 : 0] : undefined;
  const image =
    activeFace?.image_uris?.normal ??
    card.image_uris?.normal ??
    faces[0]?.image_uris?.normal;
  const imageAlt = activeFace?.name ?? card.name;

  return (
    <article className="browser-card">
      <button
        type="button"
        className="browser-card__media"
        onClick={() => onSelect?.(card)}
        aria-label={`View details for ${card.name}`}
      >
        {image ? (
          <img src={image} alt={imageAlt} loading="lazy" />
        ) : (
          <span className="browser-card__placeholder" role="img" aria-label={card.name}>
            Card image unavailable
          </span>
        )}
      </button>

      {showActions && (
        <div className="browser-card__actions" aria-label={`${card.name} actions`}>
          {canFlip && (
            <button
              type="button"
              className="browser-card__action browser-card__action--flip"
              aria-label={`Show ${showBack ? faces[0].name : faces[1].name}`}
              aria-pressed={showBack}
              title="Flip card"
              onPointerEnter={(event) => {
                if (event.pointerType !== "mouse") return;
                mouseIsHoveringFlip.current = true;
                setShowBack(true);
              }}
              onPointerLeave={(event) => {
                if (event.pointerType !== "mouse") return;
                mouseIsHoveringFlip.current = false;
                setShowBack(false);
              }}
              onClick={() => {
                if (!mouseIsHoveringFlip.current) {
                  setShowBack((current) => !current);
                }
              }}
            >
              <IconTurnAround />
            </button>
          )}

          {CARD_ACTIONS.map(({ action, label, Icon }) => {
            const isFavoriteAction = action === "favorite";
            const favoriteLabel = isFavorite
              ? "Remove from Favorites"
              : "Add to Favorites";
            const actionLabel = isFavoriteAction
              ? favoriteLabel
              : `${label} — under construction`;
            return (
              <button
                key={action}
                type="button"
                className={`browser-card__action${isFavoriteAction && isFavorite ? " browser-card__action--favorite-active" : ""}`}
                aria-label={
                  isFavoriteAction
                    ? `${favoriteLabel}: ${card.name}`
                    : `${label} action for ${card.name} (under construction)`
                }
                aria-pressed={isFavoriteAction ? isFavorite : undefined}
                title={`${actionLabel}${isFavoritePending && isFavoriteAction ? " — updating" : ""}`}
                disabled={isFavoriteAction && isFavoritePending}
                onClick={() => onAction?.(action, card)}
              >
                <Icon />
              </button>
            );
          })}
        </div>
      )}
    </article>
  );
}
