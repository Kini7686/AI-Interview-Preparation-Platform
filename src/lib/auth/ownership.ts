export class UnauthorizedError extends Error {
  readonly status = 401 as const;
  readonly code = "UNAUTHORIZED" as const;

  constructor(message = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends Error {
  readonly status = 404 as const;
  readonly code = "NOT_FOUND" as const;

  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
};

/**
 * Enforce resource ownership (FR-010, FR-011).
 * Mismatch → not-found semantics (never 403 “exists but forbidden”).
 *
 * Future Resume/Interview queries: filter by `userId` and call this (or
 * equivalent) so cross-user access returns not-found (AD-2).
 */
export function assertOwned(resourceUserId: string, sessionUserId: string): void {
  if (resourceUserId !== sessionUserId) {
    throw new NotFoundError();
  }
}
