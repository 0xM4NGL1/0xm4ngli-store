# 0xm4ngli — an actual working technology store

A production-oriented e-commerce storefront built with **Next.js 16 App Router**, TypeScript, Tailwind CSS 4, SQLite/Turso and a **bank-transfer checkout**. It includes real accounts, carts, wishlists, orders, price history, a buy-signal engine, GDPR export/erasure, an authorised product-feed importer, support contributions and an admin order-matching API.

The visual identity is the original neon dark 0xm4ngli theme, rebuilt for technology: laptops, phones, audio, wearables, gaming, cameras, smart home and accessories.

---

## What is real, and what you must operate

This code is not a mock checkout. A customer can place a real order, reserve stock and receive real bank details. You confirm the payment after the money arrives.

- **Payment is by bank transfer only.** The store asks for no card details. It shows your IBAN/BIC, the exact amount and a unique reference. You mark the order paid after matching the transfer. This is legal, simple, and does not require a payment processor.
- **It is not instant.** SEPA/SWIFT transfers take time. The customer's stock is reserved for 7 days. If you need instant card or wallet payments, that requires a licensed payment provider; the code no longer uses one because you asked not to.
- **The official IBAN is intentionally published in this repository.** It lives in `config/donation.ts` and `DONATIONS.md` so anyone can verify where official contributions go. This is sensitive: publishing a bank account makes invoice fraud and impersonation easier. Never add card numbers, passwords or one-time banking codes. Forks must keep the official donation notice under the licence; a licence is a legal rule, not a technical lock.
- **Production uses Turso, not a local file.** Vercel functions have an ephemeral filesystem. Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`; without them the app refuses to start rather than silently losing orders.
- **The starter catalogue is your responsibility.** The database seeds a starter product catalogue because an empty store is not useful. In production these products are treated as live and synthetic price history is **not** created. Verify the stock and prices, or import your authorised feed. Product names belong to their owners; this project is not affiliated with them.
- **The legal pages are a starting point, not legal advice.** Complete the seller identity, tax details and jurisdiction, and have the documents reviewed.

---

## Features

### Storefront
- Responsive neon-dark UI, keyboard navigation, visible focus, reduced-motion support and a skip link.
- Home page with price drops, categories, new arrivals and the buy-signal explanation.
- Search (`/shop?q=`), category, brand, price and stock filters, sorting, pagination.
- Product pages with specs, stock, related products, accessible price-history chart/table and JSON-LD.
- Guest cart with a signed HttpOnly cookie; signed-in cart stored in the database.
- Wishlist for signed-in users.
- Cart with quantity controls, free-shipping progress, delivery form and optional support contribution.

### Checkout and orders
- Real bank-transfer checkout with SEPA/SWIFT instructions.
- Unique payment reference, exact amount and copy buttons on the private order page.
- Delivery address and contact email collected only for fulfilment.
- Stock reservation while awaiting transfer (7 days), automatic release on expiry/cancel.
- Order history in the account area.
- Admin APIs to list pending orders, mark a transfer paid, or cancel an order.
- Order emails through Resend when configured.

### Accounts and privacy
- Registration, login, logout, password reset, password change and “sign out everywhere”.
- scrypt password hashing with per-user salts.
- Opaque session tokens stored as SHA-256 hashes; 30-day HttpOnly/SameSite cookies.
- Profile editing, optional marketing consent, email change with password confirmation.
- JSON data export and account deletion.
- Double opt-in newsletter with confirm/unsubscribe flow.
- Essential-cookies-only notice; no analytics or advertising trackers.
- Security headers, origin checks, rate limiting, Zod validation, parameterised SQL and body-size limits.

### Price intelligence
- Timestamped price observations.
- 90-day low/high/average, 30-day change, 0–100 score and Buy/Good/Fair/Wait/Collecting verdict.
- Honest “Collecting” state until there are at least three observations.
- Demo history is disabled in production by default; live history comes from your feed.
- “Dropped this month” ranks by real recorded movement, not sponsorship.

### Support
- `/support` page with preset/custom voluntary contribution.
- A unique bank reference is created for each support payment.
- Support can also be added to a product order at checkout.
- Admin marks it paid exactly like a product order.

---

## Quick start (local)

Requirements: **Bun 1.4+** or **Node.js 22.5+** (`node:sqlite`), and a persistent disk path for local data.

```bash
bun install
cp .env.example .env.local
# edit .env.local:
#   CART_SECRET=...
#   ADMIN_TOKEN=...
#   BANK_* only if you want to override config/donation.ts
bun dev
```

Open <http://localhost:3000>. On first request the database is created at `data/store.sqlite`, seeded with the starter catalogue and (in development only) illustrative price history.

Production build locally:

```bash
bun run build
bun run start
```

Reset local data:

```bash
rm -rf data
```

---

## Vercel + Turso (production database)

Vercel serverless functions do not keep a local SQLite file. Use **Turso**, a hosted SQLite-compatible database. The app uses `node:sqlite` locally and `@libsql/client` when `TURSO_DATABASE_URL` is set.

1. Install the Turso CLI and sign in:
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   turso auth login
   ```
