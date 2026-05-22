'use client';

import type { Career, Programme, CapabilityData, PsychProfileData, Route } from '@/lib/types';
import { PROGRAMMES } from '@/lib/data';
import { fmtR } from '@/lib/utils';
import { getCareerCapRequirements, scoreCareerMatchBreakdown } from '@/lib/scoring';

interface CareerDetailPageProps {
  career: Career | null;
  programmes?: Programme[];
  capabilityData?: CapabilityData | null;
  psychProfile?: PsychProfileData | null;
  navigate: (r: Route, prog?: string) => void;
  savedProgrammeIds?: string[];
  userAps?: number;
}

const CAREER_TO_KEYWORDS: Record<string, string[]> = {
  'Software Engineer':       ['computer science', 'software', 'ict', 'information technology'],
  'Data Scientist':          ['data science', 'data analytics', 'statistics', 'computer science'],
  'Data Analyst':            ['data science', 'statistics', 'information technology'],
  'Actuary':                 ['actuarial'],
  'Quantitative Analyst':    ['actuarial', 'mathematics', 'statistics', 'finance'],
  'ML Engineer':             ['computer science', 'data science', 'artificial intelligence'],
  'Civil Engineer':          ['civil engineering', 'engineering'],
  'Mechanical Engineer':     ['mechanical engineering', 'engineering'],
  'Doctor (MBChB)':          ['mbchb', 'medicine', 'health science'],
  'Doctor':                  ['medicine', 'mbchb', 'health science'],
  'Nurse':                   ['nursing', 'health science'],
  'Lawyer':                  ['law', 'llb'],
  'Accountant':              ['accounting', 'bcom', 'finance'],
  'Financial Advisor':       ['finance', 'bcom', 'economics'],
  'Teacher':                 ['education', 'teaching', 'pgce'],
  'Entrepreneur':            ['bcom', 'management', 'business'],
  'Product Manager (Tech)':  ['computer science', 'software', 'information technology'],
  'Product Manager':         ['bcom', 'engineering', 'computer science'],
};

const TAG_TO_CAPS: Record<string, Array<keyof CapabilityData>> = {
  'STEM':            ['analytical_thinking', 'technical_aptitude'],
  'Science':         ['analytical_thinking', 'technical_aptitude'],
  'Tech':            ['technical_aptitude', 'analytical_thinking'],
  'Engineering':     ['technical_aptitude', 'analytical_thinking'],
  'Finance':         ['analytical_thinking', 'risk_tolerance_score'],
  'Business':        ['entrepreneurial_drive', 'communication_skills'],
  'Remote-friendly': ['communication_skills', 'perseverance'],
  'High growth':     ['perseverance', 'entrepreneurial_drive'],
  'Creative':        ['creative_thinking', 'communication_skills'],
  'Leadership':      ['leadership_potential', 'communication_skills'],
  'Health':          ['perseverance', 'communication_skills'],
  'Law':             ['analytical_thinking', 'communication_skills'],
};

const CAP_LABEL: Record<keyof CapabilityData, string> = {
  analytical_thinking: 'Analytical',
  creative_thinking: 'Creative',
  leadership_potential: 'Leadership',
  communication_skills: 'Communication',
  technical_aptitude: 'Technical',
  entrepreneurial_drive: 'Entrepreneurial',
  risk_tolerance_score: 'Risk tolerance',
  perseverance: 'Perseverance',
  academic_readiness: 'Academic readiness',
  career_readiness: 'Career readiness',
};

const SA_EMPLOYERS: Record<string, string[]> = {
  'Software Engineer':       ['Takealot', 'Standard Bank', 'Discovery Health', 'Investec', 'Allan Gray', 'Naspers / Prosus', 'BCX'],
  'Data Scientist':          ['Discovery Health', 'Absa', 'Old Mutual', 'DataProphet', 'BCX', 'Rand Merchant Bank', 'Sanlam'],
  'Data Analyst':            ['Discovery', 'Nedbank', 'Shoprite', 'Capitec', 'PwC', 'Deloitte', 'KPMG'],
  'Actuary':                 ['Old Mutual', 'Sanlam', 'Discovery', 'PwC', 'Deloitte', 'Liberty', 'Momentum'],
  'Quantitative Analyst':    ['Rand Merchant Bank', 'Investec', 'Absa CIB', 'Standard Bank CIB', 'Allan Gray', 'Coronation'],
  'ML Engineer':             ['DataProphet', 'Discovery', 'Naspers / Prosus', 'Standard Bank AI', 'Nuvei', 'AWS SA'],
  'Civil Engineer':          ['AECOM', 'WSP', 'Bigen Group', 'Aurecon', 'SMEC', 'eThekwini Municipality', 'SANRAL'],
  'Mechanical Engineer':     ['Sasol', 'Eskom', 'ArcelorMittal', 'AECI', 'Bidvest', 'Anglo American'],
  'Doctor (MBChB)':          ['Netcare', 'Life Healthcare', 'Mediclinic', 'Department of Health', 'NHLS', 'Groote Schuur'],
  'Doctor':                  ['Netcare', 'Life Healthcare', 'Mediclinic', 'Department of Health', 'NHLS'],
  'Nurse':                   ['Netcare', 'Life Healthcare', 'Department of Health', 'Mediclinic', 'SANBS'],
  'Lawyer':                  ['Webber Wentzel', 'Cliffe Dekker Hofmeyr', 'ENSafrica', 'Werksmans', 'DLA Piper ZA'],
  'Accountant':              ['PwC', 'Deloitte', 'EY', 'KPMG', 'Grant Thornton', 'BDO', 'Capitec'],
  'Financial Advisor':       ['Old Mutual', 'Sanlam', 'Liberty', 'Discovery', 'PSG Wealth', 'Momentum'],
  'Teacher':                 ['WCED', 'GDE', 'KZN DoE', 'Curro Holdings', 'ADvTECH', 'Spark Schools'],
  'Entrepreneur':            ['Own venture', 'Allan Gray Orbis Fellowship', 'Grindstone Accelerator', 'SEDA'],
  'Product Manager (Tech)':  ['Takealot', 'Standard Bank', 'Discovery', 'Naspers / Prosus', 'Jumo', 'Yoco'],
  'Product Manager':         ['Takealot', 'Capitec', 'Discovery', 'FNB', 'Standard Bank', 'Shoprite'],
};

