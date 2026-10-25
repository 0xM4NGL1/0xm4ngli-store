'use client';

import React, { useState, useEffect } from 'react';
import { Search, User, ShoppingBag, Menu, X, ArrowRight, Star, Sparkles, Zap } from 'lucide-react';

const AnnouncementBar = () => (
  <div className="relative overflow-hidden bg-gradient-to-r from-fuchsia-900 via-violet-950 to-blue-950 text-cyan-100 text-xs font-black uppercase tracking-[0.2em] py-3 px-4 text-center w-full z-50 border-b border-fuchsia-800/40">
    <span className="relative z-10 drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]">0XM4NGLI — END OF SEASON SALE — 50% OFF SITEWIDE</span>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(236,72,153,0.15),transparent_70%)]" />
  </div>
);

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`sticky top-0 w-full z-40 transition-all duration-300 backdrop-blur-md border-b border-white/5 ${isScrolled ? 'bg-[#05050a]/90 shadow-[0_0_30px_rgba(236,72,153,0.15)] py-3' : 'bg-[#05050a]/60 py-4'}`}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex-1 flex items-center gap-4">
            <button type="button" className="md:hidden p-2 -ml-2 text-cyan-300 hover:text-fuchsia-300 transition" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu"><Menu size={24} /></button>
            <nav className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-widest text-slate-200">
              <a href="#" className="hover:text-fuchsia-300 transition drop-shadow-[0_0_4px_rgba(236,72,153,0.6)]">New In</a>
              <a href="#" className="text-fuchsia-300 drop-shadow-[0_0_6px_rgba(236,72,153,0.8)]">Sale</a>
              <a href="#" className="hover:text-cyan-300 transition drop-shadow-[0_0_4px_rgba(34,211,238,0.6)]">Categories</a>
              <a href="#" className="hover:text-violet-300 transition">About</a>
            </nav>
          </div>

          <div className="flex-1 text-center">
            <a href="#" className="inline-block text-3xl md:text-5xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 via-fuchsia-200 to-violet-300 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">
              0xm4ngli
            </a>
          </div>

          <div className="flex-1 flex items-center justify-end gap-4 md:gap-6">
            <button type="button" className="text-cyan-200 hover:text-fuchsia-300 transition p-1" aria-label="Search"><Search size={22} /></button>
            <button type="button" className="text-cyan-200 hover:text-fuchsia-300 transition p-1 hidden sm:block" aria-label="Account"><User size={22} /></button>
            <button type="button" className="text-cyan-200 hover:text-fuchsia-300 transition p-1 relative" aria-label="Cart">
              <ShoppingBag size={22} />
              <span className="absolute -top-2 -right-2 bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_8px_rgba(236,72,153,0.8)]">2</span>
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#03030a] to-[#0f0f1a] flex flex-col border-l border-white/10">
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <span className="text-3xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-fuchsia-300">0xm4ngli</span>
            <button type="button" onClick={() => setMobileMenuOpen(false)} className="p-2 text-cyan-200" aria-label="Close menu"><X size={28} /></button>
          </div>
          <nav className="flex flex-col p-8 gap-8 text-2xl font-black uppercase tracking-wider">
            <a href="#" className="border-b border-white/10 pb-4 text-cyan-100">New In</a>
            <a href="#" className="text-fuchsia-300 border-b border-white/10 pb-4 drop-shadow-[0_0_10px_rgba(236,72,153,0.6)]">Sale — 50% Off</a>
            <a href="#" className="border-b border-white/10 pb-4 text-violet-200">Clothing</a>
            <a href="#" className="border-b border-white/10 pb-4 text-blue-200">Accessories</a>
            <a href="#" className="border-b border-white/10 pb-4 text-slate-200">About Us</a>
          </nav>
        </div>
      )}
    </>
  );
};

