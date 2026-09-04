'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';
import {
  LayoutDashboard, UserCircle, Database, Briefcase, FileText,
  Code2, Brain, BarChart3, Trophy, Settings, ChevronRight,
  GraduationCap, FlameKindling, Zap, BookOpen, Target,
  MonitorCheck, Menu, X, FileCog, Search, Bell, Bot, Compass,
  ChevronLeft, Building2, DollarSign, Sparkles, TrendingUp, ShieldCheck
} from 'lucide-react';

const navGroups = [
  {
    label: 'CAREER',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/dashboard/profile', label: 'Master Profile', icon: UserCircle },
      { href: '/dashboard/passport', label: 'Career Passport', icon: Compass },
      { href: '/dashboard/memory', label: 'Career Memory', icon: Database }
    ]
  },
  {
    label: 'RESUME',
    items: [
      { href: '/dashboard/resumes', label: 'Resume Builder', icon: FileText },
      { href: '/dashboard/resumes/studio', label: 'Resume Studio', icon: FileCog },
      { href: '/dashboard/resume-intelligence', label: 'ATS Analyzer', icon: Brain },
      { href: '/dashboard/resumes/tailor', label: 'Resume Tailoring', icon: Sparkles }
    ]
  },
  {
    label: 'JOB SEARCH',
    items: [
      { href: '/dashboard/jobs', label: 'Job Intelligence', icon: Briefcase },
      { href: '/dashboard/applications', label: 'Job Tracker', icon: FileCog },
      { href: '/dashboard/jobs/autopilot', label: 'Application Copilot', icon: Zap }
    ]
  },
  {
    label: 'PRACTICE',
    items: [
      { href: '/dashboard/assess', label: 'Assessments', icon: MonitorCheck },
      { href: '/dashboard/code', label: 'Coding Practice', icon: Code2 },
      { href: '/dashboard/questions', label: 'Question Bank', icon: BookOpen },
      { href: '/dashboard/roadmap', label: 'Learning Roadmap', icon: Target }
    ]
  },
  {
    label: 'INTERVIEW',
    items: [
      { href: '/dashboard/interview', label: 'Mock Interview', icon: Bot },
      { href: '/dashboard/interview/history', label: 'Interview History', icon: Database },
      { href: '/dashboard/interview/simulator', label: 'Interview Simulator', icon: MonitorCheck }
    ]
  },
  {
    label: 'INSIGHTS',
    items: [
      { href: '/dashboard/performance', label: 'Performance', icon: Trophy },
      { href: '/dashboard/skills/gaps', label: 'Skill Analytics', icon: ShieldCheck },
      { href: '/dashboard/readiness', label: 'Career Readiness', icon: TrendingUp }
    ]
  },
  {
    label: 'TOOLS',
    items: [
      { href: '/dashboard/copilot', label: 'AI Career Coach', icon: Bot },
      { href: '/dashboard/tools', label: 'Document Tools', icon: FileText },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings }
    ]
  }
];

// Bottom Nav Mobile Only
const bottomNavItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/resumes', label: 'Resumes', icon: FileText },
  { href: '/dashboard/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/dashboard/interview', label: 'Interview', icon: Brain },
];

interface SidebarProps {
  userName?: string;
  streak?: number;
  xp?: number;
  level?: number;
  userRole?: string;
}

