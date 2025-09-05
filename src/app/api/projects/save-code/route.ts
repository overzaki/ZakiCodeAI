import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

type FileArr = Array<{ path: string; content: string }>;
type FileObj = Record<string, { code: string }>;

function filesToMarkerString(files?: FileArr | FileObj, fallback?: string) {
  if (!files) return fallback || '';
  if (Array.isArray(files)) {
    return files
      .map(f => `// FILE: ${String(f.path).replace(/^\/+/, '')}\n${f.content ?? ''}`)
      .join('\n\n') || (fallback || '');
  }
  return Object.entries(files)
    .map(([p, v]) => `// FILE: ${String(p).replace(/^\/+/, '')}\n${v.code ?? ''}`)
    .join('\n\n') || (fallback || '');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      projectId,
      files,                // array أو object
      website_code,         // اختياري لو بدك تتجاهل files
      mobile_code = null,
      backend_code = null,
      file_path = null,     // اختياري لتحديث مسار GitHub
    } = body as {
      projectId: string;
      files?: FileArr | FileObj;
      website_code?: string;
      mobile_code?: string | null;
      backend_code?: string | null;
      file_path?: string | null;
    };

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const siteCode = filesToMarkerString(files, website_code);

    const { error } = await supabase.from('projects').upsert(
      {
        id: projectId,
        website_code: siteCode,
        mobile_code,
        backend_code,
        updated_at: new Date().toISOString(),
        ...(file_path ? { file_path } : {}),
      },
      { onConflict: 'id' },
    );

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || 'Failed to save code' }, { status: 500 });
  }
}
