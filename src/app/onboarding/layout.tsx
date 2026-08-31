import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Onboarding | Rolevia AI',
  description: 'Set up your Master Career Profile',
};

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (dbUser?.onboardingCompleted) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      {children}
    </div>
  );
}
