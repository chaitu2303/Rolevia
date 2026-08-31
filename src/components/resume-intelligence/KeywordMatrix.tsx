'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, AlertCircle, Search } from 'lucide-react';
import type { KeywordMatch } from '@/lib/intelligence/KeywordEngine';

const STATUS_CONFIG = {
  FOUND: {
    label: 'Found',
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
    icon: CheckCircle2,
    iconColor: 'text-success',
  },
  PARTIAL: {
    label: 'Partial',
    color: 'text-warning-foreground',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    icon: Circle,
    iconColor: 'text-warning-foreground',
  },
  MISSING: {
    label: 'Missing',
    color: 'text-destructive',
    bg: 'bg-destructive/5',
    border: 'border-destructive/15',
    icon: AlertCircle,
    iconColor: 'text-destructive',
  },
};

const IMPORTANCE_LABELS: Record<string, string> = {
  REQUIRED: '🔴 Required',
  PREFERRED: '🟡 Preferred',
  DOMAIN: '🔵 Domain',
};

interface KeywordMatrixProps {
  keywordMatches: KeywordMatch[];
}

export function KeywordMatrix({ keywordMatches }: KeywordMatrixProps) {
  const [filter, setFilter] = useState<'all' | 'FOUND' | 'MISSING' | 'PARTIAL'>('all');
  const [search, setSearch] = useState('');

  const filtered = keywordMatches.filter(k => {
    const matchesFilter = filter === 'all' || k.status === filter;
    const matchesSearch = !search || k.keyword.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const foundCount = keywordMatches.filter(k => k.status === 'FOUND').length;
  const partialCount = keywordMatches.filter(k => k.status === 'PARTIAL').length;
  const missingCount = keywordMatches.filter(k => k.status === 'MISSING').length;
  const total = keywordMatches.length;

  // Group by importance for ordered display
  const required = filtered.filter(k => k.importance === 'REQUIRED');
  const preferred = filtered.filter(k => k.importance === 'PREFERRED');
  const domain = filtered.filter(k => k.importance === 'DOMAIN');

function KeywordItem({ match, config, idx }: { match: KeywordMatch; config: any; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = config.icon;
  const hasDetails = match.evidence || match.status === 'MISSING';

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.02 }}
      className={`group rounded-xl border p-3 transition-all duration-250 select-none ${config.bg} ${config.border} ${
        hasDetails ? 'cursor-pointer hover:shadow-sm' : ''
      }`}
      onClick={() => hasDetails && setExpanded(!expanded)}
    >
      <div className="flex items-start gap-2 justify-between">
        <div className="flex items-start gap-2">
          <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground capitalize flex items-center gap-1.5">
              {match.keyword}
              {hasDetails && (
                <span className="text-[10px] text-muted-foreground/60 font-normal group-hover:underline">
                  (click to view evidence)
                </span>
              )}
            </p>
            <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
          </div>
        </div>
      </div>

      {expanded && hasDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 space-y-2"
        >
          {match.status !== 'MISSING' && match.evidence && (
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">RESUME EVIDENCE</p>
              <div className="text-xs text-slate-755 dark:text-slate-300 bg-white/60 dark:bg-black/20 border border-slate-200/40 dark:border-slate-800/40 rounded-lg p-2.5 leading-relaxed italic">
                "{match.evidence}"
              </div>
            </div>
          )}

          {match.status === 'MISSING' && (
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-destructive uppercase tracking-wider">MISSING SKILL GAP</p>
              <div className="text-xs text-destructive bg-destructive/5 rounded-lg p-2.5 border border-destructive/10 leading-relaxed">
                ⚠️ This skill is required for this role but was not detected in your resume parser. Only add this if you genuinely have this experience.
              </div>
            </div>
          )}

          {match.resumeSection && (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="font-semibold">Detected in:</span>
              <span className="bg-slate-200/60 dark:bg-slate-800/60 px-1.5 py-0.5 rounded capitalize">
                {match.resumeSection}
              </span>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-success/10 border border-success/20 p-3 text-center">
          <p className="text-2xl font-black text-success">{foundCount}</p>
          <p className="text-xs text-success/70 font-medium">Found</p>
        </div>
        <div className="rounded-xl bg-warning/10 border border-warning/20 p-3 text-center">
          <p className="text-2xl font-black text-warning-foreground">{partialCount}</p>
          <p className="text-xs text-warning-foreground/70 font-medium">Partial</p>
        </div>
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-center">
          <p className="text-2xl font-black text-destructive">{missingCount}</p>
          <p className="text-xs text-destructive/70 font-medium">Missing</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="rounded-xl bg-muted/50 p-3 space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Keyword Coverage</span>
          <span>{total > 0 ? Math.round((foundCount / total) * 100) : 0}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden flex">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${total > 0 ? (foundCount / total) * 100 : 0}%` }}
            transition={{ duration: 0.8 }}
            className="bg-success h-full"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${total > 0 ? (partialCount / total) * 100 : 0}%` }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bg-warning h-full"
          />
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search keywords..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex rounded-xl border border-border overflow-hidden">
          {(['all', 'FOUND', 'PARTIAL', 'MISSING'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1.5 text-xs font-medium transition-colors capitalize ${
                filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'All' : STATUS_CONFIG[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Keyword groups */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No keywords match this filter.</p>
      ) : (
        <div className="space-y-4">
          {required.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {IMPORTANCE_LABELS['REQUIRED']} ({required.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {required.map((k, i) => (
                  <KeywordItem key={k.keyword} match={k} config={STATUS_CONFIG[k.status]} idx={i} />
                ))}
              </div>
            </div>
          )}
          {preferred.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {IMPORTANCE_LABELS['PREFERRED']} ({preferred.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {preferred.map((k, i) => (
                  <KeywordItem key={k.keyword} match={k} config={STATUS_CONFIG[k.status]} idx={i} />
                ))}
              </div>
            </div>
          )}
          {domain.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {IMPORTANCE_LABELS['DOMAIN']} ({domain.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {domain.map((k, i) => (
                  <KeywordItem key={k.keyword} match={k} config={STATUS_CONFIG[k.status]} idx={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
