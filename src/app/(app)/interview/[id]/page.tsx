import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { assertOwned } from "@/lib/auth/ownership";
import { endInterviewEarly, submitAnswer } from "@/server/actions/interview";
import { ActionForm } from "@/components/action-form";
import { MIX_PRESET_LABELS } from "@/lib/domain/interview";

type PageProps = { params: Promise<{ id: string }> };

export default async function InterviewSessionPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const { id } = await params;
  const interview = await prisma.interview.findUnique({
    where: { id },
    include: {
      role: true,
      turns: { orderBy: { turnIndex: "asc" } },
      report: true,
    },
  });
  if (!interview) notFound();
  try {
    assertOwned(interview.userId, session.user.id);
  } catch {
    notFound();
  }

  if (interview.status !== "in_progress") {
    redirect(`/interview/${interview.id}/report`);
  }

  const current =
    interview.turns.find((t) => !t.answerText) ?? interview.turns.at(-1);
  const answered = interview.turns.filter((t) => t.answerText).length;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-zinc-500">
          {interview.role.title} · {interview.durationMin} min ·{" "}
          {MIX_PRESET_LABELS[interview.mixPreset]}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Mock interview</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Question {Math.min(answered + 1, interview.questionCount)} of{" "}
          {interview.questionCount}
        </p>
      </div>

      {current ? (
        <section className="flex flex-col gap-4">
          <div className="border border-zinc-200 p-5 dark:border-zinc-800">
            <h2 className="text-sm font-medium text-zinc-500">Question</h2>
            <p className="mt-2 text-lg leading-8">{current.questionText}</p>
          </div>

          {!current.answerText ? (
            <ActionForm action={submitAnswer} className="flex flex-col gap-4">
              <input type="hidden" name="interviewId" value={interview.id} />
              <input type="hidden" name="turnId" value={current.id} />
              <label htmlFor="answerText" className="text-sm font-medium">
                Your answer
              </label>
              <textarea
                id="answerText"
                name="answerText"
                rows={10}
                required
                className="rounded-md border border-zinc-300 bg-white p-3 text-sm leading-6 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-950"
                placeholder="Write a structured answer…"
              />
              <button
                type="submit"
                className="inline-flex h-11 w-fit items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                Submit answer
              </button>
            </ActionForm>
          ) : null}
        </section>
      ) : null}

      <form action={endInterviewEarly.bind(null, interview.id)}>
        <button
          type="submit"
          className="text-sm text-zinc-500 underline-offset-4 hover:underline"
        >
          End interview early and generate report
        </button>
      </form>
    </main>
  );
}
