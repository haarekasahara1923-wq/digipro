'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { CheckCircle, Clock, XCircle, Download, Search, Filter } from 'lucide-react';

export default function LeadsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetch('/api/admin/orders')
      .then(r => {
        if (r.status === 401) { router.push('/admin/login'); return r; }
        return r;
      })
      .then(r => r.json())
      .then(data => {
        setOrders(data.orders || []);
        setFiltered(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = orders;
    if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(o =>
        o.buyer_name?.toLowerCase().includes(s) ||
        o.buyer_email?.toLowerCase().includes(s) ||
        o.buyer_whatsapp?.includes(s) ||
        o.product_name?.toLowerCase().includes(s)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, orders]);

  const exportCSV = () => {
    const headers = ['Date', 'Buyer Name', 'Email', 'WhatsApp', 'Product', 'Amount', 'Status', 'Link Sent'];
    const rows = filtered.map(o => [
      new Date(o.created_at).toLocaleString('en-IN'),
      o.buyer_name, o.buyer_email, o.buyer_whatsapp,
      o.product_name || '-',
      o.amount, o.status,
      o.drive_link_sent ? 'Yes' : 'No',
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `leads-${Date.now()}.csv`; a.click();
  };

  const statusIcon = (status: string) => {
    if (status === 'paid') return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (status === 'pending') return <Clock className="w-4 h-4 text-yellow-400" />;
    return <XCircle className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="flex min-h-screen bg-dark">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-6 md:p-8 pt-20 md:pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl text-white">LEADS</h1>
            <p className="text-gray-500 text-sm mt-1">{filtered.length} of {orders.length} orders</p>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 text-sm border border-white/10 hover:border-gold/30 text-gray-400 hover:text-gold rounded-xl px-4 py-2 transition-all">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, email, WhatsApp..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-dark pl-9 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-dark w-auto text-sm"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-dark-2 border border-white/5 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No leads found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/5">
                  <tr>
                    {['Date', 'Buyer', 'Contact', 'Product', 'Amount', 'Status', 'Link Sent'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map(order => (
                    <tr key={order.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('en-IN')}
                        <br />
                        <span className="text-gray-600">{new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white text-sm font-medium">{order.buyer_name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-400 text-xs">{order.buyer_email}</p>
                        <p className="text-gray-500 text-xs">{order.buyer_whatsapp}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-300 text-sm truncate max-w-[150px]">{order.product_name || '-'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gold font-semibold text-sm">₹{parseFloat(order.amount).toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {statusIcon(order.status)}
                          <span className={`text-xs ${order.status === 'paid' ? 'text-green-400' :
                              order.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                            }`}>{order.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${order.drive_link_sent ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-500'
                          }`}>
                          {order.drive_link_sent ? 'Sent' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
