'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RotateCcw, AlertTriangle, CheckCircle, Mail, Clock, CreditCard, DollarSign, Phone } from 'lucide-react';

export default function RefundsPage() {
    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digipro';

    return (
        <div className="min-h-screen bg-dark">
            <Header />
            <main className="pt-28 pb-16 max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-12 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
                    <div className="relative">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold uppercase tracking-wider mb-4">
                            <RotateCcw className="w-3 h-3" />
                            Policy & Transparency
                        </div>
                        <h1 className="font-display text-5xl sm:text-6xl text-white mb-4">
                            REFUNDS & <span className="text-gold-gradient">CANCELLATIONS</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl">
                            We value our customers' satisfaction. Our refund and cancellation policies are designed to be fair and transparent for all digital purchases.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Cancellation Section */}
                    <div className="bg-dark-2 border border-white/5 rounded-2xl p-8 hover:border-gold/10 transition-all">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                            </div>
                            <h2 className="font-display text-2xl text-white text-gold-gradient">CANCELLATION POLICY</h2>
                        </div>
                        <div className="space-y-4 text-gray-400 leading-relaxed">
                            <p>
                                Since we offer digital products with instant delivery, cancellations are only possible under specific circumstances within <strong className="text-white">2 days (48 hours)</strong> of purchase.
                            </p>
                            <ul className="list-disc list-inside space-y-2 pl-2">
                                <li>Cancellation requests must be sent via email to <strong className="text-gold">hrdazo2022@gmail.com</strong>.</li>
                                <li>A valid reason for cancellation must be provided in the request.</li>
                                <li>Once the digital product has been downloaded or the access link has been used, cancellation requests may be rejected.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Refund Section */}
                    <div className="bg-dark-2 border border-white/5 rounded-2xl p-8 hover:border-gold/10 transition-all relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex items-center gap-4 mb-6 relative">
                            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center border border-gold/20">
                                <RotateCcw className="w-6 h-6 text-gold" />
                            </div>
                            <h2 className="font-display text-2xl text-white">REFUND PROCESS</h2>
                        </div>

                        <div className="space-y-6 relative">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-5 bg-dark-3 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Mail className="w-4 h-4 text-gold" />
                                        <p className="text-white font-semibold">Request Refund</p>
                                    </div>
                                    <p className="text-xs text-gray-500">Send an email request with your Order ID and payment details.</p>
                                </div>
                                <div className="p-5 bg-dark-3 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-4 h-4 text-gold" />
                                        <p className="text-white font-semibold">Timeline</p>
                                    </div>
                                    <p className="text-xs text-gray-500">Refunds are processed within 5 business days of approval.</p>
                                </div>
                            </div>

                            <div className="p-6 bg-gold/5 border border-gold/15 rounded-2xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <CheckCircle className="w-5 h-5 text-gold" />
                                    <h3 className="text-white font-bold">Important Information</h3>
                                </div>
                                <ul className="space-y-3 text-sm text-gray-300">
                                    <li className="flex gap-2">
                                        <CreditCard className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                                        Refunds will be credited to the original account or UPI ID used during the payment process.
                                    </li>
                                    <li className="flex gap-2">
                                        <DollarSign className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                                        Processing fees (if any) may be deducted by the payment gateway as per their policy.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Support Banner */}
                    <div className="text-center p-8 bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 rounded-2xl">
                        <p className="text-gray-300 mb-4">Need help with your refund or order?</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a href="mailto:hrdazo2022@gmail.com" className="btn-gold px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                                <Mail className="w-4 h-4" /> Email Support
                            </a>
                            <a href="https://wa.me/919457440300" target="_blank" className="px-6 py-2 rounded-lg text-sm font-bold border border-white/10 text-white hover:bg-white/5 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-green-400" /> WhatsApp Support
                            </a>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
