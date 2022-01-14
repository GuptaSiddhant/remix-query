import { useCallback, useEffect, useMemo } from "react";
import {
  useFetcher,
  useLocation,
  useLoaderData,
  useMatches,
  useTransition,
} from "@remix-run/react";

/**
 * The hook to keep loader data of another route
 * in-sync at client-side without reloading the page.
 *
 * ```tsx
 * // No polling
 * const { data, loading, reload } = useLoaderQuery<DataType>("/other/route");
 * // With polling
 * const { data, loading, reload } = useLoaderQuery<DataType>("/other/route", 5000);
 * ```
 */
export function useLoaderQuery<DataType = any>(
  /** Other route whose loader is used to fetch data. */
  route?: string | undefined,
  /** Enable polling of data by providing interval in milliseconds. @default 0 */
  reloadInterval?: number
): LoaderQueryReturn<DataType>;

/**
 * The hook to keep loader data of current route
 * in-sync at client-side without reloading the page.
 *
 * ```tsx
 * // No polling
 * const { data, loading, reload } = useLoaderQuery<DataType>();
 * // With polling
 * const { data, loading, reload } = useLoaderQuery<DataType>(5000);
 * ```
 */
export function useLoaderQuery<DataType = any>(
  /** Enable polling of data by providing interval in milliseconds. @default 0 */
  reloadInterval?: number
): Required<LoaderQueryReturn<DataType>>;

export function useLoaderQuery<DataType = any>(
  arg1?: string | number,
  arg2?: number
): LoaderQueryReturn<DataType> {
  const options = useOptions(arg1, arg2);
  const server = useServerData<DataType>(options);
  const client = useClientData<DataType>(options, !!server.data);

  const data: DataType | undefined = useMemo(
    () => client.data || server.data,
    [client.data, server.data]
  );

  const loading: boolean = useMemo(
    () => client.loading || server.loading,
    [client.loading, server.loading]
  );

  return { data, loading, reload: client.reload };
}

function useOptions(arg1?: string | number, arg2?: number) {
  const { pathname } = useLocation();
  const route: string = typeof arg1 === "string" ? arg1 : pathname;
  const reloadInterval: number | undefined =
    typeof arg1 === "number" ? arg1 : arg2;
  const currentRoute: boolean = route === pathname;

  return { route, reloadInterval, currentRoute };
}

function useServerData<DataType = any>({
  route,
  currentRoute,
}: ReturnType<typeof useOptions>): {
  data: DataType | undefined;
  loading: boolean;
} {
  const loaderData = useLoaderData<DataType>();
  const { state } = useTransition();
  const loading: boolean = useMemo(() => state === "submitting", [state]);
  const matchData = useMatches().find((match) => match.pathname === route)
    ?.data as DataType;

  return { data: currentRoute ? loaderData : matchData, loading };
}

function useClientData<DataType = any>(
  { reloadInterval, route }: ReturnType<typeof useOptions>,
  serverData: boolean
): {
  data: DataType | undefined;
  loading: boolean;
  reload: () => void;
} {
  const { load, state, data } = useFetcher<DataType>();
  const reload = useCallback(() => load(route), [load, route]);
  const loading: boolean = useMemo(() => state !== "idle", [state]);

  // Setup fetch polling
  useEffect(() => {
    if (!reloadInterval) return;
    const interval = setInterval(reload, reloadInterval);
    return () => clearInterval(interval);
  }, [reloadInterval, reload]);

  // Initial fetch for different route on client-side
  // if not already loaded on server-side
  useEffect(() => {
    if (!serverData) reload();
  }, [reload, serverData]);

  return { reload, loading, data };
}

interface LoaderQueryReturn<DataType> {
  data?: DataType;
  loading: boolean;
  reload: () => void;
}
