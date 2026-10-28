import { createBrowserRouter, Navigate, redirect } from "react-router";
import { NuqsAdapter } from "nuqs/adapters/react-router/v8";
import AppV1 from "./App.jsx";
import AppV2 from "./App.tsx";
import CardsList from "../features/scryfall-card-renderer/CardsList/CardsList";
import CardOverlay from "../features/scryfall-card-renderer/CardOverlay/CardOverlay";
import CardBrowserPage from "../features/card-browser/CardBrowserPage.tsx";
import LoginPage from "../features/auth/LoginPage.tsx";
import AuthCallbackPage from "../features/auth/AuthCallbackPage.tsx";
import RequireAuth from "../features/auth/RequireAuth.tsx";
import { Home, AdvancedSearch, Favorites, Binder, Decks } from "./App.tsx";

const router = createBrowserRouter([ // be aware of the capitals
  {
    path: "/",
    loader: () => redirect("/v2/home"),   // default route
  },
  {
    path: "/v1",
    element: (
      <NuqsAdapter>
        <AppV1 />
      </NuqsAdapter>
    ),
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
    element: (
      <NuqsAdapter>
        <AppV2 />
      </NuqsAdapter>
    ),
    children: [
      {
        index: true,
        loader: () => redirect("/v2/home"),
      },
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "auth/callback",
        element: <AuthCallbackPage />,
      },
      {
        path: "search/advanced",
        element: <AdvancedSearch />,
      },
      {
        path: "search",
        element: <CardBrowserPage />,
      },
      {
        path: "search/random",
        element: <CardBrowserPage />,
      },
      {
        path: "collection",
        element: <Navigate to="/v2/binder" replace />,
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: "favorites",
            element: <Favorites />,
          },
          {
            path: "binder",
            element: <Binder />,
          },
          {
            path: "decks",
            element: <Decks />,
          },
        ],
      },
    ],
  }
]);

export default router;