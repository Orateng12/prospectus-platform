'use server';

import { requireAuth } from '@/lib/supabase/requireAuth';

export async function dismissInsight(
  id: string,
): Promise<{ success: true } | { error: string }> {
  const auth = await requireAuth();
  if (!auth.ok) return { error: auth.error };
  const { user, supabase } = auth;

  const { error } = await supabase
    .from('ai_insights')
    .update({ dismissed: true })
    .eq('id', id)
    .eq('user_id', user.id);

  return error ? { error: error.message } : { success: true };
}
