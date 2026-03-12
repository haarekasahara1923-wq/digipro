'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Phone, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', whatsapp: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Account created successfully!');
      router.push(redirect);
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
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
            <h1 className="font-display text-3xl text-white mb-2">Create Account</h1>
            <p className="text-gray-500 text-sm">Join to get exclusive membership benefits</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block uppercase tracking-wider font-bold">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input 
                  type="text" 
                  placeholder="John Doe"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-dark-3 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:border-gold/50 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1.5 block uppercase tracking-wider font-bold">Email Address</label>
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
              <label className="text-xs text-gray-500 mb-1.5 block uppercase tracking-wider font-bold">WhatsApp Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input 
                  type="tel" 
                  placeholder="9876543210"
                  required
                  value={form.whatsapp}
                  onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                  className="w-full bg-dark-3 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:border-gold/50 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1.5 block uppercase tracking-wider font-bold">Password</label>
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
              className="w-full bg-gold text-black py-4 mt-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-gold-light transition-all active:scale-[0.98]"
            >
              {loading ? 'Creating Account...' : <><UserPlus className="w-4 h-4" /> Sign Up</>}
            </button>
          </form>

          <div className="mt-8 text-center pt-8 border-t border-white/5">
            <p className="text-gray-500 text-sm">
              Already have an account? {' '}
              <Link href={`/login?redirect=${redirect}`} className="text-gold hover:underline">Login instead</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
