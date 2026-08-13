import { PersistQueryClientProvider /*, PersistQueryClient*/ } from "@tanstack/react-query-persist-client"; 
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

const dehydrateOptions = 
  {
    shouldDehydrateQuery: (query) =>
      (
        query.queryKey[0] === "fetchedUrl" // && 
        //query.queryKey[1] === "cardSymbols" &&
        //query.queryKey[2] === "https://api.scryfall.com/symbology"
      ) || (
        query.queryKey[0] === "scryfallCards" && 
        query.queryKey[1] === "cards/search"
    )
  }

const PersistenceProvider = ({queryClient, children}) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        dehydrateOptions,
      }}
      onSuccess={() => {
        console.log("✅ Cache restored from localStorage");
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
};

export default PersistenceProvider;

// in browser console code to check the persisted cache in localStorage
// JSON.parse(localStorage.getItem("REACT_QUERY_OFFLINE_CACHE"))