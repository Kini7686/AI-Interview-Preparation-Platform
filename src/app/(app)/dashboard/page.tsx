import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { MIN_RESUME_SUMMARY_CHARS } from "@/lib/domain/interview";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=%2Fdashboard");
  }

  const userId = session.user.id;
  const [user, resume, recent] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { defaultRole: true },
    }),
    prisma.resume.findUnique({ where: { userId } }),
    prisma.interview.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      take: 3,
      include: { role: true },
    }),
  ]);

  const identity =
    user?.name?.trim() || session.user.email?.trim() || "Signed-in user";
  const resumeReady =
    (resume?.summary.trim().length ?? 0) >= MIN_RESUME_SUMMARY_CHARS;
  const profileReady = Boolean(user?.name?.trim() && user?.defaultRoleId);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Signed in as <span className="font-medium text-zinc-900 dark:text-zinc-100">{identity}</span>
          {user?.defaultRole ? (
            <> · default role {user.defaultRole.title}</>
          ) : null}
          .
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatusCard
          title="Profile"
          ready={profileReady}
          href="/profile"
          cta={profileReady ? "Edit profile" : "Complete profile"}
          detail={
            profileReady
              ? "Name and default role set."
              : "Add your display name and target role."
          }
        />
        <StatusCard
          title="Resume"
          ready={resumeReady}
          href="/resume"
          cta={resumeReady ? "Update resume" : "Add resume summary"}
          detail={
            resumeReady
              ? "Summary ready for interview grounding."
              : `Need at least ${MIN_RESUME_SUMMARY_CHARS} characters.`
          }
        />
        <StatusCard
          title="Interview"
          ready={profileReady && resumeReady}
          href="/interview"
          cta="Start practice"
          detail="Configure duration, questions, and mix."
        />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Recent interviews</h2>
          <Link href="/history" className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400">
            View history
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-zinc-500">No interviews yet. Start your first mock when profile and resume are ready.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {recent.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{item.role.title}</p>
                  <p className="text-zinc-500">
                    {item.status.replaceAll("_", " ")} · {item.startedAt.toLocaleString()}
                  </p>
                </div>
                <Link
                  href={
                    item.status === "in_progress"
                      ? `/interview/${item.id}`
                      : `/interview/${item.id}/report`
                  }
                  className="underline-offset-4 hover:underline"
                >
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function StatusCard({
  title,
  ready,
  href,
  cta,
  detail,
}: {
  title: string;
  ready: boolean;
  href: string;
  cta: string;
  detail: string;
}) {
  return (
    <div className="flex flex-col gap-3 border border-zinc-200 p-5 dark:border-zinc-800">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">{title}</h2>
        <span
          className={
            ready
              ? "text-xs font-medium text-emerald-700 dark:text-emerald-300"
              : "text-xs font-medium text-amber-700 dark:text-amber-300"
          }
        >
          {ready ? "Ready" : "Needed"}
        </span>
      </div>
      <p className="flex-1 text-sm text-zinc-600 dark:text-zinc-400">{detail}</p>
      <Link
        href={href}
        className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-3 text-sm font-medium text-white outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-900 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {cta}
      </Link>
    </div>
  );
}
