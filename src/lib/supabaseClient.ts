// src/lib/supabaseClient.ts
'use client';

import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// لو عندك types مولدة من supabase حطها هنا بدل any
type Database = any;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl) throw new Error('Missing env NEXT_PUBLIC_SUPABASE_URL');
if (!supabaseAnonKey) throw new Error('Missing env NEXT_PUBLIC_SUPABASE_ANON_KEY');

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// 👇 fetch أصلي لتجاوز أي "fetch" مخصص عندك
const rawFetch: typeof fetch = (...args: Parameters<typeof fetch>) =>
  window.fetch(...args);

// 🔒 singleton
let _client: ReturnType<typeof createClientComponentClient<Database>> | null = null;

export function getSupabaseClient() {
  if (_client) return _client;
  _client = createClientComponentClient<Database>({
    options: { global: { fetch: rawFetch } },
  } as any);
  return _client;
}
