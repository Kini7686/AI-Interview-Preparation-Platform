import { auth } from "@/lib/auth";
import {
  assertOwned,
  NotFoundError,
  UnauthorizedError,
  type SessionUser,
} from "@/lib/auth/ownership";

export {
  assertOwned,
  NotFoundError,
  UnauthorizedError,
  type SessionUser,
};

/**
 * Require an authenticated session with `user.id` (FR-009).
 * Layouts should redirect; Server Actions / handlers should map to HTTP 401.
 *
 * Future Resume/Interview queries: always combine with `assertOwned` (or
 * `userId` filters) so cross-user access returns not-found (AD-2).
 */
export async function requireSession(): Promise<{ user: SessionUser }> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) {
    throw new UnauthorizedError();
  }
  return {
    user: {
      id,
      email: session.user?.email ?? null,
      name: session.user?.name ?? null,
    },
  };
}
