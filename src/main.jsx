import { StrictMode, lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import router from "./app/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const root = document.getElementById("root");
const queryClient = new QueryClient();
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() => import("@tanstack/react-query-devtools")
      .then(module => ({ default: module.ReactQueryDevtools })
    ))
  : () => null;

ReactDOM.createRoot(root).render(
  <StrictMode>
    <QueryClientProvider  client={queryClient}>
      <RouterProvider router={router} />
      <Suspense>
        <ReactQueryDevtools initialIsOpen={false} />
      </Suspense>
    </QueryClientProvider>
  </StrictMode>
);
