'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { IndianRupee, TrendingUp, Package, Calendar } from 'lucide-react';

export default function RevenuePage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/orders')
      .then(r => { if (r.status === 401) { router.push('/admin/login'); } return r.json(); })
      .then(data => { setOrders(data.orders?.filter((o: any) => o.status === 'paid') || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.amount), 0);

  const today = new Date().toDateString();
  const todayRevenue = orders
    .filter(o => new Date(o.created_at).toDateString() === today)
    .reduce((s, o) => s + parseFloat(o.amount), 0);

  const thisMonth = new Date();
  const monthRevenue = orders
    .filter(o => {
      const d = new Date(o.created_at);
      return d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear();
    })
    .reduce((s, o) => s + parseFloat(o.amount), 0);

  // Revenue by product
  const byProduct: Record<string, { name: string; revenue: number; count: number }> = {};
  orders.forEach(o => {
    const key = o.product_name || 'Unknown';
    if (!byProduct[key]) byProduct[key] = { name: key, revenue: 0, count: 0 };
    byProduct[key].revenue += parseFloat(o.amount);
    byProduct[key].count += 1;
  });
  const productRevenue = Object.values(byProduct).sort((a, b) => b.revenue - a.revenue);
  const maxRevenue = productRevenue[0]?.revenue || 1;

  const statCards = [
    { icon: IndianRupee, label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'text-gold', bg: 'bg-gold/10' },
    { icon: Calendar, label: "Today's Revenue", value: `₹${todayRevenue.toLocaleString('en-IN')}`, color: 'text-green-400', bg: 'bg-green-400/10' },
    { icon: TrendingUp, label: 'This Month', value: `₹${monthRevenue.toLocaleString('en-IN')}`, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { icon: Package, label: 'Total Orders', value: orders.length, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  return (
    <div className="flex min-h-screen bg-dark">
      <AdminSidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl text-white">REVENUE</h1>
          <p className="text-gray-500 text-sm mt-1">Financial overview of your store</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-dark-2 rounded-2xl p-6 border border-white/5 animate-pulse h-32" />
            ))
          ) : statCards.map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-dark-2 border border-white/5 rounded-2xl p-6">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{label}</p>
              <p className={`font-display text-3xl ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Revenue by product */}
        <div className="bg-dark-2 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="font-display text-xl text-white">REVENUE BY PRODUCT</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading...</div>
          ) : productRevenue.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No revenue data yet</div>
          ) : (
            <div className="p-6 space-y-4">
              {productRevenue.map(({ name, revenue, count }) => (
                <div key={name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white text-sm font-medium truncate max-w-[60%]">{name}</span>
                    <div className="text-right">
                      <span className="text-gold font-bold">₹{revenue.toLocaleString('en-IN')}</span>
                      <span className="text-gray-500 text-xs ml-2">({count} sale{count !== 1 ? 's' : ''})</span>
                    </div>
                  </div>
                  <div className="h-2 bg-dark-3 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gold to-gold-dark rounded-full transition-all duration-700"
                      style={{ width: `${(revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent paid orders */}
        {!loading && orders.length > 0 && (
          <div className="mt-6 bg-dark-2 border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="font-display text-xl text-white">RECENT TRANSACTIONS</h2>
            </div>
            <div className="divide-y divide-white/5">
              {orders.slice(0, 10).map(order => (
                <div key={order.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm">{order.buyer_name}</p>
                    <p className="text-gray-500 text-xs">{order.product_name} • {new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  <span className="text-gold font-bold">₹{parseFloat(order.amount).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
