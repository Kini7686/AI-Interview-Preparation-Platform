import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 75% 35%, color-mix(in oklab, var(--brand) 22%, transparent), transparent 60%), radial-gradient(ellipse 45% 40% at 15% 80%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 55%), linear-gradient(160deg, var(--background) 0%, var(--background-deep) 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-[12%] right-[-8%] hidden w-[52%] lg:block"
        >
          <div className="hero-visual h-full min-h-0 animate-fade">
            <div className="hero-sheet">
              <p className="eyebrow mb-3">Live session</p>
              <p className="font-display text-2xl leading-snug tracking-tight">
                Tell me about a project where you owned the outcome end to end.
              </p>
              <div className="mt-5 space-y-2">
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    width: "92%",
                    background:
                      "color-mix(in oklab, var(--brand) 22%, var(--border))",
                  }}
                />
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    width: "78%",
                    background:
                      "color-mix(in oklab, var(--brand) 14%, var(--border))",
                  }}
                />
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    width: "64%",
                    background:
                      "color-mix(in oklab, var(--accent) 18%, var(--border))",
                  }}
                />
              </div>
              <div className="mt-6 flex items-center justify-between gap-3">
                <span className="hint">Question 2 of 5</span>
                <span className="hint">Clarity · Structure · Depth</span>
              </div>
            </div>
          </div>
        </div>

        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 animate-fade">
          <p className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
            <span className="brand-mark" aria-hidden="true">
              A
            </span>
            <span className="sr-only">AI Interview Platform</span>
          </p>
          <Link href="/sign-in" className="btn btn-secondary btn-sm">
            Sign in
          </Link>
        </header>

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pb-20 pt-8 lg:pb-28">
          <div className="max-w-xl">
            <p className="font-display animate-rise text-[2.75rem] leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.25rem]">
              AI Interview Platform
            </p>
            <h1 className="animate-rise-delay-1 mt-5 text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
              Practice interviews grounded in your resume.
            </h1>
            <p className="animate-rise-delay-2 mt-4 max-w-md text-base leading-7 muted sm:text-[1.05rem] sm:leading-8">
              Configure a mock session, answer in writing, and leave with a scored
              report you can improve on.
            </p>
            <div className="animate-rise-delay-3 mt-8 flex flex-wrap gap-3">
              <Link href="/sign-in" className="btn btn-primary">
                Start practicing
              </Link>
            </div>
          </div>

          <div
            className="hero-visual mt-12 min-h-[16rem] animate-rise-delay-2 lg:hidden"
            aria-hidden="true"
          >
            <div className="hero-sheet">
              <p className="eyebrow mb-3">Live session</p>
              <p className="font-display text-xl leading-snug tracking-tight">
                Tell me about a project where you owned the outcome end to end.
              </p>
              <div className="mt-4 space-y-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: "90%",
                    background:
                      "color-mix(in oklab, var(--brand) 22%, var(--border))",
                  }}
                />
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: "70%",
                    background:
                      "color-mix(in oklab, var(--brand) 14%, var(--border))",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-t px-6 py-16"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="mx-auto grid w-full max-w-6xl gap-10 sm:grid-cols-3 sm:gap-8">
          {[
            {
              title: "Ground it in your resume",
              body: "Questions reference your projects and skills, not generic prompts.",
            },
            {
              title: "Practice by target role",
              body: "Set duration, question count, and the behavioral-to-technical mix.",
            },
            {
              title: "Get a scored report",
              body: "Leave each session with clarity, structure, depth, and relevance scores.",
            },
          ].map((step, index) => (
            <article key={step.title} className="flex flex-col gap-3">
              <p
                className="font-display text-3xl"
                style={{ color: "var(--brand)" }}
              >
                0{index + 1}
              </p>
              <h2 className="text-base font-semibold tracking-tight">
                {step.title}
              </h2>
              <p className="text-sm leading-6 muted">{step.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
