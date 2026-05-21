export interface ChatTurn { role: 'user' | 'assistant'; content: string; }

export const ROUTE_LABELS: Record<string, string> = {
  programmes:  'Programme Explorer',
  careers:     'Careers',
  scholarships: 'Scholarships',
  simulator:   'APS Simulator',
  funding:     'Funding Strategy',
  nsfas:       'NSFAS Guide',
  deadlines:   'Deadlines',
};
