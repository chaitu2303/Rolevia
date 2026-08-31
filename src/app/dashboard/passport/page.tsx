import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { 
  Compass, Briefcase, GraduationCap, Code, Trophy, 
  Share2, Award, FolderGit2, Star 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function CareerPassportPage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      careerProfile: {
        include: {
          skills: { where: { status: { in: ['USER_CONFIRMED', 'USER_CREATED'] } } },
          experiences: { where: { status: { in: ['USER_CONFIRMED', 'USER_CREATED'] } } },
          educations: { where: { status: { in: ['USER_CONFIRMED', 'USER_CREATED'] } } },
          projects: { where: { status: { in: ['USER_CONFIRMED', 'USER_CREATED'] } } },
          certifications: { where: { status: { in: ['USER_CONFIRMED', 'USER_CREATED'] } } }
        }
      },
      xpRecord: true,
      streakRecord: true,
      userBadges: { include: { badge: true } },
      assessmentAttempts: {
        where: { status: 'COMPLETED' },
        include: { assessment: true },
        orderBy: { completedAt: 'desc' },
        take: 5
      },
      codingSubmissions: {
        where: { status: 'ACCEPTED' },
        include: { problem: true },
        orderBy: { submittedAt: 'desc' },
        take: 5
      }
    }
  });

  if (!user) redirect('/');

  const profile = user.careerProfile;
  const xp = user.xpRecord?.totalXp || 0;
  const level = user.xpRecord?.currentLevel || 1;
  const streak = user.streakRecord?.currentStreak || 0;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 bg-[#FAF8F5] text-slate-900 min-h-screen">
      
      {/* Header Profile Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
            <Compass className="w-9 h-9 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-black text-slate-900 tracking-tight">{user.name}</h1>
            <p className="text-slate-550 mt-1 font-medium text-base">{profile?.targetRole || 'Exploring Career Opportunities'}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3.5">
              <Badge variant="secondary" className="px-3 py-1 font-bold rounded-full bg-slate-100 text-slate-800 border">
                Level {level}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {streak} Day Streak
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-250">
                {xp} XP Earned
              </Badge>
            </div>
          </div>
        </div>

        <Button className="relative z-10 rounded-xl gap-1.5 shadow-sm bg-slate-900 hover:bg-slate-800 text-white" size="sm">
          <Share2 className="w-4 h-4" /> Share Passport
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Column: Experience, Projects, Education, Certifications */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Experience Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600" /> Professional Experience
            </h2>
            {profile?.experiences && profile.experiences.length > 0 ? (
              <div className="space-y-4">
                {profile.experiences.map((exp: any) => (
                  <div key={exp.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{exp.role}</h3>
                        <p className="text-emerald-700 font-semibold text-sm">{exp.company}</p>
                      </div>
                      <span className="text-xs text-slate-400 font-mono font-medium">{exp.startDate} - {exp.endDate || 'Present'}</span>
                    </div>
                    {exp.description && (
                      <p className="text-xs text-slate-655 leading-relaxed pt-1.5 whitespace-pre-wrap border-t border-slate-50">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-white rounded-2xl border border-dashed text-center text-xs text-slate-400">
                No verified experiences listed.
              </div>
            )}
          </div>

          {/* Projects Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-emerald-600" /> Featured Projects
            </h2>
            {profile?.projects && profile.projects.length > 0 ? (
              <div className="space-y-4">
                {profile.projects.map((proj: any) => (
                  <div key={proj.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-900 text-base">{proj.name}</h3>
                      {proj.techStack && (
                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded border text-slate-600">
                          {proj.techStack}
                        </span>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-xs text-slate-655 leading-relaxed pt-1.5 border-t border-slate-50">
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-white rounded-2xl border border-dashed text-center text-xs text-slate-400">
                No featured projects listed.
              </div>
            )}
          </div>

          {/* Education & Certifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Education */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" /> Education
              </h2>
              {profile?.educations && profile.educations.length > 0 ? (
                <div className="space-y-3">
                  {profile.educations.map((edu: any) => (
                    <div key={edu.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
                      <h3 className="font-bold text-slate-900 text-sm">{edu.degree}</h3>
                      <p className="text-emerald-700 font-semibold text-xs">{edu.institution}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{edu.startDate} - {edu.endDate || 'Present'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-white rounded-2xl border border-dashed text-center text-xs text-slate-400">
                  No education details verified.
                </div>
              )}
            </div>

            {/* Certifications */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" /> Certifications
              </h2>
              {profile?.certifications && profile.certifications.length > 0 ? (
                <div className="space-y-3">
                  {profile.certifications.map((cert: any) => (
                    <div key={cert.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                      <h3 className="font-bold text-slate-900 text-sm">{cert.name}</h3>
                      <p className="text-slate-500 text-xs">Issued by {cert.issuer || 'Verifiable Entity'}</p>
                      {cert.year && <p className="text-[10px] text-slate-400 font-mono">Issued: {cert.year}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-white rounded-2xl border border-dashed text-center text-xs text-slate-400">
                  No certifications listed.
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Sidebar Column: Verified Skills, Badges, Assessments */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Verified Skills */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2 mb-4">
              <Code className="w-5 h-5 text-emerald-600" /> Verified Skills
            </h2>
            {profile?.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill: any) => (
                  <Badge key={skill.id} variant="secondary" className="px-2.5 py-1 text-xs font-bold bg-slate-50 text-slate-800 border rounded-full">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No skills verified yet.</p>
            )}
          </div>

          {/* Badges */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" /> Verified Badges
            </h2>
            {user.userBadges && user.userBadges.length > 0 ? (
              <div className="space-y-3">
                {user.userBadges.map((ub: any) => (
                  <div key={ub.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                      <Trophy className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{ub.badge.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{ub.badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">Complete assessments and coding challenges to earn badges.</p>
            )}
          </div>

          {/* Assessments Taken */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" /> Assessments Proof
            </h2>
            
            {user.assessmentAttempts.length > 0 ? (
              <div className="space-y-3">
                {user.assessmentAttempts.map((attempt: any) => (
                  <div key={attempt.id} className="p-3 bg-slate-50 rounded-xl border flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{attempt.assessment.title}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">{new Date(attempt.completedAt || attempt.startedAt).toLocaleDateString()}</p>
                    </div>
                    <span className="font-black text-emerald-700">{attempt.score}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No completed assessments recorded.</p>
            )}
          </div>

          {/* Coding Solutions Accepted */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <Star className="w-5 h-5 text-indigo-500" /> Verified Code Arena
            </h2>
            
            {user.codingSubmissions.length > 0 ? (
              <div className="space-y-3">
                {user.codingSubmissions.map((sub: any) => (
                  <div key={sub.id} className="p-3 bg-slate-50 rounded-xl border flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{sub.problem.title}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">{sub.language} · {new Date(sub.submittedAt).toLocaleDateString()}</p>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/50 px-2 py-0.5 rounded-full">ACCEPTED</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No accepted coding solutions recorded.</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
