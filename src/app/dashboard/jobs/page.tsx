import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { JobsClientPage } from '@/components/jobs/JobsClientPage';

export const dynamic = 'force-dynamic';

export default async function JobsIndexPage() {
  const session = await auth();
  const authUser = session?.user;
  if (!authUser) redirect('/');

  const dbUser = await prisma.user.findUnique({ 
    where: { email: authUser.email! },
    include: { careerProfile: true }
  });

  const rawJobs = dbUser
    ? await prisma.jobTarget.findMany({
        where: { userId: dbUser.id },
        include: { matchAnalysis: true },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  // Map Date objects to strings for Client Component boundary safety
  const jobs = rawJobs.map(job => ({
    ...job,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  }));

  const targetRole = dbUser?.careerProfile?.targetRole || '';

  return (
    <JobsClientPage 
      initialJobs={jobs} 
      targetRole={targetRole} 
    />
  );
}
