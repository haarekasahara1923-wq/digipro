'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Shield, Lock, ArrowLeft, User, Mail, Phone, Sparkles } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  original_price: string;
  discounted_price: string;
  image_url: string;
  slug: string;
}

declare global {
  interface Window {
    Razorpay: any;
    fbq: any;
  }
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });

  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digital Store';

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.product) {
          setProduct(data.product);
          // FB Pixel InitiateCheckout
          if (window.fbq) {
            window.fbq('track', 'InitiateCheckout', {
              content_name: data.product.name,
              value: parseFloat(data.product.discounted_price),
              currency: 'INR',
            });
          }
        } else {
          router.push('/');
        }
        setLoading(false);
      })
      .catch(() => { setLoading(false); router.push('/'); });

    // Load Razorpay SDK
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
  }, [slug]);

  const handlePay = async () => {
    if (!form.name.trim()) { toast.error('Please enter your name'); return; }
    if (!form.email.trim() || !form.email.includes('@')) { toast.error('Please enter a valid email'); return; }
    if (!form.whatsapp.trim() || form.whatsapp.replace(/[^0-9]/g, '').length < 10) {
      toast.error('Please enter a valid WhatsApp number'); return;
    }

    setPaying(true);

    try {
      // Create order
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug: slug,
          buyerName: form.name,
          buyerEmail: form.email,
          buyerWhatsapp: form.whatsapp,
        }),
      });

      const order = await res.json();
      if (!res.ok) throw new Error(order.error);

      // Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        order_id: order.orderId,
        name: storeName,
        description: order.productName,
        image: product?.image_url,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.whatsapp,
        },
        theme: { color: '#FFD700' },
        handler: async (response: any) => {
          // Verify payment
          const verifyRes = await fetch('/api/orders/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            // FB Pixel Purchase
            if (window.fbq) {
              window.fbq('track', 'Purchase', {
                value: parseFloat(product?.discounted_price || '0'),
                currency: 'INR',
                content_name: product?.name,
              });
            }

            router.push(
              `/payment-success?name=${encodeURIComponent(form.name)}&product=${encodeURIComponent(order.productName)}`
            );
          } else {
            toast.error('Payment verification failed. Contact support.');
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => { setPaying(false); },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const disc = Math.round(
    ((parseFloat(product.original_price) - parseFloat(product.discounted_price)) /
      parseFloat(product.original_price)) * 100
  );

  return (
    <div className="min-h-screen bg-dark">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/products/${slug}`} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to product</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Lock className="w-3 h-3 text-gold" />
            <span>Secured Checkout</span>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Order Summary */}
          <div className="order-2 lg:order-1">
            <h2 className="font-display text-3xl text-white mb-6">ORDER SUMMARY</h2>

            <div className="bg-dark-2 border border-white/5 rounded-2xl overflow-hidden mb-6">
              <div className="flex gap-4 p-4 border-b border-white/5">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm leading-tight mb-1">{product.name}</h3>
                  <span className="text-xs text-gray-500 bg-dark-3 px-2 py-0.5 rounded-full">Digital Product</span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Original Price</span>
                  <span className="price-original">₹{parseFloat(product.original_price).toLocaleString('en-IN')}</span>
                </div>
                {disc > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount ({disc}%)</span>
                    <span className="text-green-400">
                      -₹{(parseFloat(product.original_price) - parseFloat(product.discounted_price)).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="border-t border-white/5 pt-2 flex justify-between">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-display text-2xl text-gold">
                    ₹{parseFloat(product.discounted_price).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Shield, text: 'Secure Payment' },
                { icon: Lock, text: 'Razorpay Encrypted' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 bg-dark-2 rounded-xl p-3 border border-white/5">
                  <Icon className="w-4 h-4 text-gold" />
                  <span className="text-xs text-gray-400">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Form */}
          <div className="order-1 lg:order-2">
            <h2 className="font-display text-3xl text-white mb-6">YOUR DETAILS</h2>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <User className="w-3 h-3 text-gold" />
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Mail className="w-3 h-3 text-gold" />
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-dark"
                />
                <p className="text-xs text-gray-600 mt-1">Download link will be sent here</p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Phone className="w-3 h-3 text-gold" />
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210 (with country code)"
                  value={form.whatsapp}
                  onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                  className="input-dark"
                />
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={paying}
              className="btn-gold w-full py-5 rounded-xl font-black uppercase tracking-widest text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paying ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                `Pay ₹${parseFloat(product.discounted_price).toLocaleString('en-IN')} Securely`
              )}
            </button>

            <p className="text-center text-xs text-gray-600 mt-4 flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" />
              Your payment is protected by Razorpay's 256-bit SSL encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
