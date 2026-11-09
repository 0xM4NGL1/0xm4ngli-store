import { OFFICIAL_DONATION } from "@/config/donation";

export const site = {
  name: "0xm4ngli",
  tagline: "Tech worth the wait. Prices worth the drop.",
  description:
    "A privacy-first technology store with independent price intelligence, worldwide shipping and a simple bank-transfer checkout.",
  url: (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  email: process.env.CONTACT_EMAIL ?? "hello@0xm4ngli.store",
  repositoryUrl: OFFICIAL_DONATION.repository,
  legalName: process.env.LEGAL_NAME ?? "",
  legalAddress: process.env.LEGAL_ADDRESS ?? "",
  companyNumber: process.env.COMPANY_NUMBER ?? "",
  vatId: process.env.VAT_ID ?? "",
  jurisdiction: process.env.LEGAL_JURISDICTION ?? "the European Union",
  privacyEmail:
    process.env.PRIVACY_EMAIL ??
    process.env.CONTACT_EMAIL ??
    "privacy@0xm4ngli.store",
  currency: "EUR",
  locale: "en-IE",
  freeShippingThresholdCents: Number(process.env.FREE_SHIPPING_THRESHOLD_CENTS ?? 50000),
  flatShippingCents: Number(process.env.FLAT_SHIPPING_CENTS ?? 1290),
  demoCatalog: process.env.NEXT_PUBLIC_DEMO_CATALOG === "true",
} as const;

export const categories = [
  {
    slug: "laptops",
    name: "Laptops",
    tagline: "Portable power, without the compromise.",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    accent: "#22d3ee",
  },
  {
    slug: "phones",
    name: "Phones",
    tagline: "The pocket computers worth carrying.",
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80",
    accent: "#e879f9",
  },
  {
    slug: "audio",
    name: "Audio",
    tagline: "Hear every detail. Pay attention to the price.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    accent: "#a78bfa",
  },
  {
    slug: "wearables",
    name: "Wearables",
    tagline: "Health, focus and notifications on your wrist.",
    image:
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=1200&q=80",
    accent: "#f0abfc",
  },
  {
    slug: "gaming",
    name: "Gaming",
    tagline: "Frames, feel and the best moment to press buy.",
    image:
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1200&q=80",
    accent: "#fb7185",
  },
  {
    slug: "cameras",
    name: "Cameras",
    tagline: "Capture more. Spend smarter.",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
    accent: "#fbbf24",
  },
  {
    slug: "smart-home",
    name: "Smart home",
    tagline: "A home that works for you.",
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80",
    accent: "#2dd4bf",
  },
  {
    slug: "accessories",
    name: "Accessories",
    tagline: "The small upgrades that change the everyday.",
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80",
    accent: "#c084fc",
  },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export const categoryBySlug = Object.fromEntries(
  categories.map((category) => [category.slug, category]),
) as Record<CategorySlug, (typeof categories)[number]>;
