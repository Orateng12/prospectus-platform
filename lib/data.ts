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
  University,
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
  { id: 'uct-cs',    name: 'BSc Computer Science',         uni: 'University of Cape Town',          aps: 38, fees: 76420, dur: 3, fit: 94, pathway: 'direct',     salary: 38500, demand: 'High' },
  { id: 'wits-act',  name: 'BSc Actuarial Science',        uni: 'University of the Witwatersrand',  aps: 42, fees: 82100, dur: 3, fit: 88, pathway: 'direct',     salary: 45200, demand: 'High' },
  { id: 'sun-eng',   name: 'BSc Engineering (Mech.)',      uni: 'Stellenbosch University',          aps: 36, fees: 71800, dur: 4, fit: 81, pathway: 'extended',   salary: 36800, demand: 'High' },
  { id: 'cput-ict',  name: 'NDip ICT (App Dev)',           uni: 'Cape Peninsula UoT',               aps: 28, fees: 38200, dur: 3, fit: 76, pathway: 'tvet',       salary: 24500, demand: 'High' },
  { id: 'up-data',   name: 'BSc Data Science',             uni: 'University of Pretoria',           aps: 40, fees: 74100, dur: 3, fit: 85, pathway: 'direct',     salary: 41200, demand: 'High' },
  { id: 'ukzn-med',  name: 'MBChB (Medicine)',             uni: 'University of KwaZulu-Natal',      aps: 48, fees: 91500, dur: 6, fit: 41, pathway: 'direct',     salary: 52000, demand: 'High' },
  { id: 'sun-fin',   name: 'BCom Finance',                 uni: 'Stellenbosch University',          aps: 44, fees: 68400, dur: 3, fit: 67, pathway: 'direct',     salary: 32400, demand: 'Med'  },
  { id: 'wits-eng',  name: 'BSc Eng (Foundation Yr)',      uni: 'University of the Witwatersrand',  aps: 32, fees: 71200, dur: 5, fit: 72, pathway: 'foundation', salary: 36800, demand: 'High' },
  { id: 'wits-law',  name: 'LLB Law',                      uni: 'University of the Witwatersrand',  aps: 40, fees: 79800, dur: 4, fit: 70, pathway: 'direct',     salary: 38000, demand: 'Med'  },
  { id: 'unisa-bed', name: 'BEd (Foundation Phase)',       uni: 'UNISA',                            aps: 26, fees: 18400, dur: 4, fit: 82, pathway: 'direct',     salary: 22000, demand: 'High' },
  { id: 'up-acc',    name: 'BCom Accounting',              uni: 'University of Pretoria',           aps: 38, fees: 71200, dur: 3, fit: 74, pathway: 'direct',     salary: 31500, demand: 'High' },
  { id: 'uct-math',  name: 'BSc Mathematics',              uni: 'University of Cape Town',          aps: 36, fees: 74200, dur: 3, fit: 80, pathway: 'direct',     salary: 36000, demand: 'Med'  },
  { id: 'uwc-psych', name: 'BA Psychology',                uni: 'University of the Western Cape',   aps: 30, fees: 52400, dur: 3, fit: 66, pathway: 'direct',     salary: 24000, demand: 'Med'  },
  { id: 'up-civil',  name: 'BEng Civil Engineering',       uni: 'University of Pretoria',           aps: 34, fees: 72400, dur: 4, fit: 78, pathway: 'direct',     salary: 34200, demand: 'High' },
  { id: 'uct-med',   name: 'MBChB (Medicine)',             uni: 'University of Cape Town',          aps: 50, fees: 96200, dur: 6, fit: 32, pathway: 'direct',     salary: 52000, demand: 'High' },
  { id: 'cput-it',   name: 'BSc Information Technology',   uni: 'Cape Peninsula UoT',               aps: 28, fees: 39400, dur: 3, fit: 77, pathway: 'direct',     salary: 28000, demand: 'High' },
  { id: 'wits-econ', name: 'BCom Economics',               uni: 'University of the Witwatersrand',  aps: 38, fees: 80200, dur: 3, fit: 71, pathway: 'direct',     salary: 33000, demand: 'Med'  },
  { id: 'ukzn-nurs', name: 'BNurs Nursing Science',        uni: 'University of KwaZulu-Natal',      aps: 26, fees: 54400, dur: 4, fit: 65, pathway: 'direct',     salary: 22000, demand: 'High' },
  { id: 'uct-arch',  name: 'BSc Architecture',             uni: 'University of Cape Town',          aps: 36, fees: 82400, dur: 3, fit: 68, pathway: 'direct',     salary: 28000, demand: 'Med'  },
  { id: 'tut-elec',  name: 'BTech Electrical Engineering', uni: 'Tshwane University of Technology', aps: 30, fees: 36400, dur: 4, fit: 73, pathway: 'tvet',       salary: 32000, demand: 'High' },
  { id: 'uj-sw',     name: 'BA Social Work',               uni: 'University of Johannesburg',       aps: 28, fees: 66800, dur: 4, fit: 60, pathway: 'direct',     salary: 18000, demand: 'High' },
  { id: 'sun-cs',    name: 'BSc Computer Science',         uni: 'Stellenbosch University',          aps: 38, fees: 69800, dur: 3, fit: 88, pathway: 'direct',     salary: 38500, demand: 'High' },
];

