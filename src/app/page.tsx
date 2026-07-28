import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="flex w-full max-w-xl flex-col items-start gap-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          AI Interview Platform
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Practice interviews with structured feedback.
        </h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Sign in to reach your private dashboard. Public pages stay open without
          an account.
        </p>
        <Link
          href="/sign-in"
          className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-900 px-5 text-sm font-medium text-white outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-900 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
