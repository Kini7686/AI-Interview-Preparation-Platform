import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { MIN_RESUME_SUMMARY_CHARS } from "@/lib/domain/interview";
import { saveResumeSummary, uploadResume } from "@/server/actions/resume";
import { ActionForm } from "@/components/action-form";

export default async function ResumePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=%2Fresume");

  const resume = await prisma.resume.findUnique({
    where: { userId: session.user.id },
  });
  const length = resume?.summary.trim().length ?? 0;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Resume</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Upload a PDF/DOCX and edit the summary used to ground interview questions
          (minimum {MIN_RESUME_SUMMARY_CHARS} characters).
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Upload file</h2>
        <ActionForm action={uploadResume} className="flex flex-col gap-4">
          <input
            type="file"
            name="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            required
            className="text-sm"
          />
          {resume?.fileName ? (
            <p className="text-sm text-zinc-500">Current file: {resume.fileName}</p>
          ) : null}
          <button
            type="submit"
            className="inline-flex h-11 w-fit items-center justify-center rounded-md border border-zinc-300 px-4 text-sm font-medium dark:border-zinc-700"
          >
            Upload resume
          </button>
        </ActionForm>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold">Resume summary</h2>
          <p className="text-xs text-zinc-500">{length} / {MIN_RESUME_SUMMARY_CHARS}+ chars</p>
        </div>
        <ActionForm action={saveResumeSummary} className="flex flex-col gap-4">
          <label htmlFor="summary" className="sr-only">
            Resume summary
          </label>
          <textarea
            id="summary"
            name="summary"
            rows={14}
            required
            defaultValue={resume?.summary ?? ""}
            className="rounded-md border border-zinc-300 bg-white p-3 text-sm leading-6 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="Projects, skills, impact metrics, and stories you want interview questions to reference…"
          />
          <button
            type="submit"
            className="inline-flex h-11 w-fit items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Save summary
          </button>
        </ActionForm>
      </section>
    </main>
  );
}
