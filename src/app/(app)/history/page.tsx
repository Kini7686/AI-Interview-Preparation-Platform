import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=%2Fhistory");

  const interviews = await prisma.interview.findMany({
    where: { userId: session.user.id },
    orderBy: { startedAt: "desc" },
    include: { role: true, report: true },
  });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      <PageHeader
        eyebrow="Your activity"
        title="History"
        description="Every mock interview on your account, newest first."
        actions={
          <Link href="/interview" className="btn btn-primary">
            New interview
          </Link>
        }
      />

      {interviews.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="Completed and in-progress interviews will show up here with their scores."
          actionHref="/interview"
          actionLabel="Start an interview"
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {interviews.map((item) => {
            const href =
              item.status === "in_progress"
                ? `/interview/${item.id}`
                : `/interview/${item.id}/report`;
            const avg = item.report
              ? (
                  (item.report.clarity +
                    item.report.structure +
                    item.report.technicalDepth +
                    item.report.relevance) /
                  4
                ).toFixed(1)
              : null;
            return (
              <li
                key={item.id}
                className="card card-hover flex flex-wrap items-center justify-between gap-4 px-5 py-4"
              >
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm font-semibold">{item.role.title}</p>
                  <p className="hint">
                    {item.startedAt.toLocaleString()} · {item.questionCount} questions
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={item.status} />
                  <span className="badge badge-neutral">
                    {avg ? `avg ${avg}/5` : "no score"}
                  </span>
                  <Link href={href} className="btn btn-secondary btn-sm">
                    Open
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
