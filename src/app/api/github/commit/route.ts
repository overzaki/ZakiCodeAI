import { NextRequest } from 'next/server';

export async function GET() {
  return Response.json({ ok: true, method: 'GET' });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // البيانات اللي يرسلها الفرونت
    // TODO: نادِ هنا دالة الـ commit الحقيقية لو عندك وحدة جاهزة
    // const result = await commitFilesToRepo(body);
    // return Response.json(result);

    // مؤقتًا رجّع OK للتأكد إن الراوت شغّال
    return Response.json({ ok: true, received: Object.keys(body || {}) });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || 'Bad JSON' }, { status: 400 });
  }
}
