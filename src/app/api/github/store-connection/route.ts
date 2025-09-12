import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const { installation_id, account_login, account_type } = await req.json();

    if (!installation_id) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Missing installation_id' 
      }, { status: 400 });
    }

    console.log('Storing GitHub connection to database:', {
      installation_id,
      account_login,
      account_type
    });

    // Try to get current user (this might fail if no auth is set up)
    let user_id = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      user_id = user?.id;
    } catch (error) {
      console.log('No authenticated user found, skipping database storage');
    }

    // Store in database if user is authenticated
    if (user_id) {
      await supabase.from('user_github_links').upsert({
        user_id,
        installation_id: Number(installation_id),
        account_login,
        account_type,
        updated_at: new Date().toISOString(),
      });

      console.log('GitHub connection stored in database for user:', user_id);
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'Connection stored successfully',
      stored_in_db: !!user_id
    });

  } catch (error: any) {
    console.error('Error storing GitHub connection:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error.message || 'Failed to store connection' 
    }, { status: 500 });
  }
}
