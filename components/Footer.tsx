import Link from 'next/link';
import { Sparkles, Shield, Zap, Heart, Mail, Phone, Info } from 'lucide-react';

export default function Footer() {
    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digipro';
    const tagline = process.env.NEXT_PUBLIC_STORE_TAGLINE || 'Premium Digital Products';
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-white/5 bg-dark-2 mt-20">
            {/* Trust bar */}
            <div className="border-b border-white/5 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap justify-center gap-6 md:gap-12">
                    {[
                        { icon: Shield, text: 'Secure Payments via Razorpay' },
                        { icon: Zap, text: 'Instant Digital Delivery' },
                        { icon: Mail, text: 'Instant Email Delivery' },
                    ].map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-center gap-2 text-gray-500 text-xs">
                            <Icon className="w-3.5 h-3.5 text-gold" />
                            {text}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
                {/* Brand */}
                <div>
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-9 h-9 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-black" />
                        </div>
                        <span className="font-display text-2xl text-white">{storeName}</span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{tagline}</p>
                    <p className="text-gray-600 text-xs mt-3">
                        Premium digital products delivered instantly to your email.
                    </p>
                </div>

                {/* Navigation */}
                <div>
                    <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Quick Links</h4>
                    <ul className="space-y-3">
                        {[
                            { href: '/', label: 'Store' },
                            { href: '/about', label: 'About Us' },
                            { href: '/contact', label: 'Contact Us' },
                        ].map(({ href, label }) => (
                            <li key={href}>
                                <Link href={href} className="text-gray-500 hover:text-gold text-sm transition-colors">
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Get in Touch</h4>
                    <ul className="space-y-3">
                        <li>
                            <a
                                href="mailto:digipro1923@gmail.com"
                                className="flex items-center gap-2 text-gray-500 hover:text-gold text-sm transition-colors"
                            >
                                <Mail className="w-3.5 h-3.5 text-gold" />
                                digipro1923@gmail.com
                            </a>
                        </li>
                        <li className="flex items-start gap-2 text-gray-500 text-sm">
                            <Info className="w-3.5 h-3.5 text-gold mt-0.5 flex-shrink-0" />
                            <span>For support, email us or use the Contact Us page.</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/5 py-5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-gray-600 text-xs">
                        © {year} {storeName}. All rights reserved.
                    </p>
                    <p className="text-gray-700 text-xs flex items-center gap-1">
                        Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> · Secure payments by Razorpay
                    </p>
                </div>
            </div>
        </footer>
    );
}
