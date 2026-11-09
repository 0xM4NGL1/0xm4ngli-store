import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getIndexableProductSlugs } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${site.url}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${site.url}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${site.url}/support`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/legal/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/legal/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/legal/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/legal/shipping`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/legal/accessibility`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const products = (await getIndexableProductSlugs()).map((product) => ({
    url: `${site.url}/product/${product.slug}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...products];
}
