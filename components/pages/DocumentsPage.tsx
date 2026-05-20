'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Route, DbDocument } from '@/lib/types';
import { uploadDocument } from '@/app/actions/uploadDocument';
import { deleteDocument } from '@/app/actions/deleteDocument';
import { refreshDocumentUrl } from '@/app/actions/refreshDocumentUrl';

// Signed URLs last 1 hour — consider stale after 55 minutes
const URL_TTL_MS = 55 * 60 * 1000;

function isUrlStale(uploadedAt: string): boolean {
  return Date.now() - new Date(uploadedAt).getTime() > URL_TTL_MS;
}

interface DocMeta {
  type: string;
  name: string;
  category: string;
  required: string[];
}

const DOC_CATALOG: DocMeta[] = [
  { type: 'id',        name: 'South African ID',                    category: 'Identity',  required: ['UCT', 'Wits', 'NSFAS'] },
  { type: 'matric',    name: 'Matric Certificate (NSC)',             category: 'Academic',  required: ['UCT', 'Wits', 'Stellenbosch', 'NSFAS'] },
  { type: 'results',   name: 'Grade 11 Results',                    category: 'Academic',  required: ['UCT', 'Wits'] },
  { type: 'residence', name: 'Proof of Residence',                  category: 'Household', required: ['NSFAS'] },
  { type: 'income',    name: 'Parent/Guardian Payslips (3 months)', category: 'Financial', required: ['NSFAS', 'Allan Gray'] },
  { type: 'bank',      name: 'Bank Statements (6 months)',          category: 'Financial', required: ['Allan Gray', 'Investec'] },
  { type: 'photo',     name: 'Passport Photograph',                 category: 'Identity',  required: ['UCT', 'Wits'] },
  { type: 'aps',       name: 'APS Calculation Sheet',               category: 'Academic',  required: ['Wits', 'UKZN'] },
];

const CATEGORIES = [...new Set(DOC_CATALOG.map(d => d.category))];

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

interface DocumentsPageProps {
  navigate?: (r: Route) => void;
  documents?: DbDocument[];
}