const NEXT_STEPS: Record<string, string[]> = {
  'Software Engineer':       ['Build a portfolio project on GitHub (3–5 weeks)', 'Take CS50 or freeCodeCamp (free, online)', 'Apply to CS programmes with APS ≥ 30', 'Attend a hackathon this year — many are free-to-enter'],
  'Data Scientist':          ['Learn Python basics (4 weeks, Kaggle free course)', 'Complete one end-to-end data project', 'Apply to BCom/BSc Data Science or Statistics', 'Join ZA data community (DataKind SA, Zindi platform)'],
  'Data Analyst':            ['Learn SQL and Excel pivot tables (2 weeks, free online)', 'Build a dashboard project with public SA datasets', 'Apply for BCom IT or BSc Statistics programmes', 'MICT SETA offers ICT bursaries — apply by Feb deadline'],
  'Actuary':                 ['Confirm APS ≥ 42 for UCT/WITS actuarial', 'Study Maths intensively — need 80%+', 'Register for the actuarial science programme', 'Look into Allan Gray / Momentum / Sanlam bursaries'],
  'Quantitative Analyst':    ['Target APS 40+ (highly competitive entry)', 'Complete BCom Actuarial / BSc Mathematics first', 'Intern at a CIB bank in second/third year', 'CFA Level 1 (optional) strengthens postgrad applications'],
  'ML Engineer':             ['Learn Python + NumPy + pandas (6 weeks, free)', 'Complete Coursera Machine Learning Specialization', 'Apply to CS or Data Science programmes', 'Contribute to an open-source ML project for portfolio'],
  'Product Manager (Tech)':  ['Read "Inspired" by Marty Cagan — core PM framework', 'Build or help ship a small app (even no-code)', 'Apply to BCom IT or BSc Computer Science', 'Join a student startup or hackathon team as PM'],
  'Product Manager':         ['Study business + technology combination degree', 'Build a case study portfolio around a product you know', 'Apply to BCom General or BCom IT programmes', 'Reach out to a PM at a SA startup for informational chat'],
  'Civil Engineer':          ['Confirm APS ≥ 35 for engineering', 'Ensure Maths + Physical Sciences both above 60%', 'Apply to Eskom / AECOM / merSETA bursary', 'Visit ECSA website for engineering registration requirements'],
  'Mechanical Engineer':     ['APS ≥ 32 needed; Physical Sciences essential', 'Apply to Sasol / Anglo American / Eskom engineering bursary', 'merSETA bursary covers engineering — apply by March', 'Join SA Institution of Mechanical Engineering (SAIMechE) student chapter'],
  'Doctor (MBChB)':          ['Target APS 42+ (MBChB is the most competitive entry)', 'Physical Sciences + Life Sciences + Maths required', 'Apply to UKZN / Wits / UP MBChB with early deadline', 'Shadow a doctor for work-experience reference letter'],
  'Doctor':                  ['Target APS 42+ and strong Maths + Sciences', 'Apply to UKZN / Wits / Sefako Makgatho MBChB', 'Explore HWSETA / Department of Health bursary paths', 'Shadow a practitioner for a work-experience letter'],
  'Nurse':                   ['Apply for HWSETA Health bursary (covers nursing degrees)', 'Target APS ≥ 26 for nursing programmes', 'Apply to UWC / UKZN / Netcare Nursing Academy', 'Community service year is required post-graduation'],
  'Lawyer':                  ['APS ≥ 33 typically needed for LLB', 'Focus on English and History for entry', 'Apply to UWC / Wits / UP / UJ Law Faculty', 'Attend a moot court or Legal Aid SA clinic as observer'],
  'Accountant':              ['BCom Accounting at any accredited SA university', 'Target APS ≥ 32; Maths and English are prerequisite', 'Apply to PwC / KPMG / Deloitte SAICA training bursary', 'FASSET bursary available — apply by February'],
  'Financial Advisor':       ['BCom Finance or similar is preferred entry path', 'FAIS certification required post-degree (6 months)', 'Apply to Old Mutual / Sanlam training programmes', 'BANKSETA bursary available for finance students'],
  'Teacher':                 ['Apply for Funza Lushaka bursary (covers full degree costs)', 'Confirm which subject you want to specialise in (Maths/Science = priority)', 'Apply to BEd programmes at WITS / UJ / UNISA / UFS', 'Contact your district DoE about teaching placement opportunities'],
  'Entrepreneur':            ['Identify a real problem in your community to solve', 'Apply to Allan Gray Orbis Foundation (entrepreneurial scholarship)', 'Explore UCT / Wits / UJ entrepreneurship and innovation programmes', 'SEDA offers free business mentorship — register early'],
};

