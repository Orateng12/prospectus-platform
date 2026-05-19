'use server';

import { requireAuth } from '@/lib/supabase/requireAuth';

export async function toggleScholarshipApplication(
  scholarshipName: string,
): Promise<{ applied: boolean } | { error: string }> {
  const auth = await requireAuth();
  if (!auth.ok) return { error: auth.error };
  const { user, supabase } = auth;

  const { data: existing } = await supabase
    .from('scholarship_applications')
    .select('id')
    .eq('user_id', user.id)
    .eq('scholarship_name', scholarshipName)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('scholarship_applications')
      .delete()
      .eq('id', existing.id);
    return error ? { error: error.message } : { applied: false };
  }

  const { error } = await supabase
    .from('scholarship_applications')
    .insert({ user_id: user.id, scholarship_name: scholarshipName });

  return error ? { error: error.message } : { applied: true };
}
