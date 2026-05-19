import { describe, it, expect } from 'vitest';
import {
  scoreCareerMatch,
  rankCareersByMatch,
  getCareerCapRequirements,
  getCareerBigFiveRanges,
  computeStrategicScore,
} from '../../lib/scoring';
import type { PsychProfileData, CapabilityData } from '../../lib/types';

// ─── Shared fixtures ──────────────────────────────────────────────────────────

/** All RIASEC and Big Five values perfectly matching Software Engineer archetype. */
const perfectSwEPsych: PsychProfileData = {
  openness: 90, conscientiousness: 90, extraversion: 50, agreeableness: 50, neuroticism: 50,
  realistic: 100, investigative: 100, artistic: 50, social: 50, enterprising: 50, conventional: 100,
};

/** All capability values meeting or exceeding Software Engineer requirements. */
const perfectSwECaps: CapabilityData = {
  analytical_thinking: 100, creative_thinking: 50, leadership_potential: 50,
  communication_skills: 50, technical_aptitude: 100, entrepreneurial_drive: 50,
  risk_tolerance_score: 50, perseverance: 50, academic_readiness: 100, career_readiness: 50,
};

/** All RIASEC, Big Five and capability values zeroed out. */
const zeroPsych: PsychProfileData = {
  openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0,
  realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0,
};
const zeroCaps: CapabilityData = {
  analytical_thinking: 0, creative_thinking: 0, leadership_potential: 0,
  communication_skills: 0, technical_aptitude: 0, entrepreneurial_drive: 0,
  risk_tolerance_score: 0, perseverance: 0, academic_readiness: 0, career_readiness: 0,
};

/** Profile whose RIASEC and capabilities match the Teacher archetype closely. */
const teacherPsych: PsychProfileData = {
  openness: 60, conscientiousness: 60, extraversion: 65, agreeableness: 70, neuroticism: 50,
  realistic: 50, investigative: 50, artistic: 50, social: 80, enterprising: 50, conventional: 50,
};
const teacherCaps: CapabilityData = {
  analytical_thinking: 60, creative_thinking: 60, leadership_potential: 65,
  communication_skills: 80, technical_aptitude: 60, entrepreneurial_drive: 60,
  risk_tolerance_score: 60, perseverance: 60, academic_readiness: 60, career_readiness: 60,
};

/** All RIASEC and capability values at 60 — a flat, average profile. */
const flatPsych: PsychProfileData = {
  openness: 60, conscientiousness: 60, extraversion: 60, agreeableness: 60, neuroticism: 60,
  realistic: 60, investigative: 60, artistic: 60, social: 60, enterprising: 60, conventional: 60,
};
const flatCaps: CapabilityData = {
  analytical_thinking: 60, creative_thinking: 60, leadership_potential: 60,
  communication_skills: 60, technical_aptitude: 60, entrepreneurial_drive: 60,
  risk_tolerance_score: 60, perseverance: 60, academic_readiness: 60, career_readiness: 60,
};

// ─── scoreCareerMatch ─────────────────────────────────────────────────────────