const DAY_IN_LIFE: Record<string, string[]> = {
  'Software Engineer':       ['Write and review code in daily stand-up sprints', 'Debug production issues and write unit tests', 'Collaborate with designers and product managers on features', 'Deploy updates via CI/CD pipelines and monitor performance'],
  'Data Scientist':          ['Extract and clean large datasets from SQL / cloud storage', 'Build and evaluate ML models in Python / Jupyter notebooks', 'Present findings and actionable insights to business stakeholders', 'Iterate on model accuracy based on real-world feedback'],
  'Data Analyst':            ['Pull data from databases and dashboards (SQL, Power BI)', 'Build reports and track KPIs for business teams', 'Identify trends and flag anomalies to decision-makers', 'Collaborate with engineers to improve data pipelines and quality'],
  'Actuary':                 ['Model insurance risk using mortality and claims tables', 'Run pricing analyses and stress-test reserve assumptions', 'Present risk reports to compliance and executive committees', 'Collaborate with product teams on new insurance product design'],
  'Quantitative Analyst':    ['Develop and back-test algorithmic trading strategies', 'Model derivative pricing and risk sensitivities in Python/R', 'Review risk exposure reports and present to risk committees', 'Research academic literature for new quantitative methods'],
  'ML Engineer':             ['Train and optimise deep learning models on GPU clusters', 'Deploy models as REST APIs and monitor drift in production', 'Profile and improve inference latency for real-time systems', 'Review pull requests and mentor junior engineers'],
  'Civil Engineer':          ['Visit construction sites to inspect structural progress', 'Review engineering drawings and sign off on compliance', 'Coordinate with contractors, surveyors, and local authorities', 'Use AutoCAD / Civil 3D to update project designs and plans'],
  'Mechanical Engineer':     ['Inspect machinery and equipment on the production floor', 'Run simulations and stress analyses using CAD/FEA software', 'Troubleshoot equipment failures and write maintenance reports', 'Coordinate with procurement for parts and with production planning'],
  'Doctor (MBChB)':          ['Conduct ward rounds and review patient notes and vitals', 'Diagnose conditions, order tests, and adjust treatment plans', 'Consult with specialists and communicate findings to families', 'Complete clinical documentation and participate in case discussions'],
  'Doctor':                  ['Conduct ward rounds and review patient notes and vitals', 'Diagnose conditions, order tests, and adjust treatment plans', 'Consult with specialists and communicate findings to families', 'Complete clinical documentation and participate in case discussions'],
  'Nurse':                   ['Administer medications and monitor patient vitals every 2-4 hours', 'Communicate patient updates to doctors and handover to next shift', 'Educate patients and families on care plans and discharge instructions', 'Document all care interventions accurately in medical records'],
  'Lawyer':                  ['Research case law and draft legal opinions or contracts', 'Consult clients on their legal options and risks', 'Attend court hearings, negotiations, or arbitration sessions', 'Review documents for due diligence or compliance purposes'],
  'Accountant':              ['Capture and reconcile financial transactions in the accounting system', 'Prepare management accounts and variance reports for leadership', 'Liaise with auditors and prepare audit support schedules', 'Ensure SARS tax deadlines and CIPC submissions are met on time'],
  'Financial Advisor':       ['Meet with clients to review their investment portfolios and goals', 'Analyse market conditions and adjust asset allocation strategies', 'Complete compliance documentation and FAIS requirements', 'Research new financial products to recommend to suitable clients'],
  'Teacher':                 ['Deliver curriculum-aligned lessons and manage classroom dynamics', 'Mark assessments and give individual feedback to learners', 'Track student progress and prepare intervention strategies', 'Attend staff meetings, training sessions, and parent consultations'],
  'Entrepreneur':            ['Review business metrics — revenue, CAC, churn — each morning', 'Hold team standups, unblock blockers, and make product decisions', 'Meet potential investors, partners, or key customers', 'Test new growth channels and analyse marketing campaign data'],
  'Product Manager (Tech)':  ['Prioritise the product backlog and refine user stories with engineers', 'Conduct user interviews and analyse in-app usage data', 'Write product requirement documents (PRDs) and roadmaps', 'Coordinate releases and run retrospectives with the delivery team'],
  'Product Manager':         ['Review user feedback, support tickets, and NPS trends', 'Align sales, marketing, and engineering around the product roadmap', 'Write specs for new features and define acceptance criteria', 'Track feature launch metrics and iterate based on adoption data'],
};

function getDayInLife(careerName: string, tags: string[]): string[] {
  if (DAY_IN_LIFE[careerName]) return DAY_IN_LIFE[careerName];
  if (tags.includes('Health')) return ['Attend patient rounds and review care plans', 'Administer treatments and document clinical notes', 'Collaborate with the multidisciplinary team on complex cases', 'Educate patients and families on health management'];
  if (tags.includes('Engineering')) return ['Review project specifications and engineering drawings', 'Coordinate with contractors and site inspectors on progress', 'Run technical simulations and check compliance standards', 'Attend project status meetings and update delivery timelines'];
  if (tags.includes('Finance')) return ['Analyse financial data and market trends each morning', 'Prepare reports and models for senior stakeholders', 'Review transactions, positions, or client portfolios', 'Ensure regulatory and compliance obligations are met'];
  if (tags.includes('Tech')) return ['Review code, resolve tickets, and unblock team members', 'Attend daily stand-ups and planning ceremonies', 'Design and test new features in the development environment', 'Monitor system performance and respond to incidents'];
  return ['Review priorities and plan the day with your team', 'Complete core deliverables and collaborate cross-functionally', 'Attend meetings, present progress, and gather feedback', "Reflect on outcomes and prepare for tomorrow's priorities"];
}

function getNextSteps(careerName: string, aps: number, minAps: number): string[] {
  const specific = NEXT_STEPS[careerName];
  if (specific) return specific;
  const gap = minAps - aps;
  return [
    gap > 0
      ? `Raise APS from ${aps} to ${minAps} — focus on your lowest-scoring subjects`
      : `Your APS of ${aps} meets the ${minAps} requirement — apply now`,
    'Research bursary options specific to this career on the Scholarships page',
    'Book an interview with a career counsellor at your school or SETA office',
    'Connect with a practitioner in this field for informational guidance',
  ];
}

function inferSubjectsFromAps(minAps: number): string {
  if (minAps >= 38) return 'Mathematics (60%+), Physical Sciences or Life Sciences, English HL';
  if (minAps >= 30) return 'Mathematics or Maths Literacy, English, relevant NSC subject';
  return 'English Home Language, any 4 NSC subjects at minimum marks';
}

