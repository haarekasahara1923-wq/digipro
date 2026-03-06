'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, Users, BarChart3, Plus, LogOut, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/products/add', icon: Plus, label: 'Add Product' },
  { href: '/admin/leads', icon: Users, label: 'Leads' },
  { href: '/admin/revenue', icon: BarChart3, label: 'Revenue' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digital Store';

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    toast.success('Logged out');
    router.push('/admin/login');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-dark-2 border-r border-white/5 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gold rounded-xl flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <div>
            <p className="font-display text-lg text-white leading-none">{storeName}</p>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-gold text-black font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}>
                <Icon className="w-4 h-4" />
                <span className="text-sm">{label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* View Store */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <Link href="/" target="_blank">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-gold transition-colors text-sm">
            <Sparkles className="w-4 h-4" />
            View Store
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-400/5 transition-all text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
