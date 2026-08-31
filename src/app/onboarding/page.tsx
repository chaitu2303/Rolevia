'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, Briefcase, ChevronRight, GraduationCap, 
  Target, Zap, Compass, Code2, LineChart, FileText, Upload
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FileUploader } from '@/components/FileUploader';
import { VerificationCard } from '@/components/VerificationCard';
import { ExtractedData } from '@/lib/types';

type OnboardingStep = 
  | 'WELCOME'
  | 'BASIC_PROFILE'
  | 'DOMAIN'
  | 'TARGET_ROLE'
  | 'RESUME_IMPORT'
  | 'EXTRACTION'
  | 'VERIFICATION'
  | 'COMPLETE';

const DOMAINS = [
  { id: 'swe', label: 'Software Engineering', icon: Code2, desc: 'Frontend, Backend, Fullstack, Mobile' },
  { id: 'data', label: 'Data & AI', icon: LineChart, desc: 'Data Science, Machine Learning, Analytics' },
  { id: 'product', label: 'Product & Design', icon: Target, desc: 'Product Management, UI/UX, Research' },
  { id: 'business', label: 'Business & Ops', icon: Briefcase, desc: 'Sales, Marketing, Operations, Strategy' }
];

export default function OnboardingPage() {
  const router = useRouter();
  
  // State
  const [step, setStep] = useState<OnboardingStep>('WELCOME');
  const [direction, setDirection] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  
  // Data
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [extractedFacts, setExtractedFacts] = useState<ExtractedData | null>(null);

  const navigateTo = (nextStep: OnboardingStep, dir: number = 1) => {
    setDirection(dir);
    setStep(nextStep);
  };

  const handleFinishSetup = async () => {
    setIsSaving(true);
    try {
      // Build final facts payload merging manual inputs with extracted data
      const finalFacts = extractedFacts ? {
        ...extractedFacts,
        basics: {
          ...extractedFacts.basics,
          value: {
            ...(extractedFacts.basics?.value || {}),
            name: name || extractedFacts.basics?.value?.name,
            targetRole,
            domain,
            department: DOMAINS.find(d => d.id === domain)?.label,
            careerGoal
          }
        }
      } : { basics: { value: { name, targetRole, domain, department: DOMAINS.find(d => d.id === domain)?.label, careerGoal } } };
      
      const res = await fetch('/api/profile/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facts: finalFacts })
      });
      
      if (res.ok) {
        router.push('/dashboard');
      } else {
        console.error('Failed to save profile');
        setIsSaving(false);
      }
    } catch (e) {
      console.error(e);
      setIsSaving(false);
    }
  };

  const handleConfirmFact = (category: keyof ExtractedData, updated: any, index?: number) => {
    setExtractedFacts((prev: ExtractedData | null) => {
      if (!prev) return prev;
      const next: any = { ...prev };
      if (index !== undefined) {
        if (!next[category]) next[category] = [];
        next[category][index] = updated;
      } else {
        next[category] = updated;
      }
      return next as ExtractedData;
    });
  };

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 })
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel: Content & Navigation */}
      <div className="flex-1 flex flex-col pt-12 pb-8 px-8 sm:px-16 lg:px-24">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-16 shrink-0">
          <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded-xl premium-shadow">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">Rolevia</span>
        </div>

        {/* Step Content */}
        <div className="flex-1 flex flex-col max-w-lg relative">
          <AnimatePresence mode="wait" custom={direction}>
            
            {step === 'WELCOME' && (
              <motion.div
                key="welcome"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col flex-1 justify-center"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide w-fit mb-6">
                  <Zap className="w-4 h-4" /> System Initialization
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-foreground leading-[1.1]">
                  Your Career.<br />Operating System.
                </h1>
                <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-md">
                  We're building your Master Career Profile. This will act as the brain for your tailored resumes, applications, and mock interviews.
                </p>
                <Button size="lg" className="w-fit pr-4 rounded-full" onClick={() => navigateTo('BASIC_PROFILE')}>
                  Initialize Profile <ChevronRight className="ml-4 w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {step === 'BASIC_PROFILE' && (
              <motion.div
                key="basic_profile"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex flex-col flex-1 justify-center"
              >
                <span className="text-sm font-semibold text-primary tracking-widest uppercase mb-4">Step 1</span>
                <h2 className="text-3xl font-bold tracking-tight mb-4">Let's start with the basics.</h2>
                <p className="text-muted-foreground mb-8">What should we call you?</p>
                
                <div className="space-y-6 max-w-sm">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input 
                      placeholder="e.g. Jane Doe" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 bg-muted/30 border-border focus-visible:ring-primary/20 text-lg rounded-xl"
                      autoFocus
                    />
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full rounded-xl" 
                    disabled={name.length < 2}
                    onClick={() => navigateTo('DOMAIN')}
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'DOMAIN' && (
              <motion.div
                key="domain"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex flex-col flex-1 justify-center"
              >
                <span className="text-sm font-semibold text-primary tracking-widest uppercase mb-4">Step 2</span>
                <h2 className="text-3xl font-bold tracking-tight mb-4">Select your career domain.</h2>
                <p className="text-muted-foreground mb-8">This tailors your coding arenas, assessments, and interview modules.</p>
                
                <div className="grid grid-cols-1 gap-3 max-w-md">
                  {DOMAINS.map(d => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setDomain(d.id);
                        navigateTo('TARGET_ROLE');
                      }}
                      className="flex items-start gap-4 p-5 text-left border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
                        <d.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{d.label}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{d.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'TARGET_ROLE' && (
              <motion.div
                key="target_role"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex flex-col flex-1 justify-center"
              >
                <span className="text-sm font-semibold text-primary tracking-widest uppercase mb-4">Step 3</span>
                <h2 className="text-3xl font-bold tracking-tight mb-4">What's your target role?</h2>
                <p className="text-muted-foreground mb-8">Be specific. We use this to analyze ATS matches and generate targeted mock interviews.</p>
                
                <div className="space-y-6 max-w-sm">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Job Title</label>
                    <Input 
                      placeholder="e.g. Senior Frontend Engineer" 
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="h-12 bg-muted/30 border-border focus-visible:ring-primary/20 text-lg rounded-xl"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Primary Career Goal</label>
                    <Input 
                      placeholder="e.g. Transition into AI, Lead a Team" 
                      value={careerGoal}
                      onChange={(e) => setCareerGoal(e.target.value)}
                      className="h-12 bg-muted/30 border-border focus-visible:ring-primary/20 text-lg rounded-xl"
                    />
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full rounded-xl" 
                    disabled={targetRole.length < 3}
                    onClick={() => navigateTo('RESUME_IMPORT')}
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'RESUME_IMPORT' && (
              <motion.div
                key="resume_import"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex flex-col flex-1 justify-center"
              >
                <span className="text-sm font-semibold text-primary tracking-widest uppercase mb-4">Step 4</span>
                <h2 className="text-3xl font-bold tracking-tight mb-4">Import your history.</h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                  Upload your existing resume to instantly populate your Master Profile. Our Native Intelligence engine will extract your experience and skills.
                </p>
                
                <div className="max-w-md w-full">
                  <FileUploader onExtractionComplete={(data) => {
                    setExtractedFacts(data.parsedData);
                    navigateTo('EXTRACTION');
                  }} />
                  
                  <div className="mt-6 flex items-center justify-center">
                    <button 
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => navigateTo('COMPLETE')}
                    >
                      Skip this step, I'll build my profile manually
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'EXTRACTION' && (
              <motion.div
                key="extraction"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex flex-col flex-1 justify-center items-start"
              >
                <div className="relative w-16 h-16 mb-8">
                  <motion.div 
                    className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">Analyzing Document</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-md">
                  The Rolevia engine is extracting your skills, structuring your experience, and building your unified profile.
                </p>
                
                <motion.div 
                  className="opacity-0"
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.0 }}
                  onAnimationComplete={() => setTimeout(() => navigateTo('VERIFICATION'), 500)}
                >
                  <p className="text-sm font-bold text-success flex items-center uppercase tracking-widest">
                    <CheckCircle className="w-4 h-4 mr-2" /> Extraction Complete
                  </p>
                </motion.div>
              </motion.div>
            )}

            {step === 'VERIFICATION' && (
              <motion.div
                key="verification"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex flex-col flex-1 py-8 h-full"
              >
                <div className="flex justify-between items-center mb-8 shrink-0">
                  <div>
                    <span className="text-sm font-semibold text-primary tracking-widest uppercase mb-1 block">Review</span>
                    <h2 className="text-2xl font-bold tracking-tight">Verify Extracted Facts</h2>
                  </div>
                  <Button size="sm" className="rounded-full px-6" onClick={() => navigateTo('COMPLETE')}>
                    Approve All
                  </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-4 space-y-4 pb-12 scrollbar-hide">
                  {!extractedFacts ? (
                    <p className="text-sm text-muted-foreground">No facts found.</p>
                  ) : (
                    <>
                      {extractedFacts.basics && extractedFacts.basics.value && (
                        <VerificationCard title="Personal Information" item={extractedFacts.basics} onConfirm={(updated) => handleConfirmFact('basics', updated)} />
                      )}
                      {extractedFacts.summary && extractedFacts.summary.value && (
                        <VerificationCard title="Professional Summary" item={extractedFacts.summary} onConfirm={(updated) => handleConfirmFact('summary', updated)} />
                      )}
                      {extractedFacts.experience?.map((exp: any, i: number) => (
                        <VerificationCard key={`exp-${i}`} title={`Experience: ${exp.value?.role || 'Unknown'}`} item={exp} onConfirm={(updated) => handleConfirmFact('experience', updated, i)} />
                      ))}
                      {extractedFacts.education?.map((edu: any, i: number) => (
                        <VerificationCard key={`edu-${i}`} title={`Education: ${edu.value?.degree || 'Unknown'}`} item={edu} onConfirm={(updated) => handleConfirmFact('education', updated, i)} />
                      ))}
                      {extractedFacts.skills?.map((skill: any, i: number) => (
                        <VerificationCard key={`skill-${i}`} title={`Skill`} item={skill} onConfirm={(updated) => handleConfirmFact('skills', updated, i)} />
                      ))}
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {step === 'COMPLETE' && (
              <motion.div
                key="complete"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex flex-col flex-1 justify-center items-start"
              >
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-8 text-success">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 leading-[1.1]">
                  System Ready.
                </h2>
                <p className="text-lg text-muted-foreground mb-10 max-w-md">
                  Your Master Profile has been initialized. You can now access the Command Center to begin job intelligence, resume targeting, and mock interviews.
                </p>
                <Button size="lg" className="rounded-full px-8" onClick={handleFinishSetup} disabled={isSaving}>
                  {isSaving ? 'Initializing...' : 'Enter Rolevia'} <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Right Panel: Contextual Visualization (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-1 bg-muted/20 border-l border-border/50 items-center justify-center p-12 relative overflow-hidden">
        
        {/* Subtle decorative background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <AnimatePresence mode="wait">
            
            {step === 'WELCOME' && (
              <motion.div
                key="viz-welcome"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="aspect-square bg-card rounded-2xl border premium-shadow p-6 flex flex-col items-start justify-between">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Compass className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold">Career Identity</div>
                    <div className="text-xs text-muted-foreground mt-1">Master Profile</div>
                  </div>
                </div>
                <div className="aspect-square bg-card rounded-2xl border premium-shadow p-6 flex flex-col items-start justify-between mt-8">
                  <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <div className="font-bold">Job Search</div>
                    <div className="text-xs text-muted-foreground mt-1">Intelligence</div>
                  </div>
                </div>
                <div className="aspect-square bg-card rounded-2xl border premium-shadow p-6 flex flex-col items-start justify-between -mt-8">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="font-bold">Practice</div>
                    <div className="text-xs text-muted-foreground mt-1">Arenas</div>
                  </div>
                </div>
                <div className="aspect-square bg-card rounded-2xl border premium-shadow p-6 flex flex-col items-start justify-between">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <Upload className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-bold">Utility</div>
                    <div className="text-xs text-muted-foreground mt-1">Studio</div>
                  </div>
                </div>
              </motion.div>
            )}

            {(step === 'BASIC_PROFILE' || step === 'DOMAIN' || step === 'TARGET_ROLE') && (
              <motion.div
                key="viz-profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full bg-card rounded-3xl border premium-shadow overflow-hidden"
              >
                <div className="h-24 bg-muted border-b relative">
                  <div className="absolute -bottom-8 left-6 w-16 h-16 bg-background rounded-2xl border-4 border-card flex items-center justify-center text-xl font-bold">
                    {name ? name.charAt(0).toUpperCase() : '?'}
                  </div>
                </div>
                <div className="pt-12 p-6">
                  <div className="h-6 w-1/2 bg-muted rounded mb-2 transition-all duration-300">
                    {name && <span className="font-bold text-lg -mt-1 block h-full text-foreground">{name}</span>}
                  </div>
                  <div className="h-4 w-1/3 bg-muted/50 rounded mb-6 transition-all duration-300">
                    {targetRole && <span className="text-sm -mt-0.5 block h-full text-primary font-medium">{targetRole}</span>}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-3 w-full bg-muted/30 rounded" />
                    <div className="h-3 w-4/5 bg-muted/30 rounded" />
                    <div className="h-3 w-5/6 bg-muted/30 rounded" />
                  </div>

                  <div className="mt-8 flex gap-2">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-colors ${domain === 'swe' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>Engineering</div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-colors ${domain === 'product' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>Product</div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-colors ${domain === 'data' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>Data</div>
                  </div>
                </div>
              </motion.div>
            )}

            {(step === 'RESUME_IMPORT' || step === 'EXTRACTION' || step === 'VERIFICATION') && (
              <motion.div
                key="viz-extract"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full aspect-[3/4] bg-card rounded-3xl border premium-shadow p-8 flex flex-col relative overflow-hidden"
              >
                <div className="w-1/2 h-6 bg-muted rounded mb-8" />
                
                <div className="space-y-6 flex-1">
                  <div>
                    <div className="w-1/4 h-3 bg-muted rounded mb-3" />
                    <div className="w-full h-2 bg-muted/50 rounded mb-2" />
                    <div className="w-5/6 h-2 bg-muted/50 rounded mb-2" />
                    <div className="w-4/5 h-2 bg-muted/50 rounded" />
                  </div>
                  <div>
                    <div className="w-1/4 h-3 bg-muted rounded mb-3" />
                    <div className="w-full h-2 bg-muted/50 rounded mb-2" />
                    <div className="w-full h-2 bg-muted/50 rounded mb-2" />
                    <div className="w-3/4 h-2 bg-muted/50 rounded" />
                  </div>
                </div>

                {step === 'EXTRACTION' && (
                  <motion.div 
                    initial={{ top: 0 }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 w-full h-[2px] bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] z-20"
                  />
                )}
                
                {step === 'VERIFICATION' && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-card border p-4 rounded-xl premium-shadow flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <div className="font-semibold text-sm">Data Mapped</div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 'COMPLETE' && (
              <motion.div
                key="viz-complete"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full relative"
              >
                <div className="w-full aspect-video bg-card border rounded-2xl premium-shadow overflow-hidden flex flex-col">
                  <div className="h-10 border-b bg-muted/30 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive/50" />
                    <div className="w-3 h-3 rounded-full bg-warning/50" />
                    <div className="w-3 h-3 rounded-full bg-success/50" />
                  </div>
                  <div className="flex-1 flex p-4 gap-4">
                    <div className="w-1/4 h-full bg-muted/30 rounded-xl" />
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="w-full h-1/3 bg-muted/30 rounded-xl" />
                      <div className="w-full flex-1 bg-muted/30 rounded-xl" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
