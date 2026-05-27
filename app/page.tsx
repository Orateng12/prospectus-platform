'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import './landing-v2.css';

/* ── APS helpers ── */
function pctToPoints(p: number): number {
  if (p >= 80) return 7;
  if (p >= 70) return 6;
  if (p >= 60) return 5;
  if (p >= 50) return 4;
  if (p >= 40) return 3;
  if (p >= 30) return 2;
  return 1;
}

function pathwayCounts(aps: number) {
  return {
    direct:     Math.max(0, Math.round((aps - 22) * 8.5)),
    extended:   Math.max(0, Math.round((aps - 18) * 3.5)),
    foundation: Math.max(0, Math.round((40 - aps) * 1.8 + 6)),
    tvet:       Math.max(0, Math.round((38 - aps) * 1.2 + 4)),
  };
}

function formatK(k: number): string {
  if (k >= 1000) return 'R ' + (k / 1000).toFixed(1).replace('.0', '') + 'm';
  return 'R ' + Math.round(k).toLocaleString() + 'k';
}

const CAREERS = [
  { aps: 18, c: 'a mechatronics technician', i: 'SAB Miller',    s: 'R 24,500/mo', g: '+12%' },
  { aps: 24, c: 'a junior accountant',       i: 'SARS',          s: 'R 22,800/mo', g: '+9%'  },
  { aps: 28, c: 'a lab technician',          i: 'CSIR',          s: 'R 26,400/mo', g: '+11%' },
  { aps: 32, c: 'a data analyst',            i: 'Discovery',     s: 'R 32,100/mo', g: '+22%' },
  { aps: 36, c: 'a software engineer',       i: 'Standard Bank', s: 'R 38,500/mo', g: '+26%' },
  { aps: 40, c: 'an actuarial analyst',      i: 'Old Mutual',    s: 'R 42,800/mo', g: '+18%' },
  { aps: 44, c: 'a medical doctor',          i: 'Groote Schuur', s: 'R 58,200/mo', g: '+8%'  },
];

function pickCareer(aps: number) {
  let best = CAREERS[0];
  CAREERS.forEach(c => { if (aps >= c.aps) best = c; });
  return best;
}

const PROGRAMMES = [
  { name: 'BSc Computer Science',     inst: 'UCT',             aps: 38, p: 'direct'     },
  { name: 'BSc Actuarial Science',    inst: 'Wits',            aps: 40, p: 'direct'     },
  { name: 'MBChB Medicine',           inst: 'UCT',             aps: 45, p: 'direct'     },
  { name: 'BCom Finance',             inst: 'SUN',             aps: 36, p: 'direct'     },
  { name: 'BEng Chemical',            inst: 'UP',              aps: 38, p: 'direct'     },
  { name: 'BSc Data Science',         inst: 'UCT',             aps: 39, p: 'direct'     },
  { name: 'BA Psychology',            inst: 'UJ',              aps: 30, p: 'direct'     },
  { name: 'BCom Accounting',          inst: 'UNISA',           aps: 32, p: 'direct'     },
  { name: 'BSc Computer Sci (Ext)',   inst: 'Wits',            aps: 32, p: 'extended'   },
  { name: 'BEng Mechanical (Ext)',    inst: 'UCT',             aps: 30, p: 'extended'   },
  { name: 'BCom (Ext)',               inst: 'NMU',             aps: 28, p: 'extended'   },
  { name: 'BSc Biological Sci (Ext)', inst: 'RU',              aps: 30, p: 'extended'   },
  { name: 'BCom Foundation',          inst: 'UJ',              aps: 26, p: 'foundation' },
  { name: 'BSc Foundation',           inst: 'UFS',             aps: 24, p: 'foundation' },
  { name: 'BHSc Foundation',          inst: 'UWC',             aps: 28, p: 'foundation' },
  { name: 'Dip · Information Tech',   inst: 'TVET Ekurhuleni', aps: 22, p: 'tvet'       },
  { name: 'Dip · Mechatronics',       inst: 'TVET Tshwane',    aps: 24, p: 'tvet'       },
  { name: 'NCV · Engineering',        inst: 'TVET False Bay',  aps: 18, p: 'tvet'       },
];

const INIT_SUBJECTS = [
  { id: 's1', name: 'Mathematics',        pct: 78, isLO: false },
  { id: 's2', name: 'English Home Lang.', pct: 62, isLO: false },
  { id: 's3', name: 'Physical Sciences',  pct: 71, isLO: false },
  { id: 's4', name: 'Life Sciences',      pct: 80, isLO: false },
  { id: 's5', name: 'Geography',          pct: 66, isLO: false },
  { id: 's6', name: 'isiZulu FAL',        pct: 74, isLO: false },
  { id: 's7', name: 'Life Orientation',   pct: 70, isLO: true  },
];

const SCENARIOS = {
  actuary: { role: 'an actuarial analyst',       company: ' Old Mutual',    salary: ' R 42,800/mo' },
  doctor:  { role: 'a medical doctor',           company: ' Groote Schuur', salary: ' R 58,200/mo' },
  tech:    { role: 'a mechatronics technician',  company: ' SAB Miller',    salary: ' R 24,500/mo' },
};

type ScenarioKey = keyof typeof SCENARIOS;

const DIAL_CIRC = 2 * Math.PI * 42;
const DIAL_USABLE = DIAL_CIRC * 0.75;

