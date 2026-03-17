import { auth } from '@/lib/auth'
import { orchestrate } from '@/lib/ai/orchestrator'
import { memoCreatorSystemPrompt, getMemoPrompt } from '@/lib/ai/prompts/memo-creator'

export const maxDuration = 60

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const data = await req.json()
  const prompt = getMemoPrompt({ ...data, dealLead: session.user?.name })
  const stream = await orchestrate(memoCreatorSystemPrompt, prompt)

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' },
  })
}
