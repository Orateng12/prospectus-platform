'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import './bursaries.css';

/* ── Types ── */
type FunderType = 'gov' | 'corp' | 'uni' | 'ngo';
type FitLevel = 'high' | 'med';
type SortKey = 'fit' | 'amount' | 'deadline' | 'name';

interface BursaryEntry {
  id: string;
  name: string;
  src: string;
  type: FunderType;
  logo: string;
  fit: number;
  fitLevel: FitLevel;
  amount: number;
  deadlineStr: string;
  deadlineDays: number;
  deadlineSoon: boolean;
  fields: string[];
  covers: string[];
  obligation: 'none' | 'work-back' | 'internship';
  desc: string;
  metaItems: { k: string; v: string }[];
  canApply: boolean;
  tagLabels: string[];
  tagVariants: string[];
}

/* ── Data (from Prospectus Bursaries.html) ── */
const BURSARY_DATA: BursaryEntry[] = [
  {
    id: 'nsfas',
    name: 'National Student Financial Aid Scheme',
    src: 'Department of Higher Education · public',
    type: 'gov', logo: 'NSFAS', fit: 96, fitLevel: 'high', amount: 198000,
    deadlineStr: '31 Jul 2026', deadlineDays: 66, deadlineSoon: true,
    fields: ['all'], covers: ['tuition', 'accommodation', 'living', 'books'],
    obligation: 'none',
    desc: 'The largest single funder in the country. Covers tuition, accommodation, books, and a monthly allowance for any student from a household earning under R 350k per year. Applies to public universities and TVET colleges.',
    metaItems: [
      { k: 'Threshold', v: '≤ R 350k h/h' },
      { k: 'Award', v: 'Full cost' },
      { k: 'Sector', v: 'Public only' },
      { k: 'Success rate', v: '71%' },
    ],
    canApply: true,
    tagLabels: ['Full cost', 'Tuition · Accom · Living', 'No work-back', 'Direct', 'Extended', 'TVET'],
    tagVariants: ['success', '', 'info', 'pw-direct', 'pw-extended', 'pw-tvet'],
  },
  {
    id: 'sbsa',
    name: 'Standard Bank Group · Engineering & Tech Bursary',
    src: 'Corporate · banking',
    type: 'corp', logo: 'SBSA', fit: 92, fitLevel: 'high', amount: 218000,
    deadlineStr: '30 Jun 2026', deadlineDays: 35, deadlineSoon: true,
    fields: ['engineering', 'cs', 'actuarial'],
    covers: ['tuition', 'accommodation', 'living'],
    obligation: 'work-back',
    desc: 'Three-year fully-funded bursary for engineering, computer science, actuarial, and data science students. Includes a paid internship every summer and a guaranteed graduate placement upon completion. Two-year work-back at SBSA.',
    metaItems: [
      { k: 'Threshold', v: '≤ R 800k h/h' },
      { k: 'Award', v: 'Full cost + stipend' },
      { k: 'Intake', v: '42 students' },
      { k: 'Internships', v: '3 paid' },
    ],
    canApply: true,
    tagLabels: ['Full cost', 'Tuition · Accom · Living', 'Work-back · 2 yrs', 'Direct'],
    tagVariants: ['success', '', 'accent', 'pw-direct'],
  },
  {
    id: 'uct-vc',
    name: 'UCT Vice-Chancellor\'s Scholarship',
    src: 'University of Cape Town · merit',
    type: 'uni', logo: 'UC', fit: 88, fitLevel: 'high', amount: 76420,
    deadlineStr: '30 Sep 2026', deadlineDays: 127, deadlineSoon: false,
    fields: ['all'], covers: ['tuition'],
    obligation: 'none',
    desc: 'Merit-based scholarship awarded to incoming students in the top 5% of their cohort by APS. Covers full tuition for the duration of the undergraduate degree, contingent on maintaining a 65% average each year.',
    metaItems: [
      { k: 'Minimum APS', v: '42' },
      { k: 'Award', v: 'Full tuition' },
      { k: 'Renewable', v: 'Yes · 65% avg.' },
      { k: 'Intake', v: '120 students' },
    ],
    canApply: true,
    tagLabels: ['Full tuition', 'Top 5%', 'Tuition only', 'Direct'],
    tagVariants: ['success', 'info', '', 'pw-direct'],
  },
  {
    id: 'sasol',
    name: 'Sasol Foundation · STEM Excellence Bursary',
    src: 'Corporate · industrial',
    type: 'corp', logo: 'SAS', fit: 85, fitLevel: 'high', amount: 224000,
    deadlineStr: '15 Aug 2026', deadlineDays: 81, deadlineSoon: false,
    fields: ['engineering', 'chemistry', 'geology'],
    covers: ['tuition', 'accommodation', 'living', 'travel'],
    obligation: 'work-back',
    desc: 'Comprehensive bursary for engineering, chemistry, geology, and mathematics students. Includes vacation work, mentorship, and a structured graduate programme. Open to applicants from any province; preference for Mpumalanga, Free State, and Gauteng.',
    metaItems: [
      { k: 'Threshold', v: '≤ R 600k h/h' },
      { k: 'Award', v: 'Full cost + stipend' },
      { k: 'Intake', v: '68 students' },
      { k: 'Min. APS', v: '36' },
    ],
    canApply: true,
    tagLabels: ['Full cost', 'Tuition · Accom · Living · Travel', 'Work-back · 2 yrs', 'Direct', 'Extended'],
    tagVariants: ['success', '', 'accent', 'pw-direct', 'pw-extended'],
  },
  {
    id: 'allan-gray',
    name: 'Allan Gray Orbis Foundation Fellowship',
    src: 'NGO & foundation · entrepreneurship',
    type: 'ngo', logo: 'A.G.', fit: 78, fitLevel: 'med', amount: 248000,
    deadlineStr: '30 Apr 2027', deadlineDays: 340, deadlineSoon: false,
    fields: ['all'], covers: ['tuition', 'accommodation', 'living'],
    obligation: 'none',
    desc: 'A multi-year fellowship for high-potential students with entrepreneurial intent. Includes funding, mentorship, a residential programme, and lifelong network access. Highly selective — typically 100 fellows per year nationally.',
    metaItems: [
      { k: 'Threshold', v: 'Any' },
      { k: 'Award', v: 'Full cost + R 24k/yr stipend' },
      { k: 'Intake', v: '100 fellows' },
      { k: 'Process', v: '3-round selection' },
    ],
    canApply: false,
    tagLabels: ['Full cost + stipend', 'Tuition · Accom · Living', 'Mentorship · network', 'Direct'],
    tagVariants: ['success', '', 'info', 'pw-direct'],
  },
  {
    id: 'discovery',
    name: 'Discovery Health · Health Sciences Bursary',
    src: 'Corporate · health',
    type: 'corp', logo: 'DSC', fit: 72, fitLevel: 'med', amount: 92000,
    deadlineStr: '30 Aug 2026', deadlineDays: 96, deadlineSoon: false,
    fields: ['health', 'medicine', 'pharmacy'],
    covers: ['tuition'],
    obligation: 'work-back',
    desc: 'For students pursuing MBChB, BPharm, BSc Physiotherapy, BSc Dietetics, and related qualifications. Includes structured holiday placements and a one-year work-back at Discovery\'s wellness arm post-qualification.',
    metaItems: [
      { k: 'Threshold', v: '≤ R 750k h/h' },
      { k: 'Award', v: 'Full tuition' },
      { k: 'Intake', v: '38 students' },
      { k: 'Min. APS', v: '40' },
    ],
    canApply: true,
    tagLabels: ['Full tuition', 'Tuition only', 'Work-back · 1 yr', 'Direct'],
    tagVariants: ['success', '', 'accent', 'pw-direct'],
  },
  {
    id: 'wits-eng',
    name: 'Wits Faculty of Engineering Bursary',
    src: 'University of the Witwatersrand · faculty',
    type: 'uni', logo: 'UW', fit: 64, fitLevel: 'med', amount: 71400,
    deadlineStr: '30 Sep 2026', deadlineDays: 127, deadlineSoon: false,
    fields: ['engineering'], covers: ['tuition'],
    obligation: 'none',
    desc: 'Faculty-administered bursary for incoming engineering students from quintile 1–3 schools. Tuition only. Renewable annually subject to academic progress (60% minimum average).',
    metaItems: [
      { k: 'Threshold', v: 'Q1-3 school' },
      { k: 'Award', v: 'Full tuition' },
      { k: 'Renewable', v: 'Yes · 60% avg.' },
      { k: 'Intake', v: '~80 students' },
    ],
    canApply: false,
    tagLabels: ['Tuition', 'No work-back', 'Direct'],
    tagVariants: ['', 'info', 'pw-direct'],
  },
  {
    id: 'moshal',
    name: 'Moshal Scholarship Program',
    src: 'NGO & foundation · need-based',
    type: 'ngo', logo: 'MOM', fit: 58, fitLevel: 'med', amount: 186000,
    deadlineStr: '15 Oct 2026', deadlineDays: 142, deadlineSoon: false,
    fields: ['all'], covers: ['tuition', 'accommodation', 'living', 'books'],
    obligation: 'none',
    desc: 'Comprehensive scholarship for academically capable students from low-income backgrounds. Includes funding, laptop, mentorship, and career support throughout the degree and into employment.',
    metaItems: [
      { k: 'Threshold', v: '≤ R 400k h/h' },
      { k: 'Award', v: 'Full cost + R 18k laptop' },
      { k: 'Intake', v: '~250 across SA' },
      { k: 'Min. APS', v: '32' },
    ],
    canApply: false,
    tagLabels: ['Full cost + laptop', 'Tuition · Accom · Living · Books', 'Mentorship', 'Direct', 'Extended'],
    tagVariants: ['success', '', 'info', 'pw-direct', 'pw-extended'],
  },
];

