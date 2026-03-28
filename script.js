/*  Logic to build JS code (and then the different files): utils, logic, ui rendering, then app
    To avoid order issue, use ES  modules
*/


// Utils (small helpers that can be used in different places) //

// Function to build the URL for the API request //

function buildURL(cardName) {
    const urlAPI = "https://api.scryfall.com";
    const urlEndPoint = "/cards/named";
    const urlQuery = `?exact=${cardName}`;
    return `${urlAPI}${urlEndPoint}${urlQuery}`; 
}

// Logic (core functionality of the app) //

// Function to search for a card using the Scryfall API //
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


//UI rendering //

// Function to display the card information on the page //
function displayCard(card) {

    const resultDiv = document.getElementById("result");

    resultDiv.innerHTML = `
        <h2>${card.name}</h2>
        <img src="${card.image_uris.normal}" />
        <p>Price (EUR): ${card.prices.eur || "N/A"}</p>
    `;
}

// Set the document title to the content of the pageTitle element //
document.title = document.getElementById("pageTitle").textContent;


// Main App / UI (user interactions) //

// Event listener to trigger search when the Enter key is pressed in the input field //
document.getElementById("request")
    .addEventListener("keypress", function(e) {
        if (e.key === "Enter") searchCard();
    }
)

// Event listener to trigger search when the Search button is clicked //
document.getElementById("searchButton")
    .addEventListener("click", searchCard);


// Log to the console for debugging purposes //
console.log(document.getElementById("pageTitle").textContent);
