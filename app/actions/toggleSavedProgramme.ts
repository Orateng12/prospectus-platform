'use server';

import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function toggleSavedProgramme(
  programmeId: string,
  currentlySaved: boolean
): Promise<{ saved: boolean } | { error: string }> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

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
