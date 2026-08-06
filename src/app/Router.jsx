import { createBrowserRouter } from "react-router";
import App from "./App";
import CardsList from "../features/original-card-renderer/CardsList/CardsList";
import CardOverlay from "../features/scryfall-card-renderer/CardOverlay/CardOverlay";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Top level States + NavigationBar + Outlet
    children: [
      {
        path: "cards",
        element: <CardsList />, // Scryfall card search result
      },        
      {
        path: "card/:cardId",
        element: <CardOverlay />, // Card details overlay page
        /**children: [
          { 
            index: true, // when no path is given. It returns the parent's url
            element: <CardDetails /> 
          },
          { 
            path: "rulings", 
            element: <CardRulings /> 
          },
          { 
            path: "prints", 
            element: <CardPrintings /> 
          },
        ],*/
      },
    ],
  }
]);

export default router;