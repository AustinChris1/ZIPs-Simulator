#!/usr/bin/env -S npx tsx
/**
 * sync-zips.ts — OPTIONAL CLI snapshotter.
 *
 * The page itself fetches live data at request time via lib/load-zips.ts
 * with hourly ISR, so this script is NOT required for the tracker to
 * stay current. It exists only as a manual debugging aid: run it to
 * snapshot the parsed README into public/data/zips.json.
 *
 * Run:    npx tsx src/app/zips/sync-zips.ts
 * Output: public/data/zips.json
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as https from "node:https";
import { parseReadme } from "./lib/parse-readme";

const SOURCE_URL =
  "https://raw.githubusercontent.com/zcash/zips/main/README.template";

const OUT_PATH = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "public",
  "data",
  "zips.json"
);

function fetchText(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "zechub-zip-tracker" } }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve(body));
      })
      .on("error", reject);
  });
}

async function main(): Promise<void> {
  console.log(`[zip-sync] Fetching ${SOURCE_URL} ...`);
  const rst = await fetchText(SOURCE_URL);
  console.log(`[zip-sync] Got ${rst.length} bytes.`);

  const zips = parseReadme(rst);
  console.log(`[zip-sync] Parsed ${zips.length} ZIPs.`);

  if (zips.length < 80) {
    throw new Error(
      `Suspicious: only ${zips.length} ZIPs parsed. Aborting before overwriting zips.json.`
    );
  }

  const counts: Record<string, number> = {};
  for (const z of zips) counts[z.status] = (counts[z.status] || 0) + 1;
  console.log("[zip-sync] Status counts:", counts);

  const out = {
    zips,
    generatedAt: new Date().toISOString(),
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log(`[zip-sync] Wrote ${OUT_PATH}`);
}

main().catch((err: Error) => {
  console.error("[zip-sync] Failed:", err.message);
  process.exit(1);
});
