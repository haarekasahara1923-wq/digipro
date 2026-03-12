'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Logged in successfully!');
      router.push(redirect);
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-md bg-dark-2 border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl text-white mb-2">Welcome Back</h1>
            <p className="text-gray-500 text-sm">Login to access your membership benefits</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-xs text-gray-500 mb-2 block uppercase tracking-wider font-bold">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-dark-3 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:border-gold/50 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-2 block uppercase tracking-wider font-bold">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-dark-3 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:border-gold/50 transition-all outline-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gold text-black py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-gold-light transition-all active:scale-[0.98]"
            >
              {loading ? 'Logging in...' : <><LogIn className="w-4 h-4" /> Sign In</>}
            </button>
          </form>

          <div className="mt-8 text-center pt-8 border-t border-white/5">
            <p className="text-gray-500 text-sm">
              Don't have an account? {' '}
              <Link href={`/register?redirect=${redirect}`} className="text-gold hover:underline">Create Account</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
