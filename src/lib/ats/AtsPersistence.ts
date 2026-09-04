// Shared ATS result persistence — saves scan results across login flow
// Uses localStorage so the data survives navigation to login and back

const ATS_STORAGE_KEY = 'p2j_ats_pending';

export interface StoredAtsResult {
  overallScore: number;
  parseRate: number;
  contentScore: number;
  sectionsScore: number;
  formattingScore: number;
  checks: Array<{
    id: string;
    category: string;
    severity: string;
    label: string;
    status: string;
    evidence: string;
    recommendation: string;
  }>;
  strengths: string[];
  summary: string;
  fileName?: string;
  scannedAt: number;
  autoFixedResume?: string;
}

export function saveAtsPendingResult(result: Omit<StoredAtsResult, 'scannedAt'>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ATS_STORAGE_KEY, JSON.stringify({ ...result, scannedAt: Date.now() }));
}

export function getAtsPendingResult(): StoredAtsResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ATS_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredAtsResult;
    // Expire after 30 minutes
    if (Date.now() - data.scannedAt > 30 * 60 * 1000) {
      clearAtsPendingResult();
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearAtsPendingResult() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ATS_STORAGE_KEY);
}
