import type { CategorySlug } from "./site";

export type ProductRow = {
  id: number;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  category: CategorySlug;
  description: string;
  specs_json: string;
  sizes_json: string;
  price_cents: number;
  compare_at_cents: number | null;
  currency: string;
  stock: number;
  reserved: number;
  image: string;
  featured: number;
  is_demo: number;
  source: string;
  source_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: number;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  category: CategorySlug;
  description: string;
  specs: Record<string, string>;
  sizes: string[];
  priceCents: number;
  compareAtCents: number | null;
  currency: string;
  stock: number;
  available: number;
  image: string;
  featured: boolean;
  isDemo: boolean;
  source: string;
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PricePoint = {
  priceCents: number;
  recordedAt: string;
};

export type DealVerdict = "buy" | "good" | "fair" | "wait" | "collecting";

export type DealSignal = {
  verdict: DealVerdict;
  score: number;
  low90Cents: number | null;
  high90Cents: number | null;
  average90Cents: number | null;
  change30Percent: number | null;
  observations: number;
  lowestEverCents: number | null;
  isLowest90: boolean;
  summary: string;
};

export type CartLine = {
  product: Product;
  quantity: number;
  size: string;
};

export type CartSummary = {
  lines: CartLine[];
  itemCount: number;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  freeShippingRemainingCents: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  marketingConsent: boolean;
  createdAt: string;
};

export type OrderStatus = "pending" | "paid" | "failed" | "cancelled" | "refunded";

export type PaymentMethod = "bank_transfer";

export type OrderItemSnapshot = {
  productId: number;
  slug: string;
  name: string;
  sku: string;
  size?: string;
  unitPriceCents: number;
  quantity: number;
};

export type Order = {
  id: string;
  publicToken: string;
  userId: string | null;
  email: string | null;
  status: OrderStatus;
  subtotalCents: number;
  shippingCents: number;
  supportCents: number;
  totalCents: number;
  currency: string;
  items: OrderItemSnapshot[];
  shipping: Record<string, unknown> | null;
  paymentMethod: PaymentMethod;
  paymentReference: string | null;
  createdAt: string;
  paidAt: string | null;
};
