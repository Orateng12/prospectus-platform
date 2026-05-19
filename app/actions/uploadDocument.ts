'use server';

import { requireAuth } from '@/lib/supabase/requireAuth';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/webp',
]);

export async function uploadDocument(
  formData: FormData,
): Promise<{ success: true } | { error: string }> {
  const auth = await requireAuth();
  if (!auth.ok) return { error: auth.error };
  const { user, supabase } = auth;

  const file = formData.get('file') as File | null;
  const docType = formData.get('docType') as string | null;

  if (!file || !docType) return { error: 'Missing file or document type' };
  if (file.size === 0) return { error: 'File is empty' };
  if (file.size > MAX_BYTES) return { error: 'File exceeds 10 MB limit' };
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: 'Only PDF, JPEG, PNG, HEIC and WebP files are accepted' };
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const storagePath = `${user.id}/${docType}.${ext}`;

  const { error: storageError } = await supabase.storage
    .from('documents')
    .upload(storagePath, file, { contentType: file.type, upsert: true });

  if (storageError) return { error: storageError.message };

  const { error: dbError } = await supabase
    .from('user_documents')
    .upsert(
      {
        user_id:      user.id,
        doc_type:     docType,
        file_name:    file.name,
        storage_path: storagePath,
        file_size:    file.size,
        mime_type:    file.type,
        uploaded_at:  new Date().toISOString(),
      },
      { onConflict: 'user_id,doc_type' },
    );

  return dbError ? { error: dbError.message } : { success: true };
}
