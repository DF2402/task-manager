import { useEffect, useState } from "react";

export function useGet<T extends { error?: string }>(attrs: {
  url: string;
  name: string;
  deps?: any[];
}) {
  let { url, name, deps = [] } = attrs;
  const [data, setData] = useState<T | "loading">("loading");

  if (!url.startsWith("https://") && !url.startsWith("http://")) {
    url = `http://localhost:3001${url}`;
  }

  function reload() {
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
      })
      .catch((err) => {
        console.error(`Failed to fetch ${name}:`, err);
        setData({ error: String(err) } as T);
      });
  }

  function render(renderFn: (data: T) => React.ReactNode) {
    if (data === "loading") {
      return <div>Loading {name} ...</div>;
    }
    if (data.error) {
      return (
        <div>
          Failed to load {name}: {data.error}
        </div>
      );
    }
    // 額外的 null/undefined 檢查
    if (!data) {
      return <div>No data available for {name}</div>;
    }
    return renderFn(data);
  }

  useEffect(reload, [url, name, ...deps]);

  return { data, reload, render };
}
