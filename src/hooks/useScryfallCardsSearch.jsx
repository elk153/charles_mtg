import { useQuery } from "@tanstack/react-query";
import createApiClient from "../services/createApiClient";

const scryfallClient = createApiClient("https://api.scryfall.com");

const useScryfallCardsSearch = (routeParam="cards/random", queryParam={ format: "json" }, seedParam=0) => {

  return useQuery({

    queryKey:
      ["scryfallCards", routeParam, queryParam, seedParam],

    queryFn:
      async () => {

        if (!routeParam) return [];
        const data = await scryfallClient.fetchData(routeParam, queryParam);
        return data;
      
        /* async () => {
          const res = await fetch("https://api.scryfall.com/cards/random");
          const json = await res.json();
          return json; */
        /* () => fetch("https://api.scryfall.com/cards/random").then((res) => res.json()) */
      }
  });
};

export default useScryfallCardsSearch;
