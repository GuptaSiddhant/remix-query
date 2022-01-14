# remix-query

Keep your loader data in sync in your component without reloading the page.

## useLoaderQuery

The simple utility uses remix's `useFetcher` to keep loader data in-sync at client-side without reloading the page. ([View source](./src/useLoaderQuery.ts))

```tsx
import { useLoaderQuery } from "remix-query";
```

- Get loader data along with a `reload` function.

  ```tsx
  const { data, loading, reload } = useLoaderQuery<DataType>();
  ```

- Get loader data for another route's loader.

  ```tsx
  const { data, loading, reload } = useLoaderQuery<DataType>({ pathname "/other/route" });
  ```

- Get initial loader data and poll it after each interval.

  ```tsx
  const { data, loading } = useLoaderQuery<DataType>({ reloadInterval: 5000 });
  ```

- Get initial loader data for other's route data and poll it after each interval.

  ```tsx
  const { data, loading } = useLoaderQuery<DataType>({ pathname "/other/route", reloadInterval: 5000 });
  ```