export function Sidebar({ userName, streak = 0, xp = 0, level = 1, userRole = 'USER' }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  // Keyboard shortcut to toggle sidebar (Cmd+B / Ctrl+B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setIsCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const desktopContent = (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-xl">
      {/* Logo & Toggle */}
      <div className="h-14 flex items-center justify-between px-4 shrink-0">
        <Link href="/dashboard" className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <Logo showText={!isCollapsed} size="sm" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-6 scrollbar-hide">
        {navGroups.map(group => (
          <div key={group.label} className="space-y-1">
            {!isCollapsed && (
              <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-2">
                {group.label}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map(item => {
                const active = isActive(item.href, 'exact' in item ? item.exact : false);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group relative ${
                      active
                        ? 'bg-primary text-primary-foreground premium-shadow'
                        : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                    
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-border/50 space-y-1 bg-muted/10">
        <Link
          href="/dashboard/ai"
          title={isCollapsed ? "AI Control Center" : undefined}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
            isActive('/dashboard/ai') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
          } ${isCollapsed ? 'justify-center' : ''}`}
        >
          <div className="relative">
            <Bot className="w-4 h-4 shrink-0" />
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-success ring-2 ring-card" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 flex items-center justify-between">
              <span>AI Center</span>
              <span className="text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">Local</span>
            </div>
          )}
        </Link>
        {(userRole === 'ADMIN' || userRole === 'OWNER') && (
          <Link
            href="/admin"
            title={isCollapsed ? "Admin Command Center" : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all group bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 ${isCollapsed ? 'justify-center' : ''}`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-500" />
            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-between">
                <span>Admin Portal</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  {userRole}
                </span>
              </div>
            )}
          </Link>
        )}
        <Link
          href="/dashboard/settings"
          title={isCollapsed ? "Settings" : undefined}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all ${isCollapsed ? 'justify-center' : ''}`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </Link>
        
        {/* Toggle Collapse */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full flex items-center gap-3 px-3 py-2 mt-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all ${isCollapsed ? 'justify-center' : ''}`}
        >
          <ChevronLeft className={`w-4 h-4 shrink-0 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          {!isCollapsed && <span>Collapse (⌘B)</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`border-r border-border/50 hidden md:flex flex-col shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out z-20 ${
          isCollapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        {desktopContent}
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-card/80 backdrop-blur-xl border-b border-border/50 z-40 px-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">Rolevia</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/ai" className="relative p-2 rounded-full hover:bg-muted/80">
            <Bot className="w-5 h-5 text-muted-foreground" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-success ring-2 ring-card" />
          </Link>
          <Link href="/dashboard/settings" className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCircle className="w-4 h-4 text-primary" />
          </Link>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border/50 z-40 flex items-center justify-around px-2 pb-safe">
        {bottomNavItems.map(item => {
          const active = isActive(item.href, true);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className={`w-5 h-5 ${active ? 'fill-primary/20' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMobileMoreOpen(true)}
          className="flex flex-col items-center justify-center w-16 h-full gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>

      {/* Mobile "More" Sheet */}
      {mobileMoreOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
            onClick={() => setMobileMoreOpen(false)} 
          />
          <div className="relative bg-card w-full h-[85vh] rounded-t-3xl border-t border-border/50 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-200">
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mt-3 mb-2 shrink-0" />
            <div className="px-6 py-2 flex items-center justify-between border-b border-border/50 shrink-0">
              <h2 className="font-bold text-lg">Menu</h2>
              <button onClick={() => setMobileMoreOpen(false)} className="p-2 -mr-2 bg-muted/50 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              {/* Stats row */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30">
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold text-orange-500">{streak}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Streak</div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold text-yellow-500">{level}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Level</div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold">{xp}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">XP</div>
                </div>
              </div>

              {navGroups.map(group => (
                <div key={group.label} className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">
                    {group.label}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMoreOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all ${
                          isActive(item.href, 'exact' in item ? item.exact : false)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/30 text-foreground hover:bg-muted/60'
                        }`}
                      >
                        <item.icon className="w-4 h-4 opacity-70" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              {(userRole === 'ADMIN' || userRole === 'OWNER') && (
                <div className="pt-3 border-t border-border/50">
                  <Link
                    href="/admin"
                    onClick={() => setMobileMoreOpen(false)}
                    className="flex items-center justify-between p-3.5 rounded-xl text-sm font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-amber-500" />
                      <span>Admin Command Center</span>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                      {userRole}
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
