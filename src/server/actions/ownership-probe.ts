"use server";

import {
  assertOwned,
  NotFoundError,
  requireSession,
  UnauthorizedError,
} from "@/lib/auth/session";

export type OwnershipProbeResult =
  | { ok: true; resourceId: string }
  | {
      ok: false;
      code: "UNAUTHORIZED" | "NOT_FOUND";
      message: string;
    };

/**
 * Demo Server Action for ownership tests (FR-009–FR-011).
 * Simulates loading a private resource by owner id — no UI surface.
 */
export async function ownershipProbe(
  resourceOwnerId: string,
  resourceId = "probe-1",
): Promise<OwnershipProbeResult> {
  try {
    const { user } = await requireSession();
    assertOwned(resourceOwnerId, user.id);
    return { ok: true, resourceId };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { ok: false, code: "UNAUTHORIZED", message: error.message };
    }
    if (error instanceof NotFoundError) {
      return { ok: false, code: "NOT_FOUND", message: error.message };
    }
    return { ok: false, code: "NOT_FOUND", message: "Not found" };
  }
}
