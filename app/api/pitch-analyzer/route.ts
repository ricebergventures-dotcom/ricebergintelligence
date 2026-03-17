import { auth } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { pitchAnalyzerSystemPrompt } from '@/lib/ai/prompts/pitch-analyzer'

export const maxDuration = 60

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const analysisPrompt = `
Analyze the attached pitch deck and produce two outputs:

PART 1 - SCORECARD (output as JSON between triple backticks):
\`\`\`json
{
  "company": "Company Name",
  "scores": {
    "team": { "score": 0, "comment": "" },
    "market_size": { "score": 0, "comment": "" },
    "product": { "score": 0, "comment": "" },
    "traction": { "score": 0, "comment": "" },
    "business_model": { "score": 0, "comment": "" },
    "defensibility": { "score": 0, "comment": "" }
  },
  "overall": 0,
  "verdict": "PASS | PROCEED TO DD | STRONG YES"
}
\`\`\`

PART 2 - NARRATIVE MEMO:

# Investment Analysis: [Company Name]

## What They Do (Plain English)
[1-2 sentences anyone can understand]

## Why Now — Market Timing
[What makes this the right moment]

## Team Verdict
[Honest assessment of the founders]

## Product Differentiation
[What makes this different and defensible]

## Deal Concerns
[Be direct about the red flags ⚠️]

## What We'd Need to See
[What would make us invest]

## Verdict: [PASS ❌ / PROCEED TO DD 🔄 / STRONG YES ✅]
[Final justification]
`

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return new Response('Failed to read upload', { status: 400 })
  }

  const file = formData.get('file') as File
  if (!file) return new Response('No file provided', { status: 400 })

  const fileName = file.name.toLowerCase()
  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')

  let mimeType = 'application/pdf'
  if (fileName.endsWith('.pptx')) {
    mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  } else if (fileName.endsWith('.ppt')) {
    mimeType = 'application/vnd.ms-powerpoint'
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const result = await model.generateContentStream([
          { text: `${pitchAnalyzerSystemPrompt}\n\n${analysisPrompt}` },
          { inlineData: { mimeType, data: base64 } },
        ])

        for await (const chunk of result.stream) {
          const text = chunk.text()
          if (text) controller.enqueue(encoder.encode(text))
        }

        const response = await result.response
        console.log('[Gemini pitch] Tokens:', response.usageMetadata)
        controller.close()
      } catch (err: any) {
        console.error('[pitch-analyzer] Error:', err?.message)
        controller.enqueue(
          encoder.encode(`**Error:** ${err?.message ?? 'Analysis failed. Please try again.'}`)
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
