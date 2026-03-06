'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, Users, BarChart3, Plus, LogOut, Sparkles, Menu, X, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/products/add', icon: Plus, label: 'Add Product' },
  { href: '/admin/leads', icon: Users, label: 'Leads / Orders' },
  { href: '/admin/revenue', icon: BarChart3, label: 'Revenue' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Digital Store';

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    toast.success('Logged out');
    router.push('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gold rounded-xl flex items-center justify-center flex-shrink-0">
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
          const active = pathname === href || (href !== '/admin/dashboard' && pathname?.startsWith(href));
          return (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
                  ? 'bg-gold text-black font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/5 space-y-1">
        <Link href="/" target="_blank" onClick={() => setMobileOpen(false)}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-gold transition-colors text-sm">
            <ExternalLink className="w-4 h-4" />
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
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-dark-2 border-r border-white/5 z-40 hidden md:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden bg-dark-2 border-b border-white/5 h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gold rounded-lg flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-black" />
          </div>
          <span className="font-display text-base text-white">{storeName}</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-dark-2 border-r border-white/5 z-50 md:hidden flex flex-col">
            <div className="absolute right-4 top-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
