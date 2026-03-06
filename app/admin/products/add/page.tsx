'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, Plus, Trash2, Gift, Zap, Image as ImageIcon } from 'lucide-react';

interface Product { id: number; name: string; }
interface BonusLink { title: string; url: string; }

export default function AddProductPage() {
  const router = useRouter();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    name: '', description: '', original_price: '', discounted_price: '',
    drive_link: '', order_bump_product_id: '', order_bump_price: '', order_bump_description: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bonusLinks, setBonusLinks] = useState<BonusLink[]>([]);

  useEffect(() => {
    fetch('/api/admin/products')
      .then(r => r.json())
      .then(d => setAllProducts(d.products || []))
      .catch(() => router.push('/admin/login'));
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setUploadedImageUrl(null);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!image) return null;
    if (uploadedImageUrl) return uploadedImageUrl;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', image);
      fd.append('type', 'image');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setUploadedImageUrl(data.url);
      return data.url;
    } catch (e: any) {
      toast.error(e.message || 'Image upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const addBonusLink = () => setBonusLinks(prev => [...prev, { title: '', url: '' }]);
  const removeBonusLink = (i: number) => setBonusLinks(prev => prev.filter((_, idx) => idx !== i));
  const updateBonusLink = (i: number, key: keyof BonusLink, val: string) => {
    setBonusLinks(prev => prev.map((b, idx) => idx === i ? { ...b, [key]: val } : b));
  };

  const handleSave = async () => {
    if (!form.name || !form.original_price || !form.discounted_price || !form.drive_link) {
      toast.error('Fill all required fields'); return;
    }
    if (!image && !uploadedImageUrl) { toast.error('Upload a product image'); return; }

    setSaving(true);
    try {
      let imageUrl = uploadedImageUrl;
      if (!imageUrl) {
        imageUrl = await uploadImage();
        if (!imageUrl) { setSaving(false); return; }
      }

      const validBonusLinks = bonusLinks.filter(b => b.title && b.url);

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          original_price: parseFloat(form.original_price),
          discounted_price: parseFloat(form.discounted_price),
          image_url: imageUrl,
          drive_link: form.drive_link,
          bonus_links: validBonusLinks,
          order_bump_product_id: form.order_bump_product_id ? parseInt(form.order_bump_product_id) : null,
          order_bump_price: form.order_bump_price ? parseFloat(form.order_bump_price) : null,
          order_bump_description: form.order_bump_description || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Product added!');
      router.push('/admin/products');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    }
    setSaving(false);
  };

  return (
    <div className="flex min-h-screen bg-dark">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-6 md:p-8 pt-20 md:pt-8">
        <div className="max-w-2xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => router.back()} className="text-gray-500 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display text-4xl text-white">ADD PRODUCT</h1>
              <p className="text-gray-500 text-sm">Fill in product details below</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-dark-2 border border-white/5 rounded-2xl p-6 space-y-4">
              <h2 className="font-display text-xl text-white border-b border-white/5 pb-3">BASIC INFO</h2>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Product Name *</label>
                <input type="text" placeholder="e.g. Complete Digital Marketing Course"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-dark" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Description</label>
                <textarea rows={4} placeholder="Describe what's included, who it's for, and the value..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input-dark resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Original Price (₹) *</label>
                  <input type="number" placeholder="e.g. 999"
                    value={form.original_price} onChange={e => setForm({ ...form, original_price: e.target.value })} className="input-dark" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Selling Price (₹) *</label>
                  <input type="number" placeholder="e.g. 499"
                    value={form.discounted_price} onChange={e => setForm({ ...form, discounted_price: e.target.value })} className="input-dark" />
                </div>
              </div>

              {form.original_price && form.discounted_price && (
                <div className="bg-gold/5 border border-gold/15 rounded-xl px-4 py-2 text-xs text-gold">
                  Discount: {Math.round(((parseFloat(form.original_price) - parseFloat(form.discounted_price)) / parseFloat(form.original_price)) * 100)}% OFF
                </div>
              )}
            </div>

            {/* Product Image */}
            <div className="bg-dark-2 border border-white/5 rounded-2xl p-6 space-y-4">
              <h2 className="font-display text-xl text-white border-b border-white/5 pb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> PRODUCT IMAGE *
              </h2>

              <label className={`block cursor-pointer border-2 border-dashed rounded-xl transition-all ${imagePreview ? 'border-gold/30' : 'border-white/10 hover:border-gold/20'
                }`}>
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full aspect-video object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm font-medium">Click to change</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Upload className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Click to upload product image</p>
                    <p className="text-gray-700 text-xs mt-1">JPG, PNG, WebP recommended</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              </label>

              {image && !uploadedImageUrl && (
                <button onClick={uploadImage} disabled={uploading}
                  className="btn-gold w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  {uploading ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload Image to Cloudinary</>}
                </button>
              )}
              {uploadedImageUrl && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2 text-xs text-green-400 flex items-center gap-2">
                  ✓ Image uploaded successfully
                </div>
              )}
            </div>

            {/* Delivery */}
            <div className="bg-dark-2 border border-white/5 rounded-2xl p-6 space-y-4">
              <h2 className="font-display text-xl text-white border-b border-white/5 pb-3">DELIVERY LINK</h2>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Google Drive / Download Link *</label>
                <input type="url" placeholder="https://drive.google.com/..."
                  value={form.drive_link} onChange={e => setForm({ ...form, drive_link: e.target.value })} className="input-dark" />
                <p className="text-gray-600 text-xs mt-1.5">This link will be sent to buyers after payment</p>
              </div>
            </div>

            {/* Bonus Links */}
            <div className="bg-dark-2 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h2 className="font-display text-xl text-white flex items-center gap-2">
                  <Gift className="w-4 h-4 text-gold" /> FREE BONUSES
                  <span className="text-gray-600 text-sm font-sans font-normal">(Optional)</span>
                </h2>
                <button onClick={addBonusLink}
                  className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-light border border-gold/20 hover:border-gold/40 rounded-lg px-3 py-1.5 transition-all">
                  <Plus className="w-3 h-3" /> Add Bonus
                </button>
              </div>

              {bonusLinks.length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-4">
                  No bonuses added. Click "Add Bonus" to include free extras for buyers.
                </p>
              ) : (
                <div className="space-y-3">
                  {bonusLinks.map((b, i) => (
                    <div key={i} className="flex gap-3 items-start p-3 bg-dark-3 rounded-xl border border-white/5">
                      <div className="flex-1 space-y-2">
                        <input type="text" placeholder={`Bonus ${i + 1} title (e.g. "Study Guide PDF")`}
                          value={b.title} onChange={e => updateBonusLink(i, 'title', e.target.value)}
                          className="input-dark text-sm py-2" />
                        <input type="url" placeholder="https://drive.google.com/..."
                          value={b.url} onChange={e => updateBonusLink(i, 'url', e.target.value)}
                          className="input-dark text-sm py-2" />
                      </div>
                      <button onClick={() => removeBonusLink(i)} className="text-gray-600 hover:text-red-400 transition-colors p-1 mt-1">
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
                <h2 className="font-display text-xl text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gold" /> ORDER BUMP
                  <span className="text-gray-600 text-sm font-sans font-normal">(Optional)</span>
                </h2>
                <p className="text-gray-600 text-xs mt-1">Show a special combo offer to buyers on the checkout page</p>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Bump Product (select another product)</label>
                <select
                  value={form.order_bump_product_id}
                  onChange={e => setForm({ ...form, order_bump_product_id: e.target.value })}
                  className="input-dark"
                >
                  <option value="">-- No order bump --</option>
                  {allProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {form.order_bump_product_id && (
                <>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Special Combo Price for Bump Product (₹) *</label>
                    <input type="number" placeholder="e.g. 199"
                      value={form.order_bump_price}
                      onChange={e => setForm({ ...form, order_bump_price: e.target.value })}
                      className="input-dark" />
                    <p className="text-gray-600 text-xs mt-1.5">Buyers see: "Add [bump product] for just ₹{form.order_bump_price || '?'} more!"</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Promotional Description for Bump Offer</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Perfect companion to this course — covers advanced topics you'll need!"
                      value={form.order_bump_description}
                      onChange={e => setForm({ ...form, order_bump_description: e.target.value })}
                      className="input-dark resize-none"
                    />
                    <p className="text-gray-600 text-xs mt-1">This text appears in the bump offer box on the product page to convince buyers</p>
                  </div>
                </>
              )}
            </div>

            {/* Save */}
            <button onClick={handleSave} disabled={saving || uploading}
              className="btn-gold w-full py-5 rounded-xl font-black uppercase tracking-wider text-base">
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : '📦 Save & Publish Product'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
