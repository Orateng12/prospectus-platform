import type { SupabaseClient, User } from '@supabase/supabase-js';
import { getSupabaseServerClient } from './server';

export type AuthSuccess = { user: User; supabase: SupabaseClient };
export type AuthFailure = { error: string };
export type AuthResult = AuthSuccess | AuthFailure;

/**
 * Validates the current session and returns the authenticated user + supabase client.
 * Use in server actions: `const auth = await requireAuth(); if ('error' in auth) return auth;`
 * Use in Server Component pages: `const auth = await requireAuth(); if ('error' in auth) redirect('/login');`
 */
export async function requireAuth(): Promise<AuthResult> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return { error: 'Not authenticated' };
    return { user: data.user, supabase };
  } catch {
    return { error: 'Not authenticated' };
  }
}
