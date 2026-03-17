'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageShell } from '@/components/layout/PageShell'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { RefreshCw } from 'lucide-react'
import Link from 'next/link'

const COLORS = ['#00C49A', '#0088FE', '#FFBB28', '#FF8042', '#8884d8']
const SECTORS = ['Space', 'BioTech', 'CleanTech', 'AI', 'MedTech', 'Transportation']

export default function PortfolioPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString())
  const PER_PAGE = 10

  const { data: companies = [], isLoading, refetch } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => fetch('/api/portfolio').then(r => r.json()),
  })

  const { data: metrics } = useQuery({
    queryKey: ['portfolio-metrics'],
    queryFn: () => fetch('/api/portfolio?type=metrics').then(r => r.json()),
  })

  const filtered = companies.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.sector.toLowerCase().includes(search.toLowerCase()) ||
    c.country.toLowerCase().includes(search.toLowerCase())
  )

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  const sectorData = SECTORS.map(s => ({
    name: s,
    value: companies.filter((c: any) => c.sector === s).length,
  })).filter(d => d.value > 0)

  const yearData = companies.reduce((acc: any, c: any) => {
    const year = c.entryDate?.split('-')[0] || 'Unknown'
    acc[year] = (acc[year] || 0) + 1
    return acc
  }, {})
  const barData = Object.entries(yearData).map(([year, count]) => ({ year, count })).sort((a, b) => a.year.localeCompare(b.year))

  async function handleSync() {
    await refetch()
    setLastSync(new Date().toLocaleTimeString())
  }

  return (
    <PageShell
      title="Portfolio"
      description="Riceberg Ventures portfolio companies"
      actions={
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Last sync: {lastSync}</span>
          <button
            onClick={handleSync}
            className="flex items-center gap-1.5 text-xs border border-border rounded px-3 py-1.5 hover:bg-secondary transition-colors"
          >
            <RefreshCw size={12} />
            Sync from Decile Hub
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Portfolio Companies', value: metrics?.totalCompanies || '—', sub: 'Active investments' },
            { label: 'Total Deployed', value: metrics?.totalDeployed || '—', sub: 'Capital invested' },
            { label: 'Avg Stage', value: metrics?.averageStage || '—', sub: 'Portfolio stage' },
            { label: 'Countries', value: metrics?.countriesCount || '—', sub: 'Geographic spread' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-card border border-border rounded-lg p-5">
              <div className="text-xs text-muted-foreground mb-1">{kpi.label}</div>
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="text-sm font-medium mb-4">Portfolio by Sector</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={sectorData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                  {sectorData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconSize={8} iconType="circle" />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E2A3A', borderRadius: '4px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <div className="text-sm font-medium mb-4">Investments by Year</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#8B9CB0' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8B9CB0' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E2A3A', borderRadius: '4px' }} cursor={{ fill: 'rgba(0,196,154,0.05)' }} />
                <Bar dataKey="count" fill="#00C49A" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="bg-input border border-border rounded px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-64"
            />
            <span className="text-xs text-muted-foreground ml-auto">{filtered.length} companies</span>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                {['Company', 'Sector', 'Stage', 'Country', 'Entry Date', 'Check Size', 'Status', 'Actions'].map(col => (
                  <th key={col} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-muted rounded animate-pulse w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.map((company: any) => (
                <tr key={company.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{company.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{company.sector}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{company.stage}</td>
                  <td className="px-4 py-3 text-muted-foreground">{company.country}</td>
                  <td className="px-4 py-3 text-muted-foreground">{company.entryDate}</td>
                  <td className="px-4 py-3 text-foreground font-medium">{company.checkSize}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">{company.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/due-diligence?company=${encodeURIComponent(company.name)}`} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                        DD
                      </Link>
                      <Link href="/pitch-analyzer" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                        Analyze
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
              <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 px-2 py-1 border border-border rounded transition-colors">
                  ← Prev
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 px-2 py-1 border border-border rounded transition-colors">
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
