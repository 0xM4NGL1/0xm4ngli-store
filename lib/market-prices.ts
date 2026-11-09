import { dbAll, dbRun } from "./db";
import type { Product, ProductRow } from "./types";
import { mapProduct } from "./products";

/**
 * Real market-price ingestion via PricesAPI (https://pricesapi.io).
 *
 * PricesAPI returns retained merchant offers with timestamps, so we can
 * backfill real price history instead of inventing points. It requires an API
 * key; create a free account (3,000 credits, no card) and set PRICESAPI_KEY.
 *
 * Retained history is deepest in the AU market, so the sync tries AU first and
 * falls back through US, GB and the EUR markets. Non-EUR observations are
 * converted with real ECB reference rates from Frankfurter.
 *
 * Docs: https://pricesapi.io/docs · https://frankfurter.dev
 */

const DEFAULT_BASE_URL = "https://api.pricesapi.io/api/v1";
const DEFAULT_DAYS = 90;
const FX_URL = "https://api.frankfurter.app";
const FX_CURRENCIES = ["AUD", "GBP", "USD"];

/** Deepest retained history first, then the closest EUR markets. */
const DEFAULT_MARKET_CHAIN = ["au", "us", "gb", "gr", "de"];

const MARKET_CURRENCY: Record<string, string> = {
  au: "AUD",
  us: "USD",
  gb: "GBP",
  gr: "EUR",
  de: "EUR",
  it: "EUR",
  fr: "EUR",
  es: "EUR",
  nl: "EUR",
  be: "EUR",
  at: "EUR",
};

type ApiError = { code?: string; message?: string };

type SearchOffer = {
  seller?: string;
  price?: number;
  currency?: string;
  stock_status?: string | null;
};

type SearchCandidate = {
  pid: number | string;
  title: string;
  headline_price?: number;
  headline_currency?: string;
  condition_label?: string | null;
  offerCount?: number;
  offers?: SearchOffer[];
};

type SearchResponse = {
  success?: boolean;
  data?: { products?: SearchCandidate[] };
  error?: ApiError;
};

type HistoryOffer = {
  recorded_at: string;
  price: number;
  currency: string;
  stock_status?: string | null;
  seller?: string;
  product_title?: string | null;
};

type HistoryResponse = {
  offers?: HistoryOffer[];
  page?: { next_cursor?: string | null };
  window?: {
    days_requested?: number;
    days_with_offers?: number;
  };
  error?: ApiError;
};

type RateTable = [string, Record<string, number>][];

export type MarketPriceSyncOptions = {
  market?: string;
  markets?: string[];
  days?: number;
  limit?: number;
  skus?: string[];
  dryRun?: boolean;
  throttleMs?: number;
  log?: (message: string) => void;
};

export type MarketPriceSyncResult = {
  products: number;
  matched: number;
  observations: number;
  creditsReserved: number;
  markets: Record<string, number>;
  skipped: { sku: string; name: string; reason: string }[];
  failures: { sku: string; name: string; reason: string }[];
};

export function pricesApiConfigured() {
  return Boolean(process.env.PRICESAPI_KEY ?? process.env.PRICE_API_KEY);
}

function apiKey() {
  return process.env.PRICESAPI_KEY ?? process.env.PRICE_API_KEY ?? "";
}

