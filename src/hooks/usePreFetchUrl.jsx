import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const usePreFetchUrl = (dataPurpose, urlParam, staleTimeInSeconds=86400) => {

  const queryClient = useQueryClient();

  useEffect( () => {

    queryClient.prefetchQuery({
      queryKey:
        ["fetchedUrl", dataPurpose, urlParam],

      queryFn:
        async () => {
          console.log(urlParam ? urlParam : "No url param");
          if (!urlParam) return [];
          const res = await fetch(urlParam);
          const json = await res.json();

          console.log(json.data);
          return json.data;
        },

      staleTime: 1000 * staleTimeInSeconds,

    });
  }, [queryClient, dataPurpose, urlParam, staleTimeInSeconds]);
};

export default usePreFetchUrl;
