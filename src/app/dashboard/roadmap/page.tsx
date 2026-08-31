'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, CheckSquare, Square, CheckCircle, 
  Sparkles, Loader2, ArrowLeft, RefreshCw, Star, 
  LayoutDashboard 
} from 'lucide-react';
import Link from 'next/link';

interface Skill {
  name: string;
  level: string;
}

interface CareerModel {
  id: string;
  targetRoles: string[];
  skills: Skill[];
  learningProgress: any; // Checked items array
}

interface RoadmapItem {
  id: string;
  phase: 1 | 2 | 3;
  title: string;
  desc: string;
  category: 'critical' | 'moderate' | 'interview' | 'apply' | 'general';
}

const ROLE_REQUIREMENTS: Record<string, { required: string[]; preferred: string[] }> = {
  'Software Engineer': {
    required: ['Data Structures', 'Algorithms', 'Java', 'SQL', 'Git'],
    preferred: ['System Design', 'Docker', 'AWS', 'Redis']
  },
  'Frontend Engineer': {
    required: ['JavaScript', 'React', 'HTML & CSS', 'TypeScript', 'Git'],
    preferred: ['Next.js', 'Tailwind CSS', 'Redux', 'Jest', 'Webpack']
  },
  'Backend Engineer': {
    required: ['Node.js', 'SQL', 'REST APIs', 'Git', 'Databases'],
    preferred: ['Docker', 'Kubernetes', 'Redis', 'GraphQL', 'System Design']
  },
  'Fullstack Developer': {
    required: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'HTML & CSS'],
    preferred: ['TypeScript', 'Next.js', 'Docker', 'AWS', 'PostgreSQL']
  }
};

