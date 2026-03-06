'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AdminSidebar from '@/components/AdminSidebar';
import toast from 'react-hot-toast';
import {
  Plus, Edit2, Trash2, Copy, Share2, Eye, EyeOff,
  ExternalLink, MessageCircle, Facebook, Package, Search, RefreshCw,
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  original_price: string;
  discounted_price: string;
  image_url: string;
  slug: string;
  drive_link: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [shareProduct, setShareProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);

  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_BASE_URL || '');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      if (res.status === 401) { router.push('/admin/login'); return; }
      const data = await res.json();
      setProducts(data.products || []);
      setFiltered(data.products || []);
    } catch { router.push('/admin/login'); }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    if (!search) { setFiltered(products); return; }
    const s = search.toLowerCase();
    setFiltered(products.filter(p =>
      p.name.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s)
    ));
  }, [search, products]);

  const copyLink = (product: Product) => {
    navigator.clipboard.writeText(`${baseUrl}/products/${product.slug}`);
    toast.success('Product link copied!');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product deleted');
        setProducts(prev => prev.filter(p => p.id !== deleteId));
      } else {
        toast.error('Failed to delete');
      }
    } catch {
      toast.error('Error deleting product');
    }
    setDeleting(false);
    setDeleteId(null);
  };

  const toggleActive = async (product: Product) => {
    setToggling(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !product.is_active }),
      });
      if (res.ok) {
        setProducts(prev => prev.map(p =>
          p.id === product.id ? { ...p, is_active: !p.is_active } : p
        ));
        toast.success(product.is_active ? 'Product hidden' : 'Product published');
      }
    } catch { toast.error('Toggle failed'); }
    setToggling(null);
  };

  const discount = (orig: string, disc: string) =>
    Math.round(((parseFloat(orig) - parseFloat(disc)) / parseFloat(orig)) * 100);

  return (
    <div className="flex min-h-screen bg-dark">
      <AdminSidebar />
      <main className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl text-white">PRODUCTS</h1>
            <p className="text-gray-500 text-sm mt-1">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchProducts}
              className="text-gray-400 hover:text-gold transition-colors border border-white/10 rounded-xl p-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link href="/admin/products/add">
              <button className="btn-gold flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm">
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-dark pl-9 text-sm"
          />
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-dark-2 rounded-2xl overflow-hidden border border-white/5 animate-pulse h-80" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No products yet.</p>
            <Link href="/admin/products/add">
              <button className="btn-gold mt-4 px-6 py-3 rounded-xl font-bold text-sm">
                Add Your First Product
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(product => {
              const disc = discount(product.original_price, product.discounted_price);
              return (
                <div
                  key={product.id}
                  className={`bg-dark-2 border rounded-2xl overflow-hidden transition-all duration-300 ${product.is_active ? 'border-white/5 hover:border-gold/20' : 'border-red-500/10 opacity-60'
                    }`}
                >
                  {/* Image */}
                  <div className="relative aspect-video bg-dark-3">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {disc > 0 && (
                        <span className="bg-gold text-black text-xs font-black px-2 py-0.5 rounded-lg">
                          -{disc}% OFF
                        </span>
                      )}
                      {!product.is_active && (
                        <span className="bg-red-500/80 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                          Hidden
                        </span>
                      )}
                    </div>
                    {/* View on store */}
                    <Link
                      href={`/products/${product.slug}`}
                      target="_blank"
                      className="absolute top-2 right-2 bg-dark/70 hover:bg-dark backdrop-blur-sm rounded-lg p-1.5 text-gray-300 hover:text-gold transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-display text-xl text-white mb-1 leading-tight truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-gold">
                        ₹{parseFloat(product.discounted_price).toLocaleString('en-IN')}
                      </span>
                      <span className="price-original text-xs">
                        ₹{parseFloat(product.original_price).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {/* Copy Link */}
                      <button
                        onClick={() => copyLink(product)}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-white/10 hover:border-gold/30 text-gray-400 hover:text-gold transition-all text-xs font-medium"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy Link
                      </button>
                      {/* Share */}
                      <button
                        onClick={() => setShareProduct(product)}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-white/10 hover:border-blue-400/30 text-gray-400 hover:text-blue-400 transition-all text-xs font-medium"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Share
                      </button>
                      {/* Edit */}
                      <Link href={`/admin/products/edit/${product.id}`} className="block">
                        <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-white/10 hover:border-yellow-400/30 text-gray-400 hover:text-yellow-400 transition-all text-xs font-medium">
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      </Link>
                      {/* Toggle Active */}
                      <button
                        onClick={() => toggleActive(product)}
                        disabled={toggling === product.id}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border transition-all text-xs font-medium disabled:opacity-50 ${product.is_active
                            ? 'border-green-500/20 text-green-400 hover:border-red-500/30 hover:text-red-400'
                            : 'border-white/10 text-gray-400 hover:border-green-500/30 hover:text-green-400'
                          }`}
                      >
                        {toggling === product.id ? (
                          <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                        ) : product.is_active ? (
                          <><Eye className="w-3.5 h-3.5" /> Active</>
                        ) : (
                          <><EyeOff className="w-3.5 h-3.5" /> Hidden</>
                        )}
                      </button>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => setDeleteId(product.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-red-500/10 hover:border-red-500/30 text-red-500/50 hover:text-red-400 transition-all text-xs font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Product
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-dark-2 border border-white/10 rounded-2xl p-8 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="font-display text-2xl text-white text-center mb-2">DELETE PRODUCT?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              This action cannot be undone. The product will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-dark-2 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-display text-2xl text-white mb-1">SHARE PRODUCT</h3>
            <p className="text-gray-500 text-xs mb-4 truncate">{shareProduct.name}</p>

            {/* URL Display */}
            <div className="bg-dark-3 border border-white/5 rounded-xl p-3 mb-4 flex items-center gap-2">
              <span className="text-gray-400 text-xs truncate flex-1">
                {baseUrl}/products/{shareProduct.slug}
              </span>
              <button
                onClick={() => { copyLink(shareProduct); setShareProduct(null); }}
                className="text-gold hover:text-gold-light flex-shrink-0"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {/* Share Options */}
            <div className="space-y-2 mb-4">
              <button
                onClick={() => {
                  const text = `Check out *${shareProduct.name}*!\n\nBuy now at just ₹${parseFloat(shareProduct.discounted_price).toLocaleString('en-IN')} (₹${parseFloat(shareProduct.original_price).toLocaleString('en-IN')} original)\n\n${baseUrl}/products/${shareProduct.slug}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  setShareProduct(null);
                }}
                className="w-full flex items-center gap-3 py-3 px-4 rounded-xl bg-green-500/10 border border-green-500/20 hover:border-green-500/40 text-green-400 transition-all text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                Share on WhatsApp
              </button>
              <button
                onClick={() => {
                  const url = `${baseUrl}/products/${shareProduct.slug}`;
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                  setShareProduct(null);
                }}
                className="w-full flex items-center gap-3 py-3 px-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 transition-all text-sm font-medium"
              >
                <Facebook className="w-4 h-4" />
                Share on Facebook
              </button>
            </div>

            <button
              onClick={() => setShareProduct(null)}
              className="w-full py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
