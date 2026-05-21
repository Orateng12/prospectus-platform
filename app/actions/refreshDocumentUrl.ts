'use server';

import { requireAuth } from '@/lib/supabase/requireAuth';

export async function refreshDocumentUrl(
  docType: string,
): Promise<{ signedUrl: string } | { error: string }> {
  const auth = await requireAuth();
  if (!auth.ok) return { error: auth.error };
  const { supabase } = auth;

  const { user } = auth;

  // Fetch the storage_path for this doc — scoped to the authenticated user
  const { data: doc, error: fetchError } = await supabase
    .from('user_documents')
    .select('storage_path')
    .eq('user_id', user.id)
    .eq('doc_type', docType)
    .single();

  if (fetchError || !doc) return { error: 'Document not found' };

  const { data, error: signError } = await supabase.storage
    .from('documents')
    .createSignedUrl(doc.storage_path, 3600);

  if (signError || !data?.signedUrl) return { error: signError?.message ?? 'Could not generate URL' };

  return { signedUrl: data.signedUrl };
}
