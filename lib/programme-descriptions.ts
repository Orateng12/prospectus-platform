/**
 * Plain-language programme explainers.
 *
 * Why this file exists:
 * Many SA students face programme requirements they don't qualify for and are
 * given no explanation of what the programme actually is, who it's for, or what
 * alternative pathways exist. This module turns programme catalogue names into
 * a structured plain-language explanation a Grade 12 student from any background
 * can understand without a counsellor.
 *
 * Pure data + a keyword matcher — no DB calls, no I/O. Safe to import anywhere.
 */

export interface ProgrammeExplainer {
  plainName: string;
  tagline: string;
  whoIsItFor: string;
  whatYouLearn: string;
  whereItLeads: string[];
  timeToFirstJob: string;
  saContext: string;
  commonMisconception: string;
  pathwayIn?: string;
  pathwayUp?: string;
}

/* ─── Explainer catalogue ──────────────────────────────────────────────── */

const NATED: ProgrammeExplainer = {
  plainName: 'Technical College Diploma (NATED)',
  tagline:
    'A practical qualification that gets you working in 3 years — and opens the door to university later',
  whoIsItFor:
    'People who want hands-on, practical skills without starting at a full university. Good for those who missed the APS requirement for university but want a recognised qualification',
  whatYouLearn:
    'You study in three stages: N4, N5, then N6 — each building on the last. Engineering NATED covers maths, engineering science, and your chosen trade. Business NATED covers accounting, economics, office management and entrepreneurship',
  whereItLeads: [
    'Technician',
    'Engineering Assistant',
    'Office Administrator',
    'Bookkeeper',
    'Production Supervisor',
    'Site Foreman',
  ],
  timeToFirstJob:
    '18 months study (N4-N6) + 18 months workplace experience = full qualification in 3 years',
  saContext:
    'SA has a massive shortage of qualified technicians. NATED graduates are in demand at Eskom, Transnet, construction companies and government departments — often hired before they finish',
  commonMisconception:
    'Many students think NATED is a dead end. It is NOT. Completing N6 + 18 months work experience gives you a National N Diploma, which allows entry into BTech (now Advanced Diploma) at universities of technology — the same institutions that accept university graduates',
  pathwayIn: 'NC(V) Level 4 or Grade 11/12 with any passes — APS requirement is very low',
  pathwayUp:
    'National N Diploma → BTech / Advanced Diploma at UoT (TUT, DUT, CPUT, VUT, CUT, MUT)',
};

const NCV: ProgrammeExplainer = {
  plainName: 'Vocational Certificate — College Trade Training',
  tagline: 'Build a trade skill from scratch — no matric needed to start',
  whoIsItFor:
    "Students who want to learn a specific trade or skill. You can start NC(V) Level 2 after Grade 9 — you don't need matric",
  whatYouLearn:
    'Practical workshops, trade theory and life skills. Offered in programmes like Electrical, Civil Construction, Hospitality, IT, Business, Agriculture',
  whereItLeads: [
    'Electrician',
    'Plumber',
    'Chef',
    'IT Technician',
    'Civil Construction Worker',
    'Hospitality Manager',
  ],
  timeToFirstJob: '3 years (Level 2, 3, 4) — you can work as an apprentice while studying',
  saContext:
    'SA desperately needs artisans. An electrician can earn R30,000/month running their own business. NC(V) Level 4 can also lead directly into NATED N4',
  commonMisconception:
    "People think this is 'below' matric. NC(V) Level 4 is equivalent to matric for entry into TVET colleges and universities of technology",
  pathwayIn: 'Grade 9 pass is enough to start NC(V) Level 2',
  pathwayUp: 'NC(V) Level 4 → NATED N4 → National N Diploma → BTech at UoT',
};

const COMP_SCI: ProgrammeExplainer = {
  plainName: 'Computer Science — Build Software and Systems',
  tagline: 'Write code, design systems, and build the digital future of South Africa',
  whoIsItFor:
    "Students who enjoy maths and logic. You don't need to already know how to code — that's what you learn. Curiosity matters more than experience",
  whatYouLearn:
    'Programming (Python, Java, C++), algorithms, databases, networks, artificial intelligence, app development. Projects start in first year',
  whereItLeads: [
    'Software Developer',
    'Data Scientist',
    'Cybersecurity Analyst',
    'Systems Architect',
    'AI Engineer',
    'Tech Entrepreneur',
  ],
  timeToFirstJob:
    '3 years BSc + 3-6 months job search. Some students get hired during their degree',
  saContext:
    'SA is short 60,000 tech workers. Entry salary is R25,000-R40,000/month. Remote work for global companies is common — you can be paid in dollars while living in SA',
  commonMisconception:
    "It's not just for people who already code or understand computers. Most students start with zero experience",
  pathwayIn: 'Maths at 60%+ minimum. Most universities require APS 30-38',
  pathwayUp:
    'BSc → BSc Honours → Masters → PhD, or → industry job → senior developer → CTO',
};

