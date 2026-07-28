import { prisma } from '@/lib/prisma';
import { isAiAvailable, extractEntities } from '@/lib/ai/gateway';
import { z } from 'zod';

export interface AgentDecision {
  nextAction: 'ASK_NEW' | 'FOLLOW_UP' | 'CHALLENGE' | 'TRANSITION' | 'END_INTERVIEW';
  competencyTarget?: string;
  questionText?: string;
  evaluation?: any;
}

const InterviewTurnSchema = z.object({
  reply: z.string().describe('The professional interviewer response or next question'),
  action: z.enum(['ASK_NEW', 'FOLLOW_UP', 'END_INTERVIEW']).describe('The action to take next'),
  score: z.number().describe('A score from 0-100 evaluating the candidate\'s latest answer based on the role requirements'),
  feedback: z.string().describe('Specific, constructive feedback on the candidate\'s latest answer (e.g. what they missed, how to improve it). Do not include this in the reply.')
});

export class InterviewOrchestrator {
  /**
   * Initializes a new interview session.
   */
  static async initializeSession(userId: string, params: any) {
    const { title, type, department, targetRole, difficulty, mode } = params;
    
    const plan = {
      stages: ['INTRO', 'TECHNICAL', 'BEHAVIORAL', 'CONCLUSION'],
      currentStage: 'INTRO',
      competenciesToCover: ['Problem Solving', 'Domain Knowledge'],
      maxQuestions: 10,
      questionsAsked: 0,
      targetDifficulty: difficulty
    };

    return await prisma.interviewSession.create({
      data: {
        userId,
        title,
        type,
        department,
        targetRole,
        difficulty,
        mode,
        status: 'IN_PROGRESS',
        interviewPlan: plan,
        competencyCoverage: {},
        conversationLog: []
      }
    });
  }

  /**
   * Processes a candidate's answer and orchestrates the multi-agent response.
   */
  static async processTurn(sessionId: string, candidateAnswer: string, userId: string) {
    const session = await prisma.interviewSession.findUnique({ where: { id: sessionId } });
    if (session && session.userId !== userId) throw new Error('Unauthorized');
    if (!session) throw new Error('Session not found');

    if (!isAiAvailable()) {
      throw new Error('AI_UNAVAILABLE');
    }

    const log = Array.isArray(session.conversationLog) ? (session.conversationLog as any[]) : [];
    
    const prompt = `
You are an expert ${session.type} interviewer conducting an interview for a ${session.targetRole} (${session.difficulty} level).
Candidate's Latest Answer: "${candidateAnswer}".
Previous Conversation History: ${JSON.stringify(log.slice(-6))}.

Instructions:
1. Evaluate the candidate's latest answer out of 100 based on standard industry expectations for a ${session.targetRole}.
2. Generate the next professional, engaging ${session.type === 'TECHNICAL' ? 'technical/coding/architecture' : 'behavioral/HR/STAR-method'} question or feedback.
3. If this is the 5th or 6th turn, or the candidate has answered excellently across the board, choose "END_INTERVIEW" and thank them.
`;

    const aiResult = await extractEntities(prompt, InterviewTurnSchema, {
      systemPrompt: 'You are an elite automated Interview AI. Output valid JSON strictly conforming to the requested schema. Maintain a professional, conversational tone.'
    });

    const updatedLog = [
      ...log,
      { role: 'user', content: candidateAnswer, timestamp: new Date().toISOString() },
      { role: 'assistant', content: aiResult.reply, timestamp: new Date().toISOString() }
    ];

    const status = aiResult.action === 'END_INTERVIEW' ? 'COMPLETED' : session.status;

    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        conversationLog: updatedLog,
        status,
        ...(status === 'COMPLETED' ? { completedAt: new Date() } : {})
      }
    });

    return {
      reply: aiResult.reply,
      action: aiResult.action,
      isNativeIntelligence: false,
      score: aiResult.score,
      feedback: aiResult.feedback
    };
  }

  static async endSession(sessionId: string) {
    return await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });
  }
}
