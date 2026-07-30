import Link from "next/link";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/server/actions/auth";
import { NavLinks } from "@/components/nav-links";

function initials(label: string): string {
  const parts = label.replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0] ?? "");
  return (letters.join("") || label[0] || "?").toUpperCase();
}

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const label =
    session?.user?.name?.trim() || session?.user?.email?.trim() || "Account";

  return (
    <div className="flex min-h-full flex-col">
      <header
        className="sticky top-0 z-20 border-b backdrop-blur"
        style={{
          borderColor: "var(--border)",
          background: "color-mix(in oklab, var(--surface) 82%, transparent)",
        }}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div className="flex flex-wrap items-center gap-5">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm font-semibold tracking-tight"
            >
              <span
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold"
                style={{ background: "var(--brand)", color: "var(--brand-contrast)" }}
              >
                AI
              </span>
              Interview Platform
            </Link>
            <NavLinks />
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 sm:flex">
              <span className="avatar" aria-hidden="true">
                {initials(label)}
              </span>
              <span className="text-sm font-medium">{label}</span>
            </span>
            <form action={signOutAction}>
              <button type="submit" className="btn btn-secondary btn-sm">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col">{children}</div>

      <footer
        className="border-t px-6 py-6"
        style={{ borderColor: "var(--border)" }}
      >
        <p className="mx-auto w-full max-w-6xl text-xs muted">
          AI Interview Platform — structured practice, measurable feedback.
        </p>
      </footer>
    </div>
  );
}
