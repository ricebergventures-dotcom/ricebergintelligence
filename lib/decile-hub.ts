import axios from 'axios'

interface Company {
  id: string
  name: string
  sector: string
  stage: string
  country: string
  entryDate: string
  checkSize: string
  status: string
  website?: string
  description?: string
}

interface PortfolioMetrics {
  totalCompanies: number
  totalDeployed: string
  averageStage: string
  countriesCount: number
}

const mockData: Company[] = [
  { id: '1', name: 'EtherealX', sector: 'Space', stage: 'Seed', country: 'UAE', entryDate: '2023-06', checkSize: '$500K', status: 'Active', website: 'https://etherealx.com', description: 'Satellite propulsion technology' },
  { id: '2', name: 'Manast Space', sector: 'Space', stage: 'Pre-seed', country: 'Kazakhstan', entryDate: '2023-09', checkSize: '$250K', status: 'Active', description: 'Space debris removal systems' },
  { id: '3', name: 'Signatur Bio', sector: 'BioTech', stage: 'Seed', country: 'Germany', entryDate: '2022-11', checkSize: '$750K', status: 'Active', description: 'Biomarker discovery platform' },
  { id: '4', name: 'Keyron', sector: 'CleanTech', stage: 'Pre-seed', country: 'UK', entryDate: '2023-03', checkSize: '$300K', status: 'Active', description: 'Green hydrogen production' },
  { id: '5', name: 'Surf Therapeutics', sector: 'BioTech', stage: 'Seed', country: 'Switzerland', entryDate: '2022-08', checkSize: '$500K', status: 'Active', description: 'Surfactant-based drug delivery' },
  { id: '6', name: 'Sleepiz', sector: 'MedTech', stage: 'Seed', country: 'Switzerland', entryDate: '2023-01', checkSize: '$400K', status: 'Active', description: 'Contactless sleep monitoring' },
  { id: '7', name: 'Swisspod', sector: 'Transportation', stage: 'Seed', country: 'Switzerland', entryDate: '2022-05', checkSize: '$600K', status: 'Active', description: 'Hyperloop pod technology' },
  { id: '8', name: 'BCHar', sector: 'AI', stage: 'Pre-seed', country: 'Israel', entryDate: '2023-10', checkSize: '$200K', status: 'Active', description: 'AI-powered hardware design' },
  { id: '9', name: 'Rigor AI', sector: 'AI', stage: 'Seed', country: 'USA', entryDate: '2023-07', checkSize: '$500K', status: 'Active', description: 'AI testing and validation' },
  { id: '10', name: 'Arch0', sector: 'Space', stage: 'Pre-seed', country: 'France', entryDate: '2024-01', checkSize: '$300K', status: 'Active', description: 'Space architecture systems' },
  { id: '11', name: 'Kicksky', sector: 'AI', stage: 'Pre-seed', country: 'Sweden', entryDate: '2024-02', checkSize: '$250K', status: 'Active', description: 'AI sports analytics platform' },
]

export async function getPortfolioCompanies(): Promise<Company[]> {
  if (!process.env.DECILE_HUB_API_KEY || process.env.DECILE_HUB_API_KEY === 'your-decile-hub-key') {
    return mockData
  }

  try {
    const res = await axios.get(`${process.env.DECILE_HUB_API_URL}/portfolio/companies`, {
      headers: { Authorization: `Bearer ${process.env.DECILE_HUB_API_KEY}` },
      timeout: 5000,
    })
    return res.data
  } catch {
    console.log('[Decile Hub] API unavailable, using mock data')
    return mockData
  }
}

export async function getPortfolioMetrics(): Promise<PortfolioMetrics> {
  const companies = await getPortfolioCompanies()
  const totalDeployed = companies.reduce((sum, c) => {
    const amount = parseFloat(c.checkSize.replace(/[$KkMm,]/g, '')) * (c.checkSize.includes('M') ? 1000000 : 1000)
    return sum + amount
  }, 0)

  const countries = new Set(companies.map(c => c.country))

  return {
    totalCompanies: companies.length,
    totalDeployed: `$${(totalDeployed / 1000000).toFixed(1)}M`,
    averageStage: 'Seed',
    countriesCount: countries.size,
  }
}
