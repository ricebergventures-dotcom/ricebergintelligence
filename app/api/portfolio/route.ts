import { auth } from '@/lib/auth'
import { getPortfolioCompanies, getPortfolioMetrics } from '@/lib/decile-hub'

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  if (type === 'metrics') {
    const metrics = await getPortfolioMetrics()
    return Response.json(metrics)
  }

  const companies = await getPortfolioCompanies()
  return Response.json(companies)
}