const BCOM: ProgrammeExplainer = {
  plainName: 'Bachelor of Commerce — Business, Money and Management',
  tagline: 'Understand how businesses make money — then help them make more of it',
  whoIsItFor:
    'Students interested in money, business, running organisations, or becoming entrepreneurs. Maths literacy is acceptable for some BCom streams',
  whatYouLearn:
    'Accounting (reading financial statements), economics (how markets work), business law, management, finance, marketing — depending on your stream',
  whereItLeads: [
    'Chartered Accountant (CA)',
    'Financial Analyst',
    'Bank Manager',
    'Entrepreneur',
    'HR Manager',
    'Marketing Director',
  ],
  timeToFirstJob:
    '3 years BCom + articles/training for professional streams like CA. Management/Marketing BCom grads often placed in first year',
  saContext:
    'Every company in SA needs accountants and financial managers. A CA(SA) earns R800,000+ per year. BCom Accounting is the single most popular route',
  commonMisconception:
    "BCom doesn't require pure Maths for all streams — some streams accept Mathematical Literacy, though Accounting and Finance streams need Maths",
  pathwayIn:
    'Maths or Maths Literacy depending on stream. APS 28-44 depending on university and stream',
  pathwayUp:
    'BCom → CA(SA) articles → partner/CFO, or → Honours → Masters in Finance/Economics',
};

const ENGINEERING: ProgrammeExplainer = {
  plainName: 'Engineering Degree — Design and Build the World',
  tagline:
    'Design bridges, power grids, machines and software systems that millions of people rely on',
  whoIsItFor:
    'Students who are strong in maths AND physical science and love solving real-world problems. Engineering is challenging but one of the most rewarding and well-paid careers',
  whatYouLearn:
    'Heavy on mathematics and physics in first year. From year 2: your specialisation — structures, circuits, machines, chemical processes or software systems. Projects and labs every semester',
  whereItLeads: [
    'Mechanical Engineer',
    'Civil Engineer',
    'Electrical Engineer',
    'Project Manager',
    'Mining Engineer',
    'Consulting Engineer',
  ],
  timeToFirstJob:
    '4 years degree + 2 years graduate experience to register as Professional Engineer (Pr.Eng)',
  saContext:
    'SA has a critical shortage of engineers. Sasol, Anglo American, Eskom, roads agencies all hire. Starting salary R35,000-R55,000/month. Pr.Eng can earn R120,000+/month',
  commonMisconception:
    "Engineering is not just for people who are 'geniuses'. It requires hard work and good maths — but it is learnable. Foundation year programmes exist for students who narrowly miss the APS",
  pathwayIn:
    'Maths 60%+ AND Physical Sciences 60%+ is required. APS 32-40 depending on university and type',
  pathwayUp:
    'BEng → two years graduate experience → Professional Engineer registration → senior roles or own consultancy',
};

const MEDICINE: ProgrammeExplainer = {
  plainName: 'Medical Degree — Become a Doctor',
  tagline: 'Six years to one of the most respected and needed professions in South Africa',
  whoIsItFor:
    'Students with very strong academics — especially Maths, Physical Sciences and Life Sciences — and genuine drive to help people. This is the most competitive programme in SA',
  whatYouLearn:
    '2 years basic sciences (anatomy, physiology, biochemistry), 2 years clinical theory, 2 years hospital rotations. You treat real patients from year 4',
  whereItLeads: [
    'General Practitioner (GP)',
    'Surgeon',
    'Specialist Doctor',
    'Academic Researcher',
    'Medical Officer at NGO/Government',
  ],
  timeToFirstJob:
    '6 years MBChB + 1 year internship + 1 year community service = 8 years before independent practice',
  saContext:
    'SA has 0.9 doctors per 1,000 people (the world average is 1.7). Rural areas desperately need doctors. The community service year is paid — around R22,000/month',
  commonMisconception:
    'Many students apply to medicine as a status choice without knowing the workload. It requires genuine passion for patient care — not just high marks',
  pathwayIn:
    'APS 48-50, Maths 80%+, Physical Sciences 80%+, Life Sciences 80%+, PLUS National Benchmark Test (NBT) and interview',
  pathwayUp: 'MBChB → specialisation (MMed) → subspecialisation → consultant/specialist',
};

