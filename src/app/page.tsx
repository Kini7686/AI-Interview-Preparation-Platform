import Link from "next/link";

const STEPS = [
  {
    title: "Ground it in your resume",
    body: "Add a resume summary so questions reference your real projects, not generic prompts.",
  },
  {
    title: "Practice by target role",
    body: "Pick a role, duration, question count, and behavioral-to-technical mix before you start.",
  },
  {
    title: "Get a scored report",
    body: "Every session ends with clarity, structure, technical depth, and relevance scores.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-5xl flex-col items-start gap-8 px-6 pt-24 pb-16">
        <span className="badge badge-brand">Interview preparation</span>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Practice interviews that actually reflect{" "}
          <span style={{ color: "var(--brand)" }}>your experience</span>.
        </h1>
        <p className="max-w-2xl text-lg leading-8 muted">
          Run structured, text-based mock interviews grounded in your resume and
          target role — then track measurable feedback across sessions.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/sign-in" className="btn btn-primary">
            Get started
          </Link>
          <Link href="/sign-in" className="btn btn-secondary">
            Sign in
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-4 px-6 pb-24 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <article key={step.title} className="card card-hover flex flex-col gap-3 p-6">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
              style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
            >
              {index + 1}
            </span>
            <h2 className="text-base font-semibold">{step.title}</h2>
            <p className="text-sm leading-6 muted">{step.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
