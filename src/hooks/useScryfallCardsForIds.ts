import { useQuery } from "@tanstack/react-query";
import fetchScryfallCardsForIds from "../services/fetchScryfallCardsForIds.ts";

export default function useScryfallCardsForIds(
  source: string,
  ids: string[],
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["scryfallCollection", source, ids],
    queryFn: ({ signal }) => fetchScryfallCardsForIds(ids, signal),
    enabled: enabled && ids.length > 0,
    staleTime: 24 * 60 * 60 * 1000,
  });
}
