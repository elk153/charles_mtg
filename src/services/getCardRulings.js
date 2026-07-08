export default async function getCardRulings(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`[API error] ${response.status} — ${response.statusText}`);
  }

  const json = await response.json();

  const CardRulings = json.data.map((card) => ({
    id: card.oracle_id,
    source: card.source,
    date: card.published_at,
    ruling: card.comment,
  }));

  console.log("getCardRulings:")
  console.log(CardRulings)
  return CardRulings;
}
