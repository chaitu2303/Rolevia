import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import pdfParse from 'pdf-parse';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const contentType = req.headers.get('content-type') || '';
    let text = '';
    let title = 'Pasted Resume';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      text = body.text || '';
      if (!text.trim()) {
        return NextResponse.json({ error: 'Pasted text is empty' }, { status: 400 });
      }
    } else {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }
      title = `Uploaded: ${file.name}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Parse PDF
      try {
        const data = await pdfParse(buffer);
        text = data.text;
      } catch (e) {
        console.error('PDF parsing error', e);
        return NextResponse.json({ error: 'Failed to parse PDF file' }, { status: 400 });
      }
    }

    // Default basic resume schema setup
    const newContent = {
      theme: { color: "#000000", font: "Inter" },
      layout: { columns: 1, spacing: "normal" },
      sections: [
        {
          id: "contact-1",
          type: "contact",
          data: {
            name: dbUser.name || "Parsed Resume",
            email: dbUser.email,
            phone: "",
            location: "",
            linkedin: "",
            website: ""
          }
        },
        {
          id: "summary-1",
          type: "summary",
          data: {
            text: "Parsed text from uploaded resume:\n\n" + (text.substring(0, 1000) + (text.length > 1000 ? "..." : ""))
          }
        },
        {
          id: "experience-1",
          type: "experience",
          data: {
            items: [
              {
                id: "exp-1",
                role: "Parsed Experience",
                company: "Unknown",
                dateString: "2020 - Present",
                bullets: ["Review your parsed resume text above and distribute it into the correct sections."]
              }
            ]
          }
        }
      ]
    };

    const newResume = await prisma.resume.create({
      data: {
        userId: dbUser.id,
        title: title,
        content: newContent,
        templateId: 'clean',
        versions: {
          create: {
            versionNumber: 1,
            content: newContent,
            title: 'Initial Import',
            changeNote: 'Parsed from uploaded PDF'
          }
        }
      }
    });

    return NextResponse.json({ success: true, resumeId: newResume.id });
  } catch (error: any) {
    console.error('Resume upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
