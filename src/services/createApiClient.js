export default function createApiClient(baseUrl) {

  function buildQueryUrl(path, params = {}) {

    // Clean-up the params of null and undefined values. 1) Destructure, 2) Filter, 3) Restructure
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null)
    );

    // Convert cleaned-up params into standard search param (after?)
    const query = new URLSearchParams(filteredParams).toString();

    // Concatenate the baseUrl, the path, and the parameters
    return `${baseUrl}/${path}${query ? `?${query}` : ""}`;

  }

  async function fetchData (path, params = {}) {

    // Call the build query function
    const url = buildQueryUrl(path, params);
    
    // Send the HTTP request and log the return code
    const response = await fetch(url);
    console.log(`[HTTP Request] ${url} | [Return Code] ${response.status}`);

    // Throw an error if the response code is negative
    //if (!response.ok) {
    //  throw new Error(`[API error] ${response.status} — ${response.statusText}`);
    //}

    // Extract the JSON part of the response and log the type of object
    const json = await response.json();
    console.log(`[API returned object] ${json}`);
    
    // Depending on the JSON object value, return the correct object
    switch (json.object) {
      case "card": return [json];
      case "list": return json.data;
      case "catalog": return json.data;
      case "error": console.log(`[API error] ${json.code} — ${json.details} — ${json.warnings}`);
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