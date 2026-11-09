import Link from "next/link";
import { ArrowLeft, Package, ReceiptText, Settings2 } from "lucide-react";
import { AdminLogout } from "./admin-logout";

const links = [
  { href: "/admin", label: "Overview", icon: Settings2 },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText },
  { href: "/admin/products", label: "Products", icon: Package },
];

export function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-m4 py-10 md:py-14">
      <div className="flex flex-col justify-between gap-5 border-b border-[#c4b5fd]/12 pb-6 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
            Store admin
          </p>
          <h1 className="neon-text mt-2 text-3xl font-black tracking-[-0.04em] text-white md:text-4xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="neon-outline inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white"
          >
            <ArrowLeft size={14} aria-hidden="true" /> View store
          </Link>
          <AdminLogout />
        </div>
      </div>

      <nav className="mt-5 flex gap-1 overflow-x-auto pb-1" aria-label="Admin">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold text-slate-400 transition hover:bg-[#c4b5fd]/10 hover:text-white"
          >
            <link.icon size={14} aria-hidden="true" /> {link.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8">{children}</div>
    </div>
  );
}
