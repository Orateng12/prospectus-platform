'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import './programmes.css';

/* ── Types ── */
interface ProgEntry {
  id: string;
  name: string;
  inst: string;
  city: string;
  prov: string;
  faculty: string;
  pathway: 'direct' | 'extended' | 'foundation' | 'tvet';
  aps: number;
  fee: number;
  dur: number;
  career: string;
}

type SortKey = 'fit' | 'aps-asc' | 'aps-desc' | 'fee-asc' | 'fee-desc' | 'name';

/* ── Static programme database (from design prototype) ── */
const PROG_DATA: ProgEntry[] = [
  { id: 'p01', name: 'BSc Computer Science', inst: 'UCT', city: 'Cape Town', prov: 'WC', faculty: 'science', pathway: 'direct', aps: 38, fee: 76420, dur: 3, career: 'Software engineer' },
  { id: 'p02', name: 'BSc Actuarial Science', inst: 'Wits', city: 'Johannesburg', prov: 'GP', faculty: 'science', pathway: 'direct', aps: 40, fee: 82100, dur: 3, career: 'Actuarial analyst' },
  { id: 'p03', name: 'MBChB Medicine', inst: 'UCT', city: 'Cape Town', prov: 'WC', faculty: 'health', pathway: 'direct', aps: 45, fee: 91200, dur: 6, career: 'Medical doctor' },
  { id: 'p04', name: 'BCom Finance', inst: 'SUN', city: 'Stellenbosch', prov: 'WC', faculty: 'commerce', pathway: 'direct', aps: 36, fee: 64800, dur: 3, career: 'Financial analyst' },
  { id: 'p05', name: 'BEng Chemical', inst: 'UP', city: 'Pretoria', prov: 'GP', faculty: 'engineering', pathway: 'direct', aps: 38, fee: 72400, dur: 4, career: 'Process engineer' },
  { id: 'p06', name: 'BSc Data Science', inst: 'UCT', city: 'Cape Town', prov: 'WC', faculty: 'science', pathway: 'direct', aps: 39, fee: 76420, dur: 3, career: 'Data scientist' },
  { id: 'p07', name: 'BA Psychology', inst: 'UJ', city: 'Johannesburg', prov: 'GP', faculty: 'humanities', pathway: 'direct', aps: 30, fee: 48200, dur: 3, career: 'Clinical psychologist' },
  { id: 'p08', name: 'BCom Accounting', inst: 'UNISA', city: 'Pretoria', prov: 'GP', faculty: 'commerce', pathway: 'direct', aps: 32, fee: 24800, dur: 3, career: 'Chartered accountant' },
  { id: 'p09', name: 'BSc Eng (Electrical)', inst: 'UKZN', city: 'Durban', prov: 'KZN', faculty: 'engineering', pathway: 'direct', aps: 38, fee: 68200, dur: 4, career: 'Electrical engineer' },
  { id: 'p10', name: 'LLB Law', inst: 'Wits', city: 'Johannesburg', prov: 'GP', faculty: 'law', pathway: 'direct', aps: 39, fee: 71400, dur: 4, career: 'Attorney' },
  { id: 'p11', name: 'BSc Computer Sci · Extended', inst: 'Wits', city: 'Johannesburg', prov: 'GP', faculty: 'science', pathway: 'extended', aps: 32, fee: 71400, dur: 4, career: 'Software engineer' },
  { id: 'p12', name: 'BEng Mechanical · Extended', inst: 'UCT', city: 'Cape Town', prov: 'WC', faculty: 'engineering', pathway: 'extended', aps: 30, fee: 71890, dur: 5, career: 'Mechanical engineer' },
  { id: 'p13', name: 'BCom · Extended', inst: 'NMU', city: 'Gqeberha', prov: 'EC', faculty: 'commerce', pathway: 'extended', aps: 28, fee: 52100, dur: 4, career: 'Business analyst' },
  { id: 'p14', name: 'BSc Biological Sci · Extended', inst: 'RU', city: 'Makhanda', prov: 'EC', faculty: 'science', pathway: 'extended', aps: 30, fee: 56200, dur: 4, career: 'Researcher' },
  { id: 'p15', name: 'BEd Foundation Phase', inst: 'UWC', city: 'Cape Town', prov: 'WC', faculty: 'education', pathway: 'direct', aps: 28, fee: 42100, dur: 4, career: 'Teacher (foundation)' },
  { id: 'p16', name: 'BSocSci Politics', inst: 'Rhodes', city: 'Makhanda', prov: 'EC', faculty: 'humanities', pathway: 'direct', aps: 34, fee: 58400, dur: 3, career: 'Policy analyst' },
  { id: 'p17', name: 'BSc Foundation', inst: 'UFS', city: 'Bloemfontein', prov: 'FS', faculty: 'science', pathway: 'foundation', aps: 24, fee: 44200, dur: 5, career: 'Scientist' },
  { id: 'p18', name: 'BHSc Foundation', inst: 'UWC', city: 'Cape Town', prov: 'WC', faculty: 'health', pathway: 'foundation', aps: 28, fee: 46800, dur: 5, career: 'Health practitioner' },
  { id: 'p19', name: 'BCom Foundation', inst: 'UJ', city: 'Johannesburg', prov: 'GP', faculty: 'commerce', pathway: 'foundation', aps: 26, fee: 48200, dur: 4, career: 'Business professional' },
  { id: 'p20', name: 'Dip · Information Tech', inst: 'TVET Ekurhuleni', city: 'Ekurhuleni', prov: 'GP', faculty: 'vocational', pathway: 'tvet', aps: 22, fee: 18200, dur: 3, career: 'IT support specialist' },
  { id: 'p21', name: 'Dip · Mechatronics', inst: 'TVET Tshwane', city: 'Pretoria', prov: 'GP', faculty: 'vocational', pathway: 'tvet', aps: 24, fee: 16800, dur: 3, career: 'Mechatronics technician' },
  { id: 'p22', name: 'NCV · Engineering', inst: 'TVET False Bay', city: 'Cape Town', prov: 'WC', faculty: 'vocational', pathway: 'tvet', aps: 18, fee: 14200, dur: 3, career: 'Engineering artisan' },
  { id: 'p23', name: 'BFA Visual Arts', inst: 'Rhodes', city: 'Makhanda', prov: 'EC', faculty: 'arts', pathway: 'direct', aps: 30, fee: 56200, dur: 4, career: 'Visual artist · curator' },
  { id: 'p24', name: 'BSc Quantity Surveying', inst: 'UP', city: 'Pretoria', prov: 'GP', faculty: 'engineering', pathway: 'direct', aps: 36, fee: 64800, dur: 4, career: 'Quantity surveyor' },
  { id: 'p25', name: 'BSc Architectural Studies', inst: 'UCT', city: 'Cape Town', prov: 'WC', faculty: 'engineering', pathway: 'direct', aps: 38, fee: 78200, dur: 3, career: 'Architect' },
  { id: 'p26', name: 'BCom Marketing', inst: 'UJ', city: 'Johannesburg', prov: 'GP', faculty: 'commerce', pathway: 'direct', aps: 30, fee: 48200, dur: 3, career: 'Marketing manager' },
  { id: 'p27', name: 'BNurs Nursing', inst: 'UKZN', city: 'Durban', prov: 'KZN', faculty: 'health', pathway: 'direct', aps: 32, fee: 52400, dur: 4, career: 'Registered nurse' },
  { id: 'p28', name: 'BSc Geology', inst: 'UFS', city: 'Bloemfontein', prov: 'FS', faculty: 'science', pathway: 'direct', aps: 34, fee: 44200, dur: 3, career: 'Geologist' },
  { id: 'p29', name: 'BCom Information Systems', inst: 'Wits', city: 'Johannesburg', prov: 'GP', faculty: 'commerce', pathway: 'direct', aps: 36, fee: 71400, dur: 3, career: 'Systems analyst' },
  { id: 'p30', name: 'BA Journalism', inst: 'Rhodes', city: 'Makhanda', prov: 'EC', faculty: 'humanities', pathway: 'direct', aps: 36, fee: 58400, dur: 3, career: 'Journalist' },
];

