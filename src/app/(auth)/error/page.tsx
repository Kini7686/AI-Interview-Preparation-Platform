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
      <div className="card flex w-full max-w-md flex-col gap-5 p-8">
        <h1 className="page-title text-3xl">Sign-in problem</h1>
        <div role="alert" id="auth-error" className="alert alert-error">
          {message}
        </div>
        <p className="text-sm leading-6 muted">
          You can request a new sign-in link or try Google again.
        </p>
        <Link href="/sign-in" className="btn btn-primary w-full">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
