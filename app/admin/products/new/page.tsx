import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin";
import { AdminShell } from "@/components/admin-shell";
import { AdminProductForm } from "@/components/admin-product-form";

export const metadata: Metadata = {
  title: "Add product",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  await requireAdminPage();
  return (
    <AdminShell
      title="Add a real product"
      description="Only add stock you can actually fulfil. The customer will see this price and availability immediately."
    >
      <AdminProductForm />
    </AdminShell>
  );
}
