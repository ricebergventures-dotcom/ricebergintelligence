'use client'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Search, BarChart2, FileText, Microscope, Linkedin, Briefcase } from 'lucide-react'

const tools = [
  {
    href: '/due-diligence',
    icon: Search,
    title: 'Due Diligence Operator',
    description: 'AI-powered company research with multi-step analysis and full DD reports',
    tag: 'Research',
  },
  {
    href: '/pitch-analyzer',
    icon: BarChart2,
    title: 'Pitch Deck Analyzer',
    description: 'Upload PDF or PPTX decks for instant scorecard and investment memo',
    tag: 'Analysis',
  },
  {
    href: '/memo-creator',
    icon: FileText,
    title: 'Memo Creator',
    description: 'Generate IC-ready investment memos from structured company data',
    tag: 'Writing',
  },
  {
    href: '/tech-explainer',
    icon: Microscope,
    title: 'Tech Explainer',
    description: 'Translate complex deep-tech into clear language for any audience',
    tag: 'Education',
  },
  {
    href: '/linkedin',
    icon: Linkedin,
    title: 'LinkedIn Post Creator',
    description: 'Generate authentic VC content — announcements, thesis posts, thought leadership',
    tag: 'Content',
  },
  {
    href: '/portfolio',
    icon: Briefcase,
    title: 'Portfolio Tracker',
    description: 'Live portfolio view with charts, KPIs, and Decile Hub integration',
    tag: 'Data',
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
    <div className="flex flex-col h-screen">
      <TopBar />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-2xl font-semibold text-foreground">
              Good {greeting}, {session?.user?.name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-muted-foreground mt-1">Riceberg Intelligence · AI Command Center</p>
          </div>

          {/* Tool Grid */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {tools.map(({ href, icon: Icon, title, description, tag }) => (
              <Link key={href} href={href} className="group">
                <div className="bg-card border border-border rounded-lg p-5 h-full hover:border-primary/40 hover:bg-card/80 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-9 h-9 bg-primary/10 rounded flex items-center justify-center">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded uppercase tracking-wider">
                      {tag}
                    </span>
                  </div>
                  <h3 className="font-medium text-foreground mb-1.5 group-hover:text-primary transition-colors">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                  <div className="mt-4">
                    <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Launch →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Portfolio Strip */}
          {metrics && (
            <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-6">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Portfolio</div>
              <div className="flex items-center gap-6 flex-1">
                {[
                  { label: 'Companies', value: metrics.totalCompanies },
                  { label: 'Deployed', value: metrics.totalDeployed },
                  { label: 'Countries', value: metrics.countriesCount },
                ].map(kpi => (
                  <div key={kpi.label} className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-foreground">{kpi.value}</span>
                    <span className="text-xs text-muted-foreground">{kpi.label}</span>
                  </div>
                ))}
              </div>
              <Link href="/portfolio" className="text-xs text-primary hover:underline">
                View portfolio →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
