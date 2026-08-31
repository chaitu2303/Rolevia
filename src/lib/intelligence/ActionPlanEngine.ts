/**
 * Rolevia Action Plan Engine
 * Aggregates all check results → produces a prioritized, deduplicated action plan.
 * P0: Critical (blockers)
 * P1: High impact
 * P2: Keyword & content improvements
 * P3: Polish
 */

export type Priority = 'P0' | 'P1' | 'P2' | 'P3';

export interface ActionItem {
  id: string;
  priority: Priority;
  priorityLabel: string;
  category: string;
  title: string;
  description: string;
  evidence: string;
  recommendation: string;
  estimatedImpact: string;  // e.g., "+15 ATS Score"
  dimension: string;        // which score this affects
  done: boolean;
}

export interface ActionPlanResult {
  items: ActionItem[];
  criticalCount: number;
  highCount: number;
  totalCount: number;
  summary: string;
}

function severityToPriority(severity: string, status: string): Priority {
  if (status === 'PASS') return 'P3';
  if (severity === 'CRITICAL' && status === 'FAIL') return 'P0';
  if (severity === 'HIGH' && status === 'FAIL') return 'P0';
  if (severity === 'HIGH' && status === 'WARN') return 'P1';
  if (severity === 'MEDIUM' && status === 'FAIL') return 'P1';
  if (severity === 'MEDIUM' && status === 'WARN') return 'P2';
  return 'P3';
}

const PRIORITY_LABELS: Record<Priority, string> = {
  P0: '🔴 Critical — Fix First',
  P1: '🟠 High Impact',
  P2: '🟡 Keyword & Content',
  P3: '🟢 Polish',
};

const PRIORITY_SORT: Record<Priority, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };

interface CheckLike {
  id: string;
  label: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: string;
  recommendation: string;
  scoreImpact?: number;
  category?: string;
}

interface SignalLike {
  id: string;
  label: string;
  status: 'STRONG' | 'NEUTRAL' | 'WEAK';
  evidence: string;
  impact: string;
  category?: string;
}

interface PrivacyFlagLike {
  id: string;
  label: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: string;
  recommendation: string;
  category?: string;
}

interface DimensionLike {
  dimension: string;
  score: number;
  status: 'STRONG' | 'PARTIAL' | 'GAP';
  evidence: string;
  recommendation: string;
}

export function buildActionPlan(params: {
  atsChecks: CheckLike[];
  contentChecks: CheckLike[];
  impactChecks: CheckLike[];
  recruiterSignals?: SignalLike[];
  privacyFlags?: PrivacyFlagLike[];
  jobMatchDimensions?: DimensionLike[];
}): ActionPlanResult {
  const {
    atsChecks,
    contentChecks,
    impactChecks,
    recruiterSignals = [],
    privacyFlags = [],
    jobMatchDimensions = [],
  } = params;

  const items: ActionItem[] = [];
  const seenIds = new Set<string>();

  const addFromCheck = (check: CheckLike, dimension: string) => {
    if (check.status === 'PASS' || !check.recommendation) return;
    if (seenIds.has(check.id)) return;
    seenIds.add(check.id);

    const priority = severityToPriority(check.severity, check.status);
    const impact =
      check.severity === 'CRITICAL' ? '+10–20 Score'
      : check.severity === 'HIGH' ? '+5–15 Score'
      : check.severity === 'MEDIUM' ? '+3–8 Score'
      : '+1–5 Score';

    items.push({
      id: check.id,
      priority,
      priorityLabel: PRIORITY_LABELS[priority],
      category: check.category ?? dimension,
      title: check.label,
      description: check.evidence,
      evidence: check.evidence,
      recommendation: check.recommendation,
      estimatedImpact: impact,
      dimension,
      done: false,
    });
  };

  // ATS checks
  atsChecks.forEach(c => addFromCheck(c, 'ATS Compatibility'));

  // Content checks
  contentChecks.forEach(c => addFromCheck(c, 'Content Quality'));

  // Impact checks
  impactChecks.forEach(c => addFromCheck(c, 'Impact & Evidence'));

  // Recruiter signals (WEAK = actionable)
  for (const signal of recruiterSignals) {
    if (signal.status !== 'WEAK' || seenIds.has(signal.id)) continue;
    seenIds.add(signal.id);
    items.push({
      id: signal.id,
      priority: 'P1',
      priorityLabel: PRIORITY_LABELS['P1'],
      category: signal.category ?? 'Recruiter Readiness',
      title: signal.label,
      description: signal.evidence,
      evidence: signal.evidence,
      recommendation: signal.impact,
      estimatedImpact: '+3–8 Score',
      dimension: 'Recruiter Readiness',
      done: false,
    });
  }

  // Privacy flags (HIGH = P0)
  for (const flag of privacyFlags) {
    if (seenIds.has(flag.id)) continue;
    seenIds.add(flag.id);
    const priority: Priority = flag.severity === 'HIGH' ? 'P0' : flag.severity === 'MEDIUM' ? 'P1' : 'P2';
    items.push({
      id: flag.id,
      priority,
      priorityLabel: PRIORITY_LABELS[priority],
      category: flag.category ?? 'Privacy & Bias',
      title: flag.label,
      description: flag.evidence,
      evidence: flag.evidence,
      recommendation: flag.recommendation,
      estimatedImpact: 'Privacy Risk Reduction',
      dimension: 'Privacy & Bias',
      done: false,
    });
  }

  // Job match gaps
  for (const dim of jobMatchDimensions) {
    if (dim.status !== 'GAP' || !dim.recommendation || seenIds.has(`jm_${dim.dimension}`)) continue;
    seenIds.add(`jm_${dim.dimension}`);
    items.push({
      id: `jm_${dim.dimension}`,
      priority: 'P2',
      priorityLabel: PRIORITY_LABELS['P2'],
      category: 'Job Match',
      title: `Job Match Gap: ${dim.dimension}`,
      description: dim.evidence,
      evidence: dim.evidence,
      recommendation: dim.recommendation,
      estimatedImpact: '+5–10 Job Match',
      dimension: 'Job Match',
      done: false,
    });
  }

  // Sort by priority
  const sorted = items.sort((a, b) => PRIORITY_SORT[a.priority] - PRIORITY_SORT[b.priority]);

  const criticalCount = sorted.filter(i => i.priority === 'P0').length;
  const highCount = sorted.filter(i => i.priority === 'P1').length;

  const summary = sorted.length === 0
    ? 'No critical issues detected. Your resume is in strong shape.'
    : `${criticalCount} critical fix${criticalCount !== 1 ? 'es' : ''} and ${highCount} high-impact improvement${highCount !== 1 ? 's' : ''} identified.`;

  return {
    items: sorted,
    criticalCount,
    highCount,
    totalCount: sorted.length,
    summary,
  };
}