const Hero = () => (
  <section className="relative w-full min-h-[85vh] overflow-hidden flex items-center justify-center bg-gradient-to-b from-[#05050a] via-[#0a0515] to-[#050516]">
    {/* Glows */}
    <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-fuchsia-700/30 blur-[120px]" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-700/30 blur-[120px]" />
    <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[50vw] h-[40vw] rounded-full bg-violet-600/25 blur-[100px]" />

    <div className="relative z-10 text-center px-6 max-w-6xl">
      <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-sm px-5 py-2 mb-6 rounded-full shadow-[0_0_30px_rgba(236,72,153,0.15)]">
        <Sparkles size={18} className="text-fuchsia-300 drop-shadow-[0_0_6px_rgba(236,72,153,0.8)]" />
        <span className="text-xs md:text-sm font-black uppercase tracking-[0.25em] text-cyan-100">Live Now</span>
      </div>
      <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-6">
        <span className="block text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 via-fuchsia-200 to-violet-300 drop-shadow-[0_0_25px_rgba(236,72,153,0.6)]">The</span>
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-blue-300 drop-shadow-[0_0_25px_rgba(34,211,238,0.5)]">Neon</span>
        <span className="block text-transparent bg-clip-text bg-gradient-to-b from-blue-200 via-violet-200 to-fuchsia-200 drop-shadow-[0_0_25px_rgba(168,85,247,0.6)]">Drop</span>
      </h1>
      <p className="text-lg md:text-2xl font-medium tracking-wide mb-10 text-slate-300 drop-shadow-md">UP TO 50% OFF SELECT STYLES — GLOW DIFFERENTLY</p>
      <a href="#" className="inline-flex items-center gap-3 bg-gradient-to-r from-fuchsia-600 to-violet-700 text-white text-sm md:text-lg font-black uppercase tracking-[0.2em] px-10 py-5 rounded-full shadow-[0_0_40px_rgba(236,72,153,0.45)] hover:shadow-[0_0_60px_rgba(236,72,153,0.7)] transition-all duration-300 hover:-translate-y-1 group border border-white/10 backdrop-blur-md">
        Shop Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
      </a>
    </div>
  </section>
);

interface Product {
  id: number;
  title: string;
  salePrice: string;
  originalPrice?: string;
  badge?: string;
  image: string;
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
  <div className="group cursor-pointer flex flex-col h-full">
    <div className="relative aspect-[3/4] overflow-hidden mb-4 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.08)]">
      {product.badge && (
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white text-[10px] font-black uppercase px-3 py-1 tracking-wider rounded-full shadow-[0_0_10px_rgba(236,72,153,0.8)]">
          {product.badge}
        </div>
      )}
      <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#05050a]/80 via-transparent to-transparent opacity-60" />
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
        <button type="button" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase text-xs py-3 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.6)] hover:shadow-[0_0_25px_rgba(6,182,212,0.9)] transition-colors">Quick Add</button>
      </div>
    </div>
    <div className="flex flex-col flex-grow justify-between">
      <h3 className="text-slate-100 font-black text-sm md:text-base uppercase tracking-tight leading-snug group-hover:text-fuchsia-300 transition drop-shadow-[0_0_6px_rgba(236,72,153,0.5)]">{product.title}</h3>
      <div className="flex items-center gap-3 mt-2">
        <span className="text-fuchsia-300 font-black text-lg drop-shadow-[0_0_6px_rgba(236,72,153,0.7)]">£{product.salePrice}</span>
        {product.originalPrice && <span className="text-slate-500 font-medium text-sm line-through">£{product.originalPrice}</span>}
      </div>
    </div>
  </div>
);

