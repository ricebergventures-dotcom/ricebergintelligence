import { auth } from '@/lib/auth'
import { orchestrate } from '@/lib/ai/orchestrator'
import { dueDiligenceSystemPrompt, getDueDiligencePrompt } from '@/lib/ai/prompts/due-diligence'

export const maxDuration = 60

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const { company, website, description } = await req.json()

  if (!company) return new Response('Company name required', { status: 400 })

  const prompt = getDueDiligencePrompt(company, website || '', description || '')
  const stream = await orchestrate(dueDiligenceSystemPrompt, prompt)

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}
