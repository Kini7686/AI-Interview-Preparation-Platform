import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";

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
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">History</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Past mock interviews and reports for your account.
        </p>
      </div>

      {interviews.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No interviews yet.{" "}
          <Link href="/interview" className="underline underline-offset-4">
            Start one
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
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
              : "—";
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm"
              >
                <div>
                  <p className="font-medium">{item.role.title}</p>
                  <p className="text-zinc-500">
                    {item.startedAt.toLocaleString()} ·{" "}
                    {item.status.replaceAll("_", " ")} · avg {avg}
                  </p>
                </div>
                <Link href={href} className="underline-offset-4 hover:underline">
                  Open
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
