import { TopBar } from './TopBar'

interface PageShellProps {
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
}

export function PageShell({ title, description, children, actions }: PageShellProps) {
  return (
    <div className="flex flex-col h-screen">
      <TopBar title={title} />
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              {description && <p className="text-sm text-gray-500 mt-1.5">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
