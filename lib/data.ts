import type {
  Subject,
  Programme,
  Application,
  Deadline,
  Scholarship,
  Capability,
  Career,
  BigFiveTrait,
  RiasecItem,
  Province,
} from './types';

export const SUBJECTS: Subject[] = [
  { id: 'eng',      name: 'English Home Language',  mark: 62, designated: true },
  { id: 'math',     name: 'Mathematics',             mark: 78, designated: true },
  { id: 'pscience', name: 'Physical Sciences',       mark: 71, designated: true },
  { id: 'lifesci',  name: 'Life Sciences',           mark: 74, designated: true },
  { id: 'history',  name: 'History',                 mark: 68, designated: true },
  { id: 'lo',       name: 'Life Orientation',        mark: 80, designated: false },
  { id: 'sesotho',  name: 'Sesotho HL',              mark: 84, designated: true },
];

export const PROGRAMMES: Programme[] = [
  { id: 'uct-cs',   name: 'BSc Computer Science',      uni: 'University of Cape Town',            aps: 38, fees: 76420, dur: 3, fit: 94, pathway: 'direct',     salary: 38500, demand: 'High' },
  { id: 'wits-act', name: 'BSc Actuarial Science',     uni: 'University of the Witwatersrand',    aps: 42, fees: 82100, dur: 3, fit: 88, pathway: 'direct',     salary: 45200, demand: 'High' },
  { id: 'sun-eng',  name: 'BSc Engineering (Mech.)',   uni: 'Stellenbosch University',            aps: 36, fees: 71800, dur: 4, fit: 81, pathway: 'extended',   salary: 36800, demand: 'High' },
  { id: 'cput-ict', name: 'NDip ICT (App Dev)',        uni: 'Cape Peninsula UoT',                 aps: 28, fees: 38200, dur: 3, fit: 76, pathway: 'tvet',       salary: 24500, demand: 'High' },
  { id: 'up-data',  name: 'BSc Data Science',          uni: 'University of Pretoria',             aps: 40, fees: 74100, dur: 3, fit: 85, pathway: 'direct',     salary: 41200, demand: 'High' },
  { id: 'ukzn-med', name: 'MBChB (Medicine)',          uni: 'UKZN',                               aps: 48, fees: 91500, dur: 6, fit: 41, pathway: 'direct',     salary: 52000, demand: 'High' },
  { id: 'sun-fin',  name: 'BCom Finance',              uni: 'Stellenbosch University',            aps: 44, fees: 68400, dur: 3, fit: 67, pathway: 'direct',     salary: 32400, demand: 'Med'  },
  { id: 'wits-eng', name: 'BSc Eng (Foundation Yr)',   uni: 'University of the Witwatersrand',    aps: 32, fees: 71200, dur: 5, fit: 72, pathway: 'foundation', salary: 36800, demand: 'High' },
];

export const APPS: Application[] = [
  { uni: 'UCT · BSc Computer Science',    meta: 'Submitted 14 Aug · APS 42 / 38 needed',                   stages: ['done','done','done','done'], status: 'success',     label: 'Accepted'  },
  { uni: 'Wits · BSc Actuarial Science',  meta: 'Submitted 22 Aug · awaiting matric finals',               stages: ['done','done','active',''],   status: 'warning',     label: 'Pending'   },
  { uni: 'NSFAS · Funding application',   meta: 'Submitted 12 Aug · documents under review',               stages: ['done','done','active',''],   status: 'info',        label: 'In review' },
  { uni: 'Stellenbosch · BCom Finance',   meta: 'APS shortfall · consider extended pathway',               stages: ['done','done','fail',''],     status: 'destructive', label: 'Rejected'  },
];

export const DEADLINES: Deadline[] = [
  { d: 29, m: 'Apr', t: 'NSFAS supporting docs',        sub: '2 days · required',          tag: 'destructive', tagL: 'Urgent' },
  { d: 5,  m: 'May', t: 'UCT residence application',    sub: '8 days',                     tag: 'warning',     tagL: 'Soon'   },
  { d: 11, m: 'May', t: 'Allan Gray Orbis essay',       sub: '14 days · 1,000 words',      tag: '',            tagL: 'Open'   },
  { d: 22, m: 'May', t: 'Wits portfolio submission',    sub: '25 days',                    tag: '',            tagL: 'Open'   },
];

export const SCHOLARSHIPS: Scholarship[] = [
  { name: 'Allan Gray Orbis Foundation', amount: 280000, match: 92, eligibility: 'Entrepreneurial intent · top 5% · interview',       deadline: '15 Oct 2026' },
  { name: 'Investec Bursary',            amount: 165000, match: 88, eligibility: 'Maths ≥ 75 · BCom/BSc · financial need',            deadline: '30 Sep 2026' },
  { name: 'Standard Bank Group',         amount: 142000, match: 81, eligibility: 'BCom Finance/Acc · APS ≥ 40',                       deadline: '30 Aug 2026' },
  { name: 'NRF Innovation Scholarship',  amount: 95000,  match: 74, eligibility: 'STEM · research interest',                          deadline: '12 Sep 2026' },
  { name: 'Sasol Bursary (Engineering)', amount: 198000, match: 68, eligibility: 'Engineering · service contract',                    deadline: '15 Aug 2026' },
];

