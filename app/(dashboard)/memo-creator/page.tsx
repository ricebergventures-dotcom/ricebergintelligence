'use client'
import { useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { StreamingOutput } from '@/components/agents/StreamingOutput'

const steps = [
  { id: 1, title: 'Company Basics' },
  { id: 2, title: 'Technology' },
  { id: 3, title: 'Market' },
  { id: 4, title: 'Team' },
  { id: 5, title: 'Traction' },
  { id: 6, title: 'Deal Terms' },
]

export default function MemoCreatorPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [output, setOutput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const update = (key: string, val: string) => setFormData(prev => ({ ...prev, [key]: val }))

  async function handleGenerate() {
    setOutput('')
    setIsStreaming(true)

    try {
      const res = await fetch('/api/memo-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setOutput(prev => prev + decoder.decode(value))
      }
    } catch {
      setOutput('Error generating memo.')
    } finally {
      setIsStreaming(false)
    }
  }

  const inputBase = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }
  const onFocusIn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'rgba(97, 209, 220, 0.4)'
  }
  const onFocusOut = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.07)'
  }

  const Field = ({ label, field, placeholder, multiline }: { label: string; field: string; placeholder?: string; multiline?: boolean }) => (
    <div>
      <label className="block text-xs text-gray-600 mb-1.5 uppercase tracking-wider">{label}</label>
      {multiline ? (
        <textarea
          value={formData[field] || ''}
          onChange={(e) => update(field, e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none transition-all resize-none h-24"
          style={inputBase}
          onFocus={onFocusIn}
          onBlur={onFocusOut}
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          value={formData[field] || ''}
          onChange={(e) => update(field, e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none transition-all"
          style={inputBase}
          onFocus={onFocusIn}
          onBlur={onFocusOut}
          placeholder={placeholder}
        />
      )}
    </div>
  )

  const stepContent = [
    <div key={1} className="space-y-4">
      <Field label="Company Name" field="name" placeholder="EtherealX" />
      <Field label="Website" field="url" placeholder="https://..." />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Stage" field="stage" placeholder="Pre-seed / Seed" />
        <Field label="Sector" field="sector" placeholder="Space / BioTech / AI..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Round Size" field="roundSize" placeholder="$3M" />
        <Field label="Valuation" field="valuation" placeholder="$15M pre-money" />
      </div>
    </div>,
    <div key={2} className="space-y-4">
      <Field label="What They Build" field="technology" placeholder="Describe the product/technology" multiline />
      <Field label="Key Innovation" field="innovation" placeholder="What is technically novel?" multiline />
      <Field label="IP / Patents" field="ip" placeholder="Any patents filed or granted?" />
    </div>,
    <div key={3} className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Field label="TAM" field="tam" placeholder="$50B" />
        <Field label="SAM" field="sam" placeholder="$5B" />
        <Field label="SOM" field="som" placeholder="$500M" />
      </div>
      <Field label="Target Customer" field="customer" placeholder="Who buys this?" />
      <Field label="Competition" field="competition" placeholder="Key competitors and differentiation" multiline />
    </div>,
    <div key={4} className="space-y-4">
      <Field label="Founders" field="founders" placeholder="Names, backgrounds, relevant experience" multiline />
      <Field label="Key Hires" field="keyHires" placeholder="Advisors, key team members" />
    </div>,
    <div key={5} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="ARR / MRR" field="arr" placeholder="$120K ARR" />
        <Field label="Users / Customers" field="users" placeholder="50 enterprise pilots" />
      </div>
      <Field label="Key Milestones" field="milestones" placeholder="Recent achievements and upcoming goals" multiline />
      <Field label="Notable Metrics" field="metrics" placeholder="Growth rate, NPS, retention..." />
    </div>,
    <div key={6} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Our Check Size" field="checkSize" placeholder="$500K" />
        <Field label="Lead Investor" field="leadInvestor" placeholder="Who is leading?" />
      </div>
      <Field label="Co-investors" field="coInvestors" placeholder="Other investors in the round" />
      <Field label="Use of Funds" field="useOfFunds" placeholder="How will capital be deployed?" multiline />
    </div>,
  ]

  return (
    <PageShell
      title="Investment Memo Creator"
      description="Generate a full IC-ready investment memo"
      actions={
        output ? (
          <button onClick={() => { setOutput(''); setStep(1); setFormData({}) }} className="rounded-xl py-2 px-4 text-xs text-gray-500 hover:text-white transition-colors" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            New Memo
          </button>
        ) : undefined
      }
    >
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2">
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {steps.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  className="flex-1 py-2.5 text-[10px] font-medium transition-colors"
                  style={
                    step === s.id
                      ? { background: 'rgba(97, 209, 220, 0.1)', color: '#61D1DC', borderBottom: '2px solid #61D1DC' }
                      : { color: 'rgba(255,255,255,0.3)' }
                  }
                >
                  {s.id}
                </button>
              ))}
            </div>
            <div className="p-5">
              <h3 className="text-sm font-semibold mb-4 text-white">{steps[step - 1].title}</h3>
              {stepContent[step - 1]}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setStep(s => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="text-xs text-gray-600 hover:text-white disabled:opacity-30 transition-colors"
                >
                  Back
                </button>
                {step < 6 ? (
                  <button
                    onClick={() => setStep(s => Math.min(6, s + 1))}
                    className="text-xs px-4 py-2 rounded-xl transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'white' }}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleGenerate}
                    disabled={isStreaming}
                    className="text-sm px-5 py-2 rounded-xl font-semibold text-black transition-all disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #61D1DC, #40B4C0)' }}
                  >
                    {isStreaming ? 'Generating...' : 'Generate Memo'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3">
          {output ? (
            <StreamingOutput content={output} isStreaming={isStreaming} />
          ) : (
            <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.06)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(97, 209, 220, 0.06)' }}>
                <span className="text-xl">📝</span>
              </div>
              <div className="text-sm text-gray-600">Fill in the form and click Generate Memo on Step 6</div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
