export interface DevelopmentAction {
  action: string;
  timeframe: string;
  resource: string;
}

export const DEVELOPMENT_ACTIONS: Record<string, DevelopmentAction[]> = {
  Analytical: [
    { action: 'Solve 3 logic puzzles daily', timeframe: '4 weeks', resource: 'Brilliant.org (free tier)' },
    { action: 'Study Statistics fundamentals', timeframe: '6 weeks', resource: 'Khan Academy Statistics' },
    { action: 'Practice data interpretation with past NSC papers', timeframe: 'Ongoing', resource: 'SAAEA exam archive' },
  ],
  Technical: [
    { action: 'Build one complete project from scratch', timeframe: '4–6 weeks', resource: 'freeCodeCamp or The Odin Project' },
    { action: 'Master Excel / Google Sheets to advanced level', timeframe: '2 weeks', resource: 'ExcelJet tutorials (free)' },
    { action: 'Complete one structured online course', timeframe: '6–8 weeks', resource: 'Coursera / edX (audit free)' },
  ],
  Social: [
    { action: 'Join one student society or community org', timeframe: 'This term', resource: 'School / campus noticeboard' },
    { action: 'Practice active listening — paraphrase 3 conversations daily', timeframe: '2 weeks', resource: 'Self-directed practice' },
    { action: 'Lead a study group or small project team', timeframe: 'Next month', resource: 'Class peers' },
  ],
  Creative: [
    { action: 'Complete a side project on a problem you care about', timeframe: '4–6 weeks', resource: 'Self-directed' },
    { action: 'Sketch 3 ideas for a random problem every morning (5 min)', timeframe: '3 weeks', resource: 'Notebook' },
    { action: 'Study one design discipline (UX, architecture, writing)', timeframe: '4 weeks', resource: 'YouTube / Canva Design School' },
  ],
  Verbal: [
    { action: 'Read one non-fiction article and summarise it daily', timeframe: '4 weeks', resource: 'Mail & Guardian, Daily Maverick' },
    { action: 'Write a 300-word reflection each week on what you learned', timeframe: '6 weeks', resource: 'Personal journal / Google Docs' },
    { action: 'Complete NSC reading comprehension past papers weekly', timeframe: '3 weeks', resource: 'NSC past papers (SAAEA)' },
  ],
  Numerical: [
    { action: 'Complete 30 min of Maths practice every day', timeframe: 'Ongoing', resource: 'Khan Academy Maths' },
    { action: 'Attempt a full Maths paper under timed conditions weekly', timeframe: '8 weeks', resource: 'NSC exam papers' },
    { action: 'Learn financial basics (interest, budgeting, percentages)', timeframe: '2 weeks', resource: 'Investopedia / YouTube' },
  ],
  Spatial: [
    { action: 'Practice 3D visualisation exercises daily (10 min)', timeframe: '3 weeks', resource: 'YouTube tutorials + graph paper' },
    { action: 'Study one Engineering Graphics or CAD concept weekly', timeframe: '6 weeks', resource: 'Free CAD tutorials (Fusion 360)' },
    { action: 'Build or assemble a physical model (electrical kit, model)', timeframe: '2 weeks', resource: 'Hardware store / DIY kits' },
  ],
  Practical: [
    { action: 'Complete one real-world task in your area of interest', timeframe: 'Next school holiday', resource: 'Family business or community org' },
    { action: 'Document 3 problems you solved this week with method + outcome', timeframe: 'Ongoing', resource: 'Personal journal' },
    { action: 'Shadow someone working in your target career for a day', timeframe: 'Within 1 month', resource: 'School career centre / LinkedIn' },
  ],
  Communication: [
    { action: 'Join a debating society or public speaking club', timeframe: '1 term', resource: 'School / Toastmasters SA' },
    { action: 'Write and present a 3-minute talk weekly to a friend or family', timeframe: '4 weeks', resource: 'Self-directed' },
    { action: 'Read "Talk Like TED" and apply one technique per week', timeframe: '6 weeks', resource: 'Library / eBook' },
  ],
  Leadership: [
    { action: 'Volunteer to organise one school or community event', timeframe: 'Next month', resource: 'School leadership / community org' },
    { action: 'Read "The 21 Irrefutable Laws of Leadership" (John Maxwell)', timeframe: '4 weeks', resource: 'Library / eBook' },
    { action: 'Mentor a younger student for 30 min weekly', timeframe: 'This term', resource: 'School peer-mentoring programme' },
  ],
};
