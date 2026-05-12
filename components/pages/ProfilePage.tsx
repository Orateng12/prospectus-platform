'use client';

import { useState } from 'react';
import type { Subject, PsychProfileData, CapabilityData } from '@/lib/types';
import { CAPS } from '@/lib/data';
import { calcAPS, fmtR } from '@/lib/utils';

interface ProfilePageProps {
  userName?: string;
  userFirstName?: string;
  userEmail?: string;
  userProvince?: string;
  subjects?: Subject[];
  householdIncome?: number;
  capabilityData?: CapabilityData | null;
  psychProfile?: PsychProfileData | null;
}

export default function ProfilePage({
  userName = 'Lerato Mokoena',
  userFirstName = 'Lerato',
  userEmail = 'lerato.mokoena@gmail.com',
  userProvince = 'Limpopo',
  subjects = [],
  householdIncome = 220000,
  capabilityData,
  psychProfile,
}: ProfilePageProps) {
  const [editSection, setEditSection] = useState<string | null>(null);
  const initial = userName.charAt(0).toUpperCase();
  const aps = subjects.length > 0 ? calcAPS(subjects) : 42;

  const caps = capabilityData ? [
    { l: 'Analytical', v: capabilityData.analytical_thinking },
    { l: 'Technical', v: capabilityData.technical_aptitude },
    { l: 'Social', v: capabilityData.communication_skills },
    { l: 'Creative', v: capabilityData.creative_thinking },
    { l: 'Leadership', v: capabilityData.leadership_potential },
    { l: 'Drive', v: capabilityData.entrepreneurial_drive },
  ] : CAPS.slice(0, 6);

  function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    return (
      <div className="card">
        <div className="row-between" style={{ marginBottom: '0.875rem' }}>
          <h3 className="subheading">{title}</h3>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setEditSection(prev => prev === id ? null : id)}
          >
            {editSection === id ? 'Done' : 'Edit'}
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Self · Profile</div>
        <div className="row-between">
          <div>
            <div className="eyebrow"><span className="dot" />Your account</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>Profile</h2>
          </div>
          <span className="badge brand" style={{ height: '1.75rem', fontSize: '0.8125rem' }}>PRO</span>
        </div>
      </div>

      {/* Hero */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div className="avatar" style={{ width: 72, height: 72, fontSize: '1.625rem', background: 'hsl(var(--primary))', flexShrink: 0 }}>
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="heading" style={{ fontSize: '1.375rem' }}>{userName}</div>
          <div className="caption" style={{ marginTop: '0.25rem' }}>{userEmail}</div>
          <div className="row" style={{ marginTop: '0.5rem', gap: '0.375rem' }}>
            <span className="badge">{userProvince}</span>
            <span className="badge success">APS {aps}</span>
            <span className="badge brand">PRO</span>
          </div>
        </div>
        <button className="btn btn-outline">Change photo</button>
      </div>

      <div className="grid-2 stack-3">
        {/* Personal */}
        <Section id="personal" title="Personal">
          <div className="stack-2">
            {[
              { l: 'Full name', v: userName },
              { l: 'Email', v: userEmail },
              { l: 'Province', v: userProvince ?? '—' },
              { l: 'Matric year', v: '2026' },
            ].map(row => (
              <div key={row.l}>
                <div className="caption" style={{ fontSize: '0.6875rem' }}>{row.l}</div>
                {editSection === 'personal' ? (
                  <input className="input" defaultValue={row.v ?? ''} style={{ width: '100%', marginTop: '0.25rem' }} />
                ) : (
                  <div style={{ fontWeight: 600, marginTop: '0.125rem' }}>{row.v ?? '—'}</div>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* Household */}
        <Section id="household" title="Household">
          <div className="stack-2">
            {[
              { l: 'Annual household income', v: fmtR(householdIncome ?? 0) },
              { l: 'NSFAS eligibility', v: (householdIncome ?? 0) <= 350000 ? 'Eligible (below R 350k)' : 'Above threshold' },
              { l: 'Dependants', v: '3' },
              { l: 'SASSA recipient', v: 'No' },
            ].map(row => (
              <div key={row.l}>
                <div className="caption" style={{ fontSize: '0.6875rem' }}>{row.l}</div>
                <div style={{ fontWeight: 600, marginTop: '0.125rem' }}>{row.v}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Academic */}
        <Section id="academic" title="Academic">
          <div className="stack">
            <div className="row-between" style={{ marginBottom: '0.5rem' }}>
              <span className="caption">APS Score</span>
              <span style={{ fontWeight: 800, fontSize: '1.5rem', fontVariantNumeric: 'tabular-nums' }}>{aps}</span>
            </div>
            {(subjects.length > 0 ? subjects : [
              { id: 'eng', name: 'English HL', mark: 62, designated: true },
              { id: 'math', name: 'Mathematics', mark: 78, designated: true },
              { id: 'pscience', name: 'Physical Sciences', mark: 71, designated: true },
            ]).map(s => (
              <div key={s.id} className="row-between" style={{ fontSize: '0.8125rem', padding: '0.375rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                <span>{s.name}</span>
                <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{s.mark}%</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Capability */}
        <Section id="capability" title="Capability graph">
          <div className="stack">
            {caps.map(c => (
              <div key={c.l} className="progress-row">
                <span className="label">{c.l}</span>
                <div className={`meter ${c.v >= 80 ? 'success' : c.v >= 65 ? 'primary' : 'accent'}`}>
                  <i style={{ width: `${c.v}%` }} />
                </div>
                <span className="val">{c.v}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Activity */}
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="sec" style={{ marginBottom: '0.875rem' }}>
          <h3>Activity</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            { l: 'Applications', v: '4', sub: '1 accepted · 1 pending', c: 'success' },
            { l: 'Scholarships saved', v: '5', sub: '2 applied · R 445k matched', c: 'brand' },
            { l: 'Programmes saved', v: '6', sub: 'across 4 universities', c: 'info' },
          ].map(s => (
            <div key={s.l} className="card compact" style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginTop: '0.25rem' }}>{s.l}</div>
              <div className="caption" style={{ marginTop: '0.125rem', fontSize: '0.6875rem' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
