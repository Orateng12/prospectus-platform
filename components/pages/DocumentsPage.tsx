'use client';

import { useState } from 'react';
import type { Route } from '@/lib/types';

type DocStatus = 'uploaded' | 'missing' | 'expired';

interface Document {
  id: string;
  name: string;
  category: string;
  status: DocStatus;
  uploaded?: string;
  required: string[];
}

const DOCS: Document[] = [
  { id: 'id', name: 'South African ID', category: 'Identity', status: 'uploaded', uploaded: '12 Aug 2026', required: ['UCT', 'Wits', 'NSFAS'] },
  { id: 'matric', name: 'Matric Certificate (NSC)', category: 'Academic', status: 'missing', required: ['UCT', 'Wits', 'Stellenbosch', 'NSFAS'] },
  { id: 'results', name: 'Grade 11 Results', category: 'Academic', status: 'uploaded', uploaded: '10 Aug 2026', required: ['UCT', 'Wits'] },
  { id: 'residence', name: 'Proof of Residence', category: 'Household', status: 'uploaded', uploaded: '12 Aug 2026', required: ['NSFAS'] },
  { id: 'income', name: 'Parent/Guardian Payslips (3 months)', category: 'Financial', status: 'uploaded', uploaded: '13 Aug 2026', required: ['NSFAS', 'Allan Gray'] },
  { id: 'bank', name: 'Bank Statements (6 months)', category: 'Financial', status: 'missing', required: ['Allan Gray', 'Investec'] },
  { id: 'photo', name: 'Passport Photograph', category: 'Identity', status: 'uploaded', uploaded: '12 Aug 2026', required: ['UCT', 'Wits'] },
  { id: 'aps', name: 'APS Calculation Sheet', category: 'Academic', status: 'missing', required: ['Wits', 'UKZN'] },
];

const STATUS_BADGE: Record<DocStatus, string> = {
  uploaded: 'success',
  missing: 'destructive',
  expired: 'warning',
};

const STATUS_LABEL: Record<DocStatus, string> = {
  uploaded: 'Uploaded',
  missing: 'Missing',
  expired: 'Expired',
};

export default function DocumentsPage({ navigate }: { navigate?: (r: Route) => void }) {
  const [docs, setDocs] = useState(DOCS);

  const categories = [...new Set(docs.map(d => d.category))];
  const missing = docs.filter(d => d.status === 'missing').length;
  const uploaded = docs.filter(d => d.status === 'uploaded').length;

  function markUploaded(id: string) {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, status: 'uploaded', uploaded: 'Just now' } : d));
  }

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Execute · Documents</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Document vault</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Documents</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '44rem' }}>
              Manage all supporting documents for your applications in one place. Upload once, apply everywhere.
            </p>
          </div>
          <div className="row">
            <span className="badge success">{uploaded} uploaded</span>
            {missing > 0 && <span className="badge destructive">{missing} missing</span>}
          </div>
        </div>
      </div>

      <div className="stack-3">
        {categories.map(cat => {
          const catDocs = docs.filter(d => d.category === cat);
          return (
            <div key={cat} className="card">
              <div className="sec" style={{ marginBottom: '0.75rem' }}>
                <h3>{cat}</h3>
                <span className="caption">{catDocs.filter(d => d.status === 'uploaded').length}/{catDocs.length} uploaded</span>
              </div>
              <div className="stack">
                {catDocs.map(doc => (
                  <div key={doc.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto',
                    gap: '0.875rem',
                    alignItems: 'center',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid hsl(var(--border))',
                  }}
                  className="doc-row">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{doc.name}</div>
                      <div className="caption" style={{ marginTop: 2 }}>
                        {doc.status === 'uploaded'
                          ? `Uploaded ${doc.uploaded}`
                          : `Required by: ${doc.required.join(', ')}`}
                      </div>
                    </div>
                    <span className={`badge ${STATUS_BADGE[doc.status]}`}>{STATUS_LABEL[doc.status]}</span>
                    {doc.status === 'uploaded' ? (
                      <button className="btn btn-ghost btn-sm">View</button>
                    ) : (
                      <button className="btn btn-outline btn-sm" onClick={() => markUploaded(doc.id)}>
                        Upload
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {missing > 0 && (
        <div className="card" style={{ marginTop: '1.25rem', borderColor: 'hsl(var(--warning) / 0.4)', background: 'hsl(var(--warning) / 0.04)' }}>
          <div className="row-between">
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{missing} document{missing > 1 ? 's' : ''} still missing</div>
              <div className="caption" style={{ marginTop: 1 }}>Required for upcoming application deadlines</div>
            </div>
            <div className="row" style={{ gap: '0.5rem' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate?.('deadlines')}
              >
                View deadlines →
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setDocs(prev => prev.map(d => d.status === 'missing' ? { ...d, status: 'uploaded' as const, uploaded: 'Just now' } : d));
                }}
              >
                Mark all uploaded
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
