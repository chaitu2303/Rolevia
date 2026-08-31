import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load env variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set in environment.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Reading leetcode.csv...');
  const csvPath = path.join(process.cwd(), 'datasets', 'leetcode.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('leetcode.csv not found at', csvPath);
    process.exit(1);
  }

  const csvData = fs.readFileSync(csvPath, 'utf8');
  const lines = csvData.split('\n');

  let count = 0;
  console.log(`Found ${lines.length - 1} potential problems. Seeding a sample of 150 problems...`);

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(',');
    if (cols.length < 7) continue;

    const title = cols[2]?.replace(/"/g, '').trim();
    const link = cols[3]?.trim();
    const difficultyNum = cols[6]; // 1, 2, 3

    if (!title || !link) continue;

    let difficulty = 'EASY';
    if (difficultyNum === '2') difficulty = 'MEDIUM';
    if (difficultyNum === '3') difficulty = 'HARD';

    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const desc = `Implement the solution for **${title}**. More details can be found on LeetCode: [LeetCode Link](${link})`;

    // Check if exists
    const existing = await prisma.codingProblem.findUnique({
      where: { slug }
    });

    if (!existing) {
      await prisma.codingProblem.create({
        data: {
          title,
          slug,
          difficulty,
          topic: 'General',
          description: desc,
          status: 'PUBLISHED',
          timeLimit: 2000,
          memoryLimit: 256,
          templates: {
            create: [
              {
                language: 'javascript',
                code: `// Template for ${title}\nfunction solve() {\n  // Write your code here\n}`
              },
              {
                language: 'python',
                code: `# Template for ${title}\ndef solve():\n    pass`
              }
            ]
          },
          examples: {
            create: [
              {
                input: 'Example input',
                output: 'Example output',
                explanation: 'Standard test case execution.',
                orderIndex: 0
              }
            ]
          },
          testCases: {
            create: [
              {
                input: 'Example input',
                expectedOutput: 'Example output',
                isHidden: false,
                orderIndex: 0
              }
            ]
          }
        }
      });
      count++;
    }

    if (count >= 150) {
      break;
    }
  }

  console.log(`Successfully seeded ${count} coding problems from leetcode.csv!`);
  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
