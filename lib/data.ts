import type {
  Subject,
  Programme,
  Application,
  Deadline,
  Scholarship,
  FundingOpportunity,
  Capability,
  Career,
  BigFiveTrait,
  RiasecItem,
  Province,
  University,
} from './types';

export const SUBJECTS: Subject[] = [
  { id: 'eng',      name: 'English Home Language',  mark: 62, designated: true,  subjectType: 'home_language', curriculum: 'NSC' },
  { id: 'math',     name: 'Mathematics',             mark: 78, designated: true,  subjectType: 'mathematics',   curriculum: 'NSC' },
  { id: 'pscience', name: 'Physical Sciences',       mark: 71, designated: true,  subjectType: 'elective',      curriculum: 'NSC' },
  { id: 'lifesci',  name: 'Life Sciences',           mark: 74, designated: true,  subjectType: 'elective',      curriculum: 'NSC' },
  { id: 'history',  name: 'History',                 mark: 68, designated: true,  subjectType: 'elective',      curriculum: 'NSC' },
  { id: 'lo',       name: 'Life Orientation',        mark: 80, designated: false, subjectType: 'life_orientation', curriculum: 'NSC' },
  { id: 'sesotho',  name: 'Sesotho HL',              mark: 84, designated: true,  subjectType: 'home_language', curriculum: 'NSC' },
];

