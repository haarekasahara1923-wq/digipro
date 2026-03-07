'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag, Zap, Shield, Star, ArrowRight,
  Sparkles, ShoppingCart, Search, X, Globe,
  TrendingUp, Package, Users, CheckCircle,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

interface Product {
  id: number; name: string; description: string;
  original_price: string; discounted_price: string;
  image_url: string; slug: string; price_usd: string | null;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digipro';
  const tagline = process.env.NEXT_PUBLIC_STORE_TAGLINE || 'Premium Digital Products';

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        setProducts(data.products || []);
        setFiltered(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(products); return; }
    const q = search.toLowerCase();
    setFiltered(products.filter(p =>
      p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    ));
  }, [search, products]);

  const disc = (orig: string, disc: string) =>
    Math.round(((parseFloat(orig) - parseFloat(disc)) / parseFloat(orig)) * 100);

  const stats = [
    { icon: Package, value: `${products.length}+`, label: 'Products' },
    { icon: Zap, value: 'Instant', label: 'Delivery' },
    { icon: Shield, value: '100%', label: 'Secure' },
    { icon: Globe, value: 'INR & USD', label: 'Currencies' },
  ];

  return (
    <div className="min-h-screen bg-dark overflow-x-hidden">
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gold/5 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-40 left-0 w-96 h-96 bg-purple-600/6 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-gold/4 rounded-full blur-[100px] pointer-events-none" />

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.8) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="max-w-5xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 bg-gold/8 border border-gold/15 rounded-full px-5 py-2 mb-8 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
            <span className="text-gold text-xs font-bold tracking-[2px] uppercase">Premium · Instant · Secure</span>
            <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
          </div>

          {/* Main heading */}
          <h1 className="font-display leading-none mb-6">
            <span className="block text-5xl sm:text-7xl lg:text-9xl text-white tracking-tight">
              {storeName.toUpperCase()}
            </span>
            <span className="block text-3xl sm:text-5xl lg:text-6xl mt-2"
              style={{ background: 'linear-gradient(135deg,#FFD700 0%,#F5A623 50%,#FFD700 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {tagline.toUpperCase()}
            </span>
          </h1>

          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed">
            Buy once. Download instantly. Delivered instantly to your Email.
            Pay in <span className="text-gold font-semibold">₹ INR</span> or <span className="text-blue-400 font-semibold">$ USD</span>.
          </p>

          {/* Search bar — FIXED: icon disappears when typing */}
          <div className="max-w-lg mx-auto mb-12">
            <div className="relative group">
              {/* Icon — only when empty */}
              {!search && (
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-10" />
              )}
              {/* Clear button — only when has text */}
              {search && (
                <button
                  onClick={() => { setSearch(''); searchRef.current?.focus(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-gray-500 hover:text-gold transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <input
                ref={searchRef}
                type="text"
                placeholder="Search products by name or keyword..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-dark-2/80 backdrop-blur-xl border border-white/10 text-white placeholder-gray-600 text-sm rounded-2xl py-4 pl-11 pr-4 outline-none focus:border-gold/40 focus:bg-dark-2 focus:ring-1 focus:ring-gold/20 transition-all duration-300"
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-4 sm:gap-10">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-2 group bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-white/5 sm:border-transparent">
                <div className="w-8 h-8 sm:w-7 sm:h-7 bg-gold/10 rounded-lg flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                  <Icon className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-gold" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold leading-tight">{value}</p>
                  <p className="text-gray-400 sm:text-gray-600 text-[11px] sm:text-xs">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products Grid ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 relative">
        {/* Section header */}
        <div className="flex items-center gap-6 mb-10">
          <div>
            <p className="text-gold text-xs font-bold uppercase tracking-[3px] mb-1 flex items-center gap-2">
              <TrendingUp className="w-3 h-3" /> Available Now
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-white leading-none">
              {search ? 'SEARCH RESULTS' : 'ALL PRODUCTS'}
            </h2>
            {search && (
              <p className="text-gray-600 text-sm mt-1">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<span className="text-white">{search}</span>"
              </p>
            )}
          </div>
          {!search && <div className="flex-1 h-px bg-gradient-to-r from-gold/20 via-gold/5 to-transparent" />}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden border border-white/5 animate-pulse">
                <div className="aspect-[4/3] bg-dark-2" />
                <div className="p-3 sm:p-5 space-y-3 bg-dark-2">
                  <div className="h-4 sm:h-5 bg-dark-3 rounded w-3/4" />
                  <div className="h-3 sm:h-4 bg-dark-3 rounded w-1/2" />
                  <div className="h-8 sm:h-10 bg-dark-3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-dark-2 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-10 h-10 text-gray-700" />
            </div>
            <p className="text-xl text-gray-600 mb-2">
              {search ? `No results for "${search}"` : 'No products available yet'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="text-gold text-sm hover:text-gold-light transition-colors mt-2">
                ← Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} calcDisc={disc} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

// ── Product Card ───────────────────────────────────────────────────────────
function ProductCard({
  product, index, calcDisc,
}: { product: Product; index: number; calcDisc: (o: string, d: string) => number }) {
  const { addItem, isInCart, openCart } = useCart();
  const discPct = calcDisc(product.original_price, product.discounted_price);
  const inCart = isInCart(product.slug);
  const hasUsd = !!product.price_usd;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCart) { openCart(); return; }
    addItem({
      id: product.id, name: product.name, slug: product.slug,
      price: parseFloat(product.discounted_price),
      originalPrice: parseFloat(product.original_price),
      image_url: product.image_url,
    });
    toast.success(`Added to cart!`);
  };

  return (
    <div className="group relative flex flex-col bg-dark-2 border border-white/5 rounded-2xl overflow-hidden
      hover:border-gold/25 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-gold/10
      transition-all duration-300"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-dark-3 flex-shrink-0">
        <Image
          src={product.image_url} alt={product.name} fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-2 via-dark-2/30 to-transparent" />

        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-1.5">
          {discPct > 0 && (
            <span className="text-[10px] sm:text-xs font-black text-black px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg"
              style={{ background: 'linear-gradient(135deg,#FFD700,#F5A623)' }}>
              -{discPct}%
            </span>
          )}
          {hasUsd && (
            <span className="text-[9px] sm:text-xs font-bold text-blue-300 bg-blue-500/20 border border-blue-500/20 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg flex items-center gap-1">
              <Globe className="w-2 h-2 sm:w-2.5 sm:h-2.5" /> <span className="hidden sm:inline">USD</span>
            </span>
          )}
        </div>

        {inCart && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
            <span className="text-[9px] sm:text-xs font-bold text-green-400 bg-green-500/15 border border-green-500/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg flex items-center gap-1">
              <CheckCircle className="w-2 h-2 sm:w-2.5 sm:h-2.5" /> <span className="hidden sm:inline">In Cart</span>
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-5 flex flex-col flex-1">
        <h3 className="font-display text-sm sm:text-xl text-white mb-1.5 sm:mb-2 leading-tight group-hover:text-gold transition-colors line-clamp-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-gray-500 sm:text-gray-600 text-[10px] sm:text-xs mb-3 sm:mb-4 line-clamp-2 leading-relaxed flex-1">
            {product.description}
          </p>
        )}

        {/* Pricing */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-end gap-1.5 sm:gap-2">
            <span className="font-display text-lg sm:text-3xl text-gold leading-none">
              ₹{parseFloat(product.discounted_price).toLocaleString('en-IN')}
            </span>
            <span className="price-original text-[10px] sm:text-xs mb-0.5">
              ₹{parseFloat(product.original_price).toLocaleString('en-IN')}
            </span>
          </div>
          {hasUsd && (
            <p className="text-blue-400 text-[9px] sm:text-xs mt-1 flex items-center gap-1">
              <Globe className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
              <span className="hidden sm:inline">Also available at</span> ${parseFloat(product.price_usd!).toFixed(2)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col xl:flex-row xl:grid xl:grid-cols-2 gap-2">
          <button
            onClick={handleAddToCart}
            className={`py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 border transition-all ${inCart
              ? 'border-green-500/30 text-green-400 bg-green-500/8 hover:bg-green-500/15'
              : 'border-white/8 text-gray-400 hover:text-gold hover:border-gold/25 hover:bg-gold/5'
              }`}
          >
            <ShoppingCart className="w-3 h-3" />
            <span className="hidden sm:inline">{inCart ? 'In Cart ✓' : 'Add to Cart'}</span>
            <span className="inline sm:hidden">{inCart ? 'Added' : 'Add'}</span>
          </button>
          <Link href={`/products/${product.slug}`} className="w-full">
            <button className="w-full py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black flex items-center justify-center gap-1 sm:gap-1.5 transition-all text-black"
              style={{ background: 'linear-gradient(135deg,#FFD700,#F5A623)' }}>
              Buy Now
              <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>
          </Link>
        </div>
      </div>

      {/* Bottom glow on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/0 to-transparent group-hover:via-gold/30 transition-all duration-500" />
    </div>
  );
}
