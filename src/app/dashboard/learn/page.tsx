import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { BookOpen, Search, Code, Layout, Database, Server, ChevronRight, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const modules = [
  {
    id: 'frontend',
    title: 'Frontend Engineering',
    description: 'Master React, Next.js, and CSS architecture.',
    icon: Layout,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    progress: 45,
    topics: ['React Hooks', 'State Management', 'CSS Grid & Flexbox', 'Web Performance']
  },
  {
    id: 'backend',
    title: 'Backend Engineering',
    description: 'Learn Node.js, APIs, and microservices.',
    icon: Server,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    progress: 12,
    topics: ['REST vs GraphQL', 'Authentication', 'Message Queues', 'Docker']
  },
  {
    id: 'database',
    title: 'Database Design',
    description: 'Master SQL, schema design, and query optimization.',
    icon: Database,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    progress: 0,
    topics: ['Normalization', 'Indexing', 'NoSQL vs SQL', 'Transactions']
  },
  {
    id: 'algorithms',
    title: 'Data Structures & Algorithms',
    description: 'Crush the coding interview.',
    icon: Code,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    progress: 80,
    topics: ['Arrays & Strings', 'Trees & Graphs', 'Dynamic Programming', 'Sorting']
  }
];

export default async function LearnPage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/');

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
            <BookOpen className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Department Practice</h1>
            <p className="text-muted-foreground">Master the skills required for your target role.</p>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
          <Input 
            placeholder="Search modules..." 
            className="pl-10 h-11 rounded-xl bg-muted/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((mod) => (
          <Link 
            key={mod.id} 
            href={`/dashboard/learn/${mod.id}`}
            className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-transform group flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className={`w-14 h-14 border-4 border-black ${mod.bg} flex items-center justify-center -rotate-2 group-hover:rotate-0 transition-transform`}>
                  <mod.icon className={`w-7 h-7 ${mod.color}`} />
                </div>
                <div className="bg-[#ffe500] border-2 border-black px-3 py-1 font-black text-xs uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <PlayCircle className="w-4 h-4 text-black" /> Start Course
                </div>
              </div>
              
              <h2 className="text-2xl font-black uppercase mb-2 leading-tight">{mod.title}</h2>
              <p className="text-black/80 font-bold text-sm mb-6">{mod.description}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                  <span>Progress</span>
                  <span>{mod.progress}%</span>
                </div>
                <div className="h-4 bg-gray-200 border-2 border-black overflow-hidden relative">
                  <div 
                    className={`h-full ${mod.progress > 0 ? 'bg-[#23a094]' : 'bg-black'} transition-all duration-1000`} 
                    style={{ width: `${mod.progress}%` }} 
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-4 border-black">
              <p className="text-xs font-black uppercase tracking-wider text-black mb-3">Key Topics</p>
              <div className="flex flex-wrap gap-2">
                {mod.topics.map(topic => (
                  <span key={topic} className="px-2 py-1 bg-[#faf8f5] text-xs font-black uppercase border-2 border-black">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
