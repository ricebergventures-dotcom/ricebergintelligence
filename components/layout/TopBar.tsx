export function TopBar({ title }: { title?: string }) {
  return (
    <div className="h-10 border-b border-border bg-background/80 backdrop-blur flex items-center px-6 gap-3 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-xs text-muted-foreground">Gemini 2.5 Flash</span>
      </div>
      {title && (
        <>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-xs text-foreground font-medium">{title}</span>
        </>
      )}
      <div className="ml-auto text-xs text-muted-foreground">
        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
    </div>
  )
}
