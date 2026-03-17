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
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
              {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
