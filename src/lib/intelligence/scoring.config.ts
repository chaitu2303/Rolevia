/**
 * Rolevia Scoring Configuration
 * Transparent, configurable weights for all scoring dimensions.
 * All weights must sum to 100. Job relevance weight is redistributed
 * proportionally to other dimensions when no JD is supplied.
 */

export interface ScoringWeights {
  atsCompatibility: number;   // ATS parsing ability
  contentQuality: number;     // Resume content completeness and quality
  impactEvidence: number;     // Quantification and impact strength
  jobRelevance: number;       // Keyword and job match (requires JD)
  recruiterReadiness: number; // Recruiter first-impression signals
  consistency: number;        // Professional consistency and formatting
}

// Default Rolevia scoring weights — must sum to 100
export const DEFAULT_WEIGHTS: ScoringWeights = {
  atsCompatibility: 20,
  contentQuality: 20,
  impactEvidence: 20,
  jobRelevance: 20,
  recruiterReadiness: 10,
  consistency: 10,
};

// Weights when no job description is provided (jobRelevance redistributed)
export const WEIGHTS_NO_JD: ScoringWeights = {
  atsCompatibility: 25,
  contentQuality: 25,
  impactEvidence: 25,
  jobRelevance: 0,
  recruiterReadiness: 13,
  consistency: 12,
};

export const SCORE_LABELS = {
  90: 'Outstanding',
  80: 'Strong',
  70: 'Good',
  60: 'Needs Work',
  50: 'Below Average',
  0:  'Critical Issues',
} as const;

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Outstanding';
  if (score >= 80) return 'Strong';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Needs Work';
  if (score >= 50) return 'Below Average';
  return 'Critical Issues';
}

export function getScoreColor(score: number): 'success' | 'warning' | 'destructive' {
  if (score >= 70) return 'success';
  if (score >= 50) return 'warning';
  return 'destructive';
}

export const REPORT_VERSION = 'INTELLIGENCE_V1';
