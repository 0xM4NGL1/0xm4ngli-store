import { dbAll, dbRun } from "./db";
import type { Product, ProductRow } from "./types";
import { mapProduct } from "./products";

/**
 * Real market-price ingestion via PricesAPI (https://pricesapi.io).
 *
 * PricesAPI returns retained merchant offers with timestamps, which lets us
 * backfill real price history instead of inventing points. It requires an API
 * key; create a free account (3,000 credits, no card) and set PRICESAPI_KEY.
 *
 * Docs: https://pricesapi.io/docs
 */

const DEFAULT_BASE_URL = "https://api.pricesapi.io/api/v1";
const DEFAULT_MARKET = "de";
const DEFAULT_DAYS = 90;

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

export type MarketPriceSyncOptions = {
  market?: string;
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
  "pro",
  "max",
  "plus",
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
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

/**
 * Score a candidate by how much of the requested product name it contains.
 * Tokens containing digits (model numbers, capacities) must all be present so
 * an M2 is never matched to an M3 or a 128 GB phone to a 256 GB one.
 */
function matchScore(product: Product, candidate: SearchCandidate) {
  const title = normalize(candidate.title);
  const wanted = tokens(`${product.brand} ${product.name}`);
  if (wanted.length === 0) return 0;

  const present = wanted.filter((token) => title.includes(token));
  const ratio = present.length / wanted.length;
  const distinctive = wanted.filter((token) => /\d/.test(token));
  const missingDistinctive = distinctive.filter(
    (token) => !title.includes(token),
  );

  let score = ratio;
  if (missingDistinctive.length > 0) score -= 0.45 * missingDistinctive.length;
  if (candidate.condition_label && /used|refurb|renew/i.test(candidate.condition_label)) {
    score -= 0.5;
  }
  if (bannedWords.some((word) => title.includes(word))) score -= 0.5;
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
          (!offer.currency || offer.currency === "EUR"),
      ),
    }))
    .filter((entry) => entry.offers.length > 0 && entry.score >= 0.45)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
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

function dailyLowest(offers: HistoryOffer[]) {
  const days = new Map<string, { priceCents: number; recordedAt: string }>();

  for (const offer of offers) {
    if (
      !Number.isFinite(offer.price) ||
      offer.price <= 0 ||
      offer.currency !== "EUR" ||
      !offer.recorded_at
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
    const priceCents = Math.round(offer.price * 100);
    const current = days.get(day);
    if (!current || priceCents < current.priceCents) {
      days.set(day, { priceCents, recordedAt: offer.recorded_at });
    }
  }

  return [...days.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function syncMarketPrices(
  options: MarketPriceSyncOptions = {},
): Promise<MarketPriceSyncResult> {
  if (!pricesApiConfigured()) {
    throw new Error(
      "PricesAPI is not configured. Create a free key at https://pricesapi.io and set PRICESAPI_KEY.",
    );
  }

  const market = (options.market ?? process.env.PRICE_MARKET ?? DEFAULT_MARKET).toLowerCase();
  const days = Math.max(
    7,
    Math.min(90, options.days ?? (Number(process.env.PRICE_HISTORY_DAYS) || DEFAULT_DAYS)),
  );
  const log = options.log ?? (() => undefined);
  const throttleMs = options.throttleMs ?? 10_000;

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
    skipped: [],
    failures: [],
  };

  for (const [index, product] of limited.entries()) {
    const label = `${product.sku} ${product.name}`;
    log(`[${index + 1}/${limited.length}] ${label}`);

    try {
      const query = `${product.brand} ${product.name}`.replace(/\s+/g, " ").trim();
      const candidates = await search(query, market);
      const match = pickCandidate(product, candidates);

      if (!match) {
        result.skipped.push({
          sku: product.sku,
          name: product.name,
          reason: "No trustworthy market match with EUR offers.",
        });
        log("  skipped: no trustworthy match");
        if (index < limited.length - 1) await sleep(throttleMs);
        continue;
      }

      result.matched += 1;
      result.creditsReserved += 10 + days;
      log(
        `  matched: ${match.candidate.title} (pid ${match.candidate.pid}, ${Math.round(match.score * 100)}% name match)`,
      );

      const { offers, daysWithOffers } = await history(
        match.candidate.pid,
        market,
        days,
      );
      result.creditsReserved += daysWithOffers;

      const daily = dailyLowest(offers);
      if (daily.length === 0) {
        result.skipped.push({
          sku: product.sku,
          name: product.name,
          reason: "Matched product has no EUR history in the window.",
        });
        log("  skipped: no EUR history");
        continue;
      }

      if (!options.dryRun) {
        const existing = new Set(
          (
            await dbAll<{ day: string }>(
              `SELECT substr(recorded_at, 1, 10) AS day
               FROM price_history
               WHERE product_id = ? AND source = 'market'`,
              product.id,
            )
          ).map((row) => row.day),
        );

        for (const [day, point] of daily) {
          if (existing.has(day)) continue;
          await dbRun(
            `INSERT INTO price_history (product_id, price_cents, recorded_at, source)
             VALUES (?, ?, ?, 'market')`,
            product.id,
            point.priceCents,
            point.recordedAt,
          );
          result.observations += 1;
        }
      } else {
        result.observations += daily.length;
      }

      log(
        `  recorded ${daily.length} day(s) of real prices${options.dryRun ? " (dry run)" : ""}`,
      );
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      result.failures.push({
        sku: product.sku,
        name: product.name,
        reason,
      });
      log(`  failed: ${reason}`);
    }

    if (index < limited.length - 1) await sleep(throttleMs);
  }

  return result;
}