const FUNDER_TYPE_LABELS: Record<FunderType, string> = {
  gov: 'NSFAS', university: 'University', corporate: 'Corporate', ngo: 'NGO & foundation',
} as Record<string, string>;

const FUNDER_COUNTS = { gov: 1, uni: 412, corp: 541, ngo: 218 };

/* ── BCard sub-component ── */
function BCard({ b }: { b: BursaryEntry }) {
  const amtK = b.amount >= 1000 ? `${Math.round(b.amount / 1000)}k` : b.amount.toString();
  return (
    <article className="b-card">
      <div className={`b-logo ${b.type}`}>{b.logo}</div>
      <div className="b-body">
        <div className="b-name">
          <h3>{b.name}</h3>
          <span className="src">{b.src}</span>
        </div>
        <div className="b-tags">
          {b.tagLabels.map((lbl, i) => (
            <span key={i} className={`badge${b.tagVariants[i] ? ' badge-' + b.tagVariants[i] : ''}`}>
              {lbl}
            </span>
          ))}
        </div>
        <p className="b-desc">{b.desc}</p>
        <div className="b-meta">
          {b.metaItems.map(m => (
            <div key={m.k} className="item">
              <span className="k">{m.k}</span>
              <span className="v">{m.v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="b-side">
        <div>
          <div className="b-fit-k">Fit · {b.fit}</div>
          <div className={`b-fit ${b.fitLevel}`}>{b.fit}</div>
        </div>
        <div className="b-amount">
          <span className="cur">R</span> {amtK}
          <span style={{ fontSize: '0.6em', color: 'hsl(var(--mute))' }}>/yr</span>
        </div>
        <div className={`b-deadline${b.deadlineSoon ? ' soon' : ''}`}>
          Deadline · <b>{b.deadlineStr}</b>
          {b.deadlineSoon && ` · ${b.deadlineDays} days`}
        </div>
        {b.canApply ? (
          <Link href="/signup" className="btn btn-primary btn-sm">Open application <span className="arr">→</span></Link>
        ) : (
          <Link href="/signup" className="btn btn-outline btn-sm">Save for later</Link>
        )}
      </div>
    </article>
  );
}

/* ── Page ── */
export default function BursariesPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const [funderTypes, setFunderTypes] = useState<Set<FunderType>>(new Set(['gov', 'corp', 'uni', 'ngo']));
  const [maxAmount, setMaxAmount] = useState(500);
  const [fields, setFields] = useState<Set<string>>(new Set(['engineering', 'health', 'cs']));
  const [covers, setCovers] = useState<Set<string>>(new Set(['tuition', 'accommodation', 'living']));
  const [obligations, setObligations] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortKey>('fit');
  const [matchPathway, setMatchPathway] = useState('direct-extended');
  const [matchIncome, setMatchIncome] = useState('350-600');
  const [matchProvince, setMatchProvince] = useState('limpopo');
  const [matchField, setMatchField] = useState('engineering');

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    let list = BURSARY_DATA.filter(b => {
      if (!funderTypes.has(b.type)) return false;
      if (b.amount > maxAmount * 1000) return false;
      if (fields.size > 0 && !b.fields.includes('all') && !b.fields.some(f => fields.has(f))) return false;
      if (covers.size > 0 && !b.covers.some(c => covers.has(c))) return false;
      if (obligations.size > 0 && !obligations.has(b.obligation)) return false;
      return true;
    });
    if (sort === 'amount')   list = [...list].sort((a, b) => b.amount - a.amount);
    if (sort === 'deadline') list = [...list].sort((a, b) => a.deadlineDays - b.deadlineDays);
    if (sort === 'name')     list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [funderTypes, maxAmount, fields, covers, obligations, sort]);

  /* ── Helpers ── */
  function toggleFunder(t: FunderType) {
    setFunderTypes(prev => { const n = new Set(prev); if (n.has(t)) n.delete(t); else n.add(t); return n; });
  }
  function toggleField(f: string) {
    setFields(prev => { const n = new Set(prev); if (n.has(f)) n.delete(f); else n.add(f); return n; });
  }
  function toggleCover(c: string) {
    setCovers(prev => { const n = new Set(prev); if (n.has(c)) n.delete(c); else n.add(c); return n; });
  }
  function toggleObligation(o: string) {
    setObligations(prev => { const n = new Set(prev); if (n.has(o)) n.delete(o); else n.add(o); return n; });
  }
  function clearFilters() {
    setFunderTypes(new Set(['gov', 'corp', 'uni', 'ngo']));
    setMaxAmount(500);
    setFields(new Set(['engineering', 'health', 'cs']));
    setCovers(new Set(['tuition', 'accommodation', 'living']));
    setObligations(new Set());
  }
  function handleMatch() {
    const fieldMap: Record<string, string[]> = {
      engineering: ['engineering'],
      health: ['health'],
      commerce: ['commerce'],
      cs: ['cs', 'engineering'],
      education: ['education'],
      humanities: ['humanities'],
      agriculture: ['agriculture'],
    };
    setFields(new Set(fieldMap[matchField] ?? [matchField]));
    if (matchIncome === 'over-1m') {
      setFunderTypes(new Set(['corp', 'uni']));
    } else {
      setFunderTypes(new Set(['gov', 'corp', 'uni', 'ngo']));
    }
    document.getElementById('explorer')?.scrollIntoView({ behavior: 'smooth' });
  }

  /* ── Effects ── */
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.bur-page .reveal-up, .bur-page .reveal-line').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setNavOpen(false); setFiltersOpen(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
  useEffect(() => {
    const onScroll = () => {
      if (navOpen) return;
      const y = window.scrollY;
      const nav = navRef.current;
      if (!nav) return;
      if (y > lastScrollY.current && y > 80) nav.classList.add('nav-hidden');
      else nav.classList.remove('nav-hidden');
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [navOpen]);

  return (
    <div className="bur-page">

      {/* ══ NAV ══ */}
      <header className="nav" ref={navRef}>
        <div className="container nav-row">
          <Link href="/" className="brand" aria-label="Prospectus home">
            <div className="brand-mark" aria-hidden="true">P</div>
            <span className="brand-name">Prospectus</span>
            <span className="brand-tag">built in SA · est. 2026</span>
          </Link>
          <nav className="nav-links" aria-label="Site navigation">
            <Link href="/programmes">Programmes</Link>
            <Link href="/pathways">Pathways</Link>
            <Link href="/bursaries" className="is-active">Bursaries</Link>
          </nav>
          <div className="nav-cta">
            <Link href="/login" className="btn btn-ghost btn-sm">Sign in</Link>
            <Link href="/signup" className="btn btn-primary btn-sm">Start free <span className="arr" aria-hidden="true">→</span></Link>
            <button
              className="nav-mob-btn"
              aria-expanded={navOpen}
              aria-controls="bur-mobile-nav"
              aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
              onClick={() => setNavOpen(v => !v)}
            >
              <span className="bar" aria-hidden="true" />
              <span className="bar" aria-hidden="true" />
              <span className="bar" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="container live-strip" aria-hidden="true">
          <span><span className="pulse" /> Live</span>
          <span>·</span>
          <span><strong style={{ color: 'hsl(var(--ink))', fontWeight: 600 }}>R 41.2bn</strong> indexed across 1,284 funding sources</span>
          <span className="sep">·</span>
          <span>NSFAS + 1,283 private</span>
          <span className="sep">·</span>
          <span>Updated 26 May 2026 04:12 SAST</span>
        </div>
      </header>

      <nav
        id="bur-mobile-nav"
        className={`nav-drawer${navOpen ? ' open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!navOpen}
        inert={!navOpen ? ('' as unknown as boolean) : undefined}
      >
        <div className="nav-drawer-head">
          <Link href="/" className="brand" onClick={() => setNavOpen(false)}>
            <div className="brand-mark" aria-hidden="true">P</div>
            <span className="brand-name">Prospectus</span>
          </Link>
          <button className="btn btn-ghost btn-sm" onClick={() => setNavOpen(false)} aria-label="Close menu">✕</button>
        </div>
        <div className="nav-drawer-links">
          <Link href="/programmes" onClick={() => setNavOpen(false)}>Programmes</Link>
          <Link href="/pathways" onClick={() => setNavOpen(false)}>Pathways</Link>
          <Link href="/bursaries" className="is-active" onClick={() => setNavOpen(false)}>Bursaries</Link>
        </div>
        <div className="nav-drawer-cta">
          <Link href="/login" className="btn btn-outline" onClick={() => setNavOpen(false)}>Sign in</Link>
          <Link href="/signup" className="btn btn-primary" onClick={() => setNavOpen(false)}>Start free <span aria-hidden="true">→</span></Link>
        </div>
      </nav>

      {/* ══ PAGE HEADER ══ */}
      <section className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Prospectus</Link>
            <span className="sep">/</span>
            <span>Bursaries &amp; funding</span>
          </div>
          <div className="eyebrow"><span className="dot" />Funding index · live</div>
          <h1 className="funding-headline text-balance">
            Free education<br />is <span className="serif">closer</span> than you think.
          </h1>
          <p className="sub text-pretty" style={{ marginTop: '1.5rem', maxWidth: '52rem' }}>
            Most students apply to two or three bursaries. The average eligible student qualifies for{' '}
            <strong style={{ color: 'hsl(var(--ink))' }}>eleven</strong>. Prospectus indexes every funding source
            in South Africa — NSFAS, university bursaries, corporate funders, NGOs, provincial bursaries, and the
            long tail of programme-specific awards — and matches them to your profile.
          </p>
        </div>
      </section>

      {/* ══ FUND TOTALS STRIP ══ */}
      <section className="fund-strip" aria-label="Funding totals">
        <div className="container">
          <div className="fund-strip-row">
            <div className="fs-cell">
              <div className="k">Total indexed</div>
              <div className="v"><span className="cur">R</span> 41.2<span style={{ fontSize: '0.5em', color: 'hsl(var(--mute))', fontWeight: 600 }}> bn</span></div>
              <div className="sub">Annual funding flow across all sources tracked on the platform.</div>
            </div>
            <div className="fs-cell">
              <div className="k">Sources tracked</div>
              <div className="v">1,284</div>
              <div className="sub">NSFAS, university bursaries, corporate, NGO, provincial, and merit awards.</div>
            </div>
            <div className="fs-cell">
              <div className="k">Avg. matches / student</div>
              <div className="v">11<span style={{ fontSize: '0.4em', color: 'hsl(var(--mute))', fontWeight: 600 }}> matches</span></div>
              <div className="sub">For applicants who complete the full eligibility profile.</div>
            </div>
            <div className="fs-cell">
              <div className="k">Median award</div>
              <div className="v"><span className="cur">R</span> 86<span style={{ fontSize: '0.5em', color: 'hsl(var(--mute))', fontWeight: 600 }}>k/yr</span></div>
              <div className="sub">Covers fees + most of accommodation at residence-eligible institutions.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ MATCH PANEL ══ */}
      <section className="section section-tight" id="match">
        <div className="container">
          <div className="rule reveal-up">
            <span className="num">00 / 04</span>
            <span className="rule-line reveal-line" />
            <span className="lbl">Start with a match</span>
          </div>
          <div style={{ maxWidth: '50rem', marginTop: '2.5rem' }} className="reveal-up">
            <h2 className="heading text-balance">
              Tell us four things. We&apos;ll show you every rand{' '}
              <span className="serif" style={{ color: 'hsl(var(--accent-600))' }}>you</span> qualify for.
            </h2>
            <p className="sub" style={{ marginTop: '1.25rem', maxWidth: '44rem' }}>
              No ID, no documents, no signup. The match is local to your browser. You can save matches and apply
              directly once you create an account.
            </p>
          </div>

          <div className="match-shell reveal-up">
            <div className="match-head">
              <div className="left">
                <span className="pulse" />
                <span>Live match · 1,284 sources scanning</span>
              </div>
              <div className="right">
                <span><b>R 41.2bn</b> · pool</span>
                <span><b>04:12 SAST</b> · last index</span>
              </div>
            </div>
            <div className="match-form">
              <div className="field">
                <div className="lbl">Pathway interest</div>
                <select value={matchPathway} onChange={e => setMatchPathway(e.target.value)}>
                  <option value="any">Any pathway</option>
                  <option value="direct">Direct entry</option>
                  <option value="direct-extended">Direct + Extended</option>
                  <option value="tvet">TVET</option>
                  <option value="foundation">Foundation</option>
                </select>
              </div>
              <div className="field">
                <div className="lbl">Household income</div>
                <select value={matchIncome} onChange={e => setMatchIncome(e.target.value)}>
                  <option value="under-350">Under R 350k</option>
                  <option value="350-600">R 350k – R 600k</option>
                  <option value="600-1m">R 600k – R 1m</option>
                  <option value="over-1m">Over R 1m</option>
                </select>
              </div>
              <div className="field">
                <div className="lbl">Province</div>
                <select value={matchProvince} onChange={e => setMatchProvince(e.target.value)}>
                  <option value="gauteng">Gauteng</option>
                  <option value="western-cape">Western Cape</option>
                  <option value="limpopo">Limpopo</option>
                  <option value="kwazulu-natal">KwaZulu-Natal</option>
                  <option value="eastern-cape">Eastern Cape</option>
                  <option value="free-state">Free State</option>
                  <option value="mpumalanga">Mpumalanga</option>
                  <option value="north-west">North West</option>
                  <option value="northern-cape">Northern Cape</option>
                </select>
              </div>
              <div className="field">
                <div className="lbl">Field of study</div>
                <select value={matchField} onChange={e => setMatchField(e.target.value)}>
                  <option value="engineering">Engineering</option>
                  <option value="health">Health sciences</option>
                  <option value="commerce">Commerce</option>
                  <option value="cs">Computer science</option>
                  <option value="education">Education</option>
                  <option value="humanities">Humanities</option>
                  <option value="agriculture">Agriculture</option>
                </select>
              </div>
              <button type="button" className="btn btn-primary" style={{ height: '2.875rem' }} onClick={handleMatch}>
                Match now <span className="arr">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ EXPLORER ══ */}
      <section style={{ borderTop: '1px solid hsl(var(--line))' }} id="explorer">
        <div className="explorer">

          {/* ── Filter sidebar ── */}
          <aside className={`ex-filters${filtersOpen ? ' open' : ''}`} id="bur-filters" aria-label="Filter bursaries">
            <div className="fhead">
              <h3>Filters</h3>
              <button className="reset" onClick={clearFilters}>RESET</button>
            </div>

            {/* Funder type */}
            <div className="fgroup">
              <div className="fgroup-k">
                <span>Funder type</span>
                <span className="v">{funderTypes.size} / 4</span>
              </div>
              <div className="pill-grid">
                {([
                  { t: 'gov' as FunderType, label: 'NSFAS', ct: 1 },
                  { t: 'uni' as FunderType, label: 'University', ct: 412 },
                  { t: 'corp' as FunderType, label: 'Corporate', ct: 541 },
                  { t: 'ngo' as FunderType, label: 'NGO & foundation', ct: 218 },
                ]).map(({ t, label, ct }) => (
                  <button
                    key={t}
                    className={`pill-tog${funderTypes.has(t) ? ' on' : ''}`}
                    onClick={() => toggleFunder(t)}
                    aria-pressed={funderTypes.has(t)}
                  >
                    {label} <span className="ct">{ct}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Award amount */}
            <div className="fgroup">
              <div className="fgroup-k">
                <span>Award amount</span>
                <span className="v">R 0 – R {maxAmount}k</span>
              </div>
              <input
                type="range" min={0} max={500} value={maxAmount}
                onChange={e => setMaxAmount(Number(e.target.value))}
                aria-label="Maximum award amount"
              />
              <div className="range-out">
                <span>R 0</span>
                <span>R 500k+</span>
              </div>
            </div>

            {/* Field of study */}
            <div className="fgroup">
              <div className="fgroup-k">
                <span>Field of study</span>
                <span className="v">{fields.size} selected</span>
              </div>
              <div className="check-list">
                {[
                  { f: 'engineering', label: 'Engineering', ct: 238 },
                  { f: 'health', label: 'Health sciences', ct: 196 },
                  { f: 'cs', label: 'Computer science', ct: 154 },
                  { f: 'commerce', label: 'Commerce & finance', ct: 221 },
                  { f: 'education', label: 'Education', ct: 112 },
                  { f: 'agriculture', label: 'Agriculture', ct: 84 },
                  { f: 'humanities', label: 'Humanities & social', ct: 142 },
                ].map(({ f, label, ct }) => (
                  <label key={f}>
                    <input type="checkbox" checked={fields.has(f)} onChange={() => toggleField(f)} />
                    <span>{label}</span>
                    <span className="ct">{ct}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Covers */}
            <div className="fgroup">
              <div className="fgroup-k">
                <span>Covers</span>
                <span className="v">{covers.size} selected</span>
              </div>
              <div className="check-list">
                {[
                  { c: 'tuition', label: 'Tuition', ct: 1284 },
                  { c: 'accommodation', label: 'Accommodation', ct: 612 },
                  { c: 'living', label: 'Living allowance', ct: 418 },
                  { c: 'books', label: 'Books & equipment', ct: 534 },
                  { c: 'travel', label: 'Travel', ct: 198 },
                ].map(({ c, label, ct }) => (
                  <label key={c}>
                    <input type="checkbox" checked={covers.has(c)} onChange={() => toggleCover(c)} />
                    <span>{label}</span>
                    <span className="ct">{ct}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Obligations */}
            <div className="fgroup">
              <div className="fgroup-k">
                <span>Obligations</span>
                <span className="v">{obligations.size} selected</span>
              </div>
              <div className="check-list">
                {[
                  { o: 'work-back', label: 'Work-back', ct: 324 },
                  { o: 'none', label: 'None', ct: 762 },
                  { o: 'internship', label: 'Internship required', ct: 198 },
                ].map(({ o, label, ct }) => (
                  <label key={o}>
                    <input type="checkbox" checked={obligations.has(o)} onChange={() => toggleObligation(o)} />
                    <span>{label}</span>
                    <span className="ct">{ct}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Results ── */}
          <div className="ex-results">
            <div className="results-head">
              <div>
                <div className="rule" style={{ marginBottom: '0.875rem' }}>
                  <span className="num">01 / 04</span>
                  <span className="rule-line" style={{ height: 1, flex: 1, background: 'hsl(var(--line-strong))' }} />
                  <span className="lbl">Matched · live</span>
                </div>
                <h2>
                  Your matches{' '}
                  <span className="ct">· {filtered.length} sources</span>
                </h2>
              </div>
              <div className="toolbar">
                <select
                  className="sort-select"
                  value={sort}
                  onChange={e => setSort(e.target.value as SortKey)}
                  aria-label="Sort order"
                >
                  <option value="fit">Sort · best fit</option>
                  <option value="amount">Sort · highest award</option>
                  <option value="deadline">Sort · closest deadline</option>
                  <option value="name">Sort · alphabetical</option>
                </select>
                <Link href="/signup" className="btn btn-outline btn-sm">Save list</Link>
                <Link href="/signup" className="btn btn-primary btn-sm">Apply to all <span className="arr">→</span></Link>
              </div>
            </div>

            <div className="bursary-list" aria-label="Bursary results">
              {filtered.length === 0 ? (
                <div style={{ padding: '4rem 0', textAlign: 'center', color: 'hsl(var(--mute))' }}>
                  <div style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontStyle: 'italic', fontSize: '4rem', color: 'hsl(var(--accent))', opacity: 0.5 }}>∅</div>
                  <p style={{ marginTop: '1rem', fontSize: '1.125rem', fontWeight: 700 }}>No bursaries match your filters</p>
                  <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={clearFilters}>Clear filters</button>
                </div>
              ) : (
                filtered.map(b => <BCard key={b.id} b={b} />)
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem 0' }}>
              <Link href="/signup" className="btn btn-outline">
                Unlock 1,284 sources <span className="arr">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="section" id="how">
        <div className="container">
          <div className="rule reveal-up">
            <span className="num">02 / 04</span>
            <span className="rule-line reveal-line" />
            <span className="lbl">How matching works</span>
          </div>
          <div style={{ marginTop: '2.5rem', maxWidth: '56rem' }} className="reveal-up">
            <h2 className="heading text-balance">
              Four steps. <span className="serif" style={{ color: 'hsl(var(--accent-600))' }}>No paperwork</span> until you&apos;re ready.
            </h2>
            <p className="sub" style={{ marginTop: '1.25rem' }}>
              The match runs entirely in your browser. You don&apos;t upload anything. We only see your profile when you choose to apply through us.
            </p>
          </div>
          <div className="how-grid reveal-up">
            <div className="how-step">
              <div className="num">i.</div>
              <h3>Profile</h3>
              <p>Enter your APS, household income band, province, and field of interest. Optional: extracurriculars, language, disability, gender. Profile lives in your browser until you sign up.</p>
              <div className="meta">~ 90 seconds</div>
            </div>
            <div className="how-step">
              <div className="num">ii.</div>
              <h3>Match</h3>
              <p>We score every one of the 1,284 sources against your profile and rank by fit (0–100). Each match shows why it fits and what&apos;s missing if it doesn&apos;t.</p>
              <div className="meta">Instant · client-side</div>
            </div>
            <div className="how-step">
              <div className="num">iii.</div>
              <h3>Shortlist</h3>
              <p>Save matches into your shortlist. Compare side-by-side: award, deadlines, obligations, renewal terms. We surface conflicts (e.g. two work-back deals).</p>
              <div className="meta">No limit</div>
            </div>
            <div className="how-step">
              <div className="num">iv.</div>
              <h3>Apply</h3>
              <p>Apply directly. Documents you upload once are reused across every application. Most students complete 11 applications in under 3 hours total.</p>
              <div className="meta">~ 15 min / app</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SOURCE BREAKDOWN ══ */}
      <section className="section" id="sources">
        <div className="container">
          <div className="rule reveal-up">
            <span className="num">03 / 04</span>
            <span className="rule-line reveal-line" />
            <span className="lbl">Where the money comes from</span>
          </div>
          <div style={{ marginTop: '2.5rem', maxWidth: '56rem' }} className="reveal-up">
            <h2 className="heading text-balance">
              Six categories. <span className="serif" style={{ color: 'hsl(var(--accent-600))' }}>One</span> index.
            </h2>
            <p className="sub" style={{ marginTop: '1.25rem' }}>
              Funding sources differ in scale, requirements, and obligation profile. Knowing the shape of the pool helps you target the right ones.
            </p>
          </div>
          <div className="src-grid reveal-up">
            <div className="src-cell">
              <span className="badge badge-info">01 · Government</span>
              <h3>NSFAS &amp; provincial<span className="ct">· 1 source · 97 add-ons</span></h3>
              <p>The largest single funder by far. Means-tested, no work-back, covers tuition + accommodation + living allowance + travel. Provincial bursaries supplement in select fields.</p>
              <div className="stats">
                <div className="item"><span className="k">Pool</span><span className="v">R 28.4bn</span></div>
                <div className="item"><span className="k">Recipients</span><span className="v">~ 800k</span></div>
                <div className="item"><span className="k">Avg. award</span><span className="v">R 82k</span></div>
              </div>
            </div>
            <div className="src-cell">
              <span className="badge">02 · University</span>
              <h3>Institutional bursaries<span className="ct">· 412 sources</span></h3>
              <p>Each public university maintains its own merit, need, and faculty-specific bursaries. Often stackable with NSFAS. Tuition-only is the norm; accommodation and living are rarer.</p>
              <div className="stats">
                <div className="item"><span className="k">Pool</span><span className="v">R 6.8bn</span></div>
                <div className="item"><span className="k">Recipients</span><span className="v">~ 86k</span></div>
                <div className="item"><span className="k">Avg. award</span><span className="v">R 64k</span></div>
              </div>
            </div>
            <div className="src-cell">
              <span className="badge badge-pw-extended">03 · Corporate</span>
              <h3>Industry bursaries<span className="ct">· 541 sources</span></h3>
              <p>Banks, insurers, miners, telcos, retailers. Generous awards (often full cost), high competition, and a work-back commitment of 1–3 years. The largest growth area in the index.</p>
              <div className="stats">
                <div className="item"><span className="k">Pool</span><span className="v">R 4.2bn</span></div>
                <div className="item"><span className="k">Recipients</span><span className="v">~ 12k</span></div>
                <div className="item"><span className="k">Avg. award</span><span className="v">R 168k</span></div>
              </div>
            </div>
            <div className="src-cell">
              <span className="badge badge-accent">04 · NGO &amp; foundation</span>
              <h3>Philanthropic awards<span className="ct">· 218 sources</span></h3>
              <p>Allan Gray Orbis, Mandela Rhodes, Moshal, Iputshe, Canon Collins. Holistic programmes: funding + mentorship + network. Selection processes are intensive but lifelong-network awards.</p>
              <div className="stats">
                <div className="item"><span className="k">Pool</span><span className="v">R 1.4bn</span></div>
                <div className="item"><span className="k">Recipients</span><span className="v">~ 3.2k</span></div>
                <div className="item"><span className="k">Avg. award</span><span className="v">R 198k</span></div>
              </div>
            </div>
            <div className="src-cell">
              <span className="badge badge-pw-direct">05 · Provincial</span>
              <h3>Provincial &amp; municipal<span className="ct">· 96 sources</span></h3>
              <p>Province-specific bursaries — typically for students from that province pursuing a critical skill. Western Cape&apos;s bursary is the largest; Limpopo and Eastern Cape have growing programmes.</p>
              <div className="stats">
                <div className="item"><span className="k">Pool</span><span className="v">R 0.34bn</span></div>
                <div className="item"><span className="k">Recipients</span><span className="v">~ 4.1k</span></div>
                <div className="item"><span className="k">Avg. award</span><span className="v">R 78k</span></div>
              </div>
            </div>
            <div className="src-cell">
              <span className="badge badge-pw-tvet">06 · Merit &amp; specialist</span>
              <h3>Sport, arts, niche<span className="ct">· 16 sources</span></h3>
              <p>Sports scholarships, arts foundations, niche-skills awards. Small pool but worth flagging for the right student. Most are renewable based on continued performance.</p>
              <div className="stats">
                <div className="item"><span className="k">Pool</span><span className="v">R 0.06bn</span></div>
                <div className="item"><span className="k">Recipients</span><span className="v">~ 620</span></div>
                <div className="item"><span className="k">Avg. award</span><span className="v">R 92k</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="section" id="faq">
        <div className="container">
          <div className="rule reveal-up">
            <span className="num">04 / 04</span>
            <span className="rule-line reveal-line" />
            <span className="lbl">Questions we get a lot</span>
          </div>
          <div style={{ marginTop: '2.5rem', maxWidth: '56rem' }} className="reveal-up">
            <h2 className="heading text-balance">
              The bursary questions <span className="serif" style={{ color: 'hsl(var(--accent-600))' }}>nobody</span> answers clearly.
            </h2>
          </div>
          <div className="faq reveal-up">
            <details className="faq-item" open>
              <summary>
                Can I apply to NSFAS <em style={{ fontFamily: 'var(--font-instrument-serif), serif', fontStyle: 'italic' }}>and</em> a private bursary at the same time?
                <span className="ico">+</span>
              </summary>
              <div className="answer">
                Yes — and you usually should. NSFAS allows stacking with private bursaries up to the cost of attendance. If your private bursary covers tuition only, NSFAS can still cover accommodation and your living allowance. The platform flags stack conflicts automatically when you shortlist multiple sources.
              </div>
            </details>
            <details className="faq-item">
              <summary>
                What&apos;s a &ldquo;work-back&rdquo; and is it a good idea?
                <span className="ico">+</span>
              </summary>
              <div className="answer">
                A work-back commits you to working at the funder for a fixed period (usually 1–3 years) after graduating. They are excellent for graduates who want a guaranteed first job and a clear career path; less so if you want flexibility or are unsure about the funder&apos;s industry. Most work-backs pay market rates and count as full graduate-programme placements.
              </div>
            </details>
            <details className="faq-item">
              <summary>
                I missed the NSFAS deadline. What now?
                <span className="ico">+</span>
              </summary>
              <div className="answer">
                NSFAS reopens a supplementary application window in January for first-year students. In the meantime: apply to 5–10 private bursaries matched to your profile. Most have rolling deadlines and some specifically backfill students who didn&apos;t get NSFAS. We surface &ldquo;post-NSFAS&rdquo; sources in the filter sidebar.
              </div>
            </details>
            <details className="faq-item">
              <summary>
                Are TVET students eligible for the same funding?
                <span className="ico">+</span>
              </summary>
              <div className="answer">
                NSFAS covers TVET fully and is in fact the largest TVET funder in the country. Many corporate bursaries (especially in the trades — Sasol, Eskom, Transnet) also fund N4–N6 students directly. The filter has a TVET-only toggle.
              </div>
            </details>
            <details className="faq-item">
              <summary>
                What documents do I need ready?
                <span className="ico">+</span>
              </summary>
              <div className="answer">
                A certified copy of your ID, your most recent school report, household-income proof (parents&apos; IRP5 or affidavit), and a 200-word personal statement. Upload once on Prospectus; we reuse them across every application. Document re-use is the single biggest time-saver we&apos;ve measured.
              </div>
            </details>
            <details className="faq-item">
              <summary>
                What happens if I don&apos;t get NSFAS but I&apos;m under the threshold?
                <span className="ico">+</span>
              </summary>
              <div className="answer">
                Appeal within 30 days of the decision with supporting documents. NSFAS reverses ~12% of initial declines on appeal. We track the appeal calendar and surface deadlines in your dashboard. While appealing, apply to the next 5 best-fit private bursaries — they are your backstop.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="final">
        <div className="container">
          <div className="rule reveal-up" style={{ marginBottom: '2rem' }}>
            <span className="num" style={{ color: 'hsl(var(--bg) / 0.5)' }}>END · 04</span>
            <span className="rule-line" style={{ background: 'hsl(var(--bg) / 0.2)' }} />
            <span className="lbl" style={{ color: 'hsl(var(--bg) / 0.5)' }}>Funding · live index</span>
          </div>
          <h2 className="reveal-up">
            <span className="serif">R 41.2bn</span> is looking for a student.
          </h2>
          <p className="sub reveal-up">
            Spend ninety seconds. See what you qualify for. Apply to all of it in one afternoon.
          </p>
          <div className="actions reveal-up">
            <a href="#explorer" className="btn btn-accent btn-lg">
              Start matching <span className="arr">→</span>
            </a>
            <Link href="/programmes" className="btn btn-outline btn-lg">
              Browse programmes
            </Link>
          </div>
          <div className="final-grid reveal-up">
            <div>
              <h4>What we promise</h4>
              <p>Every source listed is verified annually. We never charge students. We never sell your data. If a funder pays us a referral fee, the listing carries a small &ldquo;Sponsored&rdquo; tag — and it does not move up the match ranking.</p>
            </div>
            <div>
              <h4>Where next</h4>
              <nav className="next" aria-label="Related pages">
                <Link href="/programmes"><span>Browse all programmes</span><span className="arr">→</span></Link>
                <Link href="/pathways"><span>Read the four pathways</span><span className="arr">→</span></Link>
                <Link href="/signup"><span>See careers &amp; outcomes</span><span className="arr">→</span></Link>
                <Link href="/signup"><span>For funders &amp; institutions</span><span className="arr">→</span></Link>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="footer">
        <div className="container">
          <div className="footer-row">
            <Link href="/" className="brand" aria-label="Prospectus home">
              <div className="brand-mark" aria-hidden="true">P</div>
              <span className="brand-name">Prospectus</span>
              <span className="brand-tag" style={{ color: 'hsl(var(--bg) / 0.6)', borderColor: 'hsl(var(--bg) / 0.2)' }}>marks → future</span>
            </Link>
            <div className="footer-links">
              <Link href="/programmes">Programmes</Link>
              <Link href="/bursaries">Bursaries</Link>
              <Link href="/signup">Careers</Link>
              <Link href="/pathways">Pathways</Link>
              <Link href="/signup">For institutions</Link>
              <Link href="/">About</Link>
            </div>
          </div>
          <div className="footer-meta">
            <span>© 2026 Prospectus · built in South Africa · v1.4.1</span>
            <span className="serif-tag">Marks in. Future out.</span>
          </div>
        </div>
      </footer>

      {/* ── Mobile filter button ── */}
      <button
        className="mob-filter-btn"
        onClick={() => setFiltersOpen(v => !v)}
        aria-expanded={filtersOpen}
        aria-controls="bur-filters"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
        </svg>
        {filtersOpen ? 'Close' : 'Filters'}
      </button>

    </div>
  );
}
