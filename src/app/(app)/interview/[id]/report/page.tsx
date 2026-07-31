import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { assertOwned } from "@/lib/auth/ownership";
import { Section, StatusBadge } from "@/components/ui";

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
  const average = report
    ? (report.clarity +
        report.structure +
        report.technicalDepth +
        report.relevance) /
      4
    : null;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-12 animate-rise">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge badge-brand">{interview.role.title}</span>
          <StatusBadge status={interview.status} />
        </div>
        <h1 className="page-title text-3xl sm:text-[2.5rem]">
          Interview report
        </h1>
        {average !== null ? (
          <p className="text-[0.9375rem] leading-7 muted">
            Overall score{" "}
            <span className="font-semibold" style={{ color: "var(--foreground)" }}>
              {average.toFixed(1)} / 5
            </span>{" "}
            across four rubric dimensions.
          </p>
        ) : null}
      </header>

      {!report ? (
        <p role="alert" className="alert alert-warning">
          Report is not available yet
          {interview.status === "report_failed"
            ? " (generation failed). Try another interview."
            : "."}
        </p>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Score label="Clarity" value={report.clarity} />
            <Score label="Structure" value={report.structure} />
            <Score label="Technical" value={report.technicalDepth} />
            <Score label="Relevance" value={report.relevance} />
          </section>

          <Section title="Summary">
            <p className="card p-6 text-[0.9375rem] leading-7">
              {report.overallSummary}
            </p>
          </Section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="card flex flex-col gap-2 p-6">
              <h2 className="text-base font-semibold" style={{ color: "var(--success)" }}>
                Strengths
              </h2>
              <p className="text-sm leading-7">{report.strengths}</p>
            </div>
            <div className="card flex flex-col gap-2 p-6">
              <h2 className="text-base font-semibold" style={{ color: "var(--warning)" }}>
                Improvements
              </h2>
              <p className="text-sm leading-7">{report.improvements}</p>
            </div>
          </section>
        </>
      )}

      <Section title="Transcript" description="Every question and your answer.">
        <ul className="flex flex-col gap-3">
          {interview.turns.map((turn) => (
            <li key={turn.id} className="card flex flex-col gap-3 p-5">
              <p className="text-sm font-semibold leading-6">
                <span className="eyebrow mr-2">Q{turn.turnIndex + 1}</span>
                {turn.questionText}
              </p>
              <p className="panel p-4 text-sm leading-7 whitespace-pre-wrap">
                {turn.answerText ?? "No answer submitted."}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <div className="flex flex-wrap gap-3">
        <Link href="/interview" className="btn btn-primary">
          New interview
        </Link>
        <Link href="/history" className="btn btn-secondary">
          Back to history
        </Link>
      </div>
    </main>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="card flex flex-col items-center gap-2 p-5 text-center">
      <p className="eyebrow">{label}</p>
      <p className="text-3xl font-semibold" style={{ color: "var(--brand)" }}>
        {value}
        <span className="text-base font-medium muted">/5</span>
      </p>
      <div
        className="progress w-full"
        role="img"
        aria-label={`${label} score ${value} out of 5`}
      >
        <span style={{ width: `${(value / 5) * 100}%` }} />
      </div>
    </div>
  );
}
