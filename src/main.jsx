import { StrictMode, lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import router from "./app/router";
// QueryClientProvider is the main provider for React Query, and PersistQueryClientProvider is a wrapper that adds persistence to the query client. This allows queries to be cached and restored across page reloads or sessions.
import { QueryClient, /*QueryClientProvider*/ } from "@tanstack/react-query";
import { /*PersistQueryClient,*/ PersistQueryClientProvider } from "@tanstack/react-query-persist-client"; 
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";


const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() => import("@tanstack/react-query-devtools")
      .then(module => ({ default: module.ReactQueryDevtools })
    ))
  : () => null;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 86400 * 1000, // 24h — must be >= persisted data's max age
      cacheTime: 86400 * 1000, // 24h — must be >= persisted data's max age
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <StrictMode>
    <PersistQueryClientProvider 
      client={queryClient} 
      persistOptions={{
        persister,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            (
              query.queryKey[0] === "fetchedUrl" // && 
              //query.queryKey[1] === "cardSymbols" &&
              //query.queryKey[2] === "https://api.scryfall.com/symbology"
            ) || (
              query.queryKey[0] === "scryfallCards" && 
              query.queryKey[1] === "cards/search"
          )
        },
      }}
      onSuccess={() => {
        console.log("✅ Cache restored from localStorage");
      }}
      >
      <RouterProvider router={router} />
      <Suspense>
        <ReactQueryDevtools initialIsOpen={false} />
      </Suspense>
    </PersistQueryClientProvider>
  </StrictMode>
);

// in browser console code to check the persisted cache in localStorage
// JSON.parse(localStorage.getItem("REACT_QUERY_OFFLINE_CACHE"))