describe('scoreCareerMatch', () => {
  it('output is always in the [35, 97] closed interval', () => {
    const profiles: Array<[PsychProfileData, CapabilityData, number]> = [
      [perfectSwEPsych, perfectSwECaps, 50],
      [zeroPsych, zeroCaps, 0],
      [flatPsych, flatCaps, 20],
      [teacherPsych, teacherCaps, 26],
    ];
    const careers = ['Software Engineer', 'Doctor (MBChB)', 'Teacher', 'Entrepreneur', 'Nurse'];
    for (const [psych, caps, aps] of profiles) {
      for (const career of careers) {
        const score = scoreCareerMatch(career, psych, caps, aps);
        expect(score, `${career} must be in [35,97]`).toBeGreaterThanOrEqual(35);
        expect(score, `${career} must be in [35,97]`).toBeLessThanOrEqual(97);
      }
    }
  });

  it('caps at 97 for a profile that perfectly matches the archetype', () => {
    // All RIASEC / cap / Big Five values at or above ideals; APS above minimum.
    expect(scoreCareerMatch('Software Engineer', perfectSwEPsych, perfectSwECaps, 35)).toBe(97);
  });

  it('floors at 35 for a completely zero profile', () => {
    // raw = 0*0.38 + 0*0.30 + 0*0.15 + 20*0.17 = 3.4 → 3 → clamped to 35
    expect(scoreCareerMatch('Software Engineer', zeroPsych, zeroCaps, 0)).toBe(35);
  });

  it('scores 100 on the APS component when userAps equals minAps exactly', () => {
    // Teacher minAps = 26; social-match profile, APS at threshold.
    const atMin = scoreCareerMatch('Teacher', teacherPsych, teacherCaps, 26);
    const aboveMin = scoreCareerMatch('Teacher', teacherPsych, teacherCaps, 40);
    // APS component is 100 in both cases; overall score should be the same.
    expect(atMin).toBe(aboveMin);
  });

  it('applies a soft penalty for APS below the career minimum', () => {
    // minAps=32 for Software Engineer. APS=16 → max(20, round(16/32*60))=max(20,30)=30
    const belowMin = scoreCareerMatch('Software Engineer', perfectSwEPsych, perfectSwECaps, 16);
    const atMin    = scoreCareerMatch('Software Engineer', perfectSwEPsych, perfectSwECaps, 32);
    expect(belowMin).toBeLessThan(atMin);
  });

  it('uses 80 as the APS component for careers with no minAps requirement', () => {
    // Entrepreneur and Financial Advisor have no minAps → APS value irrelevant to score.
    const highAps = scoreCareerMatch('Entrepreneur', flatPsych, flatCaps, 50);
    const lowAps  = scoreCareerMatch('Entrepreneur', flatPsych, flatCaps, 10);
    expect(highAps).toBe(lowAps);
  });

  it('computes a known exact score for a Teacher-profile against Teacher archetype', () => {
    // Manually verified:
    //   riasecScore = round(16695/195) = 86
    //   capScore    = round(13565/145) = 94
    //   bigFiveScore = 100 (extraversion 65∈[50,100], agreeableness 70∈[60,100])
    //   apsScore     = 100 (26 >= 26)
    //   raw = round(86*0.38 + 94*0.30 + 100*0.15 + 100*0.17) = round(92.88) = 93
    expect(scoreCareerMatch('Teacher', teacherPsych, teacherCaps, 26)).toBe(93);
  });

  it('is case-insensitive for career name lookup', () => {
    const lower = scoreCareerMatch('teacher', teacherPsych, teacherCaps, 26);
    const upper = scoreCareerMatch('TEACHER', teacherPsych, teacherCaps, 26);
    expect(lower).toBe(upper);
    expect(lower).toBe(93);
  });

  it('Teacher profile scores higher for Teacher than for Software Engineer', () => {
    const teacherScore = scoreCareerMatch('Teacher', teacherPsych, teacherCaps, 26);
    const sweScore     = scoreCareerMatch('Software Engineer', teacherPsych, teacherCaps, 26);
    expect(teacherScore).toBeGreaterThan(sweScore);
  });

  it('falls back to keyword inference for an unrecognised career name', () => {
    // 'Senior Java Developer' includes 'developer' → engineer inference → not the fallback 65
    const score = scoreCareerMatch('Senior Java Developer', perfectSwEPsych, perfectSwECaps, 35);
    expect(score).toBeGreaterThanOrEqual(35);
    expect(score).toBeLessThanOrEqual(97);
  });

  it('Big Five above hi for neuroticism is penalised (not treated as ideal)', () => {
    // Actuary bigFive: neuroticism [0, 50]; neuroticism=80 should score below ideal.
    const highNeuro = { ...flatPsych, neuroticism: 80 };
    const lowNeuro  = { ...flatPsych, neuroticism: 20 };
    const highScore = scoreCareerMatch('Actuary', highNeuro, flatCaps, 38);
    const lowScore  = scoreCareerMatch('Actuary', lowNeuro,  flatCaps, 38);
    expect(highScore).toBeLessThan(lowScore);
  });
});

// ─── rankCareersByMatch ───────────────────────────────────────────────────────

