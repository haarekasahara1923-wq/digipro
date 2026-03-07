'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowLeft, ShoppingCart, Zap, Shield, Check, Gift,
  Star, Lock, Share2, Copy, MessageCircle, Globe,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

declare global {
  interface Window {
    Razorpay: any; fbq: any;
    paypal: any;
  }
}

interface BonusLink { title: string; url: string; }
interface Product {
  id: number; name: string; description: string;
  original_price: string; discounted_price: string;
  image_url: string; slug: string; drive_link: string;
  bonus_links: BonusLink[] | null; price_usd: string | null;
  order_bump_product_id: number | null;
  order_bump_price: string | null;
  order_bump_description: string | null;
  order_bump_name: string | null;
  order_bump_image: string | null;
  order_bump_slug: string | null;
  order_bump_drive_link: string | null;
  order_bump_bonus_links: BonusLink[] | null;
  order_bump_product_description: string | null;
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { addItem, isInCart, openCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [bumpAdded, setBumpAdded] = useState(false);
  const [paying, setPaying] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '' });
  const [showForm, setShowForm] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const paypalRef = useRef<HTMLDivElement>(null);
  const paypalRendered = useRef(false);

  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digipro';
  const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  useEffect(() => {
    fetch(`/api/products/${params.slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.product) setProduct(data.product);
        else router.push('/');
        setLoading(false);
      });
  }, [params.slug]);

  // Load Razorpay script
  useEffect(() => {
    if (!product) return;
    if (window.fbq) window.fbq('track', 'ViewContent', {
      content_name: product.name, value: parseFloat(product.discounted_price), currency: 'INR',
    });
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(s);
  }, [product]);

  // Load & render PayPal button
  useEffect(() => {
    if (!product || currency !== 'USD' || !product.price_usd || !PAYPAL_CLIENT_ID) return;
    if (paypalRendered.current) return;

    const renderPayPal = () => {
      if (!paypalRef.current || !window.paypal) return;
      paypalRef.current.innerHTML = '';
      paypalRendered.current = true;

      window.paypal.Buttons({
        style: { color: 'gold', shape: 'rect', label: 'pay', height: 50 },
        createOrder: async () => {
          if (!form.name || !form.email || !form.whatsapp) {
            toast.error('Fill your details first'); return;
          }
          const res = await fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productSlug: product.slug,
              bumpSlug: bumpAdded ? product.order_bump_slug : undefined,
              bumpPriceUsd: bumpAdded && product.order_bump_price
                ? (parseFloat(product.order_bump_price) / 85).toFixed(2)  // rough INR→USD
                : undefined,
              buyerName: form.name, buyerEmail: form.email, buyerWhatsapp: form.whatsapp,
            }),
          });
          const data = await res.json();
          if (!res.ok) { toast.error(data.error); return; }
          return data.orderID;
        },
        onApprove: async (data: any) => {
          setPaying(true);
          const res = await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderID: data.orderID }),
          });
          const result = await res.json();
          if (result.success) {
            if (window.fbq) window.fbq('track', 'Purchase', { value: totalPriceUsd, currency: 'USD' });
            router.push(`/payment-success?name=${encodeURIComponent(form.name)}&product=${encodeURIComponent(product.name)}`);
          } else {
            toast.error('Payment verification failed');
            setPaying(false);
          }
        },
        onError: (err: any) => {
          toast.error('PayPal error. Please try again.');
          console.error(err);
        },
      }).render(paypalRef.current);
    };

    if (window.paypal) {
      renderPayPal();
    } else {
      const s = document.createElement('script');
      s.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
      s.onload = renderPayPal;
      document.body.appendChild(s);
    }

    return () => { paypalRendered.current = false; };
  }, [currency, product, bumpAdded, form]);

  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!product) return null;

  const disc = Math.round(((parseFloat(product.original_price) - parseFloat(product.discounted_price)) / parseFloat(product.original_price)) * 100);
  const mainPrice = parseFloat(product.discounted_price);
  const bumpPrice = product.order_bump_price ? parseFloat(product.order_bump_price) : 0;
  const totalPrice = mainPrice + (bumpAdded ? bumpPrice : 0);
  const mainPriceUsd = product.price_usd ? parseFloat(product.price_usd) : 0;
  const totalPriceUsd = mainPriceUsd; // USD bump price calculated in PayPal flow
  const bonusLinks: BonusLink[] = Array.isArray(product.bonus_links) ? product.bonus_links : [];
  const inCart = isInCart(product.slug);
  const hasUsd = !!product.price_usd;
  const bumpPromoText = product.order_bump_description || product.order_bump_product_description;

  const handleAddToCart = () => {
    if (inCart) { openCart(); return; }
    addItem({ id: product.id, name: product.name, slug: product.slug, price: mainPrice, originalPrice: parseFloat(product.original_price), image_url: product.image_url });
    if (bumpAdded && product.order_bump_slug && product.order_bump_name) {
      if (!isInCart(product.order_bump_slug)) {
        addItem({ id: product.order_bump_product_id!, name: product.order_bump_name, slug: product.order_bump_slug, price: bumpPrice, originalPrice: bumpPrice, image_url: product.order_bump_image || product.image_url });
      }
    }
    toast.success('Added to cart!');
  };

  const handleRazorpay = async () => {
    if (!form.name.trim()) { toast.error('Enter name'); return; }
    if (!form.email.includes('@')) { toast.error('Enter valid email'); return; }
    if (form.whatsapp.replace(/\D/g, '').length < 10) { toast.error('Enter valid WhatsApp'); return; }
    setPaying(true);
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productSlug: product.slug, bumpSlug: bumpAdded ? product.order_bump_slug : undefined, bumpPrice: bumpAdded ? bumpPrice : undefined, buyerName: form.name, buyerEmail: form.email, buyerWhatsapp: form.whatsapp }),
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error);
      new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, amount: order.amount, currency: 'INR',
        order_id: order.orderId, name: storeName, description: product.name,
        prefill: { name: form.name, email: form.email, contact: form.whatsapp },
        theme: { color: '#FFD700' },
        handler: async (response: any) => {
          const vRes = await fetch('/api/orders/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(response) });
          const vData = await vRes.json();
          if (vData.success) router.push(`/payment-success?name=${encodeURIComponent(form.name)}&product=${encodeURIComponent(product.name)}`);
          else { toast.error('Verification failed'); setPaying(false); }
        },
        modal: { ondismiss: () => setPaying(false) },
      }).open();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
      setPaying(false);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-dark">
      <Header />
      <main className="pt-24 pb-16 max-w-5xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* ── Left ──────────────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/5">
              <Image src={product.image_url} alt={product.name} fill className="object-cover" priority />
              {disc > 0 && (
                <div className="absolute top-4 right-4 bg-gold text-black font-black px-3 py-1.5 rounded-xl text-sm">
                  -{disc}% OFF
                </div>
              )}
            </div>

            {bonusLinks.length > 0 && (
              <div className="bg-gradient-to-br from-gold/8 to-transparent border border-gold/15 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-4 h-4 text-gold" />
                  <h3 className="font-display text-lg text-gold">FREE BONUSES INCLUDED</h3>
                </div>
                <ul className="space-y-2 mb-3">
                  {bonusLinks.map((b, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <div className="w-5 h-5 bg-green-500/15 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-400" strokeWidth={3} />
                      </div>
                      {b.title}
                    </li>
                  ))}
                </ul>
                <div className="flex items-start gap-2 bg-dark-3 rounded-xl px-3 py-2.5 border border-white/5">
                  <Lock className="w-3.5 h-3.5 text-gold mt-0.5 flex-shrink-0" />
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Bonus links delivered privately to your Email only after payment.
                  </p>
                </div>
              </div>
            )}

            {/* Share */}
            <div className="relative">
              <button onClick={() => setShareOpen(!shareOpen)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20 text-xs transition-all">
                <Share2 className="w-3.5 h-3.5" /> Share this product
              </button>
              {shareOpen && (
                <div className="absolute bottom-12 left-0 right-0 bg-dark-2 border border-white/10 rounded-xl shadow-2xl p-3 flex gap-2 z-10">
                  <button onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success('Link copied!'); setShareOpen(false); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-gold text-xs transition-all">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                  <button onClick={() => { const msg = `Check out ${product.name}!\n${shareUrl}`; window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank'); setShareOpen(false); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-green-500/20 text-green-400 text-xs transition-all">
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Right ─────────────────────────────────────────────────────── */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {Array(5).fill(0).map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-gold fill-gold" />)}
                <span className="text-gray-500 text-xs">Premium Product</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl text-white mb-3 leading-tight">{product.name}</h1>
              {product.description && <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>}
            </div>

            {/* ── Currency Toggle ───────────────────────────────────────────── */}
            {hasUsd && (
              <div className="bg-dark-2 border border-white/5 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-bold">Select Payment Currency</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'INR', flag: '🇮🇳', label: 'Indian Rupee', price: `₹${mainPrice.toLocaleString('en-IN')}`, sub: 'Razorpay • UPI • Cards • NetBanking' },
                    { key: 'USD', flag: '🌍', label: 'US Dollar', price: `$${mainPriceUsd.toFixed(2)}`, sub: 'PayPal • International Cards' },
                  ].map(opt => (
                    <button key={opt.key} onClick={() => { setCurrency(opt.key as 'INR' | 'USD'); paypalRendered.current = false; setShowForm(false); }}
                      className={`p-3 rounded-xl border text-left transition-all ${currency === opt.key ? 'border-gold bg-gold/8' : 'border-white/8 hover:border-white/15'}`}>
                      <span className="text-lg">{opt.flag}</span>
                      <p className="text-white font-bold text-sm mt-1">{opt.price}</p>
                      <p className="text-gray-500 text-xs">{opt.label}</p>
                      <p className="text-gray-600 text-[10px] mt-0.5">{opt.sub}</p>
                      {currency === opt.key && <div className="w-full h-0.5 bg-gold rounded-full mt-2" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price display */}
            <div className="bg-dark-2 border border-white/5 rounded-2xl p-5">
              {currency === 'INR' ? (
                <>
                  <div className="flex items-end gap-3 mb-2">
                    <span className="font-display text-5xl text-gold">₹{mainPrice.toLocaleString('en-IN')}</span>
                    <span className="price-original text-lg mb-1">₹{parseFloat(product.original_price).toLocaleString('en-IN')}</span>
                  </div>
                  {disc > 0 && <span className="bg-green-500/10 text-green-400 text-xs px-3 py-1 rounded-full font-bold">You save ₹{(parseFloat(product.original_price) - mainPrice).toLocaleString('en-IN')} ({disc}% OFF)</span>}
                </>
              ) : (
                <>
                  <div className="flex items-end gap-3 mb-2">
                    <span className="font-display text-5xl text-blue-400">${mainPriceUsd.toFixed(2)}</span>
                    <div className="flex items-center gap-1 mb-1">
                      <Globe className="w-3 h-3 text-blue-400" />
                      <span className="text-blue-400 text-sm font-medium">USD</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs">Paid via PayPal. Also ₹{mainPrice.toLocaleString('en-IN')} INR via Razorpay.</p>
                </>
              )}
            </div>

            {/* Order Bump */}
            {product.order_bump_product_id && product.order_bump_name && (
              <div className={`border-2 rounded-2xl p-5 transition-all duration-300 cursor-pointer ${bumpAdded ? 'border-gold bg-gold/8' : 'border-dashed border-gold/30 hover:border-gold/50'}`}
                onClick={() => setBumpAdded(!bumpAdded)}>
                <div className="flex items-start gap-4">
                  <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border-2 transition-all ${bumpAdded ? 'bg-gold border-gold' : 'border-gray-500'}`}>
                    {bumpAdded && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-3.5 h-3.5 text-gold" />
                      <span className="text-xs text-gold font-bold uppercase tracking-wide">Special Add-On!</span>
                    </div>
                    <p className="text-white text-sm font-semibold mb-1">
                      Add <span className="text-gold">{product.order_bump_name}</span>{' '}
                      for just <span className="text-gold font-black">₹{bumpPrice.toLocaleString('en-IN')}</span> more
                    </p>
                    {bumpPromoText && <p className="text-gray-400 text-xs">{bumpPromoText}</p>}
                    <span className={`inline-block mt-2 text-xs font-bold px-3 py-1.5 rounded-lg ${bumpAdded ? 'bg-gold text-black' : 'bg-gold/10 text-gold border border-gold/20'}`}>
                      {bumpAdded ? '✓ Added!' : `+ Add for ₹${bumpPrice.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  {product.order_bump_image && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                      <Image src={product.order_bump_image} alt={product.order_bump_name} fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Total */}
            {bumpAdded && currency === 'INR' && (
              <div className="bg-gold/5 border border-gold/20 rounded-xl px-4 py-3 flex justify-between items-center">
                <p className="text-gray-400 text-xs">Total: ₹{mainPrice.toLocaleString('en-IN')} + ₹{bumpPrice.toLocaleString('en-IN')}</p>
                <span className="font-display text-3xl text-gold">₹{(mainPrice + bumpPrice).toLocaleString('en-IN')}</span>
              </div>
            )}

            {/* ── CTA ──────────────────────────────────────────────────────── */}
            {currency === 'INR' ? (
              !showForm ? (
                <div className="space-y-3">
                  <button onClick={() => setShowForm(true)} className="btn-gold w-full py-5 rounded-xl font-black uppercase tracking-wider text-base flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5" />
                    {bumpAdded ? `Buy Both — ₹${(mainPrice + bumpPrice).toLocaleString('en-IN')}` : `Buy Now — ₹${mainPrice.toLocaleString('en-IN')}`}
                  </button>
                  <button onClick={handleAddToCart} className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${inCart ? 'border-green-500/30 text-green-400 bg-green-500/5' : 'border-white/10 text-gray-300 hover:text-gold hover:border-gold/30 hover:bg-gold/5'}`}>
                    <ShoppingCart className="w-4 h-4" />
                    {inCart ? '✓ In Cart — View Cart' : bumpAdded ? 'Add Both to Cart' : 'Add to Cart'}
                  </button>
                  <p className="text-center text-xs text-gray-600">🔒 Links delivered to your Email after payment</p>
                </div>
              ) : (
                <div className="bg-dark-3 border border-white/10 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl text-white">YOUR DETAILS</h3>
                    <span className="text-gold font-display text-lg">₹{(bumpAdded ? mainPrice + bumpPrice : mainPrice).toLocaleString('en-IN')}</span>
                  </div>
                  {[
                    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your name' },
                    { key: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com' },
                    { key: 'whatsapp', label: 'WhatsApp Number', type: 'tel', placeholder: '9876543210' },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label className="text-xs text-gray-500 mb-1.5 block">{label} *</label>
                      <input type={type} placeholder={placeholder} value={form[key as keyof typeof form]}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        className="input-dark text-sm" onKeyDown={e => e.key === 'Enter' && handleRazorpay()} />
                    </div>
                  ))}
                  <button onClick={handleRazorpay} disabled={paying}
                    className="btn-gold w-full py-4 rounded-xl font-black uppercase tracking-wider text-sm">
                    {paying ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />Processing...</span> : `Pay ₹${(bumpAdded ? mainPrice + bumpPrice : mainPrice).toLocaleString('en-IN')} via Razorpay`}
                  </button>
                  <button onClick={() => setShowForm(false)} className="w-full text-xs text-gray-600 hover:text-gray-400 transition-colors">← Back</button>
                </div>
              )
            ) : (
              /* USD / PayPal flow */
              hasUsd ? (
                <div className="space-y-4">
                  <div className="bg-dark-3 border border-blue-500/15 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xl text-white">YOUR DETAILS</h3>
                      <span className="text-blue-400 font-display text-lg">${mainPriceUsd.toFixed(2)} USD</span>
                    </div>
                    {[
                      { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your name' },
                      { key: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com' },
                      { key: 'whatsapp', label: 'WhatsApp Number', type: 'tel', placeholder: '+1 234 567 8900' },
                    ].map(({ key, label, type, placeholder }) => (
                      <div key={key}>
                        <label className="text-xs text-gray-500 mb-1.5 block">{label} *</label>
                        <input type={type} placeholder={placeholder} value={form[key as keyof typeof form]}
                          onChange={e => { setForm({ ...form, [key]: e.target.value }); paypalRendered.current = false; }}
                          className="input-dark text-sm" />
                      </div>
                    ))}
                    <div className="border-t border-white/5 pt-4">
                      <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-blue-400" />
                        Pay with PayPal — accepts international cards, wallets
                      </p>
                      <div ref={paypalRef} id="paypal-button-container" className="min-h-[50px]" />
                      {paying && (
                        <div className="flex items-center justify-center gap-2 py-3 text-gray-400 text-sm">
                          <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                          Processing payment...
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-600">🔒 Links delivered to your Email after payment</p>
                </div>
              ) : (
                <div className="bg-dark-2 border border-white/5 rounded-2xl p-5 text-center">
                  <Globe className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">USD pricing not set for this product.</p>
                  <button onClick={() => setCurrency('INR')} className="text-gold text-xs mt-2 hover:text-gold-light transition-colors">
                    Switch to INR instead →
                  </button>
                </div>
              )
            )}

            {/* Trust */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, text: 'Secure Payment' },
                { icon: Zap, text: 'Instant Delivery' },
                { icon: Lock, text: 'Private Links' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="text-center">
                  <Icon className="w-4 h-4 text-gold mx-auto mb-1" />
                  <span className="text-gray-600 text-xs">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
