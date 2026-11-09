/**
 * Price-feed sync CLI.
 *
 * Usage:
 *   bun run scripts/sync-prices.ts ./feed.json
 *   bun run scripts/sync-prices.ts https://example.com/authorised-feed.json
 *
 * The feed must follow the format documented in README.md. Only use feeds you
 * are authorised to access. This script does not scrape retailer websites.
 */
import { readFile } from "node:fs/promises";
import { syncPriceFeed } from "../lib/feed";

const source = process.argv[2] ?? process.env.PRICE_FEED_URL;

if (!source) {
  console.error(
    "Usage: bun run scripts/sync-prices.ts <feed.json|https://...> (or set PRICE_FEED_URL)",
  );
  process.exit(1);
}

const raw = source.startsWith("http://") || source.startsWith("https://")
  ? await (async () => {
      const response = await fetch(source, {
        headers: process.env.PRICE_FEED_TOKEN
          ? { Authorization: `Bearer ${process.env.PRICE_FEED_TOKEN}` }
          : {},
      });
      if (!response.ok) {
        throw new Error(`Feed returned HTTP ${response.status}`);
      }
      return response.text();
    })()
  : await readFile(source, "utf8");

const result = syncPriceFeed(JSON.parse(raw));
console.log("Price feed synced", result);
