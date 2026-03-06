'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import toast from 'react-hot-toast';
import { Upload, Image as ImageIcon, Link, Save, X, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function AddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    original_price: '',
    discounted_price: '',
    drive_link: '',
    image_url: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setForm(prev => ({ ...prev, image_url: '' }));
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return form.image_url;

    const fd = new FormData();
    fd.append('file', imageFile);
    fd.append('type', 'image');

    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data.url;
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Product name required'); return; }
    if (!form.original_price || !form.discounted_price) { toast.error('Prices required'); return; }
    if (!form.drive_link.trim()) { toast.error('Google Drive link required'); return; }
    if (!imageFile && !form.image_url) { toast.error('Product image required'); return; }

    setSaving(true);
    try {
      setUploading(true);
      const imageUrl = await uploadImage();
      setUploading(false);

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, image_url: imageUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Product added successfully!');
      router.push('/admin/products');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
      setUploading(false);
    }
    setSaving(false);
  };

  const saving_ = saving || uploading;

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
              <h1 className="font-display text-4xl text-white">ADD PRODUCT</h1>
              <p className="text-gray-500 text-sm">Create a new digital product listing</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Image upload */}
            <div className="bg-dark-2 border border-white/5 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gold" />
                Product Image *
              </h3>

              {(imagePreview || form.image_url) ? (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-dark-3 mb-4">
                  <Image
                    src={imagePreview || form.image_url}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(''); setForm(p => ({ ...p, image_url: '' })); }}
                    className="absolute top-2 right-2 bg-red-500 rounded-full p-1"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video rounded-xl border-2 border-dashed border-white/10 hover:border-gold/30 flex flex-col items-center justify-center cursor-pointer transition-all mb-4 bg-dark-3 hover:bg-dark-3/80"
                >
                  <Upload className="w-8 h-8 text-gray-500 mb-2" />
                  <p className="text-gray-400 text-sm font-medium">Click to upload image</p>
                  <p className="text-gray-600 text-xs mt-1">JPG, PNG, WebP • Max 10MB</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gold transition-colors border border-white/10 hover:border-gold/30 rounded-lg px-3 py-2"
              >
                <Upload className="w-3 h-3" />
                {imageFile ? 'Change image' : 'Upload from device'}
              </button>
            </div>

            {/* Product details */}
            <div className="bg-dark-2 border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="text-white font-semibold mb-2">Product Details</h3>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Complete Digital Marketing Course"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  placeholder="Describe what's included in this product..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="input-dark resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Original Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="1999"
                    value={form.original_price}
                    onChange={e => setForm({ ...form, original_price: e.target.value })}
                    className="input-dark"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Discounted Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="499"
                    value={form.discounted_price}
                    onChange={e => setForm({ ...form, discounted_price: e.target.value })}
                    className="input-dark"
                    min="0"
                  />
                </div>
              </div>

              {form.original_price && form.discounted_price && (
                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3 text-sm text-green-400">
                  Discount: {Math.round(((parseFloat(form.original_price) - parseFloat(form.discounted_price)) / parseFloat(form.original_price)) * 100)}% OFF
                  — Customer saves ₹{(parseFloat(form.original_price) - parseFloat(form.discounted_price)).toLocaleString('en-IN')}
                </div>
              )}
            </div>

            {/* Drive link */}
            <div className="bg-dark-2 border border-white/5 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Link className="w-4 h-4 text-gold" />
                Google Drive Delivery Link *
              </h3>
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/..."
                value={form.drive_link}
                onChange={e => setForm({ ...form, drive_link: e.target.value })}
                className="input-dark"
              />
              <p className="text-xs text-gray-600 mt-2">
                This link is sent to buyers ONLY after successful payment verification
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving_}
                className="btn-gold flex-1 py-4 rounded-xl font-black uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving_ ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    {uploading ? 'Uploading image...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Product
                  </>
                )}
              </button>
              <button
                onClick={() => router.back()}
                className="px-6 py-4 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