const CAREER_MILESTONES: Record<string, Array<{ title: string; focus: string; milestone: string }>> = {
  'Software Engineer':      [
    { title: 'Junior Developer',        focus: 'Build features under senior guidance, fix bugs, write tests',          milestone: 'Ship your first feature to production' },
    { title: 'Mid-level Engineer',      focus: 'Own features end-to-end, review PRs, contribute to architecture',       milestone: 'Lead a small cross-team delivery' },
    { title: 'Senior Engineer',         focus: 'Drive technical direction, mentor juniors, design system components',   milestone: 'Architect a new product module independently' },
    { title: 'Principal / Staff Eng',   focus: 'Set engineering standards, influence roadmap, scale complex systems',   milestone: 'Define the tech stack for a new product line' },
  ],
  'Data Scientist':         [
    { title: 'Junior Data Scientist',   focus: 'Clean data, run EDA, build baseline models under guidance',             milestone: 'Deploy your first model to production' },
    { title: 'Data Scientist',          focus: 'Own model development, write production pipelines, present insights',   milestone: 'Drive a business decision with your analysis' },
    { title: 'Senior Data Scientist',   focus: 'Lead modelling projects, define methodology, mentor analysts',          milestone: 'Build a prediction system that runs at scale' },
    { title: 'Lead / Principal DS',     focus: 'Set ML strategy, hire and grow the team, partner with C-suite',         milestone: 'Ship an AI product used by 1M+ users' },
  ],
  'Data Analyst':           [
    { title: 'Junior Analyst',          focus: 'Pull SQL queries, build dashboards, learn the data model',              milestone: 'Own your first recurring business report' },
    { title: 'Data Analyst',            focus: 'Design dashboards, surface trends, run A/B test analyses',              milestone: 'Deliver an insight that changes a key process' },
    { title: 'Senior Analyst',          focus: 'Define analytics frameworks, mentor juniors, liaise with leadership',   milestone: 'Lead a self-serve data culture initiative' },
    { title: 'Analytics Manager',       focus: 'Manage analyst team, set data strategy, partner with product & execs', milestone: 'Build the analytics infrastructure for the company' },
  ],
  'Actuary':                [
    { title: 'Actuarial Graduate',      focus: 'Study and write professional exams, run pricing models under supervision', milestone: 'Pass your first two actuarial board exams' },
    { title: 'Actuarial Analyst',       focus: 'Own pricing models, reserving work, and regulatory submissions',         milestone: 'Sign off your first statutory valuation' },
    { title: 'Senior Actuary',          focus: 'Lead product pricing teams, present to boards, drive risk strategy',    milestone: 'Qualify as a Fellow (FASSA designation)' },
    { title: 'Chief Actuary / Partner', focus: 'Set enterprise risk appetite, advise regulators, lead large teams',     milestone: 'Lead a multi-billion rand actuarial function' },
  ],
  'Civil Engineer':         [
    { title: 'Graduate Engineer',       focus: 'Assist with designs, site inspections, AutoCAD drafting under P.Eng',   milestone: 'Pass your EC engineering registration board exam' },
    { title: 'Professional Engineer',   focus: 'Lead project designs, manage contractors, ensure ECSA compliance',      milestone: 'Register with ECSA as a Professional Engineer' },
    { title: 'Senior Engineer',         focus: 'Manage multiple projects, mentor juniors, oversee QA processes',        milestone: 'Deliver a major public infrastructure project' },
    { title: 'Director / Partner',      focus: 'Bid and win contracts, build client relationships, set firm strategy',  milestone: 'Run a R500M+ civil engineering portfolio' },
  ],
  'Mechanical Engineer':    [
    { title: 'Graduate Engineer',       focus: 'Assist with CAD designs, equipment inspection, technical drawings',     milestone: 'First full engineering design signed off by P.Eng' },
    { title: 'Professional Engineer',   focus: 'Lead mechanical design projects, coordinate with production teams',     milestone: 'Register with ECSA — Professional Engineer status' },
    { title: 'Senior Engineer',         focus: 'Manage plant equipment lifecycles, lead maintenance teams',             milestone: 'Own a major plant upgrade or new facility project' },
    { title: 'Engineering Manager',     focus: 'Run the engineering department, capex planning, headcount strategy',    milestone: 'Deliver a greenfield facility commissioning' },
  ],
  'Doctor (MBChB)':         [
    { title: 'Intern Doctor',           focus: 'Supervised patient management across 4 rotations (12 months)',          milestone: 'Complete internship — HPCSA full registration' },
    { title: 'Medical Officer',         focus: 'Independent diagnosis and treatment in district / regional hospitals',  milestone: 'Complete community service year independently' },
    { title: 'Registrar (Specialist)',  focus: 'Specialist training programme (4–5 years), exams, research',           milestone: 'Pass FC (Fellowship of College) specialist exams' },
    { title: 'Consultant / Specialist', focus: 'Run specialist practice, teach medical students, conduct research',     milestone: 'Lead a department or open a private practice' },
  ],
  'Nurse':                  [
    { title: 'Professional Nurse',      focus: 'Patient care, medication administration, clinical documentation',        milestone: 'First independent ward assignment' },
    { title: 'Charge Nurse',            focus: 'Shift management, junior nurse supervision, quality assurance',         milestone: 'Lead a ward team of 8–12 nurses' },
    { title: 'Senior Professional Nurse', focus: 'Policy implementation, clinical training, department coordination',  milestone: 'Obtain a post-basic specialty qualification' },
    { title: 'Unit / Nursing Manager',  focus: 'Manage nursing staff, rosters, budget, and clinical standards',         milestone: 'Run a fully staffed clinical unit' },
  ],
  'Lawyer':                 [
    { title: 'Candidate Attorney',      focus: '2-year articles — draft pleadings, research, client briefing under principal', milestone: 'Admission as an Attorney of the High Court' },
    { title: 'Associate Attorney',      focus: 'Manage own caseload, draft contracts, conduct research',                milestone: 'First successful litigated matter as lead attorney' },
    { title: 'Senior Associate',        focus: 'Lead complex matters, mentor candidates, build client relationships',   milestone: 'Recognised specialty area (M&A, litigation, etc.)' },
    { title: 'Partner / Director',      focus: 'Originate clients, run practice groups, set firm strategy',             milestone: 'Invited to the partnership / directorship' },
  ],
  'Accountant':             [
    { title: 'SAICA Trainee (Articles)', focus: 'Rotate across audit, tax, and advisory under a registered CA(SA)',     milestone: 'Pass ITC and APC board exams — CA(SA) designation' },
    { title: 'Financial Accountant',    focus: 'Month-end close, management accounts, SARS submissions',               milestone: 'First solo statutory audit or annual report sign-off' },
    { title: 'Senior Accountant',       focus: 'Lead finance team, produce consolidated financials, liaise with auditors', milestone: 'Promoted to Finance Manager or Controller' },
    { title: 'CFO / Finance Director',  focus: 'Capital allocation, investor relations, M&A, and board reporting',     milestone: 'Drive a company listing or major acquisition' },
  ],
  'Teacher':                [
    { title: 'Newly Qualified Teacher', focus: 'Deliver lessons, manage classroom, implement curriculum',               milestone: 'First class of students who pass their exams' },
    { title: 'Experienced Teacher',     focus: 'Lead subject department, mentor NQTs, run extramurals',                milestone: 'Appointed as Head of Department' },
    { title: 'Senior Teacher / HOD',    focus: 'Curriculum leadership, SGB participation, staff development',           milestone: 'Deliver sustained improvement in learner outcomes' },
    { title: 'School Principal / Deputy', focus: 'Manage the whole school — staff, budget, safety, community',         milestone: 'Turn around a school\'s matric pass rate' },
  ],
  'Financial Advisor':      [
    { title: 'Financial Planner (Junior)', focus: 'Assist senior advisors, product research, client admin',             milestone: 'Obtain RE5 + first class of own clients' },
    { title: 'Financial Advisor',       focus: 'Manage own client book, financial plans, investment reviews',           milestone: 'Build a R20M+ AUM book of clients' },
    { title: 'Senior Financial Advisor', focus: 'HNW client advice, complex estate planning, team leadership',         milestone: 'CFP® designation and R100M+ AUM' },
    { title: 'Wealth Manager / Director', focus: 'Run an advisory practice, lead a team, develop new business',        milestone: 'Own an independent advisory firm' },
  ],
  'Entrepreneur':           [
    { title: 'Founder / Early Stage',   focus: 'Validate problem, build MVP, find first paying customers',              milestone: 'First R10,000 in monthly recurring revenue' },
    { title: 'Growing Startup CEO',     focus: 'Hire first team, close seed funding, define product-market fit',       milestone: 'Close your first external funding round' },
    { title: 'Scale-up CEO',            focus: 'Build management team, expand to new markets, hit profitability',      milestone: 'First year of EBITDA-positive operations' },
    { title: 'Serial Entrepreneur',     focus: 'Back other founders, angel invest, run portfolio of ventures',          milestone: 'Exit a venture or list on AltX / JSE' },
  ],
};

