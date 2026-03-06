'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Upload, X } from 'lucide-react';
import Image from 'next/image';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '', description: '', original_price: '', discounted_price: '', drive_link: '', image_url: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.product) {
          const p = data.product;
          setForm({
            name: p.name,
            description: p.description || '',
            original_price: p.original_price,
            discounted_price: p.discounted_price,
            drive_link: p.drive_link,
            image_url: p.image_url,
          });
        }
        setLoading(false);
      });
  }, [id]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name || !form.original_price || !form.discounted_price || !form.drive_link) {
      toast.error('Fill all required fields'); return;
    }
    setSaving(true);
    try {
      let imageUrl = form.image_url;
      if (imageFile) {
        const fd = new FormData();
        fd.append('file', imageFile);
        fd.append('type', 'image');
        const up = await fetch('/api/upload', { method: 'POST', body: fd });
        const upData = await up.json();
        if (!up.ok) throw new Error(upData.error);
        imageUrl = upData.url;
      }

      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, image_url: imageUrl }),
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success('Product updated!');
      router.push('/admin/products');
    } catch (err: any) {
      toast.error(err.message);
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
            <h1 className="font-display text-4xl text-white">EDIT PRODUCT</h1>
          </div>

          <div className="space-y-6">
            {/* Image */}
            <div className="bg-dark-2 border border-white/5 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Product Image</h3>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-dark-3 mb-4">
                <Image src={imagePreview || form.image_url} alt="Product" fill className="object-cover" />
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gold border border-white/10 hover:border-gold/30 rounded-lg px-3 py-2 transition-all">
                <Upload className="w-3 h-3" />
                Change image
              </button>
            </div>

            {/* Details */}
            <div className="bg-dark-2 border border-white/5 rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Product Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-dark" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="input-dark resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Original Price (₹) *</label>
                  <input type="number" value={form.original_price} onChange={e => setForm({ ...form, original_price: e.target.value })} className="input-dark" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Discounted Price (₹) *</label>
                  <input type="number" value={form.discounted_price} onChange={e => setForm({ ...form, discounted_price: e.target.value })} className="input-dark" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Google Drive Link *</label>
                <input type="url" value={form.drive_link} onChange={e => setForm({ ...form, drive_link: e.target.value })} className="input-dark" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="btn-gold flex-1 py-4 rounded-xl font-black uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Changes</>}
              </button>
              <button onClick={() => router.back()} className="px-6 py-4 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-all">Cancel</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
