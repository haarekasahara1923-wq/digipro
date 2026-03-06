'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Lock, Mail, Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digital Store';

  const handleLogin = async () => {
    if (!form.email.trim()) {
      toast.error('Enter your admin email');
      return;
    }
    if (!form.password) {
      toast.error('Enter your password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Welcome back! 👋');
        router.push('/admin/dashboard');
      } else {
        toast.error(data.error || 'Invalid credentials');
      }
    } catch {
      toast.error('Something went wrong. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      {/* Background glows */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/4 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/4 right-1/4 w-[300px] h-[300px] bg-blue-500/3 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-gold to-gold-dark rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-gold/20">
            <Sparkles className="w-8 h-8 text-black" />
          </div>
          <h1 className="font-display text-5xl text-white mb-2 tracking-wide">
            {storeName.toUpperCase()}
          </h1>
          <p className="text-gray-500 text-sm">Admin Panel · Secure Access</p>
        </div>

        {/* Card */}
        <div className="bg-dark-2 border border-white/8 rounded-2xl p-8 shadow-2xl">
          {/* Security badge */}
          <div className="flex items-center gap-2 bg-gold/5 border border-gold/15 rounded-xl px-4 py-3 mb-7">
            <ShieldCheck className="w-4 h-4 text-gold flex-shrink-0" />
            <p className="text-gold/80 text-xs">Secured admin login — credentials from environment</p>
          </div>

          <div className="space-y-5">
            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 mb-2.5">
                <Mail className="w-3.5 h-3.5 text-gold" />
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                placeholder="Enter admin email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-dark"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 mb-2.5">
                <Lock className="w-3.5 h-3.5 text-gold" />
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-dark pr-12"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="btn-gold w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                'Login to Admin Panel'
              )}
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-700 mt-6">
          Use the credentials set in your Vercel environment variables.
        </p>
      </div>
    </div>
  );
}