2. Create a database and print the Vercel values:
   ```bash
   ./scripts/setup-turso.sh 0xm4ngli-store
   ```
   Or manually:
   ```bash
   turso db create 0xm4ngli-store
   turso db show 0xm4ngli-store --url
   turso db tokens create 0xm4ngli-store
   ```
3. In **Vercel → Project → Settings → Environment Variables**, add:
   - `TURSO_DATABASE_URL` (the `libsql://...` URL)
   - `TURSO_AUTH_TOKEN`
   - `APP_URL` (your HTTPS domain)
   - `CART_SECRET` (32+ random chars)
   - `ADMIN_TOKEN` (long random token)
   - `CRON_SECRET` (Vercel Cron authorisation)
   - optionally `BANK_*` to override `config/donation.ts`
   - `CONTACT_EMAIL`, `PRIVACY_EMAIL`
   - `LEGAL_NAME`, `LEGAL_ADDRESS`, `LEGAL_JURISDICTION`, `COMPANY_NUMBER`, `VAT_ID`
   - optional: `RESEND_API_KEY`, `EMAIL_FROM`, `PRICE_FEED_TOKEN`, `IMAGE_HOSTS`
4. Redeploy. The schema migrates and seeds on the first request.
5. Run the app on a Node runtime (the default). Do not switch these routes to Edge.

If `VERCEL=1` and `TURSO_DATABASE_URL` is missing, the app throws a clear error instead of writing to an ephemeral disk. That is deliberate.

---

## Bank transfer setup

The official receiving account is published in **`config/donation.ts`** and
**`DONATIONS.md`**. The app falls back to it when `BANK_*` environment variables
are not set. You can override any field with:

```env
BANK_ACCOUNT_NAME=Exact Legal Account Holder
BANK_IBAN=GR8101712010006201168118306
BANK_BIC=YourBankBIC
BANK_NAME=Your Bank
BANK_COUNTRY=GR
```

- The IBAN is displayed on `/support` and on the private order page after checkout.
- The exact amount and reference are shown on the order page and sent by email if Resend is configured.
- The customer has 7 days to send the funds. Pending bank-transfer orders older than 7 days are cancelled and stock is released.
- Never ask for card numbers, banking passwords or one-time codes. The store never does.
- The IBAN is intentionally public under this project’s source-available licence. Treat it as sensitive anyway: fraudsters can copy a public page and change the account. Customers should verify against the official repository. Forks must keep the official donation notice.

### Matching a transfer (admin)

List pending orders:

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://your-domain/api/admin/orders?status=pending"
```

Mark one paid after checking your bank statement:

```bash
curl -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bankReference":"YOUR-BANK-STATEMENT-REFERENCE"}' \
  "https://your-domain/api/admin/orders/ord_xxx/mark-paid"
```

Cancel an order and release stock:

```bash
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://your-domain/api/admin/orders/ord_xxx/cancel"
```

Marking paid decrements stock, clears the user's cart if signed in, and sends the confirmation email when email is configured.

---

## Authorised product feed

The importer upserts by SKU and records a price observation when the price changes or at most every 12 hours.

```json
{
  "currency": "EUR",
  "observedAt": "2026-11-09T12:00:00.000Z",
  "purgeDemo": false,
  "products": [
    {
      "sku": "SUPPLIER-SKU-1",
      "slug": "supplier-product-slug",
      "name": "Product name",
      "brand": "Brand",
      "category": "laptops",
      "description": "At least twenty characters of accurate description.",
      "specs": { "Memory": "16 GB", "Warranty": "2 years" },
      "price": 999.9,
      "compareAt": 1099.9,
      "stock": 25,
      "image": "https://your-licensed-image-host.example/product.jpg",
      "featured": false,
      "sourceUrl": "https://supplier.example/product"
    }
  ]
}
```

Allowed categories: `laptops`, `phones`, `audio`, `wearables`, `gaming`, `cameras`, `smart-home`, `accessories`.

```bash
# local file
bun run scripts/sync-prices.ts ./feed.json

