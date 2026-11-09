import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  getBrands,
  getCatalogPriceRange,
  getCategoryCounts,
  isCategory,
  listProducts,
  type ProductSort,
} from "@/lib/products";
import { categories, categoryBySlug } from "@/lib/site";
import { formatPrice } from "@/lib/format";
import { ProductCard } from "@/components/product-card";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const sortOptions: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "drop", label: "Best buy signal" },
];

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const categoryValue = one(params.category);
  const category =
    categoryValue && isCategory(categoryValue)
      ? categoryBySlug[categoryValue]
      : null;
  const query = one(params.q)?.trim();
  const title = query
    ? `Search: ${query}`
    : category
      ? category.name
      : "Shop all technology";
  return {
    title,
    description: category
      ? `${category.name} with recorded price observations and independent buy signals. ${category.tagline}`
      : "Browse laptops, phones, audio, wearables, gaming, cameras, smart home and accessories with real price intelligence.",
    alternates: { canonical: category ? `/shop?category=${category.slug}` : "/shop" },
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = one(params.q)?.trim().slice(0, 120) ?? "";
  const categoryValue = one(params.category) ?? "";
  const category = isCategory(categoryValue) ? categoryValue : undefined;
  const brand = one(params.brand)?.trim() || undefined;
  const sortValue = one(params.sort) ?? "featured";
  const sort = sortOptions.some((option) => option.value === sortValue)
    ? (sortValue as ProductSort)
    : "featured";
  const inStock = one(params.inStock) === "1";
  const minPriceValue = Number(one(params.minPrice));
  const maxPriceValue = Number(one(params.maxPrice));
  const minPriceCents =
    Number.isFinite(minPriceValue) && minPriceValue > 0
      ? Math.round(minPriceValue * 100)
      : undefined;
  const maxPriceCents =
    Number.isFinite(maxPriceValue) && maxPriceValue > 0
      ? Math.round(maxPriceValue * 100)
      : undefined;
  const pageValue = Number(one(params.page));
  const page = Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;

  const result = await listProducts({
    q: query || undefined,
    category,
    brand,
    minPriceCents,
    maxPriceCents,
    inStock,
    sort,
    page,
    pageSize: 12,
  });

  const [brands, counts, priceRange] = await Promise.all([
    getBrands(category),
    getCategoryCounts(),
    getCatalogPriceRange(),
  ]);
  const activeCategory = category ? categoryBySlug[category] : null;

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (category) next.set("category", category);
    if (brand) next.set("brand", brand);
    if (minPriceCents) next.set("minPrice", String(minPriceCents / 100));
    if (maxPriceCents) next.set("maxPrice", String(maxPriceCents / 100));
    if (inStock) next.set("inStock", "1");
    if (sort !== "featured") next.set("sort", sort);
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined) next.delete(key);
      else next.set(key, value);
    }
    const string = next.toString();
    return string ? `/shop?${string}` : "/shop";
  };

  const activeFilterCount = [
    query,
    category,
    brand,
    minPriceCents,
    maxPriceCents,
    inStock,
    sort !== "featured" ? sort : undefined,
  ].filter(Boolean).length;

  return (
    <div className="container-m4 py-10 md:py-14">
      <nav aria-label="Breadcrumb" className="mb-5 text-xs text-slate-500">
        <Link href="/" className="hover:text-cyan-200">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">{activeCategory?.name ?? "Shop"}</span>
      </nav>

      <div className="max-w-3xl">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
          {activeCategory ? "Category" : "Catalogue"}
        </p>
        <h1 className="neon-text mt-2 text-4xl font-black tracking-[-0.05em] text-white md:text-5xl">
          {query
            ? `Results for “${query}”`
            : activeCategory
              ? activeCategory.name
              : "Shop all technology"}
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          {activeCategory
            ? activeCategory.tagline
            : "Every product shows its recorded price observations and an evidence-based buy signal. When history is still building, the badge says “collecting”. Prices include applicable tax; shipping is calculated at checkout."}
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <details className="neon-card group rounded-2xl bg-[#0a0d19]" open>
            <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-bold text-white lg:cursor-default">
              <span className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-cyan-300" aria-hidden="true" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-cyan-300/15 px-2 py-0.5 font-mono text-[10px] text-cyan-200">
                    {activeFilterCount}
                  </span>
                )}
              </span>
              <span className="text-xs font-normal text-slate-500 lg:hidden">
                {activeFilterCount > 0 ? "Edit" : "Open"}
              </span>
            </summary>

            <form action="/shop" method="get" className="space-y-6 border-t border-white/10 p-4">
              <div>
                <label htmlFor="filter-q" className="mb-2 block text-xs font-semibold text-slate-300">
                  Search
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-3 focus-within:border-cyan-300/50">
                  <Search size={14} className="text-slate-500" aria-hidden="true" />
                  <input
                    id="filter-q"
                    name="q"
                    type="search"
                    defaultValue={query}
                    placeholder="Product or brand"
                    className="h-10 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <fieldset>
                <legend className="mb-2 text-xs font-semibold text-slate-300">Category</legend>
                <select
                  name="category"
                  defaultValue={category ?? ""}
                  className="h-10 w-full rounded-lg border border-white/15 bg-[#0a0d19] px-3 text-sm text-slate-200"
                >
                  <option value="">All categories</option>
                  {categories.map((entry) => (
                    <option key={entry.slug} value={entry.slug}>
                      {entry.name} ({counts[entry.slug] ?? 0})
                    </option>
                  ))}
                </select>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-xs font-semibold text-slate-300">Brand</legend>
                <select
                  name="brand"
                  defaultValue={brand ?? ""}
                  className="h-10 w-full rounded-lg border border-white/15 bg-[#0a0d19] px-3 text-sm text-slate-200"
                >
                  <option value="">All brands</option>
                  {brands.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-xs font-semibold text-slate-300">
                  Price ({formatPrice(priceRange.minCents)} – {formatPrice(priceRange.maxCents)})
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  <label className="sr-only" htmlFor="minPrice">Minimum price</label>
                  <input
                    id="minPrice"
                    name="minPrice"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={minPriceCents ? minPriceCents / 100 : ""}
                    placeholder="Min €"
                    className="h-10 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
                  />
                  <label className="sr-only" htmlFor="maxPrice">Maximum price</label>
                  <input
                    id="maxPrice"
                    name="maxPrice"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={maxPriceCents ? maxPriceCents / 100 : ""}
                    placeholder="Max €"
                    className="h-10 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
                  />
                </div>
              </fieldset>

              <label className="flex items-center gap-2.5 text-sm text-slate-300">
                <input
                  type="checkbox"
                  name="inStock"
                  value="1"
                  defaultChecked={inStock}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 accent-cyan-300"
                />
                In stock only
              </label>

              <div>
                <label htmlFor="filter-sort" className="mb-2 block text-xs font-semibold text-slate-300">
                  Sort
                </label>
                <select
                  id="filter-sort"
                  name="sort"
                  defaultValue={sort}
                  className="h-10 w-full rounded-lg border border-white/15 bg-[#0a0d19] px-3 text-sm text-slate-200"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="neon-button flex-1 rounded-lg px-4 py-2.5 text-xs font-black uppercase tracking-wide"
                >
                  Apply
                </button>
                <Link
                  href="/shop"
                  className="rounded-lg border border-white/15 px-3 py-2.5 text-xs font-semibold text-slate-400 transition hover:text-white"
                >
                  Reset
                </Link>
              </div>
            </form>
          </details>

          <div className="neon-outline mt-4 rounded-2xl p-4 text-xs leading-6 text-slate-500">
            <p className="font-semibold text-slate-300">How sorting works</p>
            <p className="mt-1">
              &ldquo;Best buy signal&rdquo; uses price history, not sponsorship. No
              retailer can pay to move up.
            </p>
          </div>
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <p className="text-sm text-slate-400">
              <span className="font-bold text-white">{result.total}</span>{" "}
              {result.total === 1 ? "product" : "products"}
              {result.pageCount > 1 && (
                <span className="text-slate-500"> · page {result.page} of {result.pageCount}</span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {query && (
                <Link href={buildHref({ q: undefined })} className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-[10px] text-slate-300 hover:text-white">
                  “{query}” <X size={11} aria-hidden="true" />
                </Link>
              )}
              {activeCategory && (
                <Link href={buildHref({ category: undefined })} className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-[10px] text-slate-300 hover:text-white">
                  {activeCategory.name} <X size={11} aria-hidden="true" />
                </Link>
              )}
              {brand && (
                <Link href={buildHref({ brand: undefined })} className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-[10px] text-slate-300 hover:text-white">
                  {brand} <X size={11} aria-hidden="true" />
                </Link>
              )}
              {inStock && (
                <Link href={buildHref({ inStock: undefined })} className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-[10px] text-slate-300 hover:text-white">
                  In stock <X size={11} aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>

          {result.products.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 p-8 text-center">
              <PackageSearch size={36} className="text-slate-600" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-bold text-white">No products found</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                Try removing a filter or searching for a broader term. The full
                catalogue is only a reset away.
              </p>
              <Link
                href="/shop"
                className="mt-5 rounded-full bg-cyan-300 px-5 py-2.5 text-xs font-black uppercase tracking-wide text-slate-950 hover:bg-fuchsia-300"
              >
                Reset filters
              </Link>
            </div>
          )}

          {result.pageCount > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
              {result.page > 1 ? (
                <Link
                  href={buildHref({ page: String(result.page - 1) })}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/15 px-3 text-xs text-slate-300 hover:border-cyan-300/40 hover:text-white"
                  rel="prev"
                >
                  <ChevronLeft size={14} aria-hidden="true" /> Previous
                </Link>
              ) : (
                <span className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/10 px-3 text-xs text-slate-600">
                  <ChevronLeft size={14} aria-hidden="true" /> Previous
                </span>
              )}
              <span className="px-3 font-mono text-xs text-slate-500">
                {result.page} / {result.pageCount}
              </span>
              {result.page < result.pageCount ? (
                <Link
                  href={buildHref({ page: String(result.page + 1) })}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/15 px-3 text-xs text-slate-300 hover:border-cyan-300/40 hover:text-white"
                  rel="next"
                >
                  Next <ChevronRight size={14} aria-hidden="true" />
                </Link>
              ) : (
                <span className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/10 px-3 text-xs text-slate-600">
                  Next <ChevronRight size={14} aria-hidden="true" />
                </span>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
