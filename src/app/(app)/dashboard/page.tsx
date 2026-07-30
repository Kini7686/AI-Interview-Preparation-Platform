import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { MIN_RESUME_SUMMARY_CHARS } from "@/lib/domain/interview";
import { redirect } from "next/navigation";
import { EmptyState, PageHeader, Section, StatusBadge } from "@/components/ui";

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
  const readySteps = [profileReady, resumeReady].filter(Boolean).length;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-12">
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${identity.split(" ")[0]}`}
        description={
          user?.defaultRole
            ? `Your default target role is ${user.defaultRole.title}. Everything below reflects your current readiness.`
            : "Set up your profile and resume to unlock resume-grounded mock interviews."
        }
        actions={
          <Link
            href="/interview"
            className="btn btn-primary"
            aria-disabled={!(profileReady && resumeReady) || undefined}
          >
            Start interview
          </Link>
        }
      />

      <div className="card flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold">Setup progress</p>
          <p className="hint">{readySteps} of 2 complete</p>
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={2}
          aria-valuenow={readySteps}
          aria-label="Setup progress"
        >
          <span style={{ width: `${(readySteps / 2) * 100}%` }} />
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatusCard
          title="Profile"
          ready={profileReady}
          href="/profile"
          cta={profileReady ? "Edit profile" : "Complete profile"}
          detail={
            profileReady
              ? "Name and default role are set."
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
              ? "Summary is ready for interview grounding."
              : `Needs at least ${MIN_RESUME_SUMMARY_CHARS} characters.`
          }
        />
        <StatusCard
          title="Interview"
          ready={profileReady && resumeReady}
          href="/interview"
          cta="Start practice"
          detail="Configure duration, question count, and mix."
        />
      </section>

      <Section
        title="Recent interviews"
        description="Your three most recent practice sessions."
        action={
          <Link href="/history" className="link text-sm">
            View all
          </Link>
        }
      >
        {recent.length === 0 ? (
          <EmptyState
            title="No interviews yet"
            description="Once your profile and resume are ready, start your first mock interview to see results here."
            actionHref="/interview"
            actionLabel="Start your first interview"
          />
        ) : (
          <ul className="card list">
            {recent.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold">{item.role.title}</p>
                  <p className="hint">{item.startedAt.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={item.status} />
                  <Link
                    href={
                      item.status === "in_progress"
                        ? `/interview/${item.id}`
                        : `/interview/${item.id}/report`
                    }
                    className="btn btn-secondary btn-sm"
                  >
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
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
    <div className="card card-hover flex flex-col gap-3 p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{title}</h2>
        <span className={`badge ${ready ? "badge-success" : "badge-warning"}`}>
          {ready ? "Ready" : "Action needed"}
        </span>
      </div>
      <p className="flex-1 text-sm leading-6 muted">{detail}</p>
      <Link href={href} className="btn btn-secondary btn-sm w-fit">
        {cta}
      </Link>
    </div>
  );
}
