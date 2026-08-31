import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { BadgeCheck, ShieldAlert, Ban } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function CertificateVerificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cert = await prisma.certificate.findUnique({
    where: { certificateCode: id },
    include: {
      user: {
        select: {
          name: true,
          isPublicProfile: true
        }
      }
    }
  });

  if (!cert) return notFound();

  const competencies = JSON.parse(cert.competencies as string);
  const displayName = cert.user.isPublicProfile ? cert.user.name : "Rolevia Member";

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <Card className="border-2 border-slate-200">
        <CardHeader className="text-center bg-slate-50 border-b border-slate-200 py-8">
          {cert.status === 'VALID' && <BadgeCheck className="w-16 h-16 mx-auto text-green-600 mb-4" />}
          {cert.status === 'REVOKED' && <Ban className="w-16 h-16 mx-auto text-red-600 mb-4" />}
          {cert.status === 'EXPIRED' && <ShieldAlert className="w-16 h-16 mx-auto text-yellow-600 mb-4" />}
          
          <CardTitle className="text-3xl font-bold tracking-tight">
            {cert.status === 'VALID' ? 'Verified Credential' : `Credential ${cert.status}`}
          </CardTitle>
          <p className="text-slate-500 mt-2">Issued by Rolevia Professional Certifications</p>
        </CardHeader>
        
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-y-6 gap-x-12">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Recipient</p>
              <p className="text-lg font-medium text-slate-900">{displayName}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Achievement</p>
              <p className="text-lg font-medium text-slate-900">{cert.title}</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Issue Date</p>
              <p className="text-lg font-medium text-slate-900">
                {new Date(cert.issuedAt).toLocaleDateString()}
              </p>
            </div>
 
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Credential ID</p>
              <p className="text-lg font-medium text-slate-900 font-mono">{cert.certificateCode}</p>
            </div>
          </div>
          
          {competencies.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <p className="text-sm font-semibold text-slate-500 uppercase mb-4">Demonstrated Competencies</p>
              <div className="flex flex-wrap gap-2">
                {competencies.map((c: string) => (
                  <span key={c} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
 
          {cert.status === 'REVOKED' && (
            <div className="mt-8 pt-6 border-t border-red-100 bg-red-50 p-4 rounded-md">
              <p className="text-sm text-red-800 font-medium text-center">
                This credential was revoked by the issuing authority and is no longer valid.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <p className="text-center text-xs text-slate-400 mt-8">
        Rolevia automatically redacts private personal identifiable information on public verification endpoints.
      </p>
    </div>
  );
}
