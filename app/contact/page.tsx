'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, MessageCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SUPPORT_EMAIL = 'hrdazo2022@gmail.com';

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digipro';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error('Please enter your name'); return; }
        if (!form.email.trim() || !form.email.includes('@')) { toast.error('Please enter a valid email'); return; }
        if (!form.subject.trim()) { toast.error('Please enter a subject'); return; }
        if (!form.message.trim() || form.message.trim().length < 20) {
            toast.error('Please describe your issue in at least 20 characters'); return;
        }

        setSending(true);
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                setSent(true);
                toast.success('Message sent! We\'ll respond within 24 hours.');
            } else {
                // Fallback to mailto if API fails
                const mailSubject = encodeURIComponent(`[${storeName} Support] ${form.subject} — from ${form.name}`);
                const mailBody = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\nMessage:\n${form.message}`);
                window.open(`mailto:${SUPPORT_EMAIL}?subject=${mailSubject}&body=${mailBody}`, '_blank');
                setSent(true);
                toast.success('Your email client has opened. Please send the pre-filled email.');
            }
        } catch {
            const mailSubject = encodeURIComponent(`[${storeName} Support] ${form.subject} — from ${form.name}`);
            const mailBody = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\nMessage:\n${form.message}`);
            window.open(`mailto:${SUPPORT_EMAIL}?subject=${mailSubject}&body=${mailBody}`, '_blank');
            setSent(true);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark">
            <Header />
            <main className="pt-28 pb-16 max-w-5xl mx-auto px-4">

                {/* ── Header ───────────────────────────────────────────────────────── */}
                <div className="text-center mb-14 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold/4 rounded-full blur-[100px] pointer-events-none" />
                    <div className="relative">
                        <h1 className="font-display text-6xl sm:text-7xl text-white mb-4">
                            CONTACT <span className="text-gold-gradient">US</span>
                        </h1>
                        <p className="text-gray-400 max-w-xl mx-auto text-base">
                            Have a question, issue, or feedback? We're here to help. Fill the form below
                            or reach us directly — we respond within 24 hours.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                    {/* ── Info Cards ───────────────────────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-4">

                        <div className="bg-dark-2 border border-white/5 rounded-2xl p-5 hover:border-gold/20 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-5 h-5 text-gold" />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Email Us</p>
                                    <a href={`mailto:${SUPPORT_EMAIL}`} className="text-white text-sm font-medium hover:text-gold transition-colors break-all">
                                        {SUPPORT_EMAIL}
                                    </a>
                                    <p className="text-gray-600 text-xs mt-1">Best for general queries & order issues</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-dark-2 border border-white/5 rounded-2xl p-5 hover:border-gold/20 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-5 h-5 text-gold" />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Phone / WhatsApp</p>
                                    <a href="tel:+919457440300" className="text-white text-sm font-medium hover:text-gold transition-colors">
                                        +91 94574 40300
                                    </a>
                                    <div className="mt-1">
                                        <a
                                            href="https://wa.me/919457440300"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-green-400 text-xs hover:text-green-300 transition-colors"
                                        >
                                            <MessageCircle className="w-3 h-3" /> Message on WhatsApp
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-dark-2 border border-white/5 rounded-2xl p-5 hover:border-gold/20 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-gold" />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Address</p>
                                    <p className="text-white text-sm font-medium leading-relaxed">
                                        Gangotri Vihar,<br />
                                        Dehradun (UK) — 248001
                                    </p>
                                    <p className="text-gray-600 text-xs mt-1">Uttarakhand, India</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-dark-2 border border-white/5 rounded-2xl p-5 hover:border-gold/20 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-5 h-5 text-gold" />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Response Time</p>
                                    <p className="text-white text-sm font-medium">Within 24 Hours</p>
                                    <p className="text-gray-600 text-xs mt-1">Mon–Sat, 9 AM – 7 PM IST</p>
                                </div>
                            </div>
                        </div>

                        {/* Post-purchase note */}
                        <div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-amber-400 text-xs font-bold uppercase tracking-wide mb-1">After Purchase?</p>
                                    <p className="text-gray-400 text-xs leading-relaxed">
                                        Download links are sent <strong className="text-white">instantly to your email</strong> after payment
                                        verification. Not received? Contact us immediately via email or WhatsApp above.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ── Support Form ─────────────────────────────────────────────── */}
                    <div className="lg:col-span-3">
                        <div className="bg-dark-2 border border-white/5 rounded-2xl p-6">
                            {sent ? (
                                <div className="text-center py-12">
                                    <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
                                    <h3 className="font-display text-2xl text-white mb-2">MESSAGE SENT!</h3>
                                    <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                                        We've received your grievance and will respond to <span className="text-gold">{form.email}</span> within 24 hours.
                                    </p>
                                    <button
                                        onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                                        className="text-gold text-sm hover:text-amber-300 transition-colors"
                                    >
                                        Send another message →
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="mb-2">
                                        <h2 className="font-display text-2xl text-white">SUPPORT FORM</h2>
                                        <p className="text-gray-500 text-xs mt-1">Describe your grievance — we take every query seriously.</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-gray-400 mb-2 block">Your Name *</label>
                                            <input
                                                type="text"
                                                placeholder="Full name"
                                                value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })}
                                                className="input-dark"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-400 mb-2 block">Email Address *</label>
                                            <input
                                                type="email"
                                                placeholder="your@email.com"
                                                value={form.email}
                                                onChange={e => setForm({ ...form, email: e.target.value })}
                                                className="input-dark"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">Subject *</label>
                                        <select
                                            value={form.subject}
                                            onChange={e => setForm({ ...form, subject: e.target.value })}
                                            className="input-dark"
                                        >
                                            <option value="">Select a subject...</option>
                                            <option value="Download link not received">Download link not received</option>
                                            <option value="Download link not working">Download link not working / broken</option>
                                            <option value="Refund request">Refund request</option>
                                            <option value="Payment issue">Payment issue</option>
                                            <option value="Wrong product delivered">Wrong product delivered</option>
                                            <option value="General query">General query</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-400 mb-2 block">
                                            Describe Your Issue / Grievance *
                                            <span className="text-gray-600 ml-1">(min. 20 characters)</span>
                                        </label>
                                        <textarea
                                            rows={6}
                                            placeholder="Please describe your issue in detail. Include your order ID or payment reference if available..."
                                            value={form.message}
                                            onChange={e => setForm({ ...form, message: e.target.value })}
                                            className="input-dark resize-none"
                                        />
                                        <p className="text-gray-700 text-xs mt-1 text-right">{form.message.length} characters</p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="btn-gold w-full py-4 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {sending ? (
                                            <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Sending...</>
                                        ) : (
                                            <><Send className="w-4 h-4" /> Submit Grievance</>
                                        )}
                                    </button>

                                    <p className="text-center text-xs text-gray-600">
                                        By submitting, you agree to our{' '}
                                        <a href="/terms" className="text-gold hover:underline">Terms & Conditions</a>.
                                        We respond within 24 business hours.
                                    </p>
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
