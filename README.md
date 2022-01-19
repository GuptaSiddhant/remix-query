# remix-query

Keep your loader data in sync in your component without reloading the page.

## useQuery

The hook to keep loader data of any (current or other) route in-sync at client-side without reloading the page. ([View source](./src/useQuery.ts))

- Reload when window is visible (default: true)
- Reload when internet re-connects (default: true)
- Reload when window receives focus (default: false)

```tsx
import { useQuery } from "remix-query";
```

- Default

  ```tsx
  const { data, loading, reload } = useQuery<DataType>();
  ```

- Polling

  ```tsx
  const { data, loading } = useQuery<DataType>({ reloadInterval: 5000 });
  ```

- Other route

  ```tsx
  const { data, loading, reload } = useQuery<DataType>({
    route: "/other/path",
  });
  ```

- Other options

  ```tsx
  const { data, loading, reload } = useQuery<DataType>({
    reloadOnWindowVisible: true
    reloadOnWindowFocus: true
    reloadOnReconnect: true
  });
  ```
