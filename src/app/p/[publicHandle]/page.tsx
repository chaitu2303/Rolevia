import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Briefcase, ExternalLink, ShieldCheck } from 'lucide-react';

export default async function CareerPassportPage({ params }: { params: Promise<{ publicHandle: string }> }) {
  const { publicHandle } = await params;
  
  const user = await prisma.user.findUnique({
    where: { publicHandle },
    include: {
      careerProfile: true,
      certificates: {
        where: { status: 'VALID' },
        orderBy: { issuedAt: 'desc' }
      },
      userBadges: {
        include: { badge: true },
        orderBy: { earnedAt: 'desc' }
      }
    }
  });

  if (!user || !user.isPublicProfile) {
    return notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="flex items-start justify-between mb-12">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name || ''} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-slate-400">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">{user.name}</h1>
            <p className="text-xl text-slate-600 mt-2 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Target Roles: {user.careerProfile?.targetRoles ? (Array.isArray(user.careerProfile.targetRoles) ? user.careerProfile.targetRoles.join(', ') : user.careerProfile.targetRoles as string) : 'Professional'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-full shadow-sm">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-semibold text-sm">Rolevia Verified</span>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {user.certificates.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Award className="w-6 h-6 text-slate-700" />
              Verified Certifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.certificates.map(cert => (
                <Card key={cert.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{cert.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-500 mb-4">
                      Issued {new Date(cert.issuedAt).toLocaleDateString()}
                    </p>
                    <a 
                      href={`/verify/certificate/${cert.certificateCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      Verify Credential <ExternalLink className="w-4 h-4" />
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {user.userBadges.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-slate-700" />
              Achievements
            </h2>
            <div className="flex flex-wrap gap-4">
              {user.userBadges.map(ub => (
                <div key={ub.id} className="bg-white border rounded-lg p-4 flex flex-col items-center justify-center w-32 h-32 shadow-sm text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <Award className="w-6 h-6 text-slate-600" />
                  </div>
                  <span className="text-xs font-semibold leading-tight">{ub.badge.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {user.certificates.length === 0 && user.userBadges.length === 0 && (
          <div className="text-center py-24 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No public verified activity yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              This professional has enabled their Career Passport but hasn't published any verified credentials.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
