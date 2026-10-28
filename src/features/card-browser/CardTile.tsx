import { useRef, useState } from "react";
import BinderIcon from "../../assets/navigation/BinderIcon.tsx";
import DecksIcon from "../../assets/navigation/DecksIcon.tsx";
import FavoritesIcon from "../../assets/navigation/FavoritesIcon.tsx";
import IconTurnAround from "../../assets/IconTurnAround.tsx";
import type { BinderCopy } from "../binder/useBinderCopies.ts";
import type { Binder } from "../binder/useBinders.ts";
import type { CopyFormValues } from "../binder/BinderCopyForm.tsx";
import BinderCopiesPopover from "../binder/BinderCopiesPopover.tsx";
import type { CardAction, CardBrowserCard } from "./types.ts";
import "./CardTile.css";

type CardTileProps = {
  card: CardBrowserCard;
  onSelect?: (card: CardBrowserCard) => void;
  onAction?: (action: CardAction, card: CardBrowserCard) => void;
  isFavorite?: boolean;
  isFavoritePending?: boolean;
  binderCopies?: BinderCopy[];
  binders?: Binder[];
  isBinderPending?: boolean;
  canManageBinder?: boolean;
  onAddBinderCopy?: (card: CardBrowserCard) => void;
  onUpdateBinderCopy?: (
    copy: BinderCopy,
    values: CopyFormValues,
  ) => Promise<boolean>;
  onDisposeBinderCopy?: (
    copy: BinderCopy,
    status: "sold" | "lost" | "given_away",
  ) => void;
  onRestoreBinderCopy?: (copy: BinderCopy) => void;
  onDeleteBinderCopy?: (copy: BinderCopy) => void;
  showActions?: boolean;
};

const CARD_ACTIONS = [
  { action: "favorite", label: "Favorites", Icon: FavoritesIcon },
  { action: "binder", label: "Binder", Icon: BinderIcon },
  { action: "deck", label: "Decks", Icon: DecksIcon },
] as const;

export default function CardTile({
  card,
  onSelect,
  onAction,
  isFavorite = false,
  isFavoritePending = false,
  binderCopies = [],
  binders = [],
  isBinderPending = false,
  canManageBinder = true,
  onAddBinderCopy,
  onUpdateBinderCopy,
  onDisposeBinderCopy,
  onRestoreBinderCopy,
  onDeleteBinderCopy,
  showActions = true,
}: CardTileProps) {
  const [showBack, setShowBack] = useState(false);
  const [showBinderPopover, setShowBinderPopover] = useState(false);
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
          {CARD_ACTIONS.map(({ action, label, Icon }) => {
            const isFavoriteAction = action === "favorite";
            const isBinderAction = action === "binder";
            const ownedBinderCount = binderCopies.filter(
              (copy) => copy.status === "owned",
            ).length;
            const favoriteLabel = isFavorite
              ? "Remove from Favorites"
              : "Add to Favorites";
            const binderLabel = ownedBinderCount
              ? `${ownedBinderCount} binder ${ownedBinderCount === 1 ? "copy" : "copies"}`
              : "Add to Binder";
            const actionLabel = isFavoriteAction
              ? favoriteLabel
              : isBinderAction
                ? binderLabel
              : `${label} — under construction`;
            return (
              <span
                key={action}
                className="browser-card__action-wrap"
                onPointerEnter={(event) => {
                  if (isBinderAction && canManageBinder && event.pointerType === "mouse") {
                    setShowBinderPopover(true);
                  }
                }}
                onPointerLeave={(event) => {
                  if (isBinderAction && event.pointerType === "mouse") {
                    setShowBinderPopover(false);
                  }
                }}
                onFocus={() => {
                  if (isBinderAction && canManageBinder) setShowBinderPopover(true);
                }}
                onBlur={(event) => {
                  const nextTarget = event.relatedTarget;
                  if (
                    isBinderAction &&
                    (!(nextTarget instanceof Node) ||
                      !event.currentTarget.contains(nextTarget))
                  ) {
                    setShowBinderPopover(false);
                  }
                }}
              >
                <button
                  type="button"
                  className={`browser-card__action${isFavoriteAction && isFavorite ? " browser-card__action--favorite-active" : ""}${isBinderAction && ownedBinderCount > 0 ? " browser-card__action--binder-active" : ""}`}
                  aria-label={
                    isFavoriteAction
                      ? `${favoriteLabel}: ${card.name}`
                      : isBinderAction
                        ? `${canManageBinder ? binderLabel : "Sign in to manage Binder"}: ${card.name}`
                        : `${label} action for ${card.name} (under construction)`
                  }
                  aria-pressed={isFavoriteAction ? isFavorite : isBinderAction ? ownedBinderCount > 0 : undefined}
                  title={`${actionLabel}${isFavoritePending && isFavoriteAction ? " — updating" : ""}`}
                  disabled={
                    (isFavoriteAction && isFavoritePending) ||
                    (isBinderAction && isBinderPending)
                  }
                  onClick={() => {
                    if (isBinderAction && canManageBinder) {
                      setShowBinderPopover(true);
                    } else if (isBinderAction) {
                      onAction?.(action, card);
                    } else {
                      onAction?.(action, card);
                    }
                  }}
                >
                  <Icon />
                  {isBinderAction && ownedBinderCount > 0 && (
                    <span className="browser-card__binder-count" aria-hidden="true">
                      {ownedBinderCount}
                    </span>
                  )}
                </button>
                {isBinderAction && showBinderPopover && (
                  <BinderCopiesPopover
                    card={card}
                    copies={binderCopies}
                    binders={binders}
                    isBusy={isBinderPending}
                    onAdd={() => onAddBinderCopy?.(card)}
                    onUpdate={(copy, values) =>
                      onUpdateBinderCopy?.(copy, values) ?? Promise.resolve(false)
                    }
                    onDispose={(copy, status) =>
                      onDisposeBinderCopy?.(copy, status)
                    }
                    onRestore={(copy) => onRestoreBinderCopy?.(copy)}
                    onDelete={(copy) => onDeleteBinderCopy?.(copy)}
                    onClose={() => setShowBinderPopover(false)}
                  />
                )}
              </span>
            );
          })}
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
        </div>
      )}
    </article>
  );
}
