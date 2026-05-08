'use server';

import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';

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
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
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

export async function requestPasswordReset(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const email = formData.get('email') as string;
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/reset-password`,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string;
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  redirect('/dashboard');
}
