'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Search, Sparkles, Menu, X, Home, Info, Phone, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import SearchModal from './SearchModal';
import CartDrawer from './CartDrawer';

export default function Header() {
    const { count, openCart } = useCart();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digipro';

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const navLinks = [
        { href: '/', label: 'Store', icon: Home },
        { href: '/about', label: 'About', icon: Info },
        { href: '/contact', label: 'Contact', icon: Phone },
    ];

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-dark/95 backdrop-blur-2xl border-b border-white/8 shadow-2xl shadow-black/50'
                    : 'bg-dark/70 backdrop-blur-xl border-b border-white/5'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                        <div className="w-9 h-9 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center shadow-lg shadow-gold/20">
                            <Sparkles className="w-4.5 h-4.5 text-black" />
                        </div>
                        <span className="font-display text-2xl text-white tracking-wider">{storeName}</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map(({ href, label }) => (
                            <Link key={href} href={href}>
                                <div className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pathname === href
                                        ? 'text-gold bg-gold/10 border border-gold/20'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}>
                                    {label}
                                </div>
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gold hover:bg-gold/10 transition-all border border-transparent hover:border-gold/20"
                            aria-label="Search products"
                        >
                            <Search className="w-4.5 h-4.5" />
                        </button>

                        {/* Cart */}
                        <button
                            onClick={openCart}
                            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gold hover:bg-gold/10 transition-all border border-transparent hover:border-gold/20"
                            aria-label="Open cart"
                        >
                            <ShoppingCart className="w-4.5 h-4.5" />
                            {count > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-black text-xs font-black rounded-full flex items-center justify-center animate-bounce-once">
                                    {count}
                                </span>
                            )}
                        </button>

                        {/* Mobile menu */}
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <Menu className="w-4.5 h-4.5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <>
                    <div className="fixed inset-0 bg-black/70 z-50 md:hidden" onClick={() => setMobileOpen(false)} />
                    <div className="fixed top-0 right-0 bottom-0 w-72 bg-dark-2 border-l border-white/10 z-50 md:hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <span className="font-display text-xl text-white">{storeName}</span>
                            <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <nav className="flex-1 p-4 space-y-1">
                            {navLinks.map(({ href, label, icon: Icon }) => (
                                <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === href ? 'bg-gold text-black font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}>
                                        <Icon className="w-4 h-4" />
                                        {label}
                                    </div>
                                </Link>
                            ))}
                            <button
                                onClick={() => { setMobileOpen(false); openCart(); }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                Cart {count > 0 && <span className="ml-auto bg-gold text-black text-xs font-black px-2 py-0.5 rounded-full">{count}</span>}
                            </button>
                        </nav>
                    </div>
                </>
            )}

            {/* Search Modal */}
            {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}

            {/* Cart Drawer */}
            <CartDrawer />
        </>
    );
}
