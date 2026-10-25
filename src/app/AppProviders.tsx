import PersistenceProvider from "./AppProviders/PersistenceProvider.tsx";
import QueryDevToolsProvider from "./AppProviders/QueryDevToolsProvider.tsx";
import { queryClient } from "./AppProviders/queryProvider.ts";
import { ThemeProvider } from "./AppProviders/ThemeProvider.tsx";
import { RouterProvider } from "react-router/dom";
import router from "./router.tsx";

export default function AppProviders() {
  return (
    <ThemeProvider>
      <PersistenceProvider queryClient={queryClient}>
        <QueryDevToolsProvider queryClient={queryClient}>
          <RouterProvider router={router} />
        </QueryDevToolsProvider>
      </PersistenceProvider>
    </ThemeProvider>
  );
}
