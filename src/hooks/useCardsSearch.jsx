import { useQuery } from "@tanstack/react-query";
import createApiClient from "../services/createApiClient";

const scryfallClient = createApiClient("https://api.scryfall.com");

const useCardsSearch = (routeParams="cards/random", queryParams={ format: "json" }) => {

  return useQuery({

    queryKey:
      ["scryfallCards", routeParams, queryParams],

    queryFn:
      async () => {

        if (!routeParams) return [];
        const data = await scryfallClient.fetchData(routeParams, queryParams);
        console.log("useCardsSearch");
        console.log(data);
        return data;
      
        /* async () => {
          const res = await fetch("https://api.scryfall.com/cards/random");
          const json = await res.json();
          return json; */
        /* () => fetch("https://api.scryfall.com/cards/random").then((res) => res.json()) */
      }
  });
};

export default useCardsSearch;
