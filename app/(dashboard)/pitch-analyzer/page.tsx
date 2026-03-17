'use client'
import { useState, useCallback } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { StreamingOutput } from '@/components/agents/StreamingOutput'
import { Upload, FileText, X } from 'lucide-react'

export default function PitchAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [output, setOutput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) setFile(droppedFile)
  }, [])

  async function handleAnalyze() {
    if (!file) return
    setOutput('')
    setIsStreaming(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/pitch-analyzer', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Failed')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setOutput(prev => prev + decoder.decode(value))
      }
    } catch (err) {
      setOutput('Error analyzing pitch deck. Please try again.')
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <PageShell
      title="Pitch Deck Analyzer"
      description="Upload a pitch deck for instant AI-powered investment analysis"
      actions={
        (file || output) ? (
          <button onClick={() => { setFile(null); setOutput('') }} className="text-xs text-muted-foreground hover:text-foreground border border-border rounded px-3 py-1.5 transition-colors">
            Clear
          </button>
        ) : undefined
      }
    >
      <div className="space-y-6">
        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            className={`border-2 border-dashed rounded-lg p-16 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
            }`}
          >
            <Upload className="mx-auto mb-4 text-muted-foreground" size={40} />
            <div className="text-foreground font-medium mb-1">Drop pitch deck here</div>
            <div className="text-sm text-muted-foreground mb-4">PDF or PPTX, up to 50MB</div>
            <label className="bg-secondary text-foreground text-sm px-4 py-2 rounded cursor-pointer hover:bg-secondary/80 transition-colors">
              Browse files
              <input
                type="file"
                accept=".pdf,.pptx,.ppt"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
              />
            </label>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                <FileText size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{file.name}</div>
                <div className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isStreaming}
              className="bg-primary text-primary-foreground font-medium px-6 py-3 rounded text-sm hover:bg-primary/90 transition-colors disabled:opacity-40 whitespace-nowrap"
            >
              {isStreaming ? 'Analyzing...' : 'Analyze Deck'}
            </button>
          </div>
        )}

        {output && <StreamingOutput content={output} isStreaming={isStreaming} />}
      </div>
    </PageShell>
  )
}
