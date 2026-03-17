'use client'
import { useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { StreamingOutput } from '@/components/agents/StreamingOutput'

const audiences = ['Investor', 'LP', 'Board Member', 'General Public', 'Technical Expert']
const depths = [
  { label: 'Quick Brief', sub: '2 min' },
  { label: 'Standard', sub: '5 min' },
  { label: 'Deep Dive', sub: '15 min' },
]

export default function TechExplainerPage() {
  const [tech, setTech] = useState('')
  const [audience, setAudience] = useState('Investor')
  const [depth, setDepth] = useState('Standard')
  const [output, setOutput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  async function handleExplain() {
    if (!tech) return
    setOutput('')
    setIsStreaming(true)

    try {
      const res = await fetch('/api/tech-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tech, audience, depth }),
      })
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setOutput(prev => prev + decoder.decode(value))
      }
    } catch {
      setOutput('Error generating explanation.')
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <PageShell
      title="Technology Explainer"
      description="Translate complex deep-tech into clear, audience-appropriate language"
      actions={
        output ? (
          <button onClick={() => { setOutput(''); setTech('') }} className="text-xs text-muted-foreground hover:text-foreground border border-border rounded px-3 py-1.5 transition-colors">
            Clear
          </button>
        ) : undefined
      }
    >
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-lg p-5 space-y-5">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Technology</label>
              <textarea
                value={tech}
                onChange={(e) => setTech(e.target.value)}
                className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none h-32"
                placeholder="Paste a technology description, abstract, or just a name (e.g. 'solid-state batteries', 'CRISPR base editing', 'quantum error correction')"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">Audience</label>
              <div className="flex flex-wrap gap-1.5">
                {audiences.map(a => (
                  <button
                    key={a}
                    onClick={() => setAudience(a)}
                    className={`px-3 py-1.5 text-xs rounded transition-colors ${
                      audience === a ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">Depth</label>
              <div className="flex gap-2">
                {depths.map(d => (
                  <button
                    key={d.label}
                    onClick={() => setDepth(d.label)}
                    className={`flex-1 py-2 text-xs rounded text-center transition-colors ${
                      depth === d.label ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div>{d.label}</div>
                    <div className="text-[10px] opacity-70">{d.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleExplain}
              disabled={!tech || isStreaming}
              className="w-full bg-primary text-primary-foreground font-medium py-2.5 rounded text-sm hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              {isStreaming ? 'Explaining...' : 'Explain'}
            </button>
          </div>
        </div>

        <div className="col-span-3">
          {output ? (
            <StreamingOutput content={output} isStreaming={isStreaming} />
          ) : (
            <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center">
              <div className="text-4xl mb-3">🔬</div>
              <div className="text-sm text-muted-foreground">Paste a technology description and select your audience</div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
