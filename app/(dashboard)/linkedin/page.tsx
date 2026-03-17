'use client'
import { useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { Copy, CheckCheck } from 'lucide-react'

const tabs = [
  {
    id: 'portfolio_milestone',
    label: 'Portfolio Milestone',
    placeholder: 'Company name, what milestone they hit, key details (e.g. "EtherealX closed $20.5M Series A — building fully reusable launch vehicles in India, aiming for $350/kg launch cost. Co-investors: TDK Ventures, Accel Atoms, Prosus.")',
  },
  {
    id: 'event_recap',
    label: 'Event Recap',
    placeholder: 'Event name, location, who attended from Riceberg, key themes discussed, notable people in the room (e.g. "Ankit spoke at Infotér Space & Defence Conference in Budapest alongside the Hungarian Minister of Defence — discussed dual-use deeptech, Europe-India corridor, talent-to-IP")',
  },
  {
    id: 'investment_thesis',
    label: 'Investment Thesis',
    placeholder: 'Topic and key conviction points (e.g. "Why the microgravity economy is the next frontier — pharma, materials science, and India\'s role via ISRO AO-MEX program")',
  },
  {
    id: 'thought_leadership',
    label: 'Thought Leadership',
    placeholder: 'Topic, POV, data points (e.g. "5 structural blind spots holding India\'s deeptech back — lab IP dies in labs, hardware is a hero\'s journey, VCs optimized for SaaS cycles")',
  },
  {
    id: 'founder_spotlight',
    label: 'Founder / Team Win',
    placeholder: 'Who, what they achieved, why it matters (e.g. "Mredul Sarda on Forbes 30 Under 30 Asia — Finance & VC. Portfolio founders from EtherealX and Signatur also on the list.")',
  },
  {
    id: 'freeform',
    label: 'Free Form',
    placeholder: 'Describe exactly what you want to post about...',
  },
]

const tones = [
  { id: 'Professional', label: 'Professional', desc: 'Data-forward, institutional' },
  { id: 'Conversational', label: 'Conversational', desc: 'Personal, founder-facing' },
  { id: 'Bold & Provocative', label: 'Bold', desc: 'Challenge consensus' },
  { id: 'Inspirational', label: 'Inspirational', desc: 'Civilizational ambition' },
]

export default function LinkedInPage() {
  const [activeTab, setActiveTab] = useState('portfolio_milestone')
  const [tone, setTone] = useState('Professional')
  const [content, setContent] = useState('')
  const [posts, setPosts] = useState<string[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)

  const currentTab = tabs.find(t => t.id === activeTab)!

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
        // Show live preview of first post while streaming
        const parts = full.split('---POST---')
        if (parts.length >= 1) {
          setPosts(parts.map(p => p.replace(/^\[POST \d+\]\s*/m, '').trim()).filter(Boolean))
        }
      }
      const parts = full.split('---POST---').map(p => p.replace(/^\[POST \d+\]\s*/m, '').trim()).filter(Boolean)
      setPosts(parts)
    } catch {
      setPosts(['Error generating posts. Please try again.'])
    } finally {
      setIsStreaming(false)
    }
  }

  function copyPost(post: string, i: number) {
    navigator.clipboard.writeText(post)
    setCopied(i)
    setTimeout(() => setCopied(null), 2000)
  }

  const inputBase: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
  }

  return (
    <PageShell
      title="LinkedIn Post Creator"
      description="Generate on-brand Riceberg Ventures content for LinkedIn"
      actions={
        posts.length > 0 ? (
          <button
            onClick={() => { setPosts([]); setContent('') }}
            className="rounded-xl py-2 px-4 text-xs text-gray-500 hover:text-white transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Clear
          </button>
        ) : undefined
      }
    >
      <div className="space-y-6">
        {/* Input card */}
        <div className="rounded-2xl p-5 space-y-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Post type tabs */}
          <div>
            <label className="block text-[10px] text-gray-600 mb-2 uppercase tracking-widest">Post Type</label>
            <div className="flex flex-wrap gap-1.5">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all"
                  style={
                    activeTab === tab.id
                      ? { background: 'rgba(97, 209, 220, 0.12)', color: '#61D1DC', border: '1px solid rgba(97, 209, 220, 0.25)' }
                      : { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.06)' }
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content brief */}
          <div>
            <label className="block text-[10px] text-gray-600 mb-2 uppercase tracking-widest">Content Brief</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none transition-all resize-none"
              style={{ ...inputBase, height: '100px' }}
              onFocus={e => (e.target.style.borderColor = 'rgba(97, 209, 220, 0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.07)')}
              placeholder={currentTab.placeholder}
            />
          </div>

          {/* Tone */}
          <div>
            <label className="block text-[10px] text-gray-600 mb-2 uppercase tracking-widest">Tone</label>
            <div className="flex gap-2">
              {tones.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className="flex-1 py-2.5 rounded-xl text-center transition-all"
                  style={
                    tone === t.id
                      ? { background: 'rgba(97, 209, 220, 0.12)', border: '1px solid rgba(97, 209, 220, 0.25)' }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }
                  }
                >
                  <div className="text-xs font-medium" style={{ color: tone === t.id ? '#61D1DC' : 'rgba(255,255,255,0.5)' }}>{t.label}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={!content || isStreaming}
              className="py-3 px-6 rounded-xl text-sm font-semibold text-black transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #61D1DC, #40B4C0)' }}
            >
              {isStreaming ? 'Generating...' : 'Generate 3 Variants'}
            </button>
            {isStreaming && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#61D1DC' }} />
                <span className="text-xs text-gray-600">Writing in Riceberg voice...</span>
              </div>
            )}
          </div>
        </div>

        {/* Posts output */}
        {posts.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {posts.map((post, i) => (
              <div
                key={i}
                className="rounded-2xl flex flex-col"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">Variant {i + 1}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        color: post.length > 2800 ? '#FF6E42' : 'rgba(255,255,255,0.25)',
                        background: post.length > 2800 ? 'rgba(255,110,66,0.1)' : 'transparent',
                      }}
                    >
                      {post.length}/3000
                    </span>
                  </div>
                  <button
                    onClick={() => copyPost(post, i)}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all"
                    style={
                      copied === i
                        ? { color: '#61D1DC', background: 'rgba(97,209,220,0.1)' }
                        : { color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.04)' }
                    }
                    title="Copy to clipboard"
                  >
                    {copied === i ? <CheckCheck size={12} /> : <Copy size={12} />}
                    {copied === i ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto" style={{ maxHeight: '480px' }}>
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
