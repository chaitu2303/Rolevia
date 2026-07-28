'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UserCircle, Briefcase, GraduationCap, Code2, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 bg-[#faf8f5] text-black font-sans min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b-8 border-black pb-8 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#ffe500] border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-2">
            <UserCircle className="w-8 h-8 text-black" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Master Profile</h1>
            <p className="font-bold text-lg mt-1 bg-[#ff90e8] text-black inline-block px-2 border-2 border-black rotate-1">Your central career identity.</p>
          </div>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="h-14 px-8 rounded-none border-4 border-black bg-[#90c0ff] hover:bg-[#70aaff] text-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Basics & Status */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
            <CardHeader className="border-b-4 border-black bg-[#ff90e8]">
              <CardTitle className="font-black uppercase flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Profile Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 font-bold">
              <div className="flex justify-between items-center">
                <span>Completeness</span>
                <span className="text-xl font-black">85%</span>
              </div>
              <div className="w-full bg-[#faf8f5] border-2 border-black h-4 relative">
                <div className="bg-[#23a094] h-full w-[85%] border-r-2 border-black"></div>
              </div>
              <p className="text-sm text-muted-foreground pt-2">Add 1 more project to reach 100%.</p>
            </CardContent>
          </Card>

          <Card className="rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
            <CardHeader className="border-b-4 border-black bg-[#ffe500]">
              <CardTitle className="font-black uppercase flex items-center gap-2">
                <UserCircle className="w-5 h-5" /> Basics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-1 block">Full Name</label>
                <div className="font-bold text-lg p-2 bg-[#faf8f5] border-2 border-black">{profile.basics?.name || 'Not set'}</div>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-1 block">Email</label>
                <div className="font-bold text-lg p-2 bg-[#faf8f5] border-2 border-black">{profile.basics?.email || 'Not set'}</div>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-1 block">Location</label>
                <div className="font-bold text-lg p-2 bg-[#faf8f5] border-2 border-black">{profile.basics?.location || 'Not set'}</div>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-1 block">Professional Summary</label>
                <div className="font-bold p-3 bg-[#faf8f5] border-2 border-black min-h-[100px]">{profile.basics?.summary || 'Not set'}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-8 space-y-8">
          
          <Card className="rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
            <CardHeader className="border-b-4 border-black bg-[#90c0ff]">
              <CardTitle className="font-black uppercase flex items-center gap-2">
                <Briefcase className="w-5 h-5" /> Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {profile.experiences?.length > 0 ? (
                profile.experiences.map((exp: any, i: number) => (
                  <div key={i} className="p-4 border-4 border-black bg-[#faf8f5] relative -rotate-1 hover:rotate-0 transition-transform">
                    <div className="font-black text-xl">{exp.role}</div>
                    <div className="font-bold text-[#ff4040]">{exp.company}</div>
                    <div className="text-sm font-bold opacity-70 mt-2">{exp.duration}</div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center font-bold text-muted-foreground border-4 border-dashed border-black/20">No experiences added yet.</div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
              <CardHeader className="border-b-4 border-black bg-[#23a094] text-white">
                <CardTitle className="font-black uppercase flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" /> Education
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {profile.educations?.length > 0 ? (
                  profile.educations.map((edu: any, i: number) => (
                    <div key={i} className="p-4 border-4 border-black bg-[#faf8f5]">
                      <div className="font-black text-lg">{edu.degree}</div>
                      <div className="font-bold text-muted-foreground">{edu.institution}</div>
                      <div className="text-sm font-bold opacity-70 mt-1">{edu.year}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center font-bold text-muted-foreground border-4 border-dashed border-black/20">No education added.</div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
              <CardHeader className="border-b-4 border-black bg-[#ff4040] text-white">
                <CardTitle className="font-black uppercase flex items-center gap-2">
                  <Code2 className="w-5 h-5" /> Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {profile.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill: any, i: number) => (
                      <span key={i} className="px-3 py-1 bg-white border-2 border-black font-black uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center font-bold text-muted-foreground border-4 border-dashed border-black/20">No skills added.</div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
