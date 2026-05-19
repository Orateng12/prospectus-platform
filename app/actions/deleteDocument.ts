'use server';

import { requireAuth } from '@/lib/supabase/requireAuth';

export async function deleteDocument(
  docType: string,
): Promise<{ success: true } | { error: string }> {
  const auth = await requireAuth();
  if (!auth.ok) return { error: auth.error };
  const { user, supabase } = auth;

  const { data, error: fetchError } = await supabase
    .from('user_documents')
    .select('storage_path')
    .eq('user_id', user.id)
    .eq('doc_type', docType)
    .single();

  if (fetchError || !data) return { error: fetchError?.message ?? 'Document not found' };

  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([data.storage_path]);

  if (storageError) return { error: storageError.message };

  const { error: dbError } = await supabase
    .from('user_documents')
    .delete()
    .eq('user_id', user.id)
    .eq('doc_type', docType);

  return dbError ? { error: dbError.message } : { success: true };
}
