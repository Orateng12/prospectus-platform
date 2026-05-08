'use server';

import { requireAuth } from '@/lib/supabase/requireAuth';
import type { Subject } from '@/lib/types';

export async function saveSubjectMarks(subjects: Subject[]) {
  const auth = await requireAuth();
  if (!auth.ok) return { error: auth.error };
  const { user, supabase } = auth;

  const { error } = await supabase
    .from('user_profiles')
    .update({ subject_marks: subjects })
    .eq('id', user.id);

  return error ? { error: error.message } : { success: true };
}
