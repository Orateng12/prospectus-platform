'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';

// ── APS helpers ──────────────────────────────────────────────
function pctToPoints(p: number): number {
  if (p >= 80) return 7;
  if (p >= 70) return 6;
  if (p >= 60) return 5;
  if (p >= 50) return 4;
  if (p >= 40) return 3;
  if (p >= 30) return 2;
  return 1;
}

const SUBJECTS = [
  { id: 's1', name: 'Mathematics',        pct: 78, isLO: false },
  { id: 's2', name: 'English Home Lang.', pct: 62, isLO: false },
  { id: 's3', name: 'Physical Sciences',  pct: 71, isLO: false },
  { id: 's4', name: 'Life Sciences',      pct: 80, isLO: false },
  { id: 's5', name: 'Geography',          pct: 66, isLO: false },
  { id: 's6', name: 'isiZulu FAL',        pct: 74, isLO: false },
  { id: 's7', name: 'Life Orientation',   pct: 70, isLO: true  },
];

const PROGRAMMES = [
  { name: 'BSc Computer Science',      inst: 'UCT',            aps: 38, p: 'direct'     },
  { name: 'BSc Actuarial Science',     inst: 'Wits',           aps: 40, p: 'direct'     },
  { name: 'MBChB Medicine',            inst: 'UCT',            aps: 45, p: 'direct'     },
  { name: 'BCom Finance',              inst: 'SUN',            aps: 36, p: 'direct'     },
  { name: 'BEng Chemical',             inst: 'UP',             aps: 38, p: 'direct'     },
  { name: 'BSc Data Science',          inst: 'UCT',            aps: 39, p: 'direct'     },
  { name: 'BA Psychology',             inst: 'UJ',             aps: 30, p: 'direct'     },
  { name: 'BCom Accounting',           inst: 'UNISA',          aps: 32, p: 'direct'     },
  { name: 'BSc Eng (Electrical)',      inst: 'UKZN',           aps: 38, p: 'direct'     },
  { name: 'BSc Computer Sci (Ext)',    inst: 'Wits',           aps: 32, p: 'extended'   },
  { name: 'BEng Mechanical (Ext)',     inst: 'UCT',            aps: 30, p: 'extended'   },
  { name: 'BCom (Ext)',                inst: 'NMU',            aps: 28, p: 'extended'   },
  { name: 'BCom Foundation',           inst: 'UJ',             aps: 26, p: 'foundation' },
  { name: 'BSc Foundation',            inst: 'UFS',            aps: 24, p: 'foundation' },
  { name: 'BHSc Foundation',           inst: 'UWC',            aps: 28, p: 'foundation' },
  { name: 'Dip · Information Tech',    inst: 'TVET Ekurhuleni',aps: 22, p: 'tvet'      },
  { name: 'Dip · Mechatronics',        inst: 'TVET Tshwane',   aps: 24, p: 'tvet'      },
  { name: 'NCV · Engineering',         inst: 'TVET False Bay', aps: 18, p: 'tvet'      },
];

const TOP_CAREERS = [
  { aps: 18, c: 'Mechatronics technician', s: 'R 24,500/mo' },
  { aps: 24, c: 'Junior accountant',       s: 'R 22,800/mo' },
  { aps: 28, c: 'Lab technician',          s: 'R 26,400/mo' },
  { aps: 32, c: 'Data analyst',            s: 'R 32,100/mo' },
  { aps: 36, c: 'Software engineer',       s: 'R 38,500/mo' },
  { aps: 40, c: 'Actuarial analyst',       s: 'R 42,800/mo' },
  { aps: 44, c: 'Medical doctor',          s: 'R 58,200/mo' },
];

function pathwayCounts(aps: number) {
  const direct     = Math.max(0, Math.round((aps - 22) * 8.5));
  const extended   = Math.max(0, Math.round((aps - 18) * 3.5));
  const foundation = Math.max(0, Math.round((40 - aps) * 1.8 + 6));
  const tvet       = Math.max(0, Math.round((38 - aps) * 1.2 + 4));
  return { direct, extended, foundation, tvet };
}

function fundingFor(aps: number) {
  const matchedK = Math.max(120, 280 + (aps - 24) * 14);
  const sources  = Math.max(2, Math.min(14, Math.round(aps / 4)));
  return { matchedK, sources };
}

function pickCareer(aps: number) {
  let best = TOP_CAREERS[0];
  TOP_CAREERS.forEach(c => { if (aps >= c.aps) best = c; });
  return best;
}

function fmtNum(n: number) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function fmtK(k: number) {
  if (k >= 1000) return 'R ' + (k / 1000).toFixed(1).replace('.0', '') + 'm';
  return 'R ' + fmtNum(k) + 'k';
}

function pathwayBadgeStyle(p: string) {
  const map: Record<string, { bg: string; color: string }> = {
    direct:     { bg: 'hsl(152 60% 96%)', color: 'hsl(152 55% 32%)' },
    extended:   { bg: 'hsl(215 40% 96%)', color: 'hsl(215 25% 36%)' },
    foundation: { bg: 'hsl(35 95% 96%)',  color: 'hsl(35 80% 38%)' },
    tvet:       { bg: 'hsl(262 80% 96%)', color: 'hsl(262 70% 44%)' },
  };
  return map[p] ?? { bg: 'hsl(var(--muted))', color: 'hsl(var(--muted-fg))' };
}

const INSTITUTIONS = [
  'University of Cape Town','Wits','Stellenbosch University','University of Pretoria',
  'University of KwaZulu-Natal','University of Johannesburg','Rhodes University',
  'Nelson Mandela University','University of the Western Cape','University of the Free State',
  'Cape Peninsula UT','Tshwane UT','UNISA','Durban UT','University of Fort Hare',
  'University of Limpopo','North-West University','Sefako Makgatho HSU',
];

