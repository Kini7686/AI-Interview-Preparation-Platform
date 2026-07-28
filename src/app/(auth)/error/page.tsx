import Link from "next/link";
import { mapAuthError } from "@/lib/auth/errors";

type ErrorPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AuthErrorPage({ searchParams }: ErrorPageProps) {
  const params = await searchParams;
  const message = mapAuthError(params.error);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-md flex-col gap-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Sign-in problem
        </h1>
        <div
          role="alert"
          id="auth-error"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {message}
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          You can request a new sign-in link or try Google again.
        </p>
        <Link
          href="/sign-in"
          className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-900 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
