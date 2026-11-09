import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin";
import { getProductById } from "@/lib/products";
import { AdminShell } from "@/components/admin-shell";
import { AdminProductForm } from "@/components/admin-product-form";

export const metadata: Metadata = {
  title: "Edit product",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId < 1) notFound();
  const product = await getProductById(productId);
  if (!product) notFound();

  return (
    <AdminShell
      title="Edit product"
      description={`${product.name} · ${product.sku}`}
    >
      <AdminProductForm product={product} />
    </AdminShell>
  );
}