const ALL_PROVINCES = ['WC', 'GP', 'KZN', 'EC', 'FS', 'LP', 'MP', 'NC', 'NW'];
const PROV_LABELS: Record<string, string> = {
  WC: 'Western Cape', GP: 'Gauteng', KZN: 'KwaZulu-Natal', EC: 'Eastern Cape',
  FS: 'Free State', LP: 'Limpopo', MP: 'Mpumalanga', NC: 'Northern Cape', NW: 'North West',
};
const PROV_COUNTS: Record<string, number> = { WC: 8, GP: 11, KZN: 3, EC: 6, FS: 3, LP: 0, MP: 0, NC: 0, NW: 0 };
const ALL_FACULTIES = ['science', 'commerce', 'engineering', 'health', 'humanities', 'law', 'education', 'arts', 'vocational'];
const FAC_LABELS: Record<string, string> = {
  science: 'Science', commerce: 'Commerce', engineering: 'Engineering', health: 'Health Sci.',
  humanities: 'Humanities', law: 'Law', education: 'Education', arts: 'Arts', vocational: 'Vocational',
};
const FAC_COUNTS: Record<string, number> = { science: 7, commerce: 6, engineering: 7, health: 4, humanities: 4, law: 1, education: 1, arts: 1, vocational: 3 };
const PW_COUNTS: Record<string, number> = { direct: 22, extended: 4, foundation: 3, tvet: 3 };
const MY_APS = 42;

