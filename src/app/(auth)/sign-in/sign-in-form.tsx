"use client";

import { useActionState } from "react";
import {
  requestMagicLink,
  signInWithGoogle,
  type MagicLinkResult,
} from "@/server/actions/auth";

type SignInFormProps = {
  callbackUrl: string;
  errorMessage?: string | null;
};

export function SignInForm({ callbackUrl, errorMessage }: SignInFormProps) {
  const [state, formAction, pending] = useActionState<
    MagicLinkResult | null,
    FormData
  >(requestMagicLink, null);

  const fieldError =
    state && !state.ok && state.field === "email" ? state.message : null;
  const formError =
    state && !state.ok && !state.field
      ? state.message
      : (errorMessage ?? null);
  const sent = state?.ok === true;

  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Sign in
        </h1>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Use Google or a passwordless email link to continue.
        </p>
      </div>

      {formError && (
        <div
          role="alert"
          id="auth-error"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {formError}
        </div>
      )}

      {sent && (
        <div
          role="status"
          className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
        >
          Check your email for a sign-in link. It may take a minute to arrive.
        </div>
      )}

      <form action={signInWithGoogle}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Continue with Google
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-[var(--background)] px-2 text-zinc-500">or</span>
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-4" noValidate>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={
              fieldError ? "email-error" : formError ? "auth-error" : undefined
            }
            className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            placeholder="you@example.com"
          />
          {fieldError && (
            <p
              id="email-error"
              role="alert"
              className="text-sm text-red-700 dark:text-red-300"
            >
              {fieldError}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 w-full items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-900 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-900 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          {pending ? "Sending link…" : "Email me a sign-in link"}
        </button>
      </form>
    </div>
  );
}
