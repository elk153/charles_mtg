# Card Search Sequence Diagrams

## Scenario 1: Initial App Load → Random Card

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant App as App.jsx
    participant NavBar as FloatingNavBar
    participant Hook as useScryfallCardsSearch
    participant QC as QueryClient
    participant API as Scryfall API
    participant CardsList

    User->>Browser: Load app (/)
    Browser->>App: Render App
    App->>App: Extract route params
    App->>App: Redirect to /random
    App->>Hook: useScryfallCardsSearch('cards/random')
    Hook->>QC: Check queryKey cache
    alt Cache Miss
        QC->>API: GET /cards/random?format=json
        API-->>QC: Return card data
        QC->>QC: Store (staleTime: 24h)
    else Cache Hit
        QC-->>QC: Return cached card
    end
    Hook-->>App: { data: card[], isLoading }
    App->>NavBar: Pass isLoading, onRandomRequest
    App->>CardsList: Render CardsList
    CardsList->>CardsList: Map cards to components
    CardsList-->>User: Display random card(s)
```

## Scenario 2: User Searches by Card Name

```mermaid
sequenceDiagram
    participant User
    participant NavBar as FloatingNavBar
    participant Browser
    participant App as App.jsx
    participant Hook as useScryfallCardsSearch
    participant QC as QueryClient
    participant API as Scryfall API
    participant CardsList

    User->>NavBar: Type search text
    User->>NavBar: Submit form
    NavBar->>NavBar: Validate query
    NavBar->>Browser: navigate to /cards/{query}
    Browser->>App: Route change detected
    App->>App: Extract searchQuery from URL
    App->>Hook: useScryfallCardsSearch('cards/search', {q})
    Hook->>QC: Check queryKey cache
    alt Cache Miss
        QC->>API: GET /cards/search?q={query}
        API-->>QC: Return results array
        QC->>QC: Store (staleTime: 24h)
    else Cache Hit
        QC-->>QC: Return cached results
    end
    Hook-->>App: { data: cards[], isLoading }
    App->>CardsList: Render with cards
    CardsList->>CardsList: Map cards to components
    CardsList-->>User: Display results
```

## Scenario 3: Clicking a Card in the List to Open Overlay

```mermaid
sequenceDiagram
    participant User
    participant CardsList
    participant Card as Card
    participant App as App.jsx
    participant Browser
    participant Hook as useScryfallCardsSearch
    participant QC as QueryClient
    participant API as Scryfall API
    participant CardOverlay

    User->>Card: Click card in list
    Card->>CardsList: onSelect(cardId)
    CardsList->>App: onCardSelect(id)
    App->>App: setSelectedCardId(id)
    App->>Browser: navigate to /card/{id}
    Browser->>App: Route updated
    App->>App: Extract cardId from URL
    alt Not in current results
        App->>Hook: useScryfallCardsSearch('cards/{id}')
        Hook->>QC: Check queryKey cache
        alt Cache Miss
            QC->>API: GET /cards/{id}
            API-->>QC: Return card
            QC->>QC: Store (staleTime: 24h)
        else Cache Hit
            QC-->>QC: Return cached
        end
        Hook-->>App: { data: card[], isLoading }
    end
    App->>CardOverlay: Render with card
    CardOverlay-->>User: Display overlay
```

## Scenario 4: Deep Link to Card (/card/:cardId)

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant App as App.jsx
    participant Hook as useScryfallCardsSearch
    participant QC as QueryClient
    participant API as Scryfall API
    participant CardOverlay

    User->>Browser: Navigate to /card/{id}
    Browser->>App: Route loaded
    App->>App: Extract cardId from URL
    App->>Hook: useScryfallCardsSearch('cards/{id}')
    Hook->>QC: Check queryKey cache
    alt Cache Miss
        QC->>API: GET /cards/{id}
        API-->>QC: Return card data
        QC->>QC: Store (staleTime: 24h)
    else Cache Hit
        QC-->>QC: Return cached card
    end
    Hook-->>App: { data: card[], isLoading }
    App->>App: effectiveCards = cardFromRoute
    App->>CardOverlay: Render with card
    CardOverlay-->>User: Display overlay
```

## Scenario 5: Card Overlay - Loading Rulings & Prints

```mermaid
sequenceDiagram
    participant User
    participant CardOverlay
    participant Hook as useFetchUrl
    participant QC as QueryClient
    participant API as Scryfall API
    participant OracleText

    CardOverlay->>CardOverlay: Card loaded
    CardOverlay->>Hook: useFetchUrl('cardRulings', uri)
    Hook->>QC: Check queryKey cache
    alt Cache Miss
        QC->>API: GET rulings_uri
        API-->>QC: Return rulings array
        QC->>QC: Store (staleTime: 24h)
    else Cache Hit
        QC-->>QC: Return cached
    end
    Hook-->>CardOverlay: { data: rulings }

    CardOverlay->>Hook: useFetchUrl('cardPrints', uri)
    Hook->>QC: Check queryKey cache
    alt Cache Miss
        QC->>API: GET prints_search_uri
        API-->>QC: Return prints array
        QC->>QC: Store (staleTime: 24h)
    else Cache Hit
        QC-->>QC: Return cached
    end
    Hook-->>CardOverlay: { data: prints }

    CardOverlay->>CardOverlay: Validate print images
    CardOverlay->>CardOverlay: Render rulings list
    CardOverlay->>OracleText: Format ruling text
    CardOverlay->>CardOverlay: Render prints gallery
    CardOverlay-->>User: Display rulings & prints
```

## Scenario 6: Empty Search → Redirect to Random

```mermaid
sequenceDiagram
    participant User
    participant NavBar as FloatingNavBar
    participant Browser
    participant App as App.jsx
    participant Hook as useScryfallCardsSearch
    participant QC as QueryClient

    User->>NavBar: Submit empty search
    NavBar->>NavBar: query = ""
    NavBar->>App: onRandomRequest()
    App->>App: setRandomSeed(Date.now())
    App->>Hook: useScryfallCardsSearch('cards/random')
    Note over Hook: New seed = new queryKey
    Hook->>QC: queryKey with new seed
    QC->>QC: Cache miss (seed changed)
    Hook-->>App: Fetch new card
    NavBar->>Browser: navigate('/random')
    Browser->>App: Route updated
    App-->>User: Display new random card
```
