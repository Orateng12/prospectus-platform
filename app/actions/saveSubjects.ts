'use server';

import { requireAuth } from '@/lib/supabase/requireAuth';
import { calcAPS } from '@/lib/utils';
import type { Subject } from '@/lib/types';

export async function saveSubjectMarks(subjects: Subject[]): Promise<{ success: true } | { error: string }> {
  const auth = await requireAuth();
  if (!auth.ok) return { error: auth.error };
  const { user, supabase } = auth;

  const { error } = await supabase
    .from('user_profiles')
    .update({ subject_marks: subjects, aps_score: calcAPS(subjects) })
    .eq('id', user.id);

  return error ? { error: error.message } : { success: true };
}
