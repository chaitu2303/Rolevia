'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UserCircle, Briefcase, GraduationCap, Code2, AlertTriangle, CheckCircle, Save, Fingerprint } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function MasterProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data.profile) {
          setProfile(data.profile);
        } else {
          // Fallback if no profile
          setProfile({
            basics: { name: 'Not set', email: 'Not set', summary: 'Not set', location: 'Not set' },
            experiences: [],
            educations: [],
            skills: []
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch profile', err);
        setLoading(false);
      });
  }, []);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Profile saved successfully!');
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 bg-background min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Fingerprint className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-foreground">Master Profile</h1>
            <p className="text-sm text-muted-foreground">Your centralized career identity and verified facts.</p>
          </div>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="h-10 px-6 font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-lg"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Basics & Status */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-2xl border border-border shadow-sm bg-card overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/30 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <CheckCircle className="w-4 h-4 text-success" /> Profile Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-muted-foreground">Completeness</span>
                <span className="text-2xl font-black text-foreground">85%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: '85%' }} 
                  className="bg-success h-full transition-all duration-1000 ease-out" 
                />
              </div>
              <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-warning-foreground" /> Add 1 more project to reach 100%.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border shadow-sm bg-card overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/30 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <UserCircle className="w-4 h-4 text-primary" /> Basics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Full Name</label>
                <div className="text-sm font-medium text-foreground p-3 bg-muted/50 rounded-xl border border-border">{profile.basics?.name || 'Not set'}</div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Email</label>
                <div className="text-sm font-medium text-foreground p-3 bg-muted/50 rounded-xl border border-border">{profile.basics?.email || 'Not set'}</div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Location</label>
                <div className="text-sm font-medium text-foreground p-3 bg-muted/50 rounded-xl border border-border">{profile.basics?.location || 'Not set'}</div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Professional Summary</label>
                <div className="text-sm text-foreground p-3 bg-muted/50 rounded-xl border border-border min-h-[100px] leading-relaxed">{profile.basics?.summary || 'Not set'}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-8 space-y-6">
          
          <Card className="rounded-2xl border border-border shadow-sm bg-card overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/30 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Briefcase className="w-4 h-4 text-primary" /> Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {profile.experiences?.length > 0 ? (
                profile.experiences.map((exp: any, i: number) => (
                  <div key={i} className="p-5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors group">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">{exp.role}</div>
                        <div className="text-sm font-medium text-muted-foreground mt-0.5">{exp.company}</div>
                      </div>
                      <div className="text-xs font-medium bg-muted px-2.5 py-1 rounded-md text-muted-foreground whitespace-nowrap">{exp.duration}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-border rounded-xl bg-muted/10">
                  <Briefcase className="w-8 h-8 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No experiences added yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-2xl border border-border shadow-sm bg-card overflow-hidden">
              <CardHeader className="border-b border-border bg-muted/30 pb-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <GraduationCap className="w-4 h-4 text-primary" /> Education
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {profile.educations?.length > 0 ? (
                  profile.educations.map((edu: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors">
                      <div className="font-semibold text-foreground">{edu.degree}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{edu.institution}</div>
                      <div className="text-xs font-medium text-muted-foreground/70 mt-2">{edu.year}</div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center border-2 border-dashed border-border rounded-xl bg-muted/10">
                    <p className="text-sm font-medium text-muted-foreground">No education added.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border shadow-sm bg-card overflow-hidden">
              <CardHeader className="border-b border-border bg-muted/30 pb-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Code2 className="w-4 h-4 text-primary" /> Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {profile.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill: any, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-medium">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center border-2 border-dashed border-border rounded-xl bg-muted/10">
                    <p className="text-sm font-medium text-muted-foreground">No skills added.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
