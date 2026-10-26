# Prompt draft file

## creating a card browser feature for AppV2

### context

- the card browser is used to render card lists and filter them
- the card browser also renders card details (card illustration, content, rulings, legalities, prints, etc.)
- the card browser is called by the different other (upcoming) features of the AppV2 (home, advanced search, collection, descks)
- the layout of the render list can depend on the feature calling it.
- the browser will minimize the number of API calls and will maximize the use of the tanstack query cache
- the browser will rely on already developped functionalities:
  - createApiClient.js and will maintain the capability to call another API than scryfall
  - useOrcacleText for rendering the card content
  - getCardRulings => rename to fectCardRulings
  - useFetchUrl and usePreFectUrl
  - normalizeCard.js and srcyfallCardLayouts.js
  - card-filter
  - navigation
- the browser will replace functionalities:
  - getCardPrices.js to make use of the query cache
- all re-used and new functionalities shall be located in the appropriate folder:
  - features/card-browser
  - hooks
  - services
  - components
- work on the card-browser branch

### plan

- on the navigation bar, add a toggle switch before the search field to toggle from search in scryfall library or personal collection
- adapt the navigation bar format to handled the newly added elements (theme toggle and search toggle)


