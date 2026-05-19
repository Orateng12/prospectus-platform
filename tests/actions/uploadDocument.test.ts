import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockRequireAuth } = vi.hoisted(() => ({ mockRequireAuth: vi.fn() }));
vi.mock('@/lib/supabase/requireAuth', () => ({ requireAuth: mockRequireAuth }));

import { uploadDocument } from '../../app/actions/uploadDocument';

const mockUser = { id: 'user-99' };

function makeFile(opts: { name?: string; size?: number; type?: string } = {}): File {
  const content = 'x'.repeat(opts.size ?? 100);
  const blob = new Blob([content], { type: opts.type ?? 'application/pdf' });
  return new File([blob], opts.name ?? 'doc.pdf', { type: opts.type ?? 'application/pdf' });
}

function makeSupabase(storageErr: string | null = null, dbErr: string | null = null) {
  const mockUpload = vi.fn().mockResolvedValue({ error: storageErr ? { message: storageErr } : null });
  const mockStorageFrom = vi.fn().mockReturnValue({ upload: mockUpload });

  const chain: Record<string, unknown> = {};
  (['from', 'upsert'] as const).forEach(m => (chain[m] = vi.fn().mockReturnValue(chain)));
  chain.then = (res: (v: unknown) => unknown) => Promise.resolve({ error: dbErr ? { message: dbErr } : null }).then(res);

  return {
    supabase: {
      storage: { from: mockStorageFrom },
      from: vi.fn().mockReturnValue(chain),
    },
    mockUpload,
    mockStorageFrom,
  };
}

describe('uploadDocument', () => {
  beforeEach(() => mockRequireAuth.mockReset());

  it('returns an error when unauthenticated', async () => {
    mockRequireAuth.mockResolvedValue({ ok: false, error: 'Not authenticated' });
    const fd = new FormData();
    expect(await uploadDocument(fd)).toEqual({ error: 'Not authenticated' });
  });

  it('returns an error when file is missing', async () => {
    const { supabase } = makeSupabase();
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase });
    const fd = new FormData();
    fd.append('docType', 'id');
    expect(await uploadDocument(fd)).toEqual({ error: 'Missing file or document type' });
  });

  it('returns an error when docType is missing', async () => {
    const { supabase } = makeSupabase();
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase });
    const fd = new FormData();
    fd.append('file', makeFile());
    expect(await uploadDocument(fd)).toEqual({ error: 'Missing file or document type' });
  });

  it('returns an error when the file is empty', async () => {
    const { supabase } = makeSupabase();
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase });
    const fd = new FormData();
    fd.append('file', makeFile({ size: 0 }));
    fd.append('docType', 'id');
    expect(await uploadDocument(fd)).toEqual({ error: 'File is empty' });
  });

  it('returns an error when the file exceeds 10 MB', async () => {
    const { supabase } = makeSupabase();
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase });
    const fd = new FormData();
    fd.append('file', makeFile({ size: 11 * 1024 * 1024 }));
    fd.append('docType', 'id');
    expect(await uploadDocument(fd)).toEqual({ error: 'File exceeds 10 MB limit' });
  });

  it('returns an error when the MIME type is not allowed', async () => {
    const { supabase } = makeSupabase();
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase });
    const fd = new FormData();
    fd.append('file', makeFile({ type: 'text/plain', name: 'doc.txt' }));
    fd.append('docType', 'id');
    expect(await uploadDocument(fd)).toEqual({
      error: 'Only PDF, JPEG, PNG, HEIC and WebP files are accepted',
    });
  });

  it('returns an error when the storage upload fails', async () => {
    const { supabase } = makeSupabase('bucket unavailable');
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase });
    const fd = new FormData();
    fd.append('file', makeFile());
    fd.append('docType', 'id');
    expect(await uploadDocument(fd)).toEqual({ error: 'bucket unavailable' });
  });

  it('returns an error when the DB upsert fails', async () => {
    const { supabase } = makeSupabase(null, 'unique violation');
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase });
    const fd = new FormData();
    fd.append('file', makeFile());
    fd.append('docType', 'id');
    expect(await uploadDocument(fd)).toEqual({ error: 'unique violation' });
  });

  it('returns { success: true } on a successful upload', async () => {
    const { supabase } = makeSupabase(null, null);
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase });
    const fd = new FormData();
    fd.append('file', makeFile());
    fd.append('docType', 'matric');
    expect(await uploadDocument(fd)).toEqual({ success: true });
  });

  it('uploads to the storage path {userId}/{docType}.{ext}', async () => {
    const { supabase, mockUpload, mockStorageFrom } = makeSupabase(null, null);
    mockRequireAuth.mockResolvedValue({ ok: true, user: mockUser, supabase });
    const fd = new FormData();
    fd.append('file', makeFile({ name: 'my-id.pdf', type: 'application/pdf' }));
    fd.append('docType', 'id');
    await uploadDocument(fd);
    expect(mockStorageFrom).toHaveBeenCalledWith('documents');
    expect(mockUpload).toHaveBeenCalledWith(
      `${mockUser.id}/id.pdf`,
      expect.any(File),
      expect.objectContaining({ upsert: true }),
    );
  });
});
