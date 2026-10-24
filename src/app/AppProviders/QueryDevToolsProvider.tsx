import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import type { QueryClient } from "@tanstack/react-query";

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((module) => ({
        default: module.ReactQueryDevtools,
      })),
    )
  : () => null;

type QueryDevToolsProviderProps = {
  queryClient: QueryClient;
  children: ReactNode;
};

export default function QueryDevToolsProvider({
  queryClient,
  children,
}: QueryDevToolsProviderProps) {
  return (
    <Suspense>
      <ReactQueryDevtools client={queryClient} initialIsOpen={false} />
      {children}
    </Suspense>
  );
}
