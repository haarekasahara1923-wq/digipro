'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, ArrowRight } from 'lucide-react';

interface Product {
    id: number; name: string; description: string;
    original_price: string; discounted_price: string;
    image_url: string; slug: string;
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
        setResults(products.filter(p =>
            p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
        ));
    }, [query, products]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[60]">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            {/* Modal — positioned from top with safe gap */}
            <div className="relative z-10 flex justify-center px-4" style={{ paddingTop: '80px' }}>
                <div className="w-full max-w-2xl bg-dark-2 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[calc(100vh-100px)]">

                    {/* Search Input — sticky inside modal */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-dark-2 flex-shrink-0">
                        <Search className="w-5 h-5 text-gold flex-shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search products by name or keyword..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="flex-1 bg-transparent text-white placeholder-gray-500 text-base outline-none"
                        />
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors flex-shrink-0">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scrollable Results */}
                    <div className="overflow-y-auto flex-1">
                        {loading ? (
                            <div className="p-8 text-center text-gray-600 text-sm">Loading products...</div>
                        ) : query && results.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-gray-500">No products found for <strong className="text-white">"{query}"</strong></p>
                                <p className="text-gray-700 text-sm mt-1">Try different keywords</p>
                            </div>
                        ) : query && results.length > 0 ? (
                            <div className="p-3 space-y-1">
                                <p className="text-xs text-gray-600 px-2 py-2">{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</p>
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
                                                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gold transition-colors flex-shrink-0 self-center" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-4">
                                <p className="text-xs text-gray-600 uppercase tracking-wider mb-3 px-2">All Products</p>
                                <div className="space-y-1">
                                    {products.slice(0, 6).map(product => (
                                        <Link key={product.id} href={`/products/${product.slug}`} onClick={onClose}>
                                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
                                                <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-dark-3">
                                                    <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                                                </div>
                                                <span className="text-gray-300 text-sm group-hover:text-white transition-colors flex-1 truncate">
                                                    {product.name}
                                                </span>
                                                <span className="text-gold text-sm font-bold flex-shrink-0">
                                                    ₹{parseFloat(product.discounted_price).toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer hint */}
                    <div className="px-5 py-3 border-t border-white/5 flex-shrink-0 bg-dark-2">
                        <p className="text-xs text-gray-700">
                            Press <kbd className="bg-dark-3 border border-white/10 rounded px-1.5 py-0.5 text-gray-500">Esc</kbd> to close
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
