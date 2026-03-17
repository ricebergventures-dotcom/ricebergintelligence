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

  return (
    <PageShell
      title="LinkedIn Post Creator"
      description="Generate high-quality VC content for LinkedIn"
      actions={
        posts.length > 0 ? (
          <button onClick={() => { setPosts([]); setContent('') }} className="text-xs text-muted-foreground hover:text-foreground border border-border rounded px-3 py-1.5 transition-colors">
            Clear
          </button>
        ) : undefined
      }
    >
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-5 space-y-5">
          <div className="flex gap-1 border-b border-border -mx-5 px-5 pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Content Brief</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none h-24"
              placeholder={getPlaceholder()}
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">Tone</label>
            <div className="flex gap-2">
              {tones.map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-3 py-1.5 text-xs rounded transition-colors ${
                    tone === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!content || isStreaming}
            className="bg-primary text-primary-foreground font-medium px-6 py-2.5 rounded text-sm hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            {isStreaming ? 'Generating...' : 'Generate 3 Posts'}
          </button>
        </div>

        {isStreaming && posts.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="text-muted-foreground text-sm animate-pulse">Generating posts...</div>
          </div>
        )}

        {posts.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {posts.map((post, i) => (
              <div key={i} className="bg-card border border-border rounded-lg flex flex-col">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                  <span className="text-xs text-muted-foreground font-medium">Variant {i + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{post.length}/3000</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(post)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex-1">
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{post}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
