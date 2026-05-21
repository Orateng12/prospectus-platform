'use server';

import { requireAuth } from '@/lib/supabase/requireAuth';

export async function markNotificationsRead(ids?: string[]): Promise<{ error: string } | undefined> {
  const auth = await requireAuth();
  if (!auth.ok) return { error: auth.error };
  const { user, supabase } = auth;

  let query = supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id);

  if (ids && ids.length > 0) {
    query = query.in('id', ids);
  }

  const { error } = await query;
  return error ? { error: error.message } : undefined;
}
