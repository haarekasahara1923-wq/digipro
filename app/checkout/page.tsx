'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ShoppingCart, Trash2, Lock, Shield, ArrowLeft, User, Mail, Phone, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

declare global {
    interface Window { Razorpay: any; fbq: any; }
}

export default function CartCheckoutPage() {
    const { items, total, count, removeItem, clearCart } = useCart();
    const router = useRouter();
    const [form, setForm] = useState({ name: '', email: '', whatsapp: '' });
    const [paying, setPaying] = useState(false);
    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digipro';

    useEffect(() => {
        if (count === 0) router.replace('/');
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        document.body.appendChild(script);
    }, [count]);

    const handlePay = async () => {
        if (!form.name.trim()) { toast.error('Enter your name'); return; }
        if (!form.email.trim() || !form.email.includes('@')) { toast.error('Enter valid email'); return; }
        if (form.whatsapp.replace(/\D/g, '').length < 10) { toast.error('Enter valid WhatsApp number'); return; }

        setPaying(true);
        try {
            const res = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cartItems: items.map(i => ({ slug: i.slug, price: i.price, name: i.name })),
                    buyerName: form.name,
                    buyerEmail: form.email,
                    buyerWhatsapp: form.whatsapp,
                }),
            });
            const order = await res.json();
            if (!res.ok) throw new Error(order.error);

            const rzpOptions = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: 'INR',
                order_id: order.orderId,
                name: storeName,
                description: `${count} Product${count > 1 ? 's' : ''} Order`,
                prefill: { name: form.name, email: form.email, contact: form.whatsapp },
                theme: { color: '#FFD700' },
                handler: async (response: any) => {
                    const verifyRes = await fetch('/api/orders/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        }),
                    });
                    const vData = await verifyRes.json();
                    if (vData.success) {
                        if (window.fbq) window.fbq('track', 'Purchase', { value: total, currency: 'INR' });
                        clearCart();
                        router.push(`/payment-success?name=${encodeURIComponent(form.name)}&product=${encodeURIComponent(`${count} Products`)}&multi=true`);
                    } else {
                        toast.error('Payment verification failed. Contact support.');
                        setPaying(false);
                    }
                },
                modal: { ondismiss: () => setPaying(false) },
            };
            new window.Razorpay(rzpOptions).open();
        } catch (err: any) {
            toast.error(err.message || 'Something went wrong');
            setPaying(false);
        }
    };

    if (count === 0) return null;

    return (
        <div className="min-h-screen bg-dark">
            <Header />
            <div className="pt-24 pb-16 max-w-5xl mx-auto px-4">
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/" className="text-gray-500 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-display text-4xl text-white">CART CHECKOUT</h1>
                        <p className="text-gray-500 text-sm">{count} product{count > 1 ? 's' : ''} in your cart</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Order Summary */}
                    <div>
                        <h2 className="font-display text-2xl text-white mb-4">ORDER SUMMARY</h2>

                        {/* Cart items */}
                        <div className="space-y-3 mb-6">
                            {items.map(item => (
                                <div key={item.slug} className="bg-dark-2 border border-white/5 rounded-xl p-4 flex gap-4">
                                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                        <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-white text-sm font-medium">{item.name}</h4>
                                        <span className="text-gold font-bold">₹{item.price.toLocaleString('en-IN')}</span>
                                        {item.originalPrice > item.price && (
                                            <span className="price-original text-xs ml-2">₹{item.originalPrice.toLocaleString('en-IN')}</span>
                                        )}
                                    </div>
                                    <button onClick={() => removeItem(item.slug)} className="text-gray-600 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Price breakdown */}
                        <div className="bg-dark-2 border border-white/5 rounded-xl p-5">
                            {items.map(item => (
                                <div key={item.slug} className="flex justify-between text-sm py-1">
                                    <span className="text-gray-500 truncate max-w-[60%]">{item.name}</span>
                                    <span className="text-gray-400">₹{item.price.toLocaleString('en-IN')}</span>
                                </div>
                            ))}
                            <div className="border-t border-white/5 mt-3 pt-3 flex justify-between">
                                <span className="font-bold text-white">Total ({count} items)</span>
                                <span className="font-display text-2xl text-gold">₹{total.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        {/* Trust */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {[{ icon: Shield, text: 'Secure Payment' }, { icon: Lock, text: 'Razorpay Encrypted' }].map(({ icon: Icon, text }) => (
                                <div key={text} className="flex items-center gap-2 bg-dark-2 rounded-xl p-3 border border-white/5">
                                    <Icon className="w-4 h-4 text-gold" />
                                    <span className="text-gray-400 text-xs">{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Checkout Form */}
                    <div>
                        <h2 className="font-display text-2xl text-white mb-6">YOUR DETAILS</h2>
                        <div className="space-y-4 mb-6">
                            {[
                                { key: 'name', label: 'Full Name', placeholder: 'Enter your full name', type: 'text', icon: User },
                                { key: 'email', label: 'Email Address', placeholder: 'Enter your email', type: 'email', icon: Mail },
                                { key: 'whatsapp', label: 'WhatsApp Number', placeholder: 'e.g. 9876543210', type: 'tel', icon: Phone },
                            ].map(({ key, label, placeholder, type, icon: Icon }) => (
                                <div key={key}>
                                    <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                        <Icon className="w-3.5 h-3.5 text-gold" />
                                        {label} *
                                    </label>
                                    <input
                                        type={type}
                                        placeholder={placeholder}
                                        value={form[key as keyof typeof form]}
                                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                                        className="input-dark"
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handlePay}
                            disabled={paying}
                            className="btn-gold w-full py-5 rounded-xl font-black uppercase tracking-widest text-base"
                        >
                            {paying ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                </span>
                            ) : `Pay ₹${total.toLocaleString('en-IN')} Securely`}
                        </button>

                        <p className="text-center text-xs text-gray-600 mt-3 flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3" />
                            256-bit SSL secured by Razorpay
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
