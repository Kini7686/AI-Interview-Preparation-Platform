import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: {},
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { auth, signOut } from "@/lib/auth";
import { requireSession, UnauthorizedError } from "@/lib/auth/session";
import { signOutAction } from "@/server/actions/auth";

describe("requireSession (FR-009)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the session user when authenticated", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "u1", email: "a@example.com", name: "Alex" },
      expires: new Date(Date.now() + 60_000).toISOString(),
    } as unknown as Awaited<ReturnType<typeof auth>>);

    await expect(requireSession()).resolves.toEqual({
      user: { id: "u1", email: "a@example.com", name: "Alex" },
    });
  });

  it("throws unauthorized when session is missing", async () => {
    vi.mocked(auth).mockResolvedValue(
      null as unknown as Awaited<ReturnType<typeof auth>>,
    );
    await expect(requireSession()).rejects.toBeInstanceOf(UnauthorizedError);
  });
});

describe("signOutAction (FR-003)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ends the current session and redirects home", async () => {
    vi.mocked(signOut).mockResolvedValue(undefined as never);
    await expect(signOutAction()).rejects.toThrow("REDIRECT:/");
    expect(signOut).toHaveBeenCalledWith({ redirect: false });
  });
});
