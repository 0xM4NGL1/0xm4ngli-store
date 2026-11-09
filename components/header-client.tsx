"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { Logo } from "./logo";
import { categories } from "@/lib/site";
import { classNames } from "@/lib/format";

type HeaderUser = { name: string; email: string } | null;

const mainNav = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?sort=drop", label: "Price drops" },
  { href: "/shop?category=laptops", label: "Laptops" },
  { href: "/shop?category=audio", label: "Audio" },
  { href: "/shop?category=gaming", label: "Gaming" },
  { href: "/about", label: "About" },
];

export function HeaderClient({
  user,
  cartCount,
  wishlistCount,
}: {
  user: HeaderUser;
  cartCount: number;
  wishlistCount: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMenuOpen(false);
      setSearchOpen(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
      if (
        event.key === "/" &&
        !searchOpen &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    if (searchOpen) {
      const timer = window.setTimeout(() => searchRef.current?.focus(), 40);
      return () => window.clearTimeout(timer);
    }
  }, [searchOpen]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    setSearchOpen(false);
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  };

  const initials = user?.name
    ? user.name
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : null;

  return (
    <>
      <div className="relative overflow-hidden border-b border-white/10 bg-[#080a14]">
        <div className="container-m4 flex min-h-9 items-center justify-between gap-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          <p className="flex items-center gap-2">
            <Sparkles size={12} className="text-cyan-300" aria-hidden="true" />
            <span className="hidden sm:inline">
              Independent price intelligence · No paid rankings
            </span>
            <span className="sm:hidden">Price intelligence · 0 trackers</span>
          </p>
          <p className="hidden md:block">
            Free tracked shipping over €500 · 14-day returns
          </p>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05060b]/82 backdrop-blur-xl">
        <div className="container-m4 flex h-[68px] items-center gap-4">
          <button
            type="button"
            className="rounded-full p-2 text-slate-300 transition hover:bg-white/5 hover:text-white lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <Menu size={22} aria-hidden="true" />
          </button>

          <Logo />

          <nav
            className="ml-4 hidden items-center gap-6 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 lg:flex"
            aria-label="Primary"
          >
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative py-2 transition hover:text-white"
              >
                {item.label}
                {item.label === "Price drops" && (
                  <span className="absolute -right-2 -top-0.5 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                )}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rounded-full p-2.5 text-slate-300 transition hover:bg-white/5 hover:text-white"
              aria-label="Search products"
              aria-haspopup="dialog"
            >
              <Search size={19} aria-hidden="true" />
            </button>

            <Link
              href="/wishlist"
              className="relative hidden rounded-full p-2.5 text-slate-300 transition hover:bg-white/5 hover:text-fuchsia-200 sm:block"
              aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} items` : ""}`}
            >
              <Heart size={19} aria-hidden="true" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[9px] font-black text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href={user ? "/account" : "/login"}
              className={classNames(
                "relative flex items-center gap-2 rounded-full p-2.5 text-slate-300 transition hover:bg-white/5 hover:text-cyan-200",
                user && "sm:pr-3",
              )}
              aria-label={user ? "Your account" : "Sign in"}
            >
              {initials ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-[10px] font-black text-cyan-100">
                  {initials}
                </span>
              ) : (
                <User size={19} aria-hidden="true" />
              )}
              <span className="hidden max-w-24 truncate text-xs font-semibold sm:inline">
                {user ? user.name.split(" ")[0] : "Sign in"}
              </span>
            </Link>

            <Link
              href="/cart"
              className="relative rounded-full p-2.5 text-slate-200 transition hover:bg-white/5 hover:text-white"
              aria-label={`Cart${cartCount ? `, ${cartCount} items` : ""}`}
            >
              <ShoppingBag size={20} aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 px-1 text-[9px] font-black text-slate-950">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-50 flex flex-col bg-[#060815] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex h-[68px] items-center justify-between border-b border-white/10 px-4">
            <Logo />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="rounded-full p-2 text-slate-300 hover:bg-white/5 hover:text-white"
              aria-label="Close menu"
            >
              <X size={24} aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-8">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Browse
            </p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/shop?category=${category.slug}`}
                  className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm font-semibold text-slate-200 hover:border-cyan-300/30 hover:text-white"
                >
                  {category.name}
                </Link>
              ))}
            </div>
            <p className="mb-3 mt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Store
            </p>
            <nav className="flex flex-col divide-y divide-white/10 border-y border-white/10">
              {[
                { href: "/shop", label: "Shop all" },
                { href: "/shop?sort=drop", label: "Price drops" },
                { href: "/wishlist", label: "Wishlist" },
                { href: user ? "/account" : "/login", label: user ? "Account" : "Sign in" },
                { href: "/support", label: "Support" },
                { href: "/about", label: "About" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between py-4 text-base font-semibold text-slate-200"
                >
                  {item.label}
                  <ArrowRight size={16} className="text-slate-500" aria-hidden="true" />
                </Link>
              ))}
            </nav>
            <p className="mt-8 text-xs leading-relaxed text-slate-500">
              Price history, secure payments and no tracking. Built by 0xm4ngli.
            </p>
          </div>
        </div>
      )}

      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-[#03040a]/80 px-4 pt-[12vh] backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSearchOpen(false);
          }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-[#0a0d1b] shadow-2xl">
            <form onSubmit={submitSearch} className="flex items-center gap-3 border-b border-white/10 px-5">
              <Search size={20} className="shrink-0 text-cyan-300" aria-hidden="true" />
              <label htmlFor="site-search" className="sr-only">
                Search products
              </label>
              <input
                ref={searchRef}
                id="site-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search laptops, audio, cameras…"
                className="h-16 w-full bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                aria-label="Close search"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </form>
            <div className="p-5">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Jump to a category
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/shop?category=${category.slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-300/30 hover:text-white"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
              <p className="mt-5 text-xs text-slate-500">
                Tip: press <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono">/</kbd> anywhere to search.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
