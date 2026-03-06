'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { CheckCircle, Mail, MessageCircle, Home, Package, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';

function SuccessContent() {
  const params = useSearchParams();
  const name = params.get('name') || 'Customer';
  const product = params.get('product') || 'your product';
  const isMulti = params.get('multi') === 'true';
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digipro';

  const [count, setCount] = useState(0);
  useEffect(() => {
    // Count-up animation for satisfaction %
    let n = 0;
    const interval = setInterval(() => {
      n += 2;
      setCount(n);
      if (n >= 100) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <Header />

      {/* Background effects */}
      <div className="fixed top-0 left-0 right-0 bottom-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-green-500/4 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gold/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-blue-500/4 rounded-full blur-[80px]" />
      </div>

      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-16 relative">
        <div className="w-full max-w-lg text-center">
          {/* Animated check */}
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping opacity-30" />
            <div className="absolute inset-2 bg-green-500/10 rounded-full animate-ping opacity-20" style={{ animationDelay: '0.3s' }} />
            <div className="relative w-28 h-28 bg-dark-2 border-2 border-green-500/40 rounded-full flex items-center justify-center">
              <CheckCircle className="w-14 h-14 text-green-400" strokeWidth={1.5} />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <p className="text-green-400 text-xs font-bold uppercase tracking-[4px] mb-3">
              ✓ Payment Verified
            </p>
            <h1 className="font-display text-5xl sm:text-7xl text-white mb-2 leading-none">
              PAYMENT<br />
              <span className="text-gold-gradient">SUCCESS!</span>
            </h1>
          </div>

          <p className="text-2xl text-white font-semibold mb-2">
            Thank you, {name}! 🎉
          </p>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
            {isMulti
              ? `Your ${product} order is confirmed. All product links have been sent!`
              : `Your purchase of "${product}" is confirmed.`
            }
          </p>

          {/* Delivery Status */}
          <div className="bg-dark-2 border border-white/5 rounded-2xl p-6 mb-6 text-left space-y-5">
            <p className="text-xs text-gray-600 uppercase tracking-widest font-bold">📦 Delivery Status</p>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-white text-sm font-semibold">Email Sent ✓</p>
                  <span className="bg-green-500/10 text-green-400 text-xs px-2 py-0.5 rounded-full">Delivered</span>
                </div>
                <p className="text-gray-500 text-xs">
                  Check your inbox (and spam folder). Contains your download link{isMulti ? 's' : ''} + bonus files.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-white text-sm font-semibold">WhatsApp Message ✓</p>
                  <span className="bg-green-500/10 text-green-400 text-xs px-2 py-0.5 rounded-full">Sent</span>
                </div>
                <p className="text-gray-500 text-xs">
                  Download link{isMulti ? 's' : ''} sent to your WhatsApp number.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold mb-0.5">{isMulti ? 'All Products Ready' : 'Product Ready'} ✓</p>
                <p className="text-gray-500 text-xs">
                  {isMulti ? 'All your products are' : 'Your digital product is'} available via the links sent above.
                </p>
              </div>
            </div>
          </div>

          {/* Satisfaction note */}
          <div className="bg-dark-2 border border-white/5 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs">Customer Satisfaction</span>
              <span className="text-gold font-bold text-sm">{count}%</span>
            </div>
            <div className="h-1.5 bg-dark-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold to-gold-dark rounded-full transition-all duration-100"
                style={{ width: `${count}%` }}
              />
            </div>
          </div>

          <p className="text-gray-600 text-xs mb-8">
            Issue with download? Reply to the confirmation email or{' '}
            <Link href="/contact" className="text-gold hover:text-gold-light transition-colors">
              contact us
            </Link>.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <button className="btn-gold px-8 py-4 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 w-full sm:w-auto">
                <Home className="w-4 h-4" />
                Back to {storeName}
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
