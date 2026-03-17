'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageShell } from '@/components/layout/PageShell'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { RefreshCw } from 'lucide-react'
import Link from 'next/link'

const COLORS = ['#61D1DC', '#FF6E42', '#40B4C0', '#B4E9E9', '#8884d8']
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

  const tooltipStyle = { backgroundColor: '#0D0D0D', border: '1px solid rgba(97, 209, 220, 0.15)', borderRadius: '12px', color: '#fff', fontSize: 12 }

  return (
    <PageShell
      title="Portfolio"
      description="Riceberg Ventures portfolio companies"
      actions={
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-700">Last sync: {lastSync}</span>
          <button
            onClick={handleSync}
            className="flex items-center gap-1.5 text-xs rounded-xl px-3 py-2 hover:text-white transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
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
            <div key={kpi.label} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-xs text-gray-600 mb-2">{kpi.label}</div>
              <div className="text-2xl font-bold text-white">{kpi.value}</div>
              <div className="text-xs text-gray-700 mt-1">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-sm font-medium text-white mb-4">Portfolio by Sector</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={sectorData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                  {sectorData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ color: '#6B7280', fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-sm font-medium text-white mb-4">Investments by Year</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(97, 209, 220, 0.04)' }} />
                <Bar dataKey="count" fill="#61D1DC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="rounded-xl px-3 py-1.5 text-sm text-white placeholder-gray-700 focus:outline-none transition-all w-64"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(97, 209, 220, 0.4)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
            />
            <span className="text-xs text-gray-700 ml-auto">{filtered.length} companies</span>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['Company', 'Sector', 'Stage', 'Country', 'Entry Date', 'Check Size', 'Status', 'Actions'].map(col => (
                  <th key={col} className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 rounded animate-pulse w-20" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.map((company: any) => (
                <tr key={company.id} className="border-b transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-4 py-3 font-medium text-white">{company.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-lg" style={{ background: 'rgba(97, 209, 220, 0.1)', color: '#61D1DC' }}>{company.sector}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{company.stage}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{company.country}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{company.entryDate}</td>
                  <td className="px-4 py-3 text-white font-medium text-xs">{company.checkSize}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-lg" style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80' }}>{company.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/due-diligence?company=${encodeURIComponent(company.name)}`} className="text-xs text-gray-600 hover:text-white transition-colors">
                        DD
                      </Link>
                      <Link href="/pitch-analyzer" className="text-xs text-gray-600 hover:text-white transition-colors">
                        Analyze
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <span className="text-xs text-gray-700">Page {page} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="text-xs text-gray-600 hover:text-white disabled:opacity-30 px-3 py-1.5 rounded-xl transition-colors" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  Prev
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-xs text-gray-600 hover:text-white disabled:opacity-30 px-3 py-1.5 rounded-xl transition-colors" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
