import { auth } from '@/lib/auth'
import { orchestrate } from '@/lib/ai/orchestrator'
import { pitchAnalyzerSystemPrompt, getPitchAnalysisPrompt } from '@/lib/ai/prompts/pitch-analyzer'

export const maxDuration = 60

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) return new Response('No file provided', { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  let text = ''

  try {
    if (file.name.endsWith('.pdf')) {
      const pdfParseModule = await import('pdf-parse')
      const pdfParse = (pdfParseModule as any).default || pdfParseModule
      const parsed = await pdfParse(buffer)
      text = parsed.text
    } else if (file.name.endsWith('.pptx') || file.name.endsWith('.ppt')) {
      const officeparser = await import('officeparser')
      const parseOffice = (officeparser as any).parseOfficeAsync || (officeparser as any).parseOffice
      text = await parseOffice(buffer)
    } else {
      text = buffer.toString('utf-8')
    }
  } catch (err) {
    console.error('File parse error:', err)
    return new Response('Failed to parse file', { status: 500 })
  }

  const prompt = getPitchAnalysisPrompt(text)
  const stream = await orchestrate(pitchAnalyzerSystemPrompt, prompt)

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}
