'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, Scale, FileText, CheckCircle, Mail, Phone, Lock } from 'lucide-react';

export default function TermsPage() {
    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digipro';
    const lastUpdated = 'March 08, 2026';

    return (
        <div className="min-h-screen bg-dark">
            <Header />
            <main className="pt-28 pb-16 max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-12 relative">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
                    <div className="relative">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold uppercase tracking-wider mb-4 animate-pulse">
                            <Shield className="w-3 h-3" />
                            Legal Compliance
                        </div>
                        <h1 className="font-display text-5xl sm:text-6xl text-white mb-4">
                            TERMS & <span className="text-gold-gradient">CONDITIONS</span>
                        </h1>
                        <p className="text-gray-500 text-sm">Last Updated: {lastUpdated}</p>
                    </div>
                </div>

                <div className="space-y-8 text-gray-400">
                    <section className="bg-dark-2 border border-white/5 rounded-2xl p-8 hover:border-gold/10 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <Scale className="w-6 h-6 text-gold" />
                            <h2 className="font-display text-2xl text-white">INTRODUCTION</h2>
                        </div>
                        <p className="leading-relaxed">
                            Welcome to {storeName}. These terms and conditions outline the rules and regulations for the use of our website. By accessing this website and purchasing our digital products, we assume you accept these terms and conditions. Do not continue to use {storeName} if you do not agree to all of the terms and conditions stated on this page.
                        </p>
                    </section>

                    <section className="bg-dark-2 border border-white/5 rounded-2xl p-8 hover:border-gold/10 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="w-6 h-6 text-gold" />
                            <h2 className="font-display text-2xl text-white">DIGITAL PRODUCTS & DELIVERY</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-gold/5 border border-gold/10 rounded-xl border-l-4 border-l-gold">
                                <p className="text-white font-semibold flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-gold" /> Instant Delivery Policy
                                </p>
                                <p className="mt-1">
                                    Our products are digital and delivered instantly. Upon successful payment verification, a download link will be sent directly to your registered Email address immediately.
                                </p>
                            </div>
                            <p className="leading-relaxed">
                                Please ensure that the email address provided during checkout is accurate. If you do not receive the download link within 5 minutes of your purchase, please check your spam/junk folder.
                            </p>
                            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                                <p className="text-white font-semibold flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-400" /> Troubleshooting
                                </p>
                                <p className="mt-1">
                                    If the download link still does not arrive, or if you encounter issues downloading the product from the link provided, please contact us immediately via Email or WhatsApp.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-dark-2 border border-white/5 rounded-2xl p-8 hover:border-gold/10 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="w-6 h-6 text-gold" />
                            <h2 className="font-display text-2xl text-white">USER CONDUCT & USAGE</h2>
                        </div>
                        <ul className="list-disc list-inside space-y-2 leading-relaxed pl-2">
                            <li>Digital products purchased are for personal use only unless stated otherwise.</li>
                            <li>The redistribution, resale, or sub-licensing of our products is strictly prohibited.</li>
                            <li>Users must provide accurate contact and payment information.</li>
                        </ul>
                    </section>

                    <section className="bg-dark-2 border border-white/5 rounded-2xl p-8 hover:border-gold/10 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="w-6 h-6 text-gold" />
                            <h2 className="font-display text-2xl text-white">JURISDICTION</h2>
                        </div>
                        <p className="leading-relaxed">
                            These terms and conditions are governed by and construed in accordance with the laws of India. Any disputes relating to these terms and conditions will be subject to the exclusive jurisdiction of the courts of <strong className="text-white">Dehradun, Uttarakhand</strong>.
                        </p>
                    </section>

                    <section className="bg-dark-2 border border-white/5 rounded-2xl p-8 hover:border-gold/10 transition-all">
                        <h2 className="font-display text-2xl text-white mb-4">CONTACT INFORMATION</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-gold" />
                                <span>hrdazo2022@gmail.com</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gold" />
                                <span>+91 94574 40300</span>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}

import { Zap, AlertCircle } from 'lucide-react';
