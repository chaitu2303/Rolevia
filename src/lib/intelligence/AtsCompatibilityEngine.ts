/**
 * Rolevia ATS Compatibility Engine
 * Evaluates how well a resume will be parsed by ATS systems.
 * Extends and supersedes RuleBasedAtsEngine for the intelligence pipeline.
 * Evidence-traced: every check points to what caused it.
 */

import type { ParsedResume } from './ResumeParser';

export interface AtsCheck {
  id: string;
  category: 'File & Format' | 'Contact & Identity' | 'Structure' | 'Parsing Safety' | 'Links & URLs';
  label: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: string;         // Quote or description from resume that caused this check
  recommendation: string;   // Specific fix
  scoreImpact: number;      // Positive = good, negative = bad contribution
}

export interface AtsCompatibilityResult {
  atsScore: number;               // 0–100
  parsingConfidence: number;      // 0–100
  atsRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  checks: AtsCheck[];
  strengths: string[];
  summary: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PROFESSIONAL_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
  'icloud.com', 'protonmail.com', 'live.com', 'aol.com'];

function isEmailProfessional(email: string | null): boolean {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  // School/company emails are fine; flag obviously unprofessional patterns
  const hasUnprofessionalPattern = /(?:cutie|sexy|cool|hot|fun|420|xxx)/i.test(email);
  return !hasUnprofessionalPattern;
}

