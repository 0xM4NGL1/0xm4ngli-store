import { NextResponse } from "next/server";
import { z } from "zod";
import {
  clearCart,
  getCartSummary,
  getSummaryForCheckoutLines,
} from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import {
  createPendingOrder,
  releaseExpiredOrders,
} from "@/lib/orders";
import { isBankTransferConfigured } from "@/lib/payments";
import { sendBankTransferInstructionsEmail } from "@/lib/email";
import {
  ApiError,
  assertSameOrigin,
  handleApiError,
  readJson,
} from "@/lib/security";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const lineSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(10),
  size: z.string().trim().max(30).optional().default(""),
});

const schema = z.object({
  email: z.string().trim().email().max(254).optional(),
  supportCents: z.number().int().min(0).max(50_000).optional().default(0),
  // Present for the product-specific "Buy now" checkout. When omitted, the
  // order is created from the regular cart.
  items: z.array(lineSchema).length(1).optional(),
  shipping: z.object({
    name: z.string().trim().min(2).max(120),
    address: z.object({
      line1: z.string().trim().min(3).max(200),
      line2: z.string().trim().max(200).optional().default(""),
      city: z.string().trim().min(1).max(100),
      postal_code: z.string().trim().min(2).max(30),
      country: z.string().trim().toUpperCase().length(2),
    }),
  }),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const limit = rateLimit(clientKey(request, "checkout"), 12, 60_000);
    if (!limit.allowed) throw new ApiError("Too many checkout attempts.", 429);

    if (!isBankTransferConfigured()) {
      throw new ApiError(
        "Bank transfer details are not configured yet. Please try again later.",
        503,
      );
    }

    const body = schema.parse(await readJson(request));
    await releaseExpiredOrders();

    const user = await getCurrentUser();
    const email = user?.email ?? body.email ?? null;
    if (!email) {
      throw new ApiError("An email address is required for order updates.", 422);
    }

    const buyNow = body.items?.[0];
    let lines: Array<{ productId: number; quantity: number; size: string }>;
    let shippingCents: number;

    if (buyNow) {
      // Product-specific "Buy now": order only the requested item. The
      // shopper's cart is intentionally left untouched.
      const summary = await getSummaryForCheckoutLines([buyNow]);
      if (summary.lines.length !== 1) {
        throw new ApiError("This product is currently unavailable.", 409);
      }
      const containsDemo = summary.lines.some((line) => line.product.isDemo);
      if (containsDemo && process.env.ALLOW_DEMO_CATALOG_ORDERS !== "true") {
        throw new ApiError(
          "This product is demo catalogue data. Real orders are disabled until an authorised product feed is connected.",
          409,
        );
      }
      lines = summary.lines.map((line) => ({
        productId: line.product.id,
        quantity: line.quantity,
        size: line.size,
      }));
      shippingCents = summary.shippingCents || 0;
    } else {
      const cart = await getCartSummary();
      if (cart.lines.length === 0) {
        throw new ApiError("Your cart is empty.", 409);
      }

      const containsDemo = cart.lines.some((line) => line.product.isDemo);
      if (containsDemo && process.env.ALLOW_DEMO_CATALOG_ORDERS !== "true") {
        throw new ApiError(
          "This cart contains demo catalogue items. Real orders are disabled until an authorised product feed is connected.",
          409,
        );
      }
      lines = cart.lines.map((line) => ({
        productId: line.product.id,
        quantity: line.quantity,
        size: line.size,
      }));
      shippingCents = cart.shippingCents || 0;
    }

    const order = await createPendingOrder({
      userId: user?.id ?? null,
      email,
      lines,
      shippingCents,
      supportCents: body.supportCents,
      paymentMethod: "bank_transfer",
      shipping: {
        name: body.shipping.name,
        address: {
          line1: body.shipping.address.line1,
          line2: body.shipping.address.line2 ?? "",
          city: body.shipping.address.city,
          postal_code: body.shipping.address.postal_code,
          country: body.shipping.address.country,
        },
      },
    });

    if (!buyNow) await clearCart();
    if (order.email) await sendBankTransferInstructionsEmail(order);

    return NextResponse.json(
      {
        url: `/checkout/success?token=${encodeURIComponent(order.publicToken)}`,
        orderId: order.id,
        paymentMethod: "bank_transfer",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
