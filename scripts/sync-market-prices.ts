/**
 * Backfill real market price history from PricesAPI.
 *
 * Usage:
 *   bun run sync:market                 # all products, 90 days, AU → US → GB → EUR markets
 *   bun run sync:market --dry-run       # match and report without writing
 *   bun run sync:market --limit=5       # first five products
 *   bun run sync:market --sku=M4-AUD-001,M4-PHO-001
 *   bun run sync:market --days=30 --market=de
 *
 * Requires PRICESAPI_KEY in .env.local (free key at https://pricesapi.io).
 * The script writes to whichever database TURSO_DATABASE_URL points at.
 */
import {
  pricesApiConfigured,
  syncMarketPrices,
  type MarketPriceSyncOptions,
} from "../lib/market-prices";

function value(name: string) {
  const prefix = `--${name}=`;
  const match = process.argv.slice(2).find((argument) => argument.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
}

function numberValue(name: string) {
  const raw = value(name);
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

if (!pricesApiConfigured()) {
  console.error(
    "PricesAPI is not configured. Create a free key at https://pricesapi.io and set PRICESAPI_KEY in .env.local.",
  );
  process.exit(1);
}

const options: MarketPriceSyncOptions = {
  days: numberValue("days"),
  limit: numberValue("limit"),
  market: value("market"),
  throttleMs: numberValue("throttle"),
  dryRun: process.argv.includes("--dry-run"),
  skus: value("sku")
    ?.split(",")
    .map((sku) => sku.trim())
    .filter(Boolean),
  log: (message) => console.log(message),
};

console.log(
  `Syncing real market prices (${options.days ?? process.env.PRICE_HISTORY_DAYS ?? 90} days)` +
    `${options.dryRun ? " — dry run" : ""}…`,
);

const result = await syncMarketPrices(options);
console.log("\nDone.");
console.log(JSON.stringify(result, null, 2));

if (result.failures.length > 0) process.exitCode = 1;
