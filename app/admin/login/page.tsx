import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminConfigured, isAdminSession } from "@/lib/admin";
import { AdminLoginForm } from "@/components/admin-login-form";
import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = {
  title: "Store admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdminSession()) redirect("/admin");
  return (
    <AuthShell
      eyebrow="Store operator"
      title="Admin access"
      description="This area manages products, orders and bank-transfer matching. It is protected by ADMIN_TOKEN."
      footer={
        <p>
          Not the operator? Return to the <a href="/" className="font-semibold text-cyan-200">storefront</a>.
        </p>
      }
    >
      <AdminLoginForm disabled={!adminConfigured()} />
    </AuthShell>
  );
}
