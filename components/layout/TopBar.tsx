export function TopBar({ title }: { title?: string }) {
  return (
    <div className="h-11 flex items-center px-6 gap-3 sticky top-0 z-10" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(97, 209, 220, 0.06)' }}>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#61D1DC', boxShadow: '0 0 6px #61D1DC' }} />
        <span className="text-xs font-medium" style={{ color: '#61D1DC' }}>Gemini 2.5 Flash</span>
      </div>
      {title && (
        <>
          <span className="text-xs text-gray-700">·</span>
          <span className="text-xs text-gray-400 font-medium">{title}</span>
        </>
      )}
      <div className="ml-auto text-xs text-gray-700">
        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
    </div>
  )
}