const LAW: ProgrammeExplainer = {
  plainName: 'Law Degree — Work in Courts, Business and Government',
  tagline: 'Learn the rules that govern every contract, every crime, and every right in South Africa',
  whoIsItFor:
    "Students who enjoy reading, arguing a case, and thinking precisely. You don't need to want to be a courtroom lawyer — law graduates work in companies, government, NGOs and parliament",
  whatYouLearn:
    'Contract law, criminal law, constitutional law, property law, family law, company law, international law — plus legal research and writing from year 1',
  whereItLeads: [
    'Attorney',
    'Advocate',
    'Corporate Legal Counsel',
    'Magistrate',
    'Judge',
    'Legal Advisor at NGO/Government',
    'Politician',
  ],
  timeToFirstJob:
    '4 years LLB + 2 years articles (for attorneys) or 1 year pupillage (for advocates)',
  saContext:
    "SA's constitution is one of the most progressive in the world — legal professionals shape policy, protect rights, and drive transformation. Government is the biggest employer of legal graduates",
  commonMisconception:
    'Law is not mainly about arguing in court. Most law graduates never see a courtroom regularly — they draft contracts, advise companies, and handle property transactions',
  pathwayIn: 'No specific subjects required beyond English. APS 30-40 depending on university',
  pathwayUp:
    'LLB → articles/pupillage → admitted attorney/advocate → senior associate → partner/silk',
};

const EDUCATION: ProgrammeExplainer = {
  plainName: 'Teaching Degree — Shape Every Future Generation',
  tagline:
    'Become the teacher you wish you had — and build the country from the classroom',
  whoIsItFor:
    'People who genuinely enjoy working with children or young adults and want to make a direct impact. Teaching is one of the most stable government jobs in SA',
  whatYouLearn:
    'Subject knowledge (you specialise in 2-3 subjects), teaching methodology, child development, inclusive education, school management basics',
  whereItLeads: [
    'Foundation Phase Teacher (Grade R-3)',
    'Primary School Teacher',
    'High School Teacher',
    'HOD (Head of Department)',
    'Principal',
    'Education Department Official',
  ],
  timeToFirstJob:
    '4 years BEd — government jobs available almost immediately after qualifying',
  saContext:
    'SA has a shortage of especially Maths, Science and Languages teachers. The Funza Lushaka bursary covers ALL costs for teaching students who commit to teaching in public schools — this is one of the most accessible full bursaries in SA',
  commonMisconception:
    'Teaching is seen as a fallback. It is a professional degree with government employment security, pension, medical aid, and the Funza Lushaka bursary available from first year',
  pathwayIn: 'APS 24-32 depending on university and phase. English proficiency important',
  pathwayUp:
    'BEd → PGCE specialisation → HOD → Deputy Principal → Principal → Circuit Manager → Department',
};

const NURSING: ProgrammeExplainer = {
  plainName: 'Nursing Degree — Patient Care and Clinical Practice',
  tagline: 'Be the person patients rely on most when they are at their most vulnerable',
  whoIsItFor:
    'Students with genuine compassion for people in difficult situations. Nursing is physically and emotionally demanding but deeply meaningful — and one of the most employed professions in SA',
  whatYouLearn:
    'Anatomy, physiology, pharmacology, patient assessment, clinical procedures, mental health care, community health. You work in hospitals from year 1',
  whereItLeads: [
    'Professional Nurse',
    'ICU Nurse',
    'Theatre Nurse',
    'Community Health Nurse',
    'Nursing Sister',
    'Nurse Unit Manager',
  ],
  timeToFirstJob:
    '4 years BCur + registration with SANC (South African Nursing Council) — jobs available immediately after registration',
  saContext:
    'SA has a critical nursing shortage. Government hospitals hire immediately. Starting salary around R22,000-R28,000/month with government benefits. Private hospitals pay more',
  commonMisconception:
    'Nursing is not a lesser career than medicine — nurses often have more patient contact and clinical decision-making than doctors, especially in under-resourced settings',
  pathwayIn: 'Life Sciences recommended. APS 24-30 depending on university',
  pathwayUp:
    'BCur → postgraduate nursing specialisation → Nurse Unit Manager → Nursing Manager → Director of Nursing',
};