function apiBaseUrl() {
  return (process.env.PRICESAPI_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function marketChain(options: MarketPriceSyncOptions) {
  if (options.markets?.length) {
    return options.markets.map((entry) => entry.toLowerCase());
  }
  const configured = (options.market ?? process.env.PRICE_MARKET)?.toLowerCase();
  if (configured) {
    const rest = DEFAULT_MARKET_CHAIN.filter((entry) => entry !== configured);
    return [configured, ...rest];
  }
  return DEFAULT_MARKET_CHAIN;
}

function ymd(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function apiGet<T>(
  path: string,
  params: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(`${apiBaseUrl()}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "x-api-key": apiKey(),
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(120_000),
  });

  const body = (await response.json().catch(() => null)) as
    | (T & { error?: ApiError })
    | null;

  if (!response.ok || !body) {
    const detail = body?.error?.message ?? `HTTP ${response.status}`;
    throw new Error(`PricesAPI ${path} failed: ${detail}`);
  }
  if (body.error) {
    throw new Error(
      `PricesAPI ${path} failed: ${body.error.message ?? body.error.code ?? "unknown error"}`,
    );
  }
  return body as T;
}

const stopWords = new Set([
  "the",
  "and",
  "with",
  "for",
  "gen",
  "usb",
  "series",
  "inch",
  "in",
  "mm",
  "gb",
  "tb",
]);

const bannedWords = [
  "used",
  "refurbished",
  "renewed",
  "pre-owned",
  "preowned",
  "open box",
  "case",
  "cover",
  "skin",
  "protector",
  "charger",
  "cable",
  "adapter",
  "replacement",
  "manual",
  "book",
  "guide",
  "paperback",
  "hardcover",
  "ebook",
  "poster",
  "sticker",
];

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value: string) {
  return normalize(value)
    .split(" ")
    .filter(
      (token) =>
        !stopWords.has(token) && (token.length > 1 || /^\d$/.test(token)),
    );
}

/**
 * Score a candidate by how much of the requested product name it contains.
 * Model numbers, capacities and generation markers must all be present so an
 * M2 is never matched to an M3, or a 128 GB phone to a 256 GB one.
 */
function matchScore(product: Product, candidate: SearchCandidate) {
  const title = normalize(candidate.title);
  const wanted = tokens(product.name);
  const brand = tokens(product.brand);
  if (wanted.length === 0) return 0;

  const present = wanted.filter((token) => title.includes(token));
  const missing = wanted.filter((token) => !title.includes(token));
  const missingDistinctive = missing.filter((token) => /\d/.test(token));

  let score = present.length / wanted.length;
  score -= 0.55 * missing.length;
  score -= 0.45 * missingDistinctive.length;

  // Do not match a Plus/Pro/Max/Ultra variant to the base model.
  const variantMarkers = ["plus", "pro", "max", "mini", "ultra", "fold", "flip"];
  const wantedTitle = normalize(product.name);
  const extraMarkers = variantMarkers.filter(
    (marker) => title.includes(marker) && !wantedTitle.includes(marker),
  );
  score -= 0.3 * extraMarkers.length;

  // Brand is a hint, not a hard requirement: many listings omit it.
  if (brand.some((token) => title.includes(token))) score += 0.08;

  if (
    candidate.condition_label &&
    /used|refurb|renew|pre-owned/i.test(candidate.condition_label)
  ) {
    score -= 0.35;
  }
  if (bannedWords.some((word) => title.includes(word))) score -= 0.6;

  return score;
}

function pickCandidate(product: Product, candidates: SearchCandidate[]) {
  const scored = candidates
    .map((candidate) => ({
      candidate,
      score: matchScore(product, candidate),
      offers: (candidate.offers ?? []).filter(
        (offer) =>
          typeof offer.price === "number" &&
          offer.price > 0 &&
          !(offer.stock_status && /out of stock|unavailable/i.test(offer.stock_status)),
      ),
    }))
    .filter((entry) => entry.offers.length > 0 && entry.score >= 0.55)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const conditionA = a.candidate.condition_label ? 1 : 0;
      const conditionB = b.candidate.condition_label ? 1 : 0;
      if (conditionA !== conditionB) return conditionA - conditionB;
      const countA = a.candidate.offerCount ?? a.offers.length;
      const countB = b.candidate.offerCount ?? b.offers.length;
      if (countB !== countA) return countB - countA;
      return (a.candidate.headline_price ?? Infinity) - (b.candidate.headline_price ?? Infinity);
    });

  return scored[0] ?? null;
}

async function search(query: string, market: string) {
  const body = await apiGet<SearchResponse>("/products/search", {
    q: query,
    market,
    limit: 3,
    offers_limit: 15,
  });
  return body.data?.products ?? [];
}

async function history(pid: number | string, market: string, days: number) {
  const to = new Date();
  const from = new Date(to.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  const offers: HistoryOffer[] = [];
  let cursor: string | undefined;
  let daysWithOffers = 0;

  for (let page = 0; page < 10; page += 1) {
    const body = await apiGet<HistoryResponse>("/products/history", {
      id: String(pid),
      id_type: "pricesapi",
      market,
      from: ymd(from),
      to: ymd(to),
      limit: 1000,
      cursor,
    });
    offers.push(...(body.offers ?? []));
    if (page === 0) daysWithOffers = body.window?.days_with_offers ?? 0;
    cursor = body.page?.next_cursor ?? undefined;
    if (!cursor) break;
  }

  return { offers, daysWithOffers };
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[middle - 1] + sorted[middle]) / 2)
    : sorted[middle];
}

function titleMatches(product: Product, offer: HistoryOffer) {
  if (!offer.product_title) return true;
  const title = normalize(offer.product_title);
  const wanted = tokens(product.name);
  if (wanted.length === 0) return true;
  const present = wanted.filter((token) => title.includes(token));
  return present.length / wanted.length >= 0.55;
}

async function fetchRates(days: number): Promise<RateTable> {
  const to = new Date();
  const from = new Date(to.getTime() - (days + 7) * 24 * 60 * 60 * 1000);
  const url = new URL(`${FX_URL}/${ymd(from)}..${ymd(to)}`);
  url.searchParams.set("from", "EUR");
  url.searchParams.set("to", FX_CURRENCIES.join(","));

  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`FX rates failed: HTTP ${response.status}`);
  const body = (await response.json()) as {
    rates?: Record<string, Record<string, number>>;
  };
  return Object.entries(body.rates ?? {}).sort(([a], [b]) => a.localeCompare(b));
}

function rateFor(table: RateTable, date: string, currency: string) {
  let rate: number | null = null;
  for (const [day, rates] of table) {
    if (day <= date) rate = rates[currency] ?? rate;
    else break;
  }
  return rate ?? table[0]?.[1][currency] ?? null;
}

function toEurCents(
  price: number,
  currency: string,
  date: string,
  table: RateTable,
) {
  if (currency === "EUR") return Math.round(price * 100);
  const rate = rateFor(table, date, currency);
  if (!rate) return null;
  return Math.round((price / rate) * 100);
}

/**
 * One representative price per UTC day. Uses the median of matching, in-stock
 * offers and drops extreme outliers, so a stray accessory listing cannot
 * define the day's price. Non-EUR prices are converted with ECB rates.
 */
function dailyPrices(
  product: Product,
  offers: HistoryOffer[],
  table: RateTable,
) {
  const byDay = new Map<
    string,
    { prices: number[]; recordedAt: string; currency: string }
  >();

  for (const offer of offers) {
    if (
      !Number.isFinite(offer.price) ||
      offer.price <= 0 ||
      !offer.recorded_at ||
      !offer.currency ||
      !titleMatches(product, offer)
    ) {
      continue;
    }
    if (
      offer.stock_status &&
      /out of stock|unavailable/i.test(offer.stock_status)
    ) {
      continue;
    }

    const day = offer.recorded_at.slice(0, 10);
    const priceCents = toEurCents(offer.price, offer.currency, day, table);
    if (priceCents === null) continue;

    const current = byDay.get(day) ?? {
      prices: [],
      recordedAt: offer.recorded_at,
      currency: offer.currency,
    };
    current.prices.push(priceCents);
    if (offer.recorded_at > current.recordedAt) current.recordedAt = offer.recorded_at;
    byDay.set(day, current);
  }

  const days: [string, { priceCents: number; recordedAt: string }][] = [];

  for (const [day, entry] of byDay) {
    const rawMedian = median(entry.prices);
    const trimmed = entry.prices.filter(
      (price) => price >= rawMedian * 0.4 && price <= rawMedian * 2.5,
    );
    const priceCents = trimmed.length > 0 ? median(trimmed) : rawMedian;
    days.push([day, { priceCents, recordedAt: entry.recordedAt }]);
  }

  return days.sort(([a], [b]) => a.localeCompare(b));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function syncMarketPrices(
  options: MarketPriceSyncOptions = {},
): Promise<MarketPriceSyncResult> {
  if (!pricesApiConfigured()) {
    throw new Error(
      "PricesAPI is not configured. Create a key at https://pricesapi.io and set PRICESAPI_KEY.",
    );
  }

  const markets = marketChain(options);
  const days = Math.max(
    7,
    Math.min(
      90,
      options.days ?? (Number(process.env.PRICE_HISTORY_DAYS) || DEFAULT_DAYS),
    ),
  );
  const log = options.log ?? (() => undefined);
  const throttleMs = options.throttleMs ?? 10_000;
  const rates = await fetchRates(days).catch((error) => {
    log(`FX rates unavailable: ${error instanceof Error ? error.message : String(error)}`);
    return [] as RateTable;
  });

  const products = (
    await dbAll<ProductRow>("SELECT * FROM products ORDER BY id")
  ).map(mapProduct);

  const selected = options.skus?.length
    ? products.filter((product) => options.skus?.includes(product.sku))
    : products;
  const limited = options.limit ? selected.slice(0, options.limit) : selected;

  const result: MarketPriceSyncResult = {
    products: limited.length,
    matched: 0,
    observations: 0,
    creditsReserved: 0,
    markets: {},
    skipped: [],
    failures: [],
  };

  for (const [index, product] of limited.entries()) {
    const label = `${product.sku} ${product.name}`;
    log(`[${index + 1}/${limited.length}] ${label}`);

    let accepted = false;
    let lastError = "";

    for (const market of markets) {
      if (accepted) break;

      try {
        const candidates = await search(`${product.brand} ${product.name}`, market);
        const match = pickCandidate(product, candidates);
        if (!match) {
          log(`  ${market.toUpperCase()}: no trustworthy match`);
        } else {
          result.creditsReserved += 10;
          log(
            `  ${market.toUpperCase()}: matched ${match.candidate.title} (pid ${match.candidate.pid}, ${Math.round(match.score * 100)}%)`,
          );

          const { offers, daysWithOffers } = await history(
            match.candidate.pid,
            market,
            days,
          );
          result.creditsReserved += daysWithOffers;

          const daily = dailyPrices(product, offers, rates);
          if (daily.length < 2) {
            log(`  ${market.toUpperCase()}: history has ${daily.length} day(s), trying next market`);
          } else {
            accepted = true;
            result.matched += 1;
            result.markets[market] = (result.markets[market] ?? 0) + 1;

            if (!options.dryRun) {
              const existing = new Set(
                (
                  await dbAll<{ day: string }>(
                    `SELECT substr(recorded_at, 1, 10) AS day
                     FROM price_history
                     WHERE product_id = ? AND source LIKE 'market%'`,
                    product.id,
                  )
                ).map((row) => row.day),
              );

              const source = `market:${market}:${MARKET_CURRENCY[market] ?? "EUR"}`;
              for (const [day, point] of daily) {
                if (existing.has(day)) continue;
                await dbRun(
                  `INSERT INTO price_history (product_id, price_cents, recorded_at, source)
                   VALUES (?, ?, ?, ?)`,
                  product.id,
                  point.priceCents,
                  point.recordedAt,
                  source,
                );
                result.observations += 1;
              }
            } else {
              result.observations += daily.length;
            }

            log(
              `  ${market.toUpperCase()}: recorded ${daily.length} day(s) of real prices${options.dryRun ? " (dry run)" : ""}`,
            );
          }
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        log(`  ${market.toUpperCase()}: failed — ${lastError}`);
      }

      if (!accepted) await sleep(throttleMs);
    }

    if (!accepted) {
      result.skipped.push({
        sku: product.sku,
        name: product.name,
        reason: lastError
          ? `No usable history. Last error: ${lastError}`
          : "No market returned at least two days of trustworthy history.",
      });
      log("  skipped: no usable history");
    }

    if (index < limited.length - 1) await sleep(throttleMs);
  }

  return result;
}
