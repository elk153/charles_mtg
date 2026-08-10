import { useQuery } from "@tanstack/react-query";

const useFetchUrl = (dataPurpose, urlParam, staleTime=0) => {

  return useQuery({

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

    staleTime: 1000 * staleTime, // 1 day
    
  });
};

export default useFetchUrl;
