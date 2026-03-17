'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  Home, Search, BarChart2, FileText, Microscope, Linkedin, Briefcase, LogOut
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/due-diligence', label: 'Due Diligence', icon: Search },
  { href: '/pitch-analyzer', label: 'Pitch Analyzer', icon: BarChart2 },
  { href: '/memo-creator', label: 'Memo Creator', icon: FileText },
  { href: '/tech-explainer', label: 'Tech Explainer', icon: Microscope },
  { href: '/linkedin', label: 'LinkedIn', icon: Linkedin },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="w-60 h-screen bg-[#0D1117] border-r border-border flex flex-col fixed left-0 top-0">
      <div className="px-5 py-6 border-b border-border">
        <div className="text-xl font-bold tracking-widest text-foreground">RICEBERG</div>
        <div className="text-[10px] tracking-[0.3em] text-primary mt-0.5">INTELLIGENCE</div>
        <div className="text-[10px] text-muted-foreground mt-1">v1.0</div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
                active
                  ? 'bg-primary/10 text-primary border-l-2 border-primary pl-[10px]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-border">
        <div className="mb-3">
          <div className="text-sm font-medium text-foreground truncate">{session?.user?.name}</div>
          <div className="text-xs text-muted-foreground truncate">{session?.user?.email}</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
