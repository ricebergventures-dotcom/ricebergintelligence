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

    // Simulate step progression
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
    } catch (err) {
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

  return (
    <PageShell
      title="Due Diligence Operator"
      description="AI-powered company research and investment analysis"
      actions={
        output ? (
          <button onClick={handleClear} className="text-xs text-muted-foreground hover:text-foreground border border-border rounded px-3 py-1.5 transition-colors">
            Clear
          </button>
        ) : undefined
      }
    >
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Company Name *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. EtherealX"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">One-liner (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none h-20"
                placeholder="Brief description of what they do..."
              />
            </div>
            <button
              onClick={handleRun}
              disabled={!company || isStreaming}
              className="w-full bg-primary text-primary-foreground font-medium py-2.5 rounded text-sm hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              {isStreaming ? 'Running...' : 'Run Due Diligence'}
            </button>
          </div>

          {currentStep > 0 && (
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Progress</div>
              <div className="space-y-2">
                {steps.map((step) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
                      currentStep > step.id
                        ? 'bg-primary text-primary-foreground'
                        : currentStep === step.id
                        ? 'border-2 border-primary bg-primary/10'
                        : 'border border-border bg-muted'
                    }`}>
                      {currentStep > step.id ? '✓' : step.id}
                    </div>
                    <span className={`text-xs ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-3">
          {output ? (
            <StreamingOutput content={output} isStreaming={isStreaming} />
          ) : (
            <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <div className="text-sm text-muted-foreground">Enter a company name and click Run Due Diligence to generate a report</div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
