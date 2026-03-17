'use client'
import { useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { Copy } from 'lucide-react'

const tabs = [
  { id: 'announce', label: 'Portfolio Announcement' },
  { id: 'thesis', label: 'Investment Thesis' },
  { id: 'thought', label: 'Thought Leadership' },
  { id: 'freeform', label: 'Free Form' },
]

const tones = ['Professional', 'Conversational', 'Bold & Provocative', 'Inspirational']

export default function LinkedInPage() {
  const [activeTab, setActiveTab] = useState('announce')
  const [tone, setTone] = useState('Professional')
  const [content, setContent] = useState('')
  const [posts, setPosts] = useState<string[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'announce': return 'Company name, milestone, and context (e.g. "EtherealX just closed their seed round, building satellite propulsion tech...")'
      case 'thesis': return 'Topic and key points (e.g. "Why deep-tech takes longer but returns more — patient capital thesis")'
      case 'thought': return 'Topic, POV, and any data points...'
      default: return 'Describe what you want to post about...'
    }
  }

  async function handleGenerate() {
    if (!content) return
    setPosts([])
    setIsStreaming(true)

    try {
      const res = await fetch('/api/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activeTab, tone, content }),
      })
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value)
      }
      const parts = full.split('---POST---').map(p => p.replace(/^\[POST \d+\]\s*/m, '').trim()).filter(Boolean)
      setPosts(parts)
    } catch {
      setPosts(['Error generating posts.'])
    } finally {
      setIsStreaming(false)
    }
  }

  const inputBase = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }

  return (
    <PageShell
      title="LinkedIn Post Creator"
      description="Generate high-quality VC content for LinkedIn"
      actions={
        posts.length > 0 ? (
          <button onClick={() => { setPosts([]); setContent('') }} className="rounded-xl py-2 px-4 text-xs text-gray-500 hover:text-white transition-colors" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            Clear
          </button>
        ) : undefined
      }
    >
      <div className="space-y-6">
        <div className="rounded-2xl p-5 space-y-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex gap-1 border-b -mx-5 px-5 pb-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px"
                style={
                  activeTab === tab.id
                    ? { borderColor: '#61D1DC', color: '#61D1DC' }
                    : { borderColor: 'transparent', color: 'rgba(255,255,255,0.35)' }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1.5 uppercase tracking-wider">Content Brief</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none transition-all resize-none h-24"
              style={inputBase}
              onFocus={(e) => e.target.style.borderColor = 'rgba(97, 209, 220, 0.4)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
              placeholder={getPlaceholder()}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-2 uppercase tracking-wider">Tone</label>
            <div className="flex flex-wrap gap-2">
              {tones.map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className="px-3 py-1.5 text-xs rounded-xl transition-all"
                  style={
                    tone === t
                      ? { background: 'rgba(97, 209, 220, 0.15)', color: '#61D1DC', border: '1px solid rgba(97, 209, 220, 0.3)' }
                      : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.06)' }
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!content || isStreaming}
            className="py-3 px-6 rounded-xl text-sm font-semibold text-black transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #61D1DC, #40B4C0)' }}
          >
            {isStreaming ? 'Generating...' : 'Generate 3 Posts'}
          </button>
        </div>

        {isStreaming && posts.length === 0 && (
          <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#61D1DC' }} />
              <span className="text-sm text-gray-500">Generating posts...</span>
            </div>
          </div>
        )}

        {posts.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {posts.map((post, i) => (
              <div key={i} className="rounded-2xl flex flex-col" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-xs font-medium text-gray-500">Variant {i + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-700">{post.length}/3000</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(post)}
                      className="text-gray-600 hover:text-white transition-colors"
                      title="Copy"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex-1">
                  <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{post}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
