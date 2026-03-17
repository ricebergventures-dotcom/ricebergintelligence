import { auth } from '@/lib/auth'
import { orchestrate } from '@/lib/ai/orchestrator'
import { techExplainerSystemPrompt, getTechExplainerPrompt } from '@/lib/ai/prompts/tech-explainer'

export const maxDuration = 60

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const { tech, audience, depth } = await req.json()
  const prompt = getTechExplainerPrompt(tech, audience, depth)
  const stream = await orchestrate(techExplainerSystemPrompt, prompt)

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' },
  })
}
