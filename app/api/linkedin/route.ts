import { auth } from '@/lib/auth'
import { orchestrate } from '@/lib/ai/orchestrator'
import { linkedinSystemPrompt, getLinkedInPrompt } from '@/lib/ai/prompts/linkedin'

export const maxDuration = 60

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const { type, tone, content } = await req.json()
  const prompt = getLinkedInPrompt(type, tone, content)
  const stream = await orchestrate(linkedinSystemPrompt, prompt)

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' },
  })
}
