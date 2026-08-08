import { useQuery } from "@tanstack/react-query";

const useFetchUrl = (dataPurpose, urlParam) => {

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
      
      }
  });
};

export default useFetchUrl;
