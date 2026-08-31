/**
 * Rolevia Career Level Adapter
 * Adapts scoring expectations based on career level.
 * Fresher is not penalized with senior expectations.
 */

export type CareerLevel =
  | 'STUDENT'
  | 'FRESHER'
  | 'ENTRY'
  | 'MID'
  | 'SENIOR'
  | 'LEAD'
  | 'MANAGER'
  | 'EXECUTIVE';

export interface LevelExpectations {
  level: CareerLevel;
  label: string;
  minExperienceItems: number;
  projectsRequired: boolean;
  leadershipExpected: boolean;
  quantificationExpected: boolean;
  certificationsExpected: boolean;
  summaryExpected: boolean;
  minBulletsPerRole: number;
  educationWeight: number; // 0-1, how much education matters for this level
  experienceWeight: number;
  // Max years of experience expected (for "too much" warnings)
  maxExpectedYears: number | null;
}

export const LEVEL_EXPECTATIONS: Record<CareerLevel, LevelExpectations> = {
  STUDENT: {
    level: 'STUDENT',
    label: 'Student',
    minExperienceItems: 0,
    projectsRequired: true,
    leadershipExpected: false,
    quantificationExpected: false,
    certificationsExpected: false,
    summaryExpected: false,
    minBulletsPerRole: 1,
    educationWeight: 0.8,
    experienceWeight: 0.2,
    maxExpectedYears: 1,
  },
  FRESHER: {
    level: 'FRESHER',
    label: 'Fresher / Recent Graduate',
    minExperienceItems: 0,
    projectsRequired: true,
    leadershipExpected: false,
    quantificationExpected: false,
    certificationsExpected: false,
    summaryExpected: true,
    minBulletsPerRole: 2,
    educationWeight: 0.6,
    experienceWeight: 0.4,
    maxExpectedYears: 2,
  },
  ENTRY: {
    level: 'ENTRY',
    label: 'Entry Level (0–2 years)',
    minExperienceItems: 1,
    projectsRequired: false,
    leadershipExpected: false,
    quantificationExpected: true,
    certificationsExpected: false,
    summaryExpected: true,
    minBulletsPerRole: 2,
    educationWeight: 0.4,
    experienceWeight: 0.6,
    maxExpectedYears: 3,
  },
  MID: {
    level: 'MID',
    label: 'Mid-Level (2–5 years)',
    minExperienceItems: 2,
    projectsRequired: false,
    leadershipExpected: false,
    quantificationExpected: true,
    certificationsExpected: false,
    summaryExpected: true,
    minBulletsPerRole: 3,
    educationWeight: 0.2,
    experienceWeight: 0.8,
    maxExpectedYears: 6,
  },
  SENIOR: {
    level: 'SENIOR',
    label: 'Senior (5–10 years)',
    minExperienceItems: 3,
    projectsRequired: false,
    leadershipExpected: true,
    quantificationExpected: true,
    certificationsExpected: false,
    summaryExpected: true,
    minBulletsPerRole: 3,
    educationWeight: 0.1,
    experienceWeight: 0.9,
    maxExpectedYears: 12,
  },
  LEAD: {
    level: 'LEAD',
    label: 'Lead / Staff (8+ years)',
    minExperienceItems: 3,
    projectsRequired: false,
    leadershipExpected: true,
    quantificationExpected: true,
    certificationsExpected: false,
    summaryExpected: true,
    minBulletsPerRole: 3,
    educationWeight: 0.05,
    experienceWeight: 0.95,
    maxExpectedYears: null,
  },
  MANAGER: {
    level: 'MANAGER',
    label: 'Manager',
    minExperienceItems: 3,
    projectsRequired: false,
    leadershipExpected: true,
    quantificationExpected: true,
    certificationsExpected: false,
    summaryExpected: true,
    minBulletsPerRole: 3,
    educationWeight: 0.1,
    experienceWeight: 0.9,
    maxExpectedYears: null,
  },
  EXECUTIVE: {
    level: 'EXECUTIVE',
    label: 'Executive (C-Suite / VP)',
    minExperienceItems: 3,
    projectsRequired: false,
    leadershipExpected: true,
    quantificationExpected: true,
    certificationsExpected: false,
    summaryExpected: true,
    minBulletsPerRole: 2, // executives have fewer but more impactful bullets
    educationWeight: 0.05,
    experienceWeight: 0.95,
    maxExpectedYears: null,
  },
};

export function getLevelExpectations(level?: string | null): LevelExpectations {
  if (!level) return LEVEL_EXPECTATIONS.MID; // default to mid-level
  const key = level.toUpperCase() as CareerLevel;
  return LEVEL_EXPECTATIONS[key] ?? LEVEL_EXPECTATIONS.MID;
}

export function inferCareerLevelFromYears(years: number): CareerLevel {
  if (years < 1) return 'FRESHER';
  if (years < 3) return 'ENTRY';
  if (years < 6) return 'MID';
  if (years < 10) return 'SENIOR';
  return 'LEAD';
}

export function estimateYearsOfExperience(text: string): number {
  // Look for year ranges in text: 2018-2021, 2018 - 2021, Jan 2018 – Dec 2021
  const yearRanges = text.match(/\b(20\d{2})\s*[-–—]\s*(20\d{2}|Present|Current|Now)\b/gi);
  if (!yearRanges || yearRanges.length === 0) return 0;

  let totalYears = 0;
  for (const range of yearRanges) {
    const parts = range.match(/(20\d{2})/g);
    if (!parts) continue;
    const start = parseInt(parts[0]);
    const currentYear = new Date().getFullYear();
    const end = parts[1] ? parseInt(parts[1]) : currentYear;
    const duration = Math.max(0, end - start);
    totalYears += duration;
  }

  // Cap at 40 to avoid parsing anomalies
  return Math.min(40, totalYears);
}
