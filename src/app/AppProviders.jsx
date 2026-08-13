import PersistenceProvider from "./AppProviders/PersistenceProvider.jsx";
import QueryDevToolsProvider from "./AppProviders/QueryDevToolsProvider.jsx";
import { queryClient } from "./AppProviders/queryProvider.js";
import { RouterProvider } from "react-router/dom";
import router from "./router.jsx";

const AppProviders = () => {
  return (
    <PersistenceProvider queryClient={queryClient}>
      <QueryDevToolsProvider />
      <RouterProvider router={router} />
    </PersistenceProvider>
  );
};

export default AppProviders;