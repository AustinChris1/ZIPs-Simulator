import type { Zip } from "../types";
import { parseReadme } from "./parse-readme";
import { SUMMARIES } from "./zip-overlay";
import { FALLBACK_ZIPS } from "./fallback";

// Canonical rendered index. Generated from each ZIP's frontmatter on
// every commit to zcash/zips, so it's always in sync with what's been
// merged. The upstream README.template no longer carries the table.
//
// In dev we hit the Vite proxy at /__zips-source so we get live HTML
// without the browser's CORS check killing the request. In prod we
// attempt the canonical URL directly; if CORS blocks it we serve the
// bundled fallback snapshot.
const SOURCE_URL = import.meta.env.DEV
  ? "/__zips-source"
  : "https://zips.z.cash/";

export type LoadSource = "live" | "fallback";

export interface LoadResult {
  zips: Zip[];
  lastSyncedAt: string;
  source: LoadSource;
}

export async function loadZips(): Promise<LoadResult> {
  try {
    const res = await fetch(SOURCE_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const parsed = parseReadme(html);

    if (parsed.length < 80) {
      throw new Error(
        `parsed only ${parsed.length} ZIPs from upstream — refusing to overwrite`
      );
    }

    return {
      zips: enrich(parsed),
      lastSyncedAt: new Date().toISOString(),
      source: "live",
    };
  } catch (err) {
    console.warn("[zips] live fetch failed, serving fallback snapshot:", err);
    return {
      zips: enrich(FALLBACK_ZIPS),
      lastSyncedAt: new Date().toISOString(),
      source: "fallback",
    };
  }
}

function enrich(zips: Zip[]): Zip[] {
  return zips.map((z) => ({
    ...z,
    summary: SUMMARIES[z.num] ?? z.summary ?? null,
  }));
}
