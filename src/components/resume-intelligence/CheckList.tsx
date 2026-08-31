'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';

type CheckStatus = 'PASS' | 'WARN' | 'FAIL';

interface Check {
  id: string;
  label: string;
  status: CheckStatus;
  severity: string;
  evidence: string;
  recommendation: string;
  category?: string;
  scoreImpact?: number;
}

interface CheckListProps {
  checks: Check[];
  title?: string;
  showCategories?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

const STATUS_CONFIG = {
  PASS: {
    icon: CheckCircle2,
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
    label: 'Pass',
  },
  WARN: {
    icon: AlertTriangle,
    color: 'text-warning-foreground',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    label: 'Warning',
  },
  FAIL: {
    icon: XCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    label: 'Critical',
  },
};

function CheckItem({ check }: { check: Check }) {
  const [expanded, setExpanded] = useState(check.status !== 'PASS');
  const config = STATUS_CONFIG[check.status];
  const Icon = config.icon;

  const getWhyExplanation = (check: Check) => {
    if (check.id.includes('email')) return 'Recruiters and ATS need direct contact details to notify you of interview offers.';
    if (check.id.includes('linkedin')) return 'A complete LinkedIn profile acts as secondary professional evidence and increases searchability.';
    if (check.id.includes('phone')) return 'Direct call options are necessary for scheduling initial screening interviews.';
    if (check.id.includes('tables')) return 'Parsers often ignore table boundaries and read grid contents left-to-right, mixing up text columns.';
    if (check.id.includes('column')) return 'Two-column documents can lead to mixed parser results when read left-to-right.';
    if (check.id.includes('special')) return 'Unusual icons or special font characters can trigger parsing errors and corrupt text encoding.';
    if (check.id.includes('experience')) return 'Parsed roles are primary weight points in evaluating candidate seniority and suitability.';
    if (check.id.includes('skills')) return 'Search systems match job description keyword tags directly to your parsed skills list.';
    return 'Ensuring standard formatting and structure prevents parsing anomalies and improves matching probability.';
  };

  const getImpactLabel = (check: Check) => {
    if (check.status === 'PASS') return 'Positive structure verification (0 impact).';
    const points = check.scoreImpact ? Math.abs(check.scoreImpact) : (check.severity === 'CRITICAL' ? 15 : check.severity === 'HIGH' ? 10 : 5);
    return `Reduces overall parser compatibility and score by ${points} points.`;
  };

  const getWhereLabel = (check: Check) => {
    if (check.category) {
      return `${check.category} Section`;
    }
    return 'Document Header / Structure';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border ${config.border} ${config.bg} overflow-hidden`}
    >
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${config.color}`} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm">{check.label}</p>
          {!expanded && check.status !== 'PASS' && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{check.evidence}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
            {config.label}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3.5 border-t border-slate-200/40 dark:border-slate-800/40 pt-4 bg-white/40 dark:bg-black/10">
              
              {/* WHY */}
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">WHY</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">{getWhyExplanation(check)}</p>
              </div>

              {/* WHERE */}
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">WHERE</p>
                <p className="text-xs font-mono text-slate-650 dark:text-slate-400 bg-muted/40 rounded px-2 py-1 inline-block">
                  {getWhereLabel(check)} → <span className="italic">"{check.evidence || 'No text segment tagged'}"</span>
                </p>
              </div>

              {/* IMPACT */}
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">IMPACT</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{getImpactLabel(check)}</p>
              </div>

              {/* FIX */}
              {check.recommendation ? (
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">FIX</p>
                  <p className="text-xs text-foreground bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg p-2.5 leading-relaxed">
                    💡 {check.recommendation}
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">FIX</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50/30 rounded px-2.5 py-1.5 inline-block">
                    ✓ Verified. No adjustment needed.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function CheckList({
  checks,
  title,
  showCategories = false,
  collapsible = false,
  defaultExpanded = true,
}: CheckListProps) {
  const [sectionExpanded, setSectionExpanded] = useState(defaultExpanded);

  const failCount = checks.filter(c => c.status === 'FAIL').length;
  const warnCount = checks.filter(c => c.status === 'WARN').length;
  const passCount = checks.filter(c => c.status === 'PASS').length;

  // Group by category if needed
  const categories = showCategories
    ? [...new Set(checks.map(c => c.category ?? 'General'))]
    : ['all'];

  return (
    <div className="space-y-4">
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <div className="flex items-center gap-1.5">
              {failCount > 0 && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                  {failCount} critical
                </span>
              )}
              {warnCount > 0 && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning-foreground">
                  {warnCount} warning
                </span>
              )}
              {passCount > 0 && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">
                  {passCount} pass
                </span>
              )}
            </div>
          </div>
          {collapsible && (
            <button
              onClick={() => setSectionExpanded(v => !v)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              {sectionExpanded ? 'Collapse' : 'Expand'}
              {sectionExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      )}

      <AnimatePresence>
        {(!collapsible || sectionExpanded) && (
          <motion.div
            initial={collapsible ? { height: 0, opacity: 0 } : {}}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {showCategories ? (
              categories.map(cat => {
                const catChecks = checks.filter(c => (c.category ?? 'General') === cat);
                return (
                  <div key={cat} className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                      {cat}
                    </p>
                    {catChecks.map(check => (
                      <CheckItem key={check.id} check={check} />
                    ))}
                  </div>
                );
              })
            ) : (
              checks.map(check => (
                <CheckItem key={check.id} check={check} />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