function getCareerMilestones(careerName: string, tags: string[]): Array<{ title: string; focus: string; milestone: string }> {
  if (CAREER_MILESTONES[careerName]) return CAREER_MILESTONES[careerName];
  if (tags.includes('Tech') || tags.includes('STEM')) return [
    { title: 'Graduate / Junior', focus: 'Learn internal systems, complete supervised deliverables, build domain knowledge', milestone: 'First solo project delivered on time' },
    { title: 'Mid-level Professional', focus: 'Own deliverables independently, contribute to team decisions', milestone: 'Recognised as the go-to person for one domain' },
    { title: 'Senior Professional', focus: 'Lead projects, mentor juniors, drive strategic decisions', milestone: 'First formal leadership or management appointment' },
    { title: 'Director / Principal', focus: 'Shape organisational strategy, build and grow teams, set standards', milestone: 'Run a function or business unit independently' },
  ];
  return [
    { title: 'Entry level', focus: 'Learn the role, contribute to team output, build core competencies', milestone: 'Complete probation and take on own responsibilities' },
    { title: 'Mid-career', focus: 'Manage projects independently, develop expertise, influence outcomes', milestone: 'Promoted to senior individual contributor or team lead' },
    { title: 'Senior professional', focus: 'Drive strategy in your domain, mentor others, manage key relationships', milestone: 'Recognised as a subject matter expert internally' },
    { title: 'Leadership', focus: 'Manage teams or functions, set direction, build organisational capability', milestone: 'Lead a significant business outcome or transformation' },
  ];
}

function sparklinePoints(_baseSalary: number): string {
  const w = 160;
  const h = 48;
  const growth = [1, 1.12, 1.22, 1.35, 1.48, 1.6, 1.72, 1.82, 1.95, 2.1];
  const max = growth[growth.length - 1];
  return growth
    .map((g, i) => {
      const x = (i / (growth.length - 1)) * w;
      const y = h - ((g / max) * h * 0.85) - 4;
      return `${x},${y}`;
    })
    .join(' ');
}

