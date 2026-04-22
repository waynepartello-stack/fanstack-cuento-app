'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Megaphone,
  Zap,
  Store,
  Bell,
  ChevronDown,
  Settings,
  HelpCircle,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Promotions', href: '/promotions', icon: Megaphone },
  { label: 'Experience', href: '/experience', icon: Zap },
  { label: 'Marketplace', href: '/marketplace', icon: Store },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0d14]">
      {/* Sidebar */}
      <aside className="w-[220px] flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-[#0e1018]">
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-semibold text-sm tracking-tight">FanStack</span>
              <span className="text-white/30 text-xs ml-1">by CUENTO</span>
            </div>
          </div>
        </div>

        {/* Team selector */}
        <div className="px-3 py-3 border-b border-white/[0.06]">
          <button className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-white/[0.04] transition-colors group">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                LKS
              </div>
              <div className="text-left">
                <div className="text-xs font-medium text-white/80">Lakeland Storm</div>
                <div className="text-[10px] text-white/30">NBA G League</div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-white/30 group-hover:text-white/50" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          <div className="text-[10px] text-white/25 uppercase tracking-widest font-medium px-3 mb-2">Platform</div>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn('nav-link', isActive && 'active')}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-3 border-t border-white/[0.06] space-y-0.5">
          <button className="nav-link w-full">
            <Bell className="w-4 h-4" />
            Alerts
            <span className="ml-auto bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">5</span>
          </button>
          <button className="nav-link w-full">
            <HelpCircle className="w-4 h-4" />
            Help
          </button>
          <button className="nav-link w-full">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>

        {/* User */}
        <div className="px-3 py-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white/80 truncate">Jordan Davis</div>
              <div className="text-[10px] text-white/30 truncate">Director of Fan Eng.</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
