import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export type TaskType =
  | 'due-diligence'
  | 'pitch-analysis'
  | 'memo-creation'
  | 'tech-explanation'
  | 'linkedin-post'

export async function orchestrate(
  systemPrompt: string,
  userPrompt: string
): Promise<ReadableStream<Uint8Array>> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const result = await model.generateContentStream(
          `${systemPrompt}\n\n${userPrompt}`
        )

        for await (const chunk of result.stream) {
          const text = chunk.text()
          if (text) {
            controller.enqueue(encoder.encode(text))
          }
        }

        const usage = await result.response
        console.log('[Gemini] Token usage:', usage.usageMetadata)

        controller.close()
      } catch (err) {
        console.error('[Gemini] Error:', err)
        controller.error(err)
      }
    },
  })

  return stream
}
