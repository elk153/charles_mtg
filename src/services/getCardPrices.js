export default async function getCardPrices(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`[API error] ${response.status} — ${response.statusText}`);
  }

  const json = await response.json();

  return json.data.map((card) => {
    const isDoubleFaced = card.layout === "transform" || card.layout === "modal_dfc";
    const images = isDoubleFaced
      ? [card.card_faces[0].image_uris.normal, card.card_faces[1].image_uris.normal]
      : [card.image_uris?.normal ?? ""];

    return {
      id: card.id,
      set: card.set,
      collector_number: card.collector_number,
      set_name: card.set_name,
      layout: card.layout,
      images,
      prices: card.prices,
    };
  });
}
