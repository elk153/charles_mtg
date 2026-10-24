import { createBrowserRouter, Navigate } from "react-router";
import App from "./App";
import CardsList from "../features/scryfall-card-renderer/CardsList/CardsList";
import CardOverlay from "../features/scryfall-card-renderer/CardOverlay/CardOverlay";

const router = createBrowserRouter([ // be aware of the capitals
  {
    path: "/",
    element: <App />, 
    children: [
      {
        index: true,
        element: <Navigate to="/random" replace />,
      },
      {
        path: "random",
        element: <CardsList />,
      },
      {
        path: "cards/:searchQuery",
        element: <CardsList />,
      },        
      {
        path: "card/:cardId",
        element: <CardOverlay />,
      },
      /*{
        path: "home",
        element: <Home />,
      },
      {
        path: "search/advanced",
        element: <AdvancedSearch />,
      },
      {
        path: "favorites",
        element: <Favorites />,
      },
      {
        path: "collection",
        element: <Collection />,
      },
      {
        path: "decks",
        element: <Decks />,
      },*/
    ],
  }
]);

export default router;