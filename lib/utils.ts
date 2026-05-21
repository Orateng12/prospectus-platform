import type { Subject } from './types';

export function apsPoints(mark: number): number {
  if (mark >= 80) return 7;
  if (mark >= 70) return 6;
  if (mark >= 60) return 5;
  if (mark >= 50) return 4;
  if (mark >= 40) return 3;
  if (mark >= 30) return 2;
  return 1;
}

export function calcAPS(subjects: Subject[]): number {
  return subjects
    .filter(s => s.subjectType !== 'life_orientation' && s.id !== 'lo')
    .map(s => apsPoints(s.mark))
    .sort((a, b) => b - a)
    .slice(0, 6)
    .reduce((a, b) => a + b, 0);
}

// Cambridge IGCSE/O-Level/AS/A-Level grade \u2192 NSC APS points
export function cambridgeGradeToPoints(grade: string): number {
  switch (grade.trim().toUpperCase()) {
    case 'A*': return 7;
    case 'A':  return 6;
    case 'B':  return 5;
    case 'C':  return 4;
    case 'D':  return 3;
    case 'E':  return 2;
    default:   return 1;
  }
}

// NC(V) Level 4 mark \u2192 NSC APS points
export function ncvMarkToPoints(mark: number): number {
  if (mark >= 80) return 7;
  if (mark >= 60) return 5;
  if (mark >= 40) return 3;
  if (mark >= 30) return 1;
  return 0;
}

// IB score (1\u20137) \u2192 NSC APS points (direct mapping)
export function ibScoreToPoints(score: number): number {
  return Math.max(1, Math.min(7, Math.round(score)));
}

// APS for any curriculum \u2014 dispatches to correct converter per subject
export function calcAPSForCurriculum(subjects: Subject[]): number {
  const scored = subjects
    .filter(s => s.subjectType !== 'life_orientation' && s.id !== 'lo')
    .map(s => {
      const c = s.curriculum;
      if (c === 'Cambridge_IGCSE' || c === 'Cambridge_AS' || c === 'Cambridge_A') {
        return s.grade ? cambridgeGradeToPoints(s.grade) : cambridgeGradeToPoints(String(s.mark));
      }
      if (c === 'NCV') return ncvMarkToPoints(s.mark);
      if (c === 'IB')  return ibScoreToPoints(s.mark);
      return apsPoints(s.mark); // NSC, IEB, default
    });
  return scored.sort((a, b) => b - a).slice(0, 6).reduce((a, b) => a + b, 0);
}

export function fmtR(n: number): string {
  return 'R\u00A0' + n.toLocaleString('en-ZA');
}

export function uniToneClass(nameOrShort: string): string {
  const u = nameOrShort.toLowerCase();
  if (u === 'uct'  || u.includes('cape town'))                            return 'uct';
  if (u === 'wits' || u.includes('witwatersrand'))                        return 'wits';
  if (u === 'sun'  || u.includes('stellenbosch'))                        return 'sun';
  if (u === 'up'   || u.includes('pretoria'))                             return 'up';
  if (u === 'ukzn' || u.includes('kwazulu') || u.includes('kwazulu-natal')) return 'ukzn';
  if (u === 'cput' || u.includes('cape peninsula'))                       return 'cput';
  return 'default-uni';
}
