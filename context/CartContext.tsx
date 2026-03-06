'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CartItem {
    id: number;
    name: string;
    slug: string;
    price: number;
    originalPrice: number;
    image_url: string;
    driveLink?: string;
    bonusLinks?: { title: string; url: string }[];
}

interface CartContextType {
    items: CartItem[];
    count: number;
    total: number;
    addItem: (item: CartItem) => void;
    removeItem: (slug: string) => void;
    clearCart: () => void;
    isInCart: (slug: string) => boolean;
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Load from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('digipro_cart');
            if (saved) setItems(JSON.parse(saved));
        } catch { }
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('digipro_cart', JSON.stringify(items));
    }, [items]);

    const addItem = useCallback((item: CartItem) => {
        setItems(prev => {
            if (prev.find(i => i.slug === item.slug)) return prev;
            return [...prev, item];
        });
        setIsOpen(true);
    }, []);

    const removeItem = useCallback((slug: string) => {
        setItems(prev => prev.filter(i => i.slug !== slug));
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
        localStorage.removeItem('digipro_cart');
    }, []);

    const isInCart = useCallback((slug: string) => {
        return items.some(i => i.slug === slug);
    }, [items]);

    const count = items.length;
    const total = items.reduce((s, i) => s + i.price, 0);

    return (
        <CartContext.Provider value={{
            items, count, total,
            addItem, removeItem, clearCart, isInCart,
            isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
