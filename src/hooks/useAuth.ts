// src/hooks/useAuth.ts
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClientComponentClient, type User } from '@supabase/auth-helpers-nextjs';

type Database = any;

type Profile = {
  full_name: string | null;
  avatar_url: string | null;
};

export function useAuth() {
  const supabase = useMemo(() => createClientComponentClient<Database>(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(
    async (uid: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', uid)
        .single();
      setProfile((data as Profile) ?? null);
    },
    [supabase]
  );

  // اقرأ الجلسة مرة، ثم استمع لأي تغيّر
  useEffect(() => {
    let unsub: { subscription?: { unsubscribe: () => void } } | undefined;

    (async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) await fetchProfile(session.user.id);
      setLoading(false);

      const sub = supabase.auth.onAuthStateChange((_event, newSession) => {
        setUser(newSession?.user ?? null);
        if (newSession?.user) fetchProfile(newSession.user.id);
        else setProfile(null);
      });
      unsub = sub.data;
    })();

    return () => unsub?.subscription?.unsubscribe?.();
  }, [supabase, fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  // (اختياري) دوال تسجيل الدخول/التسجيل لو بدّك تستخدمها في صفحات Auth
  const signIn = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      return { error };
    },
    [supabase]
  );

  const signUp = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      setError(null);
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      return { data, error };
    },
    [supabase]
  );

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
      },
    });
    if (error) setError(error.message);
    return { error };
  }, [supabase]);

  const clearError = useCallback(() => setError(null), []);

  return {
    // حالة عامة
    loading,
    error,
    clearError,

    // المستخدم والملف
    user,
    profile,
    isAuthenticated: !!user,
    workspaceName: profile?.full_name ?? undefined,

    // أكشنز
    signOut,
    signIn,
    signUp,
    signInWithGoogle,
  };
}

export default useAuth;