export const APPS: Application[] = [
  { id: 'app-uct',   short: 'UCT CS',      uni: 'UCT · BSc Computer Science',    meta: 'Submitted 14 Aug · APS 42 / 38 needed',                   stages: ['done','done','done','done'], status: 'success',     label: 'Accepted',  progId: 'uct-cs',   submitted: '14 Aug 2026', decided: '03 Sep 2026',          fee: 'R 250 (waived)' },
  { id: 'app-wits',  short: 'Wits Act.',   uni: 'Wits · BSc Actuarial Science',  meta: 'Submitted 22 Aug · awaiting matric finals',               stages: ['done','done','active',''],   status: 'warning',     label: 'Pending',   progId: 'wits-act', submitted: '22 Aug 2026', decided: '— pending finals',     fee: 'R 200 (waived)' },
  { id: 'app-nsfas', short: 'NSFAS',       uni: 'NSFAS · Funding application',   meta: 'Submitted 12 Aug · documents under review',               stages: ['done','done','active',''],   status: 'info',        label: 'In review', progId: null,       submitted: '12 Aug 2026', decided: '— review window 21–35d', fee: 'Free' },
  { id: 'app-sun',   short: 'SUN Finance', uni: 'Stellenbosch · BCom Finance',   meta: 'APS shortfall · consider extended pathway',               stages: ['done','done','fail',''],     status: 'destructive', label: 'Rejected',  progId: 'sun-fin',  submitted: '10 Aug 2026', decided: '28 Aug 2026',          fee: 'R 200 (waived)' },
];