function isUrlValid(url: string | null): boolean {
  if (!url) return true; // absence is handled separately
  return /^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+(\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?$/i.test(url);
}

// ── Main Engine ───────────────────────────────────────────────────────────────

export function analyzeAtsCompatibility(parsed: ParsedResume): AtsCompatibilityResult {
  const checks: AtsCheck[] = [];
  const strengths: string[] = [];
  let baseScore = 100;

  // ── FILE & FORMAT ─────────────────────────────────────────────────────────

  // File format check
  const isSupportedFormat = parsed.fileMimeType === 'application/pdf' ||
    parsed.fileMimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    parsed.fileMimeType === 'application/msword';

  checks.push({
    id: 'file_format',
    category: 'File & Format',
    label: 'File Format',
    status: isSupportedFormat ? 'PASS' : 'FAIL',
    severity: 'HIGH',
    evidence: `File type: ${parsed.fileMimeType}`,
    recommendation: isSupportedFormat ? '' : 'Save your resume as PDF or DOCX. Avoid .pages, .odt, .rtf.',
    scoreImpact: isSupportedFormat ? 0 : -15,
  });

  if (isSupportedFormat) strengths.push('File format (PDF/DOCX) is universally ATS-compatible');

  // File size
  const fileSizeMB = parsed.fileSizeBytes / (1024 * 1024);
  const fileSizeOk = fileSizeMB < 5;
  checks.push({
    id: 'file_size',
    category: 'File & Format',
    label: 'File Size',
    status: fileSizeOk ? 'PASS' : 'WARN',
    severity: 'LOW',
    evidence: `File size: ${fileSizeMB.toFixed(2)} MB`,
    recommendation: fileSizeOk ? '' : 'Reduce file size below 5 MB. Compress images or export with optimized settings.',
    scoreImpact: fileSizeOk ? 0 : -5,
  });

  // Image-only PDF
  if (parsed.isImageOnly) {
    checks.push({
      id: 'image_only',
      category: 'Parsing Safety',
      label: 'Text Extractability',
      status: 'FAIL',
      severity: 'CRITICAL',
      evidence: `Very little text extracted (${parsed.wordCount} words) from a ${(fileSizeMB).toFixed(1)}MB file — this indicates a scanned/image-based PDF.`,
      recommendation: 'Your resume appears to be a scanned image. ATS systems cannot read image-based PDFs. Convert to a text-based PDF by typing your resume in Word or Google Docs and exporting as PDF.',
      scoreImpact: -40,
    });
    baseScore -= 40;
  } else {
    checks.push({
      id: 'text_extractable',
      category: 'Parsing Safety',
      label: 'Text Extractability',
      status: 'PASS',
      severity: 'CRITICAL',
      evidence: `${parsed.wordCount} words successfully extracted`,
      recommendation: '',
      scoreImpact: 0,
    });
    strengths.push('Resume text is fully machine-readable');
  }

  // File name
  if (parsed.fileName_issue) {
    checks.push({
      id: 'file_name',
      category: 'File & Format',
      label: 'File Name',
      status: 'WARN',
      severity: 'LOW',
      evidence: `Current file name: "${parsed.fileName}"`,
      recommendation: 'Rename your resume to: FirstName_LastName_TargetRole_Resume.pdf (e.g., Jane_Smith_SoftwareEngineer_Resume.pdf)',
      scoreImpact: -3,
    });
  } else {
    strengths.push(`File name "${parsed.fileName}" is professional`);
  }

  // ── PARSING SAFETY ────────────────────────────────────────────────────────

  // Multi-column layout
  if (parsed.hasMultiColumn) {
    checks.push({
      id: 'multi_column',
      category: 'Parsing Safety',
      label: 'Multi-Column Layout',
      status: 'WARN',
      severity: 'HIGH',
      evidence: 'Multiple columns detected — ATS parsers read left-to-right and may mix content from different columns.',
      recommendation: 'Switch to a single-column layout. Two-column resumes can cause ATS to jumble your experience and skills together.',
      scoreImpact: -12,
    });
    baseScore -= 12;
  } else {
    strengths.push('Single-column layout detected — optimal for ATS parsing');
  }

  // Tables
  if (parsed.hasTable) {
    checks.push({
      id: 'tables',
      category: 'Parsing Safety',
      label: 'Tables / Boxes',
      status: 'FAIL',
      severity: 'HIGH',
      evidence: 'Table or box-drawing characters detected in resume.',
      recommendation: 'Remove all tables. Replace table-based skills or layouts with plain bullet points. ATS systems cannot reliably parse content inside tables.',
      scoreImpact: -15,
    });
    baseScore -= 15;
  }

  // Special chars
  if (parsed.hasSpecialCharBlocks) {
    checks.push({
      id: 'special_chars',
      category: 'Parsing Safety',
      label: 'Special Characters',
      status: 'WARN',
      severity: 'MEDIUM',
      evidence: 'Unicode box-drawing or special characters detected.',
      recommendation: 'Remove special characters like │, ┌, █, ▓. Use standard bullet points (•) instead.',
      scoreImpact: -8,
    });
    baseScore -= 8;
  }

  // Resume length
  const wordCount = parsed.wordCount;
  if (wordCount < 150) {
    checks.push({
      id: 'resume_length_short',
      category: 'Parsing Safety',
      label: 'Resume Length',
      status: 'FAIL',
      severity: 'HIGH',
      evidence: `Only ${wordCount} words detected. Very short resumes suggest incomplete content.`,
      recommendation: 'Expand your resume with detailed experience bullets (3–5 per role), a skills section, and a professional summary. Target 400–700 words.',
      scoreImpact: -15,
    });
    baseScore -= 15;
  } else if (wordCount > 1500) {
    checks.push({
      id: 'resume_length_long',
      category: 'Parsing Safety',
      label: 'Resume Length',
      status: 'WARN',
      severity: 'MEDIUM',
      evidence: `${wordCount} words detected. Resumes over 2 pages reduce recruiter engagement.`,
      recommendation: 'Target 400–800 words for under 5 years experience. Cut old roles to 1–2 bullets. Remove jobs from 10+ years ago unless highly relevant.',
      scoreImpact: -5,
    });
  } else {
    strengths.push(`Resume length (${wordCount} words) is within the optimal range`);
  }

  // ── CONTACT & IDENTITY ────────────────────────────────────────────────────

  const { contact } = parsed;

  if (!contact.email) {
    checks.push({
      id: 'contact_email',
      category: 'Contact & Identity',
      label: 'Email Address',
      status: 'FAIL',
      severity: 'CRITICAL',
      evidence: 'No email address detected in resume.',
      recommendation: 'Add a professional email address at the top of your resume. Format: yourname@gmail.com',
      scoreImpact: -15,
    });
    baseScore -= 15;
  } else {
    const isProfessional = isEmailProfessional(contact.email);
    checks.push({
      id: 'contact_email',
      category: 'Contact & Identity',
      label: 'Email Address',
      status: isProfessional ? 'PASS' : 'WARN',
      severity: 'MEDIUM',
      evidence: `Email detected: ${contact.email}`,
      recommendation: isProfessional ? '' : 'Consider using a professional email address (e.g., firstname.lastname@gmail.com).',
      scoreImpact: isProfessional ? 0 : -3,
    });
    if (isProfessional) strengths.push('Professional email address detected');
  }

  if (!contact.phone) {
    checks.push({
      id: 'contact_phone',
      category: 'Contact & Identity',
      label: 'Phone Number',
      status: 'WARN',
      severity: 'HIGH',
      evidence: 'No phone number detected.',
      recommendation: 'Add your phone number in international format: +91 9876543210 or (987) 654-3210.',
      scoreImpact: -8,
    });
    baseScore -= 8;
  } else {
    strengths.push('Phone number detected');
  }

  if (!contact.linkedinUrl) {
    checks.push({
      id: 'contact_linkedin',
      category: 'Contact & Identity',
      label: 'LinkedIn URL',
      status: 'WARN',
      severity: 'MEDIUM',
      evidence: 'LinkedIn profile URL not detected.',
      recommendation: 'Add your LinkedIn URL: linkedin.com/in/yourname. Customize it in LinkedIn Settings for a clean URL.',
      scoreImpact: -5,
    });
  } else {
    const isValid = isUrlValid(contact.linkedinUrl);
    checks.push({
      id: 'contact_linkedin',
      category: 'Contact & Identity',
      label: 'LinkedIn URL',
      status: isValid ? 'PASS' : 'WARN',
      severity: 'MEDIUM',
      evidence: `LinkedIn detected: ${contact.linkedinUrl}`,
      recommendation: isValid ? '' : 'LinkedIn URL appears malformed. Check that it matches: linkedin.com/in/yourname.',
      scoreImpact: 0,
    });
    strengths.push('LinkedIn profile URL included');
  }

  if (!contact.name) {
    checks.push({
      id: 'contact_name',
      category: 'Contact & Identity',
      label: 'Full Name at Top',
      status: 'WARN',
      severity: 'HIGH',
      evidence: 'Full name not detected at the start of resume.',
      recommendation: 'Your full name should be the first and largest text on the resume.',
      scoreImpact: -5,
    });
    baseScore -= 5;
  } else {
    strengths.push(`Name detected: "${contact.name}"`);
  }

  // ── STRUCTURE ─────────────────────────────────────────────────────────────

  const sectionTypes = parsed.sections.map(s => s.type);

  const requiredSections: Array<{ type: string; label: string; weight: number }> = [
    { type: 'experience', label: 'Work Experience', weight: 10 },
    { type: 'education', label: 'Education', weight: 8 },
    { type: 'skills', label: 'Skills', weight: 5 },
  ];

  for (const { type, label, weight } of requiredSections) {
    const hasSection = sectionTypes.includes(type);
    checks.push({
      id: `section_${type}`,
      category: 'Structure',
      label: `${label} Section`,
      status: hasSection ? 'PASS' : (type === 'experience' ? 'WARN' : 'WARN'),
      severity: type === 'experience' ? 'HIGH' : 'MEDIUM',
      evidence: hasSection
        ? `"${label}" section detected in resume.`
        : `"${label}" section heading not found. ATS systems look for this keyword.`,
      recommendation: hasSection ? '' : `Add a clearly labeled "${label}" section. Use standard headings — ATS systems scan for exact or near-exact heading names.`,
      scoreImpact: hasSection ? 0 : -weight,
    });
    if (!hasSection) baseScore -= weight;
    else strengths.push(`${label} section detected and parseable`);
  }

  // ── LINKS & URLS ──────────────────────────────────────────────────────────

  if (contact.githubUrl) {
    strengths.push('GitHub profile included — strong signal for technical roles');
  }

  if (contact.portfolioUrl) {
    strengths.push('Portfolio/website URL included');
  }

  // ── Final score calculation ────────────────────────────────────────────────

  // Apply all negative impacts from checks
  let adjustedScore = baseScore;
  for (const check of checks) {
    if (check.status !== 'PASS' && check.scoreImpact < 0) {
      // Already counted in baseScore for most — only apply if not already subtracted
    }
  }

  // Count explicit score impacts not already in baseScore
  const extraImpact = checks
    .filter(c => c.id !== 'image_only' && c.id !== 'multi_column' && c.id !== 'tables' &&
                 c.id !== 'special_chars' && c.id !== 'resume_length_short' &&
                 c.id !== 'contact_email' && c.id !== 'contact_phone' &&
                 c.id !== 'contact_name')
    .reduce((sum, c) => sum + (c.scoreImpact < 0 ? c.scoreImpact : 0), 0);

  adjustedScore = Math.max(0, Math.min(100, baseScore + extraImpact));

  const atsScore = Math.round(adjustedScore);
  const parsingConfidence = parsed.isImageOnly ? 0 :
    Math.max(20, Math.min(100, parsed.extractionConfidence));

  const atsRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' =
    atsScore >= 80 ? 'LOW' :
    atsScore >= 60 ? 'MEDIUM' :
    atsScore >= 40 ? 'HIGH' : 'CRITICAL';

  const failCount = checks.filter(c => c.status === 'FAIL').length;
  const warnCount = checks.filter(c => c.status === 'WARN').length;

  let summary = '';
  if (atsScore >= 85) {
    summary = `ATS compatibility is strong (${atsScore}/100). Your resume is well-structured and machine-readable.`;
  } else if (atsScore >= 65) {
    summary = `ATS compatibility is moderate (${atsScore}/100). ${failCount} critical issue(s) and ${warnCount} warning(s) detected.`;
  } else {
    summary = `ATS compatibility is low (${atsScore}/100). ${failCount} critical issue(s) may cause your resume to be rejected before a human sees it.`;
  }

  return {
    atsScore,
    parsingConfidence,
    atsRisk,
    checks: checks.sort((a, b) => {
      const order = { FAIL: 0, WARN: 1, PASS: 2 };
      return order[a.status] - order[b.status];
    }),
    strengths: strengths.slice(0, 6),
    summary,
  };
}