const NDIP: ProgrammeExplainer = {
  plainName: 'National Diploma — Practical University Qualification',
  tagline:
    'A 3-year qualification from a university of technology that gets you into industry fast',
  whoIsItFor:
    'Students who want a university qualification with more practical focus than a traditional degree. NDip is offered at TUT, DUT, CPUT, VUT, CUT, MUT',
  whatYouLearn:
    'Theory combined with industry projects and a mandatory workplace experience component (experiential learning). More hands-on than a BSc or BCom',
  whereItLeads: [
    'Engineering Technician',
    'IT Technician',
    'Accountant',
    'HR Practitioner',
    'Public Relations Officer',
    'Graphic Designer',
  ],
  timeToFirstJob:
    '3 years + workplace training component — often hired by the company you do your experiential learning at',
  saContext:
    'Universities of technology (UoTs) are recognised employers in industry. TUT is the largest university in SA by headcount. NDip graduates are valued for their practical readiness',
  commonMisconception:
    'NDip is NOT inferior to a BSc. In many industries (engineering technicians, IT support, accounting technicians) employers prefer NDip graduates for their practical skills',
  pathwayIn: 'APS 24-30 at most UoTs — more accessible than traditional universities',
  pathwayUp: 'NDip → Advanced Diploma (formerly BTech) → Postgraduate Diploma → Masters',
};

const BSC: ProgrammeExplainer = {
  plainName: 'Science Degree — Research, Analysis and Problem Solving',
  tagline:
    'Understand how the natural world works — then apply that knowledge to solve real problems',
  whoIsItFor:
    "Students who love asking 'why' and 'how'. Good for those interested in health, environment, data, research or graduate study",
  whatYouLearn:
    'Depends on your majors — combinations of maths, physics, chemistry, biology, geology, ecology, computer science, statistics',
  whereItLeads: [
    'Research Scientist',
    'Data Analyst',
    'Environmental Consultant',
    'Pharmacist (with further study)',
    'Medical Researcher',
    'Geologist',
  ],
  timeToFirstJob:
    '3 years BSc — most research/academic careers require Honours (4th year) minimum',
  saContext:
    "SA's mining, agriculture, environment and health sectors rely on science graduates. NRF (National Research Foundation) and DSI fund research bursaries",
  commonMisconception:
    "A BSc alone doesn't limit you — BSc graduates go into banking, consulting, data science, tech, and business, not just labs",
  pathwayIn: 'Maths required. Physical Sciences or Life Sciences depending on stream. APS 28-38',
  pathwayUp:
    'BSc → BSc Honours (competitive) → Masters → PhD for academic/research careers, or → industry at any point',
};

const BA: ProgrammeExplainer = {
  plainName: 'Arts / Humanities Degree — People, Society and Ideas',
  tagline: 'Study what makes people tick — and build skills that every organisation needs',
  whoIsItFor:
    'Students who are strong readers and writers and are interested in people, society, culture, communication or psychology. Good for those who want flexibility',
  whatYouLearn:
    'Depends on your major — psychology, sociology, history, media studies, languages, philosophy, development studies, political science. Writing and critical thinking throughout',
  whereItLeads: [
    'Social Worker',
    'Psychologist (with postgrad)',
    'Journalist',
    'PR Practitioner',
    'Policy Analyst',
    'NGO Worker',
    'Teacher (with PGCE)',
  ],
  timeToFirstJob:
    '3 years BA — some specialisations (psychology, social work) need postgraduate study for professional registration',
  saContext:
    "SA's NGO, government and social development sectors employ thousands of BA graduates. Social workers are in demand. Media and communication are growing fields",
  commonMisconception:
    'BA graduates struggle to find jobs — this is outdated. The skills (communication, research, critical thinking) are valued across every industry. The key is specialising with purpose',
  pathwayIn: 'No specific subjects required beyond English. APS 24-34 depending on university',
  pathwayUp:
    'BA → BA Honours → Postgraduate diploma → Masters/PhD for professional practice',
};

