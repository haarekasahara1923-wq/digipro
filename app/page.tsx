'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Zap, Shield, Star, ArrowRight, Sparkles } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  original_price: string;
  discounted_price: string;
  image_url: string;
  slug: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digital Store';
  const tagline = process.env.NEXT_PUBLIC_STORE_TAGLINE || 'Premium Digital Products';

  useEffect(() => {
    // Init DB on first load (idempotent)
    fetch('/api/init').catch(() => {});

    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const discount = (orig: string, disc: string) => {
    const o = parseFloat(orig), d = parseFloat(disc);
    return Math.round(((o - d) / o) * 100);
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <span className="font-display text-2xl text-white tracking-wider">{storeName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Shield className="w-4 h-4 text-gold" />
            <span>Secure Payments</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-2 mb-6">
            <Star className="w-3 h-3 text-gold fill-gold" />
            <span className="text-gold text-sm font-medium">Premium Quality Products</span>
            <Star className="w-3 h-3 text-gold fill-gold" />
          </div>

          <h1 className="font-display text-6xl sm:text-8xl text-gold-gradient mb-6 leading-none">
            {tagline.split(' ').slice(0, 2).join(' ')}
            <br />
            <span className="text-white">{tagline.split(' ').slice(2).join(' ') || 'Products'}</span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Instant delivery to your Email & WhatsApp after payment. 
            No waiting, no hassle — just pure value.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            {[
              { icon: Zap, text: 'Instant Delivery' },
              { icon: Shield, text: 'Secure Payment' },
              { icon: ShoppingBag, text: '100% Digital' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-gold" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="font-display text-4xl sm:text-5xl text-white">
            ALL <span className="text-gold">PRODUCTS</span>
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent ml-8" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-dark-3 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-dark-4" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-dark-4 rounded w-3/4" />
                  <div className="h-4 bg-dark-4 rounded w-1/2" />
                  <div className="h-10 bg-dark-4 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 text-gray-600">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">No products yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} discount={discount} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        <p className="mt-1">Secure payments powered by Razorpay</p>
      </footer>
    </div>
  );
}

function ProductCard({ product, index, discount }: {
  product: Product;
  index: number;
  discount: (o: string, d: string) => number;
}) {
  const disc = discount(product.original_price, product.discounted_price);

  return (
    <div
      className="group bg-dark-2 border border-white/5 rounded-2xl overflow-hidden hover:border-gold/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gold/10"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-dark-3">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Discount badge */}
        {disc > 0 && (
          <div className="absolute top-3 right-3 bg-gold text-black text-xs font-black px-2 py-1 rounded-lg">
            -{disc}% OFF
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-2 via-transparent to-transparent opacity-60" />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-display text-2xl text-white mb-2 leading-tight group-hover:text-gold transition-colors">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Pricing */}
        <div className="flex items-end gap-3 mb-5">
          <span className="font-display text-3xl text-gold">
            ₹{parseFloat(product.discounted_price).toLocaleString('en-IN')}
          </span>
          <span className="price-original text-sm mb-1">
            ₹{parseFloat(product.original_price).toLocaleString('en-IN')}
          </span>
        </div>

        <Link href={`/products/${product.slug}`} className="block">
          <button className="btn-gold w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 uppercase tracking-wider">
            View & Buy
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}
