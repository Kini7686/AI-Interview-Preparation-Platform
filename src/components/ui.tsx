import Link from "next/link";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-2">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-[0.9375rem] leading-7 muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex gap-3">{actions}</div> : null}
    </header>
  );
}

export function Section({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description ? <p className="hint">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <p className="text-base font-semibold">{title}</p>
      <p className="max-w-sm text-sm leading-6 muted">{description}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn btn-primary btn-sm mt-2">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  in_progress: "badge-brand",
  completed: "badge-success",
  ended_early: "badge-neutral",
  completed_pending_report: "badge-warning",
  report_failed: "badge-warning",
  abandoned: "badge-neutral",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${STATUS_STYLES[status] ?? "badge-neutral"}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="label">
          {label}
        </label>
        {hint ? <span className="hint">{hint}</span> : null}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-sm" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
