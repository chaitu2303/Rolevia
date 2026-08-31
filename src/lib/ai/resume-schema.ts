import { z } from 'zod';

// ─── Resume Section Schemas ──────────────────────────────────────────────────

export const ContactSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
});

export const SummarySchema = z.object({
  text: z.string(),
});

export const ExperienceItemSchema = z.object({
  id: z.string(),
  role: z.string(),
  company: z.string(),
  duration: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  bullets: z.array(z.string()),
  sourceFactId: z.string().optional(), // links back to ExperienceFact in Master Profile
});

export const EducationItemSchema = z.object({
  id: z.string(),
  degree: z.string(),
  institution: z.string(),
  year: z.string().optional(),
  gpa: z.string().optional(),
  field: z.string().optional(),
  sourceFactId: z.string().optional(),
});

export const SkillGroupSchema = z.object({
  category: z.string(),
  skills: z.array(z.string()),
});

export const ProjectItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  techStack: z.array(z.string()).optional(),
  url: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  sourceFactId: z.string().optional(),
});

export const CertificationItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string().optional(),
  year: z.string().optional(),
  sourceFactId: z.string().optional(),
});

export const ResumeSectionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('contact'), visible: z.boolean().default(true), data: ContactSchema }),
  z.object({ type: z.literal('summary'), visible: z.boolean().default(true), data: SummarySchema }),
  z.object({ type: z.literal('experience'), visible: z.boolean().default(true), data: z.object({ items: z.array(ExperienceItemSchema) }) }),
  z.object({ type: z.literal('education'), visible: z.boolean().default(true), data: z.object({ items: z.array(EducationItemSchema) }) }),
  z.object({ type: z.literal('skills'), visible: z.boolean().default(true), data: z.object({ groups: z.array(SkillGroupSchema) }) }),
  z.object({ type: z.literal('projects'), visible: z.boolean().default(true), data: z.object({ items: z.array(ProjectItemSchema) }) }),
  z.object({ type: z.literal('certifications'), visible: z.boolean().default(true), data: z.object({ items: z.array(CertificationItemSchema) }) }),
  z.object({ type: z.literal('custom'), visible: z.boolean().default(true), data: z.object({ title: z.string(), content: z.string() }) }),
]);

export const ResumeContentSchema = z.object({
  templateId: z.string().default('clean'),
  font: z.string().default('Inter'),
  fontSize: z.number().default(10),
  lineSpacing: z.number().default(1.4),
  margins: z.object({ top: z.number(), bottom: z.number(), left: z.number(), right: z.number() }).default({ top: 20, bottom: 20, left: 20, right: 20 }),
  sections: z.array(ResumeSectionSchema),
  accentColor: z.string().optional().default('default'),
  pageSize: z.string().optional().default('a4'),
  marginsPreset: z.string().optional().default('standard'),
});

// ─── AI Tailoring Response Schema ────────────────────────────────────────────

export const TailoringChangeSchema = z.object({
  sectionType: z.string(),
  itemId: z.string().optional(),
  field: z.string(),
  original: z.string(),
  proposed: z.string(),
  reason: z.string(),
  sourceFactId: z.string().optional(), // grounded in a verified career fact
  isFabricated: z.boolean().default(false), // truth guard flag
});

export const TailoringResultSchema = z.object({
  overallStrategy: z.string(),
  changes: z.array(TailoringChangeSchema),
  rejectedRequirements: z.array(z.object({
    skill: z.string(),
    reason: z.string(), // why we cannot add this
  })),
});

export type ResumeContent = z.infer<typeof ResumeContentSchema>;
export type ResumeSection = z.infer<typeof ResumeSectionSchema>;
export type TailoringResult = z.infer<typeof TailoringResultSchema>;
export type TailoringChange = z.infer<typeof TailoringChangeSchema>;
