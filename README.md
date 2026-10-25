# 0xm4ngli Store

A neon-glow dark theme streetwear storefront built with Next.js 16 App Router, TypeScript, Tailwind CSS and `lucide-react`. The default UI is dark with neon (fuchsia / violet / cyan) glows — a pure component-driven layout in `app/page.tsx` fully typed with `React`, `useState`, `useEffect`.

## Tech Stack

| Layer | Package |
| --- | --- |
| Framework | `next` 16.4.3 |
| Runtimes | `react` 19.3.0 / `react-dom` 19.3.0 |
| Compiler | `typescript` ^5 |
| Styles | `tailwindcss` v4 (`@tailwindcss/turbopack`) |
| Icons | `lucide-react` 1.61.0 |
| Fonts | Geist (`next/font/google`) |

## Getting Started

Prerequisites: Node.js 20+, and a package manager that installs the project. The project is installed with **Bun** (lockfile `bun.lock`). Reinstall to refresh/repair dependencies before editing.

```bash
# install
bun install

# start dev server
bun run dev
# or just
bun dev
```

Then open <http://localhost:3000> in your browser. The first request auto-serves from cache (~350 ms); subsequent edits hot-reload. Production build is configured with `bun run build`, which prerenders the static route `/` successfully.

### Other package managers

```bash
npm run dev      # requires npm >= 10
pnpm dev
yarn dev
```

> The `.env.local` file is NOT needed for this project — all imagery is served directly from Unsplash via CSS `background-image` URLs inside `<style>`-free inline `style` props.

## Project Structure

```
app/
├─ page.tsx      ← default export; the whole neon storefront (Client Component)
└─ layout.tsx    → html/body shell (dark background from layout)
globals.css      ← tailwind directives / base config
package.json     → scripts + deps (dev, build, lint)
README.md        ← this file
LICENSE          → MIT
```

## Key Notes

- Every component is written in TSX with full types (`Product` interface, typed props, `React.FormEvent` etc.).
- Interactivity lives only in Client Components — `'use client';` directive guards SSR. No `useState/useEffect` mismatch in prerender because dynamic values are read in `useEffect`.
- Only exports available in `lucide-react@1.61.0` are imported — icons like `Instagram`, `Twitter`, `Youtube`, `Facebook`, `Globe` were mapped to nearest equivalents (`Globe` → Instagram slot, `Share` → Facebook slot, `MessageCircle` → Twitter slot, `Play` → Youtube slot).
- All external imagery (Unsplash) resolves normally across the layout regardless of route.

## Running (quick recap)

```bash
bun install       # one-time setup
bun run dev       # http://localhost:3000
bun run build     # production deploy check
bun run lint      # eslint --max-warnings=0
```

## Licenses

**Code of this project:** See the LICENSE file.

| Dependency | License |
| --- | --- |
| next | MIT |
| react / react-dom | MIT |
| typescript | Apache-2.0 |
| tailwindcss | MIT |
| @tailwindcss/turbopack | MIT |
| lucide-react | MIT |
| next/font/google (Geist) | Custom / Font Fonts |

See each package's repository for its own terms. This README does not constitute legal advice; consult a qualified attorney for obligations.

## License

[MIT — see LICENSE](./LICENSE)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
