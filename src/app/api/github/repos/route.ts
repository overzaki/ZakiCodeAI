import { NextRequest, NextResponse } from 'next/server';
import { getInstallationToken } from '../token';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const installation_id = Number(url.searchParams.get('installation_id'));
  if (!installation_id) return NextResponse.json({ error: 'installation_id required' }, { status: 400 });

  const token = await getInstallationToken(installation_id);
  const r = await fetch('https://api.github.com/installation/repositories', {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
    cache: 'no-store',
  });
  const data = await r.json();
  // أعِد owner/repo جاهزة للاختيار
  const repos = (data.repositories || []).map((x: any) => ({ full_name: x.full_name, default_branch: x.default_branch }));
  return NextResponse.json({ repos });
}
