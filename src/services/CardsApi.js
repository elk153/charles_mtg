// Function to build the URL for the API request //
function buildQueryUrl(api, type, method, query) {
  return `${api}/${type}/${method}?${query}`;
}

// Function to search for card(s) using the Scryfall API //
const fetchCards = async (api, type, method, queryValue, order) => {

  const url = buildQueryUrl(
    api, 
    type, 
    method, 
    `q=${queryValue}&order=${order}`
  );
  
  console.log(url);
  const response = await fetch(url);
  if(!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }  
  const cards = await response.json();

  return cards.data;
}


// Pre-configured base — callers don't repeat api/type/method every time
const BASE_URL = 'https://api.scryfall.com';

function buildQueryUrl(type, method, params = {}) {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v != null)
  );
  const query = new URLSearchParams(filteredParams).toString();
  return `${BASE_URL}/${type}/${method}${query ? `?${query}` : ''}`;
}

const fetchCards = async (type, method, queryValue, order) => {
  if (!queryValue) throw new Error('queryValue is required');

  const url = buildQueryUrl(type, method, { q: queryValue, order });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} — ${response.statusText}`);
  }

  const json = await response.json();

  if (!json.data) {
    throw new Error('Unexpected response shape: missing data field');
  }

  return json.data;
};

function createApiClient(baseUrl) {
  function buildQueryUrl(type, method, params = {}) {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null)
    );
    const query = new URLSearchParams(filteredParams).toString();
    return `${baseUrl}/${type}/${method}${query ? `?${query}` : ''}`;
  }

  const fetchCards = async (type, method, queryValue, order) => {
    if (!queryValue) throw new Error('queryValue is required');

    const url = buildQueryUrl(type, method, { q: queryValue, order });
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} — ${response.statusText}`);
    }

    const json = await response.json();
    if (!json.data) throw new Error('Unexpected response shape: missing data field');

    return json.data;
  };

  return { fetchCards };
}

// Usage — create once, reuse everywhere
const scryfallClient = createApiClient('https://api.scryfall.com');
const otherClient   = createApiClient('https://api.otherservice.com');

scryfallClient.fetchCards('cards', 'search', 'black lotus', 'name');
otherClient.fetchCards('cards', 'search', 'black lotus', 'name');



function createApiClient(baseUrl) {
  function buildQueryUrl(type, method, params = {}) {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null)
    );
    const query = new URLSearchParams(filteredParams).toString();
    return `${baseUrl}/${type}/${method}${query ? `?${query}` : ''}`;
  }

  const fetchCards = async (type, method, params = {}) => {
    if (!params.q) throw new Error('queryValue is required');

    const url = buildQueryUrl(type, method, params);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} — ${response.statusText}`);
    }

    const json = await response.json();
    if (!json.data) throw new Error('Unexpected response shape: missing data field');

    return json.data;
  };

  return { fetchCards };
}

const fetchCards = async (type, method, params = {}) => {
  if (Object.keys(params).length === 0) {
    throw new Error('At least one query parameter is required');
  }
  // ...
};

function createApiClient(baseUrl) {
  function buildQueryUrl(path, params = {}) {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null)
    );
    const query = new URLSearchParams(filteredParams).toString();
    return `${baseUrl}/${path}${query ? `?${query}` : ''}`;
  }

  const fetchData = async (path, params = {}) => {
    if (Object.keys(params).length === 0) {
      throw new Error('At least one query parameter is required');
    }

    const url = buildQueryUrl(path, params);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} — ${response.statusText}`);
    }

    const json = await response.json();
    if (!json.data) throw new Error('Unexpected response shape: missing data field');

    return json.data;
  };

  return { fetchData };
}

const scryfallClient = createApiClient('https://api.scryfall.com');
const otherClient    = createApiClient('https://api.example.com');

// Scryfall style
scryfallClient.fetchData('cards/search', { q: 'black lotus', order: 'name' });
scryfallClient.fetchData('cards/named',  { exact: 'Black Lotus' });

// Completely different API structure — same client
otherClient.fetchData('v1/users/orders', { status: 'pending', page: 2 });
otherClient.fetchData('search',          { q: 'lotus' });