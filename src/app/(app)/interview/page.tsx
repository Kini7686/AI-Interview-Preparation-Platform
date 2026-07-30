import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import {
  DURATION_OPTIONS,
  MIX_PRESET_LABELS,
  MIN_RESUME_SUMMARY_CHARS,
  QUESTION_COUNT_OPTIONS,
} from "@/lib/domain/interview";
import { MixPreset } from "@prisma/client";
import { startInterview } from "@/server/actions/interview";
import { ActionForm } from "@/components/action-form";
import { Field, PageHeader } from "@/components/ui";

export default async function InterviewSetupPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=%2Finterview");

  const [user, roles, resume] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.roleCatalogEntry.findMany({ orderBy: { title: "asc" } }),
    prisma.resume.findUnique({ where: { userId: session.user.id } }),
  ]);

  const resumeReady =
    (resume?.summary.trim().length ?? 0) >= MIN_RESUME_SUMMARY_CHARS;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <PageHeader
        eyebrow="New session"
        title="Start interview"
        description="Configure a text mock interview. The configuration locks once the session begins."
      />

      {!resumeReady ? (
        <div role="alert" className="alert alert-warning">
          <span>
            Add a resume summary of at least {MIN_RESUME_SUMMARY_CHARS} characters
            before starting.{" "}
            <Link href="/resume" className="link">
              Go to Resume
            </Link>
          </span>
        </div>
      ) : null}

      <ActionForm action={startInterview} className="card flex flex-col gap-6 p-6">
        <Field label="Target role" htmlFor="roleId">
          <select
            id="roleId"
            name="roleId"
            required
            defaultValue={user?.defaultRoleId ?? ""}
            className="select"
          >
            <option value="" disabled>
              Select a role
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.title}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Duration" htmlFor="durationMin" hint="minutes">
            <select
              id="durationMin"
              name="durationMin"
              defaultValue="30"
              className="select"
            >
              {DURATION_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} minutes
                </option>
              ))}
            </select>
          </Field>
          <Field label="Question count" htmlFor="questionCount">
            <select
              id="questionCount"
              name="questionCount"
              defaultValue="5"
              className="select"
            >
              {QUESTION_COUNT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} questions
                </option>
              ))}
            </select>
          </Field>
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="label mb-2">Question mix</legend>
          <div className="grid gap-2">
            {(Object.keys(MIX_PRESET_LABELS) as MixPreset[]).map((key) => (
              <label key={key} className="option-card">
                <input
                  type="radio"
                  name="mixPreset"
                  value={key}
                  defaultChecked={key === "balanced"}
                />
                {MIX_PRESET_LABELS[key]}
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={!resumeReady || roles.length === 0}
          className="btn btn-primary w-fit"
        >
          Start interview
        </button>
      </ActionForm>
    </main>
  );
}
