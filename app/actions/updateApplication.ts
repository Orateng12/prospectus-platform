'use server';

import { requireAuth } from '@/lib/supabase/requireAuth';

export interface UpdateApplicationInput {
  status?: 'draft' | 'submitted' | 'pending' | 'accepted' | 'rejected';
  outcome?: string;
  deadline?: string | null;
  notes?: string;
}

export async function updateApplication(
  id: string,
  input: UpdateApplicationInput,
): Promise<{ success: true } | { error: string }> {
  const auth = await requireAuth();
  if (!auth.ok) return { error: auth.error };
  const { user, supabase } = auth;

  const update: Record<string, unknown> = {};
  if (input.status !== undefined)   update.status = input.status;
  if (input.outcome !== undefined)  update.outcome = input.outcome;
  if ('deadline' in input)          update.deadline = input.deadline;
  if (input.notes !== undefined)    update.notes = input.notes;
  // Record submission timestamp when marking as submitted
  if (input.status === 'submitted') update.applied_at = new Date().toISOString();

  const { error } = await supabase
    .from('student_applications')
    .update(update)
    .eq('id', id)
    .eq('user_id', user.id); // user-scoped: can only update own rows

  return error ? { error: error.message } : { success: true };
}
