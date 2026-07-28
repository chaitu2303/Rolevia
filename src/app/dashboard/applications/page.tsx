'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Kanban, List, Clock, Filter, Plus, Loader2, Link2, ArrowRight, Zap } from 'lucide-react';
import { AutoFillHelper } from './auto-fill-helper';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ApplicationTrackerHub() {
  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE' | 'TIMELINE'>('KANBAN');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedApp, setDraggedApp] = useState<string | null>(null);

  // Create App state
  const [createOpen, setCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newApp, setNewApp] = useState({ company: '', roleTitle: '' });

  const [syncOpen, setSyncOpen] = useState(false);
  const [jobUrl, setJobUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const statuses = ['SAVED', 'PREPARING', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'];

  useEffect(() => {
    fetch('/api/applications')
      .then(res => res.json())
      .then(data => {
        setApplications(data.applications || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
    try {
      await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const handleDragStart = (id: string) => {
    setDraggedApp(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: string) => {
    if (draggedApp) {
      updateStatus(draggedApp, status);
      setDraggedApp(null);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp)
      });
      const data = await res.json();
      if (data.application) {
        setApplications(prev => [data.application, ...prev]);
        setCreateOpen(false);
        setNewApp({ company: '', roleTitle: '' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSyncJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobUrl) return;
    
    setIsSyncing(true);
    // Simulate scraping a job from a URL (e.g. LinkedIn, Indeed)
    setTimeout(async () => {
      try {
        const hostname = new URL(jobUrl).hostname;
        const platform = hostname.includes('linkedin') ? 'LinkedIn' : hostname.includes('indeed') ? 'Indeed' : 'Job Board';
        
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company: platform, roleTitle: 'Imported Role' })
        });
        const data = await res.json();
        if (data.application) {
          setApplications(prev => [data.application, ...prev]);
          setSyncOpen(false);
          setJobUrl('');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSyncing(false);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const [showAutoFill, setShowAutoFill] = useState(false);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 h-full flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b-8 border-black pb-8 shrink-0">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Application Tracker</h1>
          <p className="font-bold text-lg mt-1 bg-[#ff90e8] text-black inline-block px-2 border-2 border-black rotate-1">Manage your complete job search pipeline.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => setShowAutoFill(!showAutoFill)}
            className="h-12 px-6 rounded-none border-4 border-black bg-[#abf5d1] hover:bg-[#86e8b8] text-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <Zap className="w-5 h-5 mr-2" /> {showAutoFill ? 'Close Auto-Fill' : 'Auto-Fill Assistant'}
          </Button>

          <Dialog open={syncOpen} onOpenChange={setSyncOpen}>
            <DialogTrigger render={<Button className="h-12 px-6 rounded-none border-4 border-black bg-[#ffe500] hover:bg-[#ffea33] text-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all">
              <Link2 className="w-5 h-5 mr-2" /> Sync Job URL
            </Button>}>
              Sync Job URL
            </DialogTrigger>
            <DialogContent className="border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#faf8f5]">
              <form onSubmit={handleSyncJob}>
                <DialogHeader>
                  <DialogTitle className="font-black uppercase text-xl border-b-4 border-black pb-2 mb-4">Sync Job from URL</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2 text-black font-bold">
                    <Label htmlFor="url" className="uppercase font-black tracking-widest">LinkedIn / Indeed URL</Label>
                    <Input id="url" value={jobUrl} onChange={e => setJobUrl(e.target.value)} required placeholder="https://linkedin.com/jobs/view/..." className="border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:translate-x-1 focus-visible:translate-y-1 transition-all font-bold" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSyncing} className="h-12 px-6 rounded-none border-4 border-black bg-[#90c0ff] hover:bg-[#70aaff] text-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all w-full">
                    {isSyncing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ArrowRight className="w-5 h-5 mr-2" />}
                    Extract & Add to Tracker
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger render={<Button className="h-12 px-6 rounded-none border-4 border-black bg-white hover:bg-slate-100 text-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all">
              <Plus className="w-5 h-5 mr-2" /> New Application
            </Button>}>
              New Application
            </DialogTrigger>
            <DialogContent className="border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#faf8f5]">
              <form onSubmit={handleCreateApplication}>
                <DialogHeader>
                  <DialogTitle className="font-black uppercase text-xl border-b-4 border-black pb-2 mb-4">Add New Application</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 text-black font-bold">
                  <div className="space-y-2">
                    <Label htmlFor="company" className="uppercase font-black tracking-widest">Company</Label>
                    <Input id="company" value={newApp.company} onChange={e => setNewApp(p => ({ ...p, company: e.target.value }))} required className="border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:translate-x-1 focus-visible:translate-y-1 transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roleTitle" className="uppercase font-black tracking-widest">Role Title</Label>
                    <Input id="roleTitle" value={newApp.roleTitle} onChange={e => setNewApp(p => ({ ...p, roleTitle: e.target.value }))} required className="border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:translate-x-1 focus-visible:translate-y-1 transition-all font-bold" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isCreating} className="h-12 px-6 rounded-none border-4 border-black bg-[#abf5d1] hover:bg-[#8ee5c0] text-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all w-full">
                    {isCreating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                    Save Application
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {showAutoFill && (
        <div className="mb-8">
          <AutoFillHelper onApplicationCreated={(app) => setApplications(prev => [app, ...prev])} />
        </div>
      )}

      {viewMode === 'KANBAN' && (
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
          {statuses.map(status => {
            const columnApps = applications.filter(app => app.status === status);
            return (
              <div 
                key={status} 
                className="bg-slate-50 border rounded-lg min-w-[320px] p-4 flex flex-col"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(status)}
              >
                <h3 className="font-semibold text-slate-700 mb-4 flex justify-between items-center">
                  {status}
                  <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                    {columnApps.length}
                  </span>
                </h3>
                
                <div className="flex-1 space-y-3 min-h-[100px]">
                  {columnApps.map(app => (
                    <Card 
                      key={app.id} 
                      className={`shadow-sm border-l-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
                        status === 'APPLIED' ? 'border-l-blue-500' : 
                        status === 'PREPARING' ? 'border-l-yellow-500' : 
                        status === 'OFFER' ? 'border-l-green-500' : 
                        status === 'REJECTED' ? 'border-l-red-500' : 'border-l-slate-400'
                      }`}
                      draggable
                      onDragStart={() => handleDragStart(app.id)}
                    >
                      <Link href={`/dashboard/applications/${app.id}`} className="block focus:outline-none">
                        <CardContent className="p-4 hover:bg-slate-50/50 transition-colors">
                          <h4 className="font-semibold">{app.roleTitle}</h4>
                          <p className="text-sm text-slate-500">{app.company}</p>
                          <div className="mt-4 flex gap-2">
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                              Updated {new Date(app.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                  {columnApps.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground mt-8 opacity-50">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {viewMode !== 'KANBAN' && (
        <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg border border-dashed">
          <p className="text-slate-500">View mode {viewMode} is structurally supported via unified DB queries.</p>
        </div>
      )}
    </div>
  );
}

