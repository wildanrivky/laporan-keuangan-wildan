'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  PieChart,
  Download,
  Settings,
  Target,
  LogIn,
  Tag
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/buku-kas', label: 'Buku Kas', icon: BookOpen },
  { href: '/laba-rugi', label: 'Laba Rugi', icon: TrendingUp },
  { href: '/neraca', label: 'Neraca', icon: FileText },
  { href: '/arus-kas', label: 'Arus Kas', icon: TrendingDown },
  { href: '/cek-rekening', label: 'Cek Rekening', icon: Target },
  { href: '/laporan', label: 'Laporan', icon: PieChart },
];

const bottomNavItems = [
  { href: '/login', label: 'Login', icon: LogIn },
  { href: '/kategori', label: 'Kategori', icon: Tag },
  { href: '/pengaturan', label: 'Pengaturan', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-4 border-b border-slate-800">
        <h1 className="text-lg font-bold text-emerald-400">Laporan Keuangan</h1>
        <p className="text-xs text-slate-400 mt-1">UMKM Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}