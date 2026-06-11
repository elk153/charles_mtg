export default function createApiClient(baseUrl) {

  function buildQueryUrl(path, params = {}) {

    // Clean-up the params of null and undefined values. 1) Destructure, 2) Filter, 3) Restructure
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null)
    );

    // Convert filtered params into standard search param (after?)
    const query = new URLSearchParams(filteredParams).toString();

    // Concatenate the baseUrl, the path, and the parameters
    return `${baseUrl}/${path}${query ? `?${query}` : ""}`;

  }

  const fetchData = async (path, params = {}) => {

    if (Object.keys(params).length === 0) {
      throw new Error("At least one query parameter is required");
    }

    const url = buildQueryUrl(path, params);
    const response = await fetch(url);
    console.log(`[HTTP Request] ${url} | [Return Code] ${response.status}`);

    if (!response.ok) {
      throw new Error(`[API Error] ${response.status} — ${response.statusText}`);
    }

    const json = await response.json();
    console.log(`[API Response] ${json.object}`);
    
      switch (json.object) {
        case "card": return json;
        case "list": return json.data;
        case "error": throw new Error(`[API Error] ${json.code} — ${json.details} — ${json.warnings}`);
        default: throw new Error(`[API Error] Unexpected answer`);
      }
    
    return json;
  };

  return { fetchData };
  
}

//const scryfallClient = createApiClient('https://api.scryfall.com');
//const otherClient    = createApiClient('https://api.example.com');

// Scryfall style
//scryfallClient.fetchData('cards/search', { q: 'black lotus', order: 'name' });
//scryfallClient.fetchData('cards/named',  { exact: 'Black Lotus' });

// Completely different API structure — same client
//otherClient.fetchData('v1/users/orders', { status: 'pending', page: 2 });
//otherClient.fetchData('search',          { q: 'lotus' });