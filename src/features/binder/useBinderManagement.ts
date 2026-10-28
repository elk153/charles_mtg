import { useState } from "react";
import type { CardBrowserCard } from "../card-browser/types.ts";
import type { CopyFormValues } from "./BinderCopyForm.tsx";
import useBinderCopies, { type BinderCopy } from "./useBinderCopies.ts";
import useBinders from "./useBinders.ts";

type Notify = (message: string) => void;

export default function useBinderManagement(notify: Notify) {
  const [cardToAdd, setCardToAdd] = useState<CardBrowserCard | null>(null);
  const copies = useBinderCopies();
  const bindersQuery = useBinders();

  function requestAdd(card: CardBrowserCard) {
    setCardToAdd(card);
  }

  async function addCopy(values: CopyFormValues) {
    if (!cardToAdd) return;
    try {
      await copies.addCopy.mutateAsync({
        ...values,
        status: values.status ?? "owned",
        scryfall_id: cardToAdd.id,
        rarity: cardToAdd.rarity,
      });
      notify(`Added ${cardToAdd.name} to your Binder.`);
      setCardToAdd(null);
    } catch (error) {
      notify(
        `Could not add ${cardToAdd.name}: ${
          error instanceof Error ? error.message : "The request failed."
        }`,
      );
    }
  }

  async function updateCopy(copy: BinderCopy, values: CopyFormValues) {
    try {
      const nextStatus = values.status ?? copy.status;
      const changes = {
        ...values,
        disposal_price:
          nextStatus === "owned"
            ? null
            : values.disposal_price ?? copy.disposal_price,
        disposed_at:
          nextStatus === "owned"
            ? null
            : copy.disposed_at ?? new Date().toISOString(),
      };
      await copies.updateCopy.mutateAsync({ id: copy.id, changes });
      notify("Binder copy updated.");
      return true;
    } catch (error) {
      notify(
        `Could not update binder copy: ${
          error instanceof Error ? error.message : "The request failed."
        }`,
      );
      return false;
    }
  }

  async function disposeCopy(
    copyId: string,
    status: "sold" | "lost" | "given_away",
  ) {
    try {
      await copies.updateCopy.mutateAsync({
        id: copyId,
        changes: { status, disposed_at: new Date().toISOString() },
      });
      notify(`Copy marked ${status.replaceAll("_", " ")}.`);
    } catch (error) {
      notify(
        `Could not update binder copy: ${
          error instanceof Error ? error.message : "The request failed."
        }`,
      );
    }
  }

  async function restoreCopy(copyId: string) {
    try {
      await copies.updateCopy.mutateAsync({
        id: copyId,
        changes: {
          status: "owned",
          disposed_at: null,
          disposal_price: null,
        },
      });
      notify("Copy restored to owned.");
    } catch (error) {
      notify(
        `Could not restore binder copy: ${
          error instanceof Error ? error.message : "The request failed."
        }`,
      );
    }
  }

  async function deleteCopy(copyId: string) {
    if (!window.confirm("Delete this binder copy permanently?")) return;
    try {
      await copies.deleteCopy.mutateAsync(copyId);
      notify("Binder copy deleted.");
    } catch (error) {
      notify(
        `Could not delete binder copy: ${
          error instanceof Error ? error.message : "The request failed."
        }`,
      );
    }
  }

  const isPending =
    copies.addCopy.isPending ||
    copies.updateCopy.isPending ||
    copies.deleteCopy.isPending;

  return {
    copies,
    binders: bindersQuery.binders,
    bindersQuery,
    bindersError: bindersQuery.error,
    realtimeError:
      copies.realtimeError ?? bindersQuery.realtimeError ?? null,
    bindersLoading: bindersQuery.isLoading,
    cardToAdd,
    requestAdd,
    closeAdd: () => setCardToAdd(null),
    addCopy,
    updateCopy,
    disposeCopy,
    restoreCopy,
    deleteCopy,
    isPending,
  };
}
