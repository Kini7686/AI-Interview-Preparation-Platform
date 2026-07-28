"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { resumeSummarySchema } from "@/lib/validation/app.schema";
import { extractResumeText, storeResumeFile } from "@/lib/storage/resume";

export type ResumeActionResult =
  | { ok: true; message?: string }
  | { ok: false; message: string };

export async function saveResumeSummary(
  _prev: ResumeActionResult | null,
  formData: FormData,
): Promise<ResumeActionResult> {
  const { user } = await requireSession();
  const parsed = resumeSummarySchema.safeParse({
    summary: formData.get("summary"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid summary",
    };
  }

  await prisma.resume.upsert({
    where: { userId: user.id },
    create: { userId: user.id, summary: parsed.data.summary },
    update: { summary: parsed.data.summary },
  });

  revalidatePath("/resume");
  revalidatePath("/dashboard");
  revalidatePath("/interview");
  return { ok: true, message: "Resume summary saved." };
}

export async function uploadResume(
  _prev: ResumeActionResult | null,
  formData: FormData,
): Promise<ResumeActionResult> {
  const { user } = await requireSession();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a PDF or DOCX file to upload." };
  }

  try {
    const stored = await storeResumeFile(user.id, file);
    const extracted = await extractResumeText(file);
    const existing = await prisma.resume.findUnique({ where: { userId: user.id } });
    const summary =
      extracted.length >= 100
        ? extracted
        : existing?.summary ||
          "Paste or edit your resume summary here after upload. Include projects, skills, and impact.";

    await prisma.resume.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fileName: stored.fileName,
        storageKey: stored.storageKey,
        mimeType: stored.mimeType,
        summary,
      },
      update: {
        fileName: stored.fileName,
        storageKey: stored.storageKey,
        mimeType: stored.mimeType,
        ...(extracted.length >= 100 ? { summary: extracted } : {}),
      },
    });

    revalidatePath("/resume");
    revalidatePath("/dashboard");
    return {
      ok: true,
      message:
        extracted.length >= 100
          ? "Upload saved. Review the extracted summary below."
          : "Upload saved. Edit the summary text (extraction was limited).",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Upload failed",
    };
  }
}
