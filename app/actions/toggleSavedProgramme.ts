'use server';

import { requireAuth } from '@/lib/supabase/requireAuth';

export async function toggleSavedProgramme(
  programmeId: string,
  currentlySaved: boolean
): Promise<{ saved: boolean } | { error: string }> {
  const auth = await requireAuth();
  if (!auth.ok) return { error: auth.error };
  const { user, supabase } = auth;

  if (currentlySaved) {
    const { error } = await supabase
      .from('saved_programmes')
      .delete()
      .eq('user_id', user.id)
      .eq('programme_id', programmeId);
    if (error) return { error: error.message };
    return { saved: false };
  } else {
    const { error } = await supabase
      .from('saved_programmes')
      .insert({ user_id: user.id, programme_id: programmeId });
    if (error) return { error: error.message };
    return { saved: true };
  }
}
