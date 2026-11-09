import fs from "node:fs";
import path from "node:path";
import { AsyncLocalStorage } from "node:async_hooks";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import {
  createClient,
  type Client,
  type InValue,
  type Transaction,
} from "@libsql/client";
import { seedProducts } from "./catalog";

type Row = Record<string, unknown>;
type QueryResult = {
  rows: Row[];
  changes: number;
  lastInsertRowid: number;
};

type Statement = {
  sql: string;
  args: SQLInputValue[];
};

type Executor = {
  execute(sql: string, args: SQLInputValue[]): Promise<QueryResult>;
  batch(statements: Statement[]): Promise<void>;
};

type Backend =
  | { kind: "local"; db: DatabaseSync; executor: Executor }
  | {
      kind: "libsql";
      client: Client;
      executor: Executor;
    };

const globalForDb = globalThis as unknown as {
  __m4DbPromise?: Promise<Backend>;
  __m4LocalLock?: Promise<unknown>;
  __m4Tx?: AsyncLocalStorage<Executor>;
};

const txStorage =
  globalForDb.__m4Tx ?? (globalForDb.__m4Tx = new AsyncLocalStorage<Executor>());

function nowIso() {
  return new Date().toISOString();
}

function localExecutor(db: DatabaseSync): Executor {
  return {
    async execute(sql, args) {
      const statement = db.prepare(sql);
      const isRead = /^\s*(select|pragma|with)\b/i.test(sql);
      if (isRead) {
        const rows = statement.all(...args) as Row[];
        return { rows, changes: 0, lastInsertRowid: 0 };
      }
      const result = statement.run(...args);
      return {
        rows: [],
        changes: Number(result.changes),
        lastInsertRowid: Number(result.lastInsertRowid),
      };
    },
    async batch(statements) {
      db.exec("BEGIN IMMEDIATE");
      try {
        for (const statement of statements) {
          db.prepare(statement.sql).run(...statement.args);
        }
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
  };
}

function libsqlExecutor(client: Client | Transaction): Executor {
  return {
    async execute(sql, args) {
      const result = await client.execute({
        sql,
        args: args as InValue[],
      });
      return {
        rows: result.rows as unknown as Row[],
        changes: result.rowsAffected,
        lastInsertRowid: Number(result.lastInsertRowid ?? 0),
      };
    },
    async batch(statements) {
      await client.batch(
        statements.map((statement) => ({
          sql: statement.sql,
          args: statement.args as InValue[],
        })),
      );
    },
  };
}

async function initBackend(): Promise<Backend> {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();

  if (process.env.VERCEL && !tursoUrl) {
    throw new Error(
      "Vercel needs a persistent database. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in the project environment. A local SQLite file is not persistent on Vercel functions.",
    );
  }

  if (tursoUrl) {
    const client = createClient({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    const executor = libsqlExecutor(client);
    await client.executeMultiple(SCHEMA_SQL);
    await addPaymentColumns(executor);
    await addCatalogueColumns(executor);
    await seedDatabase(executor);
    await pruneDatabase(executor);
    return { kind: "libsql", client, executor };
  }

  const dataDir = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(process.cwd(), "data");

  fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, "store.sqlite"));
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec("PRAGMA busy_timeout = 5000");
  db.exec("PRAGMA synchronous = NORMAL");
  db.exec(SCHEMA_SQL);

  const executor = localExecutor(db);
  await addPaymentColumns(executor);
  await addCatalogueColumns(executor);
  await seedDatabase(executor);
  await pruneDatabase(executor);

  return { kind: "local", db, executor };
}

async function getBackend() {
  if (!globalForDb.__m4DbPromise) {
    globalForDb.__m4DbPromise = initBackend();
  }
  return globalForDb.__m4DbPromise;
}

async function activeExecutor(): Promise<Executor> {
  const transaction = txStorage.getStore();
  if (transaction) return transaction;
  const backend = await getBackend();
  return backend.executor;
}

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    specs_json TEXT NOT NULL DEFAULT '{}',
    sizes_json TEXT NOT NULL DEFAULT '[]',
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    compare_at_cents INTEGER,
    currency TEXT NOT NULL DEFAULT 'EUR',
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    reserved INTEGER NOT NULL DEFAULT 0 CHECK (reserved >= 0),
    image TEXT NOT NULL DEFAULT '',
    featured INTEGER NOT NULL DEFAULT 0,
    is_demo INTEGER NOT NULL DEFAULT 0,
    source TEXT NOT NULL DEFAULT 'demo',
    source_url TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    recorded_at TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'recorded'
  );
  CREATE INDEX IF NOT EXISTS price_history_product_time
    ON price_history(product_id, recorded_at DESC);

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    marketing_consent INTEGER NOT NULL DEFAULT 0,
    marketing_consent_at TEXT,
    terms_accepted_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);

  CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    used_at TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size TEXT NOT NULL DEFAULT '',
    quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 10),
    added_at TEXT NOT NULL,
    PRIMARY KEY (user_id, product_id)
  );

  CREATE TABLE IF NOT EXISTS wishlist_items (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    added_at TEXT NOT NULL,
    PRIMARY KEY (user_id, product_id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    public_token TEXT NOT NULL UNIQUE,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    email TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    subtotal_cents INTEGER NOT NULL,
    shipping_cents INTEGER NOT NULL,
    support_cents INTEGER NOT NULL DEFAULT 0,
    total_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    items_json TEXT NOT NULL,
    shipping_json TEXT,
    payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
    payment_reference TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    paid_at TEXT
  );
  CREATE INDEX IF NOT EXISTS orders_user_time ON orders(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS orders_status_time ON orders(status, created_at DESC);

  CREATE TABLE IF NOT EXISTS webhook_events (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending',
    token_hash TEXT NOT NULL,
    consent_version TEXT NOT NULL,
    created_at TEXT NOT NULL,
    confirmed_at TEXT,
    unsubscribed_at TEXT
  );
`;

async function addPaymentColumns(executor: Executor) {
  const additions = [
    ["support_cents", "INTEGER NOT NULL DEFAULT 0"],
    ["payment_method", "TEXT NOT NULL DEFAULT 'bank_transfer'"],
    ["payment_reference", "TEXT"],
  ] as const;

  for (const [column, definition] of additions) {
    try {
      await executor.execute(
        `ALTER TABLE orders ADD COLUMN ${column} ${definition}`,
        [],
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/duplicate column|already exists/i.test(message)) throw error;
    }
  }
}

async function addCatalogueColumns(executor: Executor) {
  const additions = [
    ["products", "sizes_json", "TEXT NOT NULL DEFAULT '[]'"],
    ["cart_items", "size", "TEXT NOT NULL DEFAULT ''"],
  ] as const;

  for (const [table, column, definition] of additions) {
    try {
      await executor.execute(
        `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`,
        [],
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/duplicate column|already exists/i.test(message)) throw error;
    }
  }
}

async function seedDatabase(executor: Executor) {
  const result = await executor.execute(
    "SELECT COUNT(*) AS count FROM products",
    [],
  );
  const row = result.rows[0] as { count: number | bigint } | undefined;
  if (Number(row?.count ?? 0) > 0) return;

  const statements: Statement[] = [];
  const createdAt = nowIso();
  const markDemo =
    process.env.CATALOG_IS_DEMO === "true" ||
    (process.env.CATALOG_IS_DEMO !== "false" &&
      process.env.NODE_ENV !== "production");
  const seedHistory =
    process.env.SEED_PRICE_HISTORY === "true" ||
    (process.env.SEED_PRICE_HISTORY !== "false" &&
      process.env.NODE_ENV !== "production");

  seedProducts.forEach((product, index) => {
    const productId = index + 1;
    statements.push({
      sql: `INSERT OR IGNORE INTO products (
        id, sku, slug, name, brand, category, description, specs_json,
        sizes_json, price_cents, compare_at_cents, currency, stock, reserved,
        image, featured, is_demo, source, source_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, NULL, ?, ?)`,
      args: [
        productId,
        product.sku,
        product.slug,
        product.name,
        product.brand,
        product.category,
        product.description,
        JSON.stringify(product.specs),
        JSON.stringify(product.sizes ?? []),
        product.priceCents,
        product.compareAtCents ?? null,
        "EUR",
        product.stock,
        product.image,
        product.featured ? 1 : 0,
        markDemo ? 1 : 0,
        markDemo ? "demo" : "starter",
        createdAt,
        createdAt,
      ],
    });

    if (seedHistory) {
      for (const point of buildDemoHistory(product.sku, product.priceCents)) {
        statements.push({
          sql: `INSERT INTO price_history
            (product_id, price_cents, recorded_at, source)
            VALUES (?, ?, ?, 'demo')`,
          args: [productId, point.priceCents, point.recordedAt],
        });
      }
    }
  });

  await executor.batch(statements);
}

async function pruneDatabase(executor: Executor) {
  const now = nowIso();
  await executor.execute("DELETE FROM sessions WHERE expires_at < ?", [now]);
  await executor.execute(
    "DELETE FROM password_resets WHERE expires_at < ? OR used_at IS NOT NULL",
    [now],
  );
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The demo dataset includes 180 days of clearly-labelled illustrative history
 * so the price engine can be evaluated immediately. Live deployments should
 * purge demo products via an authorised feed before taking real orders.
 */
function buildDemoHistory(sku: string, currentPriceCents: number) {
  const seed = hashString(sku);
  const random = mulberry32(seed);
  const variant = seed % 4;
  const base = [1.075, 1.048, 1.015, 0.945][variant];
  const points: { priceCents: number; recordedAt: string }[] = [];
  const day = 24 * 60 * 60 * 1000;

  for (let index = 60; index >= 1; index -= 1) {
    const ageDays = index * 3;
    const seasonal = Math.sin((index + (seed % 12)) / 6) * 0.025;
    const noise = (random() - 0.5) * 0.035;
    const recentJump = variant < 2 && ageDays >= 30 ? 0.03 : 0;
    const deliberateDip = variant === 1 && index === 14 ? -0.075 : 0;
    const factor = base + seasonal + noise + recentJump + deliberateDip;
    const priceCents =
      Math.round((currentPriceCents * factor) / 100) * 100 - 100;
    points.push({
      priceCents: Math.max(100, priceCents),
      recordedAt: new Date(Date.now() - ageDays * day).toISOString(),
    });
  }

  points.push({
    priceCents: currentPriceCents,
    recordedAt: new Date().toISOString(),
  });

  return points;
}

function withLocalLock<T>(fn: () => Promise<T>): Promise<T> {
  const previous = globalForDb.__m4LocalLock ?? Promise.resolve();
  let release: () => void = () => undefined;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  globalForDb.__m4LocalLock = previous.then(() => current);
  return previous.then(async () => {
    try {
      return await fn();
    } finally {
      release();
    }
  });
}

export async function dbAll<T>(
  sql: string,
  ...params: SQLInputValue[]
): Promise<T[]> {
  const executor = await activeExecutor();
  const result = await executor.execute(sql, params);
  return result.rows as T[];
}

export async function dbGet<T>(
  sql: string,
  ...params: SQLInputValue[]
): Promise<T | undefined> {
  const executor = await activeExecutor();
  const result = await executor.execute(sql, params);
  return result.rows[0] as T | undefined;
}

export async function dbRun(sql: string, ...params: SQLInputValue[]) {
  const executor = await activeExecutor();
  const result = await executor.execute(sql, params);
  return {
    changes: result.changes,
    lastInsertRowid: result.lastInsertRowid,
  };
}

export async function dbBatch(statements: Statement[]) {
  const executor = await activeExecutor();
  await executor.batch(statements);
}

export async function transaction<T>(fn: () => Promise<T>): Promise<T> {
  if (txStorage.getStore()) return fn();
  const backend = await getBackend();

  if (backend.kind === "local") {
    return withLocalLock(async () => {
      backend.db.exec("BEGIN IMMEDIATE");
      try {
        const result = await fn();
        backend.db.exec("COMMIT");
        return result;
      } catch (error) {
        backend.db.exec("ROLLBACK");
        throw error;
      }
    });
  }

  const transaction = await backend.client.transaction("write");
  const executor = libsqlExecutor(transaction);
  try {
    const result = await txStorage.run(executor, fn);
    await transaction.commit();
    return result;
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {
      // Ignore rollback failures; the original error is more useful.
    }
    throw error;
  } finally {
    transaction.close();
  }
}

export { nowIso };
export type { Statement };
