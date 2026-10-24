import PersistenceProvider from "./AppProviders/PersistenceProvider.tsx";
import QueryDevToolsProvider from "./AppProviders/QueryDevToolsProvider.tsx";
import { queryClient } from "./AppProviders/queryProvider.ts";
import { RouterProvider } from "react-router/dom";
import router from "./router.tsx";

export default function AppProviders() {
  return (
    <PersistenceProvider queryClient={queryClient}>
      <QueryDevToolsProvider>
        <RouterProvider router={router} />
      </QueryDevToolsProvider>
    </PersistenceProvider>
  );
}
