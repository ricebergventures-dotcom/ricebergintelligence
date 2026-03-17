import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: '#000000' }}>
      <Sidebar />
      <main className="ml-64 flex-1 min-h-screen overflow-hidden">
        {children}
      </main>
    </div>
  )
}
