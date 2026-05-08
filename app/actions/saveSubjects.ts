'use server';

import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Subject } from '@/lib/types';

export async function saveSubjectMarks(subjects: Subject[]) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('user_profiles')
    .update({ subject_marks: subjects })
    .eq('id', user.id);

  return error ? { error: error.message } : { success: true };
}