export default function LandingPage() {
  /* ── APS calculator state ── */
  const [subjects, setSubjects] = useState(INIT_SUBJECTS.map(s => ({ ...s })));
  const [masterScrub, setMasterScrub] = useState(42);

  const aps = subjects.reduce((sum, s) => sum + pctToPoints(s.pct), 0);
  const counts = pathwayCounts(aps);
  const total = counts.direct + counts.extended + counts.foundation + counts.tvet;
  const dialFrac = Math.max(0, Math.min(1, (aps - 18) / (49 - 18)));
  const dialOffset = DIAL_CIRC - DIAL_USABLE * dialFrac;
  const apsPct = Math.max(8, Math.min(96, Math.round((aps - 18) * 3.5)));
  const fundingK = Math.max(120, 280 + (aps - 24) * 14);
  const fundSources = Math.max(2, Math.min(14, Math.round(aps / 4)));
  const careerCount = Math.max(3, Math.min(28, Math.round((aps - 18) * 1.1)));
  const career = pickCareer(aps);

  let apsDescr = 'broad shortlist available';
  if (aps >= 36) apsDescr = 'strong direct-entry profile';
  else if (aps >= 30) apsDescr = 'wide eligibility · consider extended';
  else if (aps >= 24) apsDescr = 'foundation & TVET routes open';
  else apsDescr = 'TVET pathways · foundation possible';

  const dialColor = aps >= 38 ? 'hsl(152 55% 36%)' : aps >= 30 ? 'hsl(22 88% 52%)' : 'hsl(18 82% 44%)';

  const eligibleProgs = PROGRAMMES
    .filter(p => p.aps <= aps + 2)
    .sort((a, b) => b.aps - a.aps)
    .slice(0, 6);

  /* ── Master scrub ── */
  const handleMasterScrub = useCallback((val: number) => {
    setMasterScrub(val);
    const avgPts = val / 7;
    const ptToPct: Record<number, number> = { 1: 25, 2: 35, 3: 45, 4: 55, 5: 65, 6: 75, 7: 88 };
    const lo = Math.floor(avgPts);
    const hi = Math.ceil(avgPts);
    const baseLo = ptToPct[Math.max(1, Math.min(7, lo))] ?? 25;
    const baseHi = ptToPct[Math.max(1, Math.min(7, hi))] ?? 88;
    const mix = avgPts - lo;
    const basePct = baseLo + (baseHi - baseLo) * mix;
    const offsets = [4, -3, 2, 5, -2, 3, -4];
    setSubjects(prev => prev.map((s, idx) => ({
      ...s,
      pct: Math.max(0, Math.min(100, Math.round(basePct + (offsets[idx] ?? 0)))),
    })));
  }, []);

  /* ── Future-You scenario ── */
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('actuary');
  const [futureRole, setFutureRole] = useState(SCENARIOS.actuary.role);
  const [futureCompany, setFutureCompany] = useState(SCENARIOS.actuary.company);
  const [futureSalary, setFutureSalary] = useState(SCENARIOS.actuary.salary);

  const selectScenario = useCallback((key: ScenarioKey) => {
    setActiveScenario(key);
    const s = SCENARIOS[key];
    setFutureRole('');
    setFutureCompany('');
    setFutureSalary('');
    const tweenText = (setter: (v: string) => void, text: string, delay: number) => {
      setTimeout(() => {
        const start = performance.now();
        const dur = 600;
        function step(now: number) {
          const t = Math.min(1, (now - start) / dur);
          setter(text.slice(0, Math.floor(text.length * t)));
          if (t < 1) requestAnimationFrame(step);
          else setter(text);
        }
        requestAnimationFrame(step);
      }, delay);
    };
    tweenText(setFutureRole, s.role, 50);
    tweenText(setFutureCompany, s.company, 300);
    tweenText(setFutureSalary, s.salary, 600);
  }, []);

  /* ── Mobile nav ── */
  const [navOpen, setNavOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setNavOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /* ── Scroll-spy: track active section for nav highlight ── */
  const [activeSection, setActiveSection] = useState('');
  useEffect(() => {
    const ids = ['how', 'pathways', 'programmes', 'cockpit', 'pricing'];
    const els = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }); },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ── APS threshold crossing feedback ── */
  const prevApsRef = useRef(aps);
  const [apsFlash, setApsFlash] = useState<string | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const thresholds = [
      { at: 44, label: 'Medicine · top direct-entry range' },
      { at: 40, label: 'Actuarial / Engineering unlocked' },
      { at: 36, label: 'Strong direct-entry profile' },
      { at: 30, label: 'Wide eligibility unlocked' },
      { at: 24, label: 'Foundation routes open' },
    ];
    const prev = prevApsRef.current;
    const crossed = thresholds.find(t => (prev < t.at && aps >= t.at) || (prev >= t.at && aps < t.at));
    prevApsRef.current = aps;
    if (crossed) {
      setApsFlash(crossed.label);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      flashTimerRef.current = setTimeout(() => setApsFlash(null), 2500);
    }
  }, [aps]);

  /* ── Mobile sticky CTA visibility ── */
  const [showStickyCta, setShowStickyCta] = useState(false);
  useEffect(() => {
    const hero = document.querySelector('.hero') as HTMLElement | null;
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setShowStickyCta(!e.isIntersecting), { threshold: 0.05 });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  /* ── Hero grid parallax ── */
  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;
    const hero = document.querySelector('.hero') as HTMLElement | null;
    if (!hero) return;
    const onMove = (e: MouseEvent) => {
      const x = ((e.clientX / window.innerWidth) - 0.5) * 18;
      const y = ((e.clientY / window.innerHeight) - 0.5) * 8;
      hero.style.setProperty('--grid-x', `${x}px`);
      hero.style.setProperty('--grid-y', `${y}px`);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  /* ── Live counter ── */
  const [liveCount, setLiveCount] = useState(12438);
  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() < 0.7) {
        setLiveCount(n => n + Math.floor(Math.random() * 3) + 1);
      }
    }, 2400);
    return () => clearInterval(id);
  }, []);

  /* ── Custom cursor ── */
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;
    document.body.classList.add('lp-cursor-active');
    const cur = cursorRef.current;
    const ring = ringRef.current;
    if (!cur || !ring) return;
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let rx = x, ry = y, cx = x, cy = y;
    const onMove = (e: MouseEvent) => { x = e.clientX; y = e.clientY; };
    const onLeave = () => { cur.style.opacity = '0'; ring.style.opacity = '0'; };
    const onEnter = () => { cur.style.opacity = '1'; ring.style.opacity = '0.5'; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    let rafId: number;
    function tick() {
      cx += (x - cx) * 0.55;
      cy += (y - cy) * 0.55;
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (cur) cur.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      if (ring) ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(tick);
    }
    tick();
    const addHover = (el: Element) => {
      el.addEventListener('mouseenter', () => { cur.classList.add('is-hover'); ring.classList.add('is-hover'); });
      el.addEventListener('mouseleave', () => { cur.classList.remove('is-hover'); ring.classList.remove('is-hover'); });
    };
    document.querySelectorAll('a, button, input, label, [data-hover]').forEach(addHover);
    const onDown = () => cur.classList.add('is-drag');
    const onUp = () => cur.classList.remove('is-drag');
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.body.classList.remove('lp-cursor-active');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(rafId);
    };
  }, []);

  /* ── Scroll reveal ── */
  useEffect(() => {
    const els = document.querySelectorAll('.lp .reveal-up, .lp .reveal-line, .lp [data-count]');
    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting || seen.has(e.target)) return;
        seen.add(e.target);
        if (e.target.classList.contains('reveal-up')) {
          e.target.classList.add('in');
          e.target.querySelectorAll('.reveal-line').forEach(l => l.classList.add('in'));
        }
        if (e.target.classList.contains('reveal-line')) e.target.classList.add('in');
        if (e.target.hasAttribute('data-count')) {
          const end = parseFloat(e.target.getAttribute('data-count') ?? '0');
          const fmt = e.target.getAttribute('data-fmt') ?? 'plain';
          const dur = 1400;
          const start = performance.now();
          const el = e.target as HTMLElement;
          function step(now: number) {
            const t = Math.min(1, (now - start) / dur);
            const v = end * (1 - Math.pow(1 - t, 3));
            if (fmt === 'comma') el.textContent = Math.round(v).toLocaleString();
            else if (fmt === 'pct') el.textContent = Math.round(v) + '%';
            else if (fmt === 'dec') el.textContent = v.toFixed(1);
            else if (fmt === 'zar-bn') el.textContent = 'R ' + v.toFixed(1) + 'bn';
            else el.textContent = Math.round(v).toLocaleString();
            if (t < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        }
      });
    }, { threshold: 0.15 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ── Pathway rail drag ── */
  const railRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let isDown = false, startX = 0, scrollLeft = 0;
    const onDown = (e: MouseEvent) => {
      isDown = true; rail.classList.add('dragging');
      startX = e.pageX - rail.offsetLeft;
      scrollLeft = rail.scrollLeft;
    };
    const onUp = () => { isDown = false; rail.classList.remove('dragging'); };
    const onMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - rail.offsetLeft;
      rail.scrollLeft = scrollLeft - (x - startX) * 1.4;
    };
    rail.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    rail.addEventListener('mouseleave', onUp);
    rail.addEventListener('mousemove', onMove);
    return () => {
      rail.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      rail.removeEventListener('mouseleave', onUp);
      rail.removeEventListener('mousemove', onMove);
    };
  }, []);

  const fmtCount = liveCount.toLocaleString();

  return (
    <div className="lp">
      <a className="skip-link" href="#main-content">Skip to main content</a>

      {/* Custom cursor */}
      <div className="lp-cursor" ref={cursorRef} aria-hidden="true" />
      <div className="lp-cursor-ring" ref={ringRef} aria-hidden="true" />

      {/* ── NAV ── */}
      <header className="nav">
        <div className="container nav-row">
          <Link href="/" className="brand" data-hover="" aria-label="Prospectus home">
            <div className="brand-mark" aria-hidden="true">P</div>
            <span className="brand-name">Prospectus</span>
            <span className="brand-tag">built in SA · est. 2026</span>
          </Link>
          <nav className="nav-links" aria-label="Site navigation">
            <a href="#how" data-hover="" className={activeSection === 'how' ? 'nav-active' : ''}>The problem</a>
            <a href="#pathways" data-hover="" className={activeSection === 'pathways' ? 'nav-active' : ''}>Pathways</a>
            <a href="#programmes" data-hover="" className={activeSection === 'programmes' ? 'nav-active' : ''}>Programmes</a>
            <a href="#cockpit" data-hover="" className={activeSection === 'cockpit' ? 'nav-active' : ''}>The cockpit</a>
            <a href="#pricing" data-hover="" className={activeSection === 'pricing' ? 'nav-active' : ''}>Pricing</a>
          </nav>
          <div className="nav-cta">
            <Link href="/login" className="btn btn-ghost btn-sm" data-hover="">Sign in</Link>
            <Link href="/signup" className="btn btn-primary btn-sm" data-hover="">Start free <span className="arr" aria-hidden="true">→</span></Link>
            <button
              className="nav-mob-btn"
              aria-expanded={navOpen}
              aria-controls="mobile-nav"
              aria-label={navOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setNavOpen(v => !v)}
            >
              <span className="bar" aria-hidden="true" />
              <span className="bar" aria-hidden="true" />
              <span className="bar" aria-hidden="true" />
            </button>
          </div>
        </div>
        <nav
          id="mobile-nav"
          className={`nav-drawer${navOpen ? ' open' : ''}`}
          aria-label="Mobile navigation"
          aria-hidden={!navOpen}
        >
          <a href="#how" onClick={() => setNavOpen(false)}>The problem</a>
          <a href="#pathways" onClick={() => setNavOpen(false)}>Pathways</a>
          <a href="#programmes" onClick={() => setNavOpen(false)}>Programmes</a>
          <a href="#cockpit" onClick={() => setNavOpen(false)}>The cockpit</a>
          <a href="#pricing" onClick={() => setNavOpen(false)}>Pricing</a>
          <div className="drawer-divider" aria-hidden="true" />
          <Link href="/programmes" className="btn btn-outline" style={{ justifyContent: 'space-between' }} onClick={() => setNavOpen(false)}>
            Browse all 9,412 programmes <span aria-hidden="true">→</span>
          </Link>
          <div className="drawer-cta">
            <Link href="/login" className="btn btn-outline" onClick={() => setNavOpen(false)}>Sign in</Link>
            <Link href="/signup" className="btn btn-primary" onClick={() => setNavOpen(false)}>Start free <span aria-hidden="true">→</span></Link>
          </div>
        </nav>
        <div className="container live-strip" aria-hidden="true">
          <span><span className="pulse" /> Live</span>
          <span>·</span>
          <span><span className="live-counter tabular">{fmtCount}</span> futures rendered this month</span>
          <span className="sep">·</span>
          <span>v1.4.1</span>
          <span className="sep">·</span>
          <span>Last sync: 04:12 SAST</span>
          <span className="sep">·</span>
          <span>9 provinces · 26 universities · 50 TVET</span>
        </div>
      </header>

      <main id="main-content">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="container">
          <div className="hero-top">
            <div className="l">
              <span className="pulse" />
              <span>For matric 2026 · applications open</span>
              <span>·</span>
              <span>ZAR · English · isiZulu · Sesotho</span>
            </div>
            <div className="r">
              <span className="counter tabular">{fmtCount}</span> futures rendered this month
            </div>
          </div>

          <h1 className="mega hero-h1">
            <span className="row">
              <span className="word"><span>Marks</span></span>
              {' '}
              <span className="word d2"><span>in.</span></span>
              {' '}<span className="accent-bar" aria-hidden="true" />
            </span>
            <span className="row">
              <span className="word d3"><span className="serif">Future</span></span>
              {' '}
              <span className="word d4"><span>out.</span></span>
            </span>
          </h1>

          <p className="hero-sub text-pretty">
            South Africa&apos;s only platform that turns your matric marks into a list of programmes you&apos;ll actually get into, the funding to pay for them, and the careers they lead to — <em>connected, in one place, in under sixty seconds.</em>
          </p>

          <div className="hero-actions">
            <a href="#renderer" className="btn btn-primary btn-lg" data-hover="">Render my future <span className="arr">→</span></a>
            <a href="#cockpit" className="btn btn-outline btn-lg" data-hover="">See the cockpit</a>
            <span className="micro">No sign-up · no card · result in &lt;60s</span>
          </div>

          {/* ── THE FUTURE RENDERER ── */}
          <div className="renderer" id="renderer">
            <div className="rend-head">
              <div className="l">
                <span className="dots"><i /><i /><i /></span>
                <span>prospectus.co.za / future-renderer</span>
              </div>
              <div className="r">
                <span className="live"><i /> live</span>
                <span>·</span>
                <span>drag the sliders</span>
              </div>
            </div>

            {/* LEFT — subjects */}
            <div className="rend-left">
              <h4>
                <span>Your matric marks</span>
                <span className="hint">7 subjects · % out of 100</span>
              </h4>

              <div className="scrub-block">
                <div className="lbl">
                  <span>Master scrub <em>· sweep your future</em></span>
                  <span><span className="tabular">{masterScrub}</span> APS</span>
                </div>
                <input
                  type="range" className="master" min={20} max={49} step={1}
                  value={masterScrub}
                  onChange={e => handleMasterScrub(Number(e.target.value))}
                  aria-label="Master APS scrub"
                />
                <div className="scrub-marks">
                  <span>TVET</span><span>Foundation</span><span>Extended</span><span>Direct</span>
                </div>
              </div>

              <div className="subjects">
                {subjects.map((s, idx) => (
                  <div key={s.id} className="subj-row">
                    <div className="nm">
                      {s.name}
                      {s.isLO && <span className="grade">LO</span>}
                    </div>
                    <div className="mark-out">
                      <span className="tabular">{s.pct}%</span>
                      <span className="pts">{pctToPoints(s.pct)} pts</span>
                    </div>
                    <input
                      type="range" min={0} max={100} step={1} value={s.pct}
                      onChange={e => {
                        const next = [...subjects];
                        next[idx] = { ...next[idx], pct: Number(e.target.value) };
                        setSubjects(next);
                      }}
                      aria-label={s.name}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — dial + readouts */}
            <div className="rend-right">
              <div className="rend-dial">
                <div className="dial-wrap">
                  <div className="dial">
                    {apsFlash && (
                      <div className="aps-flash" role="status" aria-live="polite">{apsFlash}</div>
                    )}
                    <svg viewBox="0 0 100 100" aria-hidden="true">
                      <circle className="track" cx="50" cy="50" r="42"
                        strokeDasharray="197.92" strokeDashoffset="65.97" />
                      <circle className="fill" cx="50" cy="50" r="42"
                        strokeDasharray={DIAL_CIRC}
                        strokeDashoffset={dialOffset}
                        style={{ stroke: dialColor, transition: 'stroke-dashoffset .5s cubic-bezier(.2,.8,.2,1), stroke .6s ease' }}
                      />
                    </svg>
                    <div className="center">
                      <div className="lbl">APS</div>
                      <div className="val tabular">{aps}</div>
                      <div className="out">/ 49</div>
                    </div>
                  </div>
                  <div className="dial-meta">
                    <div className="descr">
                      Above threshold for <strong>{apsPct}%</strong> of programmes <span className="arrow">→</span><br />
                      <span>{apsDescr}</span>
                    </div>
                    <div className="dsub sub">Calculated against every accredited SA university and TVET, against this year&apos;s published requirements.</div>
                  </div>
                </div>
              </div>

              <div className="rend-rows">
                <div className="rend-row">
                  <div className="rl">
                    <div className="ttl">Programmes you can study</div>
                    <div className="rsub">
                      <span className="badge badge-pw-direct" style={{ height: 18, fontSize: '0.625rem', padding: '0 0.4rem' }}>D {counts.direct}</span>
                      {' '}
                      <span className="badge badge-pw-extended" style={{ height: 18, fontSize: '0.625rem', padding: '0 0.4rem' }}>E {counts.extended}</span>
                      {' '}
                      <span className="badge badge-pw-foundation" style={{ height: 18, fontSize: '0.625rem', padding: '0 0.4rem' }}>F {counts.foundation}</span>
                      {' '}
                      <span className="badge badge-pw-tvet" style={{ height: 18, fontSize: '0.625rem', padding: '0 0.4rem' }}>T {counts.tvet}</span>
                    </div>
                  </div>
                  <div className="rr">
                    <div className="v tabular">{total}</div>
                    <div className="rbar">
                      <span className="bd" style={{ flexGrow: counts.direct }} />
                      <span className="be" style={{ flexGrow: counts.extended }} />
                      <span className="bf" style={{ flexGrow: counts.foundation }} />
                      <span className="bt" style={{ flexGrow: counts.tvet }} />
                    </div>
                  </div>
                </div>

                <div className="rend-row success">
                  <div className="rl">
                    <div className="ttl">Funding matched to you</div>
                    <div className="rsub">across <strong>{fundSources} sources</strong> · NSFAS + private bursaries · ranked by fit</div>
                  </div>
                  <div className="rr">
                    <div className="v tabular">{formatK(fundingK)}</div>
                  </div>
                </div>

                <div className="rend-row">
                  <div className="rl">
                    <div className="ttl">Career trajectories</div>
                    <div className="rsub">Top match: <strong>{career.c.replace(/^(a |an )/, '').replace(/^./, ch => ch.toUpperCase())}</strong> · 10-yr growth <strong>{career.g}</strong></div>
                  </div>
                  <div className="rr">
                    <div className="v tabular">{careerCount}</div>
                  </div>
                </div>
              </div>

              {/* Future-You inside renderer */}
              <div className="future-you">
                <div className="future-you-text">
                  In 2031 you are <span className="fy-accent">{career.c}</span>, earning <span className="fy-accent">{career.s}</span>, with a degree from <span className="fy-accent">{career.i}</span><span className="caret" />
                </div>
              </div>

              {/* Programme ticker */}
              <div className="rend-ticker">
                <div className="thead">Sample programmes you unlock at this APS — refreshes live</div>
                <div className="tlist">
                  {eligibleProgs.map((p, i) => (
                    <div key={`${p.name}-${i}`} className="titem" style={{ animationDelay: `${i * 0.04}s` }}>
                      <span className="tp">{p.name}</span>
                      <span className="tu">{p.inst} · APS {p.aps}</span>
                      <span className={`badge badge-pw-${p.p}`} style={{ height: 18, fontSize: '0.625rem', padding: '0 0.4rem' }}>
                        {p.p.charAt(0).toUpperCase() + p.p.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE: institutions dark ── */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {['UCT','Wits','Stellenbosch','UP','UKZN','UJ','Rhodes','UWC','NMU','NWU','UFS','UFH','CPUT','DUT','TUT','VUT','CUT','MUT','SMU','UNIVEN','UL','WSU','UNIZULU','UNISA','SPU','UMP',
            'UCT','Wits','Stellenbosch','UP','UKZN','UJ','Rhodes','UWC','NMU','NWU','UFS','UFH','CPUT','DUT','TUT','VUT','CUT','MUT','SMU','UNIVEN','UL','WSU','UNIZULU','UNISA','SPU','UMP',
          ].map((name, i) => (
            i % 26 === 25
              ? <span key={i} className="dot">●</span>
              : <span key={i}>{name}</span>
          ))}
        </div>
      </div>

      {/* ── INDEX STRIP ── */}
      <section aria-label="What we index">
        <div className="container" style={{ padding: 0 }}>
          <div className="indexed">
            {[
              { sup: 'Indexed', ix: '01', count: '9412',  fmt: 'comma',  label: 'Programmes across every accredited SA university & TVET — updated weekly.' },
              { sup: 'Indexed', ix: '02', count: '3.2',   fmt: 'zar-bn', label: 'In bursary, scholarship & NSFAS funding — scored to each student profile.' },
              { sup: 'Tracked', ix: '03', count: '324',   fmt: 'plain',  label: 'Careers with live demand, salary and 10-year growth projections.' },
              { sup: 'Latency', ix: '04', count: null,    fmt: null,     label: 'From first mark in, to a personalised strategy out. No sign-up needed.', val: '<60s' },
            ].map(item => (
              <div key={item.ix} className="idx reveal-up">
                <div className="sup"><span>{item.sup}</span><span className="ix">{item.ix}</span></div>
                {item.count
                  ? <div className="v" data-count={item.count} data-fmt={item.fmt!}>0</div>
                  : <div className="v">{item.val}</div>
                }
                <div className="l">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="section" id="how">
        <div className="container">
          <div className="rule reveal-up">
            <span className="num">01 / 04</span>
            <span className="rule-line reveal-line" />
            <span className="lbl">The information gap</span>
          </div>
          <div className="problem-grid" style={{ marginTop: '3rem' }}>
            <div className="reveal-up">
              <p className="pull text-pretty">
                A South African 17-year-old makes the <span className="em">most consequential decision of their life</span> with <span className="strike">eight tabs open</span> the worst information of any peer group on earth.
              </p>
              <div className="pull-meta">
                <span className="bar" />
                <span>DBE matric data · NSFAS reporting · StatsSA QLFS</span>
              </div>
            </div>

            <div>
              <div className="problem-rows">
                {[
                  {
                    ix: '01 · Admission', h: 'APS, blind.',
                    body: <>Admission is gated behind a score across six subjects. Most students don&apos;t know theirs until the application window has already <strong>closed</strong>.</>,
                    stat: <><div className="stat" data-count="74" data-fmt="pct">0%</div><div className="stat-label">of matric students nationally cannot correctly calculate their own APS in a single attempt.</div></>,
                  },
                  {
                    ix: '02 · Funding', h: 'Fragmented.',
                    body: <>NSFAS, hundreds of private bursaries, and institutional scholarships live in disconnected portals. Students miss opportunities they <strong>easily qualify for</strong>.</>,
                    stat: <><div className="stat">R<span data-count="1.4" data-fmt="dec">0</span>bn</div><div className="stat-label">in bursary funding sits unclaimed each cycle, by students who would have qualified.</div></>,
                  },
                  {
                    ix: '03 · Outcomes', h: 'Opaque.',
                    body: <>Labour-market data isn&apos;t surfaced where the choice happens. Degrees get picked on culture or parental pressure, not on what the <strong>economy is actually hiring</strong>.</>,
                    stat: <><div className="stat">1 in 3</div><div className="stat-label">graduates is unemployed 12 months post-graduation. The decision was made years before, on the wrong information.</div></>,
                  },
                ].map(row => (
                  <div key={row.ix} className="prow reveal-up">
                    <div className="ix">{row.ix}</div>
                    <div><h3>{row.h}</h3><p className="now">{row.body}</p></div>
                    <div>{row.stat}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PATHWAYS ── */}
      <section className="pathways section" id="pathways">
        <div className="pw-intro">
          <div className="container">
            <div className="rule reveal-up">
              <span className="num">02 / 04</span>
              <span className="rule-line reveal-line" />
              <span className="lbl">Pathway taxonomy · signature</span>
            </div>
            <h2 className="display reveal-up text-balance" style={{ marginTop: '2rem' }}>
              Every programme classified.<br />Every door <span className="serif">visible</span>.
            </h2>
            <p className="sub reveal-up text-pretty">
              South African tertiary has four entry pathways — and no one tells students which programmes belong to which. We tag every programme, plainly. All four doors, at once.
            </p>
            <div className="pw-scroll-hint">
              <span>Drag to explore</span>
              <span className="parr" />
            </div>
          </div>
        </div>

        <div className="pw-rail" ref={railRef} id="pwRail">
          <div className="pw-rail-inner">
            {[
              {
                cls: 'pd', glyph: 'D', num: '01', count: '30 of 100 programmes',
                title: 'Direct entry',
                lede: "You meet the APS, subject and language requirements. Apply, get in, start in year one. The fastest route — but not the only good one.",
                aps: '34–46', dur: '3 years', rate: '71%', fund: 'Yes · NSFAS + bursaries',
              },
              {
                cls: 'pe', glyph: 'E', num: '02', count: '26 of 100 programmes',
                title: 'Extended curriculum',
                lede: 'Same degree, four years instead of three. Built-in academic support for borderline APS students — and a higher graduation rate than direct entry for that cohort.',
                aps: '28–34', dur: '4 years', rate: '68%', fund: 'Yes · NSFAS + bursaries',
              },
              {
                cls: 'pf', glyph: 'F', num: '03', count: '18 of 100 programmes',
                title: 'Foundation year',
                lede: "A bridging year that gets you to the same degree. Most major universities run them, most students don't know they exist. A door, not a detour.",
                aps: '24–30', dur: '4–5 years', rate: '62%', fund: 'Yes · NSFAS covers',
              },
              {
                cls: 'pt', glyph: 'T', num: '04', count: '26 of 100 programmes',
                title: 'TVET / FET',
                lede: "Vocational diplomas, often higher employment outcomes than degrees. NSFAS covers them fully. They're not \"plan B\" — for many careers, they're plan A.",
                aps: '18–28', dur: '2–3 years', rate: '82%', fund: 'Yes · NSFAS fully covers',
              },
            ].map(card => (
              <article key={card.cls} className={`pw-card ${card.cls}`} data-hover="">
                <span className="glyph">{card.glyph}</span>
                <div>
                  <div className="num"><span>Pathway · {card.num}</span><span>{card.count}</span></div>
                  <h3>{card.title}</h3>
                  <p className="lede">{card.lede}</p>
                </div>
                <div className="meta">
                  <div className="ln big"><span className="k">Avg APS</span><span className="v">{card.aps}</span></div>
                  <div className="ln"><span className="k">Duration</span><span className="v">{card.dur}</span></div>
                  <div className="ln"><span className="k">{card.cls === 'pt' ? 'Employment 12 mo' : 'Throughput rate'}</span><span className="v">{card.rate}</span></div>
                  <div className="ln"><span className="k">Funding eligible</span><span className="v">{card.fund}</span></div>
                </div>
              </article>
            ))}
            <article className="pw-card coda">
              <div className="coda-eyebrow">Coda</div>
              <h4>The taxonomy is the index. The index is the product.</h4>
              <p>These four badges appear next to every programme on the platform. Filter by them, compare across them, sort funding against them.</p>
              <Link href="/programmes" className="btn" data-hover="">Browse all programmes <span className="arr">→</span></Link>
            </article>
          </div>
        </div>
      </section>

      {/* ── PROGRAMMES TEASER ── */}
      <section className="section" id="programmes">
        <div className="container">
          <div className="rule reveal-up">
            <span className="num">03 / 05</span>
            <span className="rule-line reveal-line" />
            <span className="lbl">Programmes · the index</span>
          </div>
          <div className="prg-teaser-grid">
            <div className="reveal-up">
              <h2 className="heading text-balance" style={{ marginTop: '1.5rem' }}>
                9,412 programmes.<br />One <span className="serif">index</span>.
              </h2>
              <p className="sub text-pretty" style={{ marginTop: '1.25rem', maxWidth: '38rem' }}>
                Every accredited programme in SA, tagged by pathway, ranked by fit to your profile. The directory is just the entry point.
              </p>
              <div className="prg-teaser-actions reveal-up">
                <Link href="/programmes" className="btn btn-primary" data-hover="">
                  Browse all programmes <span className="arr">→</span>
                </Link>
              </div>
            </div>
            <div className="prg-mini-table reveal-up">
              <div className="prg-mini-head">
                <span>Programme</span>
                <span>Institution</span>
                <span>APS</span>
                <span>Type</span>
              </div>
              {PROGRAMMES.sort((a, b) => b.aps - a.aps).slice(0, 6).map((p, i) => (
                <div key={i} className="prg-mini-row">
                  <div className="nm">{p.name}</div>
                  <div className="inst">{p.inst}</div>
                  <div className="aps tabular">{p.aps}</div>
                  <span className={`badge badge-pw-${p.p}`} style={{ fontSize: '0.625rem', padding: '2px 6px' }}>
                    {p.p.charAt(0).toUpperCase()}
                  </span>
                </div>
              ))}
              <div className="prg-mini-cta">
                <Link href="/programmes" data-hover="">
                  <span>View all 9,412 programmes</span>
                  <span className="arr">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE: programmes light ── */}
      <div className="marquee light" aria-hidden="true">
        <div className="marquee-track">
          {[
            'BSc Computer Science · UCT · APS 38','MBChB Medicine · UCT · APS 45',
            'BCom Finance · Stellenbosch · APS 36','BEng Chemical · UP · APS 38',
            'BSc Actuarial · Wits · APS 40','BA Law · UCT · APS 39',
            'BSc Data Science · UCT · APS 39','BCom Accounting · UNISA · APS 32',
            'BSc Eng Electrical · UKZN · APS 38','Dip Information Tech · TVET Ekurhuleni · APS 22',
            'BEd Foundation Phase · UWC · APS 28','BSocSci Politics · Rhodes · APS 34',
            'Dip Mechatronics · TVET Tshwane · APS 24',
            'BSc Computer Science · UCT · APS 38','MBChB Medicine · UCT · APS 45',
            'BCom Finance · Stellenbosch · APS 36','BEng Chemical · UP · APS 38',
            'BSc Actuarial · Wits · APS 40','BA Law · UCT · APS 39',
            'BSc Data Science · UCT · APS 39','BCom Accounting · UNISA · APS 32',
            'BSc Eng Electrical · UKZN · APS 38','Dip Information Tech · TVET Ekurhuleni · APS 22',
            'BEd Foundation Phase · UWC · APS 28','BSocSci Politics · Rhodes · APS 34',
            'Dip Mechatronics · TVET Tshwane · APS 24',
          ].map((prog, i) => (
            <span key={i}>{prog}</span>
          ))}
        </div>
      </div>

      {/* ── FUTURE-YOU SCENE ── */}
      <section className="future-scene" id="future-scene">
        <div className="container">
          <div className="eyebrow reveal-up"><span className="dot" />The Future-You projection · live preview</div>
          <p className="fhead reveal-up">Run the projection — pick a profile:</p>

          <p className="typing reveal-up">
            <span>In 2031 you are </span>
            <span className="fs-accent">{futureRole}</span>
            <span> at</span>
            <span className="fs-accent">{futureCompany}</span>
            <span>, earning</span>
            <span className="fs-accent">{futureSalary}</span>
            <span>.</span>
            <span className="caret" />
          </p>

          <div className="scenarios" role="group" aria-label="Future-You scenarios">
            {(Object.entries(SCENARIOS) as [ScenarioKey, typeof SCENARIOS[ScenarioKey]][]).map(([key]) => (
              <div
                key={key}
                className={`scen-card${activeScenario === key ? ' active' : ''}`}
                onClick={() => selectScenario(key)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectScenario(key); } }}
                role="button"
                tabIndex={0}
                aria-pressed={activeScenario === key}
                data-hover=""
              >
                <div className="sk">Scenario · {key === 'actuary' ? 'A' : key === 'doctor' ? 'B' : 'C'}</div>
                <div className="snm">
                  {key === 'actuary' ? 'Direct → Actuarial Sci → Old Mutual'
                   : key === 'doctor' ? 'Foundation → Medicine → public hospital'
                   : 'TVET → Mechatronics → SAB Miller'}
                </div>
                <div className="ssub">
                  {key === 'actuary' ? 'APS 42 · BSc Actuarial · Wits'
                   : key === 'doctor' ? 'APS 36 · MBChB · UFS'
                   : 'APS 24 · Dip Mechatronics · Tshwane'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COCKPIT ── */}
      <section className="section" id="cockpit">
        <div className="container">
          <div className="rule reveal-up">
            <span className="num">04 / 05</span>
            <span className="rule-line reveal-line" />
            <span className="lbl">The student cockpit · 36 pages</span>
          </div>

          <div className="cockpit-call">
            <div className="reveal-up">
              <h2 className="display text-balance" style={{ marginTop: '1.5rem' }}>
                A decision cockpit,<br /><span className="serif">not a directory</span>.
              </h2>
              <p className="cbody">
                After sixty seconds in the renderer, sign up free and get the full surface. Thirty-six interconnected pages organised around the only four jobs a matric student has: <em>plan, discover, fund, execute</em>. Every screen answers a question — or anticipates the next one.
              </p>
              <div className="feat-chips">
                {['APS calculator','Programme explorer','Academic simulator','NSFAS calculator','Funding strategy','Career compare','Application tracker','Documents vault','Deadlines','Skills map','Opportunity map','Future-You simulator'].map(chip => (
                  <span key={chip} data-hover="">{chip}</span>
                ))}
              </div>
            </div>
            <div className="reveal-up">
              <div className="rule" style={{ marginBottom: '1.25rem' }}>
                <span className="lbl" style={{ color: 'hsl(var(--accent-600))' }}>A typical Tuesday for Lerato</span>
                <span className="rule-line" />
              </div>
              <p className="text-mute" style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
                APS sits at 42. Four applications in flight. R 412k of funding matched. The dashboard is a calm operating surface, not a marketing brochure — clarity over decoration, always.
              </p>
            </div>
          </div>

          <div className="cockpit reveal-up">
            <div className="cockpit-chrome" aria-hidden="true">
              <span className="cdots"><i /><i /><i /></span>
              <div className="curl"><span className="lock">●</span> prospectus.co.za / dashboard</div>
              <span className="clive"><i /> live</span>
            </div>
            <div className="cockpit-body">
              <aside className="ck-side">
                <div className="brand-sm">
                  <div className="bm">P</div>
                  <div>
                    <div style={{ fontWeight: 700, letterSpacing: '-0.02em', fontSize: '0.8125rem' }}>Prospectus</div>
                    <div style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace', fontSize: '0.625rem', color: 'hsl(var(--mute))' }}>student workspace</div>
                  </div>
                </div>
                {[
                  { grp: 'Plan', items: [{ label: 'Dashboard', act: true }, { label: 'APS & Eligibility' }, { label: 'Academic Simulator' }, { label: 'Programmes' }] },
                  { grp: 'Discover', items: [{ label: 'Career Explorer' }, { label: 'Career Compare' }, { label: 'Discover', badge: 'AI' }, { label: 'Opportunity Map' }] },
                  { grp: 'Fund', items: [{ label: 'Funding Strategy' }, { label: 'Scholarships', badge: '3 new' }, { label: 'NSFAS Calc' }] },
                  { grp: 'Execute', items: [{ label: 'Applications', badge: '4' }, { label: 'Documents' }, { label: 'Deadlines' }] },
                ].map(({ grp, items }) => (
                  <div key={grp} className="grp">
                    <div className="grp-l">{grp}</div>
                    {items.map(it => (
                      <div key={it.label} className={`it${(it as { act?: boolean }).act ? ' act' : ''}`}>
                        {it.label}
                        {(it as { badge?: string }).badge && <span className="b">{(it as { badge?: string }).badge}</span>}
                      </div>
                    ))}
                  </div>
                ))}
              </aside>

              <main className="ck-main">
                <div className="ck-greet">
                  <div>
                    <div style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace', fontSize: '0.6875rem', color: 'hsl(var(--mute))', letterSpacing: '0.04em' }}>Tuesday · 27 May 2026</div>
                    <div className="h">Welcome back, Lerato.</div>
                  </div>
                  <div className="meta"><strong>3 new</strong> scholarships matched overnight</div>
                </div>

                <div className="ck-kpis">
                  {[
                    { lbl: 'APS Score', v: '42', vSub: '/ 49', meter: 86, sub: <>Above threshold for <strong>73%</strong> of shortlist.</> },
                    { lbl: 'Eligible programmes', v: '187', badges: true },
                    { lbl: 'Funding matched', v: 'R 412k', vColor: 'hsl(var(--success))', sub: <>across <strong>9 sources</strong></> },
                    { lbl: 'Strategic Score', v: '74', vBadge: '↑ +6', sub: <>Best month yet.</> },
                  ].map((kpi, i) => (
                    <div key={i} className="ck-kpi">
                      <div className="lbl">{kpi.lbl}</div>
                      <div className="v" style={kpi.vColor ? { color: kpi.vColor } : {}}>
                        {kpi.v}
                        {kpi.vSub && <span style={{ fontSize: '0.6875rem', color: 'hsl(var(--mute))' }}> {kpi.vSub}</span>}
                        {kpi.vBadge && <span style={{ fontSize: '0.6875rem', color: 'hsl(var(--success))' }}> {kpi.vBadge}</span>}
                      </div>
                      {kpi.meter !== undefined && <div className="kmeter"><i style={{ width: `${kpi.meter}%` }} /></div>}
                      {kpi.badges && (
                        <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                          <span className="badge badge-pw-direct" style={{ height: 18, fontSize: '0.625rem', padding: '0 0.4rem' }}>112</span>
                          <span className="badge badge-pw-extended" style={{ height: 18, fontSize: '0.625rem', padding: '0 0.4rem' }}>54</span>
                          <span className="badge badge-pw-foundation" style={{ height: 18, fontSize: '0.625rem', padding: '0 0.4rem' }}>16</span>
                          <span className="badge badge-pw-tvet" style={{ height: 18, fontSize: '0.625rem', padding: '0 0.4rem' }}>5</span>
                        </div>
                      )}
                      {kpi.sub && <div className="ksub">{kpi.sub}</div>}
                    </div>
                  ))}
                </div>

                <div className="ck-row2">
                  <div className="ck-card">
                    <div className="ttl"><span>Shortlist · top fit</span><span className="sm">3 of 187</span></div>
                    <div className="ck-prog">
                      {[
                        { nm: 'BSc Computer Science', u: 'UCT · CT', aps: '42 / 38 ✓', type: 'direct', fee: 'R 76,420 /yr' },
                        { nm: 'BSc Actuarial Science', u: 'Wits · JHB', aps: '42 / 40 ✓', type: 'direct', fee: 'R 82,100 /yr' },
                        { nm: 'BSc Eng Chemical · Extended', u: 'SUN · Stell', aps: '42 / 32 ✓', type: 'extended', fee: 'R 71,890 /yr' },
                      ].map(p => (
                        <div key={p.nm} className="li">
                          <div><div className="nm">{p.nm}</div><div className="u">{p.u}</div></div>
                          <span className="aps">{p.aps}</span>
                          <span className={`badge badge-pw-${p.type}`} style={{ height: 18, fontSize: '0.625rem', padding: '0 0.4rem' }}>{p.type.charAt(0).toUpperCase() + p.type.slice(1)}</span>
                          <span style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace', fontSize: '0.6875rem', color: 'hsl(var(--mute))' }}>{p.fee}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="ck-card">
                    <div className="ttl"><span>Applications in flight</span><span className="sm">4 active</span></div>
                    <div className="ck-app">
                      {[
                        { l: 'UCT · BSc Comp Sci', sub: 'closes 30 Sep · docs complete', badge: 'Accepted', cls: 'badge-success' },
                        { l: 'Wits · Actuarial Sci', sub: 'closes 15 Oct · awaiting results', badge: 'Pending', cls: 'badge-accent' },
                        { l: 'NSFAS funding', sub: 'submitted 12 Aug · under review', badge: 'In review', cls: '', style: { background: 'hsl(var(--info) / 0.1)', color: 'hsl(var(--info))', borderColor: 'hsl(var(--info) / 0.25)' } },
                        { l: 'SUN · BCom Finance', sub: 'closes 30 Sep · APS shortfall', badge: 'Rejected', cls: '', style: { background: 'hsl(0 72% 45% / 0.1)', color: 'hsl(0 72% 45%)', borderColor: 'hsl(0 72% 45% / 0.25)' } },
                      ].map((app, i) => (
                        <div key={i} className="li">
                          <div><span className="al">{app.l}</span><span className="asub">{app.sub}</span></div>
                          <span className={`badge ${app.cls}`} style={{ height: 20, fontSize: '0.625rem', ...(app as { style?: React.CSSProperties }).style }}>{app.badge}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </section>

      {/* ── PERSONA + FLOW ── */}
      <section className="persona-band">
        <div className="container section">
          <div className="rule reveal-up" style={{ marginBottom: '3rem' }}>
            <span className="num">05 / 05</span>
            <span className="rule-line reveal-line" />
            <span className="lbl">Designed for one student · Lerato</span>
          </div>

          <div className="persona-grid">
            <div className="reveal-up">
              <div className="portrait">
                <div className="pstripe" />
                <div className="pface" />
                <div className="pcorner">portrait · 1 of 1</div>
                <div className="plabel">Lerato M. · 17 · Limpopo</div>
              </div>
            </div>

            <div className="persona-text reveal-up">
              <div className="eyebrow"><span className="dot" />Core persona · the student</div>
              <h2 style={{ marginTop: '1.25rem' }}>
                Lerato arrives wanting to be a <span className="em">doctor</span>. She leaves with a <span className="em">strategy</span>.
              </h2>
              <p className="lead">She&apos;s 17, first in her family to consider university, strong in maths and life sciences, weaker in English. She lives 40 km from her closest internet point. APS is the most important number in her life — and right now, she has no idea what it is.</p>

              <div className="persona-cols">
                <div className="col arrived">
                  <h4>What she arrives with</h4>
                  <ul>
                    <li>Six matric marks &amp; a question</li>
                    <li>One trusted name (NSFAS), eight tabs of mistrust</li>
                    <li>Parental pressure to &ldquo;do medicine&rdquo;</li>
                    <li>R 0 for application fees</li>
                  </ul>
                </div>
                <div className="col left">
                  <h4>What she leaves with</h4>
                  <ul>
                    <li>Her APS &amp; 187 eligible programmes</li>
                    <li>A R 412k funding strategy — not a list</li>
                    <li>Three career trajectories, ranked by fit</li>
                    <li>A live application tracker, deadlines included</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '5rem' }} className="reveal-up">
            <div className="rule" style={{ marginBottom: '1.5rem' }}>
              <span className="lbl">How sixty seconds becomes a strategy</span>
              <span className="rule-line" />
            </div>
            <div className="flow">
              {[
                { n: 'STEP 01 · MARKS',       h: 'Marks in.',         p: 'Type provisional or final marks for six subjects. Life Orientation included. No account needed.', arr: true },
                { n: 'STEP 02 · ELIGIBILITY', h: 'Eligibility out.',   p: 'APS computed in real time. Every programme across 26 universities filtered to what you can actually study.', arr: true },
                { n: 'STEP 03 · FUNDING',     h: 'Funding matched.',   p: 'NSFAS, plus hundreds of bursaries and scholarships, scored against your profile — not a list, a strategy.', arr: true },
                { n: 'STEP 04 · CAREER',      h: 'Career projected.',  p: 'Live SA labour-market data on demand, salary and growth. Per career, per pathway, per province.', arr: false },
              ].map(s => (
                <div key={s.n} className="step">
                  <div className="sn">{s.n}</div>
                  <h4>{s.h}</h4>
                  <p>{s.p}</p>
                  {s.arr && <div className="sarr">→</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SA MAP ── */}
      <section className="section" id="about">
        <div className="container">
          <div className="sa-wrap">
            <div className="sa-map reveal-up" aria-label="Coverage map of South African institutions">
              <div className="mgrid" />
              <svg viewBox="0 0 500 400" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Map of South Africa showing Prospectus coverage across Cape Town, Gqeberha, Durban, Johannesburg, Pretoria, Bloemfontein and Polokwane">
                <path d="M70 200 Q75 130 130 100 Q190 70 260 75 Q330 80 380 110 Q440 145 445 215 Q450 290 395 330 Q330 365 250 360 Q170 355 115 320 Q70 285 70 200 Z"
                  fill="hsl(var(--bg-2))" stroke="hsl(var(--ink) / 0.5)" strokeWidth="1.5" strokeDasharray="3 4" />
                <ellipse cx="295" cy="250" rx="30" ry="20" fill="hsl(var(--bg))" stroke="hsl(var(--ink) / 0.3)" strokeWidth="1" strokeDasharray="2 3" />
                <g fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="hsl(var(--mute))">
                  <circle cx="130" cy="320" r="6" fill="hsl(var(--accent))" /><text x="142" y="324">Cape Town · 4 inst.</text>
                  <circle cx="285" cy="335" r="5" fill="hsl(var(--accent))" /><text x="297" y="339">Gqeberha · 2 inst.</text>
                  <circle cx="380" cy="280" r="6" fill="hsl(var(--accent))" /><text x="392" y="284">Durban · 3 inst.</text>
                  <circle cx="320" cy="180" r="9" fill="hsl(var(--accent))" /><text x="334" y="184">JHB / Pretoria · 8 inst.</text>
                  <circle cx="270" cy="240" r="5" fill="hsl(var(--accent))" /><text x="282" y="244">Bloemfontein · 2 inst.</text>
                  <circle cx="335" cy="115" r="5" fill="hsl(var(--accent))" /><text x="347" y="119">Polokwane · 1 inst.</text>
                  <circle cx="245" cy="160" r="4" fill="hsl(var(--accent))" opacity="0.7" />
                  <circle cx="380" cy="155" r="4" fill="hsl(var(--accent))" opacity="0.7" />
                  <circle cx="330" cy="320" r="4" fill="hsl(var(--accent))" opacity="0.7" />
                </g>
                <g fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="hsl(var(--mute))">
                  <text x="80" y="105">N · indexed nationally</text>
                  <line x1="80" y1="110" x2="80" y2="180" stroke="hsl(var(--line))" />
                </g>
              </svg>
              <div className="legend">
                <span><i />University / TVET node</span>
                <span style={{ opacity: 0.5 }}>·</span>
                <span>26 universities · 50 TVETs · 9 provinces</span>
              </div>
            </div>

            <div className="reveal-up">
              <div className="eyebrow"><span className="dot" />Built in South Africa, for South Africa</div>
              <h2 className="heading text-balance" style={{ marginTop: '1.25rem' }}>
                Not a borrowed app. Built on <span className="serif" style={{ color: 'hsl(var(--accent-600))' }}>DBE, NSFAS &amp; StatsSA</span> data — and rebuilt every week.
              </h2>
              <p className="sub text-pretty" style={{ marginTop: '1.5rem', maxWidth: '36rem' }}>
                Every programme requirement is sourced directly from the institution&apos;s calendar. Every bursary is reconciled against NSFAS reporting. Every career projection is anchored in StatsSA&apos;s Quarterly Labour Force Survey. We don&apos;t scrape — we partner.
              </p>
              <div className="sa-partners">
                <div className="pcol">
                  <div className="plbl">Data partners</div>
                  <div className="pval">DBE · NSFAS · USAf · StatsSA · CHE</div>
                </div>
                <div className="pcol">
                  <div className="plbl">Last reconciliation</div>
                  <div className="pval">24 May 2026 · 04:12 SAST</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUOTES ── */}
      <section className="section" aria-label="From students">
        <div className="container">
          <div className="rule reveal-up">
            <span className="num">—</span>
            <span className="rule-line reveal-line" />
            <span className="lbl">From students who already moved</span>
          </div>
          <div className="quotes reveal-up" style={{ marginTop: '3rem' }}>
            {[
              { q: "I thought I couldn't do medicine. Prospectus showed me three foundation routes I'd never heard of. I'm in second year now.", av: 'N', nm: 'Naledi K.', role: 'BSc · UFS · Foundation' },
              { q: "I got nine bursaries matched in one afternoon. I hadn't applied for a single one before — I didn't know they existed.", av: 'S', nm: 'Sipho M.', role: 'B Eng · NMU · Direct' },
              { q: "My parents wanted me to do law. The career data made it a conversation, not a fight. I'm now studying actuarial science with their full support.", av: 'T', nm: 'Thandi B.', role: 'BSc · Wits · Direct' },
            ].map(card => (
              <div key={card.nm} className="qcard" data-hover="">
                <p className="q">{card.q}</p>
                <div className="qa">
                  <div className="av">{card.av}</div>
                  <div>
                    <div className="nm">{card.nm}</div>
                    <div className="role">{card.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="section" id="pricing">
        <div className="container">
          <div className="rule reveal-up" style={{ marginBottom: '3rem' }}>
            <span className="lbl">Pricing · free for matric students, always</span>
            <span className="rule-line reveal-line" />
            <span className="num">07</span>
          </div>
          <h2 className="heading text-balance reveal-up" style={{ maxWidth: '32ch', marginBottom: '3rem' }}>
            Free for the people who need it most.<br /><span className="serif" style={{ color: 'hsl(var(--accent-600))' }}>Pro</span> for those who can pay it forward.
          </h2>

          <div className="pricing">
            <div className="plan reveal-up" data-hover="">
              <div className="plan-row">
                <h3>Free</h3>
                <span className="badge">Every matric student</span>
              </div>
              <div className="price">R 0<small>· forever</small></div>
              <ul>
                <li>APS calculator &amp; programme explorer — full database</li>
                <li>Funding matching — NSFAS + every public bursary</li>
                <li>Career explorer — demand, salary, projections</li>
                <li>Application tracker — up to 6 applications</li>
                <li>Cognitive assessment &amp; skills map</li>
              </ul>
              <Link href="/signup" className="btn btn-primary" style={{ alignSelf: 'start' }} data-hover="">Start free <span className="arr">→</span></Link>
              <div className="foot">No card. No expiry. Mobile-first, low-data-friendly.</div>
            </div>

            <div className="plan pro reveal-up" data-hover="">
              <div className="plan-row">
                <h3>Pro</h3>
                <span className="badge">Most chosen</span>
              </div>
              <div className="price">R 49<small>· per month</small></div>
              <ul>
                <li>Everything in Free, plus —</li>
                <li>Discover AI — personalised programme &amp; career recommendations</li>
                <li>Future-You simulator — 3, 5 &amp; 10-year trajectory projections</li>
                <li>Unlimited applications &amp; document vault</li>
                <li>Priority funding alerts — bursaries scored to you, before they open</li>
                <li>1-on-1 onboarding with an admissions advisor</li>
              </ul>
              <Link href="/signup" className="btn btn-accent" style={{ alignSelf: 'start' }} data-hover="">Try Pro · 14 days free <span className="arr">→</span></Link>
              <div className="foot">Cancel anytime · ZAR via Stripe · part of every fee subsidises a Free student.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="final">
        <div className="container">
          <div className="eyebrow reveal-up" style={{ color: 'hsl(var(--accent))' }}>
            <span className="dot" style={{ background: 'hsl(var(--accent))' }} />
            Open · Applications for 2027 close 30 September 2026
          </div>
          <h2 className="reveal-up" style={{ marginTop: '1.5rem' }}>
            Type your marks.<br /><span className="serif">Watch your future render.</span>
          </h2>
          <p className="sub reveal-up">No sign-up. No card. The full APS calculator and your first programme shortlist takes under sixty seconds. The strategy takes ten minutes more.</p>
          <div className="actions reveal-up">
            <a href="#renderer" className="btn btn-accent btn-lg" data-hover="">Render my future <span className="arr">→</span></a>
            <a href="#cockpit" className="btn btn-outline btn-lg" data-hover="">Tour the cockpit first</a>
            <span style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace', fontSize: '0.75rem', color: 'hsl(var(--bg) / 0.6)', marginLeft: '0.5rem' }}>
              ~58s median · {fmtCount} students this month
            </span>
          </div>

          <div className="final-grid">
            <div className="reveal-up">
              <h4>What we promise</h4>
              <p>Every programme, every bursary, every requirement — accurate to the source institution&apos;s most recent calendar. If we get it wrong, we tell you, we fix it, and we credit your Pro subscription for the inconvenience. Decisions this big deserve data this honest.</p>
            </div>
            <div className="reveal-up">
              <h4>What comes next</h4>
              <nav className="next" aria-label="Next steps">
                <a href="#renderer" data-hover=""><span>Render my future · 60 seconds</span><span className="arr">→</span></a>
                <a href="#cockpit" data-hover=""><span>Tour the student cockpit</span><span className="arr">→</span></a>
                <a href="#pricing" data-hover=""><span>Read the funding guide</span><span className="arr">→</span></a>
                <Link href="/signup" data-hover=""><span>For institutions — partner with us</span><span className="arr">→</span></Link>
              </nav>
            </div>
          </div>
        </div>
      </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-row">
            <Link href="/" className="brand" data-hover="">
              <div className="brand-mark">P</div>
              <span className="brand-name">Prospectus</span>
              <span className="brand-tag" style={{ color: 'hsl(var(--bg) / 0.6)', borderColor: 'hsl(var(--bg) / 0.2)' }}>marks → future</span>
            </Link>
            <div className="footer-links">
              {['Programmes','Bursaries','Career explorer','NSFAS guide','For institutions','About','Contact'].map(l => (
                <Link key={l} href="/signup" data-hover="">{l}</Link>
              ))}
            </div>
          </div>
          <div className="footer-meta">
            <span>© 2026 Prospectus · built in South Africa · v1.4.1</span>
            <span className="serif-tag">Marks in. Future out.</span>
          </div>
        </div>
      </footer>

      {/* ── MOBILE STICKY CTA ── */}
      <div className={`mob-cta${showStickyCta ? ' visible' : ''}`} aria-hidden={!showStickyCta}>
        <a href="#renderer" className="btn btn-accent">Render my future <span aria-hidden="true">→</span></a>
        <Link href="/signup" className="btn btn-primary">Sign up free</Link>
      </div>
    </div>
  );
}
