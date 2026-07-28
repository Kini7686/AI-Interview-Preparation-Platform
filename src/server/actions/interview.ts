"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { assertOwned, NotFoundError } from "@/lib/auth/ownership";
import {
  buildQuestionBank,
  canAcceptAnswers,
  MIN_RESUME_SUMMARY_CHARS,
} from "@/lib/domain/interview";
import { answerSchema, interviewConfigSchema } from "@/lib/validation/app.schema";
import { generateInterviewReport } from "@/lib/ai/client";

export type InterviewActionResult =
  | { ok: true }
  | { ok: false; message: string };

export async function startInterview(
  _prev: InterviewActionResult | null,
  formData: FormData,
): Promise<InterviewActionResult> {
  const { user } = await requireSession();
  const parsed = interviewConfigSchema.safeParse({
    roleId: formData.get("roleId"),
    durationMin: formData.get("durationMin"),
    questionCount: formData.get("questionCount"),
    mixPreset: formData.get("mixPreset"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid configuration",
    };
  }

  const resume = await prisma.resume.findUnique({ where: { userId: user.id } });
  if (!resume || resume.summary.trim().length < MIN_RESUME_SUMMARY_CHARS) {
    return {
      ok: false,
      message: `Add a resume summary of at least ${MIN_RESUME_SUMMARY_CHARS} characters before starting.`,
    };
  }

  const role = await prisma.roleCatalogEntry.findUnique({
    where: { id: parsed.data.roleId },
  });
  if (!role) {
    return { ok: false, message: "Selected role was not found." };
  }

  const questions = buildQuestionBank(
    parsed.data.mixPreset,
    parsed.data.questionCount,
    role.title,
  );

  const interview = await prisma.$transaction(async (tx) => {
    const created = await tx.interview.create({
      data: {
        userId: user.id,
        roleId: role.id,
        durationMin: parsed.data.durationMin,
        questionCount: parsed.data.questionCount,
        mixPreset: parsed.data.mixPreset,
        status: "in_progress",
      },
    });
    await tx.interviewTurn.createMany({
      data: questions.map((questionText, turnIndex) => ({
        interviewId: created.id,
        turnIndex,
        questionText,
      })),
    });
    return created;
  });

  redirect(`/interview/${interview.id}`);
}

export async function submitAnswer(
  _prev: InterviewActionResult | null,
  formData: FormData,
): Promise<InterviewActionResult> {
  const { user } = await requireSession();
  const parsed = answerSchema.safeParse({
    interviewId: formData.get("interviewId"),
    turnId: formData.get("turnId"),
    answerText: formData.get("answerText"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid answer",
    };
  }

  const interview = await prisma.interview.findUnique({
    where: { id: parsed.data.interviewId },
    include: { turns: { orderBy: { turnIndex: "asc" } } },
  });
  if (!interview) throw new NotFoundError();
  assertOwned(interview.userId, user.id);

  if (!canAcceptAnswers(interview.status)) {
    return { ok: false, message: "This interview is no longer accepting answers." };
  }

  const turn = interview.turns.find((t) => t.id === parsed.data.turnId);
  if (!turn) throw new NotFoundError();
  if (turn.answerText) {
    return { ok: false, message: "This question was already answered." };
  }

  const openEarlier = interview.turns.some(
    (t) => t.turnIndex < turn.turnIndex && !t.answerText,
  );
  if (openEarlier) {
    return { ok: false, message: "Answer earlier questions first." };
  }

  await prisma.interviewTurn.update({
    where: { id: turn.id },
    data: {
      answerText: parsed.data.answerText,
      answeredAt: new Date(),
    },
  });

  const remaining = interview.turns.filter(
    (t) => t.id !== turn.id && !t.answerText,
  ).length;
  if (remaining === 0) {
    await finalizeInterview(interview.id, user.id, "completed");
    redirect(`/interview/${interview.id}/report`);
  }

  revalidatePath(`/interview/${interview.id}`);
  return { ok: true };
}

export async function endInterviewEarly(interviewId: string): Promise<void> {
  const { user } = await requireSession();
  await finalizeInterview(interviewId, user.id, "ended_early");
  redirect(`/interview/${interviewId}/report`);
}

async function finalizeInterview(
  interviewId: string,
  userId: string,
  status: "completed" | "ended_early",
) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      turns: { orderBy: { turnIndex: "asc" } },
      role: true,
      report: true,
    },
  });
  if (!interview) throw new NotFoundError();
  assertOwned(interview.userId, userId);
  if (interview.report) return;

  await prisma.interview.update({
    where: { id: interviewId },
    data: {
      status: "completed_pending_report",
      completedAt: new Date(),
    },
  });

  const resume = await prisma.resume.findUnique({ where: { userId } });
  const answered = interview.turns.filter((t) => t.answerText?.trim());

  try {
    const { report, promptId, promptVersion, modelId } =
      await generateInterviewReport({
        roleTitle: interview.role.title,
        resumeSummary: resume?.summary ?? "",
        turns: answered.map((t) => ({
          question: t.questionText,
          answer: t.answerText ?? "",
        })),
      });

    await prisma.$transaction([
      prisma.interviewReport.create({
        data: {
          interviewId,
          clarity: report.clarity,
          structure: report.structure,
          technicalDepth: report.technicalDepth,
          relevance: report.relevance,
          overallSummary: report.overallSummary,
          strengths: report.strengths,
          improvements: report.improvements,
          promptId,
          promptVersion,
          modelId,
        },
      }),
      prisma.interview.update({
        where: { id: interviewId },
        data: { status },
      }),
    ]);
  } catch {
    await prisma.interview.update({
      where: { id: interviewId },
      data: { status: "report_failed" },
    });
  }

  revalidatePath("/history");
  revalidatePath("/dashboard");
}
