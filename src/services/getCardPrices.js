export default async function getCardPrices(url) {

  // Send the HTTP request and log the return code
  const response = await fetch(url);
  console.log(`[HTTP Request] ${url} | [Return Code] ${response.status}`);

  // Extract the JSON part of the response and log the type of object
  const json = await response.json();

  const cardPrices = [];

  json.data.map( (card, index) => {
      cardPrices.push({
          id:card.id, 
          set: card.set_name, 
          image: card.image_uris.normal,
          prices: card.prices
      });
  });
  console.log(cardPrices);
  return cardPrices;

};