import { describe, expect, it } from "vitest";
import { assertOwned, NotFoundError } from "@/lib/auth/ownership";

describe("assertOwned (FR-010, FR-011)", () => {
  it("passes when resource owner matches session user", () => {
    expect(() => assertOwned("user-a", "user-a")).not.toThrow();
  });

  it("throws not-found on mismatch (never cross-user leak)", () => {
    expect(() => assertOwned("user-a", "user-b")).toThrow(NotFoundError);
  });
});
