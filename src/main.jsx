import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import router from "./app/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const root = document.getElementById("root");
const queryClient = new QueryClient();

ReactDOM.createRoot(root).render(
  <StrictMode>
    <QueryClientProvider  client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
