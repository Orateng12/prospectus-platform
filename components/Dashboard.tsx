'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type {
  Route, Subject, Programme, Career, CompareItem, Application, Scholarship,
  PsychProfileData, CapabilityData, StrategicScoreData, DbApplication, DbDocument,
} from '@/lib/types';
import { SUBJECTS, CAREERS as STATIC_CAREERS, SCHOLARSHIPS as STATIC_SCHOLARSHIPS } from '@/lib/data';
import { calcAPS } from '@/lib/utils';
import { scoreCareerMatch } from '@/lib/scoring';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import HomePage from './pages/HomePage';
import IntelligencePage from './pages/IntelligencePage';
import SimulatorPage from './pages/SimulatorPage';
import ProgrammePage from './pages/ProgrammePage';
import FundingPage from './pages/FundingPage';
import CareersPage from './pages/CareersPage';
import CognitivePage from './pages/CognitivePage';
import UniversitiesPage from './pages/UniversitiesPage';
import CareerComparePage from './pages/CareerComparePage';
import ScholarshipsPage from './pages/ScholarshipsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import DocumentsPage from './pages/DocumentsPage';
import DeadlinesPage from './pages/DeadlinesPage';
import ProfilePage from './pages/ProfilePage';
import CompareDrawer from './CompareDrawer';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import CareerDetailPage from './pages/CareerDetailPage';
import ScholarshipDetailPage from './pages/ScholarshipDetailPage';
import SubjectDetailPage from './pages/SubjectDetailPage';

const BASE_APS = 42;

interface DashboardProps {
  initialSubjects?: Subject[];
  initialProgrammes?: Programme[];
  userAps?: number;
  userName?: string;
  userFirstName?: string;
  userLastName?: string;
  userEmail?: string;
  userProvince?: string;
  householdIncome?: number;
  matricYear?: number;
  psychProfile?: PsychProfileData | null;
  capabilityData?: CapabilityData | null;
  strategicScore?: StrategicScoreData | null;
  applications?: DbApplication[];
  careers?: Career[];
  savedProgrammeIds?: string[];
  appliedScholarshipNames?: string[];
  documents?: DbDocument[];
  unreadNotificationCount?: number;
}

