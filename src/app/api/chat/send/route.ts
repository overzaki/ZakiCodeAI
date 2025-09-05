import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { randomUUID as nodeRandomUUID } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WEBHOOK = process.env.N8N_WEBHOOK_URL!;
const N8N_SECRET = process.env.N8N_SECRET || '';
const N8N_ERD_ACTION = process.env.N8N_ERD_ACTION || 'init';

function newId() {
  // @ts-ignore
  return globalThis.crypto?.randomUUID?.() ?? nodeRandomUUID();
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(req: NextRequest) {
  if (!WEBHOOK) {
    return NextResponse.json({ error: 'N8N_WEBHOOK_URL is not set on the server' }, { status: 500 });
  }

  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ 
      error: 'auth_required', 
      message: 'يجب تسجيل الدخول أولاً' 
    }, { status: 401 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const rawAction = String(body.action || '').toLowerCase().trim();
  let action = rawAction || (Array.isArray(body.pages) && body.pages.length ? 'generate' : 'erd');
  const platform =
    (body.platform && String(body.platform).toLowerCase()) ||
    (body.website ? 'website' : body.mobile ? 'mobile' : body.backend ? 'backend' : '');

  if (!platform && (action === 'init' || action === 'erd')) {
    return NextResponse.json({ 
      error: 'platform_required', 
      message: 'يجب اختيار المنصة (website/mobile/backend)' 
    }, { status: 400 });
  }

  // متغير ثابت لـ workspace - تجنب إنشاء workspace تماماً
  const FIXED_WORKSPACE_ID = '11111111-1111-1111-1111-111111111111';

  // دالة بسيطة لإنشاء workspace ثابت إذا لم يوجد
  async function ensureFixedWorkspace(): Promise<string> {
    // تحقق من وجود الـ workspace الثابت
    const { data: existing } = await supabase
      .from('workspaces')
      .select('id')
      .eq('id', FIXED_WORKSPACE_ID)
      .maybeSingle();

    if (existing) {
      return FIXED_WORKSPACE_ID;
    }

    // إنشاء workspace ثابت بدون استخدام أي functions أو triggers
    try {
      await supabase
        .from('workspaces')
        .insert({
          id: FIXED_WORKSPACE_ID,
          name: 'System Default Workspace',
          owner_id: user?.id ?? null,
          plan: 'free'
        });

      return FIXED_WORKSPACE_ID;
    } catch (error) {
      console.error('فشل في إنشاء workspace ثابت، سنستخدم المعرف كما هو:', error);
      return FIXED_WORKSPACE_ID;
    }
  }

  // دالة كريدت بسيطة
  async function checkUserCredits(userId: string): Promise<{ ok: boolean; remaining: number }> {
    try {
      const { data: account } = await supabase
        .from('credit_accounts')
        .select('balance')
        .eq('owner_type', 'user')
        .eq('owner_id', userId)
        .maybeSingle();

      if (!account) {
        // إنشاء حساب بسيط
        await supabase
          .from('credit_accounts')
          .insert({
            id: newId(),
            owner_type: 'user',
            owner_id: userId,
            plan: 'free',
            balance: 5 // 5 كريدت بسيطة
          });
        return { ok: true, remaining: 4 }; // بعد خصم 1
      }

      if (account.balance <= 0) {
        return { ok: false, remaining: 0 };
      }

      // خصم كريدت
      await supabase
        .from('credit_accounts')
        .update({ balance: account.balance - 1 })
        .eq('owner_type', 'user')
        .eq('owner_id', userId);

      return { ok: true, remaining: account.balance - 1 };

    } catch (error) {
      console.error('خطأ في الكريدت، سنسمح بالمتابعة:', error);
      return { ok: true, remaining: 5 }; // نسمح بالمتابعة في حالة الخطأ
    }
  }

  // العملية المركبة - أبسط ما يمكن
  if (action === 'init' && body.autoErd) {
    try {
      // 1. ضمان workspace ثابت
      const workspace_id = await ensureFixedWorkspace();

      // 2. فحص كريدت بسيط
      const creditCheck = await checkUserCredits(user.id);
      if (!creditCheck.ok) {
        return NextResponse.json({
          error: 'insufficient_credits',
          message: 'رصيدك المجاني انتهى. يرجى الترقية للمتابعة.',
          remaining: creditCheck.remaining
        }, { status: 402 });
      }

      // 3. إنشاء المشروع
      const projectId = newId();
      const project_name = String(body.project_name || body.prompt || '').trim() || 'مشروع جديد';
      const slug_hint = String(body.slug_hint || project_name || 'untitled').trim();
      const slug = `${slugify(slug_hint) || 'untitled'}-${projectId.slice(0, 6)}`;

      const { error: projectError } = await supabase
        .from('projects')
        .insert({
          id: projectId,
          workspace_id,
          owner_id: user.id,
          name: project_name,
          slug,
          meta: {
            initial_prompt: String(body.prompt || '').trim() || null,
            initial_platform: platform || null,
          },
          status: 'draft',
          visibility: 'private'
        });

      if (projectError) {
        throw new Error(`فشل في إنشاء المشروع: ${projectError.message}`);
      }

      // 4. إرسال إلى N8N
      const headers: Record<string, string> = { 'content-type': 'application/json' };
      if (N8N_SECRET) headers['X-BUILDER-SECRET'] = N8N_SECRET;

      const upstream = await fetch(WEBHOOK, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: N8N_ERD_ACTION,
          projectId,
          owner_id: user.id,
          workspace_id,
          project_name,
          slug_hint,
          prompt: String(body.prompt || '').trim(),
          platform,
          website: platform === 'website',
          mobile: platform === 'mobile',
          backend: platform === 'backend',
        }),
      });

      const contentType = upstream.headers.get('content-type') || 'application/json; charset=utf-8';
      const txt = await upstream.text();
      let erd: any = txt;
      try { erd = JSON.parse(txt); } catch {}

      return new NextResponse(
        JSON.stringify({ 
          status: 'success',
          action: 'created_and_erd',
          projectId, 
          workspace_id, 
          owner_id: user.id, 
          project_name,
          platform,
          credits_remaining: creditCheck.remaining,
          erd 
        }),
        { status: upstream.status, headers: { 'content-type': contentType } }
      );

    } catch (e: any) {
      console.error('خطأ في العملية:', e);
      return NextResponse.json(
        { 
          error: 'operation_failed', 
          message: 'فشل في إنشاء المشروع وتوليد ERD',
          details: e?.message || String(e)
        },
        { status: 500 }
      );
    }
  }

  // العمليات الأخرى
  if (action === 'erd' || action === 'generate') {
    const creditCheck = await checkUserCredits(user.id);
    if (!creditCheck.ok) {
      return NextResponse.json({
        error: 'insufficient_credits',
        message: 'رصيدك المجاني انتهى.',
        remaining: creditCheck.remaining
      }, { status: 402 });
    }
  }

  if (action === 'init') {
    try {
      const workspace_id = await ensureFixedWorkspace();
      const projectId = newId();
      const project_name = String(body.project_name || body.prompt || '').trim() || 'مشروع جديد';
      const slug_hint = String(body.slug_hint || project_name || 'untitled').trim();
      const slug = `${slugify(slug_hint) || 'untitled'}-${projectId.slice(0, 6)}`;

      const { error } = await supabase
        .from('projects')
        .insert({
          id: projectId,
          workspace_id,
          owner_id: user.id,
          name: project_name,
          slug,
          meta: {
            initial_prompt: String(body.prompt || '').trim() || null,
            initial_platform: platform || null
          },
          status: 'draft',
          visibility: 'private'
        });

      if (error) throw error;

      return NextResponse.json({ 
        status: 'success',
        action: 'created',
        projectId, 
        workspace_id, 
        owner_id: user.id,
        project_name,
        platform
      });

    } catch (e: any) {
      return NextResponse.json({ 
        error: 'project_creation_failed',
        details: e?.message 
      }, { status: 500 });
    }
  }

  // تمرير إلى N8N
  const upstreamHeaders: Record<string, string> = { 'content-type': 'application/json' };
  if (N8N_SECRET) upstreamHeaders['X-BUILDER-SECRET'] = N8N_SECRET;

  try {
    const upstream = await fetch(WEBHOOK, {
      method: 'POST',
      headers: upstreamHeaders,
      body: JSON.stringify({ ...body, owner_id: user.id }),
    });

    const contentType = upstream.headers.get('content-type') || 'application/json; charset=utf-8';
    const text = await upstream.text();
    return new NextResponse(text, { status: upstream.status, headers: { 'content-type': contentType } });
  } catch (err: any) {
    return NextResponse.json({ 
      error: 'n8n_connection_failed',
      details: err?.message 
    }, { status: 502 });
  }
}