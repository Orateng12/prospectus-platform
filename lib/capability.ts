import type { CapabilityData } from './types';

// Maps DB capability_graphs column names to display labels
export const DB_TO_CAP: Array<[keyof CapabilityData, string]> = [
  ['analytical_thinking',  'Analytical'],
  ['technical_aptitude',   'Technical'],
  ['communication_skills', 'Social'],
  ['creative_thinking',    'Creative'],
  ['leadership_potential', 'Verbal'],
  ['academic_readiness',   'Numerical'],
  ['risk_tolerance_score', 'Spatial'],
  ['entrepreneurial_drive','Practical'],
];

export const CAP_DB_LABEL: Record<keyof CapabilityData, string> = {
  analytical_thinking:  'Analytical',
  technical_aptitude:   'Technical',
  communication_skills: 'Communication',
  creative_thinking:    'Creative',
  leadership_potential: 'Leadership',
  academic_readiness:   'Academic',
  risk_tolerance_score: 'Risk tolerance',
  entrepreneurial_drive:'Entrepreneurial',
  perseverance:         'Perseverance',
  career_readiness:     'Career readiness',
};

export const CAP_DESCRIPTIONS: Record<string, string> = {
  Analytical: 'Pattern recognition · structured reasoning',
  Technical:  'Tool mastery · systems thinking',
  Social:     'Empathy · group dynamics',
  Creative:   'Divergent thinking · synthesis',
  Verbal:     'Comprehension · written expression',
  Numerical:  'Quantitative fluency · statistics',
  Spatial:    'Visualisation · 3D reasoning',
  Practical:  'Real-world execution · hands-on',
};

export const BIG5_LABEL: Record<string, string> = {
  conscientiousness: 'Conscientiousness',
  openness:          'Openness',
  extraversion:      'Extraversion',
  agreeableness:     'Agreeableness',
  neuroticism:       'Neuroticism',
};

export const BIG5_DESC: Record<string, string> = {
  conscientiousness: 'Organisation · diligence · reliability',
  openness:          'Curiosity · imagination · flexibility',
  extraversion:      'Sociability · assertiveness · energy',
  agreeableness:     'Empathy · cooperation · trust',
  neuroticism:       'Emotional stability · stress management',
};