export const DEADLINES: Deadline[] = [
  { d: 31, m: 'Aug', t: 'NSFAS supporting docs',        sub: '12 days · required',         tag: 'destructive', tagL: 'Urgent' },
  { d: 30, m: 'Sep', t: 'UCT residence application',    sub: '30 days',                    tag: 'warning',     tagL: 'Soon'   },
  { d: 15, m: 'Oct', t: 'Allan Gray Orbis essay',       sub: '46 days · 1,000 words',      tag: '',            tagL: 'Open'   },
  { d: 31, m: 'Oct', t: 'Wits portfolio submission',    sub: '62 days',                    tag: '',            tagL: 'Open'   },
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
  { rank: 1,  name: 'Software Engineer',        match: 88, salary: 38500, growth: '+22%', demand: 'High', tags: ['STEM','Remote','Tech'],          why: 'Strong analytical + numerical capability — top fit for your maths trajectory.' },
  { rank: 2,  name: 'Data Scientist',           match: 85, salary: 41200, growth: '+18%', demand: 'High', tags: ['STEM','Hybrid','Analytics'],     why: 'Capability mix maps perfectly; growth sector in SA finance + telco.' },
  { rank: 3,  name: 'Actuary',                  match: 82, salary: 45200, growth: '+9%',  demand: 'Med',  tags: ['Finance','Office','Accredited'], why: 'High pay, your maths and stats fit, but long accreditation path.' },
  { rank: 4,  name: 'Quantitative Analyst',     match: 78, salary: 48000, growth: '+12%', demand: 'Med',  tags: ['Finance','Hybrid'],              why: 'Premier salary band; competitive entry, niche to JSE-listed banks.' },
  { rank: 5,  name: 'ML Engineer',              match: 76, salary: 42800, growth: '+25%', demand: 'High', tags: ['STEM','Remote'],                 why: 'Fastest-growing role; needs stronger CS foundation than maths.' },
  { rank: 6,  name: 'Data Analyst',             match: 74, salary: 32000, growth: '+16%', demand: 'High', tags: ['Analytics','Hybrid','STEM'],     why: 'Broad demand across SA industries — accessible entry with BSc or BIS.' },
  { rank: 7,  name: 'Product Manager (Tech)',   match: 71, salary: 38000, growth: '+14%', demand: 'High', tags: ['Tech','Hybrid'],                 why: 'Communication skills are the gap; coachable through electives and projects.' },
  { rank: 8,  name: 'Entrepreneur',             match: 68, salary: 45000, growth: '+20%', demand: 'High', tags: ['Business','Flexible'],           why: 'High enterprising RIASEC + risk tolerance maps well; income is variable.' },
  { rank: 9,  name: 'Lawyer',                   match: 64, salary: 38000, growth: '+6%',  demand: 'Med',  tags: ['Law','Office','Accredited'],     why: 'Good analytical fit; verbal and communication scores need strengthening.' },
  { rank: 10, name: 'Financial Advisor',        match: 62, salary: 34000, growth: '+8%',  demand: 'High', tags: ['Finance','Client-facing'],       why: 'Enterprising profile fits; people skills are more important than maths here.' },
  { rank: 11, name: 'Mechanical Engineer',      match: 60, salary: 33500, growth: '+5%',  demand: 'Med',  tags: ['STEM','On-site','Manufacturing'],why: 'Solid technical fit; stable demand in SA manufacturing and infrastructure.' },
  { rank: 12, name: 'Civil Engineer',           match: 58, salary: 32400, growth: '+5%',  demand: 'Med',  tags: ['STEM','On-site'],                why: 'Spatial fit OK; demand is steady but lower growth than software.' },
  { rank: 13, name: 'Accountant',               match: 55, salary: 30000, growth: '+4%',  demand: 'High', tags: ['Finance','Office','Accredited'], why: 'SAICA accreditation path is long; high demand and job security.' },
  { rank: 14, name: 'Teacher',                  match: 48, salary: 22000, growth: '+3%',  demand: 'High', tags: ['Education','Public'],            why: 'Critical national shortage; social impact is high but salary is modest.' },
  { rank: 15, name: 'Nurse',                    match: 44, salary: 24000, growth: '+8%',  demand: 'High', tags: ['Health','Public','People'],      why: 'Agreeableness fits; HPCSA registration required. High public sector demand.' },
  { rank: 16, name: 'Doctor (MBChB)',           match: 41, salary: 52000, growth: '+7%',  demand: 'High', tags: ['STEM','Public','Accredited'],    why: 'High pay but APS 48+, biology, and verbal scores all need lifting.' },
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

export const UNIS: University[] = [
  { name: 'University of Cape Town',          short: 'UCT',  city: 'Cape Town',     province: 'Western Cape',    rank: 1, progs: 142, accept: 14, fees: 76420, tag: 'success', acpt: 'Tier 1' },
  { name: 'University of the Witwatersrand',  short: 'Wits', city: 'Johannesburg',  province: 'Gauteng',         rank: 2, progs: 168, accept: 18, fees: 82100, tag: 'success', acpt: 'Tier 1' },
  { name: 'Stellenbosch University',          short: 'SUN',  city: 'Stellenbosch',  province: 'Western Cape',    rank: 3, progs: 154, accept: 22, fees: 71800, tag: 'success', acpt: 'Tier 1' },
  { name: 'University of Pretoria',           short: 'UP',   city: 'Pretoria',      province: 'Gauteng',         rank: 4, progs: 187, accept: 28, fees: 74100, tag: 'info',    acpt: 'Tier 1' },
  { name: 'University of KwaZulu-Natal',      short: 'UKZN', city: 'Durban',        province: 'KwaZulu-Natal',   rank: 5, progs: 162, accept: 31, fees: 68200, tag: 'info',    acpt: 'Tier 1' },
  { name: 'University of Johannesburg',       short: 'UJ',   city: 'Johannesburg',  province: 'Gauteng',         rank: 6, progs: 148, accept: 35, fees: 66800, tag: 'info',    acpt: 'Tier 1' },
  { name: 'University of the Western Cape',   short: 'UWC',  city: 'Cape Town',     province: 'Western Cape',    rank: 7, progs: 124, accept: 38, fees: 52400, tag: 'info',    acpt: 'Tier 1' },
  { name: 'Rhodes University',                short: 'RU',   city: 'Makhanda',      province: 'Eastern Cape',    rank: 8, progs: 98,  accept: 42, fees: 61200, tag: 'warning', acpt: 'Tier 1' },
  { name: 'Cape Peninsula UoT',               short: 'CPUT', city: 'Cape Town',     province: 'Western Cape',    rank: 9, progs: 118, accept: 42, fees: 38200, tag: 'warning', acpt: 'Tier 2' },
  { name: 'Tshwane University of Technology', short: 'TUT',  city: 'Pretoria',      province: 'Gauteng',         rank: 10, progs: 132, accept: 48, fees: 36400, tag: 'warning', acpt: 'Tier 2' },
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
