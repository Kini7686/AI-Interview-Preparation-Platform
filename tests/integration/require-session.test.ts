import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: {},
}));

import { auth } from "@/lib/auth";
import { ownershipProbe } from "@/server/actions/ownership-probe";

type AuthSession = Awaited<ReturnType<typeof auth>>;

describe("ownershipProbe integration (FR-009)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated callers", async () => {
    vi.mocked(auth).mockResolvedValue(null as unknown as AuthSession);
    await expect(ownershipProbe("any-owner")).resolves.toEqual({
      ok: false,
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  });

  it("allows owner and rejects non-owner as not-found", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "owner-1", email: "o@example.com", name: null },
      expires: new Date(Date.now() + 60_000).toISOString(),
    } as unknown as AuthSession);

    await expect(ownershipProbe("owner-1", "r1")).resolves.toEqual({
      ok: true,
      resourceId: "r1",
    });

    await expect(ownershipProbe("other", "r1")).resolves.toEqual({
      ok: false,
      code: "NOT_FOUND",
      message: "Not found",
    });
  });
});
