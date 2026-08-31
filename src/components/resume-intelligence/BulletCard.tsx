'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Zap, AlertTriangle, CheckCircle2, Lightbulb, TrendingUp } from 'lucide-react';
import type { BulletAnalysis } from '@/lib/intelligence/BulletAnalyzer';

interface ScoreBarProps {
  label: string;
  score: number;
  color?: string;
}

function ScoreBar({ label, score, color = 'bg-primary' }: ScoreBarProps) {
  const barColor =
    score >= 70 ? 'bg-success' :
    score >= 45 ? 'bg-warning' :
    'bg-destructive';

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold tabular-nums">{score}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
    </div>
  );
}

interface BulletCardProps {
  analysis: BulletAnalysis;
  index?: number;
}

export function BulletCard({ analysis, index = 0 }: BulletCardProps) {
  const [expanded, setExpanded] = useState(analysis.overallScore < 60);

  const scoreColor =
    analysis.overallScore >= 70 ? 'text-success' :
    analysis.overallScore >= 45 ? 'text-warning-foreground' :
    'text-destructive';

  const scoreBg =
    analysis.overallScore >= 70 ? 'bg-success/10 border-success/20' :
    analysis.overallScore >= 45 ? 'bg-warning/10 border-warning/20' :
    'bg-destructive/10 border-destructive/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-xl border overflow-hidden ${scoreBg}`}
    >
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        {/* Score badge */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm ${scoreBg} ${scoreColor} border`}>
          {analysis.overallScore}
        </div>

        {/* Bullet text + quick flags */}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm text-foreground leading-relaxed line-clamp-2">
            {analysis.originalText}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {analysis.hasQuantification && (
              <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                <TrendingUp className="w-3 h-3" /> Quantified
              </span>
            )}
            {analysis.weakVerb && (
              <span className="inline-flex items-center gap-1 text-xs text-warning-foreground font-medium">
                <AlertTriangle className="w-3 h-3" /> Weak verb: "{analysis.weakVerb}"
              </span>
            )}
            {analysis.issues.length === 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                <CheckCircle2 className="w-3 h-3" /> Strong bullet
              </span>
            )}
          </div>
        </div>

        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />}
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
            <div className="px-4 pb-4 space-y-4 border-t border-current/10 pt-3">
              {/* Score bars */}
              <div className="space-y-2">
                <ScoreBar label="Impact" score={analysis.impactScore} />
                <ScoreBar label="Clarity" score={analysis.clarityScore} />
                <ScoreBar label="Specificity" score={analysis.specificityScore} />
                <ScoreBar label="Action Strength" score={analysis.actionStrength} />
                <ScoreBar label="Quantification" score={analysis.quantificationScore} />
              </div>

              {/* Issues */}
              {analysis.issues.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Issues Found</p>
                  {analysis.issues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-foreground">{issue.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {analysis.suggestions.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Improvements</p>
                  {analysis.suggestions.map((sug, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-foreground">{sug.description}</p>
                        {sug.example && (
                          <p className="text-xs text-muted-foreground mt-1 bg-muted/50 rounded px-2 py-1 font-mono leading-relaxed">
                            {sug.example}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Verb suggestion */}
              {analysis.weakVerb && analysis.suggestedVerb && (
                <div className="flex items-center gap-2 bg-primary/5 rounded-lg p-3">
                  <Zap className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="text-xs text-foreground">
                    Replace <span className="font-mono font-semibold text-destructive">"{analysis.weakVerb}"</span>
                    {' '}with <span className="font-mono font-semibold text-success">"{analysis.suggestedVerb}"</span>
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

interface BulletListProps {
  analyses: BulletAnalysis[];
  title?: string;
}

export function BulletList({ analyses, title = 'Bullet Intelligence' }: BulletListProps) {
  const [filter, setFilter] = useState<'all' | 'weak' | 'strong'>('all');

  const filtered = analyses.filter(a => {
    if (filter === 'weak') return a.overallScore < 60;
    if (filter === 'strong') return a.overallScore >= 70;
    return true;
  });

  const avgScore = analyses.length > 0
    ? Math.round(analyses.reduce((s, a) => s + a.overallScore, 0) / analyses.length)
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-0.5">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">
            {analyses.length} bullets · Avg score: {avgScore}/100
          </p>
        </div>
        <div className="flex rounded-xl border border-border overflow-hidden">
          {(['all', 'weak', 'strong'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No bullets match this filter.
          </p>
        ) : (
          filtered.map((analysis, idx) => (
            <BulletCard key={idx} analysis={analysis} index={idx} />
          ))
        )}
      </div>
    </div>
  );
}
