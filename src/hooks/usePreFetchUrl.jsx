import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const usePreFetchUrl = (dataPurpose, urlParam) => {

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
        
        }
    });
  }, [queryClient, dataPurpose, urlParam]);
};

export default usePreFetchUrl;