describe('rankCareersByMatch', () => {
  const careers = [
    { name: 'Software Engineer', salary: 38500 },
    { name: 'Teacher',           salary: 22000 },
    { name: 'Nurse',             salary: 18000 },
  ];

  it('returns the same number of items as the input', () => {
    const result = rankCareersByMatch(careers, teacherPsych, teacherCaps, 26);
    expect(result).toHaveLength(careers.length);
  });

  it('attaches a personalScore property to each career', () => {
    const result = rankCareersByMatch(careers, teacherPsych, teacherCaps, 26);
    for (const r of result) {
      expect(r.personalScore).toBeGreaterThanOrEqual(35);
      expect(r.personalScore).toBeLessThanOrEqual(97);
    }
  });

  it('sorts descending by personalScore', () => {
    const result = rankCareersByMatch(careers, teacherPsych, teacherCaps, 26);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].personalScore).toBeGreaterThanOrEqual(result[i].personalScore);
    }
  });

  it('places Teacher first for a teacher-oriented profile', () => {
    const result = rankCareersByMatch(careers, teacherPsych, teacherCaps, 26);
    expect(result[0].name).toBe('Teacher');
  });

  it('preserves all original properties of each career', () => {
    const result = rankCareersByMatch(careers, teacherPsych, teacherCaps, 26);
    const teacher = result.find(r => r.name === 'Teacher')!;
    expect(teacher.salary).toBe(22000);
  });
});

// ─── getCareerCapRequirements ─────────────────────────────────────────────────

describe('getCareerCapRequirements', () => {
  it('returns correct CapabilityData keys for Software Engineer', () => {
    // Archetype caps: { analytical: 85, technical: 90, academic: 70 }
    expect(getCareerCapRequirements('Software Engineer')).toEqual({
      analytical_thinking: 85,
      technical_aptitude: 90,
      academic_readiness: 70,
    });
  });

  it('returns correct CapabilityData keys for Teacher', () => {
    // Archetype caps: { communication: 85, leadership: 60 }
    expect(getCareerCapRequirements('Teacher')).toEqual({
      communication_skills: 85,
      leadership_potential: 60,
    });
  });

  it('returns only the capabilities that the archetype explicitly requires', () => {
    // Teacher only requires communication and leadership — nothing else
    const req = getCareerCapRequirements('Teacher');
    expect(Object.keys(req)).toHaveLength(2);
  });

  it('infers requirements via keyword for an unknown career name', () => {
    // 'Graphic Designer' hits the design keyword → creative:85, technical:55
    const req = getCareerCapRequirements('Graphic Designer');
    expect(req.creative_thinking).toBe(85);
    expect(req.technical_aptitude).toBe(55);
  });
});

// ─── getCareerBigFiveRanges ───────────────────────────────────────────────────

describe('getCareerBigFiveRanges', () => {
  it('returns correct ranges for Software Engineer', () => {
    expect(getCareerBigFiveRanges('Software Engineer')).toEqual({
      conscientiousness: [65, 100],
      openness: [55, 100],
    });
  });

  it('returns correct ranges for Teacher', () => {
    expect(getCareerBigFiveRanges('Teacher')).toEqual({
      extraversion: [50, 100],
      agreeableness: [60, 100],
    });
  });

  it('returns an empty object for a career whose archetype has no Big Five requirements', () => {
    // A totally unknown career with no keyword match falls through to the generic archetype
    // which has no bigFive defined.
    expect(getCareerBigFiveRanges('Zookeeper')).toEqual({});
  });
});

// ─── computeStrategicScore ────────────────────────────────────────────────────

