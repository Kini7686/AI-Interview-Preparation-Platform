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
    state && !state.ok && !state.field ? state.message : (errorMessage ?? null);
  const sent = state?.ok === true;

  return (
    <div className="card flex w-full max-w-md flex-col gap-6 p-8">
      <div className="flex flex-col gap-2">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold"
          style={{ background: "var(--brand)", color: "var(--brand-contrast)" }}
        >
          AI
        </span>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm leading-6 muted">
          Continue with Google or get a passwordless link by email.
        </p>
      </div>

      {formError && (
        <div role="alert" id="auth-error" className="alert alert-error">
          {formError}
        </div>
      )}

      {sent && (
        <div role="status" className="alert alert-success">
          Check your email for a sign-in link. It may take a minute to arrive.
        </div>
      )}

      <form action={signInWithGoogle}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <button type="submit" className="btn btn-primary w-full">
          <GoogleMark />
          Continue with Google
        </button>
      </form>

      <div className="relative flex items-center gap-3">
        <span className="divider flex-1" aria-hidden="true" />
        <span className="text-xs font-medium uppercase tracking-wider muted">
          or
        </span>
        <span className="divider flex-1" aria-hidden="true" />
      </div>

      <form action={formAction} className="flex flex-col gap-4" noValidate>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="label">
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
            className="input"
            placeholder="you@example.com"
          />
          {fieldError && (
            <p
              id="email-error"
              role="alert"
              className="text-sm"
              style={{ color: "var(--danger)" }}
            >
              {fieldError}
            </p>
          )}
        </div>
        <button type="submit" disabled={pending} className="btn btn-secondary w-full">
          {pending ? "Sending link…" : "Email me a sign-in link"}
        </button>
      </form>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.6 5.1C9.6 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C39.9 36.3 44 31 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
