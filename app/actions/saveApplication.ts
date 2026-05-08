'use server';

import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function saveApplication(
  programmeId: string,
  programmeName: string,
  institutionName: string,
  deadline?: string
): Promise<{ id: string } | { error: string }> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

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
