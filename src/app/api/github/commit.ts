import type { NextApiRequest, NextApiResponse } from 'next';
import { App } from 'octokit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  const { installation_id, repo_full_name, files, dir = '', branch } = req.body as any;

  try {
    const app = new App({
      appId: Number(process.env.GITHUB_APP_ID),
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
    });
    const octokit = await app.getInstallationOctokit(Number(installation_id));
    const [owner, repo] = (repo_full_name as string).split('/');

    const repoInfo = await octokit.request('GET /repos/{owner}/{repo}', { owner, repo });
    const targetBranch = branch || repoInfo.data.default_branch;

    for (const rel of Object.keys(files)) {
      const raw = (typeof files[rel] === 'string' ? files[rel] : files[rel].code) || '';
      const path = [dir.replace(/^\/|\/$/g, ''), rel.replace(/^\/+/, '')].filter(Boolean).join('/');

      let sha: string | undefined;
      try {
        const existing = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner, repo, path, ref: `heads/${targetBranch}`,
        });
        // @ts-ignore
        sha = existing.data.sha;
      } catch {}

      await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner, repo, path,
        message: `chore: update ${path}`,
        content: Buffer.from(String(raw)).toString('base64'),
        branch: targetBranch,
        sha,
      });
    }

    res.status(200).json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
