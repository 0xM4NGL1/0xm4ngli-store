# Contributing

Thanks for improving 0xm4ngli.

## Setup

```bash
bun install
cp .env.example .env.local
bun dev
```

Use placeholder bank details locally. Do not add real account numbers or tokens to the repository.

## Before opening a pull request

```bash
bun run lint
bun run typecheck
bun run build
```

## Guidelines

- Keep the data-access layer async and compatible with both `node:sqlite` and Turso.
- Do not scrape retailer APIs or add unauthorised product data.
- Do not add analytics or tracking without a consent design and a cookie-policy update.
- Keep checkout card-free. Bank transfer or a licensed payment processor are the supported models.
- Preserve keyboard navigation, focus states and reduced-motion support.
- Never commit secrets, IBANs, customer data or `.env` files.

By contributing you agree to the repository's source-available licence and grant the copyright holder the contribution licence described in LICENSE section 6. If you do not agree, do not submit a contribution.
