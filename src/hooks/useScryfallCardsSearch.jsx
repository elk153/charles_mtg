import { useQuery } from "@tanstack/react-query";
import createApiClient from "../services/createApiClient";

const scryfallClient = createApiClient("https://api.scryfall.com");

const useScryfallCardsSearch = (routeParam, queryParam = {}, seedParam = 0, staleTimeInSeconds = 86400) => {
  return useQuery({
    queryKey: ["scryfallCards", routeParam, queryParam, seedParam],
    queryFn: async () => {
      const data = await scryfallClient.fetchData(routeParam, queryParam);
      return data;
    },
    enabled: Boolean(routeParam),
    staleTime: 1000 * staleTimeInSeconds,
  });
};

export default useScryfallCardsSearch;
