# remix-query

Keep your loader data in sync in your component without reloading the page.

## useLoaderQuery

The hook to keep loader data of any (current or other) route in-sync at client-side without reloading the page. ([View source](./src/useLoaderQuery.ts))

```tsx
import { useLoaderQuery } from "remix-query";
```

- Current route

  ```tsx
  // No polling
  const { data, loading, reload } = useLoaderQuery<DataType>();
  // With polling
  const { data, loading } = useLoaderQuery<DataType>(5000);
  ```

- Other route

  ```tsx
  // No polling
  const { data, loading, reload } = useLoaderQuery<DataType>("/other/route");
  // With polling
  const { data, loading } = useLoaderQuery<DataType>("/other/route", 5000);
  ```
