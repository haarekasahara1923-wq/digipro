'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { Crown, Package, Clock, LogOut, CheckCircle2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.authenticated) {
          router.push('/login?redirect=/profile');
          return;
        }
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-24 pb-16">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar */}
          <div className="w-full md:w-80 space-y-4">
            <div className="bg-dark-2 border border-white/5 rounded-3xl p-8 text-center">
              <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold/20">
                <span className="text-3xl font-display text-gold">{data.user.name[0]}</span>
              </div>
              <h2 className="text-xl font-display text-white">{data.user.name}</h2>
              <p className="text-gray-500 text-sm mb-6">{data.user.email}</p>
              <button 
                onClick={() => {
                   document.cookie = 'user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                   window.location.href = '/';
                }}
                className="w-full py-3 rounded-xl border border-white/10 text-gray-500 hover:text-white hover:bg-white/5 transition-all text-sm flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>

            <div className="bg-dark-2 border border-white/5 rounded-3xl p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Crown className="w-4 h-4 text-gold" /> Active Plan
              </h3>
              {data.subscription ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gold/5 border border-gold/10">
                    <p className="text-gold font-black text-lg">{data.subscription.plan_name}</p>
                    <p className="text-gray-500 text-xs">Expires on {new Date(data.subscription.end_date).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Products Downloaded</span>
                      <span className="text-white font-bold">{data.subscription.products_downloaded} / {data.subscription.product_limit || '∞'}</span>
                    </div>
                    {data.subscription.product_limit && (
                      <div className="w-full h-1.5 bg-dark-3 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gold" 
                          style={{ width: `${(data.subscription.products_downloaded / data.subscription.product_limit) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-xs mb-4">No active subscription</p>
                  <button 
                    onClick={() => router.push('/membership')}
                    className="w-full py-3 bg-gold text-black rounded-xl font-black text-xs uppercase tracking-widest"
                  >
                    View Plans
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
             <div className="bg-dark-2 border border-white/5 rounded-3xl p-8">
               <h3 className="text-xl font-display text-white mb-6">Recent Downloads</h3>
               <div className="space-y-4">
                  <p className="text-gray-500 text-sm">Download history will appear here once you start downloading products using your membership.</p>
                  <div className="grid grid-cols-1 gap-4 mt-6">
                    <div className="p-6 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                       <Package className="w-8 h-8 text-gray-700 mb-2" />
                       <p className="text-gray-600 text-sm">Start exploring the store to use your benefits!</p>
                       <button onClick={() => router.push('/')} className="mt-4 text-gold text-sm underline font-bold">Browse Products</button>
                    </div>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
