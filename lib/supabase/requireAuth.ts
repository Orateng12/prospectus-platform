import type { SupabaseClient, User } from '@supabase/supabase-js';
import { getSupabaseServerClient } from './server';

export type AuthSuccess = { ok: true; user: User; supabase: SupabaseClient };
export type AuthFailure = { ok: false; error: string };
export type AuthResult = AuthSuccess | AuthFailure;

/**
 * Validates the current session and returns the authenticated user + supabase client.
 * Use in server actions: `const auth = await requireAuth(); if (!auth.ok) return { error: auth.error };`
 * Use in Server Component pages: `const auth = await requireAuth(); if (!auth.ok) redirect('/login');`
 */
export async function requireAuth(): Promise<AuthResult> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return { ok: false, error: 'Not authenticated' };
    return { ok: true, user: data.user, supabase };
  } catch {
    return { ok: false, error: 'Not authenticated' };
  }
}