export default function CareerRoadmapPage() {
  const [careerModel, setCareerModel] = useState<CareerModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState('Frontend Engineer');

  useEffect(() => {
    fetch('/api/personal-career')
      .then(res => res.json())
      .then(data => {
        setCareerModel(data);
        if (data.targetRoles && data.targetRoles.length > 0) {
          const matched = Object.keys(ROLE_REQUIREMENTS).find(r => r.toLowerCase().includes(data.targetRoles[0].toLowerCase()));
          if (matched) setSelectedRole(matched);
        }
        if (Array.isArray(data.learningProgress)) {
          setCheckedIds(data.learningProgress);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading career details:', err);
        setLoading(false);
      });
  }, []);

  const handleToggleTask = async (taskId: string) => {
    if (!careerModel) return;
    
    let newChecked: string[];
    if (checkedIds.includes(taskId)) {
      newChecked = checkedIds.filter(id => id !== taskId);
    } else {
      newChecked = [...checkedIds, taskId];
    }
    
    setCheckedIds(newChecked);
    setSaving(true);

    try {
      await fetch('/api/personal-career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...careerModel,
          learningProgress: newChecked
        })
      });
    } catch (err) {
      console.error('Failed to save task update:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate gaps dynamically to populate tasks
  const userSkillsMap = new Map(careerModel?.skills.map(s => [s.name.toLowerCase(), s]) || []);
  const requirements = ROLE_REQUIREMENTS[selectedRole] || ROLE_REQUIREMENTS['Software Engineer'];
  
  const criticalGaps = requirements.required.filter(s => !userSkillsMap.has(s.toLowerCase()));
  const moderateGaps = requirements.preferred.filter(s => !userSkillsMap.has(s.toLowerCase()));

  // Construct Roadmap Items based on Gaps
  const roadmapItems: RoadmapItem[] = [
    // Month 1
    {
      id: 'm1_foundations',
      phase: 1,
      title: 'Setup Environment & Learning Tracks',
      desc: 'Create local sandboxes, configure IDE structures, and map out learning goals.',
      category: 'general'
    },
    ...criticalGaps.map(g => ({
      id: `m1_gap_${g.toLowerCase().replace(/\s+/g, '_')}`,
      phase: 1 as const,
      title: `Master ${g} Core Concepts`,
      desc: `Build a small targeted project demonstrating proof of ${g} usage.`,
      category: 'critical' as const
    })),
    {
      id: 'm1_git_evidence',
      phase: 1,
      title: 'Consolidate Git & Public Contributions',
      desc: 'Clean up GitHub repositories, write clear README documents, and structure code samples.',
      category: 'general'
    },

    // Month 2
    ...moderateGaps.map(g => ({
      id: `m2_gap_${g.toLowerCase().replace(/\s+/g, '_')}`,
      phase: 2 as const,
      title: `Acquire ${g} Skills`,
      desc: `Add matching preferred frameworks or databases to your technical arsenal.`,
      category: 'moderate' as const
    })),
    {
      id: 'm2_behavioral',
      phase: 2,
      title: 'Practice STAR Behavioral Questions',
      desc: 'Build 5 stories following the Situation, Task, Action, Result framework.',
      category: 'interview'
    },
    {
      id: 'm2_mock_tech',
      phase: 2,
      title: 'Run First Mock Technical Session',
      desc: 'Practice interactive coding simulations or system architectural mocks on Rolevia.',
      category: 'interview'
    },

    // Month 3
    {
      id: 'm3_optimize',
      phase: 3,
      title: 'Optimize Resume for Target Roles',
      desc: 'Update resume templates and run ATS scanning checks to ensure parsing safety.',
      category: 'apply'
    },
    {
      id: 'm3_cover_letter',
      phase: 3,
      title: 'Draft Tailored Cover Letters',
      desc: 'Generate role-specific cover letters linking your resume facts directly to JD requirements.',
      category: 'apply'
    },
    {
      id: 'm3_salary',
      phase: 3,
      title: 'Salary Negotiation Preparation',
      desc: 'Learn standard counter-offer structures and practice alignment conversations.',
      category: 'general'
    }
  ];

  const phase1Tasks = roadmapItems.filter(i => i.phase === 1);
  const phase2Tasks = roadmapItems.filter(i => i.phase === 2);
  const phase3Tasks = roadmapItems.filter(i => i.phase === 3);

  const getPhaseProgress = (tasks: RoadmapItem[]) => {
    const checked = tasks.filter(t => checkedIds.includes(t.id)).length;
    return tasks.length > 0 ? Math.round((checked / tasks.length) * 100) : 0;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-6 space-y-8 max-w-7xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <Link
            href="/dashboard/skills"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Skill Gaps
          </Link>
          <h1 className="text-3xl font-black text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            30/60/90-Day Career Roadmap
          </h1>
          <p className="text-sm text-muted-foreground">
            Step-by-step preparation plan tailored to close your identified skill gaps for <span className="font-semibold text-foreground">{selectedRole}</span>.
          </p>
        </div>
        {saving && (
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 bg-muted/40 px-3 py-1 rounded-full border border-border">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving progress...
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Month 1: Foundation */}
        <Card className="rounded-2xl border border-border shadow-sm overflow-hidden bg-card">
          <div className="bg-primary/80 h-1.5 w-full shrink-0" />
          <CardContent className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-foreground">Month 1 (Day 1-30)</h3>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Foundation & Critical Gaps</p>
              </div>
              <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-lg font-bold">{getPhaseProgress(phase1Tasks)}%</span>
            </div>
            
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${getPhaseProgress(phase1Tasks)}%` }}
                className="h-full bg-primary transition-all duration-500 ease-out" 
              />
            </div>

            <div className="space-y-3 pt-2">
              {phase1Tasks.map(item => {
                const isChecked = checkedIds.includes(item.id);
                return (
                  <div 
                    key={item.id} 
                    onClick={() => handleToggleTask(item.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer group ${
                      isChecked 
                        ? 'border-primary/20 bg-primary/5' 
                        : 'border-border bg-card hover:border-primary/30 hover:bg-muted/30'
                    }`}
                  >
                    {isChecked ? (
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5 transition-transform group-hover:scale-110" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0 mt-0.5 transition-colors group-hover:border-primary/50" />
                    )}
                    <div>
                      <p className={`text-sm font-semibold transition-colors ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground group-hover:text-primary'}`}>{item.title}</p>
                      <p className={`text-xs mt-1 leading-relaxed ${isChecked ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Month 2: Practice */}
        <Card className="rounded-2xl border border-border shadow-sm overflow-hidden bg-card">
          <div className="bg-amber-500/80 h-1.5 w-full shrink-0" />
          <CardContent className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-foreground">Month 2 (Day 31-60)</h3>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Practice & Mocks</p>
              </div>
              <span className="text-xs bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-lg font-bold">{getPhaseProgress(phase2Tasks)}%</span>
            </div>
            
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${getPhaseProgress(phase2Tasks)}%` }}
                className="h-full bg-amber-500 transition-all duration-500 ease-out" 
              />
            </div>

            <div className="space-y-3 pt-2">
              {phase2Tasks.map(item => {
                const isChecked = checkedIds.includes(item.id);
                return (
                  <div 
                    key={item.id} 
                    onClick={() => handleToggleTask(item.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer group ${
                      isChecked 
                        ? 'border-amber-500/20 bg-amber-500/5' 
                        : 'border-border bg-card hover:border-amber-500/30 hover:bg-muted/30'
                    }`}
                  >
                    {isChecked ? (
                      <CheckCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 transition-transform group-hover:scale-110" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0 mt-0.5 transition-colors group-hover:border-amber-500/50" />
                    )}
                    <div>
                      <p className={`text-sm font-semibold transition-colors ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground group-hover:text-amber-600'}`}>{item.title}</p>
                      <p className={`text-xs mt-1 leading-relaxed ${isChecked ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Month 3: Apply */}
        <Card className="rounded-2xl border border-border shadow-sm overflow-hidden bg-card">
          <div className="bg-success/80 h-1.5 w-full shrink-0" />
          <CardContent className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-foreground">Month 3 (Day 61-90)</h3>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Polish & Applications</p>
              </div>
              <span className="text-xs bg-success/10 text-success px-2.5 py-1 rounded-lg font-bold">{getPhaseProgress(phase3Tasks)}%</span>
            </div>
            
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${getPhaseProgress(phase3Tasks)}%` }}
                className="h-full bg-success transition-all duration-500 ease-out" 
              />
            </div>

            <div className="space-y-3 pt-2">
              {phase3Tasks.map(item => {
                const isChecked = checkedIds.includes(item.id);
                return (
                  <div 
                    key={item.id} 
                    onClick={() => handleToggleTask(item.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer group ${
                      isChecked 
                        ? 'border-success/20 bg-success/5' 
                        : 'border-border bg-card hover:border-success/30 hover:bg-muted/30'
                    }`}
                  >
                    {isChecked ? (
                      <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5 transition-transform group-hover:scale-110" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0 mt-0.5 transition-colors group-hover:border-success/50" />
                    )}
                    <div>
                      <p className={`text-sm font-semibold transition-colors ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground group-hover:text-success'}`}>{item.title}</p>
                      <p className={`text-xs mt-1 leading-relaxed ${isChecked ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
