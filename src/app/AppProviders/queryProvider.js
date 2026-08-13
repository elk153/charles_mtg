import { QueryClient, /*QueryClientProvider*/ } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 86400 * 1000, // 24h — must be >= persisted data's max age
      cacheTime: 86400 * 1000, // 24h — must be >= persisted data's max age
    },
  },
});

export { queryClient };