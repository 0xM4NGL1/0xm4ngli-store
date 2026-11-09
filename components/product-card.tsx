import type { Product } from "@/lib/types";
import { getDealSignal, getPriceHistory } from "@/lib/products";
import { getViewerWishlist } from "@/lib/wishlist";
import { ProductCardView } from "./product-card-view";

/**
 * Server wrapper: fetch the price signal, real history and wishlist state,
 * then hand off to the client card that owns the slide-in quick view.
 */
export async function ProductCard({ product }: { product: Product }) {
  const [signal, history, viewer] = await Promise.all([
    getDealSignal(product.id),
    getPriceHistory(product.id, 90),
    getViewerWishlist(),
  ]);

  return (
    <ProductCardView
      product={product}
      signal={signal}
      history={history}
      saved={viewer.productIds.has(product.id)}
      authenticated={viewer.authenticated}
    />
  );
}
