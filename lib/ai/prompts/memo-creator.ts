export const memoCreatorSystemPrompt = `You are a senior investment professional at Riceberg Ventures. Write investment committee memos that are precise, well-structured, and persuasive. Use data where available, flag uncertainty clearly, and always have a clear recommendation.`

export const getMemoPrompt = (data: Record<string, any>) => `
Create a formal investment committee memo for Riceberg Ventures based on this information:

${JSON.stringify(data, null, 2)}

Format the memo exactly as follows:

---

# RICEBERG VENTURES — INVESTMENT MEMO
**CONFIDENTIAL | Investment Committee Use Only**

| Field | Value |
|-------|-------|
| **Company** | ${data.name || 'N/A'} |
| **Date** | ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} |
| **Stage** | ${data.stage || 'N/A'} |
| **Sector** | ${data.sector || 'N/A'} |
| **Round Size** | ${data.roundSize || 'N/A'} |
| **Valuation** | ${data.valuation || 'N/A'} |
| **Deal Lead** | ${data.dealLead || 'Riceberg Intelligence'} |
| **Recommendation** | [INVEST ✅ / PASS ❌ / MORE DD 🔄] |

---

## EXECUTIVE SUMMARY
[2-3 punchy sentences]

## COMPANY OVERVIEW
[What they do, founding story, mission]

## TECHNOLOGY & INNOVATION
[Core tech, key innovations, IP, technical moat]

## MARKET OPPORTUNITY
[TAM/SAM/SOM with sources, market timing, why now]

## TEAM
[Founders, advisors, key hires, gaps]

## TRACTION & METRICS
[ARR/MRR, users, pilots, growth rate, key milestones]

## BUSINESS MODEL & UNIT ECONOMICS
[Revenue model, unit economics, path to profitability]

## COMPETITION
[Competitive matrix, moat, why this team wins]

## DEAL TERMS
[Round structure, our check, co-investors, valuation rationale]

## RISK FACTORS & MITIGANTS
| Risk | Severity | Mitigant |
|------|----------|----------|
[List risks]

## VALUE CREATION PLAN
[How Riceberg adds value beyond capital]

## CONCLUSION & RECOMMENDATION
[Final investment thesis and clear recommendation]

---
*This memo was prepared with assistance from Riceberg Intelligence AI. All data should be verified before IC presentation.*
`