const FOUNDATION: ProgrammeExplainer = {
  plainName: 'Foundation Programme — Your Bridge to a Full Degree',
  tagline:
    "If your marks weren't quite enough for direct entry, this is the legal back door",
  whoIsItFor:
    'Students who narrowly missed the APS for their chosen degree. A foundation year builds the missing skills so you can enter the full degree in year 2 — often the SAME qualification at the end',
  whatYouLearn:
    'Maths, English, life skills, and the basics of your chosen faculty — designed to prepare you for degree-level work',
  whereItLeads: [
    'Same careers as the full degree — because you get the same qualification at the end, just takes one year longer',
  ],
  timeToFirstJob:
    '1 extra year compared to direct entry — worth it to get into the programme you actually want',
  saContext:
    'Most universities offer foundation programmes: NSFAS covers them. Wits has Sci-EASE, UCT has EDP, UJ has Foundation Studies. You are NOT in a lesser programme — you end up with the exact same degree',
  commonMisconception:
    'Foundation students often outperform direct-entry students by year 3 because they had the extra preparation year',
  pathwayIn:
    'Typically APS 2-5 points below the direct entry requirement. English and Maths below the cut-off',
  pathwayUp:
    'Foundation year → Year 1 of the full degree → same outcome as direct-entry students',
};

/* ─── Matcher ──────────────────────────────────────────────────────────── */

/**
 * Match programme catalogue names to one of the explainers above.
 * Returns null when no keyword matches — callers should treat that as "no
 * explainer available" and fall back to the existing UI.
 *
 * Order matters: more specific keywords first. NATED / NC(V) / Foundation
 * matches before general degree keywords, because their names may overlap
 * with engineering / commerce streams (e.g. "NATED Electrical Engineering").
 */
export function getProgrammeExplainer(programmeName: string): ProgrammeExplainer | null {
  if (!programmeName) return null;
  const n = programmeName.toLowerCase();

  // Specific pathway keywords first — they may contain general degree words.
  if (
    n.includes('nated') ||
    /\bn[456]\b/.test(n) ||
    n.includes(' n4') ||
    n.includes(' n5') ||
    n.includes(' n6')
  ) {
    return NATED;
  }
  if (
    n.includes('nc(v)') ||
    n.includes('ncv') ||
    n.includes('national certificate vocational') ||
    n.includes('national certificate (vocational)')
  ) {
    return NCV;
  }
  if (
    n.includes('foundation') ||
    n.includes('extended programme') ||
    n.includes('extended curriculum') ||
    n.includes('bridging')
  ) {
    return FOUNDATION;
  }

  // Professional / discipline-specific degrees.
  if (n.includes('mbchb') || n.includes('medicine') || n.includes('medical degree')) {
    return MEDICINE;
  }
  if (n.includes('llb') || /\blaw\b/.test(n)) {
    return LAW;
  }
  if (
    n.includes('nursing') ||
    n.includes('bcur') ||
    n.includes('b cur') ||
    n.includes('nurs')
  ) {
    return NURSING;
  }
  if (
    n.includes('education') ||
    n.includes('teaching') ||
    n.includes('bed ') ||
    n.startsWith('bed') ||
    n.includes('b.ed') ||
    n.includes('pgce')
  ) {
    return EDUCATION;
  }

  // Engineering family — match before generic BSc so "BSc Eng" routes here.
  if (
    n.includes('engineering') ||
    n.includes('beng') ||
    n.includes('b eng') ||
    n.includes('b.eng')
  ) {
    return ENGINEERING;
  }

  // Computing family — before generic BSc.
  if (
    n.includes('computer science') ||
    n.includes('software') ||
    n.includes('information technology') ||
    n.includes(' ict') ||
    n.startsWith('ict') ||
    n.includes('informatics') ||
    n.includes('app dev')
  ) {
    return COMP_SCI;
  }

  // Commerce family.
  if (
    n.includes('bcom') ||
    n.includes('b com') ||
    n.includes('b.com') ||
    n.includes('commerce') ||
    n.includes('accounting') ||
    n.includes('finance') ||
    n.includes('economics') ||
    n.includes('business management')
  ) {
    return BCOM;
  }

  // National Diploma at UoT — before generic BSc.
  if (
    n.includes('national diploma') ||
    n.includes('ndip') ||
    /\bn dip\b/.test(n) ||
    n.includes('btech') ||
    n.includes('advanced diploma')
  ) {
    return NDIP;
  }

  // Generic science / arts catch-alls.
  if (n.includes('bsc') || n.includes('b sc') || n.includes('b.sc') || n.includes('bachelor of science')) {
    return BSC;
  }
  if (
    n.includes(' ba ') ||
    n.startsWith('ba ') ||
    n.endsWith(' ba') ||
    n.includes('bachelor of arts') ||
    n.includes('humanities') ||
    n.includes('social work') ||
    n.includes('psychology') ||
    n.includes('communication')
  ) {
    return BA;
  }

  return null;
}
