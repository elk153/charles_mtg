export default async function getCardPrices(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`[API error] ${response.status} — ${response.statusText}`);
  }

  const json = await response.json();

  return json.data.map((card) => ({
    id: card.id,
    set: card.set_name,
    image: card.image_uris?.normal ?? "",
    prices: card.prices,
  }));
}