function fmtFee(n: number) { return 'R ' + n.toLocaleString(); }

/* ── ProgRow sub-component ── */
function ProgRow({
  p, userAps, compareSet, onToggleCompare,
}: {
  p: ProgEntry;
  userAps: number;
  compareSet: Set<string>;
  onToggleCompare: (id: string) => void;
}) {
  const eligible = p.aps <= userAps;
  const near = !eligible && p.aps <= userAps + 2;
  const apsClass = eligible ? 'eligible' : near ? 'near' : '';
  const rowClass = `prog-row${eligible ? ' is-eligible' : near ? ' is-near' : ''}`;
  const delta = p.aps - userAps;

  return (
    <div className={rowClass}>
      <div className="prog-name">
        <div className="ttl">
          {p.name}
          <span className="sub-inst">{p.inst}</span>
        </div>
        <div className="tags">
          <span className={`badge-pw badge-pw-${p.pathway}`}>{p.pathway}</span>
          {p.faculty === 'vocational' && <span className="badge-nsfas">NSFAS</span>}
        </div>
      </div>
      <div className="prog-meta-block">
        <div><div className="k">City</div><div className="v">{p.city}</div></div>
        <div><div className="k">Career</div><div className="v" style={{ fontSize: '0.8125rem' }}>{p.career}</div></div>
      </div>
      <div className={`prog-aps${apsClass ? ' ' + apsClass : ''}`}>
        <div className="label">APS req.</div>
        <div className="val">{p.aps}</div>
        <div className="delta">
          {eligible ? `✓ +${Math.abs(delta)} above` : near ? `± ${delta} gap` : `+${delta} needed`}
        </div>
      </div>
      <div className="prog-fee">
        <div className="v">{fmtFee(p.fee)}</div>
        <div className="sub">per year</div>
      </div>
      <div className="prog-action">
        <button
          className="arr"
          onClick={(e) => { e.stopPropagation(); onToggleCompare(p.id); }}
          aria-label={compareSet.has(p.id) ? `Remove ${p.name} from compare` : `Add ${p.name} to compare`}
          style={compareSet.has(p.id) ? { background: 'hsl(var(--accent))', color: 'white', borderColor: 'hsl(var(--accent))' } : {}}
        >
          {compareSet.has(p.id) ? '✓' : '→'}
        </button>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function ProgrammesPage() {
  const [apsMin, setApsMin] = useState(18);
  const [apsMax, setApsMax] = useState(49);
  const [pathways, setPathways] = useState<Set<string>>(new Set(['direct', 'extended', 'foundation', 'tvet']));
  const [provinces, setProvinces] = useState<Set<string>>(new Set(ALL_PROVINCES));
  const [faculties, setFaculties] = useState<Set<string>>(new Set(ALL_FACULTIES));
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [nearEligible, setNearEligible] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('fit');
  const [compareSet, setCompareSet] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [navOpen, setNavOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);

  /* ── Context counts ── */
  const eligible = useMemo(() => PROG_DATA.filter(p => p.aps <= MY_APS).length, []);
  const nearCount = useMemo(() => PROG_DATA.filter(p => p.aps > MY_APS && p.aps <= MY_APS + 2).length, []);

  /* ── Filtered + sorted list ── */
  const filtered = useMemo(() => {
    let list = PROG_DATA.filter(p =>
      p.aps >= apsMin && p.aps <= apsMax &&
      pathways.has(p.pathway) &&
      provinces.has(p.prov) &&
      faculties.has(p.faculty) &&
      (!eligibleOnly || p.aps <= MY_APS) &&
      (!nearEligible || p.aps <= MY_APS + 2)
    );
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        (p.name + ' ' + p.inst + ' ' + p.career + ' ' + p.city).toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (sort === 'aps-asc')  return a.aps - b.aps;
      if (sort === 'aps-desc') return b.aps - a.aps;
      if (sort === 'fee-asc')  return a.fee - b.fee;
      if (sort === 'fee-desc') return b.fee - a.fee;
      if (sort === 'name')     return a.name.localeCompare(b.name);
      /* fit: eligible first, near second, then closest APS */
      const aE = MY_APS >= a.aps ? 0 : (MY_APS >= a.aps - 2 ? 1 : 2);
      const bE = MY_APS >= b.aps ? 0 : (MY_APS >= b.aps - 2 ? 1 : 2);
      if (aE !== bE) return aE - bE;
      return Math.abs(MY_APS - a.aps) - Math.abs(MY_APS - b.aps);
    });
  }, [apsMin, apsMax, pathways, provinces, faculties, eligibleOnly, nearEligible, search, sort]);

  /* ── Toggle helpers ── */
  function togglePathway(pw: string) {
    setPathways(prev => { const n = new Set(prev); if (n.has(pw)) n.delete(pw); else n.add(pw); return n; });
  }
  function toggleProvince(prov: string) {
    setProvinces(prev => { const n = new Set(prev); if (n.has(prov)) n.delete(prov); else n.add(prov); return n; });
  }
  function toggleFaculty(fac: string) {
    setFaculties(prev => { const n = new Set(prev); if (n.has(fac)) n.delete(fac); else n.add(fac); return n; });
  }
  function toggleCompare(id: string) {
    setCompareSet(prev => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); return n; }
      if (n.size >= 3) return prev;
      n.add(id); return n;
    });
  }
  function clearFilters() {
    setApsMin(18); setApsMax(49);
    setPathways(new Set(['direct', 'extended', 'foundation', 'tvet']));
    setProvinces(new Set(ALL_PROVINCES));
    setFaculties(new Set(ALL_FACULTIES));
    setEligibleOnly(false); setNearEligible(false); setSearch('');
  }

  /* ── Effects ── */
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.prg-page .reveal-up, .prg-page .reveal-line').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === 'Escape') { setNavOpen(false); setFiltersOpen(false); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
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
    <div className="prg-page">
      {/* ── NAV ── */}
      <header className="nav" ref={navRef}>
        <div className="container nav-row">
          <Link href="/" className="brand" aria-label="Prospectus home">
            <div className="brand-mark" aria-hidden="true">P</div>
            <span className="brand-name">Prospectus</span>
            <span className="brand-tag">built in SA · est. 2026</span>
          </Link>
          <nav className="nav-links" aria-label="Site navigation">
            <Link href="/programmes" className="is-active">Programmes</Link>
            <Link href="/pathways">Pathways</Link>
            <a href="#">Bursaries</a>
            <a href="#">Careers</a>
            <a href="#">For institutions</a>
          </nav>
          <div className="nav-cta">
            <Link href="/login" className="btn btn-ghost btn-sm">Sign in</Link>
            <Link href="/signup" className="btn btn-primary btn-sm">Start free <span className="arr" aria-hidden="true">→</span></Link>
            <button
              className="nav-mob-btn"
              aria-expanded={navOpen}
              aria-controls="prg-mobile-nav"
              aria-label={navOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setNavOpen(v => !v)}
            >
              <span className="bar" aria-hidden="true" />
              <span className="bar" aria-hidden="true" />
              <span className="bar" aria-hidden="true" />
            </button>
          </div>
        </div>
        <nav
          id="prg-mobile-nav"
          className={`nav-drawer${navOpen ? ' open' : ''}`}
          aria-label="Mobile navigation"
          aria-hidden={!navOpen}
        >
          <div className="nav-drawer-head">
            <Link href="/" className="brand" onClick={() => setNavOpen(false)}>
              <div className="brand-mark" aria-hidden="true">P</div>
              <span className="brand-name">Prospectus</span>
            </Link>
            <button className="btn btn-ghost btn-sm" onClick={() => setNavOpen(false)} aria-label="Close menu">✕</button>
          </div>
          <div className="nav-drawer-links">
            <Link href="/programmes" className="is-active" onClick={() => setNavOpen(false)}>Programmes</Link>
            <Link href="/pathways" onClick={() => setNavOpen(false)}>Pathways</Link>
            <a href="#" onClick={() => setNavOpen(false)}>Bursaries</a>
            <a href="#" onClick={() => setNavOpen(false)}>Careers</a>
            <a href="#" onClick={() => setNavOpen(false)}>For institutions</a>
          </div>
          <div className="nav-drawer-cta">
            <Link href="/login" className="btn btn-outline" onClick={() => setNavOpen(false)}>Sign in</Link>
            <Link href="/signup" className="btn btn-primary" onClick={() => setNavOpen(false)}>Start free <span aria-hidden="true">→</span></Link>
          </div>
        </nav>
        <div className="container live-strip" aria-hidden="true">
          <span><span className="pulse" /> Live</span>
          <span>·</span>
          <span><strong style={{ color: 'hsl(var(--ink))', fontWeight: 600 }}>9,412</strong> programmes indexed</span>
          <span className="sep">·</span>
          <span>Last reconciled: 24 May 2026 04:12 SAST</span>
          <span className="sep">·</span>
          <span>26 universities · 50 TVET</span>
        </div>
      </header>

      {/* ── APS Context strip ── */}
      <section className="aps-context" aria-label="Your APS context">
        <div className="container">
          <div className="l">
            <div className="my-aps">
              <span className="lbl">Your APS</span>
              <span className="v tabular">{MY_APS}</span>
              <span className="out">/ 49</span>
            </div>
            <span className="summary">
              Showing <strong>{eligible} eligible</strong> · <strong>{nearCount}</strong> near-eligible · across <strong>26</strong> institutions
            </span>
          </div>
          <Link href="/" className="recalc">↻ Recalculate APS</Link>
        </div>
      </section>

      {/* ── Explorer ── */}
      <main className="explorer">

        {/* ── Filters sidebar ── */}
        <aside className={`filters${filtersOpen ? ' open' : ''}`} id="prg-filters" aria-label="Filter programmes">
          <div className="filters-head">
            <h3>Filter programmes</h3>
            <button className="clear" onClick={clearFilters}>↻ clear all</button>
          </div>

          {/* APS range */}
          <div className="fgroup">
            <div className="fgroup-label">
              <span>APS range</span>
              <span className="v">{apsMin}–{apsMax}</span>
            </div>
            <div className="aps-range-wrap">
              <input
                type="range" min={18} max={49} value={apsMin}
                onChange={e => setApsMin(Math.min(Number(e.target.value), apsMax))}
                aria-label="Minimum APS"
              />
              <input
                type="range" min={18} max={49} value={apsMax}
                style={{ marginTop: '-10px' }}
                onChange={e => setApsMax(Math.max(Number(e.target.value), apsMin))}
                aria-label="Maximum APS"
              />
              <div className="aps-range-out">
                <span>18 · TVET</span>
                <span>49 · max</span>
              </div>
            </div>
          </div>

          {/* Pathways */}
          <div className="fgroup">
            <div className="fgroup-label">
              <span>Pathway</span>
              <span className="v">{pathways.size} / 4</span>
            </div>
            <div className="pw-pills">
              {(['direct', 'extended', 'foundation', 'tvet'] as const).map(pw => (
                <button
                  key={pw}
                  className={`pw-pill ${pw[0]}${pathways.has(pw) ? ' on' : ''}`}
                  onClick={() => togglePathway(pw)}
                  aria-pressed={pathways.has(pw)}
                >
                  <span className="sw" aria-hidden="true" />
                  {pw.charAt(0).toUpperCase() + pw.slice(1)}
                  <span className="ct">{PW_COUNTS[pw]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Provinces */}
          <div className="fgroup">
            <div className="fgroup-label">
              <span>Province</span>
              <span className="v">{provinces.size} / 9</span>
            </div>
            <div className="check-list">
              {ALL_PROVINCES.map(prov => (
                <label key={prov}>
                  <input
                    type="checkbox"
                    checked={provinces.has(prov)}
                    onChange={() => toggleProvince(prov)}
                  />
                  <span>{PROV_LABELS[prov]}</span>
                  <span className="ct">{PROV_COUNTS[prov] || 0}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Faculties */}
          <div className="fgroup">
            <div className="fgroup-label"><span>Faculty</span></div>
            <div className="check-list">
              {ALL_FACULTIES.map(fac => (
                <label key={fac}>
                  <input
                    type="checkbox"
                    checked={faculties.has(fac)}
                    onChange={() => toggleFaculty(fac)}
                  />
                  <span>{FAC_LABELS[fac]}</span>
                  <span className="ct">{FAC_COUNTS[fac]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Profile match */}
          <div className="fgroup">
            <div className="fgroup-label"><span>Match with your profile</span></div>
            <div className="check-list">
              <label>
                <input type="checkbox" checked={eligibleOnly} onChange={e => setEligibleOnly(e.target.checked)} />
                <span>Eligible only</span>
                <span className="ct">{eligible}</span>
              </label>
              <label>
                <input type="checkbox" checked={nearEligible} onChange={e => setNearEligible(e.target.checked)} />
                <span>Near-eligible (±2)</span>
                <span className="ct">{nearCount}</span>
              </label>
            </div>
          </div>

          {/* Strategy hint */}
          <div className="strategy-hint">
            <div className="hint-label">Strategy hint</div>
            <p>&ldquo;At APS 42, you&rsquo;re well-positioned for direct entry. Lock in 4 reach, 6 target, 2 safety.&rdquo;</p>
            <p className="hint-attr">— Strategy AI · based on your profile</p>
          </div>
        </aside>

        {/* ── Results ── */}
        <section className="results" aria-label="Programme results">
          <div className="results-head">
            <div className="top">
              <div>
                <div className="eyebrow"><span className="dot" />Programme explorer · 9,412 indexed</div>
                <h1 style={{ marginTop: '0.75rem' }}>
                  Programmes <span className="ct">{filtered.length} matches</span>
                </h1>
              </div>
              <div className="meta">
                Last sync <strong>24 May · 04:12 SAST</strong> · Source: <strong>USAf calendar feed</strong>
              </div>
            </div>
            <div className="toolbar">
              <div className="search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  ref={searchRef}
                  type="search"
                  placeholder="Search by programme, institution or career — e.g. 'actuarial'"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Search programmes"
                />
                <span className="kbd" aria-hidden="true">⌘K</span>
              </div>
              <select
                className="sort-select"
                value={sort}
                onChange={e => setSort(e.target.value as SortKey)}
                aria-label="Sort order"
              >
                <option value="fit">Sort: Best fit for you</option>
                <option value="aps-asc">APS · low → high</option>
                <option value="aps-desc">APS · high → low</option>
                <option value="fee-asc">Fee · low → high</option>
                <option value="fee-desc">Fee · high → low</option>
                <option value="name">Programme name (A–Z)</option>
              </select>
              <div className="view-toggle" role="group" aria-label="View mode">
                <button
                  className={viewMode === 'list' ? 'on' : ''}
                  onClick={() => setViewMode('list')}
                  title="List view" aria-label="List view"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                </button>
                <button
                  className={viewMode === 'grid' ? 'on' : ''}
                  onClick={() => setViewMode('grid')}
                  title="Grid view" aria-label="Grid view"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="programmes" role="list" aria-label="Programme list">
            {filtered.length === 0 ? (
              <div className="empty">
                <div className="ico" aria-hidden="true">∅</div>
                <h3>No programmes match</h3>
                <p>Try adjusting your filters or search term.</p>
                <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={clearFilters}>
                  Clear all filters
                </button>
              </div>
            ) : (
              filtered.map(p => (
                <ProgRow
                  key={p.id}
                  p={p}
                  userAps={MY_APS}
                  compareSet={compareSet}
                  onToggleCompare={toggleCompare}
                />
              ))
            )}
          </div>
        </section>
      </main>

      {/* ── Mobile filter button ── */}
      <button
        className="mob-filter-btn"
        onClick={() => setFiltersOpen(v => !v)}
        aria-expanded={filtersOpen}
        aria-controls="prg-filters"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
        </svg>
        {filtersOpen ? 'Close filters' : 'Filters'}
      </button>

      {/* ── Compare tray ── */}
      <div
        className={`compare-tray${compareSet.size > 0 ? ' show' : ''}`}
        aria-live="polite"
        aria-label="Compare selection"
      >
        <span className="ct-label">Compare · {compareSet.size}</span>
        <div className="avs" aria-hidden="true">
          {[...compareSet].map(id => {
            const p = PROG_DATA.find(x => x.id === id);
            return p ? (
              <div key={id} className="av" title={p.inst}>{p.inst[0]}</div>
            ) : null;
          })}
        </div>
        <button className="compare-btn">
          Compare side-by-side <span aria-hidden="true">→</span>
        </button>
        <button
          className="x-btn"
          onClick={() => setCompareSet(new Set())}
          aria-label="Clear compare"
        >
          ✕
        </button>
      </div>

      {/* ── Final CTA ── */}
      <section className="final">
        <div className="container">
          <div className="eyebrow reveal-up" style={{ color: 'hsl(var(--accent))' }}>
            <span className="dot" style={{ background: 'hsl(var(--accent))' }} />
            Not sure where to start?
          </div>
          <h2 className="reveal-up" style={{ marginTop: '1.5rem' }}>
            Put your <span className="serif">marks</span> in.<br />We&rsquo;ll show you the rest.
          </h2>
          <p className="sub reveal-up">
            Sixty seconds gets you a list. Ten minutes gets you a strategy. The directory is just the index — the platform does the work.
          </p>
          <div className="actions reveal-up">
            <Link href="/" className="btn btn-accent btn-lg">
              Calculate my APS <span className="arr" aria-hidden="true">→</span>
            </Link>
            <Link href="/pathways" className="btn btn-outline btn-lg">
              Understand pathways first
            </Link>
          </div>

          <div className="final-grid">
            <div className="reveal-up">
              <h4>How we index</h4>
              <p>Every programme is sourced from the institution&rsquo;s most recent published calendar. Requirements are reconciled weekly against USAf data. Bursary eligibility is cross-checked against NSFAS reporting. Career projections use StatsSA&rsquo;s Quarterly Labour Force Survey.</p>
            </div>
            <div className="reveal-up">
              <h4>Related</h4>
              <nav className="next">
                <Link href="/pathways"><span>The four pathways · in depth</span><span className="arr" aria-hidden="true">→</span></Link>
                <a href="#"><span>Bursaries &amp; funding strategy</span><span className="arr" aria-hidden="true">→</span></a>
                <a href="#"><span>Career explorer · salary &amp; growth data</span><span className="arr" aria-hidden="true">→</span></a>
                <a href="#"><span>For institutions — get listed</span><span className="arr" aria-hidden="true">→</span></a>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-row">
            <Link href="/" className="brand" aria-label="Prospectus home">
              <div className="brand-mark" aria-hidden="true">P</div>
              <span className="brand-name">Prospectus</span>
              <span className="brand-tag">marks → future</span>
            </Link>
            <div className="footer-links">
              <Link href="/programmes">Programmes</Link>
              <a href="#">Bursaries</a>
              <a href="#">Career explorer</a>
              <Link href="/pathways">Pathways</Link>
              <a href="#">For institutions</a>
              <a href="#">About</a>
              <a href="#">Contact</a>
            </div>
          </div>
          <div className="footer-meta">
            <span>© 2026 Prospectus · built in South Africa · v1.4.1</span>
            <span className="serif-tag">Marks in. Future out.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
