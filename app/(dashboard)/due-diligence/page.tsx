'use client'
import { useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { StreamingOutput } from '@/components/agents/StreamingOutput'

const steps = [
  { id: 1, label: 'Company background' },
  { id: 2, label: 'Market analysis' },
  { id: 3, label: 'Team research' },
  { id: 4, label: 'Risk assessment' },
  { id: 5, label: 'Compiling report' },
]

export default function DueDiligencePage() {
  const [company, setCompany] = useState('')
  const [website, setWebsite] = useState('')
  const [description, setDescription] = useState('')
  const [output, setOutput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  async function handleRun() {
    if (!company) return
    setOutput('')
    setIsStreaming(true)
    setCurrentStep(1)

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < 4) return prev + 1
        clearInterval(stepInterval)
        return prev
      })
    }, 4000)

    try {
      const res = await fetch('/api/due-diligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, website, description }),
      })

      if (!res.ok) throw new Error('Failed')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setOutput(prev => prev + decoder.decode(value))
      }

      setCurrentStep(5)
    } catch {
      setOutput('Error running due diligence. Please try again.')
    } finally {
      clearInterval(stepInterval)
      setIsStreaming(false)
    }
  }

  function handleClear() {
    setCompany('')
    setWebsite('')
    setDescription('')
    setOutput('')
    setCurrentStep(0)
    setIsStreaming(false)
  }

  const inputBase = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }
  const onFocusIn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'rgba(97, 209, 220, 0.4)'
  }
  const onFocusOut = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.07)'
  }

  return (
    <PageShell
      title="Due Diligence Operator"
      description="AI-powered company research and investment analysis"
      actions={
        output ? (
          <button onClick={handleClear} className="rounded-xl py-2 px-4 text-xs text-gray-500 hover:text-white transition-colors" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            Clear
          </button>
        ) : undefined
      }
    >
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <label className="block text-xs text-gray-600 mb-1.5 uppercase tracking-wider">Company Name *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none transition-all"
                style={inputBase}
                onFocus={onFocusIn}
                onBlur={onFocusOut}
                placeholder="e.g. EtherealX"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1.5 uppercase tracking-wider">Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none transition-all"
                style={inputBase}
                onFocus={onFocusIn}
                onBlur={onFocusOut}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1.5 uppercase tracking-wider">One-liner (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none transition-all resize-none h-20"
                style={inputBase}
                onFocus={onFocusIn}
                onBlur={onFocusOut}
                placeholder="Brief description of what they do..."
              />
            </div>
            <button
              onClick={handleRun}
              disabled={!company || isStreaming}
              className="w-full py-3 rounded-xl text-sm font-semibold text-black transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #61D1DC, #40B4C0)' }}
            >
              {isStreaming ? 'Running...' : 'Run Due Diligence'}
            </button>
          </div>

          {currentStep > 0 && (
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-[9px] text-gray-600 uppercase tracking-[0.2em] mb-3">Progress</div>
              <div className="space-y-2.5">
                {steps.map((step) => {
                  const done = currentStep > step.id
                  const active = currentStep === step.id
                  return (
                    <div key={step.id} className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] flex-shrink-0 font-bold"
                        style={
                          done
                            ? { background: '#61D1DC', color: '#000' }
                            : active
                            ? { border: '2px solid #61D1DC', color: '#61D1DC' }
                            : { border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }
                        }
                      >
                        {done ? '✓' : step.id}
                      </div>
                      <span className={`text-xs ${currentStep >= step.id ? 'text-white' : 'text-gray-600'}`}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-3">
          {output ? (
            <StreamingOutput content={output} isStreaming={isStreaming} />
          ) : (
            <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.06)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(97, 209, 220, 0.06)' }}>
                <span className="text-xl">🔍</span>
              </div>
              <div className="text-sm text-gray-600">Enter a company name and click Run Due Diligence to generate a report</div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
