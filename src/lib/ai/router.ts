/**
 * AI Task Router
 */
import { askGateway, extractEntities } from './gateway';
import { z } from 'zod';

export enum TaskType {
  RESUME_PARSE = 'RESUME_PARSE',
  RESUME_TAILOR = 'RESUME_TAILOR',
  JOB_ANALYZE = 'JOB_ANALYZE',
  ATS_EXPLAIN = 'ATS_EXPLAIN',
  APPLICATION_ANSWER = 'APPLICATION_ANSWER',
  INTERVIEW_QUESTION = 'INTERVIEW_QUESTION',
  INTERVIEW_EVALUATE = 'INTERVIEW_EVALUATE',
  CAREER_COACH = 'CAREER_COACH',
  COMMAND_CLASSIFY = 'COMMAND_CLASSIFY',
  GENERAL_CAREER_ASSISTANT = 'GENERAL_CAREER_ASSISTANT'
}

export async function routeTask(taskType: TaskType, payload: string, context?: string) {
  const systemPrompt = `You are the Rolevia ${taskType} agent.\n${context || ''}`;
  
  switch (taskType) {
    case TaskType.GENERAL_CAREER_ASSISTANT:
    case TaskType.CAREER_COACH:
      return askGateway(payload, { systemPrompt });
      
    case TaskType.RESUME_PARSE:
      return extractEntities(payload, z.object({
        name: z.string(),
        skills: z.array(z.string()),
        experienceYears: z.number()
      }), { systemPrompt });
      
    // Additional case branches would strictly route to specialized agent implementations
    default:
      return askGateway(payload, { systemPrompt });
  }
}
