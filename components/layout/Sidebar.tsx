'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  Home, Search, BarChart2, FileText, Microscope, Linkedin, Briefcase, LogOut, Shield
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/due-diligence', label: 'Due Diligence', icon: Search },
  { href: '/pitch-analyzer', label: 'Pitch Analyzer', icon: BarChart2 },
  { href: '/memo-creator', label: 'Memo Creator', icon: FileText },
  { href: '/tech-explainer', label: 'Tech Explainer', icon: Microscope },
  { href: '/linkedin', label: 'LinkedIn', icon: Linkedin },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/admin', label: 'Admin', icon: Shield, adminOnly: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const visibleItems = navItems.filter(item => !item.adminOnly || (session?.user as any)?.role === 'admin')

  return (
    <aside className="w-64 h-screen flex flex-col fixed left-0 top-0 z-20" style={{ background: 'linear-gradient(180deg, #060606 0%, #080810 100%)', borderRight: '1px solid rgba(97, 209, 220, 0.08)' }}>
      {/* Logo */}
      <div className="px-6 py-7 border-b" style={{ borderColor: 'rgba(97, 209, 220, 0.08)' }}>
        <div className="flex items-center gap-3">
          <img src="/riceberg-logo.png" alt="Riceberg" className="h-7 w-auto" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <div className="text-[9px] tracking-[0.25em] font-semibold" style={{ color: '#61D1DC' }}>INTELLIGENCE</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        <div className="px-3 mb-3">
          <span className="text-[9px] tracking-[0.2em] font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>TOOLS</span>
        </div>
        {visibleItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                active
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-200'
              }`}
              style={active ? {
                background: 'linear-gradient(90deg, rgba(97, 209, 220, 0.12) 0%, rgba(97, 209, 220, 0.02) 100%)',
                borderLeft: '2px solid #61D1DC',
                paddingLeft: '10px',
              } : {}}
            >
              <Icon size={16} style={active ? { color: '#61D1DC' } : {}} />
              <span className="font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(97, 209, 220, 0.08)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black" style={{ background: 'linear-gradient(135deg, #61D1DC, #B4E9E9)' }}>
            {session?.user?.name?.[0] || 'R'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">{session?.user?.name}</div>
            <div className="text-[10px] text-gray-600 truncate">{session?.user?.email}</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-300 transition-colors w-full"
        >
          <LogOut size={12} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
