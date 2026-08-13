import { lazy, Suspense } from "react";

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() => import("@tanstack/react-query-devtools")
      .then(module => ({ default: module.ReactQueryDevtools })
    ))
  : () => null;

const QueryDevToolsProvider = ({ children }) => {
  return (
    <Suspense>
      <ReactQueryDevtools initialIsOpen={false} />
      {children}
    </Suspense>
  );
};

export default QueryDevToolsProvider;