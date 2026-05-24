'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Activity, Navigation2, Brain, Leaf, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: Activity,
    },
    {
      href: '/simulation',
      label: 'Simulation',
      icon: Activity,
    },
    {
      href: '/route-planner',
      label: 'Route Planner',
      icon: Navigation2,
    },
    {
      href: '/insights',
      label: 'AI Insights',
      icon: Brain,
    },
    {
      href: '/sustainability',
      label: 'Sustainability',
      icon: Leaf,
    },
  ];

  return (
    <aside className="w-64 glass-card h-screen sticky top-0 flex flex-col p-6 space-y-8">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <MapPin className="w-6 h-6 text-emerald-400" />
        <span className="text-lg font-bold text-white">GeoShield</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300',
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-4 pt-4 border-t border-slate-700/50">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-300"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </Link>

        <div className="px-4 py-3 rounded-lg bg-slate-800/50 text-xs text-slate-400 space-y-2">
          <p className="font-semibold text-slate-300">GeoShield AI</p>
          <p className="text-slate-500">Decoding Nature.</p>
          <p className="text-slate-500">Protecting Communities.</p>
        </div>
      </div>
    </aside>
  );
}
