import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const installation_id = url.searchParams.get('installation_id');
  const account_login   = url.searchParams.get('account_login') || null;
  const account_type    = url.searchParams.get('account_type') || null;

  // TODO: استخرج user_id من جلسة المصادقة عندك
  const user_id = /* get current user id */ null;

  if (!installation_id || !user_id) {
    return NextResponse.redirect(new URL('/integrations?github=failed', req.url));
  }

  await supabase.from('user_github_links').upsert({
    user_id,
    installation_id: Number(installation_id),
    account_login,
    account_type,
    updated_at: new Date().toISOString(),
  });

  return NextResponse.redirect(new URL('/integrations?github=connected', req.url));
}
