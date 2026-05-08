'use client';

import { useState, useCallback } from 'react';
import type {
  Route, Subject, Programme, Career,
  PsychProfileData, CapabilityData, StrategicScoreData, DbApplication,
} from '@/lib/types';
import { SUBJECTS } from '@/lib/data';
import { calcAPS } from '@/lib/utils';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import HomePage from './pages/HomePage';
import IntelligencePage from './pages/IntelligencePage';
import SimulatorPage from './pages/SimulatorPage';
import ProgrammePage from './pages/ProgrammePage';
import FundingPage from './pages/FundingPage';
import FinancialPage from './pages/FinancialPage';
import CareersPage from './pages/CareersPage';
import CognitivePage from './pages/CognitivePage';
import SkillsPage from './pages/SkillsPage';
import MapPage from './pages/MapPage';

interface DashboardProps {
  initialSubjects?: Subject[];
  initialProgrammes?: Programme[];
  userAps?: number;
  userName?: string;
  userFirstName?: string;
  userProvince?: string;
  householdIncome?: number;
  psychProfile?: PsychProfileData | null;
  capabilityData?: CapabilityData | null;
  strategicScore?: StrategicScoreData | null;
  applications?: DbApplication[];
  careers?: Career[];
  savedProgrammeIds?: string[];
}

export default function Dashboard({
  initialSubjects,
  initialProgrammes,
  userAps: _userAps,
  userName = 'Student',
  userFirstName = 'there',
  userProvince,
  householdIncome,
  psychProfile,
  capabilityData,
  strategicScore,
  applications = [],
  careers,
  savedProgrammeIds = [],
}: DashboardProps) {
  const [route, setRoute] = useState<Route>('home');
  const [subjects, setSubjects] = useState<Subject[]>(
    () => (initialSubjects ?? SUBJECTS).map(s => ({ ...s }))
  );
  const [selectedProg, setSelectedProg] = useState('');

  const navigate = useCallback((r: Route, prog?: string) => {
    setSelectedProg(prog ?? '');
    setRoute(r);
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

  function renderPage() {
    switch (route) {
      case 'intelligence':
        return (
          <IntelligencePage
            navigate={navigate}
            strategicScore={strategicScore}
            capabilityData={capabilityData}
            programmes={initialProgrammes}
            careers={careers}
            psychProfile={psychProfile}
            subjects={subjects}
            userAps={calcAPS(subjects)}
          />
        );
      case 'simulator':
        return (
          <SimulatorPage
            subjects={subjects}
            onSubjectChange={handleSubjectChange}
            onReset={handleReset}
            onSaved={handleSubjectsSaved}
            programmes={initialProgrammes}
            onNavigateProgramme={(progId) => navigate('programmes', progId)}
          />
        );
      case 'programmes':
        return (
          <ProgrammePage
            selectedProg={selectedProg}
            subjects={subjects}
            navigate={navigate}
            programmes={initialProgrammes}
            savedProgrammeIds={savedProgrammeIds}
          />
        );
      case 'funding':
        return <FundingPage />;
      case 'financial':
        return <FinancialPage subjects={subjects} householdIncome={householdIncome} />;
      case 'careers':
        return <CareersPage careers={careers} />;
      case 'cognitive':
        return <CognitivePage psychProfile={psychProfile} />;
      case 'skills':
        return <SkillsPage capabilityData={capabilityData} />;
      case 'map':
        return <MapPage />;
      default:
        return (
          <HomePage
            subjects={subjects}
            navigate={navigate}
            programmes={initialProgrammes}
            applications={applications}
            strategicScore={strategicScore}
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
      />
      <main className="main">
        <Topbar route={route} userFirstName={userFirstName} />
        <div key={route}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
