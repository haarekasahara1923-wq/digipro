'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, ArrowRight } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    description: string;
    original_price: string;
    discounted_price: string;
    image_url: string;
    slug: string;
}

export default function SearchModal({ onClose }: { onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        fetch('/api/products')
            .then(r => r.json())
            .then(data => { setProducts(data.products || []); setLoading(false); });
    }, []);

    useEffect(() => {
        if (!query.trim()) { setResults([]); return; }
        const q = query.toLowerCase();
        const found = products.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
        );
        setResults(found);
    }, [query, products]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 px-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-dark-2 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                    <Search className="w-5 h-5 text-gold flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search products by name or keyword..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="flex-1 bg-transparent text-white placeholder-gray-500 text-base outline-none"
                    />
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-600 text-sm">Loading products...</div>
                    ) : query && results.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-500">No products found for <strong className="text-white">"{query}"</strong></p>
                            <p className="text-gray-700 text-sm mt-1">Try different keywords</p>
                        </div>
                    ) : query && results.length > 0 ? (
                        <div className="p-3 space-y-2">
                            <p className="text-xs text-gray-600 px-2 pb-1">{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</p>
                            {results.map(product => {
                                const disc = Math.round(((parseFloat(product.original_price) - parseFloat(product.discounted_price)) / parseFloat(product.original_price)) * 100);
                                return (
                                    <Link key={product.id} href={`/products/${product.slug}`} onClick={onClose}>
                                        <div className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
                                            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-dark-3">
                                                <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white text-sm font-semibold mb-1 group-hover:text-gold transition-colors truncate">
                                                    {product.name}
                                                </h4>
                                                {product.description && (
                                                    <p className="text-gray-500 text-xs line-clamp-1 mb-2">{product.description}</p>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gold font-bold text-sm">
                                                        ₹{parseFloat(product.discounted_price).toLocaleString('en-IN')}
                                                    </span>
                                                    <span className="price-original text-xs">
                                                        ₹{parseFloat(product.original_price).toLocaleString('en-IN')}
                                                    </span>
                                                    {disc > 0 && (
                                                        <span className="bg-gold/10 text-gold text-xs px-1.5 py-0.5 rounded-md font-bold">
                                                            {disc}% OFF
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 flex items-center">
                                                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gold transition-colors" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : !query ? (
                        <div className="p-6">
                            <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">All Products</p>
                            <div className="space-y-2">
                                {products.slice(0, 5).map(product => (
                                    <Link key={product.id} href={`/products/${product.slug}`} onClick={onClose}>
                                        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
                                            <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-dark-3">
                                                <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                                            </div>
                                            <span className="text-gray-300 text-sm group-hover:text-white transition-colors flex-1 truncate">
                                                {product.name}
                                            </span>
                                            <span className="text-gold text-sm font-bold">
                                                ₹{parseFloat(product.discounted_price).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer hint */}
                <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                    <p className="text-xs text-gray-700">Press <kbd className="bg-dark-3 border border-white/10 rounded px-1.5 py-0.5 text-gray-500">Esc</kbd> to close</p>
                    {query && results.length > 0 && (
                        <Link href={`/?search=${encodeURIComponent(query)}`} onClick={onClose} className="text-xs text-gold hover:text-gold-light transition-colors">
                            View all results →
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
