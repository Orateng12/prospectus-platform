'use server';

import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/supabase/requireAuth';

/**
 * Resolves the canonical site URL for redirect links in auth emails and OAuth.
 * Priority: explicit NEXT_PUBLIC_SITE_URL → Vercel production URL (auto-injected) → null
 */
function getSiteUrl(): string | null {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return null;
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect('/dashboard');
}

export async function signUp(formData: FormData): Promise<{ error?: string; needsConfirmation?: boolean } | undefined> {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return { error: 'Signup is not configured — contact support' };

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If session is null, email confirmation is required before the user can sign in.
  // Return a flag so the signup page can show a "check your email" message.
  if (!data.session) {
    return { needsConfirmation: true };
  }

  // Session established immediately (email confirmation disabled) — go to dashboard.
  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function signInWithGoogle(): Promise<{ url: string } | { error: string }> {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return { error: 'Google sign-in is not configured — contact support' };

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });
  if (error) return { error: error.message };
  if (!data.url) return { error: 'No redirect URL returned' };
  return { url: data.url };
}

export async function requestPasswordReset(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return { error: 'Password reset is not configured — contact support' };

  const email = formData.get('email') as string;
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function updatePassword(formData: FormData): Promise<{ error: string } | undefined> {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (password.length < 8) return { error: 'Password must be at least 8 characters' };
  if (password !== confirmPassword) return { error: 'Passwords do not match' };

  const auth = await requireAuth();
  if (!auth.ok) return { error: auth.error };

  const { error } = await auth.supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  redirect('/dashboard');
}
