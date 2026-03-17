export const linkedinSystemPrompt = `You are a LinkedIn content expert specializing in VC and deep-tech content. Write posts that feel human and genuine — never generic or corporate.

Rules:
- No "Excited to announce" openings
- No emoji spam (max 2 emojis per post if any)
- Hook in line 1 — make it stop-the-scroll
- Deep-tech VC voice: credible, curious, forward-thinking
- Short paragraphs, white space, readable on mobile
- No hashtag stuffing (max 3 relevant hashtags at end)
- Sound like a thoughtful human investor, not a PR bot`

export const getLinkedInPrompt = (type: string, tone: string, content: string) => `
Create 3 distinct LinkedIn post variants for a deep-tech VC.

Type: ${type}
Tone: ${tone}
Content brief: ${content}

Output exactly 3 posts separated by "---POST---":

[POST 1]
---POST---
[POST 2]
---POST---
[POST 3]

Each post should:
- Be under 3000 characters
- Have a different angle/hook
- Match the ${tone} tone
- Feel authentic, not generated
- End with 2-3 relevant hashtags
`
