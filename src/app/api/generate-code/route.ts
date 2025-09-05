import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  try {
    const response = await fetch('https://overzakiar.app.n8n.cloud/api/webhook/builder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-BUILDER-SECRET': process.env.N8N_SECRET || '',
      },
      body: JSON.stringify(body),
    });

    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
  }
}