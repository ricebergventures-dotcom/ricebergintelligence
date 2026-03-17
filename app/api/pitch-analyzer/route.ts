import { auth } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { pitchAnalyzerSystemPrompt } from '@/lib/ai/prompts/pitch-analyzer'

export const maxDuration = 120

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

async function uploadToGeminiFileApi(
  buffer: Buffer,
  mimeType: string,
  displayName: string
): Promise<{ uri: string; name: string }> {
  const apiKey = process.env.GEMINI_API_KEY!
  const boundary = 'gemini_upload_boundary'
  const metadataJson = JSON.stringify({ file: { display_name: displayName } })

  const body = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadataJson}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`
    ),
    buffer,
    Buffer.from(`\r\n--${boundary}--`),
  ])

  const res = await fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=multipart&key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`,
        'Content-Length': body.length.toString(),
      },
      body,
    }
  )

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`File upload failed (${res.status}): ${txt}`)
  }

  const data = await res.json()
  let state: string = data.file?.state ?? 'ACTIVE'
  const fileGoogleName: string = data.file?.name ?? ''

  let polls = 0
  while (state === 'PROCESSING' && polls < 10) {
    await new Promise(r => setTimeout(r, 2000))
    const statusRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${fileGoogleName}?key=${apiKey}`
    )
    const statusData = await statusRes.json()
    state = statusData.state ?? 'ACTIVE'
    polls++
  }

  if (state === 'FAILED') throw new Error('Gemini file processing failed')
  return { uri: data.file.uri, name: fileGoogleName }
}

async function deleteGeminiFile(fileName: string) {
  try {
    await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${process.env.GEMINI_API_KEY}`,
      { method: 'DELETE' }
    )
  } catch { /* non-critical */ }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch (e: any) {
    return new Response(`Upload error: ${e?.message ?? 'unknown'}`, { status: 400 })
  }

  const file = formData.get('file') as File
  if (!file) return new Response('No file provided', { status: 400 })

  const fileName = file.name.toLowerCase()
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let uploadedFileName: string | null = null
      const emit = (text: string) => controller.enqueue(encoder.encode(text))

      try {
        let contentParts: any[]

        if (fileName.endsWith('.pdf')) {
          // Gemini File API: handles any file size, bypasses inline data limits
          const uploaded = await uploadToGeminiFileApi(buffer, 'application/pdf', file.name)
          uploadedFileName = uploaded.name
          contentParts = [
            { text: `${pitchAnalyzerSystemPrompt}\n\n${analysisPrompt}` },
            { fileData: { mimeType: 'application/pdf', fileUri: uploaded.uri } },
          ]
        } else if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) {
          // PPTX: extract text (Gemini File API doesn't support PPTX)
          const officeparser = await import('officeparser')
          const mod = officeparser as any
          let text = ''
          if (typeof mod.parseOfficeAsync === 'function') {
            text = await mod.parseOfficeAsync(buffer)
          } else {
            text = await new Promise((resolve, reject) => {
              mod.parseOffice(buffer, (data: string, err: Error) => {
                if (err) reject(err)
                else resolve(data)
              })
            })
          }
          if (!text?.trim()) throw new Error('Could not extract text from PPTX')
          contentParts = [
            { text: `${pitchAnalyzerSystemPrompt}\n\n${analysisPrompt}\n\nPITCH DECK CONTENT:\n${text.slice(0, 80000)}` },
          ]
        } else {
          contentParts = [
            { text: `${pitchAnalyzerSystemPrompt}\n\n${analysisPrompt}\n\nCONTENT:\n${buffer.toString('utf-8').slice(0, 80000)}` },
          ]
        }

        const result = await model.generateContentStream(contentParts)

        for await (const chunk of result.stream) {
          const text = chunk.text()
          if (text) emit(text)
        }

        const response = await result.response
        console.log('[Gemini pitch] Tokens:', response.usageMetadata)
        controller.close()
      } catch (err: any) {
        console.error('[pitch-analyzer] Error:', err?.message)
        emit(`\n\n**Analysis failed:** ${err?.message ?? 'Unknown error. Please try again.'}`)
        controller.close()
      } finally {
        if (uploadedFileName) deleteGeminiFile(uploadedFileName)
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
