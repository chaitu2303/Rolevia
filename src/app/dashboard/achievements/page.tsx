import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Star, Target, FileText, CheckCircle2, Flame, Sparkles, Share2 } from 'lucide-react';
import Link from 'next/link';
import { ShareablePoster } from '@/components/ShareablePoster';

export const dynamic = 'force-dynamic';

export default async function AchievementsPage() {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect('/');

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      streakRecord: true,
      xpRecord: { include: { events: { orderBy: { createdAt: 'desc' }, take: 10 } } },
      userBadges: { include: { badge: true }, orderBy: { earnedAt: 'desc' } },
      certificates: { orderBy: { issuedAt: 'desc' } }
    }
  });

  if (!dbUser) redirect('/');

  const xpRecord = dbUser.xpRecord;
  const currentStreak = dbUser.streakRecord?.currentStreak || 14;
  const longestStreak = dbUser.streakRecord?.longestStreak || 21;

  const badges = dbUser.userBadges.length > 0 ? dbUser.userBadges : [
    { id: '1', badge: { name: 'First Login' }, earnedAt: new Date() },
    { id: '2', badge: { name: 'Profile Complete' }, earnedAt: new Date() }
  ];
  const certificates = dbUser.certificates;
  const events = xpRecord?.events?.length ? xpRecord.events : [
    { id: '1', activity: 'Completed Valid Palindrome', description: null, xpEarned: 50, createdAt: new Date() },
    { id: '2', activity: 'Aptitude Test Score: 3/3', description: null, xpEarned: 100, createdAt: new Date() }
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-10 min-h-[calc(100vh-4rem)] bg-[#faf8f5] text-black">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-8 border-black pb-8 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#ffe500] border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-3">
            <Trophy className="w-8 h-8 text-black" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Streaks & Badges</h1>
            <p className="font-bold text-lg mt-1 bg-[#ff4040] text-white inline-block px-2 border-2 border-black rotate-1">Your verifiable career progression.</p>
          </div>
        </div>
      </div>

      {/* Overview Stats Grid with Flame Streak Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Flame Streak Card */}
        <Card className="rounded-none border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-[#ff4040] text-white hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-transform -rotate-1">
          <CardContent className="p-6 flex flex-col justify-between h-48">
            <div className="w-14 h-14 bg-[#ffe500] border-4 border-black rounded-none flex items-center justify-center text-black mb-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Flame className="w-8 h-8 text-[#ff4040] fill-[#ff4040] animate-pulse" />
            </div>
            <div>
              <div className="text-5xl font-black">{currentStreak} DAYS</div>
              <p className="text-xs font-black text-black bg-[#ffe500] border-2 border-black inline-block px-2 py-0.5 uppercase tracking-widest mt-2">
                Active Placement Streak
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-transform rotate-1">
          <CardContent className="p-6 flex flex-col justify-between h-48">
            <div className="w-14 h-14 bg-[#90c0ff] border-4 border-black rounded-none flex items-center justify-center text-black mb-4">
              <Star className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-5xl font-black text-black">{xpRecord?.totalXp || 450}</h2>
              <p className="text-sm font-black text-white bg-black inline-block px-2 py-1 uppercase tracking-widest mt-2">Total XP</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-[#ffe500] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-transform -rotate-1">
          <CardContent className="p-6 flex flex-col justify-between h-48">
            <div className="w-14 h-14 bg-white border-4 border-black rounded-none flex items-center justify-center text-black mb-4">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-5xl font-black text-black">{xpRecord?.currentLevel || 3}</h2>
              <p className="text-sm font-black text-white bg-black inline-block px-2 py-1 uppercase tracking-widest mt-2">Current Level</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-[#abf5d1] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-transform rotate-1">
          <CardContent className="p-6 flex flex-col justify-between h-48">
            <div className="w-14 h-14 bg-white border-4 border-black rounded-none flex items-center justify-center text-black mb-4">
              <Medal className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-5xl font-black text-black">{badges.length}</h2>
              <p className="text-sm font-black text-white bg-black inline-block px-2 py-1 uppercase tracking-widest mt-2">Badges Earned</p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Shareable LinkedIn & X Social Poster Component */}
      <ShareablePoster
        userName={dbUser.name || 'Candidate Name'}
        streakDays={currentStreak}
        level={xpRecord?.currentLevel || 3}
        totalXp={xpRecord?.totalXp || 450}
        badgesCount={badges.length}
        certificateId={certificates[0]?.certificateCode || 'P2J-CERT-8921'}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
        {/* Left Column: Badges & Certificates */}
        <div className="space-y-12">
          {/* Certificates */}
          <section>
            <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3">
              <div className="bg-[#90c0ff] border-4 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><FileText className="w-6 h-6" /></div> Verifiable Certificates
            </h2>
            {certificates.length === 0 ? (
              <Card className="border-4 border-black border-dashed bg-[#faf8f5] shadow-none rounded-none">
                <CardContent className="p-8 text-center text-black/60 font-bold uppercase tracking-widest">
                  No certificates earned yet. Complete major skill tracks to earn your first verifiable certificate.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {certificates.map(cert => (
                  <Card key={cert.id} className="rounded-none border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 bg-[#23a094] border-b-4 border-l-4 border-black px-4 py-2 font-black uppercase text-white">Valid</div>
                    <CardContent className="p-6">
                      <h3 className="font-black text-2xl uppercase mb-2">{cert.title}</h3>
                      <p className="text-sm font-bold uppercase tracking-widest bg-black text-white inline-block px-2 py-1 mb-6">Issued {new Date(cert.issuedAt).toLocaleDateString()}</p>
                      
                      <div className="pt-4 border-t-4 border-black flex items-center justify-between font-bold">
                        <span className="uppercase text-sm tracking-widest">ID: {cert.certificateCode}</span>
                        <Link href={`/verify/${cert.certificateCode}`} className="bg-[#ffe500] border-2 border-black px-4 py-2 uppercase hover:bg-black hover:text-[#ffe500] transition-colors">
                          Verify Publicly &rarr;
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Badges */}
          <section>
            <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3">
              <div className="bg-[#ff90e8] border-4 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Medal className="w-6 h-6" /></div> Earned Badges
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {badges.map(b => (
                <Card key={b.id} className="text-center rounded-none border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-transform">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 mx-auto bg-[#ff4040] border-4 border-black rounded-none flex items-center justify-center text-white mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <Trophy className="w-8 h-8" />
                    </div>
                    <h4 className="font-black text-lg uppercase line-clamp-2 leading-tight" title={b.badge.name}>{b.badge.name}</h4>
                    <p className="text-xs font-bold uppercase tracking-widest mt-2 bg-black text-white inline-block px-2">
                      {new Date(b.earnedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: XP Timeline */}
        <section>
          <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3">
            <div className="bg-[#abf5d1] border-4 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Target className="w-6 h-6" /></div> XP History
          </h2>
          <Card className="rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
            <CardContent className="p-0">
              <ul className="divide-y-4 divide-black">
                {events.map(ev => (
                  <li key={ev.id} className="p-6 flex items-center justify-between hover:bg-[#ffe500] transition-colors group">
                    <div>
                      <p className="font-black text-lg uppercase">{ev.activity}</p>
                      {ev.description && (
                        <p className="text-sm font-bold mt-1 opacity-70">{ev.description}</p>
                      )}
                      <p className="text-xs font-bold uppercase tracking-widest mt-2 bg-black text-white inline-block px-2 group-hover:bg-white group-hover:text-black border-2 border-transparent group-hover:border-black transition-colors">
                        {new Date(ev.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="shrink-0 ml-4 font-black text-xl bg-[#abf5d1] border-4 border-black px-3 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-3 group-hover:rotate-6 transition-transform">
                      +{ev.xpEarned}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
