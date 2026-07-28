import { z } from "zod";
import { MixPreset } from "@prisma/client";
import {
  DURATION_OPTIONS,
  QUESTION_COUNT_OPTIONS,
  MIN_RESUME_SUMMARY_CHARS,
} from "@/lib/domain/interview";

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1, "Display name is required").max(80),
  defaultRoleId: z.string().min(1, "Select a default target role"),
});

export const resumeSummarySchema = z.object({
  summary: z
    .string()
    .trim()
    .min(
      MIN_RESUME_SUMMARY_CHARS,
      `Resume summary must be at least ${MIN_RESUME_SUMMARY_CHARS} characters`,
    )
    .max(50_000),
});

export const interviewConfigSchema = z.object({
  roleId: z.string().min(1),
  durationMin: z.coerce
    .number()
    .refine((n) => (DURATION_OPTIONS as readonly number[]).includes(n), {
      message: "Duration must be 15 or 30 minutes",
    }),
  questionCount: z.coerce
    .number()
    .refine((n) => (QUESTION_COUNT_OPTIONS as readonly number[]).includes(n), {
      message: "Question count must be 5 or 8",
    }),
  mixPreset: z.nativeEnum(MixPreset),
});

export const answerSchema = z.object({
  interviewId: z.string().min(1),
  turnId: z.string().min(1),
  answerText: z
    .string()
    .trim()
    .min(20, "Answer a bit more so we can give useful feedback")
    .max(10_000),
});

export const reportRubricSchema = z.object({
  clarity: z.number().int().min(1).max(5),
  structure: z.number().int().min(1).max(5),
  technicalDepth: z.number().int().min(1).max(5),
  relevance: z.number().int().min(1).max(5),
  overallSummary: z.string().min(20).max(4000),
  strengths: z.string().min(10).max(4000),
  improvements: z.string().min(10).max(4000),
});

export type ReportRubric = z.infer<typeof reportRubricSchema>;