export const CAPS: Capability[] = [
  { l: 'Analytical', v: 86 },
  { l: 'Technical',  v: 79 },
  { l: 'Social',     v: 71 },
  { l: 'Creative',   v: 62 },
  { l: 'Verbal',     v: 54 },
  { l: 'Numerical',  v: 88 },
  { l: 'Spatial',    v: 67 },
  { l: 'Practical',  v: 73 },
];

export const CAREERS: Career[] = [
  { rank: 1, name: 'Software Engineer',        match: 88, salary: 38500, growth: '+22%', demand: 'High', tags: ['STEM','Remote-friendly','Tech'],   why: 'Strong analytical (86) + numerical (88), top fit for your maths trajectory.' },
  { rank: 2, name: 'Data Scientist',           match: 85, salary: 41200, growth: '+18%', demand: 'High', tags: ['STEM','Hybrid','Analytics'],       why: 'Capability mix maps perfectly; growth sector in SA finance + telco.' },
  { rank: 3, name: 'Actuary',                  match: 82, salary: 45200, growth: '+9%',  demand: 'Med',  tags: ['Finance','Office','Accredited'],   why: 'High pay, your maths and stats fit, but long accreditation path.' },
  { rank: 4, name: 'Quantitative Analyst',     match: 78, salary: 48000, growth: '+12%', demand: 'Med',  tags: ['Finance','Hybrid'],                why: 'Premier salary band; competitive entry, niche to JSE-listed banks.' },
  { rank: 5, name: 'ML Engineer',              match: 76, salary: 42800, growth: '+25%', demand: 'High', tags: ['STEM','Remote'],                   why: 'Fastest-growing role; needs stronger CS foundation than maths.' },
  { rank: 6, name: 'Product Manager (Tech)',   match: 71, salary: 38000, growth: '+14%', demand: 'High', tags: ['Tech','Hybrid'],                   why: 'Verbal score (54) is a gap here; coachable through electives.' },
  { rank: 7, name: 'Civil Engineer',           match: 58, salary: 32400, growth: '+5%',  demand: 'Med',  tags: ['STEM','On-site'],                  why: 'Spatial fit OK; lower demand growth than software.' },
  { rank: 8, name: 'Doctor (MBChB)',           match: 41, salary: 52000, growth: '+7%',  demand: 'High', tags: ['STEM','Public'],                   why: 'High pay but APS, biology and verbal scores all need lifting.' },
];

export const BIG5: BigFiveTrait[] = [
  { l: 'Openness',          v: 78, lo: 'Conventional', hi: 'Inventive',    sub: 'Comfortable with novelty, abstract ideas.' },
  { l: 'Conscientiousness', v: 84, lo: 'Spontaneous',  hi: 'Organised',   sub: 'Plans well, follows through. Top quartile.' },
  { l: 'Extraversion',      v: 52, lo: 'Reserved',     hi: 'Outgoing',    sub: 'Balanced; comfortable in groups and alone.' },
  { l: 'Agreeableness',     v: 68, lo: 'Competitive',  hi: 'Cooperative', sub: 'Tends to collaborative work.' },
  { l: 'Neuroticism',       v: 34, lo: 'Resilient',    hi: 'Sensitive',   sub: 'Steady under pressure; below median for stress reactivity.' },
];

export const RIASEC: RiasecItem[] = [
  { l: 'Realistic',     v: 62 },
  { l: 'Investigative', v: 88 },
  { l: 'Artistic',      v: 48 },
  { l: 'Social',        v: 64 },
  { l: 'Enterprising',  v: 71 },
  { l: 'Conventional',  v: 56 },
];

export const PROVINCES: Province[] = [
  { id: 'lp',  name: 'Limpopo',       x: 560, y: 120, n: 8,  fees: 42000, you: true, intel: 'Your home base. UL + Tshwane Polokwane + Sefako Makgatho.' },
  { id: 'gp',  name: 'Gauteng',       x: 485, y: 215, n: 21, fees: 71000,            intel: 'Highest density: Wits, UP, UJ, TUT, Vaal — strong tech employer pipeline.' },
  { id: 'mp',  name: 'Mpumalanga',    x: 600, y: 235, n: 3,  fees: 38000,            intel: 'Mainly TVET + UMP. Lower fees, smaller programme catalog.' },
  { id: 'kzn', name: 'KwaZulu-Natal', x: 580, y: 355, n: 11, fees: 64000,            intel: 'UKZN, DUT, MUT — strong health sciences + maritime.' },
  { id: 'fs',  name: 'Free State',    x: 430, y: 300, n: 6,  fees: 48000,            intel: 'UFS + CUT. Mid fees, strong agricultural and accounting pathways.' },
  { id: 'ec',  name: 'Eastern Cape',  x: 435, y: 430, n: 9,  fees: 51000,            intel: 'Rhodes, NMU, WSU, UFH — heritage institutions.' },
  { id: 'wc',  name: 'Western Cape',  x: 200, y: 455, n: 14, fees: 78000,            intel: 'UCT, SU, UWC, CPUT. Highest tuition; premier research output.' },
  { id: 'nc',  name: 'Northern Cape', x: 265, y: 310, n: 2,  fees: 36000,            intel: 'Sol Plaatje only. Smallest catalog; lowest fees.' },
  { id: 'nw',  name: 'North West',    x: 380, y: 200, n: 4,  fees: 46000,            intel: 'NWU campuses. Strong distance + open-distance learning.' },
];
