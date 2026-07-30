"use client";

import { useActionState } from "react";

type Result = { ok: true; message?: string } | { ok: false; message: string };

export function ActionForm({
  action,
  children,
  className,
}: {
  action: (prev: Result | null, formData: FormData) => Promise<Result | void>;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(
    async (prev: Result | null, formData: FormData) => {
      const result = await action(prev, formData);
      return result ?? prev;
    },
    null,
  );

  return (
    <form action={formAction} className={className}>
      {state?.ok === false && (
        <p role="alert" className="alert alert-error">
          {state.message}
        </p>
      )}
      {state?.ok === true && state.message && (
        <p role="status" className="alert alert-success">
          {state.message}
        </p>
      )}
      <fieldset
        disabled={pending}
        className="contents"
        aria-busy={pending || undefined}
      >
        {children}
      </fieldset>
    </form>
  );
}
