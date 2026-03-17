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
    } catch {
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
          <button
            onClick={() => { setFile(null); setOutput('') }}
            className="rounded-xl py-2 px-4 text-xs text-gray-500 hover:text-white transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
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
            className="rounded-2xl p-16 text-center transition-all"
            style={{
              background: isDragging ? 'rgba(97, 209, 220, 0.04)' : 'rgba(255,255,255,0.01)',
              border: isDragging ? '2px dashed rgba(97, 209, 220, 0.4)' : '2px dashed rgba(255,255,255,0.06)',
            }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(97, 209, 220, 0.08)' }}>
              <Upload size={24} style={{ color: '#61D1DC' }} />
            </div>
            <div className="text-white font-medium mb-1.5">Drop pitch deck here</div>
            <div className="text-sm text-gray-600 mb-6">PDF or PPTX, up to 50MB</div>
            <label
              className="text-sm font-medium px-5 py-2.5 rounded-xl cursor-pointer transition-all"
              style={{ background: 'rgba(97, 209, 220, 0.1)', color: '#61D1DC', border: '1px solid rgba(97, 209, 220, 0.2)' }}
            >
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
            <div className="rounded-2xl p-4 flex items-center gap-3 flex-1" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(97, 209, 220, 0.1)' }}>
                <FileText size={18} style={{ color: '#61D1DC' }} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{file.name}</div>
                <div className="text-xs text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <button onClick={() => setFile(null)} className="text-gray-600 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isStreaming}
              className="py-3 px-6 rounded-xl text-sm font-semibold text-black transition-all disabled:opacity-40 whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #61D1DC, #40B4C0)' }}
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
