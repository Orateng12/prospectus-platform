'use server';

import { requireAuth } from '@/lib/supabase/requireAuth';

export async function addDeadline(title: string, date: string): Promise<{ id: string } | { error: string }> {
  const auth = await requireAuth();
  if (!auth.ok) return { error: auth.error };
  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from('custom_deadlines')
    .insert({ user_id: user.id, title: title.trim(), date })
    .select('id')
    .single();

  if (error) return { error: error.message };
  return { id: data.id };
}

export async function deleteDeadline(id: string): Promise<{ error?: string }> {
  const auth = await requireAuth();
  if (!auth.ok) return { error: auth.error };
  const { supabase } = auth;

  const { error } = await supabase
    .from('custom_deadlines')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };
  return {};
}
