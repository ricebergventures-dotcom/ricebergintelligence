'use client'
import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy } from 'lucide-react'

interface StreamingOutputProps {
  content: string
  isStreaming: boolean
}

export function StreamingOutput({ content, isStreaming }: StreamingOutputProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isStreaming) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [content, isStreaming])

  if (!content) return null

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(97, 209, 220, 0.1)' }}>
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgba(97, 209, 220, 0.08)', background: 'rgba(97, 209, 220, 0.03)' }}>
        <div className="flex items-center gap-2.5">
          {isStreaming ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#61D1DC', boxShadow: '0 0 6px #61D1DC' }} />
              <span className="text-xs font-medium" style={{ color: '#61D1DC' }}>Generating...</span>
            </>
          ) : (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-xs font-medium text-gray-400">Complete</span>
            </>
          )}
        </div>
        <span className="text-xs text-gray-700">
          {content.split(' ').filter(Boolean).length} words
        </span>
      </div>

      <div className="p-6 overflow-y-auto max-h-[68vh] scrollbar-thin prose prose-invert prose-sm max-w-none
        prose-headings:text-white prose-headings:font-bold
        prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
        prose-p:text-gray-300 prose-p:leading-relaxed
        prose-strong:text-white
        prose-code:text-cyan prose-code:bg-white/5 prose-code:px-1.5 prose-code:rounded
        prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
        prose-table:text-sm prose-th:text-gray-400 prose-th:border-white/10 prose-td:border-white/10
        prose-blockquote:border-cyan prose-blockquote:text-gray-400
        prose-hr:border-white/10
        prose-li:text-gray-300
        prose-a:text-cyan
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
        {isStreaming && (
          <span className="inline-block w-0.5 h-4 animate-pulse ml-0.5 align-middle rounded" style={{ backgroundColor: '#61D1DC' }} />
        )}
        <div ref={bottomRef} />
      </div>

      {!isStreaming && content && (
        <div className="px-5 py-3 border-t flex items-center gap-3" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <button
            onClick={() => navigator.clipboard.writeText(content)}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-white transition-colors"
          >
            <Copy size={11} />
            Copy all
          </button>
        </div>
      )}
    </div>
  )
}
