"use client";

import { useActionState } from "react";

type Result = { ok: true; message?: string } | { ok: false; message: string };

export function ActionForm({
  action,
  children,
  className,
}: {
  action: (
    prev: Result | null,
    formData: FormData,
  ) => Promise<Result | void>;
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
        <p role="alert" className="mb-3 text-sm text-red-700 dark:text-red-300">
          {state.message}
        </p>
      )}
      {state?.ok === true && state.message && (
        <p role="status" className="mb-3 text-sm text-emerald-700 dark:text-emerald-300">
          {state.message}
        </p>
      )}
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
    </form>
  );
}