# authorised URL
PRICE_FEED_URL=https://supplier.example/authorised-feed.json \
PRICE_FEED_TOKEN=... bun run sync:prices
```

Protected HTTP endpoint:

```bash
curl -X POST https://your-domain/api/admin/price-sync \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @feed.json
```

Use `"purgeDemo": true` once to remove seeded demo products after your live feed is in place.

**Do not scrape** a retailer’s website or API. Use a supplier feed, an affiliate API that permits it, or your own inventory.

---

## Price engine

`lib/products.ts` computes the signal from recorded observations:

```text
position  = (current - low90) / (high90 - low90)
dropBoost = clamp(-change30 * 100, 0, 20)
score     = clamp((1 - position) * 75 + dropBoost + (current <= low90 ? 5 : 0), 0, 100)

>= 80 or at 90-day low -> BUY
>= 60                  -> GOOD
>= 40                  -> FAIR
otherwise              -> WAIT
< 3 observations       -> COLLECTING
```

Production does not invent price history. If the database has no observations, products show “Collecting” until your feed syncs. Development seeds illustrative history so the chart and score can be evaluated locally.

---

## Environment reference

See [`.env.example`](./.env.example). Nothing in `.env.local` or `.env.production` is committed.

| Variable | Purpose |
| --- | --- |
| `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` | Required on Vercel for persistent data. |
| `DATA_DIR` | Local SQLite directory. |
| `CART_SECRET` | HMAC key for guest cart cookie. |
| `BANK_*` | Optional overrides for the official account in `config/donation.ts`. |
| `ADMIN_TOKEN` | Bearer token for admin order/feed APIs. |
| `CRON_SECRET` | Authorises the daily stock-release cron. |
| `ALLOW_DEMO_CATALOG_ORDERS` | Leave false. Enables real transfers for demo-marked products only if you really mean it. |
| `CATALOG_IS_DEMO` | Marks seeded products as demo and disables their checkout. |
| `SEED_PRICE_HISTORY` | Enables illustrative history for non-production evaluation. |
| `FLAT_SHIPPING_CENTS` / `FREE_SHIPPING_THRESHOLD_CENTS` | Shipping display and order totals. |
| `RESEND_API_KEY` / `EMAIL_FROM` | Optional transactional email. |
| `IMAGE_HOSTS` | Extra `next/image` hosts for feed images. |
| `APP_URL` | Public URL used in emails, sitemap and links. |
| `LEGAL_*`, `VAT_ID` | Seller identity on legal pages. |

---

## Database and deployment notes

Schema is in `lib/db.ts`:
- `products`, `price_history`
- `users`, `sessions`, `password_resets`
- `cart_items`, `wishlist_items`
- `orders`, `webhook_events` (legacy table, harmless)
- `newsletter_subscribers`

Local SQLite uses `node:sqlite`; Turso uses `@libsql/client`. The data-access layer is async and supports both. Do not use Vercel’s ephemeral filesystem for production data.

Back up Turso regularly. See Turso’s backup/restore documentation.

A daily Vercel Cron (`vercel.json`) calls `/api/cron/release-orders` to release bank-transfer reservations older than 7 days. Set `CRON_SECRET`; without it the endpoint is disabled. Vercel sends the secret as `Authorization: Bearer $CRON_SECRET` when configured in project settings.

---

## Security

- scrypt password hashing, per-user salt, constant-time comparison.
- 256-bit session tokens stored only as hashes; expiry and rotation on password change.
- HttpOnly, SameSite=Lax, Secure cookies in production.
- `Origin`/`Host` checks on state-changing APIs.
- Prepared SQL statements only.
- Zod validation and body-size limits.
- Admin routes require a bearer token compared in constant time.
- CSP, HSTS, frame denial, nosniff, referrer and permissions policies.
- In-memory rate limiting for single instances; use Redis/edge limiting if you scale horizontally.

CSP allows inline scripts because Next.js emits inline bootstrap scripts. For a stricter nonce-based policy, follow the Next.js CSP guide and make the relevant routes dynamic.

---

## GDPR

Implemented:
- Minimal account data.
- No analytics/advertising cookies.
- Essential-only cookies (`m4_session`, signed `m4_cart`).
- Hashed, time-limited reset/newsletter tokens.
- Self-service JSON export.
- Self-service erasure, with legal retention disclosure.
- Explicit, optional marketing consent with double opt-in.
- Order data detached from the account on deletion and retained only for tax/accounting.
- Privacy, cookie, terms, shipping/returns and accessibility pages.

Still required:
- Complete the seller identity and jurisdiction.
- Confirm retention periods with an accountant.
- Sign DPAs with hosting, email and database providers.
- Review the legal pages with a qualified adviser.
- If you add analytics later, gate it behind consent.

---

## Project structure

```text
app/
  page.tsx                    home
  shop/                       search + filters
  product/[slug]/             product, chart and JSON-LD
  cart/                       cart, delivery form, support add-on
  checkout/success/           private bank-transfer instructions
  support/                    voluntary support payments
  account/                    profile, orders, security/data
  wishlist/                   saved products
  login|register|...          auth and password reset
  legal/                      privacy, terms, cookies, shipping, accessibility
  api/                        auth, cart, wishlist, checkout, support, admin, export
