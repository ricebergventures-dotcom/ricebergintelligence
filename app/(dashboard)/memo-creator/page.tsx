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
    } catch (err) {
      setOutput('Error generating memo.')
    } finally {
      setIsStreaming(false)
    }
  }

  const Field = ({ label, field, placeholder, multiline }: { label: string; field: string; placeholder?: string; multiline?: boolean }) => (
    <div>
      <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</label>
      {multiline ? (
        <textarea
          value={formData[field] || ''}
          onChange={(e) => update(field, e.target.value)}
          className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none h-24"
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          value={formData[field] || ''}
          onChange={(e) => update(field, e.target.value)}
          className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
      <Field label="Key Innovation" field="innovation" placeholder="What's technically novel?" multiline />
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
        <Field label="Lead Investor" field="leadInvestor" placeholder="Who's leading?" />
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
          <button onClick={() => { setOutput(''); setStep(1); setFormData({}) }} className="text-xs text-muted-foreground hover:text-foreground border border-border rounded px-3 py-1.5 transition-colors">
            New Memo
          </button>
        ) : undefined
      }
    >
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex border-b border-border">
              {steps.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  className={`flex-1 py-2 text-[10px] font-medium transition-colors ${
                    step === s.id
                      ? 'bg-primary/10 text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {s.id}
                </button>
              ))}
            </div>
            <div className="p-5">
              <h3 className="text-sm font-semibold mb-4 text-foreground">{steps[step - 1].title}</h3>
              {stepContent[step - 1]}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setStep(s => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  ← Back
                </button>
                {step < 6 ? (
                  <button
                    onClick={() => setStep(s => Math.min(6, s + 1))}
                    className="text-xs bg-secondary text-foreground px-4 py-2 rounded hover:bg-secondary/80 transition-colors"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleGenerate}
                    disabled={isStreaming}
                    className="text-sm bg-primary text-primary-foreground px-5 py-2 rounded hover:bg-primary/90 transition-colors disabled:opacity-40"
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
            <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center">
              <div className="text-4xl mb-3">📝</div>
              <div className="text-sm text-muted-foreground">Fill in the form and click Generate Memo on Step 6</div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
