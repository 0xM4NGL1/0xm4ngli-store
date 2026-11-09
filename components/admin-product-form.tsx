"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, Save, Sparkles } from "lucide-react";
import { categories } from "@/lib/site";
import type { Product } from "@/lib/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export function AdminProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [sku, setSku] = useState(product?.sku ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [category, setCategory] = useState(product?.category ?? "accessories");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(
    product ? (product.priceCents / 100).toFixed(2) : "",
  );
  const [compareAt, setCompareAt] = useState(
    product?.compareAtCents ? (product.compareAtCents / 100).toFixed(2) : "",
  );
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [image, setImage] = useState(product?.image ?? "");
  const [sourceUrl, setSourceUrl] = useState(product?.sourceUrl ?? "");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [specs, setSpecs] = useState(
    product ? JSON.stringify(product.specs, null, 2) : '{\n  "Warranty": "2 years"\n}',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    let parsedSpecs: Record<string, string>;
    try {
      const raw = JSON.parse(specs || "{}") as unknown;
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        throw new Error("not an object");
      }
      parsedSpecs = Object.fromEntries(
        Object.entries(raw as Record<string, unknown>).map(([key, value]) => [
          key,
          String(value),
        ]),
      );
    } catch {
      setError("Specifications must be a JSON object such as {\"Memory\":\"16 GB\"}.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        sku,
        slug,
        name,
        brand,
        category,
        description,
        specs: parsedSpecs,
        price: Number(price),
        compareAt: compareAt ? Number(compareAt) : undefined,
        stock: Number(stock),
        image: image || undefined,
        featured,
        sourceUrl: sourceUrl || undefined,
      };
      const response = await fetch(
        product ? `/api/admin/products/${product.id}` : "/api/admin/products",
        {
          method: product ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Could not save the product.");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Could not save the product.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="neon-card rounded-2xl bg-[#0a0d19] p-5 md:p-6">
        <h2 className="text-lg font-black text-white">Product identity</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="product-name" className="mb-1.5 block text-xs font-semibold text-slate-300">
              Name
            </label>
            <input id="product-name" required value={name} onChange={(e) => setName(e.target.value)} className="neon-outline h-10 w-full rounded-lg px-3 text-sm text-white outline-none focus:border-cyan-300/60" />
          </div>
          <div>
            <label htmlFor="product-brand" className="mb-1.5 block text-xs font-semibold text-slate-300">
              Brand
            </label>
            <input id="product-brand" required value={brand} onChange={(e) => setBrand(e.target.value)} className="neon-outline h-10 w-full rounded-lg px-3 text-sm text-white outline-none focus:border-cyan-300/60" />
          </div>
          <div>
            <label htmlFor="product-sku" className="mb-1.5 block text-xs font-semibold text-slate-300">
              SKU
            </label>
            <input id="product-sku" required value={sku} onChange={(e) => setSku(e.target.value)} className="neon-outline h-10 w-full rounded-lg px-3 text-sm text-white outline-none focus:border-cyan-300/60" />
          </div>
          <div>
            <label htmlFor="product-slug" className="mb-1.5 block text-xs font-semibold text-slate-300">
              URL slug
            </label>
            <div className="flex gap-2">
              <input id="product-slug" required value={slug} onChange={(e) => setSlug(e.target.value)} className="neon-outline h-10 w-full rounded-lg px-3 font-mono text-xs text-white outline-none focus:border-cyan-300/60" />
              <button type="button" onClick={() => setSlug(slugify(name))} className="neon-outline shrink-0 rounded-lg px-3 text-xs font-semibold text-slate-300" title="Generate from name">
                <Sparkles size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="product-category" className="mb-1.5 block text-xs font-semibold text-slate-300">
              Category
            </label>
            <select id="product-category" value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className="neon-outline h-10 w-full rounded-lg bg-[#0a0d19] px-3 text-sm text-slate-200">
              {categories.map((entry) => (
                <option key={entry.slug} value={entry.slug}>{entry.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="product-stock" className="mb-1.5 block text-xs font-semibold text-slate-300">
              Stock
            </label>
            <input id="product-stock" type="number" min="0" required value={stock} onChange={(e) => setStock(e.target.value)} className="neon-outline h-10 w-full rounded-lg px-3 text-sm text-white outline-none focus:border-cyan-300/60" />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="product-description" className="mb-1.5 block text-xs font-semibold text-slate-300">
            Description
          </label>
          <textarea id="product-description" required minLength={20} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="neon-outline w-full rounded-lg p-3 text-sm leading-6 text-white outline-none focus:border-cyan-300/60" />
        </div>
      </div>

      <div className="neon-card rounded-2xl bg-[#0a0d19] p-5 md:p-6">
        <h2 className="text-lg font-black text-white">Price and stock</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="product-price" className="mb-1.5 block text-xs font-semibold text-slate-300">
              Price (EUR)
            </label>
            <input id="product-price" type="number" min="0.01" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} className="neon-outline h-10 w-full rounded-lg px-3 text-sm text-white outline-none focus:border-cyan-300/60" />
          </div>
          <div>
            <label htmlFor="product-compare" className="mb-1.5 block text-xs font-semibold text-slate-300">
              Compare-at (optional)
            </label>
            <input id="product-compare" type="number" min="0.01" step="0.01" value={compareAt} onChange={(e) => setCompareAt(e.target.value)} className="neon-outline h-10 w-full rounded-lg px-3 text-sm text-white outline-none focus:border-cyan-300/60" />
          </div>
          <label className="flex items-center gap-2.5 self-end text-sm text-slate-300">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-white/5 accent-cyan-300" />
            Featured on the home page
          </label>
        </div>
        <p className="mt-2 text-[11px] text-slate-600">
          Prices are stored in euro, tax-inclusive. A price change records a new
          price observation automatically.
        </p>
      </div>

      <div className="neon-card rounded-2xl bg-[#0a0d19] p-5 md:p-6">
        <h2 className="text-lg font-black text-white">Media and source</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label htmlFor="product-image" className="mb-1.5 block text-xs font-semibold text-slate-300">
              Image URL (HTTPS)
            </label>
            <input id="product-image" type="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" className="neon-outline h-10 w-full rounded-lg px-3 text-sm text-white outline-none focus:border-cyan-300/60" />
            <p className="mt-1 text-[10px] text-slate-600">
              Use a licensed product photo. If empty, the category image is used.
              Add the host to `IMAGE_HOSTS` if it is not Unsplash.
            </p>
          </div>
          <div>
            <label htmlFor="product-source" className="mb-1.5 block text-xs font-semibold text-slate-300">
              Source URL (optional)
            </label>
            <input id="product-source" type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://supplier.example/product" className="neon-outline h-10 w-full rounded-lg px-3 text-sm text-white outline-none focus:border-cyan-300/60" />
          </div>
          <div>
            <label htmlFor="product-specs" className="mb-1.5 block text-xs font-semibold text-slate-300">
              Specifications (JSON object)
            </label>
            <textarea id="product-specs" rows={6} value={specs} onChange={(e) => setSpecs(e.target.value)} className="neon-outline w-full rounded-lg p-3 font-mono text-xs leading-6 text-cyan-100 outline-none focus:border-cyan-300/60" />
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-300/20 bg-rose-300/[0.06] p-3 text-xs text-rose-200" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={loading} className="neon-button inline-flex items-center gap-2 rounded-lg px-5 py-3 text-xs font-black uppercase tracking-wide disabled:opacity-60">
          {loading ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}
          {product ? "Save product" : "Create product"}
        </button>
        <Link href="/admin/products" className="inline-flex items-center gap-2 rounded-lg px-3 py-3 text-xs font-semibold text-slate-400 hover:text-white">
          <ArrowLeft size={14} aria-hidden="true" /> Cancel
        </Link>
      </div>
      {product?.source === "starter" && (
        <p className="text-[11px] text-amber-200/80">
          This is seeded catalogue content. Saving it converts it into your manual
          product catalogue.
        </p>
      )}
    </form>
  );
}
