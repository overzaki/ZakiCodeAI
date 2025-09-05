import type { NextApiRequest, NextApiResponse } from 'next'
import { App } from 'octokit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const installation_id = Number(req.query.installation_id || req.body?.installation_id)
  if (!installation_id) return res.status(400).json({ error: 'installation_id required' })
  try {
    const app = new App({
      appId: Number(process.env.GITHUB_APP_ID),
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY!
    })
    const octokit = await app.getInstallationOctokit(installation_id)
    const { data } = await octokit.request('GET /installation/repositories', { per_page: 100 })
    res.json(data.repositories.map(r => ({ full_name: r.full_name, default_branch: r.default_branch })))
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
}
