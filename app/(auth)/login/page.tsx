'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid credentials. Please try again.')
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#000000' }}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #61D1DC 0%, transparent 70%)' }} />
      </div>

      <div className="relative w-full max-w-sm px-6">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #61D1DC, #40B4C0)' }}>
              <Zap size={20} className="text-black" fill="black" />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold tracking-[0.2em] text-white leading-none">RICEBERG</div>
              <div className="text-[9px] tracking-[0.3em] mt-0.5" style={{ color: '#61D1DC' }}>INTELLIGENCE</div>
            </div>
          </div>
          <p className="text-sm text-gray-600">AI Command Center · Riceberg Ventures</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(97, 209, 220, 0.1)', backdropFilter: 'blur(20px)' }}>
          <h2 className="text-base font-semibold text-white mb-6">Sign in to continue</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(97, 209, 220, 0.4)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
                placeholder="you@riceberg.vc"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(97, 209, 220, 0.4)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-xs text-red-400" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-black transition-all mt-2 disabled:opacity-50"
              style={{ background: loading ? '#40B4C0' : 'linear-gradient(135deg, #61D1DC, #40B4C0)' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          Riceberg Ventures · Confidential
        </p>
      </div>
    </div>
  )
}
