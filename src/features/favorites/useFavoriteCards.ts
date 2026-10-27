import { useInfiniteQuery } from "@tanstack/react-query";
import type { ApiRecord } from "../../services/createApiClient.ts";
import { supabase } from "../../services/supabaseClient.ts";
import { useAuth } from "../../app/AppProviders/AuthContext.ts";
import type { CardSource } from "../card-browser/types.ts";

const FAVORITES_PAGE_SIZE = 75;
const SCRYFALL_COLLECTION_URL = "https://api.scryfall.com/cards/collection";

type FavoriteRow = {
  scryfall_id: string;
  created_at: string;
};

type FavoriteCursor = {
  createdAt: string;
  scryfallId: string;
};

type FavoriteCardPage = {
  cards: ApiRecord[];
  nextCursor: FavoriteCursor | null;
};

type ScryfallCardRecord = ApiRecord & {
  id: string;
};

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isScryfallCardRecord(value: unknown): value is ScryfallCardRecord {
  return isRecord(value) && typeof value.id === "string";
}

function parseFavoriteRows(value: unknown): FavoriteRow[] {
  if (!Array.isArray(value)) {
    throw new Error("Supabase returned favorites in an unexpected format.");
  }

  return value.map((row) => {
    if (
      !isRecord(row) ||
      typeof row.scryfall_id !== "string" ||
      typeof row.created_at !== "string" ||
      Number.isNaN(Date.parse(row.created_at))
    ) {
      throw new Error("Supabase returned a favorite with invalid paging data.");
    }

    return {
      scryfall_id: row.scryfall_id,
      created_at: row.created_at,
    };
  });
}

async function fetchFavoriteRows(
  userId: string,
  cursor: FavoriteCursor | null,
): Promise<FavoriteRow[]> {
  let request = supabase
    .from("favorites")
    .select("scryfall_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .order("scryfall_id", { ascending: false })
    .limit(FAVORITES_PAGE_SIZE);

  if (cursor) {
    request = request.or(
      `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},scryfall_id.lt.${cursor.scryfallId})`,
    );
  }

  const { data, error } = await request;
  if (error) throw error;

  return parseFavoriteRows(data);
}

async function fetchScryfallCards(
  ids: string[],
  signal: AbortSignal,
): Promise<ScryfallCardRecord[]> {
  if (ids.length > FAVORITES_PAGE_SIZE) {
    throw new Error("A Scryfall collection request cannot contain more than 75 cards.");
  }

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

async function fetchFavoriteCardPage(
  userId: string,
  cursor: FavoriteCursor | null,
  signal: AbortSignal,
): Promise<FavoriteCardPage> {
  const favoriteRows = await fetchFavoriteRows(userId, cursor);
  if (favoriteRows.length === 0) {
    return { cards: [], nextCursor: null };
  }

  const cards = await fetchScryfallCards(
    favoriteRows.map((favorite) => favorite.scryfall_id),
    signal,
  );
  const cardsById = new Map(cards.map((card) => [card.id, card]));
  const orderedCards = favoriteRows.flatMap((favorite) => {
    const card = cardsById.get(favorite.scryfall_id);
    return card ? [card] : [];
  });
  const lastFavorite = favoriteRows[favoriteRows.length - 1];
  const nextCursor =
    favoriteRows.length === FAVORITES_PAGE_SIZE
      ? {
          createdAt: lastFavorite.created_at,
          scryfallId: lastFavorite.scryfall_id,
        }
      : null;

  return { cards: orderedCards, nextCursor };
}

export default function useFavoriteCards(): CardSource & {
  retry: () => void;
} {
  const { user } = useAuth();
  const query = useInfiniteQuery({
    queryKey: ["favorites", user?.id, "cards"],
    queryFn: ({ pageParam, signal }) => {
      if (!user) throw new Error("Sign in to load favorites.");
      return fetchFavoriteCardPage(user.id, pageParam, signal);
    },
    initialPageParam: null as FavoriteCursor | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(user),
    staleTime: 30_000,
  });

  return {
    cards: query.data?.pages.flatMap((page) => page.cards) ?? [],
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage ?? false,
    fetchNextPage: () => {
      void query.fetchNextPage();
    },
    error: query.error,
    retry: () => {
      if (query.isFetchNextPageError) {
        void query.fetchNextPage();
      } else {
        void query.refetch();
      }
    },
  };
}
