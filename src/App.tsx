import { useEffect, useState } from "react";
import ZipTracker from "./ZipTracker";
import { loadZips, type LoadResult } from "./lib/load-zips";

export default function App() {
  const [data, setData] = useState<LoadResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadZips().then((res) => {
      if (!cancelled) setData(res);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#111b27] text-zinc-500 dark:text-zinc-400 text-[13px]">
        Loading ZIPs…
      </div>
    );
  }

  return (
    <ZipTracker
      zips={data.zips}
      lastSyncedAt={data.lastSyncedAt}
      source={data.source}
    />
  );
}
