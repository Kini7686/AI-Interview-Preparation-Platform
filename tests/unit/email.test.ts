import { describe, expect, it } from "vitest";
import { normalizeEmail } from "@/lib/domain/email";

describe("normalizeEmail (FR-004)", () => {
  it("lowercases the address", () => {
    expect(normalizeEmail("Alex@Example.COM")).toBe("alex@example.com");
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeEmail("  user@example.com  ")).toBe("user@example.com");
  });

  it("is idempotent for already-normalized email", () => {
    expect(normalizeEmail("user@example.com")).toBe("user@example.com");
  });
});
