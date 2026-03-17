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

  const inputBase = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }

  return (
    <PageShell
      title="Technology Explainer"
      description="Translate complex deep-tech into clear, audience-appropriate language"
      actions={
        output ? (
          <button onClick={() => { setOutput(''); setTech('') }} className="rounded-xl py-2 px-4 text-xs text-gray-500 hover:text-white transition-colors" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            Clear
          </button>
        ) : undefined
      }
    >
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="rounded-2xl p-5 space-y-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <label className="block text-xs text-gray-600 mb-1.5 uppercase tracking-wider">Technology</label>
              <textarea
                value={tech}
                onChange={(e) => setTech(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none transition-all resize-none h-32"
                style={inputBase}
                onFocus={(e) => e.target.style.borderColor = 'rgba(97, 209, 220, 0.4)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
                placeholder="Paste a technology description, abstract, or just a name (e.g. solid-state batteries, CRISPR base editing, quantum error correction)"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-2 uppercase tracking-wider">Audience</label>
              <div className="flex flex-wrap gap-1.5">
                {audiences.map(a => (
                  <button
                    key={a}
                    onClick={() => setAudience(a)}
                    className="px-3 py-1.5 text-xs rounded-xl transition-all"
                    style={
                      audience === a
                        ? { background: 'rgba(97, 209, 220, 0.15)', color: '#61D1DC', border: '1px solid rgba(97, 209, 220, 0.3)' }
                        : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.06)' }
                    }
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-2 uppercase tracking-wider">Depth</label>
              <div className="flex gap-2">
                {depths.map(d => (
                  <button
                    key={d.label}
                    onClick={() => setDepth(d.label)}
                    className="flex-1 py-2.5 text-xs rounded-xl text-center transition-all"
                    style={
                      depth === d.label
                        ? { background: 'rgba(97, 209, 220, 0.15)', color: '#61D1DC', border: '1px solid rgba(97, 209, 220, 0.3)' }
                        : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.06)' }
                    }
                  >
                    <div className="font-medium">{d.label}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{d.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleExplain}
              disabled={!tech || isStreaming}
              className="w-full py-3 rounded-xl text-sm font-semibold text-black transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #61D1DC, #40B4C0)' }}
            >
              {isStreaming ? 'Explaining...' : 'Explain'}
            </button>
          </div>
        </div>

        <div className="col-span-3">
          {output ? (
            <StreamingOutput content={output} isStreaming={isStreaming} />
          ) : (
            <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.06)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(97, 209, 220, 0.06)' }}>
                <span className="text-xl">🔬</span>
              </div>
              <div className="text-sm text-gray-600">Paste a technology description and select your audience</div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
