async function searchCard() {

    const cardName = document.getElementById("request").value;

    const urlAPI = "https://api.scryfall.com";
    const urlEndPoint = "/cards/named";
    const urlQuery = `?exact=${cardName}`;
    const url = `${urlAPI}${urlEndPoint}${urlQuery}`; 
    
    try{
        const response = await fetch(url);
        const card = await response.json();

        displayCard(card);

    } catch(error) {
        document.getElementById("result").innerHTML = "Card not found 😢";
    }
}

function displayCard(card) {

    const resultDiv = document.getElementById("result");

    resultDiv.innerHTML = `
        <h2>${card.name}</h2>
        <img src="${card.image_uris.normal}" />
        <p>Price (EUR): ${card.prices.eur || "N/A"}</p>
    `;
}

document
    .getElementById("request")
        .addEventListener("keypress", function(e) {
            if (e.key === "Enter") searchCard();
        }
    )