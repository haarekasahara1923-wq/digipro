'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingCart, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
    const { items, count, total, removeItem, clearCart, isOpen, closeCart } = useCart();
    const router = useRouter();

    const handleCheckout = () => {
        closeCart();
        router.push('/checkout');
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={closeCart}
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-dark-2 border-l border-white/8 z-50 flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center">
                            <ShoppingCart className="w-4 h-4 text-gold" />
                        </div>
                        <div>
                            <h2 className="font-display text-xl text-white">YOUR CART</h2>
                            <p className="text-gray-500 text-xs">{count} item{count !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {count > 0 && (
                            <button
                                onClick={clearCart}
                                className="text-xs text-gray-500 hover:text-red-400 transition-colors border border-white/5 hover:border-red-400/20 rounded-lg px-3 py-1.5"
                            >
                                Clear all
                            </button>
                        )}
                        <button
                            onClick={closeCart}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {count === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-16">
                            <div className="w-20 h-20 bg-dark-3 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <ShoppingBag className="w-10 h-10 text-gray-600" />
                            </div>
                            <p className="text-gray-500 text-sm mb-1">Your cart is empty</p>
                            <p className="text-gray-700 text-xs">Add products to get started</p>
                            <button
                                onClick={closeCart}
                                className="mt-6 text-gold text-sm hover:text-gold-light transition-colors"
                            >
                                Continue browsing →
                            </button>
                        </div>
                    ) : (
                        items.map(item => (
                            <div
                                key={item.slug}
                                className="bg-dark-3 border border-white/5 rounded-xl p-3 flex gap-3 hover:border-white/10 transition-colors"
                            >
                                {/* Image */}
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-dark-4">
                                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white text-sm font-medium leading-tight truncate mb-1">
                                        {item.name}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gold font-bold text-sm">
                                            ₹{item.price.toLocaleString('en-IN')}
                                        </span>
                                        {item.originalPrice > item.price && (
                                            <span className="price-original text-xs">
                                                ₹{item.originalPrice.toLocaleString('en-IN')}
                                            </span>
                                        )}
                                    </div>
                                    <Link
                                        href={`/products/${item.slug}`}
                                        onClick={closeCart}
                                        className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                                    >
                                        View product →
                                    </Link>
                                </div>

                                {/* Remove */}
                                <button
                                    onClick={() => removeItem(item.slug)}
                                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/5 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {count > 0 && (
                    <div className="p-4 border-t border-white/5 space-y-3">
                        {/* Total */}
                        <div className="bg-dark-3 border border-white/5 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-400 text-sm">{count} item{count !== 1 ? 's' : ''}</span>
                                <span className="text-gray-400 text-sm">₹{total.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                <span className="text-white font-bold">Total</span>
                                <span className="font-display text-2xl text-gold">₹{total.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="btn-gold w-full py-4 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2"
                        >
                            Proceed to Checkout
                            <ArrowRight className="w-4 h-4" />
                        </button>

                        <button
                            onClick={closeCart}
                            className="w-full py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-colors text-sm"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
