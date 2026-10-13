import { QueryClient /*QueryClientProvider*/ } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Controls how long inactive queries remain in memory before garbage collection
      gcTime: 86400 * 1000, // 24h — must be >= persisted data's max age.
    },
  },
});

export { queryClient };
