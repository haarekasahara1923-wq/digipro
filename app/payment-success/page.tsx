'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { CheckCircle, Mail, MessageCircle, Home } from 'lucide-react';

function SuccessContent() {
  const params = useSearchParams();
  const name = params.get('name') || 'Customer';
  const product = params.get('product') || 'your product';
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digital Store';

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* BG glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-green-500/5 rounded-full blur-[80px]" />

      <div className="relative text-center max-w-lg">
        {/* Checkmark */}
        <div className="w-24 h-24 bg-green-500/10 border-2 border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse-gold">
          <CheckCircle className="w-12 h-12 text-green-400" />
        </div>

        <h1 className="font-display text-5xl sm:text-6xl text-gold-gradient mb-4">
          PAYMENT SUCCESS!
        </h1>

        <p className="text-2xl text-white font-semibold mb-2">
          Thank you, {name}! 🎉
        </p>

        <p className="text-gray-400 mb-8 leading-relaxed">
          Your purchase of <strong className="text-white">"{product}"</strong> is confirmed.
          We've sent your download link to your Email and WhatsApp.
        </p>

        {/* Delivery info */}
        <div className="bg-dark-2 border border-white/5 rounded-2xl p-6 mb-8 text-left space-y-4">
          <h3 className="font-semibold text-gold text-sm uppercase tracking-wider">Delivery Status</h3>
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white text-sm font-medium">Email Sent</p>
              <p className="text-gray-500 text-xs">Check your inbox (and spam folder) for the download link</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white text-sm font-medium">WhatsApp Message Sent</p>
              <p className="text-gray-500 text-xs">Download link sent to your WhatsApp number</p>
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-xs mb-8">
          Facing issues? Email us or reply to the confirmation email.
        </p>

        <Link href="/">
          <button className="btn-gold px-8 py-4 rounded-xl font-black uppercase tracking-wider flex items-center gap-2 mx-auto">
            <Home className="w-4 h-4" />
            Back to {storeName}
          </button>
        </Link>
      </div>
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
