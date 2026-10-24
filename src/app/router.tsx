import { createBrowserRouter, Navigate } from "react-router";
import AppV1 from "./App.jsx";
import AppV2 from "./App.tsx";
import CardsList from "../features/scryfall-card-renderer/CardsList/CardsList";
import CardOverlay from "../features/scryfall-card-renderer/CardOverlay/CardOverlay";

const router = createBrowserRouter([ // be aware of the capitals
  {
    path: "/v1",
    element: <AppV1 />,
    children: [
      {
        index: true,
        element: <Navigate to="/v1/random" replace />,
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
    ],
  },
  {
    path: "/v2",
    element: <AppV2 />,
    children: [
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