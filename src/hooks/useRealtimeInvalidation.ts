import { useEffect, useState } from "react";
import type { QueryKey } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../services/supabaseClient.ts";
import { consumeLocalRealtimeChange } from "../services/localRealtimeChanges.ts";

type RealtimeTable = "favorites" | "binders" | "binder_cards";

type UseRealtimeInvalidationOptions = {
  table: RealtimeTable;
  userId?: string;
  queryKey: QueryKey;
};

function eventRowId(value: unknown, table: RealtimeTable): string | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }
  const key = table === "favorites" ? "scryfall_id" : "id";
  const rowId = (value as Record<string, unknown>)[key];
  return typeof rowId === "string" ? rowId : undefined;
}

export default function useRealtimeInvalidation({
  table,
  userId,
  queryKey,
}: UseRealtimeInvalidationOptions) {
  const queryClient = useQueryClient();
  const [subscriptionState, setSubscriptionState] = useState<{
    scope: string;
    error: Error | null;
  } | null>(null);
  const scope = `${table}:${userId ?? ""}`;

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`invalidate-${table}-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const rowId =
            eventRowId(payload.new, table) ?? eventRowId(payload.old, table);
          if (consumeLocalRealtimeChange(table, userId, rowId)) return;
          void queryClient.invalidateQueries({ queryKey });
        },
      )
      .subscribe((status, subscriptionError) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setSubscriptionState({
            scope,
            error:
              subscriptionError ??
              new Error(`Realtime subscription failed for ${table}.`),
          });
        } else if (status === "SUBSCRIBED") {
          setSubscriptionState({ scope, error: null });
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, queryKey, scope, table, userId]);

  return subscriptionState?.scope === scope
    ? subscriptionState.error
    : null;
}
