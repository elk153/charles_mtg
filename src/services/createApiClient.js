export default function createApiClient(baseUrl) {
  const basePath = baseUrl.replace(/\/$/, "");

  function buildQueryUrl(path, params = {}) {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value != null)
    );

    const query = new URLSearchParams(filteredParams).toString();
    const normalizedPath = path.replace(/^\//, "");

    return `${basePath}/${normalizedPath}${query ? `?${query}` : ""}`;
  }

  async function fetchData(path, params = {}) {
    const url = buildQueryUrl(path, params);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`[API error] ${response.status} — ${response.statusText}`);
    }

    const json = await response.json();

    if (json.object === "error") {
      throw new Error(`[API error] ${json.code} — ${json.details || json.message}`);
    }

    switch (json.object) {
      case "card":
        return [json];
      case "list":
      case "catalog":
        return json.data;
      default:
        throw new Error(`[API Error] Unexpected response object: ${json.object}`);
    }
  }

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