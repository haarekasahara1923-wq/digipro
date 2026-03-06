'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail, MessageCircle, Clock, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [sent, setSent] = useState(false);
    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digipro';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) { toast.error('Fill all fields'); return; }
        // Open mail client with pre-filled info
        const mailSubject = encodeURIComponent(`Contact from ${form.name} — ${storeName}`);
        const mailBody = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`);
        window.open(`mailto:digipro1923@gmail.com?subject=${mailSubject}&body=${mailBody}`, '_blank');
        setSent(true);
        toast.success('Opening email client...');
    };

    return (
        <div className="min-h-screen bg-dark">
            <Header />
            <main className="pt-28 pb-16 max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-14 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold/4 rounded-full blur-[100px] pointer-events-none" />
                    <div className="relative">
                        <h1 className="font-display text-6xl sm:text-7xl text-white mb-4">
                            CONTACT <span className="text-gold-gradient">US</span>
                        </h1>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            Have a question, issue, or feedback? We're here to help. Reach out and we'll respond promptly.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Info */}
                    <div className="lg:col-span-2 space-y-4">
                        {[
                            {
                                icon: Mail,
                                title: 'Email Us',
                                value: 'digipro1923@gmail.com',
                                href: 'mailto:digipro1923@gmail.com',
                                desc: 'Best for general queries & order issues',
                            },
                            {
                                icon: Clock,
                                title: 'Response Time',
                                value: 'Within 24 hours',
                                desc: 'We respond to all emails within 24 hours',
                            },
                            {
                                icon: MessageCircle,
                                title: 'For Orders',
                                value: 'Check your email & WhatsApp',
                                desc: 'Download links are sent automatically after payment',
                            },
                        ].map(({ icon: Icon, title, value, href, desc }) => (
                            <div key={title} className="bg-dark-2 border border-white/5 rounded-2xl p-5 hover:border-gold/20 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-5 h-5 text-gold" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{title}</p>
                                        {href ? (
                                            <a href={href} className="text-white text-sm font-medium hover:text-gold transition-colors">{value}</a>
                                        ) : (
                                            <p className="text-white text-sm font-medium">{value}</p>
                                        )}
                                        <p className="text-gray-600 text-xs mt-1">{desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-3">
                        <div className="bg-dark-2 border border-white/5 rounded-2xl p-6">
                            {sent ? (
                                <div className="text-center py-10">
                                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                                    <h3 className="font-display text-2xl text-white mb-2">MESSAGE READY!</h3>
                                    <p className="text-gray-500 text-sm">Your email client should have opened. Send it and we'll reply within 24 hours.</p>
                                    <button onClick={() => setSent(false)} className="mt-5 text-gold text-sm hover:text-gold-light transition-colors">
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <h2 className="font-display text-2xl text-white mb-4">SEND A MESSAGE</h2>
                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Your Name *</label>
                                        <input type="text" placeholder="Enter your name" value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })} className="input-dark" />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Email Address *</label>
                                        <input type="email" placeholder="your@email.com" value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })} className="input-dark" />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Message *</label>
                                        <textarea rows={5} placeholder="Describe your query, issue, or feedback..."
                                            value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                            className="input-dark resize-none" />
                                    </div>
                                    <button type="submit" className="btn-gold w-full py-4 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2">
                                        <Send className="w-4 h-4" />
                                        Send Message
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
