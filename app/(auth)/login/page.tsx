'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { X, ArrowRight, Check } from 'lucide-react'

type View = 'login' | 'request'

export default function LoginPage() {
  const [view, setView] = useState<View>('login')
  // Login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // Request access state
  const [reqName, setReqName] = useState('')
  const [reqEmail, setReqEmail] = useState('')
  const [reqCompany, setReqCompany] = useState('')
  const [reqMessage, setReqMessage] = useState('')
  const [reqLoading, setReqLoading] = useState(false)
  const [reqSuccess, setReqSuccess] = useState(false)

  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) {
      setError('Invalid credentials. Please try again.')
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  async function handleRequestAccess(e: React.FormEvent) {
    e.preventDefault()
    setReqLoading(true)
    try {
      await fetch('/api/access-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: reqName, email: reqEmail, company: reqCompany, message: reqMessage }),
      })
      setReqSuccess(true)
    } catch {
      setReqSuccess(true) // Still show success to user
    } finally {
      setReqLoading(false)
    }
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: 'white',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
  } as React.CSSProperties

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#000000' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(97,209,220,0.04) 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-sm px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex flex-col items-center gap-2 mb-5">
            <img src="/riceberg-logo.png" alt="Riceberg" className="h-10 w-auto" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <div className="text-[10px] tracking-[0.3em] font-semibold" style={{ color: '#61D1DC' }}>INTELLIGENCE</div>
          </div>
          <p className="text-xs text-gray-600">AI Command Center · Riceberg Ventures</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(97, 209, 220, 0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {view === 'login' && (
            <div className="p-8">
              <h2 className="text-base font-semibold text-white mb-6">Sign in</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-gray-600 mb-2 uppercase tracking-widest">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = 'rgba(97,209,220,0.4)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                    placeholder="you@riceberg.vc"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-2 uppercase tracking-widest">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = 'rgba(97,209,220,0.4)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                    placeholder="••••••••"
                    required
                  />
                </div>

                {error && (
                  <div
                    className="rounded-xl px-4 py-3 text-xs text-red-400"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #61D1DC, #40B4C0)', marginTop: '8px' }}
                >
                  {loading ? 'Signing in...' : <>Sign in <ArrowRight size={14} /></>}
                </button>
              </form>

              <div className="mt-5 pt-5 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <p className="text-xs text-gray-600 mb-3">Don't have access?</p>
                <button
                  onClick={() => setView('request')}
                  className="text-xs font-medium transition-colors hover:opacity-80"
                  style={{ color: '#61D1DC' }}
                >
                  Request Access →
                </button>
              </div>
            </div>
          )}

          {view === 'request' && !reqSuccess && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-white">Request Access</h2>
                <button
                  onClick={() => setView('login')}
                  className="text-gray-600 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                Riceberg Intelligence is an internal tool for the Riceberg Ventures team. Submit your details and we'll be in touch.
              </p>
              <form onSubmit={handleRequestAccess} className="space-y-3">
                <div>
                  <label className="block text-[10px] text-gray-600 mb-2 uppercase tracking-widest">Full Name *</label>
                  <input
                    type="text"
                    value={reqName}
                    onChange={e => setReqName(e.target.value)}
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = 'rgba(97,209,220,0.4)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-2 uppercase tracking-widest">Email *</label>
                  <input
                    type="email"
                    value={reqEmail}
                    onChange={e => setReqEmail(e.target.value)}
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = 'rgba(97,209,220,0.4)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                    placeholder="you@company.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-2 uppercase tracking-widest">Company</label>
                  <input
                    type="text"
                    value={reqCompany}
                    onChange={e => setReqCompany(e.target.value)}
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = 'rgba(97,209,220,0.4)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                    placeholder="Your company or fund"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-2 uppercase tracking-widest">Why do you need access?</label>
                  <textarea
                    value={reqMessage}
                    onChange={e => setReqMessage(e.target.value)}
                    style={{ ...inputStyle, resize: 'none', height: '80px' }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(97,209,220,0.4)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                    placeholder="Brief description..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={reqLoading}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-black transition-all disabled:opacity-50 mt-2"
                  style={{ background: 'linear-gradient(135deg, #61D1DC, #40B4C0)' }}
                >
                  {reqLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setView('login')}
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  ← Back to sign in
                </button>
              </div>
            </div>
          )}

          {view === 'request' && reqSuccess && (
            <div className="p-8 text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(97, 209, 220, 0.1)', border: '1px solid rgba(97, 209, 220, 0.2)' }}
              >
                <Check size={20} style={{ color: '#61D1DC' }} />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Request Received</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                Thanks {reqName.split(' ')[0]}! We've received your request and will be in touch at {reqEmail}.
              </p>
              <button
                onClick={() => setView('login')}
                className="text-xs font-medium transition-colors"
                style={{ color: '#61D1DC' }}
              >
                ← Back to sign in
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-gray-700 mt-5">
          Riceberg Ventures · Confidential Internal Tool
        </p>
      </div>
    </div>
  )
}
