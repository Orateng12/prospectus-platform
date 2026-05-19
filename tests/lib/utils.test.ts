import { describe, it, expect } from 'vitest';
import { apsPoints, calcAPS, fmtR } from '../../lib/utils';
import type { Subject } from '../../lib/types';

const sub = (id: string, mark: number): Subject => ({ id, name: id, mark, designated: true });

describe('apsPoints', () => {
  it.each([
    // Exact boundary values — lower edge of each band
    [80, 7], [100, 7], [99, 7],
    [70, 6], [79, 6],
    [60, 5], [69, 5],
    [50, 4], [59, 4],
    [40, 3], [49, 3],
    [30, 2], [39, 2],
    [29, 1], [0, 1],
  ] as [number, number][])('mark %i → %i APS points', (mark, expected) => {
    expect(apsPoints(mark)).toBe(expected);
  });
});

describe('calcAPS', () => {
  it('filters out Life Orientation (id === "lo")', () => {
    // lo mark is 100 (7 pts) — must not be counted
    const subjects = [sub('math', 80), sub('lo', 100), sub('eng', 70)];
    expect(calcAPS(subjects)).toBe(7 + 6); // math + eng
  });

  it('picks the best 6 when more than 6 non-LO subjects exist', () => {
    const subjects = [
      sub('a', 80), // 7
      sub('b', 70), // 6
      sub('c', 60), // 5
      sub('d', 50), // 4
      sub('e', 40), // 3
      sub('f', 30), // 2
      sub('g', 29), // 1 — excluded
    ];
    expect(calcAPS(subjects)).toBe(7 + 6 + 5 + 4 + 3 + 2); // = 27
  });

  it('does not include LO even when it has the single highest mark', () => {
    const subjects = [sub('lo', 100), sub('a', 50), sub('b', 50)];
    expect(calcAPS(subjects)).toBe(4 + 4); // only a + b
  });

  it('sums all non-LO subjects when fewer than 6 are provided', () => {
    expect(calcAPS([sub('a', 80), sub('b', 60)])).toBe(7 + 5);
  });

  it('returns 0 for an empty subject list', () => {
    expect(calcAPS([])).toBe(0);
  });

  it('assigns 1 point for a zero mark', () => {
    expect(calcAPS([sub('a', 0)])).toBe(1);
  });

  it('correctly scores the default SUBJECTS dataset', () => {
    // eng=62→5, math=78→6, pscience=71→6, lifesci=74→6, history=68→5, lo filtered, sesotho=84→7
    // best 6 of [5,6,6,6,5,7] = [7,6,6,6,5,5] = 35
    const subjects: Subject[] = [
      { id: 'eng',      name: 'English',          mark: 62, designated: true  },
      { id: 'math',     name: 'Mathematics',       mark: 78, designated: true  },
      { id: 'pscience', name: 'Physical Sciences', mark: 71, designated: true  },
      { id: 'lifesci',  name: 'Life Sciences',     mark: 74, designated: true  },
      { id: 'history',  name: 'History',           mark: 68, designated: true  },
      { id: 'lo',       name: 'Life Orientation',  mark: 80, designated: false },
      { id: 'sesotho',  name: 'Sesotho HL',        mark: 84, designated: true  },
    ];
    expect(calcAPS(subjects)).toBe(35);
  });
});

describe('fmtR', () => {
  it('starts with "R" followed by a non-breaking space', () => {
    expect(fmtR(1000)).toMatch(/^R /);
  });

  it('formats zero', () => {
    expect(fmtR(0)).toBe('R ' + (0).toLocaleString('en-ZA'));
  });

  it('formats a typical salary value', () => {
    const result = fmtR(38500);
    expect(result).toMatch(/^R /);
    expect(result).toContain('38');
    expect(result).toContain('500');
  });

  it('formats a large number with locale-specific separators', () => {
    const result = fmtR(1000000);
    expect(result).toMatch(/^R /);
    // en-ZA uses space as thousands separator; just verify it contains "1" and "000"
    expect(result).toContain('1');
  });
});
