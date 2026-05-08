'use server';

import { requireAuth } from '@/lib/supabase/requireAuth';

export async function saveApplication(
  programmeId: string,
  programmeName: string,
  institutionName: string,
  deadline?: string
): Promise<{ id: string } | { error: string }> {
  const auth = await requireAuth();
  if (!auth.ok) return { error: auth.error };
  const { user, supabase } = auth;

  // Check for existing application
  const { data: existing } = await supabase
    .from('student_applications')
    .select('id')
    .eq('user_id', user.id)
    .eq('programme_id', programmeId)
    .maybeSingle();

  if (existing) return { id: existing.id };

  const { data, error } = await supabase
    .from('student_applications')
    .insert({
      user_id: user.id,
      programme_id: programmeId,
      status: 'draft',
      deadline: deadline ?? null,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };
  return { id: data.id };
}
