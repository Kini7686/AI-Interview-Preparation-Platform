import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { assertOwned } from "@/lib/auth/ownership";

type PageProps = { params: Promise<{ id: string }> };

export default async function InterviewReportPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const { id } = await params;
  const interview = await prisma.interview.findUnique({
    where: { id },
    include: {
      role: true,
      report: true,
      turns: { orderBy: { turnIndex: "asc" } },
    },
  });
  if (!interview) notFound();
  try {
    assertOwned(interview.userId, session.user.id);
  } catch {
    notFound();
  }

  if (interview.status === "in_progress") {
    redirect(`/interview/${interview.id}`);
  }

  const report = interview.report;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-zinc-500">{interview.role.title}</p>
        <h1 className="text-3xl font-semibold tracking-tight">Interview report</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Status: {interview.status.replaceAll("_", " ")}
        </p>
      </div>

      {!report ? (
        <p role="alert" className="text-sm text-amber-700 dark:text-amber-300">
          Report is not available yet
          {interview.status === "report_failed"
            ? " (generation failed). Try another interview."
            : "."}
        </p>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Score label="Clarity" value={report.clarity} />
            <Score label="Structure" value={report.structure} />
            <Score label="Technical" value={report.technicalDepth} />
            <Score label="Relevance" value={report.relevance} />
          </section>
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Summary</h2>
            <p className="text-sm leading-7 text-zinc-700 dark:text-zinc-300">
              {report.overallSummary}
            </p>
          </section>
          <section className="grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="text-lg font-semibold">Strengths</h2>
              <p className="mt-2 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
                {report.strengths}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Improvements</h2>
              <p className="mt-2 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
                {report.improvements}
              </p>
            </div>
          </section>
        </>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Transcript</h2>
        <ul className="flex flex-col gap-4">
          {interview.turns.map((turn) => (
            <li
              key={turn.id}
              className="border border-zinc-200 p-4 text-sm dark:border-zinc-800"
            >
              <p className="font-medium">Q{turn.turnIndex + 1}. {turn.questionText}</p>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                {turn.answerText ?? "(no answer)"}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex gap-4 text-sm">
        <Link href="/history" className="underline-offset-4 hover:underline">
          History
        </Link>
        <Link href="/interview" className="underline-offset-4 hover:underline">
          New interview
        </Link>
      </div>
    </main>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-zinc-200 p-4 text-center dark:border-zinc-800">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}/5</p>
    </div>
  );
}
