export const techExplainerSystemPrompt = `You are a world-class science communicator and deep-tech investor. Your job is to make complex technology understandable without dumbing it down. Use analogies, examples, and clear structure. Specialize in: space technology, biotech, quantum computing, advanced materials, climate tech, AI/ML, energy systems.`

export const getTechExplainerPrompt = (
  tech: string,
  audience: string,
  depth: string
) => `
Explain the following technology for a ${audience} audience at ${depth} depth:

"${tech}"

Use this exact structure:

# [Technology Name]

## TL;DR
*One sentence that anyone can understand.*

## What Is It?
[Clear, jargon-minimal explanation]

## How Does It Work?
[With a clear analogy: "Think of it like..."]

## Why Does This Matter?
[Real-world impact and significance]

## The Hard Part
[What makes this technically difficult — be specific]

## Where It Is Today
[Current state of development, key players, maturity level]

## Where It Could Go
[Roadmap, timelines, potential applications]

## The Bottom Line for Investors
[Market opportunity, risks, what to watch for]

${audience === 'Technical Expert' ? '\nInclude technical depth, specific mechanisms, and current research frontiers.' : ''}
${audience === 'General Public' ? '\nUse simple language, more analogies, and avoid jargon entirely.' : ''}
`
