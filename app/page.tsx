'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Zap, Shield, Star, ArrowRight, Sparkles, ShoppingCart, Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

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
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digipro';
  const tagline = process.env.NEXT_PUBLIC_STORE_TAGLINE || 'Premium Digital Products';

  useEffect(() => {
    fetch('/api/init').catch(() => { });
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { setProducts(data.products || []); setFiltered(data.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(products); return; }
    const q = search.toLowerCase();
    setFiltered(products.filter(p =>
      p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    ));
  }, [search, products]);

  const discount = (orig: string, disc: string) =>
    Math.round(((parseFloat(orig) - parseFloat(disc)) / parseFloat(orig)) * 100);

  return (
    <div className="min-h-screen bg-dark">
      <Header />

      {/* Hero */}
      <section className="pt-36 pb-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gold/4 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-40 right-10 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/15 rounded-full px-4 py-2 mb-8">
            <Star className="w-3 h-3 text-gold fill-gold" />
            <span className="text-gold text-xs font-semibold tracking-wide">PREMIUM QUALITY · INSTANT DELIVERY</span>
            <Star className="w-3 h-3 text-gold fill-gold" />
          </div>

          <h1 className="font-display text-6xl sm:text-8xl lg:text-9xl mb-6 leading-none">
            <span className="text-gold-gradient">{tagline.split(' ').slice(0, 1).join(' ')}</span>
            <br />
            <span className="text-white">{tagline.split(' ').slice(1).join(' ')}</span>
          </h1>

          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Instant delivery to your Email &amp; WhatsApp after payment.
            No waiting, no hassle — just pure value.
          </p>

          {/* Inline search bar */}
          <div className="max-w-lg mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-dark pl-11 pr-4 py-4 rounded-2xl text-sm w-full border-white/10 focus:border-gold/50"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            {[
              { icon: Zap, text: 'Instant Delivery' },
              { icon: Shield, text: 'Secure Payment' },
              { icon: ShoppingBag, text: '100% Digital' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-gold" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl text-white">
              {search ? 'SEARCH ' : 'ALL '}<span className="text-gold">PRODUCTS</span>
            </h2>
            {search && (
              <p className="text-gray-600 text-sm mt-1">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
              </p>
            )}
          </div>
          {!search && <div className="h-px flex-1 bg-gradient-to-r from-gold/20 to-transparent ml-8" />}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-dark-2 rounded-2xl overflow-hidden border border-white/5 animate-pulse">
                <div className="aspect-[4/3] bg-dark-3" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-dark-3 rounded w-3/4" />
                  <div className="h-4 bg-dark-3 rounded w-1/2" />
                  <div className="h-10 bg-dark-3 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-700" />
            <p className="text-xl text-gray-600">
              {search ? `No products found for "${search}"` : 'No products yet. Check back soon!'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="mt-4 text-gold text-sm hover:text-gold-light transition-colors">
                Clear search →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} discount={discount} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function ProductCard({ product, index, discount }: {
  product: Product;
  index: number;
  discount: (o: string, d: string) => number;
}) {
  const { addItem, isInCart, openCart } = useCart();
  const disc = discount(product.original_price, product.discounted_price);
  const inCart = isInCart(product.slug);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCart) { openCart(); return; }
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: parseFloat(product.discounted_price),
      originalPrice: parseFloat(product.original_price),
      image_url: product.image_url,
    });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div
      className="group bg-dark-2 border border-white/5 rounded-2xl overflow-hidden hover:border-gold/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gold/8 flex flex-col"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-dark-3 flex-shrink-0">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {disc > 0 && (
          <div className="absolute top-3 right-3 bg-gold text-black text-xs font-black px-2 py-1 rounded-lg shadow-sm">
            -{disc}% OFF
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-2 via-transparent to-transparent opacity-60" />
        {/* Quick add badge */}
        {inCart && (
          <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            In Cart ✓
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display text-xl text-white mb-2 leading-tight group-hover:text-gold transition-colors line-clamp-2">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed flex-1">
            {product.description}
          </p>
        )}

        {/* Pricing */}
        <div className="flex items-end gap-2 mb-4">
          <span className="font-display text-3xl text-gold">
            ₹{parseFloat(product.discounted_price).toLocaleString('en-IN')}
          </span>
          <span className="price-original text-sm mb-0.5">
            ₹{parseFloat(product.original_price).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleAddToCart}
            className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${inCart
                ? 'border-green-500/30 text-green-400 bg-green-500/10 hover:bg-green-500/20'
                : 'border-white/10 text-gray-300 hover:text-gold hover:border-gold/30 hover:bg-gold/5'
              }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {inCart ? 'In Cart' : 'Add to Cart'}
          </button>
          <Link href={`/products/${product.slug}`}>
            <button className="btn-gold w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
              Buy Now
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
