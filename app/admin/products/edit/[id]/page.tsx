'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Upload, Plus, Trash2, Gift, Zap } from 'lucide-react';
import Image from 'next/image';

interface BonusLink { title: string; url: string; }
interface Product {
  id: number; name: string; description: string;
  original_price: string; discounted_price: string;
  drive_link: string; image_url: string;
  bonus_links: BonusLink[] | null;
  order_bump_product_id: number | null;
  order_bump_price: string | null;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '', description: '', original_price: '', discounted_price: '',
    drive_link: '', image_url: '',
    order_bump_product_id: '', order_bump_price: '',
  });
  const [bonusLinks, setBonusLinks] = useState<BonusLink[]>([]);
  const [allProducts, setAllProducts] = useState<{ id: number; name: string }[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Fetch current product
    fetch(`/api/admin/products/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.product) {
          const p: Product = data.product;
          setForm({
            name: p.name,
            description: p.description || '',
            original_price: p.original_price,
            discounted_price: p.discounted_price,
            drive_link: p.drive_link,
            image_url: p.image_url,
            order_bump_product_id: p.order_bump_product_id ? String(p.order_bump_product_id) : '',
            order_bump_price: p.order_bump_price || '',
          });
          setBonusLinks(Array.isArray(p.bonus_links) ? p.bonus_links : []);
        }
        setLoading(false);
      })
      .catch(() => { setLoading(false); router.push('/admin/login'); });

    // Fetch all products for bump selector
    fetch('/api/admin/products')
      .then(r => r.json())
      .then(d => setAllProducts((d.products || []).filter((p: any) => String(p.id) !== id)));
  }, [id]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadNewImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', imageFile);
      fd.append('type', 'image');
      const up = await fetch('/api/upload', { method: 'POST', body: fd });
      const upData = await up.json();
      if (!up.ok) throw new Error(upData.error || 'Upload failed');
      return upData.url;
    } catch (e: any) {
      toast.error(e.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const addBonusLink = () => setBonusLinks(prev => [...prev, { title: '', url: '' }]);
  const removeBonusLink = (i: number) => setBonusLinks(prev => prev.filter((_, idx) => idx !== i));
  const updateBonusLink = (i: number, key: keyof BonusLink, val: string) =>
    setBonusLinks(prev => prev.map((b, idx) => idx === i ? { ...b, [key]: val } : b));

  const handleSave = async () => {
    if (!form.name || !form.original_price || !form.discounted_price || !form.drive_link) {
      toast.error('Fill all required fields'); return;
    }
    setSaving(true);
    try {
      let imageUrl = form.image_url;
      if (imageFile) {
        const newUrl = await uploadNewImage();
        if (!newUrl) { setSaving(false); return; }
        imageUrl = newUrl;
      }

      const validBonusLinks = bonusLinks.filter(b => b.title.trim() && b.url.trim());

      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          image_url: imageUrl,
          bonus_links: validBonusLinks,
          order_bump_product_id: form.order_bump_product_id ? parseInt(form.order_bump_product_id) : null,
          order_bump_price: form.order_bump_price ? parseFloat(form.order_bump_price) : null,
          original_price: parseFloat(form.original_price),
          discounted_price: parseFloat(form.discounted_price),
        }),
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success('Product updated!');
      router.push('/admin/products');
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="flex min-h-screen bg-dark">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 flex items-center justify-center pt-14 md:pt-0">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-dark">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-6 md:p-8 pt-20 md:pt-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => router.back()} className="text-gray-500 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display text-4xl text-white">EDIT PRODUCT</h1>
              <p className="text-gray-500 text-sm">Update product details</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Image */}
            <div className="bg-dark-2 border border-white/5 rounded-2xl p-6">
              <h3 className="font-display text-xl text-white mb-4">PRODUCT IMAGE</h3>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-dark-3 mb-4 group">
                <Image
                  src={imagePreview || form.image_url}
                  alt="Product"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Click button below to change</span>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gold border border-white/10 hover:border-gold/30 rounded-xl px-4 py-2.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                {imageFile ? 'Change selection' : 'Change image'}
              </button>
              {imageFile && (
                <p className="text-xs text-gold mt-2">✓ New image selected — will upload on save</p>
              )}
            </div>

            {/* Basic Details */}
            <div className="bg-dark-2 border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="font-display text-xl text-white border-b border-white/5 pb-3">BASIC INFO</h3>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Product Name *</label>
                <input type="text" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} className="input-dark" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={4} className="input-dark resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Original Price (₹) *</label>
                  <input type="number" value={form.original_price}
                    onChange={e => setForm({ ...form, original_price: e.target.value })} className="input-dark" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Selling Price (₹) *</label>
                  <input type="number" value={form.discounted_price}
                    onChange={e => setForm({ ...form, discounted_price: e.target.value })} className="input-dark" />
                </div>
              </div>
              {form.original_price && form.discounted_price && (
                <div className="bg-gold/5 border border-gold/15 rounded-xl px-4 py-2 text-xs text-gold">
                  Discount: {Math.round(((parseFloat(form.original_price) - parseFloat(form.discounted_price)) / parseFloat(form.original_price)) * 100)}% OFF
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Google Drive / Download Link *</label>
                <input type="url" value={form.drive_link}
                  onChange={e => setForm({ ...form, drive_link: e.target.value })} className="input-dark" />
                <p className="text-gray-600 text-xs mt-1">Delivered to buyer after payment</p>
              </div>
            </div>

            {/* Bonus Links */}
            <div className="bg-dark-2 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="font-display text-xl text-white flex items-center gap-2">
                  <Gift className="w-4 h-4 text-gold" /> FREE BONUSES
                  <span className="text-gray-600 text-sm font-sans font-normal">(Optional)</span>
                </h3>
                <button onClick={addBonusLink}
                  className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-light border border-gold/20 hover:border-gold/40 rounded-lg px-3 py-1.5 transition-all">
                  <Plus className="w-3 h-3" /> Add Bonus
                </button>
              </div>
              {bonusLinks.length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-3">No bonus links. Click "Add Bonus" to add free extras.</p>
              ) : (
                <div className="space-y-3">
                  {bonusLinks.map((b, i) => (
                    <div key={i} className="flex gap-3 items-start p-3 bg-dark-3 rounded-xl border border-white/5">
                      <div className="flex-1 space-y-2">
                        <input type="text" placeholder={`Bonus ${i + 1} title`}
                          value={b.title} onChange={e => updateBonusLink(i, 'title', e.target.value)}
                          className="input-dark text-sm py-2" />
                        <input type="url" placeholder="https://drive.google.com/..."
                          value={b.url} onChange={e => updateBonusLink(i, 'url', e.target.value)}
                          className="input-dark text-sm py-2" />
                      </div>
                      <button onClick={() => removeBonusLink(i)}
                        className="text-gray-600 hover:text-red-400 transition-colors p-1 mt-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Bump */}
            <div className="bg-dark-2 border border-gold/10 rounded-2xl p-6 space-y-4">
              <div className="border-b border-white/5 pb-3">
                <h3 className="font-display text-xl text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gold" /> ORDER BUMP
                  <span className="text-gray-600 text-sm font-sans font-normal">(Optional)</span>
                </h3>
                <p className="text-gray-600 text-xs mt-1">Show a special combo offer to buyers on the product page</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Bump Product</label>
                <select value={form.order_bump_product_id}
                  onChange={e => setForm({ ...form, order_bump_product_id: e.target.value })}
                  className="input-dark">
                  <option value="">-- No order bump --</option>
                  {allProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              {form.order_bump_product_id && (
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Special Bump Price (₹)</label>
                  <input type="number" placeholder="e.g. 199"
                    value={form.order_bump_price}
                    onChange={e => setForm({ ...form, order_bump_price: e.target.value })}
                    className="input-dark" />
                  <p className="text-gray-600 text-xs mt-1.5">
                    Buyers see: "Add [product] for just ₹{form.order_bump_price || '?'} more!"
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving || uploading}
                className="btn-gold flex-1 py-4 rounded-xl font-black uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2">
                {(saving || uploading) ? (
                  <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    {uploading ? 'Uploading...' : 'Saving...'}</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Changes</>
                )}
              </button>
              <button onClick={() => router.back()}
                className="px-6 py-4 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
