'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Check, Zap, Crown, Star, Shield, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const plans = [
  {
    name: 'BASIC',
    price: 599,
    limit: 10,
    features: [
      'Download 10 Products',
      'Valid for 30 Days',
      'Direct Download Links',
      'Priority Email Support',
      'No Checkout Required per Product'
    ],
    color: 'gray',
    icon: Star
  },
  {
    name: 'PRO',
    price: 999,
    limit: 20,
    popular: true,
    features: [
      'Download 20 Products',
      'Valid for 30 Days',
      'Direct Download Links',
      'Priority WhatsApp Support',
      'No Checkout Required per Product',
      'Early Access to New Products'
    ],
    color: 'gold',
    icon: Zap
  },
  {
    name: 'ELITE',
    price: 1999,
    limit: null, // Unlimited
    features: [
      'Unlimited Downloads',
      'Valid for 30 Days',
      'Direct Download Links',
      '1-on-1 Support',
      'No Checkout Required per Product',
      'Exclusive Elite Only Products',
      'Private Community Access'
    ],
    color: 'blue',
    icon: Crown
  }
];

export default function MembershipPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data.user);
        }
        setLoading(false);
      });
  }, []);

  const handleSubscribe = async (plan: any) => {
    if (!user) {
      toast.error('Please login/register first');
      router.push('/login?redirect=/membership');
      return;
    }

    // Redirect to checkout/payment for the membership
    // For now, let's just use a simple API call to simulate or initiate Razorpay
    setLoading(true);
    try {
      const res = await fetch('/api/subscriptions/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName: plan.name, amount: plan.price })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // Initialize Cashfree/Razorpay for the subscription payment
       // @ts-ignore
       const { load } = await import('@cashfreepayments/cashfree-js');
       const cashfree = await load({
         mode: process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === 'PRODUCTION' ? 'production' : 'sandbox',
       });
 
       const result: any = await cashfree.checkout({
         paymentSessionId: data.paymentSessionId,
         redirectTarget: '_modal',
       });
 
       if (result?.error) {
         toast.error(result.error.message || 'Payment cancelled');
       } else if (result?.paymentDetails || result == null) {
         // Verify
         const verifyRes = await fetch('/api/subscriptions/verify', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ orderId: data.orderId })
         });
         const vData = await verifyRes.json();
         if (vData.success) {
           toast.success(`Subscribed to ${plan.name} successfully!`);
           router.push('/profile');
         } else {
           toast.error('Verification failed');
         }
       }
    } catch (err: any) {
      toast.error(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      <Header />
      <main className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl sm:text-6xl text-white mb-4">Membership Plans</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Get instant access to our premium digital products without paying for each one individually. 
            Choose a plan that fits your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.name} 
              className={`relative bg-dark-2 border rounded-3xl p-8 flex flex-col transition-all duration-300 hover:translate-y-[-8px] ${
                plan.popular ? 'border-gold shadow-[0_0_40px_rgba(212,175,55,0.15)]' : 'border-white/5'
              }`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-black text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
                  plan.name === 'BASIC' ? 'bg-gray-500/10 text-gray-400' : 
                  plan.name === 'PRO' ? 'bg-gold/10 text-gold' : 'bg-blue-500/10 text-blue-400'
                }`}>
                  <plan.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-display text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display text-white">₹{plan.price}</span>
                  <span className="text-gray-500">/ 30 days</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-gold' : 'text-green-500'}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleSubscribe(plan)}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all ${
                  plan.popular ? 'bg-gold text-black hover:bg-gold-light' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                }`}>
                {loading ? 'Processing...' : `Get ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-dark-3 p-6 rounded-2xl border border-white/5 text-center">
              <Shield className="w-8 h-8 text-gold mx-auto mb-4" />
              <h4 className="text-white font-bold mb-2">Secure Payment</h4>
              <p className="text-gray-500 text-xs">All transactions are encrypted and processed securely via Cashfree.</p>
            </div>
            <div className="bg-dark-3 p-6 rounded-2xl border border-white/5 text-center">
              <Zap className="w-8 h-8 text-gold mx-auto mb-4" />
              <h4 className="text-white font-bold mb-2">Instant Activation</h4>
              <p className="text-gray-500 text-xs">Your membership benefits are activated immediately after payment.</p>
            </div>
            <div className="bg-dark-3 p-6 rounded-2xl border border-white/5 text-center">
              <Lock className="w-8 h-8 text-gold mx-auto mb-4" />
              <h4 className="text-white font-bold mb-2">Private Access</h4>
              <p className="text-gray-500 text-xs">Download links are shared directly to your profile and email.</p>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
