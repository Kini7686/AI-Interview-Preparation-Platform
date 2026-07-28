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
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Start interview</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Configure a text mock interview. Configuration locks after you start.
        </p>
      </div>

      {!resumeReady ? (
        <div
          role="alert"
          className="border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
        >
          Add a resume summary (at least {MIN_RESUME_SUMMARY_CHARS} characters) before
          starting.{" "}
          <Link href="/resume" className="underline underline-offset-4">
            Go to Resume
          </Link>
        </div>
      ) : null}

      <ActionForm action={startInterview} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="roleId" className="text-sm font-medium">
            Target role
          </label>
          <select
            id="roleId"
            name="roleId"
            required
            defaultValue={user?.defaultRoleId ?? ""}
            className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
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
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="durationMin" className="text-sm font-medium">
              Duration (minutes)
            </label>
            <select
              id="durationMin"
              name="durationMin"
              defaultValue="30"
              className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              {DURATION_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="questionCount" className="text-sm font-medium">
              Question count
            </label>
            <select
              id="questionCount"
              name="questionCount"
              defaultValue="5"
              className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              {QUESTION_COUNT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium">Question mix</legend>
          {(Object.keys(MIX_PRESET_LABELS) as MixPreset[]).map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="mixPreset"
                value={key}
                defaultChecked={key === "balanced"}
              />
              {MIX_PRESET_LABELS[key]}
            </label>
          ))}
        </fieldset>

        <button
          type="submit"
          disabled={!resumeReady || roles.length === 0}
          className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Start interview
        </button>
      </ActionForm>
    </main>
  );
}
