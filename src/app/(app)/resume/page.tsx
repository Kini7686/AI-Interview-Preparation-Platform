import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { MIN_RESUME_SUMMARY_CHARS } from "@/lib/domain/interview";
import { saveResumeSummary, uploadResume } from "@/server/actions/resume";
import { ActionForm } from "@/components/action-form";
import { PageHeader, Section } from "@/components/ui";

export default async function ResumePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=%2Fresume");

  const resume = await prisma.resume.findUnique({
    where: { userId: session.user.id },
  });
  const length = resume?.summary.trim().length ?? 0;
  const ready = length >= MIN_RESUME_SUMMARY_CHARS;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-12">
      <PageHeader
        eyebrow="Interview grounding"
        title="Resume"
        description={`Upload a PDF or DOCX and refine the summary that questions are generated from. At least ${MIN_RESUME_SUMMARY_CHARS} characters are required.`}
        actions={
          <span className={`badge ${ready ? "badge-success" : "badge-warning"}`}>
            {ready ? "Ready" : "Needs more detail"}
          </span>
        }
      />

      <Section
        title="Upload file"
        description="Text is extracted into the summary field below."
      >
        <ActionForm action={uploadResume} className="card flex flex-col gap-4 p-6">
          <input
            type="file"
            name="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            required
            aria-label="Resume file"
            className="file-input"
          />
          {resume?.fileName ? (
            <p className="hint">Current file: {resume.fileName}</p>
          ) : null}
          <button type="submit" className="btn btn-secondary w-fit">
            Upload resume
          </button>
        </ActionForm>
      </Section>

      <Section
        title="Resume summary"
        description="Projects, skills, impact metrics, and stories worth asking about."
        action={
          <span className={`badge ${ready ? "badge-success" : "badge-neutral"}`}>
            {length} / {MIN_RESUME_SUMMARY_CHARS}+ characters
          </span>
        }
      >
        <ActionForm
          action={saveResumeSummary}
          className="card flex flex-col gap-4 p-6"
        >
          <label htmlFor="summary" className="sr-only">
            Resume summary
          </label>
          <textarea
            id="summary"
            name="summary"
            rows={14}
            required
            defaultValue={resume?.summary ?? ""}
            className="textarea"
            placeholder="Projects, skills, impact metrics, and stories you want interview questions to reference…"
          />
          <button type="submit" className="btn btn-primary w-fit">
            Save summary
          </button>
        </ActionForm>
      </Section>
    </main>
  );
}
