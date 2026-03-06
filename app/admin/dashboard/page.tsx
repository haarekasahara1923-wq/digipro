'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { Package, Users, IndianRupee, TrendingUp, RefreshCw, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  recentOrders: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/orders'),
      ]);

      if (productsRes.status === 401) { router.push('/admin/login'); return; }

      const { products } = await productsRes.json();
      const { orders } = await ordersRes.json();

      const paidOrders = orders.filter((o: any) => o.status === 'paid');
      const totalRevenue = paidOrders.reduce((s: number, o: any) => s + parseFloat(o.amount), 0);

      const today = new Date().toDateString();
      const todayRevenue = paidOrders
        .filter((o: any) => new Date(o.created_at).toDateString() === today)
        .reduce((s: number, o: any) => s + parseFloat(o.amount), 0);

      setStats({
        totalProducts: products.length,
        totalOrders: paidOrders.length,
        totalRevenue,
        todayRevenue,
        recentOrders: orders.slice(0, 8),
      });
    } catch { router.push('/admin/login'); }
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, []);

  const cards = stats ? [
    { icon: Package, label: 'Total Products', value: stats.totalProducts, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/10' },
    { icon: Users, label: 'Total Sales', value: stats.totalOrders, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/10' },
    { icon: IndianRupee, label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/10' },
    { icon: TrendingUp, label: "Today's Revenue", value: `₹${stats.todayRevenue.toLocaleString('en-IN')}`, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/10' },
  ] : [];

  return (
    <div className="flex min-h-screen bg-dark">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-6 md:p-8 pt-20 md:pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-white">DASHBOARD</h1>
            <p className="text-gray-500 text-sm mt-1">Overview of your store</p>
          </div>
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors text-sm border border-white/10 rounded-xl px-3 py-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-dark-2 rounded-2xl p-6 border border-white/5 animate-pulse h-32" />
            ))
          ) : cards.map(({ icon: Icon, label, value, color, bg, border }) => (
            <div key={label} className={`bg-dark-2 border ${border} rounded-2xl p-5 md:p-6 hover:border-gold/20 transition-colors`}>
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{label}</p>
              <p className={`font-display text-2xl md:text-3xl ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { href: '/admin/products/add', label: 'Add Product', color: 'bg-gold text-black' },
            { href: '/admin/products', label: 'View Products', color: 'bg-dark-3 text-white border border-white/10' },
            { href: '/admin/leads', label: 'View Orders', color: 'bg-dark-3 text-white border border-white/10' },
            { href: '/admin/revenue', label: 'Revenue Stats', color: 'bg-dark-3 text-white border border-white/10' },
          ].map(({ href, label, color }) => (
            <Link key={href} href={href}>
              <button className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all hover:opacity-90 ${color}`}>
                {label}
              </button>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <div className="bg-dark-2 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-display text-xl text-white">RECENT ORDERS</h2>
            <Link href="/admin/leads">
              <button className="text-gold text-xs flex items-center gap-1 hover:text-gold-light transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-600">Loading...</div>
          ) : !stats?.recentOrders.length ? (
            <div className="p-8 text-center text-gray-600">No orders yet. Share your products!</div>
          ) : (
            <div className="divide-y divide-white/5">
              {stats?.recentOrders.map((order: any) => (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{order.buyer_name}</p>
                    <p className="text-gray-500 text-xs">{order.buyer_email} • {order.product_name || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gold font-semibold text-sm">₹{parseFloat(order.amount).toLocaleString('en-IN')}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'paid' ? 'bg-green-500/10 text-green-400' :
                        order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-red-500/10 text-red-400'
                      }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
