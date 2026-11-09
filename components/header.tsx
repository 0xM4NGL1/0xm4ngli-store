import { getCurrentUser } from "@/lib/auth";
import { getCartCount } from "@/lib/cart";
import { getWishlistCount } from "@/lib/wishlist";
import { HeaderClient } from "./header-client";

export async function Header() {
  const user = await getCurrentUser();
  const [cartCount, wishlistCount] = await Promise.all([
    getCartCount(),
    user ? Promise.resolve(getWishlistCount(user.id)) : Promise.resolve(0),
  ]);

  return (
    <HeaderClient
      user={user ? { name: user.name, email: user.email } : null}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
    />
  );
}
