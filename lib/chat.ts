export interface ChatTurn { role: 'user' | 'assistant'; content: string; }

export const ROUTE_LABELS: Record<string, string> = {
  home:         'Dashboard',
  programmes:   'Programme Explorer',
  careers:      'Career Explorer',
  scholarships: 'Scholarships',
  simulator:    'APS Simulator',
  funding:      'Funding Strategy',
  nsfas:        'NSFAS Calculator',
  deadlines:    'Deadlines',
  intelligence: 'Intelligence',
  cognitive:    'Cognitive Assessment',
  skills:       'Skills Map',
  map:          'Opportunity Map',
  unis:         'Universities',
  compare:      'Career Compare',
  discover:     'Discover AI',
  applications: 'Applications',
  documents:    'Documents',
};
