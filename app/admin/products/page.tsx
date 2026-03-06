'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Copy, Share2, ToggleLeft, ToggleRight, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/products');
    if (res.status === 401) { router.push('/admin/login'); return; }
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const deleteProduct = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Product deleted');
      setProducts(p => p.filter(x => x.id !== id));
    } else {
      toast.error('Delete failed');
    }
    setDeleting(null);
  };

  const toggleActive = async (product: any) => {
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !product.is_active }),
    });
    if (res.ok) {
      toast.success(product.is_active ? 'Product hidden' : 'Product visible');
      setProducts(p => p.map(x => x.id === product.id ? { ...x, is_active: !x.is_active } : x));
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/products/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Product link copied!');
  };

  const shareWhatsApp = (product: any) => {
    const url = `${window.location.origin}/products/${product.slug}`;
    const text = `🔥 Check out this amazing digital product!\n\n*${product.name}*\n\n💰 Only ₹${parseFloat(product.discounted_price).toLocaleString('en-IN')} (was ₹${parseFloat(product.original_price).toLocaleString('en-IN')})\n\n👉 ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="flex min-h-screen bg-dark">
      <AdminSidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl text-white">PRODUCTS</h1>
            <p className="text-gray-500 text-sm mt-1">{products.length} products total</p>
          </div>
          <Link href="/admin/products/add">
            <button className="btn-gold px-5 py-3 rounded-xl font-bold flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-dark-2 rounded-2xl h-24 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <p className="text-xl mb-4">No products yet</p>
            <Link href="/admin/products/add">
              <button className="btn-gold px-6 py-3 rounded-xl font-bold">Add First Product</button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map(product => (
              <div key={product.id} className={`bg-dark-2 border rounded-2xl p-4 flex items-center gap-4 transition-all ${
                product.is_active ? 'border-white/5' : 'border-white/5 opacity-60'
              }`}>
                {/* Image */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-dark-3">
                  <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white text-sm truncate">{product.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      product.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {product.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gold font-bold">₹{parseFloat(product.discounted_price).toLocaleString('en-IN')}</span>
                    <span className="price-original text-xs">₹{parseFloat(product.original_price).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => copyLink(product.slug)}
                    className="p-2 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10 transition-all"
                    title="Copy product link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => shareWhatsApp(product)}
                    className="p-2 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-400/10 transition-all"
                    title="Share on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleActive(product)}
                    className={`p-2 rounded-lg transition-all ${
                      product.is_active
                        ? 'text-green-400 hover:bg-green-400/10'
                        : 'text-gray-500 hover:bg-white/5'
                    }`}
                    title={product.is_active ? 'Hide product' : 'Show product'}
                  >
                    {product.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <Link href={`/admin/products/edit/${product.id}`}>
                    <button className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                  </Link>
                  <button
                    onClick={() => deleteProduct(product.id, product.name)}
                    disabled={deleting === product.id}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-30"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