export default function DocumentsPage({ navigate, documents = [] }: DocumentsPageProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingDocType, setPendingDocType] = useState<string | null>(null);
  const [confirmDeleteType, setConfirmDeleteType] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  // Overridden URLs for refreshed signed links
  const [freshUrls, setFreshUrls] = useState<Record<string, string>>({});
  const [refreshingUrl, setRefreshingUrl] = useState<string | null>(null);

  const uploadedMap: Record<string, DbDocument> = Object.fromEntries(
    documents.map(d => [d.doc_type, d]),
  );

  async function handleViewFresh(docType: string) {
    setRefreshingUrl(docType);
    const result = await refreshDocumentUrl(docType);
    setRefreshingUrl(null);
    if ('signedUrl' in result) {
      setFreshUrls(prev => ({ ...prev, [docType]: result.signedUrl }));
      window.open(result.signedUrl, '_blank', 'noopener,noreferrer');
    }
  }

  const uploaded = DOC_CATALOG.filter(d => uploadedMap[d.type]).length;
  const missing = DOC_CATALOG.length - uploaded;

  function triggerUpload(docType: string) {
    setPendingDocType(docType);
    setRowError(prev => ({ ...prev, [docType]: '' }));
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !pendingDocType) return;
    e.target.value = '';

    const docType = pendingDocType;
    startTransition(async () => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('docType', docType);
      const result = await uploadDocument(fd);
      if ('error' in result) {
        setRowError(prev => ({ ...prev, [docType]: result.error }));
      } else {
        router.refresh();
      }
      setPendingDocType(null);
    });
  }

  function handleDelete(docType: string) {
    setConfirmDeleteType(null);
    startTransition(async () => {
      const result = await deleteDocument(docType);
      if ('error' in result) {
        setRowError(prev => ({ ...prev, [docType]: result.error }));
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="page-anim">
      {/* Hidden file input — shared across all rows */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.heic,.webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div className="page-head">
        <div className="breadcrumb">Execute · Documents</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Document vault</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Documents</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '44rem' }}>
              Upload once, apply everywhere. PDF, JPEG, PNG and HEIC files up to 10 MB.
            </p>
          </div>
          <div className="row">
            <span className="badge success">{uploaded} uploaded</span>
            {missing > 0 && <span className="badge destructive">{missing} missing</span>}
          </div>
        </div>
      </div>

      {/* KPI bar */}
      <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
        {[
          { l: 'Total documents',    v: String(DOC_CATALOG.length), h: `${CATEGORIES.length} categories`,                 c: '' },
          { l: 'Uploaded',           v: String(uploaded),           h: `of ${DOC_CATALOG.length} required`,               c: uploaded > 0 ? 'success' : '' },
          { l: 'Auto-fill ready',    v: String(uploaded),           h: 'can be attached to applications',                 c: 'success' },
          { l: 'Missing',            v: String(missing),            h: missing > 0 ? 'required for deadlines' : 'all clear', c: missing > 0 ? 'destructive' : 'success' },
        ].map(({ l, v, h, c }) => (
          <div className="card kpi" key={l}>
            <div className="lbl">{l}</div>
            <div className="val" style={c ? { color: `hsl(var(--${c}))` } : {}}>{v}</div>
            <div className="hint">{h}</div>
          </div>
        ))}
      </div>

      <div className="stack-3">
        {CATEGORIES.map(cat => {
          const catDocs = DOC_CATALOG.filter(d => d.category === cat);
          const catUploaded = catDocs.filter(d => uploadedMap[d.type]).length;
          return (
            <div key={cat} className="card">
              <div className="sec" style={{ marginBottom: '0.75rem' }}>
                <h3>{cat}</h3>
                <span className="caption">{catUploaded}/{catDocs.length} uploaded</span>
              </div>
              <div className="stack">
                {catDocs.map(doc => {
                  const dbDoc = uploadedMap[doc.type];
                  const isUploaded = !!dbDoc;
                  const isUploadingThis = isPending && pendingDocType === doc.type;
                  const isDeletingThis = isPending && confirmDeleteType === null && !pendingDocType;
                  const err = rowError[doc.type];
                  const isConfirmingDelete = confirmDeleteType === doc.type;

                  return (
                    <div
                      key={doc.type}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '0.875rem',
                        alignItems: 'flex-start',
                        padding: '0.75rem 0',
                        borderBottom: '1px solid hsl(var(--border))',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{doc.name}</div>
                        <div className="caption" style={{ marginTop: 2 }}>
                          {isUploaded
                            ? `${dbDoc.file_name}${dbDoc.file_size ? ` · ${fmtBytes(dbDoc.file_size)}` : ''} · ${fmtDate(dbDoc.uploaded_at)}`
                            : `Required by: ${doc.required.join(', ')}`}
                        </div>
                        {err && (
                          <div style={{ color: 'hsl(var(--destructive))', fontSize: '0.75rem', marginTop: 4 }}>
                            {err}
                          </div>
                        )}
                        {isConfirmingDelete && (
                          <div className="row" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '0.8125rem' }}>Delete this document?</span>
                            <button
                              className="btn btn-sm"
                              style={{ background: 'hsl(var(--destructive))', color: '#fff', borderColor: 'hsl(var(--destructive))' }}
                              onClick={() => handleDelete(doc.type)}
                              disabled={isPending}
                            >
                              Delete
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setConfirmDeleteType(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="row" style={{ gap: '0.5rem', flexShrink: 0 }}>
                        <span className={`badge ${isUploaded ? 'success' : 'destructive'}`}>
                          {isUploaded ? 'Uploaded' : 'Missing'}
                        </span>
                        {isUploaded ? (
                          <>
                            {(dbDoc.signed_url || freshUrls[doc.type]) && (() => {
                              const url = freshUrls[doc.type] ?? dbDoc.signed_url!;
                              const stale = !freshUrls[doc.type] && isUrlStale(dbDoc.uploaded_at);
                              const isRefreshing = refreshingUrl === doc.type;
                              return stale ? (
                                <button
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => handleViewFresh(doc.type)}
                                  disabled={isRefreshing}
                                >
                                  {isRefreshing ? '…' : 'View'}
                                </button>
                              ) : (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-ghost btn-sm"
                                >
                                  View
                                </a>
                              );
                            })()}
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => triggerUpload(doc.type)}
                              disabled={isPending}
                            >
                              Replace
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'hsl(var(--destructive))' }}
                              onClick={() => setConfirmDeleteType(doc.type)}
                              disabled={isPending}
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => triggerUpload(doc.type)}
                            disabled={isPending}
                          >
                            {isUploadingThis ? 'Uploading…' : 'Upload'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {missing > 0 && (
        <div
          className="card"
          style={{
            marginTop: '1.25rem',
            borderColor: 'hsl(var(--warning) / 0.4)',
            background: 'hsl(var(--warning) / 0.04)',
          }}
        >
          <div className="row-between">
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                {missing} document{missing > 1 ? 's' : ''} still missing
              </div>
              <div className="caption" style={{ marginTop: 1 }}>
                Required for upcoming application deadlines
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate?.('deadlines')}>
              View deadlines →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
