import { createBrowserRouter } from "react-router";
import App from "./App";
import CardsList from "../features/original-card-renderer/CardsList/CardsList";
import CardOverlay from "../features/scryfall-card-renderer/CardOverlay/CardOverlay";

const Router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Top level States + NavigationBar + Outlet
    children: [
      {
        path: "cards",
        element: <CardsList />, // Scryfall card search result
        children: [
          {
            path: ":cardId",
            element: <CardOverlay />, // Card details overlay page
          },
        ],
      }, 
    ],
  }
]);

export default Router;