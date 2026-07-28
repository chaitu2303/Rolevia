'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, CheckCircle, Code, Play, Award, ChevronRight, FileText, Lightbulb } from 'lucide-react';
import Link from 'next/link';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  content: string;
  codeSnippet?: string;
  keyTakeaways: string[];
}

interface CourseData {
  title: string;
  category: string;
  description: string;
  level: string;
  lessons: Lesson[];
}

const COURSES_DATA: Record<string, CourseData> = {
  frontend: {
    title: 'Frontend Engineering from Scratch',
    category: 'Web Development',
    description: 'Learn modern Web Development with HTML5, CSS3, JavaScript ES6+, React, and Next.js from basic syntax to advanced architecture.',
    level: 'Beginner to Advanced',
    lessons: [
      {
        id: 'fe-1',
        title: '1. Modern JavaScript Fundamentals & ES6+',
        duration: '25 mins',
        content: `JavaScript is the language of the web. Understanding modern ES6+ features such as arrow functions, destructuring, promises, async/await, and array methods (map, filter, reduce) is fundamental for modern web frameworks like React.`,
        codeSnippet: `// ES6+ Destructuring & Async/Await Example
const fetchUserData = async (userId) => {
  try {
    const response = await fetch(\`https://api.example.com/users/\${userId}\`);
    const { name, email, skills = [] } = await response.json();
    console.log(\`User: \${name} (\${email})\`);
    return skills.filter(skill => skill.isVerified);
  } catch (error) {
    console.error("Failed to load user:", error);
  }
};`,
        keyTakeaways: [
          'Master arrow functions, scope, and variable hoisting (let/const vs var)',
          'Use Async/Await over raw promises for cleaner asynchronous code',
          'Utilize Array.prototype methods (map, filter, reduce) immutably'
        ]
      },
      {
        id: 'fe-2',
        title: '2. React Components, Props, and State',
        duration: '35 mins',
        content: `React breaks UI down into reusable components. State (useState) allows components to hold interactive dynamic data, while Props pass read-only inputs down the component tree.`,
        codeSnippet: `import { useState } from 'react';

export function Counter({ initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);

  return (
    <div className="p-4 border-2 border-black bg-yellow-100">
      <h2 className="text-xl font-bold">Count: {count}</h2>
      <button 
        onClick={() => setCount(c => c + 1)}
        className="mt-2 px-4 py-2 bg-black text-white font-bold"
      >
        Increment
      </button>
    </div>
  );
}`,
        keyTakeaways: [
          'State updates trigger component re-renders',
          'Never mutate state directly; always use the updater function',
          'Keep components small and focused on a single responsibility'
        ]
      },
      {
        id: 'fe-3',
        title: '3. Next.js App Router & Server Components',
        duration: '40 mins',
        content: `Next.js 14 App Router brings React Server Components (RSC) into mainstream web architecture. Server components fetch data directly on the server without shipping JavaScript bundles to the browser.`,
        codeSnippet: `// Server Component example (default in App Router)
export default async function UserProfilePage({ params }) {
  const res = await fetch(\`https://api.example.com/user/\${params.id}\`, { next: { revalidate: 60 } });
  const user = await res.json();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-black">{user.name}</h1>
      <p className="text-gray-600">{user.bio}</p>
    </main>
  );
}`,
        keyTakeaways: [
          'Use React Server Components for zero-bundle data fetching',
          'Add "use client" directive only when adding interactivity (event listeners, state)',
          'Leverage Next.js dynamic routing and layout nesting'
        ]
      }
    ]
  },
  backend: {
    title: 'Backend Engineering & API Design',
    category: 'System & Cloud',
    description: 'Build production-ready backend servers with Node.js, Express, RESTful APIs, JWT authentication, and microservices.',
    level: 'Intermediate',
    lessons: [
      {
        id: 'be-1',
        title: '1. Building Scalable REST APIs with Express & Node.js',
        duration: '30 mins',
        content: `REST (Representational State Transfer) is an architectural style for designing networked applications. Express provides a lightweight framework for routing, middleware handling, and HTTP response handling.`,
        codeSnippet: `import express from 'express';
const app = express();
app.use(express.json());

// Controller endpoint
app.post('/api/v1/jobs', async (req, res) => {
  const { title, company, salary } = req.body;
  if (!title || !company) {
    return res.status(400).json({ error: 'Title and company are required' });
  }
  // Create job record in database
  res.status(201).json({ message: 'Job created successfully', job: { title, company, salary } });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        keyTakeaways: [
          'Use standardized HTTP status codes (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 500 Error)',
          'Always validate and sanitize incoming client request body payloads',
          'Implement structured middleware for error handling and request logging'
        ]
      },
      {
        id: 'be-2',
        title: '2. Authentication & Authorization (JWT & Sessions)',
        duration: '35 mins',
        content: `Secure your APIs using JSON Web Tokens (JWT) or secure HTTP-only cookies. Authentication confirms who the user is; authorization verifies what permissions they possess.`,
        codeSnippet: `import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}`,
        keyTakeaways: [
          'Store access tokens securely (HTTP-only, SameSite cookies or short-lived Bearer tokens)',
          'Hash passwords with bcrypt/argon2 before storing in database',
          'Enforce Role-Based Access Control (RBAC) on sensitive endpoints'
        ]
      }
    ]
  },
  database: {
    title: 'Database Architecture & SQL Mastering',
    category: 'Data Engineering',
    description: 'Master Relational Databases (Postgres), NoSQL, SQL Queries, Joins, Indexes, Schema Normalization, and ORMs (Prisma).',
    level: 'Beginner to Advanced',
    lessons: [
      {
        id: 'db-1',
        title: '1. SQL Core: SELECT, JOINs, Grouping, and Aggregation',
        duration: '30 mins',
        content: `SQL allows querying relational data efficiently. INNER JOIN, LEFT JOIN, GROUP BY, and HAVING allow transforming raw database records into actionable analytical views.`,
        codeSnippet: `-- Complex Query: Top Companies by Applied Applications Count
SELECT 
  j.company,
  COUNT(a.id) AS total_applications,
  ROUND(AVG(a.salary), 2) AS avg_offered_salary
FROM job_applications a
JOIN jobs j ON a.job_id = j.id
WHERE a.status IN ('APPLIED', 'INTERVIEWING', 'OFFER')
GROUP BY j.company
HAVING COUNT(a.id) >= 2
ORDER BY total_applications DESC;`,
        keyTakeaways: [
          'Use INNER JOIN for matching records and LEFT JOIN to preserve left table rows',
          'Index foreign keys and heavily queried columns to avoid full table scans',
          'Avoid N+1 query problems by fetching related tables in single JOIN statements or batch queries'
        ]
      }
    ]
  },
  algorithms: {
    title: 'Data Structures & Algorithms for Coding Interviews',
    category: 'Computer Science',
    description: 'Solve top coding interview problems on Arrays, Strings, Dynamic Programming, Binary Trees, Graphs, and Hash Maps.',
    level: 'All Levels',
    lessons: [
      {
        id: 'dsa-1',
        title: '1. Two-Pointer & Sliding Window Technique',
        duration: '30 mins',
        content: `The Two-Pointer approach reduces O(N^2) brute-force nested loops into linear O(N) time complexity by maintaining two indices moving towards each other or sliding across an array.`,
        codeSnippet: `// Example: Container With Most Water (LeetCode #11) - O(N) Time, O(1) Space
function maxArea(heights: number[]): number {
  let left = 0;
  let right = heights.length - 1;
  let maxWater = 0;

  while (left < right) {
    const width = right - left;
    const currentHeight = Math.min(heights[left], heights[right]);
    maxWater = Math.max(maxWater, width * currentHeight);

    if (heights[left] < heights[right]) {
      left++;
    } else {
      right--;
    }
  }

  return maxWater;
}`,
        keyTakeaways: [
          'Use two pointers for sorted array searches, palindrome checks, and subarray problems',
          'Analyze space complexity O(1) vs time complexity O(N)',
          'Test edge cases: empty arrays, 1 element arrays, duplicate values'
        ]
      }
    ]
  }
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = (params.courseId as string) || 'frontend';
  
  const course = COURSES_DATA[courseId] || COURSES_DATA.frontend;
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const activeLesson = course.lessons[activeLessonIndex] || course.lessons[0];

  const markCompleted = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons(prev => [...prev, lessonId]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-[#faf8f5] text-black font-sans min-h-[calc(100vh-4rem)]">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-8 border-black pb-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/learn"
            className="w-12 h-12 bg-white border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ffe500] transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#90c0ff] text-black border-2 border-black px-2 py-0.5 font-black uppercase text-xs">
                {course.category}
              </span>
              <span className="bg-[#abf5d1] text-black border-2 border-black px-2 py-0.5 font-black uppercase text-xs">
                {course.level}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase mt-1">
              {course.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Award className="w-8 h-8 text-[#ff90e8]" />
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-gray-600">Course Progress</div>
            <div className="text-lg font-black">{completedLessons.length} / {course.lessons.length} Lessons Completed</div>
          </div>
        </div>
      </div>

      {/* Main Course Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lesson Sidebar Navigation */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-black uppercase text-xl mb-4 border-b-4 border-black pb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Lessons Curriculum
            </h3>
            
            <div className="space-y-3">
              {course.lessons.map((lesson, idx) => {
                const isActive = idx === activeLessonIndex;
                const isDone = completedLessons.includes(lesson.id);
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLessonIndex(idx)}
                    className={`w-full text-left p-4 border-4 border-black transition-all flex items-start justify-between gap-3 ${
                      isActive 
                        ? 'bg-[#ffe500] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-1' 
                        : 'bg-[#faf8f5] hover:bg-white'
                    }`}
                  >
                    <div>
                      <h4 className="font-black text-base uppercase leading-snug">{lesson.title}</h4>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-600 mt-1 block">
                        ⏱️ {lesson.duration}
                      </span>
                    </div>
                    {isDone && <CheckCircle className="w-6 h-6 text-[#23a094] shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#90c0ff] border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black uppercase text-lg mb-2 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" /> Placement Tip
            </h4>
            <p className="font-bold text-sm">
              Study the code examples thoroughly. Top technical interviewers check whether you understand performance trade-offs, clean structure, and edge case handling!
            </p>
          </div>
        </div>

        {/* Active Lesson Content Viewer */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-start border-b-4 border-black pb-4 mb-6">
              <div>
                <span className="bg-black text-white text-xs font-black uppercase px-2 py-1">
                  Lesson {activeLessonIndex + 1}
                </span>
                <h2 className="text-3xl font-black uppercase tracking-tight mt-2">
                  {activeLesson.title}
                </h2>
              </div>
              <button
                onClick={() => markCompleted(activeLesson.id)}
                className={`px-4 py-2 border-4 border-black font-black uppercase text-sm flex items-center gap-2 transition-all ${
                  completedLessons.includes(activeLesson.id)
                    ? 'bg-[#abf5d1] text-black'
                    : 'bg-[#ff90e8] hover:bg-[#ff70dd] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                {completedLessons.includes(activeLesson.id) ? 'Completed' : 'Mark as Complete'}
              </button>
            </div>

            {/* Overview Content */}
            <div className="prose max-w-none text-base font-bold leading-relaxed space-y-4 mb-8">
              <p>{activeLesson.content}</p>
            </div>

            {/* Code Snippet Playground / Reader */}
            {activeLesson.codeSnippet && (
              <div className="mb-8">
                <div className="bg-black text-white font-mono text-xs uppercase px-4 py-2 font-black border-4 border-black flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-[#ffe500]" /> Interactive Code Snippet
                  </span>
                  <span className="text-[#abf5d1]">Target Execution</span>
                </div>
                <pre className="bg-[#1e1e1e] text-green-400 p-6 font-mono text-sm overflow-x-auto border-x-4 border-b-4 border-black leading-relaxed">
                  <code>{activeLesson.codeSnippet}</code>
                </pre>
              </div>
            )}

            {/* Key Takeaways */}
            <div className="bg-[#abf5d1] border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
              <h4 className="font-black uppercase text-lg flex items-center gap-2 text-black">
                <FileText className="w-5 h-5 text-black" /> Key Exam & Interview Takeaways
              </h4>
              <ul className="space-y-2">
                {activeLesson.keyTakeaways.map((takeaway, tIdx) => (
                  <li key={tIdx} className="font-bold text-sm flex items-start gap-2 text-black">
                    <span className="text-black font-black">✓</span> {takeaway}
                  </li>
                ))}
              </ul>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-8 border-t-4 border-black mt-8">
              <button
                disabled={activeLessonIndex === 0}
                onClick={() => setActiveLessonIndex(prev => prev - 1)}
                className="px-6 py-3 border-4 border-black bg-white hover:bg-gray-100 disabled:opacity-50 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Previous Lesson
              </button>
              {activeLessonIndex < course.lessons.length - 1 ? (
                <button
                  onClick={() => {
                    markCompleted(activeLesson.id);
                    setActiveLessonIndex(prev => prev + 1);
                  }}
                  className="px-6 py-3 border-4 border-black bg-[#ffe500] hover:bg-yellow-400 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
                >
                  Next Lesson <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  href="/dashboard/assess"
                  className="px-6 py-3 border-4 border-black bg-[#23a094] hover:bg-teal-600 text-white font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
                >
                  Take Skill Exam <Award className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