export default function LandingPage() {
  const [marks, setMarks] = useState(SUBJECTS.map(s => s.pct));
  const [clock, setClock]  = useState('');
  const [scrollPct, setScrollPct] = useState(0);
  const [runHead, setRunHead] = useState(false);

  // APS computation
  const aps    = marks.reduce((sum, m) => sum + pctToPoints(m), 0);
  const counts = pathwayCounts(aps);
  const total  = counts.direct + counts.extended + counts.foundation + counts.tvet;
  const pct    = Math.max(8, Math.min(96, Math.round((aps - 18) * 3.5)));
  const fund   = fundingFor(aps);
  const career = pickCareer(aps);
  const careers = Math.max(3, Math.min(28, Math.round((aps - 18) * 1.1)));

  let apsDescr = 'broad shortlist available';
  if (aps >= 42)      apsDescr = 'strong direct-entry profile';
  else if (aps >= 36) apsDescr = 'strong direct-entry profile';
  else if (aps >= 30) apsDescr = 'wide eligibility · consider extended';
  else if (aps >= 24) apsDescr = 'foundation & TVET routes open';
  else                apsDescr = 'TVET pathways · foundation possible';

  const eligibleProgs = PROGRAMMES
    .filter(p => p.aps <= aps + 2)
    .sort((a, b) => b.aps - a.aps)
    .slice(0, 8);

  // Clock
  useEffect(() => {
    const tick = () => {
      const t = new Date().toLocaleTimeString('en-ZA', { timeZone: 'Africa/Johannesburg', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      setClock(t + ' SAST');
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Scroll progress
  useEffect(() => {
    const handler = () => {
      const doc  = document.documentElement;
      const top  = doc.scrollTop;
      const h    = doc.scrollHeight - doc.clientHeight;
      setScrollPct(h > 0 ? (top / h) * 100 : 0);
      setRunHead(top > 120);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Reveal-on-scroll
  useEffect(() => {
    const els = document.querySelectorAll('.lp-reveal');
    const io  = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('lp-in'); io.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const updateMark = useCallback((i: number, v: number) => {
    setMarks(prev => { const next = [...prev]; next[i] = v; return next; });
  }, []);

  return (
    <>
      {/* ── Scroll progress ── */}
      <div className="lp-progress" aria-hidden="true">
        <i style={{ width: `${scrollPct}%` }} />
      </div>
      <div className={`lp-running-head${runHead ? ' show' : ''}`} aria-hidden="true">
        Prospectus · Marks in. Future out.
      </div>

      <div className="lp">

        {/* ── NAV ────────────────────────────────────────────── */}
        <header className="lp-nav">
          <div className="lp-container lp-nav-row">
            <Link href="/" className="lp-brand">
              <span className="lp-brand-mark">P</span>
              <span className="lp-brand-name">Prospectus</span>
              <span className="lp-brand-tag">built in SA</span>
            </Link>
            <nav className="lp-nav-links">
              <a href="#how">How it works</a>
              <a href="#pathways">Pathways</a>
              <a href="#cockpit">The cockpit</a>
              <a href="#pricing">Pricing</a>
              <a href="#about">About</a>
            </nav>
            <div className="lp-nav-cta">
              {clock && (
                <span className="lp-clock">
                  <span className="lp-pulse" aria-hidden="true" />
                  {clock}
                </span>
              )}
              <Link href="/login"  className="lp-btn lp-btn-ghost lp-btn-sm">Sign in</Link>
              <Link href="/signup" className="lp-btn lp-btn-primary lp-btn-sm">Start free</Link>
            </div>
          </div>
        </header>

        {/* ── HERO ───────────────────────────────────────────── */}
        <section className="lp-hero" id="hero">
          <div className="lp-container">
            <div className="lp-hero-meta">
              <span className="lp-badge"><span className="lp-pulse" />For matric 2026 · open</span>
              <span className="lp-badge lp-badge-amber">26 universities · 50 TVET colleges</span>
              <span className="lp-eyebrow" style={{ marginLeft: '0.5rem' }}>ZAR · English · isiZulu · Sesotho</span>
            </div>

            <h1 className="lp-display lp-hero-h1">
              <span className="lp-h1-row">Marks in.</span>
              <span className="lp-h1-row"><em className="lp-serif">Future</em> out.</span>
            </h1>

            <p className="lp-hero-sub">
              South Africa's only platform that turns your matric marks into a list of programmes you'll
              actually get into, the funding to pay for them, and the careers they lead to —{' '}
              <em>connected, in one place, in under sixty seconds.</em>
            </p>

            <div className="lp-hero-actions">
              <a className="lp-btn lp-btn-primary lp-btn-lg" href="#demo">Calculate my APS — free</a>
              <a className="lp-btn lp-btn-outline lp-btn-lg" href="#cockpit">See the student cockpit</a>
              <span className="lp-hero-micro">No sign-up · no card · result in &lt;60s</span>
            </div>

            {/* ── Interactive APS demo ── */}
            <div className="lp-demo" id="demo">
              <div className="lp-demo-head">
                <div className="lp-demo-head-l">
                  <span className="lp-dots"><i /><i /><i /></span>
                  <span>prospectus.co.za / aps-calculator</span>
                </div>
                <div className="lp-demo-head-r">live · move the sliders</div>
              </div>

              <div className="lp-demo-grid">
                {/* Left: marks input */}
                <div className="lp-demo-input">
                  <div className="lp-demo-input-hdr">
                    <span>Your matric marks</span>
                    <span className="lp-hint">7 subjects · % out of 100</span>
                  </div>

                  <div className="lp-subjects">
                    {SUBJECTS.map((s, i) => (
                      <div key={s.id} className="lp-subj-row">
                        <div className="lp-subj-top">
                          <span className="lp-subj-name">
                            {s.name}{s.isLO && <span className="lp-subj-grade"> · LO</span>}
                          </span>
                          <span className="lp-mark-out">
                            <span className="lp-mark-pct">{marks[i]}%</span>
                            <span className="lp-mark-pts">{pctToPoints(marks[i])} pts</span>
                          </span>
                        </div>
                        <input
                          type="range" min={0} max={100} step={1} value={marks[i]}
                          onChange={e => updateMark(i, +e.target.value)}
                          className="lp-slider"
                          aria-label={`${s.name} mark`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="lp-aps-out">
                    <div className="lp-aps-num">{aps}</div>
                    <div className="lp-aps-lbl">
                      <div className="lp-aps-lbl-top">Your APS · out of 49</div>
                      <div className="lp-aps-lbl-descr">
                        Above the threshold for <span className="lp-accent-text">{pct}%</span> of programmes
                        <span className="lp-arrow"> →</span> {apsDescr}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: live results */}
                <div className="lp-demo-out">
                  <div className="lp-out-block">
                    <div className="lp-out-top">
                      <span className="lp-out-ttl">Programmes you can study</span>
                      <span className="lp-out-val">{fmtNum(total)}</span>
                    </div>
                    <div className="lp-path-bar">
                      <span className="lp-pb-d" style={{ flexGrow: counts.direct }} />
                      <span className="lp-pb-e" style={{ flexGrow: counts.extended }} />
                      <span className="lp-pb-f" style={{ flexGrow: counts.foundation }} />
                      <span className="lp-pb-t" style={{ flexGrow: counts.tvet }} />
                    </div>
                    <div className="lp-path-legend">
                      {[
                        { cls: 'lp-pb-d', name: 'Direct',     val: counts.direct },
                        { cls: 'lp-pb-e', name: 'Extended',   val: counts.extended },
                        { cls: 'lp-pb-f', name: 'Foundation', val: counts.foundation },
                        { cls: 'lp-pb-t', name: 'TVET',       val: counts.tvet },
                      ].map(item => (
                        <div key={item.name} className="lp-legend-item">
                          <span className={`lp-legend-swatch ${item.cls}`} />
                          <span className="lp-legend-name">{item.name}</span>
                          <span className="lp-legend-val">{fmtNum(item.val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lp-out-block">
                    <div className="lp-out-top">
                      <span className="lp-out-ttl">Funding you qualify for</span>
                      <span className="lp-out-val" style={{ color: 'hsl(var(--success))' }}>{fmtK(fund.matchedK)}</span>
                    </div>
                    <p className="lp-out-sub">
                      across <strong>{fund.sources} matched sources</strong> · NSFAS + bursaries scored to your profile
                    </p>
                  </div>

                  <div className="lp-out-block">
                    <div className="lp-out-top">
                      <span className="lp-out-ttl">Career trajectories</span>
                      <span className="lp-out-val">{careers}</span>
                    </div>
                    <p className="lp-out-sub">
                      Top match: <strong>{career.c}</strong> · median <span className="lp-mono">{career.s}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticker */}
              <div className="lp-ticker">
                <div className="lp-ticker-head">Sample programmes you unlock at this APS</div>
                <div className="lp-ticker-list">
                  {eligibleProgs.map((p, i) => {
                    const style = pathwayBadgeStyle(p.p);
                    return (
                      <div key={i} className="lp-ticker-item">
                        <span className="lp-ticker-prog">{p.name}</span>
                        <span className="lp-ticker-inst">{p.inst} · APS {p.aps}</span>
                        <span className="lp-ticker-badge" style={{ background: style.bg, color: style.color }}>
                          {p.p.charAt(0).toUpperCase() + p.p.slice(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lp-demo-foot">
                <span>Real APS formula · 6+7 subject calculation, Life Orientation included.</span>
                <span className="lp-demo-foot-r">
                  <span className="lp-kbd">↹</span> tab through subjects
                  <span className="lp-dot-sep">·</span>
                  <Link href="/signup" className="lp-save-link">Save to my profile →</Link>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── INDEXED STRIP ───────────────────────────────────── */}
        <section aria-label="What we index">
          <div className="lp-indexed">
            {[
              { sup: 'Indexed',  val: '9,412',   lbl: 'Programmes across every accredited SA university & TVET — updated weekly.' },
              { sup: 'Indexed',  val: 'R 3.2bn', lbl: 'In bursary, scholarship & NSFAS funding scored to each student profile.' },
              { sup: 'Tracked',  val: '324',      lbl: 'Careers with live demand, salary and 10-year growth projections.' },
              { sup: 'Latency',  val: '< 60s',   lbl: 'From first mark in, to a personalised strategy out. No sign-up needed.' },
            ].map(item => (
              <div key={item.sup + item.val} className="lp-idx">
                <div className="lp-idx-sup">{item.sup}</div>
                <div className="lp-idx-val">{item.val}</div>
                <div className="lp-idx-lbl">{item.lbl}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── MARQUEE ─────────────────────────────────────────── */}
        <section className="lp-marquee" aria-label="Institutions covered">
          <div className="lp-marquee-track">
            {[...INSTITUTIONS, ...INSTITUTIONS].map((name, i) => (
              <span key={i} className="lp-marquee-item">
                <span className="lp-marquee-id">{name.split(' ')[0].toUpperCase().slice(0, 4)}</span>
                {name}
                {i < INSTITUTIONS.length - 1 && <span className="lp-marquee-sep">—</span>}
              </span>
            ))}
          </div>
        </section>

        {/* ── PROBLEM ─────────────────────────────────────────── */}
        <section className="lp-section" id="how">
          <div className="lp-container">
            <div className="lp-rule">
              <span className="lp-rule-num">01 / 04</span>
              <span className="lp-rule-line" />
              <span className="lp-rule-lbl">The information gap</span>
            </div>

            <div className="lp-problem-grid">
              <div>
                <p className="lp-pull">
                  A South African 17-year-old makes the{' '}
                  <em className="lp-pull-em">most consequential decision of their life</em>{' '}
                  with <span className="lp-pull-strike">eight tabs open</span> the worst information
                  of any peer group on earth.
                </p>
                <div className="lp-pull-meta">
                  <span className="lp-pull-bar" />
                  <span>Source · DBE matric data, NSFAS reporting, StatsSA QLFS</span>
                </div>
              </div>

              <div className="lp-problem-rows">
                {[
                  {
                    ix: 'Admission',
                    h: 'APS, blind.',
                    body: "Admission is gated behind a score across six subjects. Most students don't know theirs until the application window has already closed.",
                    stat: '74% of matric students nationally cannot correctly calculate their own APS in a single attempt.',
                  },
                  {
                    ix: 'Funding',
                    h: 'Fragmented.',
                    body: 'NSFAS, hundreds of private bursaries, and institutional scholarships live in disconnected portals. Students miss opportunities they easily qualify for.',
                    stat: 'R 1.4bn in bursary funding sits unclaimed each cycle, by students who would have qualified.',
                  },
                  {
                    ix: 'Outcomes',
                    h: 'Opaque.',
                    body: "Labour market data isn't surfaced where the choice happens. Degrees get picked on culture or parental pressure, not on what the economy is actually hiring.",
                    stat: '1 in 3 graduates is unemployed 12 months post-graduation.',
                  },
                ].map(row => (
                  <div key={row.ix} className="lp-prow">
                    <div className="lp-prow-ix">{row.ix}</div>
                    <div>
                      <h3 className="lp-prow-h">{row.h}</h3>
                      <p className="lp-prow-body">{row.body}</p>
                    </div>
                    <p className="lp-prow-stat">{row.stat}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── MANIFESTO ───────────────────────────────────────── */}
        <section className="lp-manifesto">
          <div className="lp-container">
            <div className="lp-manifesto-label">A note from Prospectus · May 2026</div>
            <p className="lp-manifesto-text">
              A seventeen-year-old in Limpopo is asked, every year, to make a{' '}
              <em className="lp-manifesto-em">million-rand</em> decision — with the worst data of any
              peer group on earth. We didn't build a calculator. We built the{' '}
              <span className="lp-manifesto-ul">connective tissue</span> between marks, money and a
              life. One question, one surface, one shot at making the most consequential choice of her
              life with her <em className="lp-manifesto-em">eyes open</em>.
            </p>
            <div className="lp-manifesto-sign">
              <span className="lp-manifesto-item"><b>Signed</b> · the Prospectus team, Cape Town · Johannesburg</span>
              <span className="lp-manifesto-item"><b>Read time</b> · 38 seconds</span>
              <span className="lp-manifesto-item"><b>Words</b> · 73, exactly</span>
            </div>
          </div>
        </section>

        {/* ── PATHWAY SLABS ───────────────────────────────────── */}
        <section className="lp-pathways" id="pathways">
          <div className="lp-container lp-pw-head">
            <div className="lp-rule">
              <span className="lp-rule-num">02 / 04</span>
              <span className="lp-rule-line" />
              <span className="lp-rule-lbl">The pathway taxonomy · signature</span>
            </div>
            <h2 className="lp-heading" style={{ marginTop: '2.5rem', maxWidth: '52rem' }}>
              Every programme classified, every door <em className="lp-serif" style={{ color: 'hsl(var(--accent-600, 32 80% 40%))' }}>visible</em>.
            </h2>
            <p className="lp-sub" style={{ marginTop: '1.25rem', maxWidth: '56rem' }}>
              South African tertiary education has four entry pathways — but no one tells students
              which programmes belong to which. Prospectus tags every programme in the country,
              in plain language, so you see all four doors at once.
            </p>
          </div>

          <div className="lp-pw-grid">
            {[
              { cls: 'lp-pw-direct',     n: '01', label: 'PATHWAY · 01', big: '01', h: 'Direct entry',         body: 'You meet the APS, subject and language requirements. Apply, get in, start in year one. The fastest route — but not the only good one.',                                               aps: '34–46', glyph: 'D' },
              { cls: 'lp-pw-extended',   n: '02', label: 'PATHWAY · 02', big: '02', h: 'Extended curriculum',  body: 'Same degree, four years instead of three. Built-in academic support for borderline APS students — and a higher graduation rate than direct entry for that cohort.',                aps: '28–34', glyph: 'E' },
              { cls: 'lp-pw-foundation', n: '03', label: 'PATHWAY · 03', big: '03', h: 'Foundation year',      body: "A bridging year that gets you to the same degree. Most major universities run them, most students don't know they exist. A door, not a detour.",                                aps: '24–30', glyph: 'F' },
              { cls: 'lp-pw-tvet',       n: '04', label: 'PATHWAY · 04', big: '04', h: 'TVET / FET',           body: "Vocational diplomas, often higher employment outcomes than degrees. NSFAS covers them fully. They're not 'plan B' — for many careers, they're plan A.",                          aps: '18–28', glyph: 'T' },
            ].map(pw => (
              <div key={pw.n} className={`lp-pw-slab ${pw.cls}`}>
                <span className="lp-pw-glyph" aria-hidden="true">{pw.glyph}</span>
                <div>
                  <div className="lp-pw-num">{pw.label}</div>
                  <div className="lp-pw-big">{pw.big}</div>
                  <h3 className="lp-pw-h">{pw.h}</h3>
                  <p className="lp-pw-body">{pw.body}</p>
                </div>
                <div className="lp-pw-foot">
                  <span className="lp-pw-pct">Avg APS required</span>
                  <span className="lp-pw-pct"><b>{pw.aps}</b></span>
                </div>
              </div>
            ))}
          </div>

          <div className="lp-container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
            <div className="lp-pw-bottom">
              <p className="lp-muted" style={{ fontSize: '0.9375rem', maxWidth: '42rem' }}>
                These four badges appear next to every programme on the platform. Filter by them,
                compare across them, sort funding against them. The taxonomy is the index — and
                the index is the product.
              </p>
              <a className="lp-btn lp-btn-outline" href="#cockpit">See badges in the dashboard →</a>
            </div>
          </div>
        </section>

        {/* ── COCKPIT ─────────────────────────────────────────── */}
        <section className="lp-section" id="cockpit">
          <div className="lp-container">
            <div className="lp-rule">
              <span className="lp-rule-num">03 / 04</span>
              <span className="lp-rule-line" />
              <span className="lp-rule-lbl">The student cockpit · 36 pages</span>
            </div>

            <div className="lp-cockpit-call">
              <div>
                <h2 className="lp-heading">
                  A decision cockpit, <em className="lp-serif" style={{ color: 'hsl(var(--accent-600, 32 80% 40%))' }}>not a directory</em>.
                </h2>
                <p className="lp-cockpit-body">
                  After sixty seconds in the calculator, you can sign up and get the full surface.
                  Thirty-six interconnected pages organised around the only four jobs a matric student
                  has: <strong>plan, discover, fund, execute</strong>. Every screen answers a
                  question — or anticipates the next one.
                </p>
                <div className="lp-feat-chips">
                  {['APS calculator','Programme explorer','Academic simulator','NSFAS calculator',
                    'Funding strategy','Career compare','Application tracker','Documents vault',
                    'Deadlines','Skills map','Opportunity map','Future-you simulator',
                  ].map(f => <span key={f}>{f}</span>)}
                </div>
              </div>
              <div>
                <p className="lp-muted" style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
                  A typical Tuesday for Lerato. APS sits at 42. Four applications in flight.
                  R 412k of funding matched. The dashboard is a calm operating surface —
                  clarity over decoration, always.
                </p>
              </div>
            </div>

            {/* Browser mockup */}
            <div className="lp-cockpit">
              <div className="lp-cockpit-chrome">
                <span className="lp-chrome-dots">
                  <i style={{ background: '#f87171' }} />
                  <i style={{ background: '#fbbf24' }} />
                  <i style={{ background: '#34d399' }} />
                </span>
                <div className="lp-url-bar">
                  <span className="lp-url-lock">●</span>
                  prospectus.co.za / dashboard
                </div>
              </div>
              <div className="lp-cockpit-body">
                <aside className="lp-ck-side">
                  <div className="lp-ck-brand">
                    <div className="lp-ck-bm">P</div>
                    <div>
                      <div className="lp-ck-brand-name">Prospectus</div>
                      <div className="lp-ck-brand-sub">student workspace</div>
                    </div>
                  </div>
                  {[
                    { label: 'Plan',     items: ['Dashboard', 'APS & Eligibility', 'Academic Simulator', 'Programmes'] },
                    { label: 'Discover', items: ['Career Explorer', 'Career Compare', 'Discover AI', 'Opportunity Map'] },
                    { label: 'Fund',     items: ['Funding Strategy', 'Scholarships', 'NSFAS Calc'] },
                    { label: 'Execute',  items: ['Applications', 'Documents', 'Deadlines'] },
                  ].map(grp => (
                    <div key={grp.label} className="lp-ck-grp">
                      <div className="lp-ck-grp-l">{grp.label}</div>
                      {grp.items.map((it, i) => (
                        <div key={it} className={`lp-ck-it${grp.label === 'Plan' && i === 0 ? ' lp-ck-it-act' : ''}`}>{it}</div>
                      ))}
                    </div>
                  ))}
                </aside>

                <main className="lp-ck-main lp-ck-fade">
                  <div className="lp-ck-greet">
                    <div>
                      <div className="lp-ck-date">Tuesday · 27 Apr 2026</div>
                      <div className="lp-ck-h">Welcome back, Lerato.</div>
                    </div>
                    <div className="lp-ck-meta">3 new scholarships matched overnight</div>
                  </div>

                  <div className="lp-ck-kpis">
                    {[
                      { lbl: 'APS Score',          v: '42', sub: '/ 49', meter: 86, note: 'Above threshold for 73% of shortlist.' },
                      { lbl: 'Eligible programmes', v: '187', sub: '',    meter: 0,  note: '' },
                      { lbl: 'Funding matched',     v: 'R 412k', sub: '', meter: 0,  note: 'across 9 sources · NSFAS + 8 bursaries', green: true },
                      { lbl: 'Strategic Score',     v: '74',     sub: '↑ +6', meter: 0, note: 'Best month yet.' },
                    ].map(kpi => (
                      <div key={kpi.lbl} className="lp-ck-kpi">
                        <div className="lp-ck-kpi-lbl">{kpi.lbl}</div>
                        <div className={`lp-ck-kpi-v${kpi.green ? ' lp-green' : ''}`}>
                          {kpi.v}{kpi.sub && <span className="lp-ck-kpi-sub2">{kpi.sub}</span>}
                        </div>
                        {kpi.meter > 0 && (
                          <div className="lp-ck-meter"><i style={{ width: `${kpi.meter}%` }} /></div>
                        )}
                        {kpi.note && <div className="lp-ck-kpi-note">{kpi.note}</div>}
                      </div>
                    ))}
                  </div>

                  <div className="lp-ck-row2">
                    <div className="lp-ck-card">
                      <div className="lp-ck-ttl"><span>Shortlist · top fit</span><span className="lp-ck-sm">3 of 187</span></div>
                      {[
                        { nm: 'BSc Computer Science',       u: 'UCT · CT',    aps: '42 / 38 ✓', path: 'Direct',   yr: 'R 76,420 /yr', pathCls: 'direct' },
                        { nm: 'BSc Actuarial Science',      u: 'Wits · JHB',  aps: '42 / 40 ✓', path: 'Direct',   yr: 'R 82,100 /yr', pathCls: 'direct' },
                        { nm: 'BSc Eng (Chemical) — Ext.',  u: 'SUN · Stell', aps: '42 / 32 ✓', path: 'Extended', yr: 'R 71,890 /yr', pathCls: 'extended' },
                      ].map(li => {
                        const s = pathwayBadgeStyle(li.pathCls);
                        return (
                          <div key={li.nm} className="lp-ck-prog-li">
                            <div>
                              <div className="lp-ck-prog-nm">{li.nm}</div>
                              <div className="lp-ck-prog-u">{li.u}</div>
                            </div>
                            <span className="lp-ck-aps">{li.aps}</span>
                            <span className="lp-mini-badge" style={{ background: s.bg, color: s.color }}>{li.path}</span>
                            <span className="lp-ck-yr">{li.yr}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="lp-ck-card">
                      <div className="lp-ck-ttl"><span>Applications in flight</span><span className="lp-ck-sm">4 active</span></div>
                      {[
                        { l: 'UCT · BSc Comp Sci',  sub: 'closes 30 Sep · documents complete', badge: 'Accepted',  bCls: 'success' },
                        { l: 'Wits · Actuarial Sci', sub: 'closes 15 Oct · awaiting results',  badge: 'Pending',   bCls: 'amber' },
                        { l: 'NSFAS funding',         sub: 'submitted 12 Aug · under review',   badge: 'In review', bCls: 'info' },
                        { l: 'SUN · BCom Finance',   sub: 'closes 30 Sep · APS shortfall',      badge: 'Rejected',  bCls: 'red' },
                      ].map(li => (
                        <div key={li.l} className="lp-ck-app-li">
                          <div>
                            <span className="lp-ck-app-l">{li.l}</span>
                            <span className="lp-ck-app-sub">{li.sub}</span>
                          </div>
                          <span className={`lp-status-badge lp-status-${li.bCls}`}>{li.badge}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
        </section>

        {/* ── PERSONA + FLOW ──────────────────────────────────── */}
        <section className="lp-persona-band">
          <div className="lp-container lp-section-inner">
            <div className="lp-rule">
              <span className="lp-rule-num">04 / 04</span>
              <span className="lp-rule-line" />
              <span className="lp-rule-lbl">Designed for one student · Lerato</span>
            </div>

            <div className="lp-persona-grid">
              <div className="lp-portrait" aria-label="Student portrait placeholder">
                <div className="lp-portrait-stripe" />
                <div className="lp-portrait-face" />
                <div className="lp-portrait-corner">portrait · 1 of 1</div>
                <div className="lp-portrait-label">Lerato M. · 17 · Limpopo</div>
              </div>

              <div className="lp-persona-text">
                <div className="lp-eyebrow"><span className="lp-dot-amber" />Core persona · the student</div>
                <h2 className="lp-persona-h" style={{ marginTop: '1rem' }}>
                  Lerato arrives wanting to be a{' '}
                  <span className="lp-amber-text">doctor</span>. She leaves with a{' '}
                  <span className="lp-amber-text">strategy</span>.
                </h2>
                <p className="lp-persona-lead">
                  She's 17, first in her family to consider university, strong in maths and life
                  sciences, weaker in English. She lives 40 km from her closest internet point.
                  APS is the most important number in her life — and right now she has no idea
                  what it is.
                </p>

                <div className="lp-persona-cols">
                  <div className="lp-persona-col">
                    <h4 className="lp-persona-col-h">What she arrives with</h4>
                    <ul className="lp-persona-ul lp-arrived">
                      <li>Six matric marks & a question</li>
                      <li>One trusted name (NSFAS), eight tabs of mistrust</li>
                      <li>Parental pressure to "do medicine"</li>
                      <li>R 0 for application fees</li>
                    </ul>
                  </div>
                  <div className="lp-persona-col">
                    <h4 className="lp-persona-col-h">What she leaves with</h4>
                    <ul className="lp-persona-ul lp-left">
                      <li>Her APS & 187 eligible programmes</li>
                      <li>A R 412k funding strategy — not a list</li>
                      <li>Three career trajectories, ranked by fit</li>
                      <li>A live application tracker, deadlines included</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Decision flow */}
            <div style={{ marginTop: '5rem' }}>
              <div className="lp-rule" style={{ marginBottom: '1.5rem' }}>
                <span className="lp-rule-lbl">How sixty seconds becomes a strategy</span>
                <span className="lp-rule-line" />
              </div>
              <div className="lp-flow">
                {[
                  { n: 'STEP 01 · MARKS',       h: 'Marks in.',        p: 'Type provisional or final marks for six subjects. Life Orientation included. No account needed.' },
                  { n: 'STEP 02 · ELIGIBILITY', h: 'Eligibility out.', p: 'APS computed in real time. Every programme across 26 universities filtered to what you can actually study.' },
                  { n: 'STEP 03 · FUNDING',     h: 'Funding matched.', p: 'NSFAS, plus hundreds of bursaries and scholarships, scored against your profile — not a list, a strategy.' },
                  { n: 'STEP 04 · CAREER',      h: 'Career projected.', p: 'Live SA labour-market data on demand, salary and growth. Per career, per pathway, per province.' },
                ].map((step, i, arr) => (
                  <div key={step.n} className="lp-step">
                    <div className="lp-step-n">{step.n}</div>
                    <h4 className="lp-step-h">{step.h}</h4>
                    <p className="lp-step-p">{step.p}</p>
                    {i < arr.length - 1 && <span className="lp-step-arr">→</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── SA MAP ──────────────────────────────────────────── */}
        <section className="lp-section" id="about">
          <div className="lp-container">
            <div className="lp-sa-wrap">
              <div className="lp-sa-map" aria-label="Coverage map of SA institutions">
                <div className="lp-sa-grid" />
                <svg viewBox="0 0 500 400" preserveAspectRatio="xMidYMid meet" style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <path d="M70 200 Q75 130 130 100 Q190 70 260 75 Q330 80 380 110 Q440 145 445 215 Q450 290 395 330 Q330 365 250 360 Q170 355 115 320 Q70 285 70 200 Z"
                    fill="none" stroke="hsl(var(--fg))" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.5" />
                  <ellipse cx="295" cy="250" rx="30" ry="20" fill="hsl(var(--bg, 0 0% 100%))" stroke="hsl(var(--fg))" strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
                  <g fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="hsl(215 16% 47%)">
                    <circle cx="130" cy="320" r="6" fill="hsl(var(--primary))" />
                    <text x="142" y="324">Cape Town · 4 inst.</text>
                    <circle cx="285" cy="335" r="5" fill="hsl(var(--primary))" />
                    <text x="297" y="339">Gqeberha · 2 inst.</text>
                    <circle cx="380" cy="280" r="6" fill="hsl(var(--primary))" />
                    <text x="392" y="284">Durban · 3 inst.</text>
                    <circle cx="320" cy="180" r="9" fill="hsl(var(--primary))" />
                    <text x="334" y="184">JHB / Pretoria · 8 inst.</text>
                    <circle cx="270" cy="240" r="5" fill="hsl(var(--primary))" />
                    <text x="282" y="244">Bloemfontein · 2 inst.</text>
                    <circle cx="335" cy="115" r="5" fill="hsl(var(--primary))" />
                    <text x="347" y="119">Polokwane · 1 inst.</text>
                    <circle cx="245" cy="160" r="4" fill="hsl(var(--primary))" opacity="0.7" />
                    <circle cx="380" cy="155" r="4" fill="hsl(var(--primary))" opacity="0.7" />
                    <circle cx="330" cy="320" r="4" fill="hsl(var(--primary))" opacity="0.7" />
                  </g>
                </svg>
                <div className="lp-map-legend">
                  <i />University / TVET node
                  <span style={{ opacity: 0.5 }}>·</span>
                  26 universities · 50 TVETs · 9 provinces
                </div>
              </div>

              <div>
                <div className="lp-eyebrow"><span className="lp-dot-amber" />Built in South Africa, for South Africa</div>
                <h2 className="lp-heading" style={{ marginTop: '1rem' }}>
                  Not a borrowed app. Built on{' '}
                  <em className="lp-serif" style={{ color: 'hsl(var(--accent-600, 32 80% 40%))' }}>DBE, NSFAS & StatsSA</em>{' '}
                  data — rebuilt every week.
                </h2>
                <p className="lp-sub" style={{ marginTop: '1.5rem', maxWidth: '36rem' }}>
                  Every programme requirement is sourced directly from the institution's calendar.
                  Every bursary is reconciled against NSFAS reporting. Every career projection is
                  anchored in StatsSA's Quarterly Labour Force Survey. We don't scrape — we partner.
                </p>
                <div className="lp-data-grid">
                  <div className="lp-data-col">
                    <div className="lp-data-sup">Data partners</div>
                    <div className="lp-data-val">DBE · NSFAS · USAf · StatsSA · CHE</div>
                  </div>
                  <div className="lp-data-col">
                    <div className="lp-data-sup">Last reconciliation</div>
                    <div className="lp-data-val">21 May 2026 · 04:12 SAST</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── QUOTES ──────────────────────────────────────────── */}
        <section className="lp-section" aria-label="Student testimonials">
          <div className="lp-container">
            <div className="lp-rule">
              <span className="lp-rule-num">—</span>
              <span className="lp-rule-line" />
              <span className="lp-rule-lbl">From students who already moved</span>
            </div>
            <div className="lp-quotes">
              {[
                { q: "“I thought I couldn’t do medicine. Prospectus showed me three foundation routes I’d never heard of. I’m in second year now.”", name: 'Naledi K.', role: 'BSc · UFS · Foundation', init: 'N' },
                { q: "“I got nine bursaries matched in one afternoon. I hadn’t applied for a single one before — I didn’t know they existed.”",         name: 'Sipho M.',  role: 'B Eng · NMU · Direct',   init: 'S' },
                { q: "“My parents wanted me to do law. The career data made it a conversation, not a fight. I’m now studying actuarial science with their full support.”", name: 'Thandi B.', role: 'BSc · Wits · Direct', init: 'T' },
              ].map(card => (
                <div key={card.name} className="lp-qcard lp-reveal">
                  <p className="lp-qcard-q">{card.q}</p>
                  <div className="lp-qcard-a">
                    <div className="lp-qcard-av">{card.init}</div>
                    <div>
                      <div className="lp-qcard-nm">{card.name}</div>
                      <div className="lp-qcard-role">{card.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ─────────────────────────────────────────── */}
        <section className="lp-section" id="pricing">
          <div className="lp-container">
            <div className="lp-rule" style={{ marginBottom: '2.5rem' }}>
              <span className="lp-rule-lbl">Pricing · free for matric students, always</span>
              <span className="lp-rule-line" />
            </div>
            <h2 className="lp-heading" style={{ maxWidth: '32ch', marginBottom: '2.5rem' }}>
              Free for the people who need it most. Pro for those who can pay it forward.
            </h2>
            <div className="lp-pricing">
              <div className="lp-plan">
                <div className="lp-plan-top">
                  <h3 className="lp-plan-h">Free</h3>
                  <span className="lp-badge">For every matric student</span>
                </div>
                <div className="lp-plan-price">R 0<small> · forever</small></div>
                <ul className="lp-plan-ul">
                  {['APS calculator & programme explorer — full database',
                    'Funding matching — NSFAS + every public bursary',
                    'Career explorer — demand, salary, projections',
                    'Application tracker — up to 6 applications',
                    'Cognitive assessment & skills map',
                  ].map(f => <li key={f}>{f}</li>)}
                </ul>
                <Link href="/signup" className="lp-btn lp-btn-primary" style={{ alignSelf: 'start' }}>Start free</Link>
                <p className="lp-plan-foot">No card. No expiry. Mobile-first, low-data-friendly.</p>
              </div>

              <div className="lp-plan lp-plan-pro">
                <div className="lp-plan-top">
                  <h3 className="lp-plan-h" style={{ color: 'white' }}>Pro</h3>
                  <span className="lp-badge lp-badge-amber-solid">Most chosen</span>
                </div>
                <div className="lp-plan-price">R 49<small> · per month</small></div>
                <ul className="lp-plan-ul">
                  {['Everything in Free, plus —',
                    'Discover AI — personalised programme & career recommendations',
                    'Future-You simulator — 3, 5 and 10-year trajectory projections',
                    'Unlimited applications & document vault',
                    'Priority funding alerts — bursaries scored before they open',
                    '1-on-1 onboarding with an admissions advisor',
                  ].map(f => <li key={f}>{f}</li>)}
                </ul>
                <Link href="/signup" className="lp-btn lp-btn-amber" style={{ alignSelf: 'start' }}>Try Pro · 14 days free</Link>
                <p className="lp-plan-foot" style={{ color: 'rgba(255,255,255,0.6)' }}>Cancel anytime · ZAR via Stripe · part of every fee subsidises a Free student.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────── */}
        <section className="lp-final">
          <div className="lp-container" style={{ position: 'relative' }}>
            <div className="lp-eyebrow" style={{ color: 'hsl(38 95% 60%)' }}>
              <span className="lp-dot-amber" />Open · Applications for 2027 close 30 September 2026
            </div>
            <h2 className="lp-final-h">
              Type your marks.{' '}
              <em className="lp-serif">Watch your future <br />render in real time.</em>
            </h2>
            <p className="lp-final-sub">
              No sign-up. No card. The full APS calculator and your first programme shortlist
              takes under sixty seconds.
            </p>
            <div className="lp-final-actions">
              <a className="lp-btn lp-btn-amber lp-btn-lg" href="#demo">Start with my marks →</a>
              <a className="lp-btn lp-btn-outline-dark lp-btn-lg" href="#cockpit">Tour the cockpit first</a>
              <span className="lp-final-micro">~58s median · 12,400 students this month</span>
            </div>

            <div className="lp-final-grid">
              <div>
                <h4 className="lp-final-grid-h">What we promise</h4>
                <p className="lp-final-grid-p">
                  Every programme, every bursary, every requirement — accurate to the source
                  institution's most recent calendar. If we get it wrong, we tell you, we fix it,
                  and we credit your Pro subscription for the inconvenience.
                </p>
              </div>
              <div>
                <h4 className="lp-final-grid-h">What comes next</h4>
                <nav className="lp-final-next">
                  {[
                    { l: 'Calculate my APS — 60 seconds', h: '#demo' },
                    { l: 'Tour the student cockpit',       h: '#cockpit' },
                    { l: 'Read the funding guide',         h: '#pricing' },
                    { l: 'For institutions — partner with us', h: '#' },
                  ].map(a => (
                    <a key={a.l} href={a.h} className="lp-final-link">
                      <span>{a.l}</span><span className="lp-final-arr">→</span>
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────── */}
        <footer className="lp-footer">
          <div className="lp-container">
            <div className="lp-footer-row">
              <Link href="/" className="lp-brand">
                <span className="lp-brand-mark" style={{ background: 'white', color: 'hsl(222 47% 8%)' }}>P</span>
                <span className="lp-brand-name" style={{ color: 'white' }}>Prospectus</span>
                <span className="lp-brand-tag" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.2)' }}>marks → future</span>
              </Link>
              <div className="lp-footer-links">
                {['Programmes','Bursaries','Career explorer','NSFAS guide','For institutions','About','Contact'].map(l => (
                  <a key={l} href="#">{l}</a>
                ))}
              </div>
            </div>
            <div className="lp-footer-meta">
              <span>© 2026 Prospectus · built in South Africa · v1.4.1</span>
              <span>Marks in. Future out.</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
