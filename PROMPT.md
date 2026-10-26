# Prompt draft file

## creating a card browser feature for AppV2

### context

- the code base is at <https://github.com/elk153/charles_mtg/>, branch card-browser-claude
- the card browser is used to render card lists and filter them
- the card browser also renders card details (card illustration, content, rulings, legalities, prints, etc.)
- the card browser can be called by the different other (upcoming) features of the AppV2 (search fied, home, advanced search, collection, decks). as a first step, the search field call will be implemented. other cases will be provision for.
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
- propose the use of external libraries when it can simplify the code
- use the scryfall api to discover the adapted queries

### plan

- on the navigation bar, add a toggle switch before the search field to toggle from search in scryfall library or personal collection
- adapt the navigation bar format to handled the newly added elements (theme toggle and search toggle)
- refactor the card-filter to divide the element by categories (color, rarity, etc.), add dictionnary to make it more readable (e.g., colors) and add dictionnary selecting which category is showed based on which feature calls the filter (search field, advanced serach, etc.)
- have the card-filter bar to have the same dimensions as the NavBar. Make it responsive.
- the CardFilters shall render below/above the NavBard desktop/mobile. It shall have the same behavior as NavBar when scrolling. it shall follow the theme of AppV2.
- on the card list, 
  - the list will show the card print
  - for dual faces card, it shall provide a flip capability like for AppV1. the icon shall be a thematic translucid svg icon glowing when hovered. hovering will be the trigger to fil the card on desktop. touching the icon will be the trigger for mobile.
  - add to the right right of the card translucent icons (50% on the card) for the following functions
    - toggle faces for the cards having 2 faces reuse the IconTurnAround
    - Add/remove the card to favorites (reuse the icon from NavIcons.jsx) for further use
    - add/removed the card to the collection (reuse the icon from NavIcons.jsx) for further use
    - add/remove card to/from a deck (reuse the icon from NavIcons.jsx) for further use
    - move the NavIcons to the asset folders and make one file per icon
    - applying the same glowing same as the NavBar
- the card list shall adapt to the screen size with flex
- Card Details Rendered
  - based on AppV1 concept, create a card renderer for AppV2 is a new component.
  - the renderer must manage all card formats like AppV1
  - the renderer shall be made of the following elements
    - Card details:
      - a banner with the card illustration (not the full card)
      - the content of the card as for AppV1 using the useOracleText hook
      - the button will change the illustration and card content
      - the rulings as for AppV1
      - the legalities (legal / not legal) in a compact/horizontal fashion.
    - the card prints
      - the set name
      - the set reference
      - the price in EUR with a visible difference for the foiled edition
      - showing the card print
      - same card renderer as the Cardlist
      - all card print containers shall have the same dimension.
  - on a large screen the card details will be on the left and the columns of card prints on the right with independent scrolling
  - design will be responsive
  - the card details shall render as an overlay.
  - the closing icon (reuse IconClose) will remain visible when scrolling the details or the prints
- when a search is done with an empty field, proceed with a "mulligan".
  - prefetch (all app loading app, same moment as the symbols) the list of sets available on scyrfall <https://scryfall.com/docs/api/sets>
  - select a random set
  - from that set, select 5 random cards <https://scryfall.com/docs/api/cards> and <https://scryfall.com/docs/syntax#sets>
- dimensions of the card prints in the card list and card prints shall be identical
- font sizes will be coherent in all elements
- all icons, NavBar, and card filters will have a common theme appearance.

Before proceeding with the plan, review the needed documentation and tell me if supplementary libraries are required.
Make a thourough review and ask questions if elements are missing.

Once accepted, proceed to the changes, creat output as diff (test it), and document the changes in a .md file for me to understand the implementation.
