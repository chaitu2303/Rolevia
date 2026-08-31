/**
 * Rolevia Bias & Privacy Scanner
 * Detects potentially unnecessary personal information that could introduce
 * bias in hiring decisions or expose private data.
 * Does NOT infer protected characteristics from names or writing style.
 */

import type { ParsedResume } from './ResumeParser';

export interface PrivacyFlag {
  id: string;
  category: 'Legally Protected' | 'Privacy Risk' | 'Best Practice';
  label: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: string;
  recommendation: string;
}

export interface BiasPrivacyResult {
  flags: PrivacyFlag[];
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAN';
  summary: string;
}

// ── Pattern definitions ───────────────────────────────────────────────────────

const PRIVACY_PATTERNS: Array<{
  id: string;
  category: PrivacyFlag['category'];
  label: string;
  pattern: RegExp;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
}> = [
  {
    id: 'date_of_birth',
    category: 'Legally Protected',
    label: 'Date of Birth',
    pattern: /\b(?:d\.?o\.?b\.?|date\s*of\s*birth|born\s*(?:on|in)?:?\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}))/i,
    severity: 'HIGH',
    recommendation: 'Remove your date of birth. Employers are not allowed to consider age in hiring decisions (in most countries), and including it creates unnecessary bias risk.',
  },
  {
    id: 'age',
    category: 'Legally Protected',
    label: 'Age Statement',
    pattern: /\bage\s*:\s*\d{1,2}\b|\bi\s*am\s*\d{1,2}\s*years?\s*old\b/i,
    severity: 'HIGH',
    recommendation: 'Remove your age. Your work experience naturally implies career stage without stating age.',
  },
  {
    id: 'marital_status',
    category: 'Legally Protected',
    label: 'Marital Status',
    pattern: /\b(?:married|single|divorced|widowed|marital\s*status)\b/i,
    severity: 'HIGH',
    recommendation: 'Remove marital status. This is irrelevant to job performance and introduces bias risk.',
  },
  {
    id: 'religion',
    category: 'Legally Protected',
    label: 'Religious Affiliation',
    pattern: /\b(?:christian|muslim|hindu|jewish|buddhist|sikh|religion|church|mosque|temple|synagogue)\b/i,
    severity: 'MEDIUM',
    recommendation: 'Consider removing religious affiliations unless applying to a faith-based organization.',
  },
  {
    id: 'national_id',
    category: 'Privacy Risk',
    label: 'Government ID / SSN / Passport Number',
    pattern: /\b(?:ssn|social\s*security|passport\s*no\.?|national\s*id|aadhar|aadhaar|pan\s*card|nic\s*no\.?)\s*:?\s*[\d\-]+/i,
    severity: 'HIGH',
    recommendation: 'CRITICAL: Remove government ID numbers from your resume immediately. This is a serious privacy and identity theft risk.',
  },
  {
    id: 'photo_marker',
    category: 'Best Practice',
    label: 'Photo Reference',
    pattern: /\b(?:see\s*photo|photo\s*attached|photograph|passport\s*size\s*photo)\b/i,
    severity: 'MEDIUM',
    recommendation: 'Do not include photos in resumes for most US, UK, Canadian, and Australian applications. Photos introduce unconscious bias.',
  },
  {
    id: 'gender',
    category: 'Legally Protected',
    label: 'Gender Statement',
    pattern: /\bgender\s*:\s*(?:male|female|other|m|f|non.binary)/i,
    severity: 'MEDIUM',
    recommendation: 'Remove explicit gender declarations from your resume.',
  },
  {
    id: 'home_address',
    category: 'Privacy Risk',
    label: 'Full Home Address',
    pattern: /\b\d{1,5}\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:street|st|avenue|ave|road|rd|lane|ln|drive|dr|boulevard|blvd)\b/i,
    severity: 'LOW',
    recommendation: 'Replace your full street address with just City, State. Full addresses are unnecessary and create privacy risk.',
  },
];

// ── Main Scanner ──────────────────────────────────────────────────────────────

export function scanBiasAndPrivacy(parsed: ParsedResume): BiasPrivacyResult {
  const flags: PrivacyFlag[] = [];
  const text = parsed.rawText;

  for (const { id, category, label, pattern, severity, recommendation } of PRIVACY_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      flags.push({
        id,
        category,
        label,
        severity,
        evidence: `Found: "${match[0].substring(0, 60).trim()}"`,
        recommendation,
      });
    }
  }

  const highCount = flags.filter(f => f.severity === 'HIGH').length;
  const riskLevel =
    highCount >= 2 ? 'HIGH' :
    highCount === 1 ? 'MEDIUM' :
    flags.length > 0 ? 'LOW' : 'CLEAN';

  const summary = riskLevel === 'CLEAN'
    ? 'No privacy or bias flags detected.'
    : `${flags.length} flag(s) detected. ${highCount > 0 ? `${highCount} high-severity issue(s) require immediate attention.` : 'Review recommendations below.'}`;

  return { flags, riskLevel, summary };
}