describe('computeStrategicScore', () => {
  it('computes all sub-scores for a flat-60 profile with APS 36 and income 300 000', () => {
    // Manually verified results (see comments in source for formulas):
    //   academic_readiness      = min(95, round(36/49*100)) = 73
    //   career_demand_alignment = round(60*0.35+60*0.25+60*0.20+60*0.15+60*0.05) = 60
    //   financial_feasibility   = min(96, 88+5) = 93   (NSFAS band, APS≥36→+5)
    //   global_mobility         = round(73*0.55+60*0.30+60*0.15) = 67
    //   personality_fit         = round(60*0.50+60*0.30+60*0.20) = 60
    //   skill_readiness         = round((60*8)/8) = 60
    //   overall = round(73*0.25+60*0.20+93*0.20+60*0.15+67*0.10+60*0.10) = 71
    expect(computeStrategicScore(flatPsych, flatCaps, 36, 300_000)).toEqual({
      overall: 71,
      academic_readiness: 73,
      career_demand_alignment: 60,
      financial_feasibility: 93,
      global_mobility_potential: 67,
      personality_career_fit: 60,
      skill_readiness: 60,
    });
  });

  describe('academic_readiness', () => {
    it('returns 95 (the cap) for APS ≥ 49', () => {
      expect(computeStrategicScore(flatPsych, flatCaps, 49, 300_000).academic_readiness).toBe(95);
      expect(computeStrategicScore(flatPsych, flatCaps, 60, 300_000).academic_readiness).toBe(95);
    });

    it('returns 0 for APS = 0', () => {
      expect(computeStrategicScore(flatPsych, flatCaps, 0, 300_000).academic_readiness).toBe(0);
    });
  });

  describe('financial_feasibility', () => {
    it.each([
      // [income, aps, expected] — hand-checked against the band table
      [350_000, 40, 96],  // NSFAS band (88) + merit ≥40 (+8) = 96
      [350_001, 35, 64],  // missing-middle (62) + merit ≥32 (+2) = 64
      [600_001, 31, 48],  // lower self-fund (48) + no merit = 48
      [900_001, 36, 67],  // mid self-fund (62) + merit ≥36 (+5) = 67
      [1_500_001, 40, 84], // comfortable (76) + merit ≥40 (+8) = 84
    ] as [number, number, number][])('income %i, APS %i → %i', (income, aps, expected) => {
      expect(computeStrategicScore(flatPsych, flatCaps, aps, income).financial_feasibility).toBe(expected);
    });

    it('merit bonus is 0 below APS 32', () => {
      const base = computeStrategicScore(flatPsych, flatCaps, 31, 1_500_001).financial_feasibility;
      expect(base).toBe(76); // comfortable band, no bonus
    });

    it('caps at 96', () => {
      // NSFAS band (88) + merit ≥40 (+8) = 96, never exceeds
      const score = computeStrategicScore(flatPsych, flatCaps, 45, 100_000).financial_feasibility;
      expect(score).toBeLessThanOrEqual(96);
    });
  });

  describe('skill_readiness', () => {
    it('is the mean of exactly 8 capability dimensions (excludes academic/career readiness)', () => {
      // Set all caps to 80 except academic_readiness and career_readiness
      const caps: CapabilityData = {
        analytical_thinking: 80, creative_thinking: 80, leadership_potential: 80,
        communication_skills: 80, technical_aptitude: 80, entrepreneurial_drive: 80,
        risk_tolerance_score: 80, perseverance: 80,
        academic_readiness: 0,  // excluded from skill_readiness
        career_readiness: 0,    // excluded from skill_readiness
      };
      expect(computeStrategicScore(flatPsych, caps, 36, 300_000).skill_readiness).toBe(80);
    });

    it('reflects the actual mean when capability values differ', () => {
      const caps: CapabilityData = {
        analytical_thinking: 100, creative_thinking: 100, leadership_potential: 100,
        communication_skills: 100, technical_aptitude: 100, entrepreneurial_drive: 100,
        risk_tolerance_score: 0, perseverance: 0,
        academic_readiness: 999, career_readiness: 999,
      };
      // mean of [100,100,100,100,100,100,0,0] = 600/8 = 75
      expect(computeStrategicScore(flatPsych, caps, 36, 300_000).skill_readiness).toBe(75);
    });
  });

  describe('personality_career_fit', () => {
    it('reflects the top-3 RIASEC values weighted 50/30/20', () => {
      const psych: PsychProfileData = {
        ...flatPsych,
        investigative: 90, realistic: 80, conventional: 70,
        // others below 70 → not in top 3
        social: 50, enterprising: 40, artistic: 30,
      };
      // sorted top3: [90, 80, 70]; fit = round(90*0.50+80*0.30+70*0.20) = round(45+24+14) = 83
      expect(computeStrategicScore(psych, flatCaps, 36, 300_000).personality_career_fit).toBe(83);
    });
  });

  describe('career_demand_alignment', () => {
    it('excludes the Artistic RIASEC dimension from the formula', () => {
      // Max out artistic, zero everything else → should score 0 (artistic excluded)
      const psych: PsychProfileData = {
        ...zeroPsych,
        artistic: 100,
      };
      expect(computeStrategicScore(psych, flatCaps, 0, 300_000).career_demand_alignment).toBe(0);
    });

    it('weights Investigative most heavily (0.35)', () => {
      const highI = { ...zeroPsych, investigative: 100 };
      const highS = { ...zeroPsych, social: 100 };
      const scoreI = computeStrategicScore(highI, flatCaps, 0, 300_000).career_demand_alignment;
      const scoreS = computeStrategicScore(highS, flatCaps, 0, 300_000).career_demand_alignment;
      // I contributes 35, S contributes 5
      expect(scoreI).toBeGreaterThan(scoreS);
      expect(scoreI).toBe(35);
      expect(scoreS).toBe(5);
    });
  });
});
