import { useCallback, useEffect, useMemo } from "react";
import { useFetcher, useLoaderData, useLocation } from "@remix-run/react";

/**
 * - Get loader data along with a `reload` function.
 *   ```tsx
 *   const { data, loading, reload } = useLoaderQuery<DataType>();
 *   ```
 *
 * - Get loader data for another route's loader.
 *   ```tsx
 *   const { data, loading, reload } = useLoaderQuery<DataType>({ pathname "/other/route" });
 *   ```
 *
 * - Get initial loader data and poll it after each interval.
 *   ```tsx
 *   const { data, loading } = useLoaderQuery<DataType>({ reloadInterval: 5000 });
 *   ```
 *
 * - Get initial loader data for other's route data and poll it after each interval.
 *   ```tsx
 *   const { data, loading } = useLoaderQuery<DataType>({ pathname "/other/route", reloadInterval: 5000 });
 *   ```
 */
export function useLoaderQuery<DataType = any>(
  options: LoaderQueryOptions = {}
): LoaderQueryReturn<DataType> {
  const { pathname: currentPathname } = useLocation();
  const loaderData = useLoaderData<DataType>();
  const { load, state, data } = useFetcher<DataType>();
  const { reloadInterval, pathname = currentPathname } = options;

  const reload = useCallback(() => load(pathname), [load, pathname]);
  const loading: boolean = useMemo(() => state !== "idle", [state]);
  const queryData: DataType = useMemo(
    () => data || loaderData,
    [loaderData, data]
  );

  // Setup fetch polling
  useEffect(() => {
    if (!reloadInterval) return;
    const interval = setInterval(reload, reloadInterval);
    return () => clearInterval(interval);
  }, [reloadInterval, reload]);

  // Fetching data from different pathname than current loader.
  useEffect(() => {
    if (currentPathname !== pathname) reload();
  }, [currentPathname, pathname, reload]);

  return { data: queryData, loading, reload };
}

export interface LoaderQueryOptions {
  reloadInterval?: number;
  pathname?: string;
}

export interface LoaderQueryReturn<DataType> {
  data: DataType;
  loading: boolean;
  reload: () => void;
}
