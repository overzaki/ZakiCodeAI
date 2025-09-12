import { NextRequest } from 'next/server';
import { App } from 'octokit';

export async function GET() {
  return Response.json({ ok: true, method: 'GET' });
}

export async function POST(req: NextRequest) {
  try {
    const { installation_id, repo_full_name, files, dir = '', branch, projectId } = await req.json();

    if (!installation_id || !repo_full_name || !files) {
      return Response.json({ 
        ok: false, 
        error: 'Missing required fields: installation_id, repo_full_name, files' 
      }, { status: 400 });
    }

    // Initialize GitHub App
    const app = new App({
      appId: Number(process.env.GITHUB_APP_ID),
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
    });

    const octokit = await app.getInstallationOctokit(Number(installation_id));
    const [owner, repo] = (repo_full_name as string).split('/');

    if (!owner || !repo) {
      return Response.json({ 
        ok: false, 
        error: 'Invalid repository format. Use owner/repo' 
      }, { status: 400 });
    }

    // Get repository info
    const repoInfo = await octokit.request('GET /repos/{owner}/{repo}', { owner, repo });
    const targetBranch = branch || repoInfo.data.default_branch;

    console.log(`Pushing to ${owner}/${repo} on branch ${targetBranch}`);

    // Create project directory if specified
    const projectDir = dir || `projects/${projectId || 'zaki-project'}`;
    
    let pushedFiles = 0;
    const errors: string[] = [];

    // Process files
    for (const [filePath, fileData] of Object.entries(files)) {
      try {
        // Get file content - handle both string and object formats
        const content = typeof fileData === 'string' 
          ? fileData 
          : (fileData as any)?.code || (fileData as any)?.content || '';

        if (!content) {
          console.warn(`Skipping empty file: ${filePath}`);
          continue;
        }

        // Build the full path
        const cleanPath = filePath.replace(/^\/+/, '');
        const fullPath = projectDir ? `${projectDir}/${cleanPath}` : cleanPath;

        // Check if file exists
        let sha: string | undefined;
        try {
          const existing = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner, 
            repo, 
            path: fullPath, 
            ref: `heads/${targetBranch}`,
          });
          // @ts-ignore
          sha = existing.data.sha;
        } catch (error) {
          // File doesn't exist, that's fine
        }

        // Create or update file
        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
          owner,
          repo,
          path: fullPath,
          message: `feat: ${sha ? 'update' : 'add'} ${cleanPath} (via ZakiCode)`,
          content: Buffer.from(String(content)).toString('base64'),
          branch: targetBranch,
          ...(sha && { sha }),
        });

        pushedFiles++;
        console.log(`✅ Pushed: ${fullPath}`);

      } catch (error: any) {
        const errorMsg = `Failed to push ${filePath}: ${error.message}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    if (errors.length > 0 && pushedFiles === 0) {
      return Response.json({ 
        ok: false, 
        error: 'Failed to push any files', 
        details: errors 
      }, { status: 500 });
    }

    return Response.json({ 
      ok: true, 
      message: `Successfully pushed ${pushedFiles} file(s) to ${owner}/${repo}`,
      pushedFiles,
      errors: errors.length > 0 ? errors : undefined,
      repositoryUrl: `https://github.com/${owner}/${repo}`,
      projectPath: projectDir
    });

  } catch (error: any) {
    console.error('GitHub commit error:', error);
    return Response.json({ 
      ok: false, 
      error: error.message || 'Unknown error occurred' 
    }, { status: 500 });
  }
}
