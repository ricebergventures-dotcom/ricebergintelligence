'use client'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Search, BarChart2, FileText, Microscope, Linkedin, Briefcase, ArrowRight } from 'lucide-react'

const tools = [
  {
    href: '/due-diligence',
    icon: Search,
    title: 'Due Diligence',
    description: 'Multi-step AI research with full DD reports and investment recommendations',
    tag: 'Research',
    color: '#61D1DC',
  },
  {
    href: '/pitch-analyzer',
    icon: BarChart2,
    title: 'Pitch Analyzer',
    description: 'Upload PDF or PPTX decks for instant scorecard and investment memo',
    tag: 'Analysis',
    color: '#FF6E42',
  },
  {
    href: '/memo-creator',
    icon: FileText,
    title: 'Memo Creator',
    description: 'Generate IC-ready investment memos from structured company data',
    tag: 'Writing',
    color: '#61D1DC',
  },
  {
    href: '/tech-explainer',
    icon: Microscope,
    title: 'Tech Explainer',
    description: 'Translate complex deep-tech into clear language for any audience',
    tag: 'Education',
    color: '#FF6E42',
  },
  {
    href: '/linkedin',
    icon: Linkedin,
    title: 'LinkedIn',
    description: 'Generate authentic VC content — announcements, thesis, thought leadership',
    tag: 'Content',
    color: '#61D1DC',
  },
  {
    href: '/portfolio',
    icon: Briefcase,
    title: 'Portfolio',
    description: 'Live portfolio view with charts, KPIs, and Decile Hub integration',
    tag: 'Data',
    color: '#FF6E42',
  },
]

export default function DashboardPage() {
  const { data: session } = useSession()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

  const { data: metrics } = useQuery({
    queryKey: ['portfolio-metrics'],
    queryFn: () => fetch('/api/portfolio?type=metrics').then(r => r.json()),
  })

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-8 max-w-6xl">
          {/* Header */}
          <div className="mb-12">
            <p className="text-sm font-medium mb-2" style={{ color: '#61D1DC' }}>Good {greeting}</p>
            <h1 className="text-4xl font-bold text-white mb-2">
              {session?.user?.name?.split(' ')[0] || 'Welcome'}
            </h1>
            <p className="text-gray-500 text-base">Riceberg Intelligence · AI Command Center</p>
          </div>

          {/* Tool Grid */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {tools.map(({ href, icon: Icon, title, description, tag, color }) => (
              <Link key={href} href={href} className="group block">
                <div
                  className="rounded-2xl p-6 h-full transition-all duration-300 cursor-pointer relative overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget
                    el.style.background = `rgba(${color === '#61D1DC' ? '97, 209, 220' : '255, 110, 66'}, 0.04)`
                    el.style.borderColor = `${color}22`
                    el.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    el.style.background = 'rgba(255,255,255,0.02)'
                    el.style.borderColor = 'rgba(255,255,255,0.06)'
                    el.style.transform = 'translateY(0)'
                  }}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <span className="text-[9px] font-medium uppercase tracking-[0.15em] px-2 py-1 rounded-lg" style={{ color: color, background: `${color}10` }}>
                      {tag}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-base">{title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">{description}</p>
                  <div className="flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }}>
                    Launch <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Portfolio strip */}
          {metrics && (
            <div className="rounded-2xl p-5 flex items-center gap-8" style={{ background: 'rgba(97, 209, 220, 0.04)', border: '1px solid rgba(97, 209, 220, 0.1)' }}>
              <div className="text-xs font-medium uppercase tracking-[0.15em] text-gray-600">Portfolio</div>
              <div className="flex items-center gap-8 flex-1">
                {[
                  { label: 'Companies', value: metrics.totalCompanies },
                  { label: 'Deployed', value: metrics.totalDeployed },
                  { label: 'Countries', value: metrics.countriesCount },
                ].map(kpi => (
                  <div key={kpi.label} className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">{kpi.value}</span>
                    <span className="text-xs text-gray-600">{kpi.label}</span>
                  </div>
                ))}
              </div>
              <Link href="/portfolio" className="text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: '#61D1DC' }}>
                View all <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
