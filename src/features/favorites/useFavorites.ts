import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../app/AppProviders/AuthContext.ts";
import { supabase } from "../../services/supabaseClient.ts";

const FAVORITES_PAGE_SIZE = 500;

type FavoriteRow = {
  scryfall_id: string;
};

type ToggleFavoriteInput = {
  userId: string;
  scryfallId: string;
  isFavorite: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseFavoriteRows(value: unknown): FavoriteRow[] {
  if (!Array.isArray(value)) {
    throw new Error("Supabase returned favorites in an unexpected format.");
  }

  return value.map((row) => {
    if (!isRecord(row) || typeof row.scryfall_id !== "string") {
      throw new Error("Supabase returned a favorite with an invalid card ID.");
    }

    return { scryfall_id: row.scryfall_id };
  });
}

async function fetchFavoriteIds(userId: string): Promise<string[]> {
  const favoriteIds: string[] = [];
  let cursor: string | undefined;

  while (true) {
    let request = supabase
      .from("favorites")
      .select("scryfall_id")
      .eq("user_id", userId)
      .order("scryfall_id", { ascending: true })
      .limit(FAVORITES_PAGE_SIZE);

    if (cursor) {
      request = request.gt("scryfall_id", cursor);
    }

    const { data, error } = await request;
    if (error) throw error;

    const rows = parseFavoriteRows(data);
    favoriteIds.push(...rows.map((row) => row.scryfall_id));

    if (rows.length < FAVORITES_PAGE_SIZE) {
      return favoriteIds;
    }

    cursor = rows[rows.length - 1].scryfall_id;
  }
}

export function useFavoriteIds() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: () => {
      if (!user) throw new Error("Sign in to load favorites.");
      return fetchFavoriteIds(user.id);
    },
    enabled: Boolean(user),
    staleTime: 30_000,
  });

  const favoriteIds = useMemo(
    () => new Set(query.data ?? []),
    [query.data],
  );

  return {
    favoriteIds,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useToggleFavorite() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, ToggleFavoriteInput>({
    mutationFn: async ({ userId, scryfallId, isFavorite }) => {
      if (!user || user.id !== userId) {
        throw new Error("Sign in again before changing favorites.");
      }

      const request = isFavorite
        ? supabase
            .from("favorites")
            .delete()
            .eq("user_id", userId)
            .eq("scryfall_id", scryfallId)
        : supabase.from("favorites").insert({
            user_id: userId,
            scryfall_id: scryfallId,
          });
      const { error } = await request;
      if (error) throw error;
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: ["favorites", variables.userId],
      }),
  });
}
