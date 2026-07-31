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
  const position = Math.min(answered + 1, interview.questionCount);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12 animate-rise">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge badge-brand">{interview.role.title}</span>
          <span className="badge badge-neutral">{interview.durationMin} min</span>
          <span className="badge badge-neutral">
            {MIX_PRESET_LABELS[interview.mixPreset]}
          </span>
        </div>
        <h1 className="page-title text-3xl sm:text-[2.5rem]">Mock interview</h1>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <p className="hint">
              Question {position} of {interview.questionCount}
            </p>
            <p className="hint">{answered} answered</p>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={interview.questionCount}
            aria-valuenow={answered}
            aria-label="Interview progress"
          >
            <span style={{ width: `${(answered / interview.questionCount) * 100}%` }} />
          </div>
        </div>
      </header>

      {current ? (
        <section className="flex flex-col gap-5">
          <div className="card flex flex-col gap-2 p-6">
            <p className="eyebrow">Question {position}</p>
            <p className="text-lg leading-8">{current.questionText}</p>
          </div>

          {!current.answerText ? (
            <ActionForm
              action={submitAnswer}
              className="card flex flex-col gap-4 p-6"
            >
              <input type="hidden" name="interviewId" value={interview.id} />
              <input type="hidden" name="turnId" value={current.id} />
              <label htmlFor="answerText" className="label">
                Your answer
              </label>
              <textarea
                id="answerText"
                name="answerText"
                rows={10}
                required
                className="textarea"
                placeholder="Structure it: situation, what you did, the outcome, and what you learned…"
              />
              <button type="submit" className="btn btn-primary w-fit">
                Submit answer
              </button>
            </ActionForm>
          ) : null}
        </section>
      ) : null}

      <form
        action={endInterviewEarly.bind(null, interview.id)}
        className="flex justify-center"
      >
        <button type="submit" className="btn btn-ghost">
          End interview early and generate report
        </button>
      </form>
    </main>
  );
}