export default function CareerDetailPage({ career, programmes: propProgrammes, capabilityData, psychProfile, navigate, savedProgrammeIds = [], userAps = 0 }: CareerDetailPageProps) {
  if (!career) {
    return (
      <div className="page-anim">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="subheading" style={{ marginBottom: '0.75rem' }}>No career selected</div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('careers')}>← Back to careers</button>
        </div>
      </div>
    );
  }

  const allProgs = propProgrammes && propProgrammes.length > 0 ? propProgrammes : PROGRAMMES;
  const savedSet = new Set(savedProgrammeIds);
  const keywords = CAREER_TO_KEYWORDS[career.name] ?? [];
  const keywordProgs = keywords.length > 0
    ? allProgs.filter(p => keywords.some(k => p.name.toLowerCase().includes(k)))
    : allProgs.filter(p => p.demand === career.demand && p.fit >= 70);
  const relatedProgs = (keywordProgs.length > 0 ? keywordProgs : allProgs)
    .sort((a, b) => b.fit - a.fit)
    .slice(0, 5);
  const fallbackProgs = relatedProgs.length > 0 ? relatedProgs : allProgs.sort((a, b) => b.fit - a.fit).slice(0, 3);

  // Capability requirements from the scoring engine — real required scores per cap
  const capReqs = getCareerCapRequirements(career.name);
  const capList = (Object.keys(capReqs) as Array<keyof CapabilityData>)
    .sort((a, b) => (capReqs[b] ?? 0) - (capReqs[a] ?? 0))
    .slice(0, 4);
  // Fallback to tag-based if archetype returned nothing (shouldn't happen)
  if (capList.length === 0) {
    const tagCaps = new Set<keyof CapabilityData>();
    career.tags.forEach(tag => (TAG_TO_CAPS[tag] ?? []).forEach(k => tagCaps.add(k)));
    if (tagCaps.size === 0) { tagCaps.add('analytical_thinking'); tagCaps.add('communication_skills'); }
    capList.push(...Array.from(tagCaps).slice(0, 4));
  }

  return (
    <div className="page-anim">
      <div className="page-head">
        <div className="breadcrumb">Discover · Careers · Detail</div>
        <div className="row-between">
          <div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginBottom: '0.5rem', padding: 0, fontSize: '0.8125rem' }}
              onClick={() => navigate('careers')}
            >
              ← Back to careers
            </button>
            <div className="eyebrow"><span className="dot" />Career path</div>
            <h2 className="heading" style={{ marginTop: '0.375rem' }}>{career.name}</h2>
            <p className="body-text" style={{ marginTop: '0.5rem', maxWidth: '44rem' }}>{career.why}</p>
          </div>
          <div className="row" style={{ alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <span className={`badge ${career.demand === 'High' ? 'success' : 'warning'}`}>{career.demand} demand</span>
            {career.scarce_skill && (
              <span className="badge accent">Scarce skill</span>
            )}
            <div className="card compact" style={{ textAlign: 'center', padding: '0.5rem 0.875rem', minWidth: 80 }}>
              <div style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.04em' }}>{career.match}</div>
              <div className="caption" style={{ fontSize: '0.625rem' }}>/ 100 match</div>
            </div>
          </div>
        </div>
      </div>

      {/* Score breakdown — only when psychProfile + capabilityData are available */}
      {psychProfile && capabilityData && (() => {
        const bd = scoreCareerMatchBreakdown(career.name, psychProfile, capabilityData, userAps);
        const components: Array<{ label: string; score: number; weight: string; tip: string }> = [
          {
            label: 'Personality type (RIASEC)',
            score: bd.riasec,
            weight: '38%',
            tip: bd.weakestRiasec && bd.riasec < 85
              ? `Your ${bd.weakestRiasec.trait} trait (${bd.weakestRiasec.yours}/100) is lower than the ${bd.weakestRiasec.required} ideal for this career.`
              : 'Your personality type aligns well with what this career demands.',
          },
          {
            label: 'Capability readiness',
            score: bd.caps,
            weight: '30%',
            tip: bd.weakestCap && bd.caps < 85
              ? `${bd.weakestCap.label} (${bd.weakestCap.yours}/100) is below the ${bd.weakestCap.required} required. Open Skills Map for a specific development plan.`
              : 'Your capabilities match what this career requires.',
          },
          {
            label: 'Big Five personality fit',
            score: bd.bigFive,
            weight: '15%',
            tip: bd.bigFive < 80
              ? 'Some Big Five traits fall outside the ideal zone for this career. Personality is stable short-term but develops naturally with practice.'
              : 'Your personality traits are within the ideal range for this career.',
          },
          {
            label: 'APS academic gate',
            score: bd.aps,
            weight: '17%',
            tip: bd.apsGap > 0
              ? `Your APS (${userAps}) is ${bd.apsGap} point${bd.apsGap !== 1 ? 's' : ''} below the ${bd.archMinAps} required. Open the Simulator to find the cheapest path.`
              : `Your APS meets the ${bd.archMinAps ?? 'minimum'} requirement — this gate is cleared.`,
          },
        ];
        const lowestComponent = [...components].sort((a, b) => a.score - b.score)[0];
        return (
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div className="row-between" style={{ marginBottom: '0.875rem' }}>
              <div>
                <div className="eyebrow"><span className="dot" />Why this match score?</div>
                <h3 className="subheading" style={{ marginTop: '0.25rem' }}>
                  {bd.overall}/100 overall · 4 engines
                </h3>
              </div>
              <span className={`badge ${bd.overall >= 80 ? 'success' : bd.overall >= 65 ? 'primary' : 'warning'}`}>
                {bd.overall >= 80 ? 'Strong match' : bd.overall >= 65 ? 'Good match' : 'Gaps exist'}
              </span>
            </div>
            <div className="stack-2">
              {components.map(({ label, score, weight, tip }) => (
                <div key={label}>
                  <div className="row-between" style={{ marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{label}</span>
                      <span className="caption" style={{ fontSize: '0.6rem', color: 'hsl(var(--muted-fg))' }}>{weight}</span>
                    </div>
                    <span style={{
                      fontWeight: 800, fontSize: '0.9375rem', fontVariantNumeric: 'tabular-nums',
                      color: score >= 80 ? 'hsl(var(--success))' : score >= 65 ? 'hsl(var(--fg))' : 'hsl(var(--warning))',
                    }}>{score}</span>
                  </div>
                  <div className="meter" style={{ position: 'relative' }}>
                    <i style={{ width: `${score}%`, background: score >= 80 ? undefined : score >= 65 ? 'hsl(var(--primary))' : 'hsl(var(--warning))' }} />
                  </div>
                  <div className="caption" style={{ marginTop: '0.25rem', fontSize: '0.6875rem', lineHeight: 1.4 }}>{tip}</div>
                </div>
              ))}
            </div>
            {lowestComponent.score < 75 && (
              <div style={{
                marginTop: '0.875rem', padding: '0.75rem',
                background: 'hsl(var(--primary) / 0.04)',
                border: '1px solid hsl(var(--primary) / 0.2)',
                borderRadius: 'var(--r-md)',
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                  Highest-leverage improvement: {lowestComponent.label}
                </div>
                <p className="caption" style={{ fontSize: '0.75rem', lineHeight: 1.5, margin: 0 }}>
                  {lowestComponent.tip}
                </p>
              </div>
            )}
          </div>
        );
      })()}

      {/* Path visualization */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="eyebrow" style={{ marginBottom: '1rem' }}><span className="dot" />Your path to this career</div>
        <div className="path-viz">
          {[
            { icon: '🎯', label: 'Career goal', sub: career.name },
            null,
            { icon: '🎓', label: 'Qualification', sub: `${fallbackProgs[0]?.name ?? 'Degree programme'} or similar` },
            null,
            { icon: '📚', label: 'Required subjects', sub: inferSubjectsFromAps(fallbackProgs[0]?.aps ?? 30) },
            null,
            { icon: '🧠', label: 'Key capabilities', sub: capList.map(k => CAP_LABEL[k]).join(', ') },
          ].map((item, i) =>
            item === null ? (
              <div key={`arrow-${i}`} className="path-viz-arrow">↓</div>
            ) : (
              <div key={item.label} className="path-viz-step">
                <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.75rem' }}>{item.label}</div>
                <div className="caption" style={{ fontSize: '0.625rem', marginTop: '0.25rem' }}>{item.sub}</div>
              </div>
            )
          )}
        </div>
      </div>

      <div className="grid-2 stack-3" style={{ alignItems: 'start' }}>
        {/* Left column */}
        <div className="stack-3">
          {/* Leading programmes */}
          <div className="card">
            <div className="row-between" style={{ marginBottom: '0.875rem' }}>
              <div className="eyebrow"><span className="dot" />Degree pathways to this career</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('programmes')}>
                All →
              </button>
            </div>
            <div className="stack">
              {fallbackProgs.map(p => {
                const apsGap = Math.max(0, p.aps - userAps);
                const isSaved = savedSet.has(p.id);
                return (
                  <div
                    key={p.id}
                    style={{ padding: '0.75rem 0', borderBottom: '1px solid hsl(var(--border))', cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate('programmes', p.id)}
                    onKeyDown={e => e.key === 'Enter' && navigate('programmes', p.id)}
                  >
                    <div className="row-between" style={{ marginBottom: '0.25rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                      <div className="row" style={{ gap: '0.375rem' }}>
                        {isSaved && (
                          <span className="badge brand" style={{ height: '1rem', fontSize: '0.5625rem', padding: '0 0.25rem' }}>★ Saved</span>
                        )}
                        <span className={`badge ${p.pathway}`}>{p.pathway}</span>
                      </div>
                    </div>
                    <div className="caption" style={{ marginTop: 2 }}>{p.uni}</div>
                    <div className="row" style={{ gap: '0.875rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                      <span>
                        APS <strong style={{ color: apsGap === 0 ? 'hsl(var(--success))' : apsGap <= 3 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))' }}>{p.aps}</strong>
                        {apsGap > 0 && <span className="caption"> (+{apsGap})</span>}
                      </span>
                      <span>{fmtR(p.fees)}/yr</span>
                      <span style={{ marginLeft: 'auto', fontWeight: 800 }}>{p.fit}% fit</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Salary progression */}
          <div className="card">
            <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Salary progression &amp; career arc</div>
            {(() => {
              const milestones = getCareerMilestones(career.name, career.tags);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { level: 'Entry',  years: '0–3 yrs',  mult: 0.55, cls: '' },
                    { level: 'Mid',    years: '4–7 yrs',  mult: 1.0,  cls: '' },
                    { level: 'Senior', years: '8–14 yrs', mult: 1.6,  cls: 'success' },
                    { level: 'Lead',   years: '15+ yrs',  mult: 2.2,  cls: 'success' },
                  ].map(({ level, years, mult, cls }, idx) => {
                    const amt = Math.round(career.salary * mult);
                    const m = milestones[idx];
                    return (
                      <div key={level} style={{
                        display: 'grid', gridTemplateColumns: '7rem 1fr',
                        gap: '0.875rem', alignItems: 'start',
                        paddingBottom: '0.75rem',
                        borderBottom: idx < 3 ? '1px solid hsl(var(--border))' : 'none',
                      }}>
                        <div className="card compact" style={{ padding: '0.625rem 0.75rem' }}>
                          <div className="caption" style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{level}</div>
                          <div style={{
                            fontWeight: 900, fontSize: '1.125rem', letterSpacing: '-0.03em',
                            fontVariantNumeric: 'tabular-nums',
                            color: cls ? `hsl(var(--${cls}))` : undefined,
                            marginTop: '0.125rem',
                          }}>
                            {fmtR(amt)}
                          </div>
                          <div className="caption" style={{ fontSize: '0.5625rem', marginTop: '0.0625rem' }}>/mo · {years}</div>
                          <div className="meter sm" style={{ marginTop: '0.5rem' }}>
                            <i style={{ width: `${Math.min(100, Math.round((mult / 2.2) * 100))}%`, background: cls ? `hsl(var(--${cls}))` : undefined }} />
                          </div>
                        </div>
                        {m && (
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{m.title}</div>
                            <div className="caption" style={{ marginTop: '0.25rem', fontSize: '0.75rem', lineHeight: 1.4 }}>{m.focus}</div>
                            <div style={{
                              marginTop: '0.375rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                              fontSize: '0.6875rem', color: 'hsl(var(--primary))', fontWeight: 600,
                            }}>
                              <span>★</span>
                              <span>{m.milestone}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <div style={{ borderTop: '1px solid hsl(var(--border))', marginTop: '0.875rem', paddingTop: '0.75rem' }}>
              <svg width="100%" viewBox="0 0 160 36" preserveAspectRatio="none" style={{ display: 'block', height: 36 }}>
                <polyline
                  points={sparklinePoints(career.salary)}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
              <div className="row-between" style={{ marginTop: '0.25rem' }}>
                <span className="caption" style={{ fontSize: '0.625rem' }}>Year 1</span>
                <span className="caption" style={{ fontSize: '0.625rem', color: 'hsl(var(--success))' }}>10-yr growth: {career.growth}</span>
              </div>
            </div>
          </div>

          {/* Top SA employers */}
          {(() => {
            const employers = SA_EMPLOYERS[career.name] ?? SA_EMPLOYERS['Accountant'];
            return (
              <div className="card">
                <div className="eyebrow" style={{ marginBottom: '0.75rem' }}><span className="dot" />Top SA employers</div>
                <div className="row" style={{ gap: '0.375rem', flexWrap: 'wrap' }}>
                  {employers.map(e => (
                    <span key={e} className="career-tag" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>{e}</span>
                  ))}
                </div>
                <div className="caption" style={{ marginTop: '0.625rem', fontSize: '0.6875rem' }}>
                  Companies actively recruiting {career.name}s in South Africa.
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right column */}
        <div className="stack-3">
          {/* Tags */}
          <div className="card">
            <div className="eyebrow" style={{ marginBottom: '0.75rem' }}><span className="dot" />Career profile</div>
            <div className="row" style={{ gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
              {career.tags.map(t => (
                <span key={t} className="career-tag">{t}</span>
              ))}
            </div>
            <div className="stack-2">
              {[
                { l: 'Median monthly salary', v: `${fmtR(career.salary)}/mo` },
                { l: '10-year growth', v: career.growth },
                { l: 'Market demand', v: `${career.demand} demand` },
                { l: 'Match score', v: `${career.match}/100` },
              ].map(row => (
                <div key={row.l} className="stat-pair">
                  <div className="l">{row.l}</div>
                  <div className="v" style={{ fontSize: '0.875rem' }}>{row.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Day in the life */}
          {(() => {
            const tasks = getDayInLife(career.name, career.tags);
            return (
              <div className="card">
                <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />A day in the life</div>
                <div className="stack">
                  {tasks.map((task, i) => (
                    <div key={i} className="row" style={{ gap: '0.625rem', padding: '0.4375rem 0', borderBottom: '1px solid hsl(var(--border))', alignItems: 'flex-start' }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: 999, flexShrink: 0,
                        background: 'hsl(var(--primary))', marginTop: '0.375rem',
                      }} />
                      <span style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>{task}</span>
                    </div>
                  ))}
                </div>
                <div className="caption" style={{ marginTop: '0.625rem', fontSize: '0.6875rem' }}>
                  Typical responsibilities across a working day as a {career.name} in South Africa.
                </div>
              </div>
            );
          })()}

          {/* Actionable next steps */}
          {(() => {
            const minAps = fallbackProgs[0]?.aps ?? 30;
            const steps = getNextSteps(career.name, userAps, minAps);
            return (
              <div className="card">
                <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Your next steps</div>
                <div className="stack">
                  {steps.map((step, i) => (
                    <div key={i} className="row" style={{ gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid hsl(var(--border))', alignItems: 'flex-start' }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: 999, flexShrink: 0,
                        background: i === 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                        color: i === 0 ? 'hsl(var(--primary-fg))' : 'hsl(var(--muted-fg))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.6875rem', marginTop: 1,
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>{step}</span>
                    </div>
                  ))}
                </div>
                <div className="row" style={{ marginTop: '0.875rem' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('programmes')}>Browse programmes →</button>
                  <button className="btn btn-outline btn-sm" onClick={() => navigate('scholarships')}>Find funding →</button>
                </div>
              </div>
            );
          })()}

          {/* Skills gap */}
          {capabilityData && (
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: '0.875rem' }}><span className="dot" />Capability alignment</div>
              <div className="stack">
                {capList.map(key => {
                  const required = capReqs[key] ?? 70;
                  const yours = capabilityData[key] as number;
                  const gap = Math.max(0, required - yours);
                  return (
                    <div key={key}>
                      <div className="progress-row">
                        <span className="label">{CAP_LABEL[key]}</span>
                        <div className="meter" style={{ flex: 1, position: 'relative' }}>
                          <i style={{ width: `${yours}%`, background: gap > 0 ? 'hsl(var(--warning))' : undefined }} />
                          {/* Target marker */}
                          <span style={{
                            position: 'absolute', top: 0, bottom: 0, left: `${required}%`,
                            width: 2, background: 'hsl(var(--fg) / 0.35)',
                          }} />
                        </div>
                        <span className="val" style={{ color: gap > 0 ? 'hsl(var(--warning))' : 'hsl(var(--success))' }}>
                          {yours}<span className="caption">/{required}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="caption" style={{ marginTop: '0.75rem', fontSize: '0.6875rem' }}>
                Bar line = target for {career.name}. Yellow = gap to address.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