components/                   UI, forms, charts, cards
lib/                          DAL, DB, auth, cart, orders, payments, feed, email
scripts/sync-prices.ts        authorised feed CLI
data/store.sqlite             local database (gitignored)
```

---

## Useful commands

```bash
bun dev
bun run build
bun run start
bun run lint
bun run typecheck
bun run sync:prices ./example-feed.json
```

---

## Source-available licence and donations

This repository is **source-available**, not OSI open source. The custom licence
in [LICENSE](./LICENSE):

- allows personal, educational and evaluation use, including modifications;
- requires attribution and the official donation notice to stay visible;
- forbids Commercial Use (running a live store, reselling, paid hosting or
  development) without written permission;
- forbids using the 0xm4ngli name/logo for a competing deployment that implies
  endorsement; and
- states that donations are voluntary and go to the official account in
  [DONATIONS.md](./DONATIONS.md) and [config/donation.ts](./config/donation.ts).

If you want a project where anyone may fork, change the IBAN and run a
commercial store without asking, use a true open-source licence such as MIT
instead. You cannot have both unrestricted open source and a rule that forks
must keep your donation address.

### Publish to GitHub / Vercel

```bash
git add -A
git commit -m "Prepare production store"
git push origin main
```

If the Vercel project is connected to the GitHub repository, the push triggers a
deployment. Add the Turso variables in Vercel **before** the first production
request. Bank details already fall back to `config/donation.ts`, but an explicit
environment value wins if you set one.

Do not commit `.env.local`, API tokens, customer data or card details. The
official IBAN is intentionally public in `config/donation.ts`; that is the
project owner’s choice.

---

## Launch checklist

- [ ] Create the Turso database and set `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` in Vercel.
- [ ] Verify `config/donation.ts` and `DONATIONS.md` contain the correct official account and name.
- [ ] Set `CART_SECRET`, `ADMIN_TOKEN`, `APP_URL`.
- [ ] Complete `LEGAL_*`, VAT/company identifiers and return address.
- [ ] Verify the seeded catalogue’s stock/prices and replace it with an authorised feed; use `purgeDemo` once.
- [ ] Review privacy/terms/returns with a lawyer and accountant.
- [ ] Configure `RESEND_API_KEY` and `EMAIL_FROM` for order emails.
- [ ] Replace demo Unsplash photography with licensed product images or set `IMAGE_HOSTS`.
- [ ] Verify shipping destinations, carriers, customs and delivery estimates.
- [ ] Test a real €1 bank transfer end to end and mark it paid.
- [ ] Run `bun run lint`, `bun run typecheck`, `bun run build`.
- [ ] Set up monitoring for `/api/health` and Turso backups.
- [ ] Review rate limiting if you scale beyond one instance.

---

## Licenses

Code: 0xm4ngli Source-Available License 1.0 — see [LICENSE](./LICENSE). This is not an OSI open-source licence. Demo photography is served from Unsplash and must be replaced or credited according to the Unsplash licence for a live commercial catalogue. Product names and trademarks belong to their owners.

This README and the legal pages are not legal advice.
