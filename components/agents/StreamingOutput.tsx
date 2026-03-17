'use client'
import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
    <div className="bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          {isStreaming && (
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          )}
          <span className="text-xs text-muted-foreground">
            {isStreaming ? 'Generating...' : 'Complete'}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {content.split(' ').filter(Boolean).length} words
        </span>
      </div>

      <div className="p-6 prose prose-invert prose-sm max-w-none overflow-y-auto max-h-[70vh] scrollbar-thin
        prose-headings:text-foreground prose-headings:font-semibold
        prose-p:text-foreground/90
        prose-strong:text-foreground
        prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:rounded
        prose-pre:bg-muted prose-pre:border prose-pre:border-border
        prose-table:border-border prose-th:border-border prose-td:border-border
        prose-blockquote:border-primary prose-blockquote:text-muted-foreground
        prose-hr:border-border
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
        {isStreaming && (
          <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
        )}
        <div ref={bottomRef} />
      </div>

      {!isStreaming && content && (
        <div className="px-4 py-2.5 border-t border-border flex items-center gap-3">
          <button
            onClick={() => navigator.clipboard.writeText(content)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Copy all
          </button>
        </div>
      )}
    </div>
  )
}
