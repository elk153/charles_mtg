/*  Logic to build JS code (and then the different files): utils, logic, ui rendering, then app
    To avoid order issue, use ES  modules
*/


// Utils (small helpers that can be used in different places) //

// Functions to build the URL for the API request //

function buildURL(cardName) {
    const urlAPI = "https://api.scryfall.com";
    const urlEndPoint = "/cards/named";
    const urlQuery = `?exact=${cardName}`;
    return `${urlAPI}${urlEndPoint}${urlQuery}`; 
}

function buildQueryUrl(api, type, method, query) {
    return `${api}/${type}/${method}?${query}`;
}
// Logic (core functionality of the app) //

// Functions to search for a card using the Scryfall API //
async function searchCard() {

    const cardName = document.getElementById("request").value;

    const url = buildURL(cardName);
    
    try{
        const response = await fetch(url);
        const card = await response.json();

        displayCard(card);

    } catch(error) {
        document.getElementById("result").innerHTML = "Card not found 😢";
    }
}

async function searchCards() {

    const cardName = document.getElementById("request").value;

    const url = buildQueryUrl("https://api.scryfall.com", "cards", "search", `q=${cardName}&order=rarity`);
    console.log(url);

    try{
        const response = await fetch(url);
        const cards = await response.json();

        displayCards(cards.data);
        
    } catch(error) {
        document.getElementById("result").innerHTML = "Card not found 😢";
    }
}

//UI rendering //

// Functions to display the card(s) information on the page //

function displayCards(cards) {
    
    const resultDiv = document.getElementById("result");

    resultDiv.innerHTML = ""; // Clear previous results

    cards.forEach(displayCard);
}

function displayCard(card) {

    const resultDiv = document.getElementById("result");

    resultDiv.innerHTML += `
      <div class="card">
        <div class="card-image">
          <img src="${card.image_uris?.png || ''}" alt="${card.name}" />
        </div>
        <div class="card-details">
          <h2>${card.name}</h2>
          <h3>${card.rarity}</h3>      
          <p>
            Price (Foil):
            ${card.prices.eur ? card.prices.eur + " €" : "N/A"}
            (${card.prices.eur_foil ? card.prices.eur_foil + " €" : "N/A"})
          </p>

        </div>
      </div>
    `;
}

// Set the document title to the content of the pageTitle element //
document.title = document.getElementById("pageTitle").textContent;


// Main App / UI (user interactions) //

// Event listener to trigger search when the Enter key is pressed in the input field //
document.getElementById("request")
    .addEventListener("keypress", function(e) {
        if (e.key === "Enter") searchCards();
    }
)

// Event listener to trigger search when the Search button is clicked //
document.getElementById("searchButton")
    .addEventListener("click", searchCards);


// Log to the console for debugging purposes //
// console.log(document.getElementById("pageTitle").textContent);
