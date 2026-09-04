'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  FileText, 
  Bug, 
  MessageSquare, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  ArrowUpRight,
  RefreshCw,
  Award,
  Crown,
  Database,
  Server,
  Zap,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Cpu,
  HardDrive,
  Radio,
  Clock,
  Check,
  X
} from 'lucide-react';
import { AuthenticatedUser } from '@/lib/auth/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface AdminDashboardProps {
  currentUser: AuthenticatedUser;
}

export function AdminDashboardClient({ currentUser }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activity' | 'flags' | 'health' | 'audit' | 'feedback' | 'bugs'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [bugs, setBugs] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [flags, setFlags] = useState<any[]>([]);
  const [totalCreditsConsumed, setTotalCreditsConsumed] = useState<number>(0);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [flagToggling, setFlagToggling] = useState<string | null>(null);

  // Load Overview Data
  const loadOverview = async () => {
    try {
      const res = await fetch('/api/admin/overview');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load Users Data
  const loadUsers = async (q: string = '') => {
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load Health Data
  const loadHealth = async () => {
    try {
      const res = await fetch('/api/admin/health');
      const data = await res.json();
      if (data.success) {
        setHealth(data.health);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load Live Activity Data
  const loadActivity = async () => {
    try {
      const res = await fetch('/api/admin/activity?limit=50');
      const data = await res.json();
      if (data.success) {
        setActivities(data.activities);
        setTotalCreditsConsumed(data.totalCreditsConsumed);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load Feature Flags Data
  const loadFlags = async () => {
    try {
      const res = await fetch('/api/admin/feature-flags');
      const data = await res.json();
      if (data.success) {
        setFlags(data.flags);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load Audit Logs
  const loadAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs');
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load Feedback
  const loadFeedback = async () => {
    try {
      const res = await fetch('/api/feedback');
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.feedbacks);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load Bugs
  const loadBugs = async () => {
    try {
      const res = await fetch('/api/bugs');
      const data = await res.json();
      if (data.success) {
        setBugs(data.bugs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadOverview(), loadUsers(), loadHealth()])
      .finally(() => setLoading(false));
  }, []);

  const handleUserAction = async (targetUserId: string, action: string, payload: Record<string, any> = {}) => {
    setActionLoading(targetUserId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, action, ...payload })
      });
      const data = await res.json();
      if (data.success) {
        await loadUsers(searchQuery);
        await loadOverview();
      } else {
        alert(data.error || 'Action failed');
      }
    } catch (e) {
      alert('Network error executing admin action');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFlag = async (key: string, currentEnabled: boolean) => {
    setFlagToggling(key);
    try {
      const res = await fetch('/api/admin/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, enabled: !currentEnabled })
      });
      const data = await res.json();
      if (data.success) {
        setFlags(prev => prev.map(f => f.key === key ? { ...f, enabled: !currentEnabled } : f));
      } else {
        alert(data.error || 'Failed to toggle flag');
      }
    } catch (e) {
      alert('Network error toggling feature flag');
    } finally {
      setFlagToggling(null);
    }
  };

  const handleUpdateBugStatus = async (bugId: string, status: string) => {
    try {
      const res = await fetch('/api/bugs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bugId, status })
      });
      const data = await res.json();
      if (data.success) {
        loadBugs();
        loadOverview();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 bg-background min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <Badge variant="default" className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-sm">
              Rolevia Core Admin
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1.5 text-[10px] font-bold text-success border-success/30 bg-success/10 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Live Telemetry Active
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mt-3 flex items-center gap-3 text-foreground">
            Platform Command Center
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Logged in as <strong className="text-foreground">{currentUser.email}</strong> ({currentUser.role === 'OWNER' ? '👑 Platform Owner' : '🛡️ Administrator'})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a href="/dashboard" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-input bg-background hover:bg-muted hover:text-foreground h-8 px-3 font-semibold text-xs transition-colors">
            Return to Workstation
          </a>
          <Button
            size="sm"
            onClick={() => {
              loadOverview();
              loadUsers(searchQuery);
              loadHealth();
              if (activeTab === 'activity') loadActivity();
              if (activeTab === 'flags') loadFlags();
              if (activeTab === 'audit') loadAuditLogs();
              if (activeTab === 'feedback') loadFeedback();
              if (activeTab === 'bugs') loadBugs();
            }}
            title="Refresh live metrics"
            className="h-8"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border pb-2">
        {[
          { id: 'overview', label: 'Overview & KPIs', icon: Activity },
          { id: 'users', label: 'User Directory', icon: Users },
          { id: 'activity', label: 'Live Activity Stream', icon: Radio, onClick: loadActivity },
          { id: 'flags', label: 'Feature Flags', icon: Sliders, onClick: loadFlags },
          { id: 'health', label: 'System Health', icon: Server, onClick: loadHealth },
          { id: 'audit', label: 'Audit Trail', icon: ShieldCheck, onClick: loadAuditLogs },
          { id: 'feedback', label: 'User Feedback', icon: MessageSquare, onClick: loadFeedback },
          { id: 'bugs', label: 'Bug Reports', icon: Bug, onClick: loadBugs },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.onClick) tab.onClick();
              }}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                isActive
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="rounded-xl border border-border shadow-sm">
              <CardContent className="p-5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Total User Accounts</p>
                <p className="text-3xl font-black text-foreground">{stats.totalUsers}</p>
                <p className="text-xs text-success font-medium mt-1">Real DB Accounts</p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-border shadow-sm">
              <CardContent className="p-5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Resume Scans Executed</p>
                <p className="text-3xl font-black text-foreground">{stats.totalScans}</p>
                <p className="text-xs text-primary font-medium mt-1">Native Intelligence Checks</p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-border shadow-sm">
              <CardContent className="p-5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Mock Interviews Run</p>
                <p className="text-3xl font-black text-foreground">{stats.totalInterviews}</p>
                <p className="text-xs text-amber-500 font-medium mt-1">Adaptive Turn Evaluations</p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-border shadow-sm">
              <CardContent className="p-5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Open Bug Reports</p>
                <p className="text-3xl font-black text-foreground">{stats.openBugsCount}</p>
                <p className={`text-xs font-medium mt-1 ${stats.openBugsCount > 0 ? 'text-destructive' : 'text-success'}`}>
                  {stats.openBugsCount > 0 ? 'Action Required' : 'All Issues Resolved'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Plan Distribution Breakdown */}
          <Card className="rounded-xl border border-border shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30 pb-4">
              <CardTitle className="text-sm font-semibold text-foreground uppercase tracking-wider">Active Entitlement & Plan Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-border bg-card">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Free Starter</p>
                  <p className="text-2xl font-black mt-1 text-foreground">{stats.planDistribution?.FREE || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">5 Free Credits Total</p>
                </div>

                <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Launch (₹59/mo)</p>
                  <p className="text-2xl font-black mt-1 text-blue-600">{stats.planDistribution?.LAUNCH || 0}</p>
                  <p className="text-xs text-blue-500/70 mt-1 font-medium">50 Monthly Credits</p>
                </div>

                <div className="p-4 rounded-xl border border-success/20 bg-success/5">
                  <p className="text-[10px] font-bold text-success uppercase tracking-wider">Career (₹99/mo)</p>
                  <p className="text-2xl font-black mt-1 text-success-foreground">{stats.planDistribution?.CAREER || 0}</p>
                  <p className="text-xs text-success/70 mt-1 font-medium">200 Monthly Credits</p>
                </div>

                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Pro / Owner (₹149/mo)</p>
                  <p className="text-2xl font-black mt-1 text-amber-600">{stats.planDistribution?.PRO || 0}</p>
                  <p className="text-xs text-amber-500/70 mt-1 font-medium">Unlimited VIP Access</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <Card className="rounded-xl border border-border shadow-sm">
          <CardHeader className="border-b border-border bg-muted/30 pb-4 flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle className="text-sm font-semibold text-foreground uppercase tracking-wider">User Directory & Entitlement Controls</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search user email or name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  loadUsers(e.target.value);
                }}
                className="pl-9 text-xs"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Plan / Source</th>
                    <th className="p-4">Activity</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => {
                    const isOwner = u.role === 'OWNER';
                    const isAdmin = u.role === 'ADMIN';
                    const isSuspended = u.isSuspended;

                    return (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-foreground">{u.name || 'Unnamed Candidate'}</div>
                          <div className="text-muted-foreground mt-0.5">{u.email}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant={isOwner ? 'default' : isAdmin ? 'secondary' : 'outline'} className="text-[9px] uppercase tracking-wider px-2 py-0">
                            {u.role}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-foreground">{u.subscription?.plan || 'FREE'}</div>
                          <div className="text-muted-foreground mt-0.5">{u.subscription?.source || 'USER_SIGNUP'}</div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {u._count.resumes} Resumes · {u._count.interviewSessions} Interviews
                        </td>
                        <td className="p-4">
                          <Badge variant={isSuspended ? 'destructive' : 'default'} className={`text-[9px] uppercase tracking-wider px-2 py-0 ${!isSuspended && 'bg-success/20 text-success hover:bg-success/30'}`}>
                            {isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                          </Badge>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="h-7 text-[10px] px-2.5 font-semibold bg-success hover:bg-success/90 text-primary-foreground"
                            disabled={actionLoading === u.id || u.subscription?.plan === 'PRO'}
                            onClick={() => handleUserAction(u.id, 'GRANT_PLAN', { plan: 'PRO' })}
                          >
                            Grant PRO
                          </Button>

                          {!isOwner && (
                            <Button
                              variant={isSuspended ? 'secondary' : 'destructive'}
                              size="sm"
                              className="h-7 text-[10px] px-2.5 font-semibold"
                              disabled={actionLoading === u.id}
                              onClick={() => handleUserAction(u.id, isSuspended ? 'RESTORE' : 'SUSPEND')}
                            >
                              {isSuspended ? 'Restore' : 'Suspend'}
                            </Button>
                          )}

                          {currentUser.role === 'OWNER' && !isOwner && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[10px] px-2.5 font-semibold"
                              disabled={actionLoading === u.id}
                              onClick={() => handleUserAction(u.id, 'CHANGE_ROLE', { role: isAdmin ? 'USER' : 'ADMIN' })}
                            >
                              {isAdmin ? 'Revoke Admin' : 'Make Admin'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: LIVE ACTIVITY STREAM */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-xl border border-border shadow-sm p-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Platform Credits Burned</p>
              <p className="text-3xl font-black text-foreground mt-1">{totalCreditsConsumed}</p>
              <p className="text-xs text-muted-foreground mt-1">Across all usage ledger records</p>
            </Card>
            <Card className="rounded-xl border border-border shadow-sm p-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Recent Activity Window</p>
              <p className="text-3xl font-black text-foreground mt-1">{activities.length}</p>
              <p className="text-xs text-primary mt-1">Real-time candidate operations</p>
            </Card>
            <Card className="rounded-xl border border-border shadow-sm p-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Auditing State</p>
              <p className="text-3xl font-black text-success mt-1">Active</p>
              <p className="text-xs text-muted-foreground mt-1">Continuous usage ledger writes</p>
            </Card>
          </div>

          <Card className="rounded-xl border border-border shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30 pb-4">
              <CardTitle className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Live Usage Ledger Stream
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">User</th>
                      <th className="p-4">Feature</th>
                      <th className="p-4">Credits</th>
                      <th className="p-4">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activities.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No recent usage ledger activities recorded.
                        </td>
                      </tr>
                    ) : (
                      activities.map((act) => (
                        <tr key={act.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-4 text-muted-foreground font-mono text-[11px] whitespace-nowrap">
                            {new Date(act.timestamp).toLocaleTimeString()} · {new Date(act.timestamp).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-foreground">{act.user?.name || act.user?.email || 'Guest / System'}</div>
                            <div className="text-muted-foreground text-[11px]">{act.user?.email}</div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="font-mono text-[10px] font-bold uppercase tracking-wider">
                              {act.feature}
                            </Badge>
                          </td>
                          <td className="p-4 font-semibold text-foreground">
                            {act.creditsConsumed} credit{act.creditsConsumed > 1 ? 's' : ''}
                          </td>
                          <td className="p-4">
                            <Badge className={`text-[9px] uppercase font-bold px-2 py-0 ${
                              act.result === 'SUCCESS' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                            }`}>
                              {act.result || 'SUCCESS'}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: FEATURE FLAGS SWITCHBOARD */}
      {activeTab === 'flags' && (
        <Card className="rounded-xl border border-border shadow-sm">
          <CardHeader className="border-b border-border bg-muted/30 pb-4">
            <CardTitle className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" /> Live Feature Flags & Emergency Controls
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Dynamically toggle platform subsystems on or off in production without redeploying code.
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {flags.map((flag) => {
                const isMaintenance = flag.key === 'MAINTENANCE_MODE';
                const isToggling = flagToggling === flag.key;

                return (
                  <div
                    key={flag.key}
                    className={`p-5 rounded-xl border transition-all ${
                      flag.enabled
                        ? isMaintenance
                          ? 'border-destructive/40 bg-destructive/5'
                          : 'border-success/30 bg-success/5'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground font-mono">{flag.key}</span>
                          <Badge
                            className={`text-[9px] uppercase font-bold px-2 py-0 ${
                              flag.enabled
                                ? isMaintenance
                                  ? 'bg-destructive text-white'
                                  : 'bg-success/20 text-success'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {flag.enabled ? 'ACTIVE' : 'DISABLED'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          {flag.description || 'Dynamic feature flag controller'}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant={flag.enabled ? (isMaintenance ? 'destructive' : 'default') : 'outline'}
                        className="h-8 text-xs font-semibold shrink-0"
                        disabled={isToggling}
                        onClick={() => handleToggleFlag(flag.key, flag.enabled)}
                      >
                        {isToggling ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : flag.enabled ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1" /> Enabled
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5 mr-1" /> Disabled
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: SYSTEM HEALTH */}
      {activeTab === 'health' && health && (
        <div className="space-y-6">
          <Card className="rounded-xl border border-border shadow-sm">
            <CardHeader className="border-b border-border bg-muted/30 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground uppercase tracking-wider">
                <Server className="w-4 h-4 text-primary" /> Live Infrastructure & Service Diagnostics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-500" /> PostgreSQL (Neon DB)
                    </span>
                    <Badge className="bg-success/20 text-success font-bold text-[10px] uppercase">
                      {health.services.database.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Connection Latency: <strong className="text-foreground">{health.services.database.latencyMs}ms</strong>
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Connection pooling active with SSL encryption.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-500" /> Node.js Server Process
                    </span>
                    <Badge className="bg-primary/20 text-primary font-bold text-[10px] uppercase">
                      {health.runtime?.nodeVersion || 'v20'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Heap Memory: <strong className="text-foreground">{health.runtime?.memory?.heapUsedMb || 0} MB</strong> / {health.runtime?.memory?.heapTotalMb || 0} MB (RSS: {health.runtime?.memory?.rssMb || 0} MB)
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Platform: {health.runtime?.platform} · Uptime: {Math.floor((health.uptimeSeconds || 0) / 60)} minutes
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-500" /> Authentication Services
                    </span>
                    <Badge className="bg-success/20 text-success font-bold text-[10px] uppercase">
                      {health.services.authentication.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Google OAuth: <strong className="text-foreground">{health.services.authentication.googleOauth}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    NextAuth v5 JWT session encryption with CSRF protection.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <Zap className="w-4 h-4 text-violet-500" /> AI Providers & Native Fallback
                    </span>
                    <Badge className="bg-success/20 text-success font-bold text-[10px] uppercase">
                      {health.services.nativeIntelligence.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Gemini: <strong className="text-foreground">{health.services.aiProviders?.gemini || 'N/A'}</strong> · OpenAI: <strong className="text-foreground">{health.services.aiProviders?.openAI || 'N/A'}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Embedded deterministic engine provides 100% offline-ready fallback.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Table Record Counts */}
          {health.tableCounts && (
            <Card className="rounded-xl border border-border shadow-sm">
              <CardHeader className="border-b border-border bg-muted/30 pb-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground uppercase tracking-wider">
                  <HardDrive className="w-4 h-4 text-primary" /> Live Database Table Volume
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="p-3 rounded-lg border border-border bg-card text-center">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Users</p>
                    <p className="text-xl font-black text-foreground mt-1">{health.tableCounts.users}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-card text-center">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Resumes</p>
                    <p className="text-xl font-black text-foreground mt-1">{health.tableCounts.resumes}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-card text-center">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Job Targets</p>
                    <p className="text-xl font-black text-foreground mt-1">{health.tableCounts.jobTargets}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-card text-center">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Interviews</p>
                    <p className="text-xl font-black text-foreground mt-1">{health.tableCounts.interviewSessions}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-card text-center">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Usage Logs</p>
                    <p className="text-xl font-black text-foreground mt-1">{health.tableCounts.usageLedgerRecords}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-card text-center">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Audit Logs</p>
                    <p className="text-xl font-black text-foreground mt-1">{health.tableCounts.auditLogs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* TAB 6: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <Card className="rounded-xl border border-border shadow-sm">
          <CardHeader className="border-b border-border bg-muted/30 pb-4">
            <CardTitle className="text-sm font-semibold text-foreground uppercase tracking-wider">Administrative Audit Trail</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Immutable persistent record of all administrative permissions, role updates, and user status modifications.</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Operator</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Target</th>
                    <th className="p-4">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-muted-foreground font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4 font-semibold text-foreground">
                        {log.adminUser?.email || 'System Root'}
                      </td>
                      <td className="p-4 font-mono font-semibold text-primary">
                        {log.action}
                      </td>
                      <td className="p-4 font-medium text-foreground">
                        {log.target}
                      </td>
                      <td className="p-4">
                        <Badge className="bg-success/20 text-success font-bold text-[9px] uppercase px-2 py-0">
                          {log.result}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 7: FEEDBACK */}
      {activeTab === 'feedback' && (
        <Card className="rounded-xl border border-border shadow-sm">
          <CardHeader className="border-b border-border bg-muted/30 pb-4">
            <CardTitle className="text-sm font-semibold text-foreground uppercase tracking-wider">User Feedback Stream</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbacks.map((f) => (
                <div key={f.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-wider">{f.feature}</Badge>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${f.rating === 'THUMBS_UP' ? 'text-success' : 'text-destructive'}`}>
                      {f.rating === 'THUMBS_UP' ? '👍 Helpful' : '👎 Needs Improvement'}
                    </span>
                  </div>
                  <p className="text-xs text-foreground font-medium leading-relaxed">
                    {f.comment || 'No specific comment provided.'}
                  </p>
                  <div className="text-[10px] text-muted-foreground flex items-center justify-between">
                    <span>{f.user?.email || 'Anonymous Guest'}</span>
                    <span>{new Date(f.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 8: BUG REPORTS */}
      {activeTab === 'bugs' && (
        <Card className="rounded-xl border border-border shadow-sm">
          <CardHeader className="border-b border-border bg-muted/30 pb-4">
            <CardTitle className="text-sm font-semibold text-foreground uppercase tracking-wider">Bug Reports & Issue Tracker</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {bugs.map((b) => (
                <div key={b.id} className="p-4 rounded-xl border border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-[9px] uppercase font-bold tracking-wider px-2 py-0">{b.feature}</Badge>
                      <Badge variant={b.severity === 'CRITICAL' ? 'destructive' : b.severity === 'HIGH' ? 'default' : 'secondary'} className="text-[9px] uppercase font-bold tracking-wider px-2 py-0">
                        {b.severity}
                      </Badge>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${b.status === 'RESOLVED' ? 'text-success' : 'text-amber-500'}`}>
                        ● {b.status}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-foreground">{b.description}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Reported by {b.user?.email || 'Guest'} on {new Date(b.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {b.status !== 'RESOLVED' ? (
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8 text-xs font-semibold bg-success hover:bg-success/90"
                        onClick={() => handleUpdateBugStatus(b.id, 'RESOLVED')}
                      >
                        Mark Resolved
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs font-semibold"
                        onClick={() => handleUpdateBugStatus(b.id, 'OPEN')}
                      >
                        Reopen
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
