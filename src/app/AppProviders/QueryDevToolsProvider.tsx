import { lazy, Suspense } from "react";
import type { ReactNode } from "react";

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((module) => ({
        default: module.ReactQueryDevtools,
      })),
    )
  : () => null;

type QueryDevToolsProviderProps = {
  children: ReactNode;
};

export default function QueryDevToolsProvider({
  children,
}: QueryDevToolsProviderProps) {
  return (
    <Suspense>
      <ReactQueryDevtools initialIsOpen={false} />
      {children}
    </Suspense>
  );
}
