import {
  useFetcher,
  useLoaderData,
  useLocation,
  useMatches,
  useTransition,
} from "@remix-run/react";
import { useCallback, useEffect, useMemo, useState } from "react";

export interface QueryOptions {
  /**
   * Other route whose loader is used to fetch data.
   * @default currentPath
   */
  route?: string;
  /**
   * Enable polling of data by providing interval in milliseconds.
   * @default 0
   */
  reloadInterval?: number;
  /**
   * Reload when window is visible to the user.
   * @default true
   */
  reloadOnWindowVisible?: boolean;
  /**
   * Reload when window has focus.
   * @default false
   */
  reloadOnWindowFocus?: boolean;
  /**
   * Reload on reconnecting with internet.
   * @default true
   */
  reloadOnReconnect?: boolean;
}

/**
 * The hook to keep loader data of current route
 * in-sync at client-side without reloading the page.
 *
 * - Drop-in replacement for `useLoaderData` a
 * ```tsx
 * const { data, loading, reload } = useQuery<Data>()
 * ```
 *
 * - `useLoaderData` with polling.
 * ```tsx
 * const { data, loading, reload } = useQuery<Data>({
 *  route: "/path/to/data",
 *  reloadInterval: 5000,
 * })
 * ```
 */
export function useQuery<DataType>(options: QueryOptions = {}) {
  const { pathname } = useLocation();
  const {
    route = pathname,
    reloadInterval = 0,
    reloadOnWindowVisible = true,
    reloadOnReconnect = true,
    reloadOnWindowFocus = false,
  } = options;

  const isCurrentRoute: boolean = route === pathname;

  const { data: serverData, loading: serverLoading } = useServerData<DataType>(
    route,
    isCurrentRoute
  );
  const {
    data: clientData,
    loading: clientLoading,
    reload,
  } = useClientData<DataType>({
    route,
    reloadInterval,
    reloadOnReconnect,
    reloadOnWindowVisible,
    reloadOnWindowFocus,
  });

  const data: DataType | undefined = useMemo(
    () => clientData || serverData,
    [clientData, serverData]
  );

  const loading: boolean = useMemo(
    () => clientLoading || serverLoading,
    [clientLoading, serverLoading]
  );

  // Initial fetch for different route on client-side
  // if not already loaded on server-side.
  useEffect(() => {
    if (!serverData) reload();
  }, [reload, serverData]);

  return { data, loading, reload };
}

function useServerData<DataType = any>(
  route: string,
  isCurrentRoute: boolean
): {
  data: DataType | undefined;
  loading: boolean;
} {
  const loaderData = useLoaderData<DataType>();
  const { state } = useTransition();
  const loading: boolean = useMemo(() => state === "submitting", [state]);
  const matchData = useMatches().find((match) => match.pathname === route)
    ?.data as DataType;

  return { data: isCurrentRoute ? loaderData : matchData, loading };
}

function useClientData<DataType = any>({
  route,
  reloadInterval,
  reloadOnWindowVisible,
  reloadOnReconnect,
  reloadOnWindowFocus,
}: Required<QueryOptions>): {
  data: DataType | undefined;
  loading: boolean;
  reload: () => void;
} {
  const [isVisible, setIsVisible] = useState(true);
  const { load, state, data } = useFetcher<DataType>();

  const reload = useCallback(() => load(route), [load, route]);
  const loading: boolean = useMemo(() => state !== "idle", [state]);

  // Polling
  useEffect(() => {
    if (!reloadInterval || !isVisible) return;
    const interval = setInterval(reload, reloadInterval);
    return () => clearInterval(interval);
  }, [reloadInterval, reload, isVisible]);

  // Reload on window visibility change
  useDocumentEventListener("visibilitychange", () => {
    const visible = window.document.visibilityState === "visible";
    setIsVisible(visible);
    if (visible && reloadOnWindowVisible) reload();
  });

  // Reload on window focus
  useWindowEventListener("focus", reload, !reloadOnWindowFocus);

  // Reload on internet reconnect
  useWindowEventListener("online", reload, !reloadOnReconnect);

  return { reload, loading, data };
}

function useWindowEventListener<K extends keyof WindowEventMap>(
  event: K,
  callback: (event: WindowEventMap[K]) => void,
  disabled?: boolean
) {
  useEffect(() => {
    if (disabled) return;
    window.addEventListener(event, callback);
    return () => window.removeEventListener(event, callback);
  }, [event, callback, disabled]);
}

function useDocumentEventListener<K extends keyof DocumentEventMap>(
  type: K,
  callback: (event: DocumentEventMap[K]) => void,
  disabled?: boolean
) {
  useEffect(() => {
    if (disabled) return;
    window.document.addEventListener(type, callback);
    return () => window.document.removeEventListener(type, callback);
  }, [type, callback, disabled]);
}
