'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
    Sparkles, Target, Heart, Zap, Shield, Award,
    BookOpen, Users, Star, TrendingUp, Lock, Mail,
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digipro';

    return (
        <div className="min-h-screen bg-dark">
            <Header />
            <main className="pt-28 pb-16 max-w-4xl mx-auto px-4">

                {/* ── Hero ──────────────────────────────────────────────────────────── */}
                <div className="text-center mb-16 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
                    <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-gold to-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-gold/30">
                            <Sparkles className="w-10 h-10 text-black" />
                        </div>
                        <h1 className="font-display text-6xl sm:text-7xl text-white mb-4">
                            ABOUT <span className="text-gold-gradient">{storeName}</span>
                        </h1>
                        <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed mb-8">
                            Your one-stop destination for premium digital products — curated with care, delivered instantly.
                        </p>
                        <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 text-gold px-5 py-2 rounded-full text-sm font-semibold">
                            <Star className="w-4 h-4 fill-gold" /> Trusted by Thousands of Learners & Creators
                        </div>
                    </div>
                </div>

                {/* ── Intro Banner ─────────────────────────────────────────────────── */}
                <div className="relative bg-gradient-to-br from-gold/10 via-dark-2 to-dark-2 border border-gold/20 rounded-3xl p-8 mb-10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[80px]" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <BookOpen className="w-6 h-6 text-gold" />
                            <h2 className="font-display text-2xl text-white">WHO WE ARE</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed text-base mb-4">
                            <span className="text-gold font-bold">{storeName}</span> is a digital product marketplace born from a simple belief:
                            <em className="text-white"> premium knowledge should not be out of reach.</em> We are a passionate team of educators,
                            marketers, and creators based in Dehradun, Uttarakhand — committed to delivering high-quality e-books,
                            courses, templates, and tools that make a real difference.
                        </p>
                        <p className="text-gray-400 leading-relaxed text-sm">
                            Whether you are a student, a freelancer, a business owner, or a curious mind — we have carefully
                            handpicked products designed to help you learn faster, work smarter, and grow bigger.
                            Every purchase is backed by our promise of <span className="text-gold">instant delivery</span>,
                            <span className="text-gold"> secure payments</span>, and <span className="text-gold">genuine value</span>.
                        </p>
                    </div>
                </div>

                {/* ── Mission ──────────────────────────────────────────────────────── */}
                <div className="bg-dark-2 border border-white/5 rounded-2xl p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gold/3 rounded-full blur-[60px]" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <Target className="w-5 h-5 text-gold" />
                            <h2 className="font-display text-2xl text-white">OUR MISSION</h2>
                        </div>
                        <p className="text-gray-400 leading-relaxed">
                            At {storeName}, our mission is simple — <strong className="text-white">deliver exceptional digital products at prices that make
                                premium knowledge accessible to everyone.</strong> Every product is handpicked to ensure maximum value.
                            We do not just sell files — we deliver transformations.
                        </p>
                    </div>
                </div>

                {/* ── Values ───────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    {[
                        { icon: Zap, title: 'Instant Delivery', desc: 'Your download link hits your inbox the moment your payment is verified — no waiting, no delays.' },
                        { icon: Shield, title: 'Cashfree Secured', desc: 'All transactions are encrypted and powered by Cashfree — India\'s most trusted payment gateway.' },
                        { icon: Award, title: 'Premium Quality', desc: 'Every product is carefully curated and tested to deliver real, actionable, tangible value.' },
                        { icon: Lock, title: 'Private & Secure', desc: 'Your personal information is never shared. Links are delivered privately to your email only.' },
                        { icon: Users, title: 'Growing Community', desc: `Join thousands of learners and creators who trust ${storeName} for their digital needs.` },
                        { icon: TrendingUp, title: 'Real Results', desc: 'Our products are designed to create measurable impact in your learning and business journey.' },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="bg-dark-2 border border-white/5 rounded-2xl p-6 hover:border-gold/25 transition-all duration-300 group">
                            <div className="w-10 h-10 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                                <Icon className="w-5 h-5 text-gold" />
                            </div>
                            <h3 className="font-display text-lg text-white mb-2">{title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>

                {/* ── Why Choose Us ────────────────────────────────────────────────── */}
                <div className="bg-dark-2 border border-white/5 rounded-2xl p-8 mb-10">
                    <h2 className="font-display text-2xl text-white mb-6 text-center">WHY CHOOSE <span className="text-gold">{storeName}</span>?</h2>
                    <div className="space-y-4">
                        {[
                            '⚡ Download links are delivered to your email within seconds of payment confirmation.',
                            '🔒 All payments are 100% secure via Cashfree with bank-grade 256-bit SSL encryption.',
                            '📦 No subscriptions, no hidden fees — pay once, own it forever.',
                            '🎁 Bonus resources bundled with many products at no extra cost.',
                            '📞 Dedicated support via email and WhatsApp for any post-purchase issues.',
                            '🔄 Transparent refund policy — hassle-free within defined timelines.',
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 bg-dark-3 rounded-xl px-4 py-3 border border-white/5">
                                <span className="text-base leading-relaxed text-gray-300">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── CTA ──────────────────────────────────────────────────────────── */}
                <div className="text-center bg-gradient-to-r from-gold/10 via-gold/5 to-transparent border border-gold/15 rounded-2xl p-10">
                    <Heart className="w-8 h-8 text-gold mx-auto mb-3" />
                    <h3 className="font-display text-3xl text-white mb-2">MADE WITH PASSION IN DEHRADUN</h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-lg mx-auto">
                        We genuinely care about your success. Every product we list, every price we set, and every
                        email we send is done with the intention of making your journey better.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/" className="btn-gold inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm">
                            Explore Products
                        </Link>
                        <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm border border-white/10 text-gray-300 hover:border-gold/30 hover:text-gold transition-all">
                            <Mail className="w-4 h-4" /> Contact Us
                        </Link>
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
}