const ProductsGrid = () => {
  const products: Product[] = [
    { id: 1, title: "Neon Voltage Hoodie — Phantom Black", salePrice: "32.50", originalPrice: "65.00", badge: "50% OFF", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800" },
    { id: 2, title: "0xm4ngli Crew — Void Grey", salePrice: "28.00", originalPrice: "56.00", badge: "50% OFF", image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=800" },
    { id: 3, title: "Glow Cargo — Midnight", salePrice: "37.50", originalPrice: "75.00", badge: "50% OFF", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800" },
    { id: 4, title: "Pulse Puffer — Electric", salePrice: "45.00", originalPrice: "90.00", badge: "50% OFF", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800" },
  ];

  return (
    <section className="py-20 md:py-28 max-w-[1400px] mx-auto px-4 md:px-8 relative">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-fuchsia-500/40 to-transparent" />
      <div className="flex items-end justify-between mb-10 md:mb-14">
        <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-100 via-fuchsia-200 to-violet-300 drop-shadow-[0_0_15px_rgba(236,72,153,0.4)]">0xm4ngli Picks</h2>
        <a href="#" className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-200 hover:text-fuchsia-300 transition border-b-2 border-transparent hover:border-fuchsia-400 pb-1">View All <ArrowRight size={14} /></a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-14 md:gap-8">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
};

const CategoriesSection = () => (
  <section className="pb-20 md:pb-28 max-w-[1400px] mx-auto px-4 md:px-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
      <a href="#" className="relative h-[320px] md:h-[520px] group overflow-hidden rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(168,85,247,0.15)] block">
        <img src="https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?q=80&w=1000" alt="Hoodies" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out opacity-80 group-hover:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050a]/90 via-[#05050a]/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-14 md:pb-20">
          <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-cyan-100 to-fuchsia-300 drop-shadow-[0_0_20px_rgba(236,72,153,0.7)] mb-6">Hoodies</h3>
          <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-black uppercase tracking-[0.2em] px-8 py-3 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.6)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.9)] transition">Shop Now</span>
        </div>
      </a>
      <a href="#" className="relative h-[320px] md:h-[520px] group overflow-hidden rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(34,211,238,0.15)] block">
        <img src="https://images.unsplash.com/photo-1542272604-780c96859332?q=80&w=1000" alt="Cargos" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out opacity-80 group-hover:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050a]/90 via-[#05050a]/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-14 md:pb-20">
          <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-violet-100 to-blue-300 drop-shadow-[0_0_20px_rgba(34,211,238,0.7)] mb-6">Cargos</h3>
          <span className="bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white text-xs font-black uppercase tracking-[0.2em] px-8 py-3 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.6)] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.9)] transition">Shop Now</span>
        </div>
      </a>
    </div>
  </section>
);

const Footer = () => {
  const [year, setYear] = useState<number>(0);
  useEffect(() => { setYear(new Date().getFullYear()); }, []);

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#05050a] via-[#0a0515] to-[#03030a] text-white pt-16 pb-8 border-t border-white/10">
      {/* Background glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-[10%] w-[40vw] h-[40vw] rounded-full bg-violet-700/20 blur-[120px]" />
        <div className="absolute bottom-0 right-[10%] w-[40vw] h-[40vw] rounded-full bg-blue-700/20 blur-[120px]" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          <div className="md:col-span-5 lg:col-span-4">
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-3 bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-fuchsia-300">Join the VIP Club</h3>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">Exclusive offers, original stories, activism awareness, events and more.</p>
            <form className="flex flex-col gap-3" onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}>
              <input type="email" placeholder="ENTER YOUR EMAIL" className="bg-white/5 border border-white/10 text-white px-5 py-3 text-sm focus:outline-none focus:border-fuchsia-400 transition rounded-xl" />
              <button type="submit" className="bg-gradient-to-r from-fuchsia-600 to-violet-700 text-white font-black uppercase tracking-[0.15em] text-sm py-3 rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:shadow-[0_0_30px_rgba(236,72,153,0.8)] transition">Subscribe</button>
            </form>
          </div>
          <div className="hidden lg:block lg:col-span-2" />
          <div className="md:col-span-3 lg:col-span-2">
            <h4 className="font-black uppercase tracking-widest text-xs mb-6 text-fuchsia-200">Help & Info</h4>
            <ul className="flex flex-col gap-3 text-slate-300 text-sm">
              <li><a href="#" className="hover:text-cyan-300 transition">Track Order</a></li>
              <li><a href="#" className="hover:text-cyan-300 transition">Delivery & Returns</a></li>
              <li><a href="#" className="hover:text-cyan-300 transition">Contact Us</a></li>
              <li><a href="#" className="hover:text-cyan-300 transition">FAQs</a></li>
              <li><a href="#" className="hover:text-cyan-300 transition">Size Guide</a></li>
            </ul>
          </div>
          <div className="md:col-span-4 lg:col-span-4">
            <h4 className="font-black uppercase tracking-widest text-xs mb-6 text-violet-200">About 0xm4ngli</h4>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">Born on the streets, built for the next generation. Neon streetwear blending technical design with urban culture. Don't blend in.</p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-fuchsia-600 hover:border-fuchsia-400 transition shadow-[0_0_10px_rgba(236,72,153,0.2)]" aria-label="Instagram"><Star size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-400 transition shadow-[0_0_10px_rgba(34,211,238,0.2)]" aria-label="Twitter"><Zap size={18} /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>&copy; {year || ''} 0XM4NGLI — ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-cyan-300 transition">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-300 transition">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <div className="min-h-screen bg-[#05050a] font-sans text-slate-100 selection:bg-fuchsia-500 selection:text-black">
      <AnnouncementBar />
      <Header />
      <main>
        <Hero />
        <ProductsGrid />
        <CategoriesSection />
      </main>
      <Footer />
    </div>
  );
}
