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
    .filter(s => s.id !== 'lo')
    .map(s => apsPoints(s.mark))
    .sort((a, b) => b - a)
    .slice(0, 6)
    .reduce((a, b) => a + b, 0);
}

export function fmtR(n: number): string {
  return 'R\u00A0' + n.toLocaleString('en-ZA');
}