export default function Dashboard({
  initialSubjects,
  initialProgrammes,
  userAps: _userAps,
  userName = 'Student',
  userFirstName = 'there',
  userLastName = '',
  userEmail = '',
  userProvince,
  householdIncome,
  matricYear,
  psychProfile,
  capabilityData,
  strategicScore,
  applications = [],
  careers,
  savedProgrammeIds = [],
  appliedScholarshipNames = [],
  documents = [],
  unreadNotificationCount = 0,
}: DashboardProps) {
  const router = useRouter();
  const [route, setRoute] = useState<Route>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>(
    () => (initialSubjects ?? SUBJECTS).map(s => ({ ...s }))
  );
  const [selectedProg, setSelectedProg] = useState('');
  const [compareItems, setCompareItems] = useState<CompareItem[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [emptyMode, setEmptyMode] = useState(false);

  const aps = calcAPS(subjects);
  const apsDelta = aps - BASE_APS;

  // Live match scores for every career — used in CompareDrawer subtitles and CareerComparePage
  const liveCareerMatches = useMemo(() =>
    (careers ?? STATIC_CAREERS).reduce<Record<string, number>>((acc, c) => {
      acc[c.name] = psychProfile && capabilityData
        ? scoreCareerMatch(c.name, psychProfile, capabilityData, aps)
        : c.match;
      return acc;
    }, {}),
  [careers, psychProfile, capabilityData, aps]);

  // Sidebar live counts
  const pendingAppCount = applications.filter(a =>
    ['draft', 'pending', 'submitted'].includes(a.status.toLowerCase())
  ).length;
  const appliedSet = new Set(appliedScholarshipNames);
  const unappliedScholarshipCount = STATIC_SCHOLARSHIPS.filter(s => !appliedSet.has(s.name)).length;

  const emptySubjects = (initialSubjects ?? SUBJECTS).map(s => ({ ...s, mark: 50 }));
  const displaySubjects = emptyMode ? emptySubjects : subjects;
  const displayAps = emptyMode ? calcAPS(emptySubjects) : aps;

  const navigate = useCallback((r: Route, prog?: string) => {
    setSelectedProg(prog ?? '');
    setRoute(r);
    setSidebarOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  const handleSubjectChange = useCallback((id: string, mark: number) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, mark } : s));
  }, []);

  const handleSubjectsSaved = useCallback((saved: Subject[]) => {
    setSubjects(saved);
  }, []);

  const handleReset = useCallback(() => {
    setSubjects((initialSubjects ?? SUBJECTS).map(s => ({ ...s })));
  }, [initialSubjects]);

  const toggleCompare = useCallback((item: CompareItem) => {
    setCompareItems(prev => {
      const idx = prev.findIndex(c => c.id === item.id);
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      if (prev.length >= 4) return prev;
      return [...prev, item];
    });
  }, []);

  const clearCompare = useCallback(() => setCompareItems([]), []);

  const navigateToDetail = useCallback((
    type: 'application-detail' | 'scholarship-detail' | 'career-detail' | 'subject-detail',
    item: Application | Scholarship | Career | Subject,
  ) => {
    if (type === 'application-detail') setSelectedApplication(item as Application);
    else if (type === 'scholarship-detail') setSelectedScholarship(item as Scholarship);
    else if (type === 'career-detail') setSelectedCareer(item as Career);
    else if (type === 'subject-detail') setSelectedSubject(item as Subject);
    navigate(type);
  }, [navigate]);

  function renderPage() {
    const displayApplications = emptyMode ? [] : applications;
    const displaySavedIds = emptyMode ? [] : savedProgrammeIds;
    const displayStrategic = emptyMode ? null : strategicScore;
    const displayPsych = emptyMode ? null : psychProfile;
    const displayCap = emptyMode ? null : capabilityData;

    switch (route) {
      case 'intelligence':
        return (
          <IntelligencePage
            navigate={navigate}
            strategicScore={displayStrategic}
            capabilityData={displayCap}
            programmes={initialProgrammes}
            careers={careers}
            psychProfile={displayPsych}
            subjects={displaySubjects}
            userAps={displayAps}
          />
        );
      case 'simulator':
        return (
          <SimulatorPage
            subjects={displaySubjects}
            onSubjectChange={handleSubjectChange}
            onReset={handleReset}
            onSaved={handleSubjectsSaved}
            programmes={initialProgrammes}
            onNavigateProgramme={(progId) => navigate('programmes', progId)}
            onOpenDetail={(s) => navigateToDetail('subject-detail', s)}
          />
        );
      case 'programmes':
        return (
          <ProgrammePage
            selectedProg={selectedProg}
            subjects={displaySubjects}
            navigate={navigate}
            programmes={initialProgrammes}
            savedProgrammeIds={displaySavedIds}
            psychProfile={displayPsych}
            capabilityData={displayCap}
            userAps={displayAps}
          />
        );
      case 'funding':
        return <FundingPage householdIncome={householdIncome} userAps={displayAps} programmes={initialProgrammes} navigate={navigate} />;
      case 'nsfas':
        return <FundingPage householdIncome={householdIncome} userAps={displayAps} programmes={initialProgrammes} navigate={navigate} />;
      case 'financial':
        return <FundingPage householdIncome={householdIncome} userAps={displayAps} programmes={initialProgrammes} navigate={navigate} />;
      case 'careers':
        return (
          <CareersPage
            careers={careers}
            compareItems={compareItems}
            onToggleCompare={toggleCompare}
            userAps={displayAps}
            psychProfile={displayPsych}
            capabilityData={displayCap}
            onOpenDetail={(c) => navigateToDetail('career-detail', c)}
            navigate={navigate}
          />
        );
      case 'discover':
        return (
          <CareersPage
            careers={careers}
            compareItems={compareItems}
            onToggleCompare={toggleCompare}
            userAps={displayAps}
            psychProfile={displayPsych}
            capabilityData={displayCap}
            onOpenDetail={(c) => navigateToDetail('career-detail', c)}
            navigate={navigate}
            initialTab="discover"
          />
        );
      case 'cognitive':
        return (
          <CognitivePage
            psychProfile={displayPsych}
            capabilityData={displayCap}
            careers={careers}
            userAps={displayAps}
            onRetake={() => router.push('/onboarding?retake=true')}
          />
        );
      case 'skills':
        return (
          <CognitivePage
            psychProfile={displayPsych}
            capabilityData={displayCap}
            careers={careers}
            userAps={displayAps}
            initialTab="skills"
            onRetake={() => router.push('/onboarding?retake=true')}
          />
        );
      case 'map':
        return <UniversitiesPage subjects={displaySubjects} navigate={navigate} compareItems={compareItems} onToggleCompare={toggleCompare} userProvince={userProvince} />;
      case 'unis':
        return <UniversitiesPage subjects={displaySubjects} navigate={navigate} compareItems={compareItems} onToggleCompare={toggleCompare} userProvince={userProvince} />;
      case 'compare':
        return (
          <CareerComparePage
            compareItems={compareItems}
            onClear={clearCompare}
            navigate={navigate}
            psychProfile={displayPsych}
            capabilityData={displayCap}
            userAps={displayAps}
            liveCareerMatches={liveCareerMatches}
          />
        );
      case 'scholarships':
        return (
          <ScholarshipsPage
            userAps={displayAps}
            householdIncome={householdIncome}
            compareItems={compareItems}
            onToggleCompare={toggleCompare}
            onOpenDetail={(s) => navigateToDetail('scholarship-detail', s)}
            appliedScholarshipNames={emptyMode ? [] : appliedScholarshipNames}
          />
        );
      case 'applications':
        return (
          <ApplicationsPage
            applications={emptyMode ? [] : (applications.length > 0 ? applications : undefined)}
            onOpenDetail={(a) => navigateToDetail('application-detail', a)}
            programmes={initialProgrammes}
          />
        );
      case 'documents':
        return <DocumentsPage navigate={navigate} documents={emptyMode ? [] : documents} />;
      case 'deadlines':
        return <DeadlinesPage navigate={navigate} applications={emptyMode ? [] : applications} />;
      case 'profile':
        return (
          <ProfilePage
            userName={userName}
            userFirstName={userFirstName}
            userLastName={userLastName}
            userEmail={userEmail}
            userProvince={userProvince}
            matricYear={matricYear}
            subjects={subjects}
            householdIncome={householdIncome}
            capabilityData={displayCap}
            psychProfile={displayPsych}
            emptyMode={emptyMode}
            onToggleEmptyMode={() => setEmptyMode(p => !p)}
            onSubjectsSaved={handleSubjectsSaved}
          />
        );
      case 'application-detail':
        return <ApplicationDetailPage application={selectedApplication} navigate={navigate} />;
      case 'career-detail':
        return (
          <CareerDetailPage
            career={selectedCareer}
            programmes={initialProgrammes}
            capabilityData={displayCap}
            navigate={navigate}
          />
        );
      case 'scholarship-detail':
        return (
          <ScholarshipDetailPage
            scholarship={selectedScholarship}
            userAps={displayAps}
            householdIncome={householdIncome}
            userProvince={userProvince}
            userName={userName}
            navigate={navigate}
          />
        );
      case 'subject-detail':
        return (
          <SubjectDetailPage
            subject={selectedSubject}
            subjects={displaySubjects}
            programmes={initialProgrammes}
            savedProgrammeIds={displaySavedIds}
            navigate={navigate}
          />
        );
      default:
        return (
          <HomePage
            subjects={displaySubjects}
            navigate={navigate}
            programmes={initialProgrammes}
            applications={displayApplications}
            strategicScore={displayStrategic}
            householdIncome={householdIncome}
            savedProgrammeIds={displaySavedIds}
            psychProfile={displayPsych}
            capabilityData={displayCap}
          />
        );
    }
  }

  return (
    <div className="app">
      <Sidebar
        route={route}
        navigate={navigate}
        userName={userName}
        userProvince={userProvince}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingAppCount={pendingAppCount}
        unappliedScholarshipCount={unappliedScholarshipCount}
      />
      <div
        className={`sidebar-backdrop${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <main className="main">
        <Topbar
          route={route}
          userFirstName={userFirstName}
          userName={userName}
          userEmail={userEmail}
          aps={aps}
          apsDelta={apsDelta}
          navigate={navigate}
          onMenuClick={() => setSidebarOpen(true)}
          unreadNotificationCount={unreadNotificationCount}
        />
        <div key={route}>
          {renderPage()}
        </div>
        <CompareDrawer items={compareItems} onToggle={toggleCompare} onClear={clearCompare} navigate={navigate} liveCareerMatches={liveCareerMatches} />
      </main>
    </div>
  );
}
