'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Sparkles, Target, Heart, Zap, Shield, Award } from 'lucide-react';

export default function AboutPage() {
    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digipro';
    return (
        <div className="min-h-screen bg-dark">
            <Header />
            <main className="pt-28 pb-16 max-w-4xl mx-auto px-4">
                {/* Hero */}
                <div className="text-center mb-16 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
                    <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-gold to-gold-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-gold/20">
                            <Sparkles className="w-8 h-8 text-black" />
                        </div>
                        <h1 className="font-display text-6xl sm:text-7xl text-white mb-4">
                            ABOUT <span className="text-gold-gradient">{storeName}</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                            We curate and deliver premium digital products that empower learners, creators, and entrepreneurs.
                        </p>
                    </div>
                </div>

                {/* Mission */}
                <div className="bg-dark-2 border border-white/5 rounded-2xl p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gold/3 rounded-full blur-[60px]" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <Target className="w-5 h-5 text-gold" />
                            <h2 className="font-display text-2xl text-white">OUR MISSION</h2>
                        </div>
                        <p className="text-gray-400 leading-relaxed">
                            At {storeName}, our mission is simple — deliver exceptional digital products at prices that make premium knowledge accessible to everyone. Every product is handpicked to ensure maximum value for our customers.
                        </p>
                    </div>
                </div>

                {/* Values */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {[
                        { icon: Zap, title: 'Instant Delivery', desc: 'Get your products immediately after payment via email and WhatsApp.' },
                        { icon: Shield, title: 'Secure Payments', desc: 'All transactions powered by Razorpay — India\'s most trusted payment gateway.' },
                        { icon: Award, title: 'Premium Quality', desc: 'Every product is carefully curated to deliver real, tangible value.' },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="bg-dark-2 border border-white/5 rounded-2xl p-6 hover:border-gold/20 transition-colors">
                            <div className="w-10 h-10 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center mb-4">
                                <Icon className="w-5 h-5 text-gold" />
                            </div>
                            <h3 className="font-display text-lg text-white mb-2">{title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center bg-gradient-to-r from-gold/10 via-gold/5 to-transparent border border-gold/15 rounded-2xl p-8">
                    <Heart className="w-8 h-8 text-gold mx-auto mb-3" />
                    <h3 className="font-display text-3xl text-white mb-2">MADE WITH PASSION</h3>
                    <p className="text-gray-500 text-sm mb-6">We genuinely care about your success and learning journey.</p>
                    <a href="/" className="btn-gold inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm">
                        Explore Products
                    </a>
                </div>
            </main>
            <Footer />
        </div>
    );
}
