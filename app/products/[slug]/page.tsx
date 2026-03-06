'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Share2, Copy, ShoppingBag, Shield, Zap, CheckCircle, ArrowLeft, Sparkles, MessageCircle } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  original_price: string;
  discounted_price: string;
  image_url: string;
  slug: string;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);

  const slug = params.slug as string;
  const productUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/products/${slug}`
    : '';

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.product) {
          setProduct(data.product);
          // Facebook Pixel ViewContent
          if (typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('track', 'ViewContent', {
              content_name: data.product.name,
              value: parseFloat(data.product.discounted_price),
              currency: 'INR',
            });
          }
        } else {
          router.push('/');
        }
        setLoading(false);
      })
      .catch(() => { setLoading(false); router.push('/'); });
  }, [slug]);

  const copyLink = () => {
    navigator.clipboard.writeText(productUrl);
    toast.success('Link copied to clipboard!');
    setShareOpen(false);
  };

  const shareWhatsApp = () => {
    const text = `Check out this amazing product: *${product?.name}*\n\n${productUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setShareOpen(false);
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank');
    setShareOpen(false);
  };

  const nativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: product?.name, url: productUrl });
    } else {
      setShareOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const disc = Math.round(
    ((parseFloat(product.original_price) - parseFloat(product.discounted_price)) /
      parseFloat(product.original_price)) * 100
  );

  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digital Store';

  return (
    <div className="min-h-screen bg-dark">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-4 h-4 text-gold" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gold rounded-lg flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-black" />
              </div>
              <span className="font-display text-xl text-white">{storeName}</span>
            </div>
          </Link>
          <button
            onClick={nativeShare}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gold transition-colors border border-white/10 hover:border-gold/30 rounded-lg px-3 py-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </nav>

      <div className="pt-24 pb-16 max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Product Image */}
          <div className="relative">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-dark-3 border border-white/5">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {disc > 0 && (
                <div className="absolute top-4 left-4 bg-gold text-black font-black text-lg px-3 py-1 rounded-xl">
                  -{disc}% OFF
                </div>
              )}
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gold/5 rounded-3xl blur-xl -z-10" />
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-24">
            {/* Category badge */}
            <div className="inline-flex items-center gap-1 bg-gold/10 border border-gold/20 rounded-full px-3 py-1 mb-4">
              <ShoppingBag className="w-3 h-3 text-gold" />
              <span className="text-gold text-xs font-semibold uppercase tracking-wide">Digital Product</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl text-white mb-6 leading-tight">
              {product.name}
            </h1>

            {product.description && (
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                {product.description}
              </p>
            )}

            {/* Pricing */}
            <div className="bg-dark-3 border border-white/5 rounded-2xl p-6 mb-8">
              <div className="flex items-end gap-4 mb-2">
                <span className="font-display text-5xl text-gold">
                  ₹{parseFloat(product.discounted_price).toLocaleString('en-IN')}
                </span>
                <div className="mb-2">
                  <span className="price-original text-lg">
                    ₹{parseFloat(product.original_price).toLocaleString('en-IN')}
                  </span>
                  {disc > 0 && (
                    <p className="text-green-400 text-sm font-semibold">
                      You save ₹{(parseFloat(product.original_price) - parseFloat(product.discounted_price)).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield className="w-3 h-3 text-gold" />
                <span>Inclusive of all taxes • Secure payment via Razorpay</span>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-3 mb-8">
              {[
                { icon: Zap, text: 'Instant delivery to Email & WhatsApp' },
                { icon: Shield, text: 'Payment secured by Razorpay' },
                { icon: CheckCircle, text: 'Google Drive download link shared immediately' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-gray-400">
                  <Icon className="w-4 h-4 text-gold flex-shrink-0" />
                  <span className="text-sm">{text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link href={`/checkout/${product.slug}`}>
              <button className="btn-gold w-full py-5 rounded-xl text-base font-black uppercase tracking-widest flex items-center justify-center gap-3 mb-4">
                <ShoppingBag className="w-5 h-5" />
                Buy Now — ₹{parseFloat(product.discounted_price).toLocaleString('en-IN')}
              </button>
            </Link>

            {/* Share */}
            <div className="relative">
              <button
                onClick={() => setShareOpen(!shareOpen)}
                className="w-full py-3 rounded-xl border border-white/10 text-gray-400 hover:border-gold/30 hover:text-gold transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Share2 className="w-4 h-4" />
                Share this product
              </button>

              {shareOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-dark-3 border border-white/10 rounded-xl overflow-hidden z-10">
                  <button onClick={copyLink} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-sm text-gray-300">
                    <Copy className="w-4 h-4 text-gold" /> Copy link
                  </button>
                  <button onClick={shareWhatsApp} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-sm text-gray-300">
                    <MessageCircle className="w-4 h-4 text-green-400" /> Share on WhatsApp
                  </button>
                  <button onClick={shareFacebook} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-sm text-gray-300">
                    <Share2 className="w-4 h-4 text-blue-400" /> Share on Facebook
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