// Full NSC subject catalog — used in onboarding subject picker and profile page
export const SUBJECT_CATALOG: Subject[] = [
  // Home Languages
  { id: 'eng-hl',    name: 'English Home Language',       mark: 50, designated: true,  subjectType: 'home_language',     curriculum: 'NSC' },
  { id: 'afr-hl',    name: 'Afrikaans Home Language',     mark: 50, designated: true,  subjectType: 'home_language',     curriculum: 'NSC' },
  { id: 'zul-hl',    name: 'IsiZulu Home Language',       mark: 50, designated: true,  subjectType: 'home_language',     curriculum: 'NSC' },
  { id: 'xho-hl',    name: 'IsiXhosa Home Language',      mark: 50, designated: true,  subjectType: 'home_language',     curriculum: 'NSC' },
  { id: 'ses-hl',    name: 'Sesotho Home Language',       mark: 50, designated: true,  subjectType: 'home_language',     curriculum: 'NSC' },
  { id: 'sep-hl',    name: 'Sepedi Home Language',        mark: 50, designated: true,  subjectType: 'home_language',     curriculum: 'NSC' },
  { id: 'tsw-hl',    name: 'Setswana Home Language',      mark: 50, designated: true,  subjectType: 'home_language',     curriculum: 'NSC' },
  { id: 'ven-hl',    name: 'Tshivenda Home Language',     mark: 50, designated: true,  subjectType: 'home_language',     curriculum: 'NSC' },
  { id: 'tso-hl',    name: 'Xitsonga Home Language',      mark: 50, designated: true,  subjectType: 'home_language',     curriculum: 'NSC' },
  { id: 'ssw-hl',    name: 'SiSwati Home Language',       mark: 50, designated: true,  subjectType: 'home_language',     curriculum: 'NSC' },
  { id: 'nde-hl',    name: 'IsiNdebele Home Language',    mark: 50, designated: true,  subjectType: 'home_language',     curriculum: 'NSC' },
  // First Additional Languages
  { id: 'eng-fal',   name: 'English First Additional Language',    mark: 50, designated: true, subjectType: 'first_additional', curriculum: 'NSC' },
  { id: 'afr-fal',   name: 'Afrikaans First Additional Language',  mark: 50, designated: true, subjectType: 'first_additional', curriculum: 'NSC' },
  { id: 'zul-fal',   name: 'IsiZulu First Additional Language',    mark: 50, designated: true, subjectType: 'first_additional', curriculum: 'NSC' },
  { id: 'xho-fal',   name: 'IsiXhosa First Additional Language',   mark: 50, designated: true, subjectType: 'first_additional', curriculum: 'NSC' },
  { id: 'ses-fal',   name: 'Sesotho First Additional Language',    mark: 50, designated: true, subjectType: 'first_additional', curriculum: 'NSC' },
  { id: 'sep-fal',   name: 'Sepedi First Additional Language',     mark: 50, designated: true, subjectType: 'first_additional', curriculum: 'NSC' },
  { id: 'tsw-fal',   name: 'Setswana First Additional Language',   mark: 50, designated: true, subjectType: 'first_additional', curriculum: 'NSC' },
  { id: 'ven-fal',   name: 'Tshivenda First Additional Language',  mark: 50, designated: true, subjectType: 'first_additional', curriculum: 'NSC' },
  { id: 'tso-fal',   name: 'Xitsonga First Additional Language',   mark: 50, designated: true, subjectType: 'first_additional', curriculum: 'NSC' },
  { id: 'ssw-fal',   name: 'SiSwati First Additional Language',    mark: 50, designated: true, subjectType: 'first_additional', curriculum: 'NSC' },
  { id: 'nde-fal',   name: 'IsiNdebele First Additional Language', mark: 50, designated: true, subjectType: 'first_additional', curriculum: 'NSC' },
  // Mathematics
  { id: 'math',      name: 'Mathematics',                mark: 50, designated: true, subjectType: 'mathematics',   curriculum: 'NSC' },
  { id: 'mathlit',   name: 'Mathematical Literacy',      mark: 50, designated: true, subjectType: 'math_literacy', curriculum: 'NSC' },
  { id: 'techmath',  name: 'Technical Mathematics',      mark: 50, designated: true, subjectType: 'technical_math', curriculum: 'NSC' },
  // Sciences
  { id: 'pscience',  name: 'Physical Sciences',          mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  { id: 'lifesci',   name: 'Life Sciences',              mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  { id: 'agriscience', name: 'Agricultural Sciences',   mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  { id: 'techsci',   name: 'Technical Sciences',         mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  // Commerce
  { id: 'bizstud',   name: 'Business Studies',           mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  { id: 'accounting', name: 'Accounting',                mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  { id: 'economics', name: 'Economics',                  mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  // Social Sciences
  { id: 'history',   name: 'History',                   mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  { id: 'geography', name: 'Geography',                  mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  // Technology
  { id: 'cat',       name: 'Computer Applications Technology', mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  { id: 'it',        name: 'Information Technology',     mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  { id: 'egd',       name: 'Engineering Graphics & Design', mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  // Technical subjects
  { id: 'civil-tech',    name: 'Civil Technology',       mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  { id: 'elec-tech',     name: 'Electrical Technology',  mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  { id: 'mech-tech',     name: 'Mechanical Technology',  mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  { id: 'agri-tech',     name: 'Agricultural Technology', mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  { id: 'consumer-stud', name: 'Consumer Studies',       mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  // Creative & Arts
  { id: 'visual-arts',   name: 'Visual Arts',            mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  { id: 'music',         name: 'Music',                  mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  { id: 'dance',         name: 'Dance Studies',          mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  { id: 'drama',         name: 'Dramatic Arts',          mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  // Other Electives
  { id: 'tourism',       name: 'Tourism',                mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  { id: 'hospitality',   name: 'Hospitality Studies',    mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  { id: 'religion',      name: 'Religion Studies',       mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  { id: 'sport-sci',     name: 'Sport & Exercise Science', mark: 50, designated: true, subjectType: 'elective', curriculum: 'NSC' },
  // Life Orientation
  { id: 'lo',            name: 'Life Orientation',       mark: 50, designated: false, subjectType: 'life_orientation', curriculum: 'NSC' },
];

export const PROGRAMMES: Programme[] = [
  // ── Computer Science & IT ────────────────────────────────────────────────────
  { id: 'uct-cs',      name: 'BSc Computer Science',          uni: 'University of Cape Town',           aps: 38, fees: 76420, dur: 3, fit: 94, pathway: 'direct',     salary: 38500, demand: 'High', requiredSubjects: ['Mathematics'] },
  { id: 'wits-cs',     name: 'BSc Computer Science',          uni: 'University of the Witwatersrand',   aps: 36, fees: 82100, dur: 3, fit: 88, pathway: 'direct',     salary: 37000, demand: 'High', requiredSubjects: ['Mathematics'] },
  { id: 'up-cs',       name: 'BSc Computer Science',          uni: 'University of Pretoria',            aps: 34, fees: 74100, dur: 3, fit: 86, pathway: 'direct',     salary: 36000, demand: 'High', requiredSubjects: ['Mathematics'] },
  { id: 'uj-cs',       name: 'BSc Computer Science',          uni: 'University of Johannesburg',        aps: 32, fees: 66800, dur: 3, fit: 82, pathway: 'direct',     salary: 35000, demand: 'High', requiredSubjects: ['Mathematics'] },
  { id: 'cput-ict',    name: 'NDip ICT (App Dev)',            uni: 'Cape Peninsula UoT',                aps: 28, fees: 38200, dur: 3, fit: 76, pathway: 'tvet',       salary: 24500, demand: 'High', requiredSubjects: ['Mathematics'] },
  { id: 'tut-it',      name: 'NDip Information Technology',  uni: 'Tshwane University of Technology',  aps: 26, fees: 36400, dur: 3, fit: 73, pathway: 'tvet',       salary: 23000, demand: 'High', requiredSubjects: ['Mathematics'] },
  { id: 'dut-softdev', name: 'NDip Software Development',    uni: 'Durban University of Technology',   aps: 25, fees: 34800, dur: 3, fit: 71, pathway: 'tvet',       salary: 22500, demand: 'High', requiredSubjects: ['Mathematics'] },
  { id: 'up-data',     name: 'BSc Data Science',             uni: 'University of Pretoria',            aps: 40, fees: 74100, dur: 3, fit: 85, pathway: 'direct',     salary: 41200, demand: 'High', requiredSubjects: ['Mathematics', 'Physical Sciences'] },
  // ── Engineering ─────────────────────────────────────────────────────────────
  { id: 'sun-mech',    name: 'BEng Mechanical Engineering',  uni: 'Stellenbosch University',           aps: 36, fees: 71800, dur: 4, fit: 81, pathway: 'direct',     salary: 36800, demand: 'High', requiredSubjects: ['Mathematics', 'Physical Sciences'] },
  { id: 'wits-civil',  name: 'BSc Civil Engineering',        uni: 'University of the Witwatersrand',   aps: 36, fees: 82100, dur: 4, fit: 80, pathway: 'direct',     salary: 35000, demand: 'High', requiredSubjects: ['Mathematics', 'Physical Sciences'] },
  { id: 'up-elec',     name: 'BEng Electrical Engineering',  uni: 'University of Pretoria',            aps: 35, fees: 74100, dur: 4, fit: 82, pathway: 'direct',     salary: 37500, demand: 'High', requiredSubjects: ['Mathematics', 'Physical Sciences'] },
  { id: 'ukzn-chem',   name: 'BEng Chemical Engineering',    uni: 'University of KwaZulu-Natal',       aps: 34, fees: 68200, dur: 4, fit: 78, pathway: 'direct',     salary: 38000, demand: 'Med',  requiredSubjects: ['Mathematics', 'Physical Sciences'] },
  { id: 'wits-eng',    name: 'BSc Eng (Foundation Year)',    uni: 'University of the Witwatersrand',   aps: 32, fees: 71200, dur: 5, fit: 72, pathway: 'foundation', salary: 36800, demand: 'High', requiredSubjects: ['Mathematics', 'Physical Sciences'] },
  { id: 'up-comp-eng', name: 'BEng Computer Engineering',    uni: 'University of Pretoria',            aps: 36, fees: 74100, dur: 4, fit: 83, pathway: 'direct',     salary: 39000, demand: 'High', requiredSubjects: ['Mathematics', 'Physical Sciences'] },
  { id: 'sun-ind',     name: 'BEng Industrial Engineering',  uni: 'Stellenbosch University',           aps: 35, fees: 71800, dur: 4, fit: 79, pathway: 'direct',     salary: 36000, demand: 'Med',  requiredSubjects: ['Mathematics', 'Physical Sciences'] },
  { id: 'uct-chem',    name: 'BEng Chemical Engineering',    uni: 'University of Cape Town',           aps: 38, fees: 76420, dur: 4, fit: 80, pathway: 'direct',     salary: 38500, demand: 'Med',  requiredSubjects: ['Mathematics', 'Physical Sciences'] },
  // ── Health Sciences ──────────────────────────────────────────────────────────
  { id: 'ukzn-med',    name: 'MBChB (Medicine)',             uni: 'University of KwaZulu-Natal',       aps: 48, fees: 91500, dur: 6, fit: 41, pathway: 'direct',     salary: 52000, demand: 'High', requiredSubjects: ['Mathematics', 'Physical Sciences', 'Life Sciences'] },
  { id: 'wits-med',    name: 'MBChB (Medicine)',             uni: 'University of the Witwatersrand',   aps: 50, fees: 98000, dur: 6, fit: 38, pathway: 'direct',     salary: 52000, demand: 'High', requiredSubjects: ['Mathematics', 'Physical Sciences', 'Life Sciences'] },
  { id: 'uj-nursing',  name: 'BCur Nursing',                 uni: 'University of Johannesburg',        aps: 28, fees: 52000, dur: 4, fit: 72, pathway: 'direct',     salary: 22000, demand: 'High', requiredSubjects: ['Life Sciences'] },
  { id: 'ukzn-nursing',name: 'BCur Nursing Science',         uni: 'University of KwaZulu-Natal',       aps: 28, fees: 50000, dur: 4, fit: 71, pathway: 'direct',     salary: 22000, demand: 'High', requiredSubjects: ['Life Sciences'] },
  { id: 'ru-pharmacy', name: 'BPharm (Pharmacy)',            uni: 'Rhodes University',                 aps: 36, fees: 61200, dur: 4, fit: 68, pathway: 'direct',     salary: 30000, demand: 'High', requiredSubjects: ['Mathematics', 'Physical Sciences', 'Life Sciences'] },
  { id: 'up-pharmacy', name: 'BPharm (Pharmacy)',            uni: 'University of Pretoria',            aps: 36, fees: 74100, dur: 4, fit: 70, pathway: 'direct',     salary: 31000, demand: 'High', requiredSubjects: ['Mathematics', 'Physical Sciences', 'Life Sciences'] },
  { id: 'sun-physio',  name: 'BSc Physiotherapy',           uni: 'Stellenbosch University',           aps: 38, fees: 71800, dur: 4, fit: 65, pathway: 'direct',     salary: 28000, demand: 'High', requiredSubjects: ['Life Sciences', 'Physical Sciences'] },
  // ── Commerce & Business ──────────────────────────────────────────────────────
  { id: 'sun-fin',     name: 'BCom Finance',                 uni: 'Stellenbosch University',           aps: 44, fees: 68400, dur: 3, fit: 67, pathway: 'direct',     salary: 32400, demand: 'Med',  requiredSubjects: ['Mathematics'] },
  { id: 'uct-bcom',    name: 'BCom Accounting',              uni: 'University of Cape Town',           aps: 40, fees: 76420, dur: 3, fit: 78, pathway: 'direct',     salary: 34000, demand: 'High', requiredSubjects: ['Mathematics', 'Accounting'] },
  { id: 'up-bcom',     name: 'BCom Accounting Sciences',     uni: 'University of Pretoria',            aps: 36, fees: 74100, dur: 3, fit: 80, pathway: 'direct',     salary: 33000, demand: 'High', requiredSubjects: ['Mathematics', 'Accounting'] },
  { id: 'uj-bcom',     name: 'BCom Business Management',     uni: 'University of Johannesburg',        aps: 30, fees: 66800, dur: 3, fit: 76, pathway: 'direct',     salary: 26000, demand: 'Med',  requiredSubjects: ['Mathematics'] },
  { id: 'ufs-bcom',    name: 'BCom Economics',               uni: 'University of the Free State',      aps: 30, fees: 48200, dur: 3, fit: 74, pathway: 'direct',     salary: 27000, demand: 'Med',  requiredSubjects: ['Mathematics'] },
  { id: 'nwu-bcom',    name: 'BCom Management',              uni: 'North-West University',             aps: 28, fees: 46100, dur: 3, fit: 72, pathway: 'direct',     salary: 25000, demand: 'Med',  requiredSubjects: ['Mathematics'] },
  { id: 'wits-act',    name: 'BSc Actuarial Science',        uni: 'University of the Witwatersrand',   aps: 42, fees: 82100, dur: 3, fit: 88, pathway: 'direct',     salary: 45200, demand: 'High', requiredSubjects: ['Mathematics', 'Physical Sciences'] },
  { id: 'up-bcom-it',  name: 'BCom Informatics',             uni: 'University of Pretoria',            aps: 32, fees: 74100, dur: 3, fit: 79, pathway: 'direct',     salary: 31000, demand: 'High', requiredSubjects: ['Mathematics'] },
  // ── Social Sciences & Law ────────────────────────────────────────────────────
  { id: 'uct-psych',   name: 'BA Psychology',                uni: 'University of Cape Town',           aps: 34, fees: 76420, dur: 3, fit: 74, pathway: 'direct',     salary: 22000, demand: 'Med',  requiredSubjects: [] },
  { id: 'up-socwork',  name: 'BSW Social Work',              uni: 'University of Pretoria',            aps: 28, fees: 74100, dur: 4, fit: 70, pathway: 'direct',     salary: 18000, demand: 'High', requiredSubjects: [] },
  { id: 'uwc-comms',   name: 'BA Communication',             uni: 'University of the Western Cape',    aps: 28, fees: 52400, dur: 3, fit: 68, pathway: 'direct',     salary: 20000, demand: 'Med',  requiredSubjects: [] },
  { id: 'ukzn-llb',    name: 'LLB (Law)',                    uni: 'University of KwaZulu-Natal',       aps: 34, fees: 68200, dur: 4, fit: 72, pathway: 'direct',     salary: 30000, demand: 'Med',  requiredSubjects: [] },
  { id: 'uct-llb',     name: 'LLB (Law)',                    uni: 'University of Cape Town',           aps: 40, fees: 76420, dur: 4, fit: 70, pathway: 'direct',     salary: 35000, demand: 'Med',  requiredSubjects: [] },
  { id: 'ru-ba',       name: 'BA History & Politics',        uni: 'Rhodes University',                 aps: 30, fees: 61200, dur: 3, fit: 66, pathway: 'direct',     salary: 18000, demand: 'Low',  requiredSubjects: [] },
  // ── Education ────────────────────────────────────────────────────────────────
  { id: 'up-bed-fp',   name: 'BEd Foundation Phase',         uni: 'University of Pretoria',            aps: 28, fees: 74100, dur: 4, fit: 68, pathway: 'direct',     salary: 18500, demand: 'High', requiredSubjects: [] },
  { id: 'up-bed-ip',   name: 'BEd Intermediate Phase',       uni: 'University of Pretoria',            aps: 28, fees: 74100, dur: 4, fit: 67, pathway: 'direct',     salary: 18500, demand: 'High', requiredSubjects: [] },
  { id: 'wits-bed',    name: 'BEd Senior Phase & FET',       uni: 'University of the Witwatersrand',   aps: 28, fees: 82100, dur: 4, fit: 66, pathway: 'direct',     salary: 19000, demand: 'High', requiredSubjects: [] },
  { id: 'uct-pgce',    name: 'PGCE (Postgrad Cert Education)',uni: 'University of Cape Town',           aps: 32, fees: 76420, dur: 1, fit: 65, pathway: 'direct',     salary: 19500, demand: 'High', requiredSubjects: [] },
  // ── Architecture & Built Environment ─────────────────────────────────────────
  { id: 'uct-arch',    name: 'BArch Architecture',           uni: 'University of Cape Town',           aps: 40, fees: 76420, dur: 5, fit: 72, pathway: 'direct',     salary: 28000, demand: 'Med',  requiredSubjects: ['Mathematics'] },
  { id: 'wits-arch',   name: 'BSc Architecture',             uni: 'University of the Witwatersrand',   aps: 38, fees: 82100, dur: 5, fit: 70, pathway: 'direct',     salary: 28000, demand: 'Med',  requiredSubjects: ['Mathematics'] },
  { id: 'up-qs',       name: 'BSc Quantity Surveying',       uni: 'University of Pretoria',            aps: 32, fees: 74100, dur: 4, fit: 68, pathway: 'direct',     salary: 26000, demand: 'Med',  requiredSubjects: ['Mathematics'] },
  { id: 'up-townplan', name: 'BSc Town & Regional Planning', uni: 'University of Pretoria',            aps: 30, fees: 74100, dur: 4, fit: 65, pathway: 'direct',     salary: 25000, demand: 'Med',  requiredSubjects: ['Mathematics'] },
  // ── Agriculture & Environmental Science ──────────────────────────────────────
  { id: 'up-agri',     name: 'BSc Agriculture',              uni: 'University of Pretoria',            aps: 28, fees: 74100, dur: 4, fit: 64, pathway: 'direct',     salary: 20000, demand: 'Med',  requiredSubjects: ['Agricultural Sciences'] },
  { id: 'ufs-agri',    name: 'BSc Agriculture',              uni: 'University of the Free State',      aps: 26, fees: 48200, dur: 4, fit: 62, pathway: 'direct',     salary: 19500, demand: 'Med',  requiredSubjects: ['Agricultural Sciences'] },
  { id: 'uct-envsci',  name: 'BSc Environmental Science',    uni: 'University of Cape Town',           aps: 34, fees: 76420, dur: 3, fit: 68, pathway: 'direct',     salary: 22000, demand: 'Med',  requiredSubjects: ['Life Sciences', 'Physical Sciences'] },
  { id: 'ufh-agri',    name: 'BAgric Management',            uni: 'University of Fort Hare',           aps: 24, fees: 42000, dur: 4, fit: 60, pathway: 'direct',     salary: 18500, demand: 'Med',  requiredSubjects: ['Agricultural Sciences'] },
];

export const APPS: Application[] = [
  { id: 'app-uct',   short: 'UCT CS',      uni: 'UCT · BSc Computer Science',    meta: 'Submitted 14 Aug · APS 42 / 38 needed',                   stages: ['done','done','done','done'], status: 'success',     label: 'Accepted',  progId: 'uct-cs',   submitted: '14 Aug 2026', decided: '03 Sep 2026',          fee: 'R 250 (waived)' },
  { id: 'app-wits',  short: 'Wits Act.',   uni: 'Wits · BSc Actuarial Science',  meta: 'Submitted 22 Aug · awaiting matric finals',               stages: ['done','done','active',''],   status: 'warning',     label: 'Pending',   progId: 'wits-act', submitted: '22 Aug 2026', decided: '— pending finals',     fee: 'R 200 (waived)' },
  { id: 'app-nsfas', short: 'NSFAS',       uni: 'NSFAS · Funding application',   meta: 'Submitted 12 Aug · documents under review',               stages: ['done','done','active',''],   status: 'info',        label: 'In review', progId: null,       submitted: '12 Aug 2026', decided: '— review window 21–35d', fee: 'Free' },
  { id: 'app-sun',   short: 'SUN Finance', uni: 'Stellenbosch · BCom Finance',   meta: 'APS shortfall · consider extended pathway',               stages: ['done','done','fail',''],     status: 'destructive', label: 'Rejected',  progId: 'sun-fin',  submitted: '10 Aug 2026', decided: '28 Aug 2026',          fee: 'R 200 (waived)' },
];

export const DEADLINES: Deadline[] = [
  { d: 29, m: 'Apr', t: 'NSFAS supporting docs',        sub: '2 days · required',          tag: 'destructive', tagL: 'Urgent' },
  { d: 5,  m: 'May', t: 'UCT residence application',    sub: '8 days',                     tag: 'warning',     tagL: 'Soon'   },
  { d: 11, m: 'May', t: 'Allan Gray Orbis essay',       sub: '14 days · 1,000 words',      tag: '',            tagL: 'Open'   },
  { d: 22, m: 'May', t: 'Wits portfolio submission',    sub: '25 days',                    tag: '',            tagL: 'Open'   },
];

export const SCHOLARSHIPS: Scholarship[] = [
  { name: 'Allan Gray Orbis Foundation',   amount: 280000, match: 92, eligibility: 'Entrepreneurial intent · top 5% · interview',        deadline: '15 Oct 2026' },
  { name: 'Investec Bursary',              amount: 165000, match: 88, eligibility: 'Maths ≥ 75 · BCom/BSc · financial need',             deadline: '30 Sep 2026' },
  { name: 'Standard Bank Group',           amount: 142000, match: 81, eligibility: 'BCom Finance/Acc · APS ≥ 40',                        deadline: '30 Aug 2026' },
  { name: 'NRF Innovation Scholarship',    amount: 95000,  match: 74, eligibility: 'STEM · research interest',                           deadline: '12 Sep 2026' },
  { name: 'Sasol Bursary (Engineering)',   amount: 198000, match: 68, eligibility: 'Engineering · service contract',                     deadline: '15 Aug 2026' },
  { name: 'Funza Lushaka Bursary',         amount: 95000,  match: 76, eligibility: 'Education · Teaching commitment required',           deadline: '31 Oct 2026' },
  { name: 'FASSET Bursary (Finance)',      amount: 55000,  match: 72, eligibility: 'Finance/Accounting · SETA sector',                   deadline: '28 Feb 2027' },
  { name: 'merSETA Engineering',           amount: 60000,  match: 70, eligibility: 'Engineering/Trade · SETA sector',                    deadline: '31 Mar 2027' },
  { name: 'Mandela Rhodes Foundation',     amount: 200000, match: 82, eligibility: 'Leadership · top academic record',                   deadline: '30 Sep 2026' },
  { name: 'Anglo American Bursary',        amount: 120000, match: 71, eligibility: 'Mining/Engineering/Finance · APS ≥ 36',             deadline: '31 Aug 2026' },
  { name: 'Eskom Bursary',                 amount: 100000, match: 69, eligibility: 'Engineering/IT · service contract',                  deadline: '30 Sep 2026' },
  { name: 'Absa Group Bursary',            amount: 80000,  match: 67, eligibility: 'BCom/IT · APS ≥ 32 · financial need',               deadline: '31 Oct 2026' },
  { name: 'MICT SETA (ICT)',               amount: 55000,  match: 74, eligibility: 'ICT/Computer Science · SETA sector',                 deadline: '28 Feb 2027' },
  { name: 'Mastercard Foundation Scholars', amount: 350000, match: 85, eligibility: 'Any field · financial need · leadership',           deadline: '31 Jan 2027' },
  { name: 'DHET Skills Bursary',           amount: 60000,  match: 66, eligibility: 'Priority scarce skills · any accredited institution', deadline: '31 Mar 2027' },
];

// Full funding opportunities dataset (static fallback — mirrors funding_opportunities Supabase table)
export const FUNDING_OPPORTUNITIES: FundingOpportunity[] = [
  // Government
  { id: 'nsfas',           name: 'NSFAS Bursary',                 amount: 100000, match: 80, type: 'grant',         provider_type: 'government', eligibility: 'Household income ≤ R350,000 · SA citizen',                    deadline: '31 Jan 2027', income_threshold: 350000, last_verified_at: '2026-05-01' },
  { id: 'funza',           name: 'Funza Lushaka Bursary',         amount: 95000,  match: 76, type: 'bursary',       provider_type: 'government', eligibility: 'Education · Teaching commitment required',                    deadline: '31 Oct 2026',                    last_verified_at: '2026-05-01' },
  { id: 'nsfas-disab',     name: 'NSFAS Disability Supplement',   amount: 15000,  match: 0,  type: 'disability',    provider_type: 'government', eligibility: 'NSFAS eligible + registered disability',                     deadline: '31 Jan 2027', disability_specific: true, last_verified_at: '2026-05-01' },
  { id: 'gp-prov',         name: 'Gauteng Provincial Bursary',    amount: 30000,  match: 60, type: 'bursary',       provider_type: 'government', eligibility: 'Gauteng resident · financial need · APS ≥ 28',               deadline: '30 Nov 2026', province_specific: 'Gauteng',      last_verified_at: '2026-04-01' },
  { id: 'wc-prov',         name: 'Western Cape Provincial Bursary', amount: 35000, match: 62, type: 'bursary',     provider_type: 'government', eligibility: 'WC resident · financial need · APS ≥ 28',                    deadline: '30 Nov 2026', province_specific: 'Western Cape', last_verified_at: '2026-04-01' },
  { id: 'kzn-prov',        name: 'KZN Provincial Bursary',        amount: 25000,  match: 58, type: 'bursary',       provider_type: 'government', eligibility: 'KZN resident · financial need',                              deadline: '30 Nov 2026', province_specific: 'KwaZulu-Natal', last_verified_at: '2026-04-01' },
  { id: 'lp-prov',         name: 'Limpopo Provincial Bursary',    amount: 20000,  match: 56, type: 'bursary',       provider_type: 'government', eligibility: 'Limpopo resident · financial need',                          deadline: '30 Nov 2026', province_specific: 'Limpopo',      last_verified_at: '2026-04-01' },
  { id: 'dhet-skills',     name: 'DHET Skills Development Bursary', amount: 60000, match: 66, type: 'bursary',     provider_type: 'government', eligibility: 'Priority scarce skills · any accredited institution',         deadline: '31 Mar 2027',                    last_verified_at: '2026-05-01', study_fields: ['Engineering', 'Health', 'Education', 'ICT'] },
  // SETA
  { id: 'merseta',         name: 'merSETA Engineering Bursary',   amount: 60000,  match: 70, type: 'seta',          provider_type: 'seta',       eligibility: 'Engineering/Trade · SETA levy-paying employer',               deadline: '31 Mar 2027', study_fields: ['Engineering'],     last_verified_at: '2026-03-01', service_contract: true },
  { id: 'fasset',          name: 'FASSET Bursary (Finance)',      amount: 55000,  match: 72, type: 'seta',          provider_type: 'seta',       eligibility: 'Finance/Accounting/Tax · SETA sector',                       deadline: '28 Feb 2027', study_fields: ['Commerce'],        last_verified_at: '2026-03-01' },
  { id: 'mict-seta',       name: 'MICT SETA (ICT)',              amount: 55000,  match: 74, type: 'seta',          provider_type: 'seta',       eligibility: 'ICT/Computer Science · SETA sector',                         deadline: '28 Feb 2027', study_fields: ['ICT', 'Engineering'], last_verified_at: '2026-03-01' },
  { id: 'bankseta',        name: 'BANKSETA Bursary',              amount: 50000,  match: 68, type: 'seta',          provider_type: 'seta',       eligibility: 'Finance/Banking · Banking sector employer',                  deadline: '31 Mar 2027', study_fields: ['Commerce'],        last_verified_at: '2026-03-01' },
  { id: 'hwseta',          name: 'HWSETA Health & Welfare',       amount: 48000,  match: 65, type: 'seta',          provider_type: 'seta',       eligibility: 'Health/Welfare · SETA sector',                               deadline: '31 Mar 2027', study_fields: ['Health Sciences'], last_verified_at: '2026-03-01' },
  { id: 'chieta',          name: 'CHIETA Chemical Industries',    amount: 60000,  match: 62, type: 'seta',          provider_type: 'seta',       eligibility: 'Chemical Engineering/Chemistry',                             deadline: '31 Mar 2027', study_fields: ['Engineering'],     last_verified_at: '2026-03-01', service_contract: true },
  { id: 'agriseta',        name: 'AgriSETA Bursary',              amount: 45000,  match: 60, type: 'seta',          provider_type: 'seta',       eligibility: 'Agriculture/Agri-sciences',                                  deadline: '31 Mar 2027', study_fields: ['Agriculture'],     last_verified_at: '2026-03-01' },
  { id: 'inseta',          name: 'INSETA Insurance Bursary',      amount: 50000,  match: 64, type: 'seta',          provider_type: 'seta',       eligibility: 'Finance/Risk/Insurance',                                     deadline: '31 Mar 2027', study_fields: ['Commerce'],        last_verified_at: '2026-03-01' },
  // Corporate
  { id: 'allan-gray',      name: 'Allan Gray Orbis Foundation',   amount: 280000, match: 92, type: 'scholarship',   provider_type: 'corporate',  eligibility: 'Entrepreneurial intent · top 5% · interview',               deadline: '15 Oct 2026', min_aps: 38,                       last_verified_at: '2026-05-01' },
  { id: 'investec',        name: 'Investec Bursary',              amount: 165000, match: 88, type: 'bursary',       provider_type: 'corporate',  eligibility: 'Maths ≥ 75 · BCom/BSc · financial need',                    deadline: '30 Sep 2026', min_aps: 36,                       last_verified_at: '2026-05-01', study_fields: ['Commerce', 'Engineering', 'Sciences'] },
  { id: 'sasol',           name: 'Sasol Bursary (Engineering)',   amount: 198000, match: 68, type: 'bursary',       provider_type: 'corporate',  eligibility: 'Engineering · service contract',                            deadline: '15 Aug 2026', min_aps: 32,                       last_verified_at: '2026-05-01', service_contract: true, study_fields: ['Engineering'] },
  { id: 'anglo-american',  name: 'Anglo American Bursary',        amount: 120000, match: 71, type: 'bursary',       provider_type: 'corporate',  eligibility: 'Mining/Engineering/Finance · APS ≥ 36',                     deadline: '31 Aug 2026', min_aps: 36,                       last_verified_at: '2026-05-01', service_contract: true, study_fields: ['Engineering', 'Commerce'] },
  { id: 'eskom',           name: 'Eskom Bursary',                 amount: 100000, match: 69, type: 'bursary',       provider_type: 'corporate',  eligibility: 'Engineering/IT · service contract',                         deadline: '30 Sep 2026', min_aps: 30,                       last_verified_at: '2026-05-01', service_contract: true, study_fields: ['Engineering', 'ICT'] },
  { id: 'standard-bank',  name: 'Standard Bank Group Bursary',   amount: 142000, match: 81, type: 'bursary',       provider_type: 'corporate',  eligibility: 'BCom Finance/Acc · APS ≥ 40',                               deadline: '30 Aug 2026', min_aps: 40,                       last_verified_at: '2026-05-01', study_fields: ['Commerce'] },
  { id: 'absa',            name: 'Absa Group Bursary',            amount: 80000,  match: 67, type: 'bursary',       provider_type: 'corporate',  eligibility: 'BCom/IT · APS ≥ 32 · financial need',                       deadline: '31 Oct 2026', min_aps: 32,                       last_verified_at: '2026-05-01', study_fields: ['Commerce', 'ICT'] },
  { id: 'fnb',             name: 'FNB Bursary',                   amount: 75000,  match: 65, type: 'bursary',       provider_type: 'corporate',  eligibility: 'BCom/IT/Engineering · APS ≥ 30',                            deadline: '31 Oct 2026', min_aps: 30,                       last_verified_at: '2026-05-01', study_fields: ['Commerce', 'ICT', 'Engineering'] },
  { id: 'nedbank',         name: 'Nedbank Bursary',               amount: 65000,  match: 63, type: 'bursary',       provider_type: 'corporate',  eligibility: 'BCom/IT · financial need',                                  deadline: '31 Oct 2026',                                       last_verified_at: '2026-05-01', study_fields: ['Commerce', 'ICT'] },
  { id: 'old-mutual',      name: 'Old Mutual Foundation',         amount: 55000,  match: 61, type: 'bursary',       provider_type: 'corporate',  eligibility: 'Actuarial/Finance/IT · financial need',                     deadline: '30 Sep 2026',                                       last_verified_at: '2026-05-01', study_fields: ['Commerce', 'Sciences'] },
  { id: 'mtn',             name: 'MTN Bursary',                   amount: 60000,  match: 67, type: 'bursary',       provider_type: 'corporate',  eligibility: 'ICT/Engineering/Commerce · APS ≥ 30',                       deadline: '30 Sep 2026', min_aps: 30,                       last_verified_at: '2026-05-01', study_fields: ['ICT', 'Engineering'] },
  { id: 'vodacom',         name: 'Vodacom Foundation Bursary',    amount: 55000,  match: 65, type: 'bursary',       provider_type: 'corporate',  eligibility: 'ICT/Engineering/Data Science',                              deadline: '30 Sep 2026',                                       last_verified_at: '2026-05-01', study_fields: ['ICT', 'Engineering'] },
  { id: 'transnet',        name: 'Transnet Bursary',              amount: 80000,  match: 64, type: 'bursary',       provider_type: 'corporate',  eligibility: 'Engineering · service contract',                            deadline: '31 Oct 2026', min_aps: 28,                       last_verified_at: '2026-05-01', service_contract: true, study_fields: ['Engineering'] },
  { id: 'discovery',       name: 'Discovery Vitality Bursary',    amount: 70000,  match: 66, type: 'bursary',       provider_type: 'corporate',  eligibility: 'Health Sciences/Actuarial/IT',                              deadline: '31 Oct 2026',                                       last_verified_at: '2026-05-01', study_fields: ['Health Sciences', 'Commerce', 'ICT'] },
  { id: 'pwc',             name: 'PwC Bursary',                   amount: 75000,  match: 70, type: 'bursary',       provider_type: 'corporate',  eligibility: 'BCom Accounting/Auditing · APS ≥ 36',                       deadline: '31 Aug 2026', min_aps: 36,                       last_verified_at: '2026-05-01', study_fields: ['Commerce'] },
  { id: 'deloitte',        name: 'Deloitte Bursary',              amount: 80000,  match: 71, type: 'bursary',       provider_type: 'corporate',  eligibility: 'BCom Accounting/Finance · APS ≥ 36',                       deadline: '31 Aug 2026', min_aps: 36,                       last_verified_at: '2026-05-01', study_fields: ['Commerce'] },
  { id: 'nrf',             name: 'NRF Innovation Scholarship',    amount: 95000,  match: 74, type: 'scholarship',   provider_type: 'government', eligibility: 'STEM · research interest',                                  deadline: '12 Sep 2026', min_aps: 34,                       last_verified_at: '2026-05-01', study_fields: ['Sciences', 'Engineering', 'ICT'] },
  // International
  { id: 'mandela-rhodes',  name: 'Mandela Rhodes Foundation',     amount: 200000, match: 82, type: 'international', provider_type: 'international', eligibility: 'Leadership · top academic record',                        deadline: '30 Sep 2026', min_aps: 38,                       last_verified_at: '2026-05-01' },
  { id: 'mastercard',      name: 'Mastercard Foundation Scholars', amount: 350000, match: 85, type: 'international', provider_type: 'international', eligibility: 'Any field · financial need · leadership',                deadline: '31 Jan 2027',                                       last_verified_at: '2026-05-01', income_threshold: 400000 },
  { id: 'chevening',       name: 'Chevening Scholarship (UK)',    amount: 400000, match: 78, type: 'international', provider_type: 'international', eligibility: 'Postgrad · leadership potential · 2 yrs work experience', deadline: '31 Oct 2026', min_aps: 40,                       last_verified_at: '2026-05-01' },
  { id: 'fulbright',       name: 'Fulbright Foreign Student (US)', amount: 300000, match: 76, type: 'international', provider_type: 'international', eligibility: 'Postgrad · research/academic excellence',                deadline: '15 Nov 2026', min_aps: 40,                       last_verified_at: '2026-05-01' },
  { id: 'daad',            name: 'DAAD Scholarship (Germany)',    amount: 200000, match: 74, type: 'international', provider_type: 'international', eligibility: 'Postgrad/undergrad · German university',                  deadline: '31 Oct 2026', min_aps: 36,                       last_verified_at: '2026-05-01' },
  { id: 'commonwealth',    name: 'Commonwealth Scholarship',      amount: 250000, match: 72, type: 'international', provider_type: 'international', eligibility: 'Postgrad · Commonwealth country · financial need',        deadline: '15 Dec 2026', min_aps: 38,                       last_verified_at: '2026-05-01' },
  // Student Loans
  { id: 'fundi',           name: 'Fundi Student Loan',            amount: 120000, match: 55, type: 'loan',          provider_type: 'corporate',  eligibility: 'Any accredited SA institution · prime+2%',                  deadline: 'Rolling',                                           last_verified_at: '2026-05-01' },
  { id: 'sb-studyloan',    name: 'Standard Bank Study Loan',      amount: 150000, match: 58, type: 'loan',          provider_type: 'corporate',  eligibility: 'Any accredited SA institution · prime+1%',                  deadline: 'Rolling',                                           last_verified_at: '2026-05-01' },
  { id: 'fnb-studyloan',   name: 'FNB Student Loan',              amount: 140000, match: 57, type: 'loan',          provider_type: 'corporate',  eligibility: 'Any accredited SA institution · prime+1.5%',               deadline: 'Rolling',                                           last_verified_at: '2026-05-01' },
  { id: 'absa-studyloan',  name: 'Absa Student Loan',             amount: 130000, match: 56, type: 'loan',          provider_type: 'corporate',  eligibility: 'Any accredited SA institution · prime+1.5%',               deadline: 'Rolling',                                           last_verified_at: '2026-05-01' },
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

export const UNIS: University[] = [
  // ── Tier 1 Traditional Research Universities ──────────────────────────────
  { name: 'University of Cape Town',               short: 'UCT',    city: 'Cape Town',      province: 'Western Cape',    rank: 1,  progs: 142, accept: 14, fees: 76420, tag: 'success', acpt: 'Tier 1',        website: 'https://www.uct.ac.za' },
  { name: 'University of the Witwatersrand',        short: 'Wits',   city: 'Johannesburg',   province: 'Gauteng',         rank: 2,  progs: 168, accept: 18, fees: 82100, tag: 'success', acpt: 'Tier 1',        website: 'https://www.wits.ac.za' },
  { name: 'Stellenbosch University',                short: 'SUN',    city: 'Stellenbosch',   province: 'Western Cape',    rank: 3,  progs: 154, accept: 22, fees: 71800, tag: 'success', acpt: 'Tier 1',        website: 'https://www.sun.ac.za' },
  { name: 'University of Pretoria',                 short: 'UP',     city: 'Pretoria',       province: 'Gauteng',         rank: 4,  progs: 187, accept: 28, fees: 74100, tag: 'info',    acpt: 'Tier 1',        website: 'https://www.up.ac.za' },
  { name: 'University of KwaZulu-Natal',            short: 'UKZN',   city: 'Durban',         province: 'KwaZulu-Natal',   rank: 5,  progs: 162, accept: 31, fees: 68200, tag: 'info',    acpt: 'Tier 1',        website: 'https://www.ukzn.ac.za' },
  { name: 'University of Johannesburg',             short: 'UJ',     city: 'Johannesburg',   province: 'Gauteng',         rank: 6,  progs: 148, accept: 35, fees: 66800, tag: 'info',    acpt: 'Comprehensive', website: 'https://www.uj.ac.za' },
  { name: 'University of the Western Cape',         short: 'UWC',    city: 'Cape Town',       province: 'Western Cape',    rank: 7,  progs: 124, accept: 38, fees: 52400, tag: 'info',    acpt: 'Comprehensive', website: 'https://www.uwc.ac.za' },
  { name: 'Rhodes University',                      short: 'RU',     city: 'Makhanda',        province: 'Eastern Cape',    rank: 8,  progs: 98,  accept: 42, fees: 61200, tag: 'warning', acpt: 'Tier 1',        website: 'https://www.ru.ac.za' },
  // ── Comprehensive Universities ────────────────────────────────────────────
  { name: 'University of South Africa',             short: 'UNISA',  city: 'Pretoria',        province: 'Gauteng',         rank: 9,  progs: 210, accept: 75, fees: 22000, tag: 'info',    acpt: 'Distance',      website: 'https://www.unisa.ac.za' },
  { name: 'University of the Free State',           short: 'UFS',    city: 'Bloemfontein',    province: 'Free State',      rank: 10, progs: 138, accept: 45, fees: 48200, tag: 'info',    acpt: 'Comprehensive', website: 'https://www.ufs.ac.za' },
  { name: 'North-West University',                  short: 'NWU',    city: 'Potchefstroom',   province: 'North West',      rank: 11, progs: 141, accept: 48, fees: 46100, tag: 'info',    acpt: 'Comprehensive', website: 'https://www.nwu.ac.za' },
  { name: 'University of Fort Hare',                short: 'UFH',    city: 'Alice',           province: 'Eastern Cape',    rank: 12, progs: 82,  accept: 55, fees: 42000, tag: 'warning', acpt: 'Comprehensive', website: 'https://www.ufh.ac.za' },
  { name: 'University of Limpopo',                  short: 'UL',     city: 'Mankweng',        province: 'Limpopo',         rank: 13, progs: 76,  accept: 56, fees: 40000, tag: 'warning', acpt: 'Comprehensive', website: 'https://www.ul.ac.za' },
  { name: 'University of Zululand',                 short: 'UniZulu',city: 'KwaDlangezwa',    province: 'KwaZulu-Natal',   rank: 14, progs: 70,  accept: 58, fees: 38500, tag: 'warning', acpt: 'Comprehensive', website: 'https://www.unizulu.ac.za' },
  { name: 'Nelson Mandela University',              short: 'NMU',    city: 'Gqeberha',        province: 'Eastern Cape',    rank: 15, progs: 112, accept: 46, fees: 50100, tag: 'info',    acpt: 'Comprehensive', website: 'https://www.mandela.ac.za' },
  { name: 'University of Mpumalanga',               short: 'UMP',    city: 'Mbombela',        province: 'Mpumalanga',      rank: 16, progs: 48,  accept: 60, fees: 38000, tag: 'warning', acpt: 'Comprehensive', website: 'https://www.ump.ac.za' },
  { name: 'Sol Plaatje University',                 short: 'SPU',    city: 'Kimberley',       province: 'Northern Cape',   rank: 17, progs: 38,  accept: 62, fees: 36000, tag: 'warning', acpt: 'Comprehensive', website: 'https://www.spu.ac.za' },
  { name: 'University of Venda',                    short: 'UNIVEN', city: 'Thohoyandou',     province: 'Limpopo',         rank: 18, progs: 64,  accept: 60, fees: 38000, tag: 'warning', acpt: 'Comprehensive', website: 'https://www.univen.ac.za' },
  { name: 'Walter Sisulu University',               short: 'WSU',    city: 'Mthatha',         province: 'Eastern Cape',    rank: 19, progs: 72,  accept: 58, fees: 40000, tag: 'warning', acpt: 'Comprehensive', website: 'https://www.wsu.ac.za' },
  { name: 'Sefako Makgatho Health Sciences Univ.',  short: 'SMU',    city: 'Pretoria',        province: 'Gauteng',         rank: 20, progs: 52,  accept: 35, fees: 56000, tag: 'info',    acpt: 'Comprehensive', website: 'https://www.smu.ac.za' },
  // ── Universities of Technology (UoTs) ─────────────────────────────────────
  { name: 'Cape Peninsula UoT',                     short: 'CPUT',   city: 'Cape Town',       province: 'Western Cape',    rank: 21, progs: 118, accept: 42, fees: 38200, tag: 'warning', acpt: 'UoT',           website: 'https://www.cput.ac.za' },
  { name: 'Tshwane University of Technology',       short: 'TUT',    city: 'Pretoria',        province: 'Gauteng',         rank: 22, progs: 132, accept: 48, fees: 36400, tag: 'warning', acpt: 'UoT',           website: 'https://www.tut.ac.za' },
  { name: 'Durban University of Technology',        short: 'DUT',    city: 'Durban',          province: 'KwaZulu-Natal',   rank: 23, progs: 108, accept: 50, fees: 34800, tag: 'warning', acpt: 'UoT',           website: 'https://www.dut.ac.za' },
  { name: 'Vaal University of Technology',          short: 'VUT',    city: 'Vanderbijlpark',  province: 'Gauteng',         rank: 24, progs: 96,  accept: 52, fees: 33200, tag: 'warning', acpt: 'UoT',           website: 'https://www.vut.ac.za' },
  { name: 'Central University of Technology',       short: 'CUT',    city: 'Bloemfontein',    province: 'Free State',      rank: 25, progs: 88,  accept: 55, fees: 32800, tag: 'warning', acpt: 'UoT',           website: 'https://www.cut.ac.za' },
  { name: 'Mangosuthu University of Technology',    short: 'MUT',    city: 'Umlazi',          province: 'KwaZulu-Natal',   rank: 26, progs: 72,  accept: 58, fees: 30000, tag: 'warning', acpt: 'UoT',           website: 'https://www.mut.ac.za' },
  // ── Major TVET Colleges (one per region) ──────────────────────────────────
  { name: 'Ekurhuleni East TVET College',           short: 'EEC',    city: 'Boksburg',        province: 'Gauteng',         rank: 27, progs: 32,  accept: 85, fees: 12000, tag: 'info',    acpt: 'TVET',          website: 'https://www.eec.edu.za' },
  { name: 'South Cape TVET College',                short: 'SCTVET', city: 'George',          province: 'Western Cape',    rank: 28, progs: 28,  accept: 85, fees: 11500, tag: 'info',    acpt: 'TVET',          website: 'https://www.southcape.edu.za' },
  { name: 'Elangeni TVET College',                  short: 'ELG',    city: 'Durban',          province: 'KwaZulu-Natal',   rank: 29, progs: 30,  accept: 85, fees: 12000, tag: 'info',    acpt: 'TVET',          website: 'https://www.elangeni.edu.za' },
  { name: 'Waterberg TVET College',                 short: 'WBC',    city: 'Mokopane',        province: 'Limpopo',         rank: 30, progs: 26,  accept: 85, fees: 11000, tag: 'info',    acpt: 'TVET',          website: 'https://www.waterbergcollege.co.za' },
  { name: 'Northlink TVET College',                 short: 'NLC',    city: 'Parow',           province: 'Western Cape',    rank: 31, progs: 30,  accept: 85, fees: 11500, tag: 'info',    acpt: 'TVET',          website: 'https://www.northlink.edu.za' },
  // ── Private Institutions ──────────────────────────────────────────────────
  { name: 'IIE Varsity College',                    short: 'IIE-VC', city: 'Johannesburg',    province: 'Gauteng',         rank: 32, progs: 58,  accept: 70, fees: 55000, tag: 'info',    acpt: 'Private',       website: 'https://www.varsitycollege.co.za' },
  { name: 'AFDA Film School',                       short: 'AFDA',   city: 'Cape Town',       province: 'Western Cape',    rank: 33, progs: 18,  accept: 65, fees: 65000, tag: 'warning', acpt: 'Private',       website: 'https://www.afda.co.za' },
  { name: 'STADIO Higher Education',                short: 'STADIO', city: 'Pretoria',        province: 'Gauteng',         rank: 34, progs: 42,  accept: 72, fees: 35000, tag: 'info',    acpt: 'Private',       website: 'https://www.stadio.ac.za' },
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
